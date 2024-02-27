#include <zephyr/kernel.h>
#include <zephyr/drivers/printer.h>
#include <zephyr/drivers/printer_fire.h>
#include <app_version.h>
#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/sys/util.h>
#include <zephyr/sys/printk.h>
#include <inttypes.h>
#include <zephyr/logging/log.h>
#include <zephyr/shell/shell.h>
#include <zephyr/console/console.h>
#include <stdlib.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/motor.h>

#include "pressure_control.h"
#include "printhead_routines.h"
#include "printer_system_smf.h"

LOG_MODULE_REGISTER(main, CONFIG_APP_LOG_LEVEL);
#define SW0_NODE DT_ALIAS(sw0)
#if !DT_NODE_HAS_STATUS(SW0_NODE, okay)
#error "Unsupported board: sw0 devicetree alias is not defined"
#endif

static const struct gpio_dt_spec button = GPIO_DT_SPEC_GET_OR(SW0_NODE, gpios,
															  {0});
static struct gpio_callback button_cb_data;

static const struct gpio_dt_spec vpp_en = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_en), gpios);
static const struct gpio_dt_spec comm_enable = GPIO_DT_SPEC_GET(DT_NODELABEL(comm_enable), gpios);
static const struct gpio_dt_spec n_reset_mcu = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_mcu), gpios);
static const struct gpio_dt_spec vpp_enable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_enable_cp), gpios);
static const struct gpio_dt_spec reset_disable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(reset_disable_cp), gpios);

static const struct gpio_dt_spec n_reset_fault = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_fault), gpios);
static const struct gpio_dt_spec n_reset_in = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_in), gpios);

static struct gpio_dt_spec nSS2 = GPIO_DT_SPEC_GET(DT_NODELABEL(nss2), gpios);
static struct gpio_dt_spec nSS1 = GPIO_DT_SPEC_GET(DT_NODELABEL(nss1), gpios);
static struct gpio_dt_spec PHO = GPIO_DT_SPEC_GET(DT_NODELABEL(pho), gpios);

static struct gpio_dt_spec nFAULT = GPIO_DT_SPEC_GET(DT_NODELABEL(nfault), gpios);
static struct gpio_dt_spec READY = GPIO_DT_SPEC_GET(DT_NODELABEL(ready), gpios);

static struct gpio_callback n_reset_fault_cb_data;
static struct gpio_callback n_reset_in_cb_data;

static struct gpio_callback nFAULT_cb_data;
static struct gpio_callback READY_cb_data;

void pressure_debug_timer_handler(struct k_timer *timer)
{
	double pressure = get_pressure();
	printk("Pressure: %f mbar\n", pressure);
}

K_TIMER_DEFINE(pressure_debug_timer, pressure_debug_timer_handler, NULL);

#define ERROR_EVENT_ABORT_GRACEFULLY (0x1)
#define ERROR_EVENT_ABORT_IMMEDIATELY (0x2)

K_EVENT_DEFINE(error_event);

K_EVENT_DEFINE(btn_event);

void button_pressed(const struct device *dev, struct gpio_callback *cb,
					uint32_t pins)
{
	// printk("Button pressed at %" PRIu32 "\n", k_cycle_get_32());
	// const struct device *fire_dev;
	// fire_dev = DEVICE_DT_GET(DT_NODELABEL(printer_fire));
	// // printer_fire(fire_dev);
	k_event_post(&btn_event, 0x1);
	k_event_post(&error_event, ERROR_EVENT_ABORT_GRACEFULLY);
}

void n_reset_fault_changed(const struct device *dev, struct gpio_callback *cb,
						   uint32_t pins)
{
	LOG_INF("n_reset_fault changed to %d", gpio_pin_get_dt(&n_reset_fault));
}

void n_reset_in_changed(const struct device *dev, struct gpio_callback *cb,
						uint32_t pins)
{
	LOG_INF("n_reset_in changed to %d", gpio_pin_get_dt(&n_reset_in));
}

void nFault_int_handler(const struct device *dev, struct gpio_callback *cb,
						uint32_t pins)
{
	int nFaultState = gpio_pin_get_dt(&nFAULT);
	LOG_INF("nFault changed to %d", nFaultState);
	if (nFaultState == 1)
	{
		k_event_post(&error_event, ERROR_EVENT_ABORT_IMMEDIATELY);
	}
}

