
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

    typedef enum
    {
        PRINTER_FIRE_TRIGGER_CLOCK,
        PRINTER_FIRE_TRIGGER_ENCODER
    } printer_fire_trigger_t;

    typedef int (*printer_fire_request_fire_t)(const struct device *dev);
    typedef int (*printer_fire_set_light_timing_t)(const struct device *dev, uint32_t delay, uint32_t duration);
    typedef int (*printer_fire_set_trigger_t)(const struct device *dev, printer_fire_trigger_t trigger);
    typedef int (*printer_fire_set_fire_issued_callback_t)(const struct device *dev, void (*callback)(void));
    typedef int (*printer_fire_set_trigger_callback_t)(const struct device *dev, void (*callback)(void));
    typedef int (*printer_fire_abort_t)(const struct device *dev);
    typedef int (*printer_fire_set_trigger_reset_t)(const struct device *dev, bool reset);

    __subsystem struct printer_fire_api
    {
        printer_fire_request_fire_t request_fire;
        printer_fire_set_light_timing_t set_light_timing;
        printer_fire_set_trigger_t set_trigger;
        printer_fire_set_fire_issued_callback_t set_fire_issued_callback;
        printer_fire_set_trigger_callback_t set_trigger_callback;
        printer_fire_abort_t abort;
        printer_fire_set_trigger_reset_t set_trigger_reset;
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

    __syscall int printer_fire_set_trigger(const struct device *dev, printer_fire_trigger_t trigger)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->set_trigger(dev, trigger);
    }

    __syscall int printer_fire_set_fire_issued_callback(const struct device *dev, void (*callback)(void))
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->set_fire_issued_callback(dev, callback);
    }

    __syscall int printer_fire_set_trigger_callback(const struct device *dev, void (*callback)(void))
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->set_trigger_callback(dev, callback);
    }

    __syscall int printer_fire_abort(const struct device *dev)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->abort(dev);
    }

    __syscall int printer_fire_set_trigger_reset(const struct device *dev, bool reset)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->set_trigger_reset(dev, reset);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_ */
