#include <stdint.h>
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/printer_fire.h>
#include <zephyr/logging/log.h>

#include "dropwatcher_light.h"

LOG_MODULE_REGISTER(dropwatcher_light, CONFIG_APP_LOG_LEVEL);

const struct device *printer_fire_device = DEVICE_DT_GET(DT_NODELABEL(printer_fire));

int set_light_timing(uint32_t delay, uint32_t on_time) {
    if (!device_is_ready(printer_fire_device)) {
        return -ENODEV;
    }
    LOG_INF("Setting light timing: delay=%d, on_time=%d", delay, on_time);
    return printer_fire_set_light_timing(printer_fire_device, delay, on_time);
}