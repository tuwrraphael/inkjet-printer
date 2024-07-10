#include <zephyr/logging/log.h>
#include "pressure_control_algorithm.h"
#include "moving_average.h"

#define MIN_PRESSURE_CHANGE_PER_SECOND_AT_FULL_SPEED (0.1f)
#define MAX_TIME_LOW_PRESSURE_CHANGE_SECONDS (5.0f)
#define LOW_PRESSURE_CHANGE_CONDITION_EXIT_SECONDS (0.5f)

static const float k_p = 0.15;
static const float k_i = 0.5;
static const float max_i = 1.0;
static const float min_pwm = 0.3;

typedef struct
{
    pressure_control_algorithm_motor_result_t motor_result;
    bool done;
    bool failure_detected;
} pressure_control_algorithm_result_t;

typedef struct
{
    float i;
    float last_error_abs;
    float last_pwm;
    float time_with_low_pressure_change;
    float time_without_low_pressure_change;
    bool low_pressure_condition;
    moving_average_t error_moving_average;
} target_pressure_state_t;

typedef struct 
{
    float feed_time;
} feed_with_limit_state_t;

static target_pressure_state_t target_pressure_state[NUM_PUMPS];
static feed_with_limit_state_t feed_with_limit_state[NUM_PUMPS];


LOG_MODULE_REGISTER(pressure_control_alg, CONFIG_APP_LOG_LEVEL);

static void pressure_control_algorithm_target_pressure(
    uint32_t pump_idx,
    const pressure_control_algorithm_params_t *params,
    pressure_control_algorithm_result_t *result)
{
    target_pressure_state_t *state = &target_pressure_state[pump_idx];
    if (params->initial_run)
    {
        state->i = 0;
        state->time_with_low_pressure_change = 0;
        state->time_without_low_pressure_change = 0;
        state->low_pressure_condition = false;
        moving_average_init(&state->error_moving_average);
    }
    float error = params->algorithm[pump_idx].target_pressure - params->current_pressure;
    float error_abs = error > 0 ? error : -error;

    if (error_abs < 0.5f)
    {
        result->done = true;
        error = 0;
        error_abs = 0;
    }
    state->i += error * params->elapsed_time_seconds;
    if (state->i > max_i)
    {
        state->i = max_i;
    }
    if (state->i < -max_i)
    {
        state->i = -max_i;
    }
    float pwm = k_p * error + k_i * state->i;

    float pwm_abs = pwm > 0 ? pwm : -pwm;
    if (pwm_abs > 1)
    {
        pwm_abs = 1;
    }

    if (pwm_abs > min_pwm)
    {
        result->motor_result.action = pwm > 0 ? MOTOR_ACTION_CCW : MOTOR_ACTION_CW;
        result->motor_result.pwm = pwm_abs;
    }
    else
    {
        result->motor_result.action = MOTOR_ACTION_STOP;
    }

    if (!params->initial_run && result->motor_result.action != MOTOR_ACTION_STOP)
    {
        // Note, that the moving average size must fit to the control loop frequency, because short term the pressure does not change much if there
        // is a big volume
        moving_average_add(&state->error_moving_average, error_abs - state->last_error_abs);
        LOG_INF("Sum %f, %f, %f", state->error_moving_average.sum, state->error_moving_average.avg, error_abs);
        if (state->error_moving_average.avg >= 0 && !state->low_pressure_condition)
        {
            state->low_pressure_condition = true;
            state->time_with_low_pressure_change = 0;
            state->time_without_low_pressure_change = 0;
        }
        if (state->low_pressure_condition)
        {
            LOG_INF("Low pressure condition, %f, %f, %f", state->time_with_low_pressure_change, state->time_without_low_pressure_change, state->error_moving_average.avg);
            if (state->error_moving_average.avg < 0)
            {
                state->time_without_low_pressure_change += params->elapsed_time_seconds;
                if (state->time_without_low_pressure_change > LOW_PRESSURE_CHANGE_CONDITION_EXIT_SECONDS)
                {
                    state->low_pressure_condition = false;
                }
            }
            else
            {
                state->time_without_low_pressure_change = 0;
                state->time_with_low_pressure_change += params->elapsed_time_seconds;
                if (state->time_with_low_pressure_change > MAX_TIME_LOW_PRESSURE_CHANGE_SECONDS)
                {
                    result->failure_detected = true;
                }
            }
        }
    }
    else
    {
        state->low_pressure_condition = true;
        state->time_with_low_pressure_change = 0;
        state->time_without_low_pressure_change = 0;
    }
    state->last_error_abs = error_abs;
    state->last_pwm = result->motor_result.pwm;
}

