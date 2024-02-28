#define DT_DRV_COMPAT xaar_xaar128

#include <zephyr/device.h>
#include <zephyr/drivers/spi.h>
#include <zephyr/drivers/printer.h>
#include <zephyr/drivers/clock_control.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(xaar128, CONFIG_PRINTER_LOG_LEVEL);

struct xaar128_data
{
	int state;
};

struct xaar128_config
{
	// struct gpio_dt_spec input;
	struct gpio_dt_spec nss1_gpio;
	struct gpio_dt_spec nss2_gpio;
	const struct device *clk_dev;
	uint8_t clk_id;
	struct spi_dt_spec bus;
};

static int xaar128_sample_function(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	// struct xaar128_data *data = dev->data;

	// data->state = gpio_pin_get_dt(&config->input);

	if (config->clk_dev != NULL)
	{
		uint32_t clk_id = config->clk_id;

		if (!device_is_ready(config->clk_dev))
		{
			LOG_ERR("Clock controller not ready");
			return -ENODEV;
		}

		int ret = clock_control_on(config->clk_dev, (clock_control_subsys_t)clk_id);
		if (ret < 0)
		{
			LOG_ERR("Failed to enable clock [%d]", ret);
			return ret;
		}
		else
		{
			LOG_INF("Clock enabled");
		}
	}

	return 0;
}

static int xaar128_set_pixels(const struct device *dev, uint32_t *pixels)
{
	LOG_INF("xaar128_set_pixels");
	const struct xaar128_config *config = dev->config;
	struct spi_cs_control cs = {
		.delay = 0};
	cs.gpio.dt_flags = config->nss2_gpio.dt_flags;
	cs.gpio.port = config->nss2_gpio.port;
	cs.gpio.pin = config->nss2_gpio.pin;

	struct spi_buf buf = {
		.buf = &pixels[2],
		.len = sizeof(uint32_t) * 2,
	};
	struct spi_buf_set tx = {
		.buffers = &buf,
		.count = 1,
	};
	struct spi_config spi_config;
	memcpy(&spi_config, &config->bus.config, sizeof(spi_config));
	spi_config.cs = cs;
	LOG_INF("xaar128_set_pixels: spi_write 1");
	int ret = spi_write(config->bus.bus, &spi_config, &tx);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to write to SPI device %s",
				ret, config->bus.bus->name);
		return ret;
	}
	cs.gpio.dt_flags = config->nss1_gpio.dt_flags;
	cs.gpio.port = config->nss1_gpio.port;
	cs.gpio.pin = config->nss1_gpio.pin;
	spi_config.cs = cs;
	buf.buf = pixels;
	ret = spi_write(config->bus.bus, &spi_config, &tx);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to write to SPI device %s",
				ret, config->bus.bus->name);
		return ret;
	}
	return 0;
}

static const struct printer_driver_api xaar128_api = {
	.sample_function = &xaar128_sample_function,
	.set_pixels = &xaar128_set_pixels,
};

static int xaar128_init(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	// struct xaar128_data *data = dev->data;

	if (!spi_is_ready_dt(&config->bus))
	{
		LOG_ERR("SPI bus %s not ready", config->bus.bus->name);
		return -ENODEV;
	}
	if (!gpio_is_ready_dt(&config->nss1_gpio))
	{
		LOG_ERR("Error: nss1_gpio device %s is not ready\n",
				config->nss1_gpio.port->name);
		return -ENODEV;
	}
	int ret;
	ret = gpio_pin_configure_dt(&config->nss1_gpio, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, config->nss1_gpio.port->name, config->nss1_gpio.pin);
		return ret;
	}

	if (!gpio_is_ready_dt(&config->nss2_gpio))
	{
		LOG_ERR("Error: nss2_gpio device %s is not ready\n",
				config->nss2_gpio.port->name);
		return -ENODEV;
	}
	ret = gpio_pin_configure_dt(&config->nss2_gpio, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, config->nss2_gpio.port->name, config->nss2_gpio.pin);
		return ret;
	}
	// if (!device_is_ready(config->input.port)) {
	// 	LOG_ERR("Input GPIO not ready");
	// 	return -ENODEV;
	// }

	// ret = gpio_pin_configure_dt(&config->input, GPIO_INPUT);
	// if (ret < 0) {
	// 	LOG_ERR("Could not configure input GPIO (%d)", ret);
	// 	return ret;
	// }

	return 0;
}

#define XAAR128_INIT(i)                                       \
	static struct xaar128_data xaar128_data_##i;              \
                                                              \
	static const struct xaar128_config xaar128_config_##i = { \
		.bus = SPI_DT_SPEC_INST_GET(i,                        \
									SPI_OP_MODE_MASTER |      \
										SPI_WORD_SET(8) |     \
										SPI_MODE_CPOL |       \
										SPI_MODE_CPHA,        \
									0),                       \
		.nss1_gpio = GPIO_DT_SPEC_INST_GET(i, nss1_gpios),    \
		.nss2_gpio = GPIO_DT_SPEC_INST_GET(i, nss2_gpios),    \
		.clk_dev = DEVICE_DT_GET(DT_INST_CLOCKS_CTLR(i)),     \
		.clk_id = DT_INST_CLOCKS_CELL(i, id)};                \
                                                              \
	DEVICE_DT_INST_DEFINE(i, xaar128_init, NULL,              \
						  &xaar128_data_##i,                  \
						  &xaar128_config_##i, POST_KERNEL,   \
						  CONFIG_PRINTER_INIT_PRIORITY, &xaar128_api);

DT_INST_FOREACH_STATUS_OKAY(XAAR128_INIT)
