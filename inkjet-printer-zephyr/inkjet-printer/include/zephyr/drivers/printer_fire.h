
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

    typedef int (*printer_fire_t)(const struct device *dev);

    __subsystem struct printer_fire_api
    {
        printer_fire_t fire;
    };

    __syscall int printer_fire(const struct device *dev)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->fire(dev);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_ */
