#include <zephyr/kernel.h>
#include <zephyr/drivers/printer.h>
#include <app_version.h>

#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(main, CONFIG_APP_LOG_LEVEL);

int main(void)
{
	int ret;
	printk("Zephyr Example Application %s\n", APP_VERSION_STRING);
	const struct device *printhead;

	printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
	if (!device_is_ready(printhead))
	{
		LOG_ERR("Printhead not ready");
		return 0;
	}

	printer_sample_function(printhead);

	while (1)
	{

		printk("Still there\n");

		k_sleep(K_MSEC(1000));
	}

	return 0;
}
