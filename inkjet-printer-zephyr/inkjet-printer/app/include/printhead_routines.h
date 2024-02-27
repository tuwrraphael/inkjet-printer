#ifndef PRINTHEAD_ROUTINES_H
#define PRINTHEAD_ROUTINES_H

#include <zephyr/smf.h>
#include <zephyr/kernel.h>

typedef void (*printhead_routines_error_callback_t)(void);

typedef struct {
    printhead_routines_error_callback_t error_callback;
} printhead_routines_init_t;

enum printhead_routine_state
{
    PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP,
    PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP_PULSE,
    PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_COMM_RESET,
    PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_RESET_PULSE,
    PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_CLOCK,
    PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_COMM_RESET,
    PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_VPP
};

#define PRINTHEAD_ROUTINE_ACTIVATE_INITIAL (PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP)
#define PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL (PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_COMM_RESET)

int printhead_routine_smf(enum printhead_routine_state init_state);

int printhead_routines_initialize(printhead_routines_init_t *init);

void printhead_routines_go_to_safe_state();

#endif