void READY_int_handler(const struct device *dev, struct gpio_callback *cb,
					   uint32_t pins)
{
	LOG_INF("READY changed to %d", gpio_pin_get_dt(&READY));
}

static int printhead_io_init()
{
	int ret;
	if (!gpio_is_ready_dt(&nSS2))
	{
		LOG_ERR("Error: nSS2 device %s is not ready\n",
				nSS2.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&nSS2, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, nSS2.port->name, nSS2.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&nSS1))
	{
		LOG_ERR("Error: nSS1 device %s is not ready\n",
				nSS1.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&nSS1, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, nSS1.port->name, nSS1.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&PHO))
	{
		LOG_ERR("Error: PHO device %s is not ready\n",
				PHO.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&PHO, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, PHO.port->name, PHO.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&nFAULT))
	{
		LOG_ERR("Error: nFAULT device %s is not ready\n",
				nFAULT.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&nFAULT, GPIO_INPUT);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, nFAULT.port->name, nFAULT.pin);
		return ret;
	}
	ret = gpio_pin_interrupt_configure_dt(&nFAULT,
										  GPIO_INT_EDGE_BOTH);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
				ret, nFAULT.port->name, nFAULT.pin);
		return ret;
	}
	gpio_init_callback(&nFAULT_cb_data, nFault_int_handler, BIT(nFAULT.pin));
	ret = gpio_add_callback(nFAULT.port, &nFAULT_cb_data);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
				ret, nFAULT.port->name, nFAULT.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&READY))
	{
		LOG_ERR("Error: READY device %s is not ready\n",
				READY.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&READY, GPIO_INPUT);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, READY.port->name, READY.pin);
		return ret;
	}
	ret = gpio_pin_interrupt_configure_dt(&READY,
										  GPIO_INT_EDGE_BOTH);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
				ret, READY.port->name, READY.pin);
		return ret;
	}
	gpio_init_callback(&READY_cb_data, READY_int_handler, BIT(READY.pin));
	ret = gpio_add_callback(READY.port, &READY_cb_data);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
				ret, READY.port->name, READY.pin);
		return ret;
	}
	return 0;
}

int initialize_io()
{
	int ret;
	ret = printhead_io_init();
	if (ret != 0)
	{
		return ret;
	}
	if (!gpio_is_ready_dt(&vpp_en))
	{
		LOG_ERR("Error: vpp_en device %s is not ready\n",
				vpp_en.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&vpp_en, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, vpp_en.port->name, vpp_en.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&comm_enable))
	{
		LOG_ERR("Error: comm_enable device %s is not ready\n",
				comm_enable.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&comm_enable, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, comm_enable.port->name, comm_enable.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&n_reset_mcu))
	{
		LOG_ERR("Error: n_reset_mcu device %s is not ready\n",
				n_reset_mcu.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&n_reset_mcu, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, n_reset_mcu.port->name, n_reset_mcu.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&vpp_enable_cp))
	{
		LOG_ERR("Error: vpp_enable_cp device %s is not ready\n",
				vpp_enable_cp.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&vpp_enable_cp, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, vpp_enable_cp.port->name, vpp_enable_cp.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&reset_disable_cp))
	{
		LOG_ERR("Error: reset_disable_cp device %s is not ready\n",
				reset_disable_cp.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&reset_disable_cp, GPIO_OUTPUT_INACTIVE);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, reset_disable_cp.port->name, reset_disable_cp.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&n_reset_fault))
	{
		LOG_ERR("Error: n_reset_fault device %s is not ready\n",
				n_reset_fault.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&n_reset_fault, GPIO_INPUT);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, n_reset_fault.port->name, n_reset_fault.pin);
		return ret;
	}
	ret = gpio_pin_interrupt_configure_dt(&n_reset_fault,
										  GPIO_INT_EDGE_BOTH);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
				ret, n_reset_fault.port->name, n_reset_fault.pin);
		return ret;
	}
	gpio_init_callback(&n_reset_fault_cb_data, n_reset_fault_changed, BIT(n_reset_fault.pin));
	ret = gpio_add_callback(n_reset_fault.port, &n_reset_fault_cb_data);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
				ret, n_reset_fault.port->name, n_reset_fault.pin);
		return ret;
	}
	if (!gpio_is_ready_dt(&n_reset_in))
	{
		LOG_ERR("Error: n_reset_in device %s is not ready\n",
				n_reset_in.port->name);
		return ENODEV;
	}
	ret = gpio_pin_configure_dt(&n_reset_in, GPIO_INPUT);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure %s pin %d\n",
				ret, n_reset_in.port->name, n_reset_in.pin);
		return ret;
	}
	ret = gpio_pin_interrupt_configure_dt(&n_reset_in,
										  GPIO_INT_EDGE_BOTH);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
				ret, n_reset_in.port->name, n_reset_in.pin);
		return ret;
	}
	gpio_init_callback(&n_reset_in_cb_data, n_reset_in_changed, BIT(n_reset_in.pin));
	ret = gpio_add_callback(n_reset_in.port, &n_reset_in_cb_data);
	if (ret != 0)
	{
		LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
				ret, n_reset_in.port->name, n_reset_in.pin);
		return ret;
	}
	return 0;
}

