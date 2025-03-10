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

static bool last_voltage_measurement_valid = false;
static uint32_t last_voltage_mv = 0.0;

#define MEASURE_MSEC (1000)

static void measure_voltage_handler(struct k_work *work);

K_WORK_DEFINE(measure_voltage, measure_voltage_handler);

static void measure_voltage_timer_handler(struct k_timer *dummy)
{
    k_work_submit(&measure_voltage);
}

K_TIMER_DEFINE(measure_voltage_timer, measure_voltage_timer_handler, NULL);

static void measure_voltage_handler(struct k_work *work)
{
    int sensorReadResult = sensor_sample_fetch(printhead_voltage);
    last_voltage_measurement_valid = sensorReadResult == 0;
    if (sensorReadResult != 0)
    {
        LOG_DBG("Failed to fetch voltage sensor data: %d", sensorReadResult);
    }
}

int regulator_initialize()
{
    printhead_voltage = DEVICE_DT_GET(DT_NODELABEL(printhead_voltage));
    if (!device_is_ready(printhead_voltage))
    {
        LOG_ERR("Printhead voltage not ready");
        return -ENODEV;
    }
    hv_dac = DEVICE_DT_GET(DT_NODELABEL(hv_dac));
    k_timer_start(&measure_voltage_timer, K_MSEC(MEASURE_MSEC), K_MSEC(MEASURE_MSEC));
    return 0;
}

bool regulator_get_voltage(uint32_t *voltage_mv)
{
    if (!last_voltage_measurement_valid)
    {
        return false;
    }
    struct sensor_value voltage;
    int res = sensor_channel_get(printhead_voltage, SENSOR_CHAN_VOLTAGE, &voltage);
    if (res != 0)
    {
        LOG_ERR("Failed to get voltage sensor data: %d", res);
        return res;
    }
    double conv = 1000.0 * (voltage.val1 + (voltage.val2 / (1000.0 * 1000.0)));
    *voltage_mv = (uint32_t)conv;
    return true;
}

int regulator_set_voltage(uint32_t voltage_mv)
{
    double voltage = ((double)voltage_mv) / 1000.0;
    if (voltage > 35.6 || voltage < 15.0)
    {
        return -EINVAL;
    }

    double value = (418509.0 * voltage) / 2500.0 - 4923009.0 / 2000.0;
    uint32_t value_int = (uint32_t)value;
    int ret = dac_write_value(hv_dac, 0, value_int);
    LOG_INF("Setting voltage to %f, dac value %u", voltage, value_int);
    if (ret != 0)
    {
        LOG_ERR("dac_write_value() failed with code %d\n", ret);
        return 0;
    }
    last_voltage_mv = voltage_mv;
    return 0;
}

void regulator_get_info(regulator_info_t *info)
{
    info->set_voltage_mv = last_voltage_mv;
    info->voltage_reading_available = regulator_get_voltage(&info->voltage_mv);
}
