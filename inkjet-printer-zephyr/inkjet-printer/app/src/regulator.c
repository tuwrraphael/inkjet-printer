#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/devicetree.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/dac.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/logging/log.h>

#include "regulator.h"

LOG_MODULE_REGISTER(regulator, CONFIG_APP_LOG_LEVEL);

static const struct device *printhead_voltage;
static const struct device *hv_dac;

static const struct dac_channel_cfg dac_ch_cfg = {
    .channel_id = 0,
    .resolution = 12,
    .buffered = false};

int regulator_initialize()
{
    printhead_voltage = DEVICE_DT_GET(DT_NODELABEL(printhead_voltage));
    if (!device_is_ready(printhead_voltage))
    {
        LOG_ERR("Printhead voltage not ready");
        return -ENODEV;
    }
    hv_dac = DEVICE_DT_GET(DT_NODELABEL(hv_dac));
    return 0;
}

double regulator_get_voltage(void)
{
    int sensorReadResult = sensor_sample_fetch(printhead_voltage);
    if (sensorReadResult != 0)
    {
        LOG_ERR("Failed to fetch voltage sensor data: %d", sensorReadResult);
        return sensorReadResult;
    }
    struct sensor_value voltage;
    int res = sensor_channel_get(printhead_voltage, SENSOR_CHAN_VOLTAGE, &voltage);
    if (res != 0)
    {
        LOG_ERR("Failed to get voltage sensor data: %d", res);
        return res;
    }
    double voltage_mv = voltage.val1 + (voltage.val2 / (1000.0 * 1000.0));
    return voltage_mv;
}

int set_regulator_voltage(double voltage)
{
    if (voltage > 34.8 || voltage < 15) {
        return -EINVAL;
    }

    double value = (418509 * voltage)/2500 - 4923009/2000;
    int ret = dac_write_value(hv_dac, 0, (uint32_t)value);
    if (ret != 0)
    {
        LOG_ERR("dac_write_value() failed with code %d\n", ret);
        return 0;
    }
    return 0;
}