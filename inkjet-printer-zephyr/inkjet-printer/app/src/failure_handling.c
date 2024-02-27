#include <stddef.h>
#include "failure_handling.h"

static volatile bool error_state = false;
static failure_callback_t failure_callback;

bool failure_handling_is_in_error_state(void)
{
    return error_state;
}

void failure_handling_set_error_state(uint32_t error)
{
    error_state = true;
    failure_callback();
}

int failure_handling_initialize(failure_handling_init_t *init) {
    if (init->failure_callback == NULL)
    {
        return -1;
    }
    failure_callback = init->failure_callback;
    return 0;
}