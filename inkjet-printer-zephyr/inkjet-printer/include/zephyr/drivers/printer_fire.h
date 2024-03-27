
#ifndef ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_
#define ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_

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

    typedef int (*printer_fire_request_fire_t)(const struct device *dev);
    typedef int (*printer_fire_set_light_timing_t)(const struct device *dev, uint32_t delay, uint32_t duration);

    __subsystem struct printer_fire_api
    {
        printer_fire_request_fire_t request_fire;
        printer_fire_set_light_timing_t set_light_timing;
    };

    __syscall int printer_fire_request_fire(const struct device *dev)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->request_fire(dev);
    }

    __syscall int printer_fire_set_light_timing(const struct device *dev, uint32_t delay, uint32_t duration)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->set_light_timing(dev, delay, duration);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_ */
