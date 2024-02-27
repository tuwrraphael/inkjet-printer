#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/motor.h>

#include "failure_handling.h"
#include "pressure_control.h"

LOG_MODULE_REGISTER(pressure_control, CONFIG_APP_LOG_LEVEL);

#define CONTROL_MSEC (10)
#define CONTROL_TIMEOUT (1000)
#define CONTROL_CYCLES_TIMEOUT (CONTROL_TIMEOUT / CONTROL_MSEC)
#define MAX_SENSOR_ERROR_COUNT (10)

K_EVENT_DEFINE(pressure_reach_target_event);

#define EVENT_TARGET_REACHED (1 << 0)
#define EVENT_CANCELED (1 << 1)

static float p = 0.15;
static float k_i = 0.5;
static float i = 0;
static float max_i = 1.0;
static float min_pwm = 0.3;
static float target_pressure = 0;
static float zero_pressure = 0;
static bool pressure_control_enabled = false;
static bool disable_pressure_control = true;
static uint64_t last_control_time = 0;
static float last_error_abs = 0;
static int cycles_not_advanced = 0;
static int sensor_error_count = 0;

static const struct device *abp;
static const struct device *pump;
static pressure_control_error_callback_t error_callback;

static void motor_stop() {
	motor_set_action(pump, MOTOR_ACTION_STOP, 0);
}

static void motor_set_action_safe(motor_action_t action, float pwm)
{
	if (failure_handling_is_in_error_state())
	{
		return;
	}
	motor_set_action(pump, action, pwm);
}

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
	return 0;
}

static void control_pressure_handler(struct k_work *work);

K_WORK_DEFINE(control_pressure, control_pressure_handler);

static void control_pressure_timer_handler(struct k_timer *dummy)
{
	k_work_submit(&control_pressure);
}

K_TIMER_DEFINE(control_pressure_timer, control_pressure_timer_handler, NULL);

static void control_pressure_handler(struct k_work *work)
{
	if (!pressure_control_enabled || disable_pressure_control)
	{
		pressure_control_enabled = false;
		motor_stop();
		last_control_time = 0;
		k_event_set(&pressure_reach_target_event, EVENT_CANCELED);
		return;
	}
	if (sensor_sample_fetch(abp) < 0)
	{
		motor_stop();
		LOG_ERR("Sensor sample fetch failed");
		sensor_error_count++;
		if (sensor_error_count > MAX_SENSOR_ERROR_COUNT)
		{
			LOG_ERR("Sensor sample fetch failed");
			disable_pressure_control = true;
			error_callback();
		}
		return;
	}
	else
	{
		sensor_error_count = 0;
	}

	struct sensor_value pressure;
	sensor_channel_get(abp, SENSOR_CHAN_PRESS, &pressure);
	float pressure_kpa = pressure.val1 + (pressure.val2 / (1000.0 * 1000.0));
	float pressure_mbar = pressure_kpa * 10 - zero_pressure;
	float error = target_pressure - pressure_mbar;
	float error_abs = error > 0 ? error : -error;
	if (last_control_time == 0)
	{
		last_control_time = k_uptime_get_32();
		last_error_abs = error_abs;
		return;
	}

	uint64_t current_time = k_uptime_get_32();

	float elapsed_time = (current_time - last_control_time) / 1000.0;
	last_control_time = current_time;
	if (error_abs < 0.5f)
	{
		k_event_set(&pressure_reach_target_event, EVENT_TARGET_REACHED);
		error = 0;
	}
	else
	{
		if (error_abs > last_error_abs)
		{
			cycles_not_advanced++;
			if (cycles_not_advanced > CONTROL_CYCLES_TIMEOUT)
			{
				motor_stop();
				error_callback();
				disable_pressure_control = true;
				return;
			}
		}
		else
		{
			cycles_not_advanced = 0;
		}
	}
	last_error_abs = error_abs;
	i += error * elapsed_time;
	if (i > max_i)
	{
		i = max_i;
	}
	if (i < -max_i)
	{
		i = -max_i;
	}
	float pwm = p * error + k_i * i;

	float pwm_abs = pwm > 0 ? pwm : -pwm;
	if (pwm_abs > 1)
	{
		pwm_abs = 1;
	}

	if (pwm_abs > min_pwm)
	{
		motor_set_action_safe(pwm > 0 ? MOTOR_ACTION_CCW : MOTOR_ACTION_CW, pwm_abs);
	}
	else
	{
		motor_stop();
	}
}

void pressure_control_set_target_pressure(float pressure)
{
	if (pressure > 20 || pressure < -20)
	{
		LOG_ERR("Pressure control target out of range");
		return;
	}
	k_event_clear(&pressure_reach_target_event, EVENT_TARGET_REACHED);
	target_pressure = pressure;
}

int pressure_control_wait_for_target_pressure()
{
	int events = k_event_wait(&pressure_reach_target_event, 0xFFFFFFFF, false, K_FOREVER);
	if (events == EVENT_TARGET_REACHED)
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

double get_pressure(void)
{
	if (sensor_sample_fetch(abp) < 0)
	{
		LOG_ERR("Sensor sample fetch failed");
		return -1;
	}
	struct sensor_value pressure;
	sensor_channel_get(abp, SENSOR_CHAN_PRESS, &pressure);
	double pressure_kpa = pressure.val1 + (pressure.val2 / (1000.0 * 1000.0));
	double pressure_mbar = pressure_kpa * 10.0 - (double)zero_pressure;
	return pressure_mbar;
}

void pressure_control_enable(bool enable)
{
	pressure_control_enabled = enable;
	if (enable)
	{
		sensor_error_count = 0;
		cycles_not_advanced = 0;
		k_event_clear(&pressure_reach_target_event, 0xFFFFFFF);
		disable_pressure_control = false;
		pressure_control_enabled = true;
		last_control_time = 0;
		k_timer_start(&control_pressure_timer, K_MSEC(CONTROL_MSEC), K_MSEC(CONTROL_MSEC));
		LOG_INF("Pressure control enabled");
	}
	else
	{
		disable_pressure_control = true;
		k_timer_stop(&control_pressure_timer);
		k_work_submit(&control_pressure);
		LOG_INF("Request to disable pressure control");
	}
}

void pressure_control_go_to_safe_state() {
	motor_stop();
	pressure_control_enable(false);
}