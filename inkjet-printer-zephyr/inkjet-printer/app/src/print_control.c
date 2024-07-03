#include <zephyr/device.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/sensor.h>

#include <lib/inkjetcontrol/encoder.h>
#include <lib/inkjetcontrol/nozzle_data.h>
#include <lib/inkjetcontrol/test_pattern.h>
#include <zephyr/drivers/printer.h>
#include <zephyr/drivers/printer_fire.h>

#include "print_control.h"
#include "failure_handling.h"

LOG_MODULE_REGISTER(print_control, CONFIG_APP_LOG_LEVEL);

static uint32_t print_memory[16384] = {0};

static const struct device *printhead;
static const struct device *printer_fire;
static const struct device *encoder;

static print_control_error_callback_t error_callback;

static encoder_print_status_t encoder_print_status;

static uint32_t line_to_load = 0;
static bool next_load_wait_fired = false;

static void load_line_handler(void);

K_SEM_DEFINE(load_line_sem, 0, 1);

static encoder_mode_t encoder_mode = ENCODER_MODE_OFF;

static bool nozzle_priming_active = false;

static void load_line_handler(void)
{
    while (true)
    {
        k_sem_take(&load_line_sem, K_FOREVER);
        int ret;
        if (next_load_wait_fired)
        {
            ret = printer_wait_fired_load_next(printhead, K_USEC(20));
            LOG_INF("Wait fired %d", ret);
            if (ret != 0)
            {
                LOG_ERR("Fired signal not received, skipping load");
                continue;
            }
        }
        ret = printer_set_pixels(printhead, &print_memory[line_to_load * 4]);
        if (ret != 0)
        {
            error_callback(ERROR_PRINTHEAD_COMMUNICATION);
        }
        encoder_signal_load_line_completed(&encoder_print_status, line_to_load);
    }
}

static int32_t get_value_cb(void *inst)
{
    struct sensor_value val;
    (void)sensor_sample_fetch(encoder);
    (void)sensor_channel_get(encoder, SENSOR_CHAN_POS_DX, &val);
    return val.val1;
}

static void load_error_cb(void *inst)
{
    LOG_ERR("Load error");
}

static void fire_abort_cb(void *inst)
{
    printer_fire_abort(printer_fire);
}

static void load_line_cb(void *inst, uint32_t line, bool wait_fired)
{
    line_to_load = line;
    next_load_wait_fired = wait_fired;
    k_sem_give(&load_line_sem);
}

static void fire_issued_cb()
{
    if (encoder_mode == ENCODER_MODE_ON)
    {
        encoder_fire_issued_handler(&encoder_print_status);
    }
}

static void fire_completed_cb()
{
    if (encoder_mode == ENCODER_MODE_ON)
    {
        encoder_fire_cycle_completed_handler(&encoder_print_status);
    }
}

static void trigger_cb()
{
    if (encoder_mode == ENCODER_MODE_ON)
    {
        encoder_tick_handler(&encoder_print_status);
    }
}

int print_control_start_encoder_mode(print_control_encoder_mode_settings_t *init)
{
    static encoder_print_init_t print_init = {
        .fire_abort = fire_abort_cb,
        .get_value = get_value_cb,
        .load_line = load_line_cb,
        .load_error_cb = load_error_cb,
        .inst = NULL};
    print_init.sequential_fires = init->sequential_fires;
    print_init.fire_every_ticks = init->fire_every_ticks;
    print_init.print_first_line_after_encoder_tick = init->print_first_line_after_encoder_tick;
    print_init.lines_to_print = init->lines_to_print;
    encoder_print_init(&encoder_print_status, &print_init);
    printer_fire_set_timing(printer_fire, 10300, 1000, 10300, 2000);
    printer_fire_set_fire_issued_callback(printer_fire, fire_issued_cb);
    printer_fire_set_fire_cycle_completed_callback(printer_fire, fire_completed_cb);
    printer_fire_set_trigger_callback(printer_fire, trigger_cb);
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_abort(printer_fire);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
    if (init->start_paused)
    {
        encoder_mode = ENCODER_MODE_PAUSED;
    }
    else
    {
        printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_ENCODER);
        printer_fire_set_trigger_reset(printer_fire, false);
        printer_fire_request_fire(printer_fire);
        encoder_mode = ENCODER_MODE_ON;
    }
    return 0;
}
int print_control_start_manual_fire_mode()
{
    encoder_mode = ENCODER_MODE_OFF;
    printer_fire_set_timing(printer_fire, 40000, 1000, 250, 1000);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_set_fire_issued_callback(printer_fire, NULL);
    printer_fire_set_fire_cycle_completed_callback(printer_fire, NULL);
    printer_fire_set_trigger_callback(printer_fire, NULL);
    return 0;
}
int print_control_request_fire()
{
    int ret = printer_fire_request_fire(printer_fire);
    if (ret != 0)
    {
        error_callback(ERROR_PRINTHEAD_FIRE);
        return ret;
    }
    return 0;
}

