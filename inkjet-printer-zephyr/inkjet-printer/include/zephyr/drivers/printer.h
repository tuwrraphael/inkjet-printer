
#ifndef ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_
#define ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_
#include <zephyr/device.h>
#include <zephyr/kernel.h>

#ifdef __cplusplus
extern "C"
{
#endif

    typedef int (*printer_clock_enable_t)(const struct device *dev);
    typedef int (*printer_set_pixels_t)(const struct device *dev, uint32_t *pixels);
    typedef int (*printer_request_fire_t)(const struct device *dev);
    typedef int (*printer_wait_rts_t)(const struct device *dev, k_timeout_t timeout);


    __subsystem struct printer_driver_api
    {
        printer_clock_enable_t clock_enable;
        printer_set_pixels_t set_pixels;
        printer_request_fire_t request_fire;
        printer_wait_rts_t wait_rts;
    };

    static inline int printer_clock_enable(const struct device *dev)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->clock_enable(dev);
    }

    static inline int printer_set_pixels(const struct device *dev, uint32_t *pixels)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->set_pixels(dev, pixels);
    }

    static inline int printer_request_fire(const struct device *dev)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->request_fire(dev);
    }

    static inline int printer_wait_rts(const struct device *dev, k_timeout_t timeout)
    {
        const struct printer_driver_api *api =
            (const struct printer_driver_api *)dev->api;

        return api->wait_rts(dev, timeout);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_H_ */
