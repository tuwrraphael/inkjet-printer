#ifndef PRINTHEAD_ROUTINES_H
#define PRINTHEAD_ROUTINES_H

#include <zephyr/smf.h>
#include <zephyr/kernel.h>

typedef struct
{
    struct k_work work;
    struct k_event *cancelevent;
    uint32_t events;
} printhead_routine_work_t;

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
void printhead_routine_cancel();

#endif