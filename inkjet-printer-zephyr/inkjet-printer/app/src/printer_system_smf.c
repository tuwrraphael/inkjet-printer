#include <zephyr/smf.h>
#include <zephyr/logging/log.h>

#include "printer_system_smf.h"
#include "printhead_routines.h"
#include "pressure_control.h"
#include "failure_handling.h"

LOG_MODULE_REGISTER(printer_system, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printer_system_smf_event);

K_SEM_DEFINE(event_sem, 0, 1);

#define PRINTER_SYSTEM_GO_TO_ERROR (1 << 0)
#define PRINTER_SYSTEM_STATE_CHANGE (1 << 1)

enum printer_system_smf_state
{
    PRINTER_SYSTEM_STARTUP,
    PRINTER_SYSTEM_IDLE,
    PRINTER_SYSTEM_ERROR,
    PRINTER_SYSTEM_DROPWATCHER
};

static enum printer_system_smf_state requested_state = PRINTER_SYSTEM_STARTUP;

static void printer_system_startup(void *o);
static void printer_system_idle_entry(void *o);
static void printer_system_idle(void *o);
static void printer_system_error_entry(void *o);
static void printer_system_error(void *o);
static void printer_system_dropwatcher_entry(void *o);
static void printer_system_dropwatcher_run(void *o);

const struct smf_state printer_system_states[] = {
    [PRINTER_SYSTEM_IDLE] = SMF_CREATE_STATE(printer_system_idle_entry, printer_system_idle, NULL),
    [PRINTER_SYSTEM_STARTUP] = SMF_CREATE_STATE(NULL, printer_system_startup, NULL),
    [PRINTER_SYSTEM_ERROR] = SMF_CREATE_STATE(printer_system_error_entry, printer_system_error, NULL),
    [PRINTER_SYSTEM_DROPWATCHER] = SMF_CREATE_STATE(printer_system_dropwatcher_entry, printer_system_dropwatcher_run, NULL)};

struct printer_system_state_object
{
    struct smf_ctx ctx;
    int32_t events;
} printer_system_state_object;

static void printer_system_idle_entry(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Entering idle state");
    (void)printhead_routine_smf(PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL);
    pressure_control_enable(false);
}

static void printer_system_idle(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
    LOG_INF("Idle state\n");
}

static void printer_system_startup(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
    LOG_INF("Startup state\n");
}

static void printer_system_error_entry(void *o)
{
    ARG_UNUSED(o);
    (void)printhead_routine_smf(PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL);
}

static void printer_system_error(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Error state\n");
}

static void printer_system_dropwatcher_entry(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Enabling pressure control");
    pressure_control_set_target_pressure(-3.0f);
    pressure_control_enable(true);
    int ret = pressure_control_wait_for_target_pressure();
    if (ret != 0)
    {
        LOG_ERR("Failed to reach target pressure, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
    ret = printhead_routine_smf(PRINTHEAD_ROUTINE_ACTIVATE_INITIAL);
    if (ret != 0)
    {
        LOG_ERR("Failed to activate printhead, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
}

static void printer_system_dropwatcher_run(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
    LOG_INF("Dropwatcher state\n");
}

static void event_post(uint32_t event)
{
    k_event_post(&printer_system_smf_event, event);
    k_sem_give(&event_sem);
}

void printer_system_smf_go_to_safe_state()
{
    event_post(PRINTER_SYSTEM_GO_TO_ERROR);
}

void go_to_dropwatcher()
{
    requested_state = PRINTER_SYSTEM_DROPWATCHER;
    event_post(PRINTER_SYSTEM_STATE_CHANGE);
}

void go_to_idle()
{
    requested_state = PRINTER_SYSTEM_IDLE;
    event_post(PRINTER_SYSTEM_STATE_CHANGE);
}

int printer_system_smf()
{
    smf_set_initial(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_STARTUP]);
    while (1)
    {
        LOG_INF("Waiting for event");
        k_sem_take(&event_sem, K_FOREVER);
        printer_system_state_object.events = k_event_clear(&printer_system_smf_event, 0xFFFFFFFF);
        if (failure_handling_is_in_error_state())
        {
            if (SMF_CTX(&printer_system_state_object)->current != &printer_system_states[PRINTER_SYSTEM_ERROR])
            {
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
            }
        }
        else if (printer_system_state_object.events & PRINTER_SYSTEM_STATE_CHANGE)
        {
            smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[requested_state]);
        }
        int ret = smf_run_state(SMF_CTX(&printer_system_state_object));
        if (ret != 0)
        {
            return ret;
        }
    }
}