#include <zephyr/smf.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/printer.h>

#include "printer_system_smf.h"
#include "printhead_routines.h"
#include "pressure_control.h"
#include "failure_handling.h"
#include "print_control.h"
#include "regulator.h"

LOG_MODULE_REGISTER(printer_system, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printer_system_smf_event);

K_SEM_DEFINE(event_sem, 1, 1);

#define PRINTER_SYSTEM_GO_TO_ERROR (1 << 0)
#define PRINTER_SYSTEM_STATE_CHANGE (1 << 1)
#define PRINTER_SYSTEM_TIMEOUT (1 << 2)
#define PRINTER_SYSTEM_REQUEST_FIRE (1 << 3)
#define PRINTER_SYSTEM_REQUEST_SET_NOZZLE_DATA (1 << 4)
#define PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE_SETTINGS (1 << 5)
#define PRINTER_SYSTEM_REQUEST_PRIME_NOZZLES (1 << 6)
#define PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE (1 << 7)
#define PRINTER_SYSTEM_REQUEST_CHANGE_WAVEFORM_SETTINGS (1 << 8)

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
static void printer_system_keep_alive_entry(void *o);
static void printer_system_keep_alive_run(void *o);

static void event_post(uint32_t event);

const struct smf_state printer_system_states[] = {
    [PRINTER_SYSTEM_IDLE] = SMF_CREATE_STATE(printer_system_idle_entry, printer_system_idle, NULL),
    [PRINTER_SYSTEM_STARTUP] = SMF_CREATE_STATE(NULL, printer_system_startup, NULL),
    [PRINTER_SYSTEM_ERROR] = SMF_CREATE_STATE(printer_system_error_entry, printer_system_error, NULL),
    [PRINTER_SYSTEM_DROPWATCHER] = SMF_CREATE_STATE(printer_system_dropwatcher_entry, printer_system_dropwatcher_run, NULL),
    [PRINTER_SYSTEM_PRINT] = SMF_CREATE_STATE(printer_system_print_entry, printer_system_print_run, NULL),
    [PRINTER_SYSTEM_KEEP_ALIVE] = SMF_CREATE_STATE(printer_system_keep_alive_entry, printer_system_keep_alive_run, NULL)};

struct printer_system_state_object
{
    struct smf_ctx ctx;
    int32_t events;
    uint32_t nozzle_data[4];
    print_control_encoder_mode_settings_t encoder_mode_settings;
    waveform_settings_t waveform_settings;
    bool change_encoder_mode_to_paused;
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
    struct printer_system_state_object *object = (struct printer_system_state_object *)o;
    ARG_UNUSED(o);
    LOG_INF("Idle state\n");
    if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_CHANGE_WAVEFORM_SETTINGS)
    {
        int ret = regulator_set_voltage(object->waveform_settings.voltage);
        if (ret != 0)
        {
            LOG_ERR("Failed to set voltage %d", ret);
        }
        ret = printhead_routines_config_period(object->waveform_settings.clock_period_ns);
        if (ret != 0)
        {
            LOG_ERR("Failed to set clock period %d", ret);
        }
    }
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
        if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_PRIME_NOZZLES)
        {
            int ret = print_control_nozzle_priming();
            if (ret != 0)
            {
                failure_handling_set_error_state(ERROR_PRINTHEAD_FIRE);
                LOG_ERR("Failed to prime nozzles %d", ret);
                smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_ERROR]);
            }
            else
            {
                LOG_INF("Priming nozzles");
            }
        }
        if (printer_system_state_object.events & PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE)
        {
            if (printer_system_state_object.change_encoder_mode_to_paused)
            {
                print_control_pause_encoder_mode();
            }
            else
            {
                print_control_resume_encoder_mode();
            }
        }
        k_timer_start(&timout_timer, K_MINUTES(30), K_NO_WAIT);
    }
}

static void printer_system_keep_alive_entry(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Entering keep alive state");
    (void)printhead_routine_smf(PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL);
    pressure_control_disable();
    print_control_disable();
}

