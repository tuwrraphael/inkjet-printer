#ifndef PRESSURE_CONTROL_H
#define PRESSURE_CONTROL_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdbool.h>

// Function to set target pressure
void pressure_control_set_target_pressure(float pressure);

// Function to calibrate zero pressure
int calibrate_zero_pressure(void);

// Function to enable or disable pressure control
void pressure_control_enable(bool enable);

double get_pressure(void);

#ifdef __cplusplus
}
#endif

#endif // PRESSURE_CONTROL_H