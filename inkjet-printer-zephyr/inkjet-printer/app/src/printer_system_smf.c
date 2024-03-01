#include <zephyr/smf.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/printer_fire.h>

#include "printer_system_smf.h"
#include "printhead_routines.h"
#include "pressure_control.h"
#include "failure_handling.h"

LOG_MODULE_REGISTER(printer_system, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printer_system_smf_event);

K_SEM_DEFINE(event_sem, 1, 1);

#define PRINTER_SYSTEM_GO_TO_ERROR (1 << 0)
#define PRINTER_SYSTEM_STATE_CHANGE (1 << 1)
#define PRINTER_SYSTEM_TIMEOUT (1 << 2)
#define PRINTER_SYSTEM_REQUEST_FIRE (1 << 3)

const struct device *printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
const struct device *printer_fire_device = DEVICE_DT_GET(DT_NODELABEL(printer_fire));

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
static void event_post(uint32_t event);

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

static void timeout_timer_handler(struct k_timer *dummy)
{
    ARG_UNUSED(dummy);
    event_post(PRINTER_SYSTEM_TIMEOUT);
}

K_TIMER_DEFINE(timout_timer, timeout_timer_handler, NULL);

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

static bool exit_on_error_after_wait()
{
    if (failure_handling_is_in_error_state())
    {
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
        return true;
    }
    return false;
}

static void printer_system_dropwatcher_entry(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Enabling pressure control");
    pressure_control_set_target_pressure(-7.0f);
    pressure_control_enable(true);
    int ret = pressure_control_wait_for_target_pressure();
    if (exit_on_error_after_wait())
    {
        return;
    }
    if (ret != 0)
    {
        LOG_ERR("Failed to reach target pressure, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
    ret = printhead_routine_smf(PRINTHEAD_ROUTINE_ACTIVATE_INITIAL);
    if (exit_on_error_after_wait())
    {
        return;
    }
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
    LOG_INF("Dropwatcher state %d\n", printer_system_state_object.events);
    if (printer_system_state_object.events & PRINTER_SYSTEM_TIMEOUT)
    {
        LOG_ERR("Timeout in dropwatcher state, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
    else
    {
        if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_FIRE)
        {
            LOG_INF("Firing printhead");
            printer_fire(printer_fire_device);
        }
        k_timer_start(&timout_timer, K_SECONDS(60), K_NO_WAIT);
    }
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

void request_printhead_fire()
{
    event_post(PRINTER_SYSTEM_REQUEST_FIRE);
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

int printer_system_smf_init()
{
    if (!device_is_ready(printhead))
    {
        LOG_ERR("Printhead not ready");
        return -1;
    }
    if (!device_is_ready(printer_fire_device))
    {
        LOG_ERR("Printer fire not ready");
        return -1;
    }
    return 0;
}

SYS_INIT(printer_system_smf_init, APPLICATION, CONFIG_APPLICATION_INIT_PRIORITY);