#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/motor.h>

#include "failure_handling.h"
#include "pressure_control.h"
#include "pressure_control_algorithm.h"

LOG_MODULE_REGISTER(pressure_control, CONFIG_APP_LOG_LEVEL);

#define CONTROL_MSEC (100)
#define MEASURE_MSEC (1000)
#define CONTROL_TIMEOUT (2000)
#define CONTROL_CYCLES_TIMEOUT (CONTROL_TIMEOUT / CONTROL_MSEC)
#define MAX_SENSOR_ERROR_COUNT (10)

K_EVENT_DEFINE(pressure_control_event);
K_SEM_DEFINE(parameter_change, 0, 1);
K_SEM_DEFINE(initial_run, 0, 1);

#define EVENT_ALGORITHM_DONE (1 << 0)
#define EVENT_CANCELED (1 << 1)

static float zero_pressure = 0;
static bool pressure_control_enabled = false;
static bool disable_pressure_control = true;
static uint64_t last_control_time = 0;
static int sensor_error_count = 0;

static const struct device *abp;
static const struct device *ink_pump_device;
static const struct device *capping_pump_device;
static pressure_control_error_callback_t error_callback;

static pressure_control_algorithm_params_t params;

static void motor_stop(const struct device *pump)
{
	motor_set_action(pump, MOTOR_ACTION_STOP, 0);
}

static void motor_set_action_safe(const struct device *pump, motor_action_t action, float pwm)
{
	if (action == MOTOR_ACTION_STOP)
	{
		motor_stop(pump);
		return;
	}
	if (failure_handling_is_in_error_state())
	{
		return;
	}
	motor_set_action(pump, action, pwm);
}

static void control_pressure_handler(struct k_work *work);

K_WORK_DEFINE(control_pressure, control_pressure_handler);

static void control_pressure_timer_handler(struct k_timer *dummy)
{
	k_work_submit(&control_pressure);
}

K_TIMER_DEFINE(control_pressure_timer, control_pressure_timer_handler, NULL);

int pressure_control_initialize(pressure_control_init_t *init)
{
	if (init->error_callback == NULL)
	{
		LOG_ERR("Pressure control error callback not set");
		return -1;
	}
	error_callback = init->error_callback;
	ink_pump_device = DEVICE_DT_GET(DT_NODELABEL(ink_pump));
	if (!device_is_ready(ink_pump_device))
	{
		LOG_ERR("Ink pump not ready");
	}
	capping_pump_device = DEVICE_DT_GET(DT_NODELABEL(capping_pump));
	if (!device_is_ready(capping_pump_device))
	{
		LOG_ERR("Capping pump not ready");
	}
	motor_stop(ink_pump_device);
	motor_stop(capping_pump_device);
	abp = DEVICE_DT_GET(DT_NODELABEL(abp));
	if (!device_is_ready(abp))
	{
		LOG_ERR("Pressure sensor not ready");
	}
	for (int i = 0; i < NUM_PUMPS; i++)
	{
		params.algorithm[i].algorithm = PRESSURE_CONTROL_ALGORITHM_NONE;
	}
	k_timer_start(&control_pressure_timer, K_MSEC(MEASURE_MSEC), K_MSEC(MEASURE_MSEC));
	return 0;
}

static void control_pressure_handler(struct k_work *work)
{
	int sensorReadResult = sensor_sample_fetch(abp);
	if (!pressure_control_enabled)
	{
		return;
	}
	if (disable_pressure_control)
	{
		pressure_control_enabled = false;
		motor_stop(capping_pump_device);
		motor_stop(ink_pump_device);
		last_control_time = 0;
		k_event_set(&pressure_control_event, EVENT_CANCELED);
		return;
	}
	if (sensorReadResult < 0)
	{
		motor_stop(capping_pump_device);
		motor_stop(ink_pump_device);
		LOG_ERR("Sensor sample fetch failed");
		sensor_error_count++;
		if (sensor_error_count > MAX_SENSOR_ERROR_COUNT)
		{
			LOG_ERR("Pressure control sensor error count exceeded");
			disable_pressure_control = true;
			error_callback();
		}
		return;
	}
	else
	{
		sensor_error_count = 0;
	}

	if (last_control_time == 0)
	{
		last_control_time = k_uptime_get_32();
		return;
	}

	uint64_t current_time = k_uptime_get_32();

	params.elapsed_time_seconds = (current_time - last_control_time) / 1000.0;
	last_control_time = current_time;

	struct sensor_value pressure;
	sensor_channel_get(abp, SENSOR_CHAN_PRESS, &pressure);
	float pressure_kpa = pressure.val1 + (pressure.val2 / (1000.0 * 1000.0));
	params.current_pressure = pressure_kpa * 10 - zero_pressure;

	pressure_control_result_t result;
	params.initial_run = k_sem_take(&initial_run, K_NO_WAIT) == 0;
	params.parameter_change = k_sem_take(&parameter_change, K_NO_WAIT) == 0;
	pressure_control_algorithm(&params, &result);
	if (result.done)
	{
		k_event_set(&pressure_control_event, EVENT_ALGORITHM_DONE);
	}
	if (result.failure_detected)
	{
		motor_stop(capping_pump_device);
		motor_stop(ink_pump_device);
		LOG_ERR("Pressure control failure detected");
		error_callback();
		disable_pressure_control = true;
	}
	else
	{
		motor_set_action_safe(ink_pump_device, result.motor_result[PRESSURE_CONTROL_INK_PUMP_IDX].action, result.motor_result[PRESSURE_CONTROL_INK_PUMP_IDX].pwm);
		motor_set_action_safe(capping_pump_device, result.motor_result[PRESSURE_CONTROL_CAPPING_PUMP_IDX].action, result.motor_result[PRESSURE_CONTROL_CAPPING_PUMP_IDX].pwm);
	}
}