void print_control_set_encoder_position(int32_t value)
{
    struct sensor_value val;
    (void)sensor_sample_fetch(encoder);
    (void)sensor_channel_get(encoder, SENSOR_CHAN_POS_DX, &val);
    val.val1 = value - val.val2;
    (void)sensor_attr_set(encoder, SENSOR_CHAN_POS_DX, SENSOR_ATTR_OFFSET, &val);
}

void print_control_disable()
{
    encoder_mode = ENCODER_MODE_OFF;
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_abort(printer_fire);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
}

void print_control_set_print_memory(uint32_t offset, uint32_t *data, uint32_t length)
{
    memcpy(&print_memory[offset], data, length * sizeof(uint32_t));
}

int print_control_initialize(print_control_init_t *init)
{
    error_callback = init->error_callback;
    printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
    if (!device_is_ready(printhead))
    {
        LOG_ERR("Printhead not ready");
        return -ENODEV;
    }
    printer_fire = DEVICE_DT_GET(DT_NODELABEL(printer_fire));
    if (!device_is_ready(printer_fire))
    {
        LOG_ERR("Printer fire not ready");
        return -ENODEV;
    }
    encoder = DEVICE_DT_GET(DT_NODELABEL(qdec));
    if (!device_is_ready(encoder))
    {
        LOG_ERR("Encoder device is not ready");
        return -ENODEV;
    }
    return 0;
}

void print_control_go_to_safe_state()
{
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_abort(printer_fire);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
}

void print_control_get_info(print_control_info_t *info)
{
    info->encoder_mode_settings.fire_every_ticks = encoder_print_status.init.fire_every_ticks;
    info->encoder_mode_settings.print_first_line_after_encoder_tick = encoder_print_status.init.print_first_line_after_encoder_tick;
    info->encoder_mode_settings.sequential_fires = encoder_print_status.init.sequential_fires;
    info->expected_encoder_value = encoder_print_status.expected_encoder_value;
    info->last_printed_line = encoder_print_status.last_printed_line;
    info->lost_lines_count = encoder_print_status.lost_lines_count;
    info->printed_lines = encoder_print_status.printed_lines;
    info->encoder_value = get_value_cb(NULL);
    info->nozzle_priming_active = nozzle_priming_active;
    info->encoder_mode = encoder_mode;
    info->lost_lines_by_slow_data = encoder_print_status.lost_lines_by_slow_data;
}

static int priming_cycle(uint32_t *data, uint32_t times, k_timeout_t pause)
{
    int ret = printer_set_pixels(printhead, data);
    if (ret != 0)
    {
        failure_handling_set_error_state(ERROR_PRINTHEAD_COMMUNICATION);
        LOG_ERR("Failed to set nozzle data %d", ret);
        return ret;
    }
    for (uint32_t j = j; j < times; j++)
    {
        k_sleep(pause);
        if (failure_handling_is_in_error_state())
        {
            return -ECANCELED;
        }
        ret = print_control_request_fire();
        if (ret != 0)
        {
            failure_handling_set_error_state(ERROR_PRINTHEAD_FIRE);
            return ret;
        }
    }
    return 0;
}

int print_control_nozzle_priming()
{
    nozzle_priming_active = true;
    int ret = print_control_start_manual_fire_mode();
    if (ret != 0)
    {
        LOG_ERR("Failed to start manual fire mode.");
        return ret;
    }
    uint32_t data[4] = {0};
    for (uint32_t i = 0; i < 128; i++)
    {
        if (i % 2 == 0)
        {
            set_nozzle(i, true, data);
        }
    }
    ret = priming_cycle(data, 100,K_USEC(235));
    if (ret != 0)
    {
        return ret;
    }
    memset(data, 0, sizeof(data));
    for (uint32_t i = 0; i < 128; i++)
    {
        if (i % 2 == 1)
        {
            set_nozzle(i, true, data);
        }
    }
    ret = priming_cycle(data, 100, K_USEC(235));
    if (ret != 0)
    {
        return ret;
    }
    for (uint32_t i = 0; i < 128; i++)
    {
        memset(data, 0, sizeof(data));
        set_nozzle(i, true, data);
        ret = priming_cycle(data, 10, K_MSEC(2));
        if (ret != 0)
        {
            return ret;
        }
    }
    nozzle_priming_active = false;
    return 0;
}

void print_control_pause_encoder_mode()
{
    if (encoder_mode == ENCODER_MODE_ON)
    {
        encoder_mode = ENCODER_MODE_PAUSED;
    }
    else
    {
        LOG_ERR("Encoder mode not active");
        return;
    }
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_abort(printer_fire);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
}

void print_control_resume_encoder_mode()
{
    if (encoder_mode == ENCODER_MODE_PAUSED)
    {
        encoder_mode = ENCODER_MODE_ON;
    }
    else
    {
        LOG_ERR("Encoder mode not paused");
        return;
    }
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_ENCODER);
    printer_fire_set_trigger_reset(printer_fire, false);
    printer_fire_request_fire(printer_fire);
}

#define LOAD_LINE_STACK (512)
#define LOAD_LINE_PRIORITY (-2)

K_THREAD_DEFINE(load_line, 512, load_line_handler, NULL, NULL, NULL,
                LOAD_LINE_PRIORITY, 0, 0);