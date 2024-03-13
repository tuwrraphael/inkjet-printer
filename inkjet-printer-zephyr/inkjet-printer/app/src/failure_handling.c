#include <stddef.h>
#include "failure_handling.h"
#include <zephyr/logging/log.h>

static volatile bool error_state = false;
static failure_callback_t failure_callback;


LOG_MODULE_REGISTER(failure_handling, CONFIG_APP_LOG_LEVEL);

bool failure_handling_is_in_error_state(void)
{
    return error_state;
}

uint32_t failure_handling_get_error_state(void) {
    return error_state;
}

void failure_handling_set_error_state(uint32_t error)
{
    if (!error_state)
    {
        error_state = true;
        failure_callback();
    }
    LOG_INF("Error state set %d", error);
}

int failure_handling_initialize(failure_handling_init_t *init) {
    if (init->failure_callback == NULL)
    {
        return -1;
    }
    failure_callback = init->failure_callback;
    return 0;
}