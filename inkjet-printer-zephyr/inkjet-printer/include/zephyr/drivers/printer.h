
#ifndef ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_
#define ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_

// #include <errno.h>
// #include <stdlib.h>

#include <zephyr/device.h>

// #include <zephyr/rtio/rtio.h>
// #include <zephyr/sys/iterable_sections.h>
// #include <zephyr/types.h>

#ifdef __cplusplus
extern "C"
{
#endif

    typedef int (*printer_sample_function_t)(const struct device *dev);

    __subsystem struct printer_driver_api
    {
        printer_sample_function_t sample_function;
    };

    __syscall int printer_sample_function(const struct device *dev) {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->sample_function(dev);
    }

//     static inline int z_impl_printer_sample_function(const struct device *dev)
// {
// 	const struct printer_driver_api *api =
// 		(const struct printer_driver_api *)dev->api;

// 	return api->sample_function(dev);
// }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_ */
