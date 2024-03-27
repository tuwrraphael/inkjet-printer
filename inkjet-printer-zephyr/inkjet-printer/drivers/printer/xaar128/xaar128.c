#define DT_DRV_COMPAT xaar_xaar128

#include <zephyr/device.h>
#include <zephyr/drivers/spi.h>
#include <zephyr/drivers/printer.h>
#include <zephyr/drivers/printer_fire.h>
#include <zephyr/drivers/pwm.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(xaar128, CONFIG_PRINTER_LOG_LEVEL);

struct xaar128_data
{
	const struct device *dev;
	bool ready;
	struct gpio_callback ready_cb_data;
	struct k_sem rts_sem;
};

struct xaar128_config
{
	struct gpio_dt_spec nss1_gpio;
	struct gpio_dt_spec nss2_gpio;
	struct gpio_dt_spec ready_gpio;
	const struct pwm_dt_spec pwm_dt;
	const struct spi_dt_spec bus;
	const struct device *printer_fire;
};

void ready_int_handler(const struct device *dev, struct gpio_callback *cb,
					   uint32_t pins)
{
	struct xaar128_data *data = CONTAINER_OF(cb, struct xaar128_data, ready_cb_data);
	const struct xaar128_config *config = dev->config;
	data->ready = gpio_pin_get_dt(&config->ready_gpio);
	if (data->ready == false)
	{
		k_sem_give(&data->rts_sem);
	}
}

static int clock_control_pwm_on(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	const struct pwm_dt_spec *spec = &config->pwm_dt;
	return pwm_set_dt(spec, spec->period, spec->period / 2);
}

static int xaar128_clock_enable(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;

	if (!device_is_ready(config->pwm_dt.dev))
	{
		return -ENODEV;
	}

	int ret = clock_control_pwm_on(dev);
	if (ret < 0)
	{
		LOG_ERR("Failed to enable clock [%d]", ret);
		return ret;
	}
	else
	{
		LOG_INF("Clock enabled");
	}

	return 0;
}

static int xaar128_set_pixels(const struct device *dev, uint32_t *pixels)
{
	struct xaar128_data *data = dev->data;
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
	k_sem_reset(&data->rts_sem);
	return 0;
}

static int xaar128_request_fire(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	const struct xaar128_data *data = dev->data;
	if (!data->ready)
	{
		return -EBUSY;
	}
	return printer_fire_request_fire(config->printer_fire);
}

static int xaar128_wait_rts(const struct device *dev, k_timeout_t timeout)
{
	struct xaar128_data *data = dev->data;
	int ret = k_sem_take(&data->rts_sem, timeout);
	return ret;
}

static const struct printer_driver_api xaar128_api = {
	.clock_enable = &xaar128_clock_enable,
	.set_pixels = &xaar128_set_pixels,
	.request_fire = &xaar128_request_fire,
	.wait_rts = &xaar128_wait_rts};

static int xaar128_init(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	struct xaar128_data *data = dev->data;

	k_sem_init(&data->rts_sem, 1, 1);

	data->dev = dev;
	if (!device_is_ready(config->printer_fire))
	{
		LOG_ERR("Printer fire device %s not ready", config->printer_fire->name);
		return -ENODEV;
	}
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
	if (!gpio_is_ready_dt(&config->ready_gpio))
	{
		LOG_ERR("Error: ready_gpio device %s is not ready\n",
				config->ready_gpio.port->name);
		return -ENODEV;
	}
	ret = gpio_pin_configure_dt(&config->ready_gpio, GPIO_INPUT);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, config->ready_gpio.port->name, config->ready_gpio.pin);
		return ret;
	}
	ret = gpio_pin_interrupt_configure_dt(&config->ready_gpio,
										  GPIO_INT_EDGE_BOTH);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
				ret, config->ready_gpio.port->name, config->ready_gpio.pin);
		return ret;
	}
	gpio_init_callback(&data->ready_cb_data, ready_int_handler, BIT(config->ready_gpio.pin));
	ret = gpio_add_callback(config->ready_gpio.port, &data->ready_cb_data);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
				ret, config->ready_gpio.port->name, config->ready_gpio.pin);
		return ret;
	}
	data->ready = gpio_pin_get_dt(&config->ready_gpio);
	return 0;
}

#define XAAR128_INIT(i)                                                                      \
	static struct xaar128_data xaar128_data_##i;                                             \
                                                                                             \
	static const struct xaar128_config xaar128_config_##i = {                                \
		.bus = SPI_DT_SPEC_INST_GET(i,                                                       \
									SPI_OP_MODE_MASTER |                                     \
										SPI_WORD_SET(8) |                                    \
										SPI_MODE_CPOL |                                      \
										SPI_MODE_CPHA |                                      \
										SPI_TRANSFER_LSB,                                    \
									0),                                                      \
		.nss1_gpio = GPIO_DT_SPEC_INST_GET(i, nss1_gpios),                                   \
		.nss2_gpio = GPIO_DT_SPEC_INST_GET(i, nss2_gpios),                                   \
		.ready_gpio = GPIO_DT_SPEC_INST_GET(i, ready_gpios),                                 \
		.pwm_dt = PWM_DT_SPEC_INST_GET(i),                                                   \
		.printer_fire = DEVICE_DT_GET(DT_PHANDLE_BY_IDX(DT_DRV_INST(i), printer_fires, 0))}; \
                                                                                             \
	DEVICE_DT_INST_DEFINE(i, xaar128_init, NULL,                                             \
						  &xaar128_data_##i,                                                 \
						  &xaar128_config_##i, POST_KERNEL,                                  \
						  CONFIG_PRINTER_INIT_PRIORITY, &xaar128_api);

DT_INST_FOREACH_STATUS_OKAY(XAAR128_INIT)