static int shell_wait(const struct shell *sh)
{
	int32_t events;
	shell_print(sh, "Press button to continue.");
	k_event_clear(&btn_event, 0x1);
	events = k_event_wait_all(&btn_event, 0x1, false, K_SECONDS(20));
	if (events == 0)
	{
		shell_print(sh, "Timeout");
		return ETIMEDOUT;
	}
	return 0;
}

static int cmd_test_hv_supply(const struct shell *sh, size_t argc, char **argv)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);

	shell_print(sh, "Disconnect HV supply, discharge capacitor, confirm 0V on printhead connector VPPH and VPPL.");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	shell_print(sh, "Connect HV supply, confirm 0V on printhead connector VPPH and VPPL.");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	gpio_pin_set_dt(&vpp_en, 1);
	shell_print(sh, "Confirm again 0V on VPPH and VPPL.");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	gpio_pin_set_dt(&vpp_enable_cp, 1);
	k_sleep(K_MSEC(1));
	gpio_pin_set_dt(&vpp_enable_cp, 0);
	shell_print(sh, "Confirm VPPH and VPPL active.");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	gpio_pin_set_dt(&vpp_en, 0);
	shell_print(sh, "Confirm again 0V on VPPH and VPPL.");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	shell_print(sh, "done");
	return 0;
}

static int cmd_test_printhead_io(const struct shell *sh, size_t argc, char **argv)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);

	gpio_pin_set_dt(&nSS2, 1);
	gpio_pin_set_dt(&nSS1, 1);
	gpio_pin_set_dt(&PHO, 0);
	gpio_pin_set_dt(&comm_enable, 1);
	shell_print(sh, "Connect nSS2 to READY");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	if (gpio_pin_get_dt(&READY) != 0)
	{
		shell_print(sh, "READY is not low");
		return EINVAL;
	}
	gpio_pin_set_dt(&nSS2, 0);
	k_sleep(K_MSEC(1));
	if (gpio_pin_get_dt(&READY) != 1)
	{
		shell_print(sh, "READY is not high");
		return EINVAL;
	}
	gpio_pin_set_dt(&nSS2, 1);
	shell_print(sh, "Connect nSS1 to READY");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	if (gpio_pin_get_dt(&READY) != 0)
	{
		shell_print(sh, "READY is not low");
		return EINVAL;
	}
	gpio_pin_set_dt(&nSS1, 0);
	k_sleep(K_MSEC(1));
	if (gpio_pin_get_dt(&READY) != 1)
	{
		shell_print(sh, "READY is not high");
		return EINVAL;
	}
	gpio_pin_set_dt(&nSS1, 1);
	shell_print(sh, "Connect PHO to nFAULT");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	if (gpio_pin_get_dt(&nFAULT) != 0)
	{
		shell_print(sh, "nFAULT is not low");
		return EINVAL;
	}
	gpio_pin_set_dt(&PHO, 1);
	k_sleep(K_MSEC(1));
	if (gpio_pin_get_dt(&nFAULT) != 1)
	{
		shell_print(sh, "nFAULT is not high");
		return EINVAL;
	}
	gpio_pin_set_dt(&PHO, 0);
	shell_print(sh, "done");
	return 0;
}

