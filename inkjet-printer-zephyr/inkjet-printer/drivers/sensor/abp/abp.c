#define DT_DRV_COMPAT honeywell_abp

#include <zephyr/device.h>
#include <zephyr/drivers/spi.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/clock_control.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(abp, CONFIG_SENSOR_LOG_LEVEL);

struct abp_data
{
};

struct abp_config
{
	struct spi_dt_spec bus;
};

static int abp_sample_fetch(const struct device *dev,
							enum sensor_channel channel)
{
	const struct abp_config *config = dev->config;
	// struct abp_data *data = dev->data;
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
	uint16_t adc_val = (read_data[0] << 8) | read_data[1];
	double max_pressure = 1034.0;
	double min_pressure = 0.0;
	double max_adc = 0x3FFF;
	int32_t pressure_raw = ((adc_val - 0x2000)*1034)/0x2000;

	LOG_INF("abp_sample_fetch: spi_read, adc = %d", pressure_raw);
	return 0;
}

static const struct sensor_driver_api abp_api = {
	.sample_fetch = abp_sample_fetch};

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
