
#ifndef ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_
#define ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_
#include <zephyr/device.h>

#ifdef __cplusplus
extern "C"
{
#endif

    typedef int (*printer_sample_function_t)(const struct device *dev);
    typedef int (*printer_set_pixels_t)(const struct device *dev, uint32_t *pixels);

    __subsystem struct printer_driver_api
    {
        printer_sample_function_t sample_function;
        printer_set_pixels_t set_pixels;
    };

    static inline int printer_sample_function(const struct device *dev)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->sample_function(dev);
    }

    static inline int printer_set_pixels(const struct device *dev, uint32_t *pixels)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->set_pixels(dev, pixels);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_ */