static int cmd_test_other_io(const struct shell *sh, size_t argc, char **argv)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	gpio_pin_set_dt(&comm_enable, 0);
	shell_print(sh, "Connect COMM_ENABLE to nRESET_FAULT");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	if (gpio_pin_get_dt(&n_reset_fault) != 0)
	{
		shell_print(sh, "nRESET_FAULT is not low");
		return EINVAL;
	}
	gpio_pin_set_dt(&comm_enable, 1);
	k_sleep(K_MSEC(1));
	if (gpio_pin_get_dt(&n_reset_fault) != 1)
	{
		shell_print(sh, "nRESET_FAULT is not high");
		return EINVAL;
	}
	gpio_pin_set_dt(&comm_enable, 0);
	shell_print(sh, "Connect COMM_ENABLE to nRESET_IN");
	if (shell_wait(sh) == ETIMEDOUT)
	{
		return ETIMEDOUT;
	}
	if (gpio_pin_get_dt(&n_reset_in) != 0)
	{
		shell_print(sh, "nRESET_IN is not low");
		return EINVAL;
	}
	gpio_pin_set_dt(&comm_enable, 1);
	k_sleep(K_MSEC(1));
	if (gpio_pin_get_dt(&n_reset_in) != 1)
	{
		shell_print(sh, "nRESET_IN is not high");
		return EINVAL;
	}
	gpio_pin_set_dt(&comm_enable, 0);
	shell_print(sh, "done");
	return 0;
}

static int cmd_set_pixels(const struct shell *sh, size_t argc, char **argv)
{
	if (argc != 5)
	{
		shell_print(sh, "Usage: set_pixels <pixels1> <pixels2> <pixels3> <pixels4>");
		return EINVAL;
	}
	uint32_t pixels[4] = {(uint32_t)strtoll(argv[1], NULL, 16), (uint32_t)strtoll(argv[2], NULL, 16), (uint32_t)strtoll(argv[3], NULL, 16), (uint32_t)strtoll(argv[4], NULL, 16)};
	shell_print(sh, "Setting pixels to %d %d %d %d", pixels[0], pixels[1], pixels[2], pixels[3]);
	k_sleep(K_SECONDS(1));
	const struct device *printhead;
	printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));

	return printer_set_pixels(printhead, pixels);
}

static int cmd_comm_enable(const struct shell *sh, size_t argc, char **argv)
{
	if (argc != 2)
	{
		shell_print(sh, "Usage: comm_enable <0|1>");
		return EINVAL;
	}
	int value = atoi(argv[1]);
	if (value != 0 && value != 1)
	{
		shell_print(sh, "Usage: comm_enable <0|1>");
		return EINVAL;
	}
	gpio_pin_set_dt(&comm_enable, value);
	return 0;
}

static int cmd_pressure_control_enable(const struct shell *sh, size_t argc, char **argv, void *data)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	bool enable = (bool)data;
	pressure_control_enable(enable);
	return 0;
}

SHELL_SUBCMD_DICT_SET_CREATE(pressure_control_enable_cmds, cmd_pressure_control_enable,
							 (enable, true, "enable"), (disable, false, "disable"));

static int cmd_pressure_contol_set_target_pressure(const struct shell *sh, size_t argc, char **argv)
{
	if (argc != 2)
	{
		shell_print(sh, "Usage: pressure_control_set_target_pressure <pressure>");
		return EINVAL;
	}
	float pressure = atof(argv[1]);
	pressure_control_set_target_pressure(pressure);
	return 0;
}

static int cmd_pressure_control_print_pressure(const struct shell *sh, size_t argc, char **argv, void *data)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	bool enable = (bool)data;
	if (enable)
	{
		k_timer_start(&pressure_debug_timer, K_SECONDS(1), K_SECONDS(1));
	}
	else
	{
		k_timer_stop(&pressure_debug_timer);
	}
	return 0;
}

SHELL_SUBCMD_DICT_SET_CREATE(pressure_control_print_pressure_cmds, cmd_pressure_control_print_pressure,
							 (enable, true, "enable"), (disable, false, "disable"));

static int cmd_pressure_control_calibrate_zero_pressure(const struct shell *sh, size_t argc, char **argv)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	return calibrate_zero_pressure();
}

float speed;
motor_action_t action;

static int cmd_test_pump(const struct shell *sh, size_t argc, char **argv, void *data)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	// if (argc != 3)
	// {
	// 	shell_print(sh, "Usage: pump_motor <cw|ccw|brk|stop> <pwm>");
	// 	return EINVAL;
	// }

	const struct device *pump;
	pump = DEVICE_DT_GET(DT_NODELABEL(pump_motor));
	if (!device_is_ready(pump))
	{
		LOG_ERR("Pump not ready");
		return 0;
	}
	action = (motor_action_t)data;
	shell_print(sh, "Setting pump motor to %d at %f", action, (double)speed);
	motor_set_action(pump, action, speed);
	return 0;
}

