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

#define EVENT_ALGORITHM_DONE (1 << 0)
#define EVENT_CANCELED (1 << 1)

static float zero_pressure = 0;
static bool pressure_control_enabled = false;
static bool disable_pressure_control = true;
static uint64_t last_control_time = 0;
static int sensor_error_count = 0;

static const struct device *abp;
static const struct device *pump;
static pressure_control_error_callback_t error_callback;

static pressure_control_algorithm_params_t params;

static void motor_stop()
{
	motor_set_action(pump, MOTOR_ACTION_STOP, 0);
}

static void motor_set_action_safe(motor_action_t action, float pwm)
{
	if (action == MOTOR_ACTION_STOP)
	{
		motor_stop();
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
	pump = DEVICE_DT_GET(DT_NODELABEL(pump_motor));
	if (!device_is_ready(pump))
	{
		LOG_ERR("Pump not ready");
	}
	motor_stop();
	abp = DEVICE_DT_GET(DT_NODELABEL(abp));
	if (!device_is_ready(abp))
	{
		LOG_ERR("Pressure sensor not ready");
	}
	params.init.algorithm = PRESSURE_CONTROL_ALGORITHM_NONE;
	params.initial_run = true;
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
		motor_stop();
		last_control_time = 0;
		k_event_set(&pressure_control_event, EVENT_CANCELED);
		return;
	}
	if (sensorReadResult < 0)
	{
		motor_stop();
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

	pressure_control_algorithm_result_t result;
	pressure_control_algorithm(&params, &result);
	if (result.failure_detected)
	{
		motor_stop();
		LOG_ERR("Pressure control failure detected");
		error_callback();
		disable_pressure_control = true;
	}
	else
	{
		motor_set_action_safe(result.action, result.pwm);
	}
	params.initial_run = false;
}

int pressure_control_wait_for_done()
{
	int events = k_event_wait(&pressure_control_event, 0xFFFFFFFF, false, K_FOREVER);
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
	params.initial_run = true;
	last_control_time = 0;
	bool was_disabled = !pressure_control_enabled;
	disable_pressure_control = false;
	pressure_control_enabled = true;
	if (was_disabled)
	{
		k_timer_start(&control_pressure_timer, K_NO_WAIT, K_MSEC(CONTROL_MSEC));
		LOG_INF("Pressure control enabled");
	} else {
		LOG_INF("Pressure control reset");
	}
}

void pressure_control_update_parameters(pressure_control_algorithm_init_t *init) {
	k_event_clear(&pressure_control_event, EVENT_ALGORITHM_DONE);
	params.initial_run = params.initial_run || init->algorithm != params.init.algorithm;
	memcpy(&params.init, init, sizeof(pressure_control_algorithm_init_t));
}

void pressure_control_disable()
{
	disable_pressure_control = true;
	k_timer_start(&control_pressure_timer, K_NO_WAIT, K_MSEC(MEASURE_MSEC));
	// k_work_submit(&control_pressure);
	LOG_INF("Request to disable pressure control");
}

void pressure_control_get_info(pressure_control_info_t *info) {
	info->pressure = pressure_control_get_pressure();
	memcpy(&info->algorithm, &params.init, sizeof(pressure_control_algorithm_init_t));
	info->done = k_event_test(&pressure_control_event, EVENT_ALGORITHM_DONE);
	info->enabled = pressure_control_enabled;
}

void pressure_control_go_to_safe_state()
{
	motor_stop();
	pressure_control_disable();
}