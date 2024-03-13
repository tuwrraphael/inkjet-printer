#include <zephyr/logging/log.h>
#include "pressure_control_algorithm.h"
#include "moving_average.h"

#define MIN_PRESSURE_CHANGE_PER_SECOND_AT_FULL_SPEED (0.1f)
#define MAX_TIME_LOW_PRESSURE_CHANGE_SECONDS (5.0f)
#define LOW_PRESSURE_CHANGE_CONDITION_EXIT_SECONDS (0.5f)

static float p = 0.15;
static float k_i = 0.5;
static float i = 0;
static float max_i = 1.0;
static float min_pwm = 0.3;

static float last_error_abs = 0.0f;
static float last_pwm = 0.0f;
static float time_with_low_pressure_change = 0;
static float time_without_low_pressure_change = 0;

static bool low_pressure_condition = false;
moving_average_t error_moving_average;

LOG_MODULE_REGISTER(pressure_control_alg, CONFIG_APP_LOG_LEVEL);

static void pressure_control_algorithm_target_pressure(const pressure_control_algorithm_params_t *params, pressure_control_algorithm_result_t *result)
{
    if (params->initial_run)
    {
        i = 0;
        time_with_low_pressure_change = 0;
        time_without_low_pressure_change = 0;
        low_pressure_condition = false;
        moving_average_init(&error_moving_average);
    }
    float error = params->init.target_pressure - params->current_pressure;
    float error_abs = error > 0 ? error : -error;

    if (error_abs < 0.5f)
    {
        result->done = true;
        error = 0;
        error_abs = 0;
    }
    i += error * params->elapsed_time_seconds;
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
        result->action = pwm > 0 ? MOTOR_ACTION_CCW : MOTOR_ACTION_CW;
        result->pwm = pwm_abs;
    }
    else
    {
        result->action = MOTOR_ACTION_STOP;
    }
    
    if (!params->initial_run && result->action != MOTOR_ACTION_STOP)
    {
        // Note, that the moving average size must fit to the control loop frequency, because short term the pressure does not change much if there
        // is a big volume
        moving_average_add(&error_moving_average, error_abs- last_error_abs);
        LOG_INF("Sum %f, %f, %f", error_moving_average.sum, error_moving_average.avg, error_abs);
        if (error_moving_average.avg >= 0 && !low_pressure_condition)
        {
            low_pressure_condition = true;
            time_with_low_pressure_change = 0;
            time_without_low_pressure_change = 0;
        }
        if (low_pressure_condition)
        {
            LOG_INF("Low pressure condition, %f, %f, %f", time_with_low_pressure_change, time_without_low_pressure_change, error_moving_average.avg);
            if (error_moving_average.avg < 0)
            {
                time_without_low_pressure_change += params->elapsed_time_seconds;
                if (time_without_low_pressure_change > LOW_PRESSURE_CHANGE_CONDITION_EXIT_SECONDS)
                {
                    low_pressure_condition = false;
                }
            }
            else
            {
                time_without_low_pressure_change = 0;
                time_with_low_pressure_change += params->elapsed_time_seconds;
                if (time_with_low_pressure_change > MAX_TIME_LOW_PRESSURE_CHANGE_SECONDS)
                {
                    result->failure_detected = true;
                }
            }
        }
    } else {
        low_pressure_condition = true;
        time_with_low_pressure_change = 0;
        time_without_low_pressure_change = 0;
    }
    last_error_abs = error_abs;
    last_pwm = result->pwm;
}

static float feed_time = 0;

static void pressure_control_algorithm_feed_with_limit(const pressure_control_algorithm_params_t *params, pressure_control_algorithm_result_t *result)
{
    if (feed_time >= params->init.feed_time)
    {
        result->done = true;
        return;
    }
    feed_time += params->elapsed_time_seconds;
    if (params->initial_run)
    {
        feed_time = 0;
    }
    if (params->init.direction == PRESSURE_DIRECTION_VACUUM)
    {
        if (params->current_pressure > params->init.limit_pressure)
        {
            result->action = MOTOR_ACTION_CW;
            result->pwm = params->init.feed_pwm;
        }
        else
        {
            result->action = MOTOR_ACTION_STOP;
        }
    }
    else
    {
        if (params->current_pressure < params->init.limit_pressure)
        {
            result->action = MOTOR_ACTION_CCW;
            result->pwm = params->init.feed_pwm;
        }
        else
        {
            result->action = MOTOR_ACTION_STOP;
        }
    }
}

void pressure_control_algorithm(const pressure_control_algorithm_params_t *params, pressure_control_algorithm_result_t *result)
{
    result->failure_detected = false;
    result->action = MOTOR_ACTION_STOP;
    result->pwm = 0.0f;
    result->done = false;
    switch (params->init.algorithm)
    {
    case PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE:
        pressure_control_algorithm_target_pressure(params, result);
        break;
    case PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT:
        pressure_control_algorithm_feed_with_limit(params, result);
        break;
    case PRESSURE_CONTROL_ALGORITHM_NONE:
        break;
    }
}