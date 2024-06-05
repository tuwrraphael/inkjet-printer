#include <zephyr/smf.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/printer.h>

#include "printer_system_smf.h"
#include "printhead_routines.h"
#include "pressure_control.h"
#include "failure_handling.h"
#include "print_control.h"

LOG_MODULE_REGISTER(printer_system, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printer_system_smf_event);

K_SEM_DEFINE(event_sem, 1, 1);

#define PRINTER_SYSTEM_GO_TO_ERROR (1 << 0)
#define PRINTER_SYSTEM_STATE_CHANGE (1 << 1)
#define PRINTER_SYSTEM_TIMEOUT (1 << 2)
#define PRINTER_SYSTEM_REQUEST_FIRE (1 << 3)
#define PRINTER_SYSTEM_REQUEST_SET_NOZZLE_DATA (1 << 4)
#define PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE_SETTINGS (1 << 5)

static const struct device *printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));

static enum printer_system_smf_state requested_state = PRINTER_SYSTEM_STARTUP;

static void printer_system_startup(void *o);
static void printer_system_idle_entry(void *o);
static void printer_system_idle(void *o);
static void printer_system_error_entry(void *o);
static void printer_system_error(void *o);
static void printer_system_dropwatcher_entry(void *o);
static void printer_system_dropwatcher_run(void *o);
static void printer_system_print_entry(void *o);
static void printer_system_print_run(void *o);
static void event_post(uint32_t event);

const struct smf_state printer_system_states[] = {
    [PRINTER_SYSTEM_IDLE] = SMF_CREATE_STATE(printer_system_idle_entry, printer_system_idle, NULL),
    [PRINTER_SYSTEM_STARTUP] = SMF_CREATE_STATE(NULL, printer_system_startup, NULL),
    [PRINTER_SYSTEM_ERROR] = SMF_CREATE_STATE(printer_system_error_entry, printer_system_error, NULL),
    [PRINTER_SYSTEM_DROPWATCHER] = SMF_CREATE_STATE(printer_system_dropwatcher_entry, printer_system_dropwatcher_run, NULL),
    [PRINTER_SYSTEM_PRINT] = SMF_CREATE_STATE(printer_system_print_entry, printer_system_print_run, NULL)};

struct printer_system_state_object
{
    struct smf_ctx ctx;
    int32_t events;
    uint32_t nozzle_data[4];
    print_control_encoder_mode_settings_t encoder_mode_settings;
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
    pressure_control_disable();
    print_control_disable();
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
    int ret;
    // LOG_INF("Enabling pressure control");
    // pressure_control_algorithm_init_t init;
    // init.algorithm = PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE;
    // init.target_pressure = -7.0f;
    // pressure_control_update_parameters(&init);
    // pressure_control_enable();
    // ret = pressure_control_wait_for_done();
    // if (exit_on_error_after_wait())
    // {
    //     return;
    // }
    // if (ret != 0)
    // {
    //     LOG_ERR("Failed to reach target pressure, going to idle state");
    //     smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
    //     return;
    // }
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
    ret = print_control_start_manual_fire_mode();
    if (ret != 0)
    {
        LOG_ERR("Failed to start manual fire mode, going to idle state");
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
            int ret = print_control_request_fire();
            if (ret != 0)
            {
                failure_handling_set_error_state(ERROR_PRINTHEAD_FIRE);
                LOG_ERR("Failed to fire printhead %d", ret);
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
            }
            else
            {
                LOG_INF("Firing printhead");
            }
        }
        if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_SET_NOZZLE_DATA)
        {
            int ret = printer_set_pixels(printhead, printer_system_state_object.nozzle_data);
            if (ret != 0)
            {
                // TODO check if this is really the best way to inform the program to abort
                failure_handling_set_error_state(ERROR_PRINTHEAD_COMMUNICATION);
                LOG_ERR("Failed to set nozzle data %d", ret);
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
            }
            else
            {
                LOG_INF("Setting nozzle data");
            }
        }
        k_timer_start(&timout_timer, K_MINUTES(30), K_NO_WAIT);
    }
}

static void printer_system_print_entry(void *o)
{
    ARG_UNUSED(o);
    int ret;
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

    ret = print_control_start_encoder_mode(&printer_system_state_object.encoder_mode_settings);
    if (ret != 0)
    {
        LOG_ERR("Failed to start encoder mode, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
}

static void printer_system_print_run(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Print state %d\n", printer_system_state_object.events);
    if (printer_system_state_object.events & PRINTER_SYSTEM_TIMEOUT)
    {
        LOG_ERR("Timeout in print state, going to idle state");
        smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
        return;
    }
    else
    {
        if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE_SETTINGS)
        {
            int ret = print_control_start_encoder_mode(&printer_system_state_object.encoder_mode_settings);
            if (ret != 0)
            {
                LOG_ERR("Failed to restart encoder mode, going to idle state");
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
                return;
            }
        }
        k_timer_start(&timout_timer, K_MINUTES(30), K_NO_WAIT);
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

void go_to_print()
{
    requested_state = PRINTER_SYSTEM_PRINT;
    event_post(PRINTER_SYSTEM_STATE_CHANGE);
}

void request_printhead_fire()
{
    event_post(PRINTER_SYSTEM_REQUEST_FIRE);
}

void request_set_nozzle_data(uint32_t *data)
{
    memcpy(printer_system_state_object.nozzle_data, data, sizeof(printer_system_state_object.nozzle_data));
    event_post(PRINTER_SYSTEM_REQUEST_SET_NOZZLE_DATA);
}

void request_change_encoder_mode_settings(print_control_encoder_mode_settings_t *settings)
{
    memcpy(&printer_system_state_object.encoder_mode_settings, settings, sizeof(print_control_encoder_mode_settings_t));
    event_post(PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE_SETTINGS);
}

int printer_system_smf()
{
    printer_system_state_object.encoder_mode_settings.fire_every_ticks = 1;
    printer_system_state_object.encoder_mode_settings.sequential_fires = 1;
    printer_system_state_object.encoder_mode_settings.print_first_line_after_encoder_tick = 100;
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
            if (printer_system_smf_get_state() != requested_state)
            {
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[requested_state]);
            }
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
    return 0;
}

enum printer_system_smf_state printer_system_smf_get_state()
{
    return (enum printer_system_smf_state)(SMF_CTX(&printer_system_state_object)->current - printer_system_states);
}

SYS_INIT(printer_system_smf_init, APPLICATION, CONFIG_APPLICATION_INIT_PRIORITY);