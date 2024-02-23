#define DT_DRV_COMPAT honeywell_abp

#include <zephyr/device.h>
#include <zephyr/drivers/spi.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/clock_control.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(abp, CONFIG_SENSOR_LOG_LEVEL);

struct abp_data
{
	int32_t data_ubar;
};

struct abp_config
{
	struct spi_dt_spec bus;
};

static int abp_sample_fetch(const struct device *dev,
							enum sensor_channel channel)
{
	const struct abp_config *config = dev->config;
	struct abp_data *data = dev->data;
	uint8_t read_data[2];
	int ret;
	struct spi_buf buf = {
		.buf = read_data,
		.len = sizeof(uint8_t) * 2,
	};
	struct spi_buf_set rx = {
		.buffers = &buf,
		.count = 1,
	};

	ret = spi_read(config->bus.bus, &config->bus.config, &rx);
	bool status_bit_0_set = (read_data[0] & (1 << 14)) > 0;
	bool status_bit_1_set = (read_data[0] & (1 << 15)) > 0;
	int32_t adc_val = ((read_data[0] & 0x3F) << 8) | read_data[1];

	uint32_t adc_max = 14745;
	uint32_t adc_min = 1638;
	int32_t adc_middle = 0x2000;
	if (adc_val > adc_max || adc_val < adc_min)
	{
		LOG_ERR("abp_sample_fetch: adc value out of range");
		return -EIO;
	}
	int32_t p_max_mbar = 1034;
	uint32_t p_range = 2 * p_max_mbar;

	int32_t adc_range = (adc_max - adc_min);

	int32_t adc_mul = (adc_val - adc_middle) * p_range * 100;

	data->data_ubar = adc_mul / adc_range * 10;

	return 0;
}

static int abp_channel_get(const struct device *dev,
						   enum sensor_channel chan,
						   struct sensor_value *val)
{
	struct abp_data *data = dev->data;

	switch (chan)
	{

	case SENSOR_CHAN_PRESS:
		val->val1 = data->data_ubar / 10 / 1000;
		val->val2 = (data->data_ubar / 10 % 1000) * 1000;
		break;
	default:
		return -ENOTSUP;
	}

	return 0;
}

static const struct sensor_driver_api abp_api = {
	.sample_fetch = abp_sample_fetch,
	.channel_get = abp_channel_get};

static int abp_init(const struct device *dev)
{
	const struct abp_config *config = dev->config;
	// struct abp_data *data = dev->data;

	if (!spi_is_ready_dt(&config->bus))
	{
		LOG_ERR("SPI bus %s not ready", config->bus.bus->name);
		return -ENODEV;
	}
	return 0;
}

#define abp_INIT(i)                                      \
	static struct abp_data abp_data_##i;                 \
                                                         \
	static const struct abp_config abp_config_##i = {    \
		.bus = SPI_DT_SPEC_INST_GET(i,                   \
									SPI_OP_MODE_MASTER | \
										SPI_WORD_SET(8), \
									0)};                 \
                                                         \
	DEVICE_DT_INST_DEFINE(i, abp_init, NULL,             \
						  &abp_data_##i,                 \
						  &abp_config_##i, POST_KERNEL,  \
						  CONFIG_SENSOR_INIT_PRIORITY, &abp_api);

DT_INST_FOREACH_STATUS_OKAY(abp_INIT)
