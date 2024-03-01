#ifndef FAILURE_HANDLING_H
#define FAILURE_HANDLING_H

#include <stdbool.h>
#include <stdint.h>

#define ERROR_PRESSURE_CONTROL (1<<0)
#define ERROR_PRINTHEAD_RESET (1<<1)
#define ERROR_USER_ABORT (1<<2)

typedef void (*failure_callback_t)(void);

typedef struct {
    failure_callback_t failure_callback;
} failure_handling_init_t;

int failure_handling_initialize(failure_handling_init_t *init);

bool failure_handling_is_in_error_state(void);

void failure_handling_set_error_state(uint32_t error);

#endif // FAILURE_HANDLING_H