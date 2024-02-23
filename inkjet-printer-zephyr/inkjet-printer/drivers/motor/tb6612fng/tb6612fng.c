#define DT_DRV_COMPAT toshiba_tb6612fng

#include <zephyr/device.h>
#include <zephyr/drivers/motor.h>
#include <zephyr/drivers/pwm.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(tb6612fng, CONFIG_MOTOR_LOG_LEVEL);

struct tb6612fng_data
{
};

struct tb6612fng_config
{
	struct gpio_dt_spec in1_gpio;
	struct gpio_dt_spec in2_gpio;
	const struct pwm_dt_spec pwm_dt;
};

static int tb6612fng_set_action(const struct device *dev, motor_action_t action, float speed)
{
	const struct tb6612fng_config *config = dev->config;
	int nextIn1 = 0;
	int nextIn2 = 0;
	switch (action)
	{
	case MOTOR_ACTION_CW:
		nextIn1 = 1;
		nextIn2 = 0;
		break;
	case MOTOR_ACTION_CCW:
		nextIn1 = 0;
		nextIn2 = 1;
		break;
	case MOTOR_ACTION_STOP:
		nextIn1 = 0;
		nextIn2 = 0;
		break;
	case MOTOR_ACTION_SHORT_BRAKE:
		nextIn1 = 1;
		nextIn2 = 1;
		break;
	}
	gpio_pin_set_dt(&config->in1_gpio, nextIn1);
	gpio_pin_set_dt(&config->in2_gpio, nextIn2);
	uint32_t period = config->pwm_dt.period;
	uint32_t pulse = speed * period;
	pwm_set_dt(&config->pwm_dt, period, pulse);
	return 0;
}

static const struct motor_api tb6612fng_api = {
	.set_action = &tb6612fng_set_action};

static int tb6612fng_init(const struct device *dev)
{
	const struct tb6612fng_config *config = dev->config;
	// struct tb6612fng_data *data = dev->data;

	if (!device_is_ready(config->pwm_dt.dev))
	{
		LOG_ERR("PWM device %s is not ready\n",
				config->pwm_dt.dev->name);
		return -ENODEV;
	}
	if (!gpio_is_ready_dt(&config->in1_gpio))
	{
		LOG_ERR("Error: in1_gpio device %s is not ready\n",
				config->in1_gpio.port->name);
		return -ENODEV;
	}
	int ret;
	ret = gpio_pin_configure_dt(&config->in1_gpio, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, config->in1_gpio.port->name, config->in1_gpio.pin);
		return ret;
	}

	if (!gpio_is_ready_dt(&config->in2_gpio))
	{
		LOG_ERR("Error: in2_gpio device %s is not ready\n",
				config->in2_gpio.port->name);
		return -ENODEV;
	}
	ret = gpio_pin_configure_dt(&config->in2_gpio, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, config->in2_gpio.port->name, config->in2_gpio.pin);
		return ret;
	}
	return 0;
}

#define tb6612fng_INIT(i)                                         \
	static struct tb6612fng_data tb6612fng_data_##i;              \
                                                                  \
	static const struct tb6612fng_config tb6612fng_config_##i = { \
		.in1_gpio = GPIO_DT_SPEC_INST_GET(i, in1_gpios),          \
		.in2_gpio = GPIO_DT_SPEC_INST_GET(i, in2_gpios),          \
		.pwm_dt = PWM_DT_SPEC_INST_GET(i)};                       \
                                                                  \
	DEVICE_DT_INST_DEFINE(i, tb6612fng_init, NULL,                \
						  &tb6612fng_data_##i,                    \
						  &tb6612fng_config_##i, POST_KERNEL,     \
						  CONFIG_PRINTER_INIT_PRIORITY, &tb6612fng_api);

DT_INST_FOREACH_STATUS_OKAY(tb6612fng_INIT)
