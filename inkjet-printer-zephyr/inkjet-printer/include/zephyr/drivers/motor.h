
#ifndef ZEPHYR_INCLUDE_DRIVERS_MOTOR_H_
#define ZEPHYR_INCLUDE_DRIVERS_MOTOR_H_

#include <zephyr/device.h>

#ifdef __cplusplus
extern "C"
{
#endif

typedef enum {
    MOTOR_ACTION_CW,
    MOTOR_ACTION_CCW,
    MOTOR_ACTION_STOP,
    MOTOR_ACTION_SHORT_BRAKE,
} motor_action_t;


    typedef int (*motor_set_action_t)(const struct device *dev, motor_action_t action, float speed);

    __subsystem struct motor_api
    {
        motor_set_action_t set_action;
    };

    __syscall int motor_set_action(const struct device *dev, motor_action_t action, float speed)
    {
        const struct motor_api *api =
            (const struct motor_api *)dev->api;

        return api->set_action(dev, action, speed);
    }

#ifdef __cplusplus
}
#endif

#endif /* ZEPHYR_INCLUDE_DRIVERS_MOTOR_H_ */
