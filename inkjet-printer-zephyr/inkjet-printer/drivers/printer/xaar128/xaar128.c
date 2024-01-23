/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 * SPDX-License-Identifier: Apache-2.0
 */

#define DT_DRV_COMPAT xaar_xaar128

#include <zephyr/device.h>
// #include <zephyr/drivers/gpio.h>
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
	const struct device *clk_dev;
	uint8_t clk_id;
};

static int xaar128_sample_function(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;
	struct xaar128_data *data = dev->data;

	// data->state = gpio_pin_get_dt(&config->input);

	if (config->clk_dev != NULL) {
		uint32_t clk_id = config->clk_id;

		if (!device_is_ready(config->clk_dev)) {
			LOG_ERR("Clock controller not ready");
			return -ENODEV;
		}

		int ret = clock_control_on(config->clk_dev, (clock_control_subsys_t)clk_id);
		if (ret < 0) {
			LOG_ERR("Failed to enable clock [%d]", ret);
			return ret;
		} else {
			LOG_INF("Clock enabled");
		}
	}

	return 0;
}

static const struct printer_driver_api xaar128_api = {
	.sample_function = &xaar128_sample_function};

static int xaar128_init(const struct device *dev)
{
	const struct xaar128_config *config = dev->config;

	int ret;

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
		.clk_dev = DEVICE_DT_GET(DT_INST_CLOCKS_CTLR(i)),  \
		.clk_id = DT_INST_CLOCKS_CELL(i, id)};             \
                                                              \
	DEVICE_DT_INST_DEFINE(i, xaar128_init, NULL,              \
						  &xaar128_data_##i,                  \
						  &xaar128_config_##i, POST_KERNEL,   \
						  CONFIG_PRINTER_INIT_PRIORITY, &xaar128_api);

DT_INST_FOREACH_STATUS_OKAY(XAAR128_INIT)
