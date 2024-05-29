
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

    typedef struct
    {
        void (*load_line_cb)(uint32_t line);
        uint32_t sequential_fires;
        uint32_t fire_every_ticks;
        uint32_t print_first_line_after_encoder_tick;
    } printer_fire_encoder_mode_init_t;

    typedef int (*printer_fire_request_fire_t)(const struct device *dev);
    typedef int (*printer_fire_set_light_timing_t)(const struct device *dev, uint32_t delay, uint32_t duration);
    typedef int (*printer_fire_manual_mode_t)(const struct device *dev);
    typedef int (*printer_fire_encoder_mode_t)(const struct device *dev, printer_fire_encoder_mode_init_t *init);

    __subsystem struct printer_fire_api
    {
        printer_fire_request_fire_t request_fire;
        printer_fire_set_light_timing_t set_light_timing;
        printer_fire_manual_mode_t manual_mode;
        printer_fire_encoder_mode_t encoder_mode;
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

    __syscall int printer_fire_manual_mode(const struct device *dev)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->manual_mode(dev);
    }

    __syscall int printer_fire_encoder_mode(const struct device *dev, printer_fire_encoder_mode_init_t *init)
    {
        const struct printer_fire_api *api =
            (const struct printer_fire_api *)dev->api;

        return api->encoder_mode(dev, init);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_PRINTER_FIRE_H_ */