int pressure_control_wait_for_done(k_timeout_t timeout)
{
	int events = k_event_wait(&pressure_control_event, 0xFFFFFFFF, false, timeout);
	if (events == EVENT_ALGORITHM_DONE)
	{
		return 0;
	}
	return -1;
}

int calibrate_zero_pressure()
{
	if (pressure_control_enabled)
	{
		LOG_ERR("Zero pressure calibration failed: pressure control is enabled");
		return -1;
	}
	float sum = 0;
	for (int i = 0; i < 10; i++)
	{
		if (sensor_sample_fetch(abp) < 0)
		{
			LOG_ERR("Sensor sample fetch failed");
			return -1;
		}
		struct sensor_value pressure;
		sensor_channel_get(abp, SENSOR_CHAN_PRESS, &pressure);
		float pressure_kpa = pressure.val1 + (pressure.val2 / (1000.0 * 1000.0));
		float pressure_mbar = pressure_kpa * 10;
		if (pressure_mbar < -5 || pressure_mbar > 5)
		{
			LOG_ERR("Zero pressure calibration failed: pressure sensor reading is not near 0");
			return -1;
		}
		sum += pressure_mbar;
		k_sleep(K_MSEC(100));
	}
	zero_pressure = sum / 10;
	return 0;
}

double pressure_control_get_pressure(void)
{
	struct sensor_value pressure;
	sensor_channel_get(abp, SENSOR_CHAN_PRESS, &pressure);
	double pressure_kpa = pressure.val1 + (pressure.val2 / (1000.0 * 1000.0));
	double pressure_mbar = pressure_kpa * 10.0 - (double)zero_pressure;
	return pressure_mbar;
}

void pressure_control_enable()
{
	sensor_error_count = 0;
	k_event_clear(&pressure_control_event, 0xFFFFFFF);
	k_sem_give(&parameter_change);
	last_control_time = 0;
	bool was_disabled = !pressure_control_enabled;
	disable_pressure_control = false;
	pressure_control_enabled = true;
	if (was_disabled)
	{
		k_sem_give(&initial_run);
		k_timer_start(&control_pressure_timer, K_NO_WAIT, K_MSEC(CONTROL_MSEC));
		LOG_INF("Pressure control enabled");
	}
	else
	{
		LOG_INF("Pressure control reset");
	}
}

void pressure_control_update_parameters(int pump_idx, pressure_control_algorithm_init_t *init)
{
	k_event_clear(&pressure_control_event, EVENT_ALGORITHM_DONE);
	bool is_initial_run = false;
	if (init->algorithm != params.algorithm[pump_idx].algorithm)
	{
		is_initial_run = true;
	}
	if (is_initial_run)
	{
		k_sem_give(&initial_run);
	}
	k_sem_give(&parameter_change);
	memcpy(&params.algorithm[pump_idx], init, sizeof(pressure_control_algorithm_init_t));
}

void pressure_control_disable()
{
	disable_pressure_control = true;
	k_timer_start(&control_pressure_timer, K_NO_WAIT, K_MSEC(MEASURE_MSEC));
	// k_work_submit(&control_pressure);
	LOG_INF("Request to disable pressure control");
}

void pressure_control_get_info(pressure_control_info_t *info)
{
	info->pressure = pressure_control_get_pressure();
	memcpy(&info->algorithm, &params.algorithm, NUM_PUMPS * sizeof(pressure_control_algorithm_init_t));
	info->done = k_event_test(&pressure_control_event, EVENT_ALGORITHM_DONE);
	info->enabled = pressure_control_enabled;
}

void pressure_control_go_to_safe_state()
{
	motor_stop(capping_pump_device);
	motor_stop(ink_pump_device);
	pressure_control_disable();
}