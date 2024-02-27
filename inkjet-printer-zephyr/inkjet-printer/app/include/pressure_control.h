#ifndef PRESSURE_CONTROL_H
#define PRESSURE_CONTROL_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>

typedef void (*pressure_control_error_callback_t)(void);

typedef struct {
    pressure_control_error_callback_t error_callback;
} pressure_control_init_t;

int pressure_control_initialize(pressure_control_init_t *init);

void pressure_control_set_target_pressure(float pressure);

int calibrate_zero_pressure(void);

void pressure_control_enable(bool enable);

double get_pressure(void);

int pressure_control_wait_for_target_pressure();

void pressure_control_go_to_safe_state();

#ifdef __cplusplus
}
#endif

#endif // PRESSURE_CONTROL_H