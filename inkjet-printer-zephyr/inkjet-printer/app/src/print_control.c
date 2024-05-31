#include <zephyr/device.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/sensor.h>

#include <lib/inkjetcontrol/encoder.h>
#include <zephyr/drivers/printer.h>
#include <zephyr/drivers/printer_fire.h>

#include "print_control.h"
#include "failure_handling.h"

LOG_MODULE_REGISTER(print_control, CONFIG_APP_LOG_LEVEL);

static const struct device *printhead;
static const struct device *printer_fire;
static const struct device *encoder;

static print_control_error_callback_t error_callback;

static encoder_print_status_t encoder_print_status;

static uint32_t line_to_load = 0;

static void load_line_handler(struct k_work *work);

K_WORK_DEFINE(load_line_work, load_line_handler);

uint8_t active_nozzle = 0;

static bool encoder_mode = false;

void set_nozzle(uint8_t nozzle_id, bool value, uint32_t *data)
{
    uint8_t patternid = nozzle_id / 32;
    uint8_t bitid = nozzle_id % 32;
    if (value)
    {
        data[patternid] |= (1 << (bitid));
    }
    else
    {
        data[patternid] &= ~(1 << (bitid));
    }
}

static void load_line_handler(struct k_work *work)
{
    active_nozzle = line_to_load % 128;
    uint32_t pixels[4] = {0, 0, 0, 0};
    set_nozzle(active_nozzle, true, pixels);
    int ret; //TODO!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // int ret = printer_wait_rts(printhead, K_SECONDS(1));
    // if (ret != 0)
    // {
    //     error_callback(ERROR_PRINTHEAD_COMMUNICATION);
    // }
    ret = printer_set_pixels(printhead, pixels);
    if (ret != 0)
    {
        error_callback(ERROR_PRINTHEAD_COMMUNICATION);
    }
}

static int32_t get_value_cb(void *inst)
{
    struct sensor_value val;
    (void)sensor_sample_fetch(encoder);
    (void)sensor_channel_get(encoder, SENSOR_CHAN_POS_DX, &val);
    return val.val1;
}

static void fire_abort_cb(void *inst)
{
    printer_fire_abort(printer_fire);
}

static void load_line_cb(void *inst, uint32_t line)
{
    line_to_load = line;
    k_work_submit(&load_line_work);
}

static void fire_issued_cb()
{
    if (encoder_mode)
    {
        encoder_printhead_fired_handler(&encoder_print_status);
    }
}

static void trigger_cb()
{
    if (encoder_mode)
    {
        encoder_tick_handler(&encoder_print_status);
    }
}

int print_control_start_encoder_mode(print_control_encoder_mode_init_t *init)
{
    static encoder_print_init_t print_init = {
        .fire_abort = fire_abort_cb,
        .get_value = get_value_cb,
        .load_line = load_line_cb,
        .inst = NULL};
    print_init.sequential_fires = init->sequential_fires;
    print_init.fire_every_ticks = init->fire_every_ticks;
    print_init.print_first_line_after_encoder_tick = init->print_first_line_after_encoder_tick;
    encoder_print_init(&encoder_print_status, &print_init);
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_ENCODER);
    printer_fire_set_trigger_reset(printer_fire, false);
    printer_fire_set_fire_issued_callback(printer_fire, fire_issued_cb);
    printer_fire_set_trigger_callback(printer_fire, trigger_cb);
    encoder_mode = true;
    return 0;
}
int print_control_start_manual_fire_mode()
{
    encoder_mode = false;
    printer_fire_set_trigger(printer_fire, PRINTER_FIRE_TRIGGER_CLOCK);
    printer_fire_set_trigger_reset(printer_fire, true);
    printer_fire_set_fire_issued_callback(printer_fire, NULL);
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