static void printer_system_keep_alive_run(void *o)
{
    ARG_UNUSED(o);
    LOG_INF("Keep alive state %d\n", printer_system_state_object.events);
    if (printer_system_state_object.events & PRINTER_SYSTEM_TIMEOUT)
    {
        LOG_INF("Timeout in keep alive state: execute maintainance program");
        pressure_control_disable();
        k_sleep(K_SECONDS(1));
        pressure_control_algorithm_init_t capping_pump_algorithm_init;
        memset(&capping_pump_algorithm_init, 0, sizeof(capping_pump_algorithm_init));
        pressure_control_algorithm_init_t ink_pump_algorithm_init;
        memset(&ink_pump_algorithm_init, 0, sizeof(ink_pump_algorithm_init));

        capping_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_NONE;
        ink_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE;
        ink_pump_algorithm_init.target_pressure = 0;
        pressure_control_update_parameters(PRESSURE_CONTROL_INK_PUMP_IDX, &ink_pump_algorithm_init);
        pressure_control_update_parameters(PRESSURE_CONTROL_CAPPING_PUMP_IDX, &capping_pump_algorithm_init);
        pressure_control_enable();
        LOG_INF("Target pressure before");
        int ret = pressure_control_wait_for_done(K_SECONDS(10));
        LOG_INF("Pressure control done");
        k_sleep(K_SECONDS(1));
        if (exit_on_error_after_wait())
        {
            return;
        }
        if (ret != 0)
        {
            LOG_ERR("Pressure control failed");
            smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
            return;
        }
        pressure_control_disable();
        k_sleep(K_SECONDS(1));

        ink_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_NONE;
        capping_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT;
        capping_pump_algorithm_init.direction = PRESSURE_DIRECTION_VACUUM;
        capping_pump_algorithm_init.feed_pwm = 0.8f;
        capping_pump_algorithm_init.feed_time = 5;
        capping_pump_algorithm_init.max_pressure_limit = 40;
        capping_pump_algorithm_init.min_pressure_limit = -40;
        pressure_control_update_parameters(PRESSURE_CONTROL_INK_PUMP_IDX, &ink_pump_algorithm_init);
        pressure_control_update_parameters(PRESSURE_CONTROL_CAPPING_PUMP_IDX, &capping_pump_algorithm_init);

        pressure_control_enable();
        LOG_INF("Feed with limit");
        ret = pressure_control_wait_for_done(K_SECONDS(capping_pump_algorithm_init.feed_time + 3));
        LOG_INF("Pressure control done");
        k_sleep(K_SECONDS(1));
        if (exit_on_error_after_wait())
        {
            return;
        }
        if (ret != 0)
        {
            LOG_ERR("Pressure control failed");
            smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
            return;
        }
        pressure_control_disable();
        k_sleep(K_SECONDS(1));
        ink_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE;
        capping_pump_algorithm_init.algorithm = PRESSURE_CONTROL_ALGORITHM_NONE;
        pressure_control_update_parameters(PRESSURE_CONTROL_INK_PUMP_IDX, &ink_pump_algorithm_init);
        pressure_control_update_parameters(PRESSURE_CONTROL_CAPPING_PUMP_IDX, &capping_pump_algorithm_init);
        pressure_control_enable();
        LOG_INF("Target pressure after");
        ret = pressure_control_wait_for_done(K_SECONDS(capping_pump_algorithm_init.feed_time + 3));
        LOG_INF("Pressure control done");
        if (exit_on_error_after_wait())
        {
            return;
        }
        if (ret != 0)
        {
            LOG_ERR("Pressure control failed");
            smf_set_state(SMF_CTX(&printer_system_state_object), &printer_system_states[PRINTER_SYSTEM_IDLE]);
            return;
        }
        pressure_control_disable();
    }
    k_timer_start(&timout_timer, K_MINUTES(75), K_NO_WAIT);
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

void go_to_keep_alive()
{
    requested_state = PRINTER_SYSTEM_KEEP_ALIVE;
    event_post(PRINTER_SYSTEM_STATE_CHANGE);
}

void request_printhead_fire()
{
    event_post(PRINTER_SYSTEM_REQUEST_FIRE);
}

void request_prime_nozzles()
{
    event_post(PRINTER_SYSTEM_REQUEST_PRIME_NOZZLES);
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

void request_change_encoder_mode(bool paused)
{
    printer_system_state_object.change_encoder_mode_to_paused = paused;
    event_post(PRINTER_SYSTEM_REQUEST_CHANGE_ENCODER_MODE);
}

void request_set_waveform_settings(waveform_settings_t *settings)
{
    memcpy(&printer_system_state_object.waveform_settings, settings, sizeof(waveform_settings_t));
    event_post(PRINTER_SYSTEM_REQUEST_CHANGE_WAVEFORM_SETTINGS);
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