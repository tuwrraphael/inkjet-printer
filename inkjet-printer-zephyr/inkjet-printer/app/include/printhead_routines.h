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

void activate_printhead_work_cb(struct k_work *work);

#endif