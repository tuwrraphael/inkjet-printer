#ifndef PRESSURE_CONTROL_H
#define PRESSURE_CONTROL_H

#ifdef __cplusplus
extern "C"
{
#endif

#include <stdbool.h>
#include "pressure_control_algorithm.h"

    typedef void (*pressure_control_error_callback_t)(void);

    typedef struct
    {
        pressure_control_error_callback_t error_callback;
    } pressure_control_init_t;

    typedef struct
    {
        float pressure;
        bool enabled;
        bool done;
        pressure_control_algorithm_init_t algorithm;
    } pressure_control_info_t;

    int pressure_control_initialize(pressure_control_init_t *init);

    int calibrate_zero_pressure(void);

    void pressure_control_enable();

    void pressure_control_update_parameters(pressure_control_algorithm_init_t *init);

    void pressure_control_disable();

    double pressure_control_get_pressure(void);

    void pressure_control_get_info(pressure_control_info_t *info);

    int pressure_control_wait_for_done();

    void pressure_control_go_to_safe_state();

#ifdef __cplusplus
}
#endif

#endif // PRESSURE_CONTROL_H