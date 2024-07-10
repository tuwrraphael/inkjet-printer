#ifndef PRESSURE_CONTROL_ALGORITHM_H
#define PRESSURE_CONTROL_ALGORITHM_H

#include <stdbool.h>
#include <stdint.h>
#include <zephyr/drivers/motor.h>

typedef enum {
	PRESSURE_CONTROL_ALGORITHM_NONE,
	PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE,
	PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT
} pressure_control_algorithm_t;

typedef enum {
	PRESSURE_DIRECTION_VACUUM,
	PRESSURE_DIRECTION_PRESSURE
} pressure_direction_t;

typedef struct {
	motor_action_t action;
	float pwm;
} pressure_control_algorithm_motor_result_t;

#define PRESSURE_CONTROL_INK_PUMP_IDX (0)
#define PRESSURE_CONTROL_CAPPING_PUMP_IDX (1)

#define NUM_PUMPS (2)

typedef struct {
	pressure_control_algorithm_t algorithm;
	pressure_direction_t direction;
	float target_pressure;
	float max_pressure_limit;
	float min_pressure_limit;
	float feed_pwm;
	float feed_time;
} pressure_control_algorithm_init_t;

typedef struct {
	pressure_control_algorithm_init_t algorithm[NUM_PUMPS];
	bool initial_run;
	bool parameter_change;
	float current_pressure;
    float elapsed_time_seconds;
} pressure_control_algorithm_params_t;



typedef struct {
	pressure_control_algorithm_motor_result_t motor_result[NUM_PUMPS];
    bool done;
    bool failure_detected;
} pressure_control_result_t;

void pressure_control_algorithm(const pressure_control_algorithm_params_t *params, pressure_control_result_t *result);

#endif // PRESSURE_CONTROL_ALGORITHM_H