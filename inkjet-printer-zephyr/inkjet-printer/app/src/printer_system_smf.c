#include <zephyr/smf.h>
#include <zephyr/logging/log.h>

#include "printer_system_smf.h"
#include "printhead_routines.h"
#include "pressure_control.h"

LOG_MODULE_REGISTER(printer_system, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printer_system_smf_event);
#define PRINTER_SYSTEM_SMF_GO_TO_ERROR (1 << 0)

enum printer_system_smf_state
{
    PRINTER_SYSTEM_STARTUP,
    PRINTER_SYSTEM_IDLE,
    PRINTER_SYSTEM_ERROR,
    PRINTER_SYSTEM_DROPWATCHER
};

static void printer_system_startup(void *o);
static void printer_system_idle(void *o);
static void printer_system_error_entry(void *o);
static void printer_system_error(void *o);
static void printer_system_dropwatcher_entry(void *o);
static void printer_system_dropwatcher_run(void *o);

const struct smf_state printer_system_states[] = {
    [PRINTER_SYSTEM_IDLE] = SMF_CREATE_STATE(NULL, printer_system_idle, NULL),
    [PRINTER_SYSTEM_STARTUP] = SMF_CREATE_STATE(NULL, printer_system_startup, NULL),
    [PRINTER_SYSTEM_ERROR] = SMF_CREATE_STATE(NULL, printer_system_error, NULL),
    [PRINTER_SYSTEM_DROPWATCHER] = SMF_CREATE_STATE(printer_system_dropwatcher_entry, printer_system_dropwatcher_run, NULL)};

struct printer_system_state_object
{
    struct smf_ctx ctx;
    int32_t events;
} printer_system_state_object;

static void printer_system_idle(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
}

static void printer_system_startup(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
}

static void printer_system_error_entry(void *o)
{
    ARG_UNUSED(o);
    (void)printhead_routine_smf(PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL);
}

static void printer_system_error(void *o)
{
    ARG_UNUSED(o);
}

static bool has_external_error()
{
    return k_event_test(&printer_system_smf_event, PRINTER_SYSTEM_SMF_GO_TO_ERROR);
}

static void printer_system_dropwatcher_entry(void *o)
{
    ARG_UNUSED(o);
    int ret = printhead_routine_smf(PRINTHEAD_ROUTINE_ACTIVATE_INITIAL);
    if (ret != 0)
    {
        printer_system_smf_go_to_error();
    }
    if (has_external_error())
    {
        return;
    }
    pressure_control_set_target_pressure(-3.0f);
    pressure_control_enable(true);
    ret = pressure_control_wait_for_target_pressure();
    if (ret != 0)
    {
        printer_system_smf_go_to_error();
    }
}

static void printer_system_dropwatcher_run(void *o)
{
    // struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
}

void printer_system_smf_go_to_error()
{
    k_event_set(&printer_system_smf_event, PRINTER_SYSTEM_SMF_GO_TO_ERROR);
}

int printer_system_smf()
{
    smf_set_initial(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_STARTUP]);
    while (1)
    {
        printer_system_state_object.events = k_event_wait(&printer_system_smf_event, 0xFFFFFF, false, K_FOREVER);
        if (printer_system_state_object.events & PRINTER_SYSTEM_SMF_GO_TO_ERROR)
        {
            // if we are here, no entry and no run method is currently running, so we can safely clear the error flag
            k_event_clear(&printer_system_smf_event, PRINTER_SYSTEM_SMF_GO_TO_ERROR);
            smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
        }
        int ret = smf_run_state(SMF_CTX(&printer_system_state_object));
        if (ret != 0) {
            break;
        }
    }
}