static int cmd_test_pump_speed(const struct shell *sh, size_t argc, char **argv)
{
	ARG_UNUSED(argc);
	ARG_UNUSED(argv);
	if (argc != 2)
	{
		shell_print(sh, "Usage: pump_motor_speed <pwm>");
		return EINVAL;
	}
	speed = atof(argv[1]);
	shell_print(sh, "Setting pump motor to %d at %f", action, (double)speed);
	const struct device *pump;
	pump = DEVICE_DT_GET(DT_NODELABEL(pump_motor));
	if (!device_is_ready(pump))
	{
		LOG_ERR("Pump not ready");
		return 0;
	}
	motor_set_action(pump, action, speed);
	return 0;
}

SHELL_SUBCMD_DICT_SET_CREATE(pump_motor_cmds, cmd_test_pump,
							 (cw, MOTOR_ACTION_CW, "clockwise"), (ccw, MOTOR_ACTION_CCW, "counter clockwise"),
							 (brk, MOTOR_ACTION_SHORT_BRAKE, "brake"), (stop, MOTOR_ACTION_STOP, "stop"));

SHELL_STATIC_SUBCMD_SET_CREATE(sub_test,
							   SHELL_CMD(hv_supply, NULL, "Test HV supply", cmd_test_hv_supply),
							   SHELL_CMD(printhead_io, NULL, "Test printhead IO", cmd_test_printhead_io),
							   SHELL_CMD(other_io, NULL, "Test other IO", cmd_test_other_io),
							   SHELL_CMD(set_pixels, NULL, "Set pixels", cmd_set_pixels),
							   SHELL_CMD(comm_enable, NULL, "Set COMM_ENABLE", cmd_comm_enable),
							   SHELL_CMD(pressure_control_enable, &pressure_control_enable_cmds, "Enable/disable pressure control", NULL),
							   SHELL_CMD(pressure_control_set_target_pressure, NULL, "Set target pressure", cmd_pressure_contol_set_target_pressure),
							   SHELL_CMD(pressure_control_print_pressure, &pressure_control_print_pressure_cmds, "Print pressure", NULL),
							   SHELL_CMD(pressure_control_calibrate_zero_pressure, NULL, "Calibrate zero pressure", cmd_pressure_control_calibrate_zero_pressure),
							   SHELL_CMD(pump_motor, &pump_motor_cmds, "Test pump motor", cmd_test_pump),
							   SHELL_CMD(pump_motor_speed, NULL, "Set pump motor speed", cmd_test_pump_speed),
							   SHELL_SUBCMD_SET_END);
SHELL_CMD_REGISTER(test, &sub_test, "Test commands", NULL);

int main(void)
{
	int ret;
	ret = initialize_io();
	if (ret != 0)
	{
		return ret;
	}

	if (!gpio_is_ready_dt(&button))
	{
		printk("Error: button device %s is not ready\n",
			   button.port->name);
		return 0;
	}

	ret = gpio_pin_configure_dt(&button, GPIO_INPUT);
	if (ret != 0)
	{
		printk("Error %d: failed to configure %s pin %d\n",
			   ret, button.port->name, button.pin);
		return 0;
	}

	ret = gpio_pin_interrupt_configure_dt(&button,
										  GPIO_INT_EDGE_TO_ACTIVE);
	if (ret != 0)
	{
		printk("Error %d: failed to configure interrupt on %s pin %d\n",
			   ret, button.port->name, button.pin);
		return 0;
	}

	gpio_init_callback(&button_cb_data, button_pressed, BIT(button.pin));
	gpio_add_callback(button.port, &button_cb_data);
	printk("Set up button at %s pin %d\n", button.port->name, button.pin);

	printk("Zephyr Example Application %s\n", APP_VERSION_STRING);
	const struct device *printhead;

	printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));

	if (!device_is_ready(printhead))
	{
		LOG_ERR("Printhead not ready");
		return 0;
	}
	ret = printer_system_smf();
	if (ret != 0)
	{
		LOG_ERR("Printer system SMF should never terminate");
		return ret;
	}
	return 0;
}