static void pressure_control_algorithm_feed_with_limit(uint32_t pump_idx, const pressure_control_algorithm_params_t *params, pressure_control_algorithm_result_t *result)
{
    feed_with_limit_state_t *state = &feed_with_limit_state[pump_idx];
    if (params->initial_run || params->parameter_change)
    {
        state->feed_time = 0;
    }
    if (state->feed_time >= params->algorithm[pump_idx].feed_time)
    {
        result->done = true;
        return;
    }
    state->feed_time += params->elapsed_time_seconds;
    float max_pwm_abs;
    if (params->current_pressure > params->algorithm[pump_idx].max_pressure_limit)
    {
        max_pwm_abs = 0;
    }
    else if (params->current_pressure < params->algorithm[pump_idx].min_pressure_limit)
    {
        max_pwm_abs = 0;
    }
    else
    {
        float error_max = params->algorithm[pump_idx].max_pressure_limit - params->current_pressure;
        float error_min = params->current_pressure - params->algorithm[pump_idx].min_pressure_limit;
        float max_pwm_error_max = k_p * error_max;
        float max_pwm_error_min = k_p * error_min;
        max_pwm_abs = max_pwm_error_max < max_pwm_error_min ? max_pwm_error_max : max_pwm_error_min;
    }
    if (max_pwm_abs > 1)
    {
        max_pwm_abs = 1;
    }
    float pwm = params->algorithm[pump_idx].feed_pwm > max_pwm_abs ? max_pwm_abs : params->algorithm[pump_idx].feed_pwm;
    if (params->algorithm[pump_idx].direction == PRESSURE_DIRECTION_VACUUM)
    {
        if (pwm > min_pwm)
        {
            result->motor_result.action = MOTOR_ACTION_CW;
            result->motor_result.pwm = pwm;
        }
        else
        {
            result->motor_result.action = MOTOR_ACTION_STOP;
        }
    }
    else
    {
        if (pwm > min_pwm)
        {
            result->motor_result.action = MOTOR_ACTION_CCW;
            result->motor_result.pwm = pwm;
        }
        else
        {
            result->motor_result.action = MOTOR_ACTION_STOP;
        }
    }
}

void pressure_control_algorithm(const pressure_control_algorithm_params_t *params, pressure_control_result_t *result)
{
    result->failure_detected = false;
    result->done = true;
    for (uint32_t i = 0; i < NUM_PUMPS; i++)
    {
        result->motor_result[i].action = MOTOR_ACTION_STOP;
        result->motor_result[i].pwm = 0.0f;
        pressure_control_algorithm_result_t r;
        r.failure_detected = false;
        r.done = false;
        r.motor_result.action = MOTOR_ACTION_STOP;
        r.motor_result.pwm = 0;
        switch (params->algorithm[i].algorithm)
        {
        case PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE:
            pressure_control_algorithm_target_pressure(i, params, &r);
            break;
        case PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT:
            pressure_control_algorithm_feed_with_limit(i, params, &r);
            break;
        case PRESSURE_CONTROL_ALGORITHM_NONE:
            r.done = true;
            break;
        }
        memcpy(&result->motor_result[i], &r.motor_result, sizeof(pressure_control_algorithm_motor_result_t));
        if (!r.done)
        {
            result->done = false;
        }
        if (r.failure_detected)
        {
            result->failure_detected = true;
        }
    }
}