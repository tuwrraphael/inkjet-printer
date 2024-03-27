#include <zephyr/logging/log.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/printer.h>

#include "printhead_routines.h"
#include "failure_handling.h"

LOG_MODULE_REGISTER(printhead_routines, CONFIG_APP_LOG_LEVEL);

#define PRINTHEAD_SMF_DONE (1)

static bool watch_reset = false;
static printhead_routines_error_callback_t error_callback;

static const struct gpio_dt_spec vpp_en = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_en), gpios);
static const struct gpio_dt_spec comm_enable = GPIO_DT_SPEC_GET(DT_NODELABEL(comm_enable), gpios);
static const struct gpio_dt_spec n_reset_mcu = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_mcu), gpios);
static const struct gpio_dt_spec vpp_enable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_enable_cp), gpios);
static const struct gpio_dt_spec reset_disable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(reset_disable_cp), gpios);

static const struct gpio_dt_spec n_reset_fault = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_fault), gpios);
static const struct gpio_dt_spec n_reset_in = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_in), gpios);

static struct gpio_dt_spec nFAULT = GPIO_DT_SPEC_GET(DT_NODELABEL(nfault), gpios);

static void printhead_routine_activate_enable_vpp_run(void *o);
static void printhead_routine_activate_enable_vpp_pulse_run(void *o);
static void printhead_routine_activate_enable_comm_reset_run(void *o);
static void printhead_routine_activate_enable_reset_pulse_run(void *o);
static void printhead_routine_activate_enable_clock_run(void *o);
static void printhead_routine_shutdown_disable_comm_reset_run(void *o);
static void printhead_routine_shutdown_disable_vpp_run(void *o);
static void printhead_routine_shutdown_disable_comm_reset_entry(void *o);

const struct smf_state printhead_routine_states[] = {
    [PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP] = SMF_CREATE_STATE(NULL, printhead_routine_activate_enable_vpp_run, NULL),
    [PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP_PULSE] = SMF_CREATE_STATE(NULL, printhead_routine_activate_enable_vpp_pulse_run, NULL),
    [PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_COMM_RESET] = SMF_CREATE_STATE(NULL, printhead_routine_activate_enable_comm_reset_run, NULL),
    [PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_RESET_PULSE] = SMF_CREATE_STATE(NULL, printhead_routine_activate_enable_reset_pulse_run, NULL),
    [PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_CLOCK] = SMF_CREATE_STATE(NULL, printhead_routine_activate_enable_clock_run, NULL),
    [PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_COMM_RESET] = SMF_CREATE_STATE(printhead_routine_shutdown_disable_comm_reset_entry, printhead_routine_shutdown_disable_comm_reset_run, NULL),
    [PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_VPP] = SMF_CREATE_STATE(NULL, printhead_routine_shutdown_disable_vpp_run, NULL)};

struct printhead_routine_state_object
{
    struct smf_ctx ctx;
    k_timeout_t next_delay;
    bool disable_phase;

} printhead_routine_state_object;

static int check_nfault()
{
    if (gpio_pin_get_dt(&nFAULT) != 1)
    {
        LOG_ERR("Activate printhead failed: nFAULT is active indicates temperature error");
        smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL]);
        return EINVAL;
    }
    return 0;
}

static void printhead_routine_activate_enable_vpp_run(void *o)
{
    gpio_pin_set_dt(&vpp_en, 1);
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_VPP_PULSE]);
    printhead_routine_state_object.next_delay = K_MSEC(1);
}

static void printhead_routine_activate_enable_vpp_pulse_run(void *o)
{
    if (check_nfault() != 0)
    {
        return;
    }
    LOG_INF("Turning VPPH/VPPL on");
    gpio_pin_set_dt(&vpp_enable_cp, 1);
    k_sleep(K_MSEC(1));
    gpio_pin_set_dt(&vpp_enable_cp, 0);
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_COMM_RESET]);
    printhead_routine_state_object.next_delay = K_MSEC(500);
}

static void printhead_routine_activate_enable_comm_reset_run(void *o)
{
    LOG_INF("Enable comm");
    gpio_pin_set_dt(&comm_enable, 1);

    LOG_INF("Disabling reset");
    gpio_pin_set_dt(&n_reset_mcu, 1);
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_RESET_PULSE]);
    printhead_routine_state_object.next_delay = K_MSEC(1);
}

static void printhead_routine_activate_enable_reset_pulse_run(void *o)
{
    if (check_nfault() != 0)
    {
        return;
    }
    if (gpio_pin_get_dt(&n_reset_fault) != 0)
    {
        LOG_ERR("Activate printhead failed: nRESET_FAULT is active indicates disabling reset not allowed by hardware");
        smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL]);
        return;
    }

    gpio_pin_set_dt(&reset_disable_cp, 1);
    k_sleep(K_MSEC(1));
    gpio_pin_set_dt(&reset_disable_cp, 0);
    if (gpio_pin_get_dt(&n_reset_in) != 1)
    {
        LOG_ERR("Activate printhead failed: nRESET_IN is not active indicates disabling did not work");
        smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_INITIAL]);
        return;
    }
    watch_reset = true;
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_CLOCK]);
    printhead_routine_state_object.next_delay = K_NO_WAIT;
}

static void printhead_routine_activate_enable_clock_run(void *o)
{
    const struct device *printhead;
    printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
    printer_clock_enable(printhead);
    LOG_INF("Printhead ready");
    smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_DONE);
}

static void printhead_routine_shutdown_disable_comm_reset_run(void *o)
{
    watch_reset = false;
    bool reset_enabled = false;
    bool comm_disabled = false;
    if (gpio_pin_get_dt(&n_reset_mcu) == 1)
    {
        gpio_pin_set_dt(&n_reset_mcu, 0);
        reset_enabled = true;
    }
    if (gpio_pin_get_dt(&comm_enable) == 1)
    {
        gpio_pin_set_dt(&comm_enable, 0);
        comm_disabled = true;
    }
    if (reset_enabled)
    {
        LOG_INF("Reset enabled");
    }
    else
    {
        LOG_INF("Reset was already enabled");
    }
    if (comm_disabled)
    {
        LOG_INF("Comm disabled");
    }
    else
    {
        LOG_INF("Comm was already disabled");
    }
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_VPP]);
    printhead_routine_state_object.next_delay = K_MSEC(1);
}

static void printhead_routine_shutdown_disable_vpp_run(void *o)
{
    if (gpio_pin_get_dt(&vpp_en) == 1)
    {
        gpio_pin_set_dt(&vpp_en, 0);
        LOG_INF("VPPH/VPPL disabled");
    }
    else
    {
        LOG_INF("VPPH/VPPL was already disabled");
    }
    smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_DONE);
}

static void printhead_routine_shutdown_disable_comm_reset_entry(void *o)
{
    printhead_routine_state_object.disable_phase = true;
}

int printhead_routine_smf(enum printhead_routine_state init_state)
{
    printhead_routine_state_object.disable_phase = false;
    smf_set_initial(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[init_state]);
    printhead_routine_state_object.next_delay = K_NO_WAIT;
    while (1)
    {
        k_sleep(printhead_routine_state_object.next_delay);
        if (failure_handling_is_in_error_state() && !printhead_routine_state_object.disable_phase)
        {
            LOG_WRN("Printhead routine cancelled");
            smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_COMM_RESET]);
        }
        int ret = smf_run_state(SMF_CTX(&printhead_routine_state_object));
        if (ret != 0)
        {
            switch (ret)
            {
            case PRINTHEAD_SMF_DONE:
                if (init_state == PRINTHEAD_ROUTINE_ACTIVATE_INITIAL&& printhead_routine_state_object.disable_phase)
                {
                    LOG_ERR("Printhead routine failed");
                    return -EINVAL;
                }
                LOG_INF("Printhead routine completed");
                return 0;
                break;
            default:
                LOG_ERR("Printhead routine failed with unknown error code %d", ret);
                return -EINVAL;
                break;
            }
            break;
        }
    }
}

static struct gpio_callback n_reset_fault_cb_data;
static struct gpio_callback n_reset_in_cb_data;
static struct gpio_callback nFAULT_cb_data;

void n_reset_fault_changed(const struct device *dev, struct gpio_callback *cb,
                           uint32_t pins)
{
    int nResetFaultState = gpio_pin_get_dt(&n_reset_fault);
    if (watch_reset && nResetFaultState == 1)
    {
        error_callback();
    }
    LOG_INF("n_reset_fault changed to %d", gpio_pin_get_dt(&n_reset_fault));
}

void n_reset_in_changed(const struct device *dev, struct gpio_callback *cb,
                        uint32_t pins)
{
    int nResetInState = gpio_pin_get_dt(&n_reset_in);
    if (watch_reset && nResetInState == 0)
    {
        error_callback();
    }
    LOG_INF("n_reset_in changed to %d", gpio_pin_get_dt(&n_reset_in));
}

void nFault_int_handler(const struct device *dev, struct gpio_callback *cb,
                        uint32_t pins)
{
    int nFaultState = gpio_pin_get_dt(&nFAULT);
    if (watch_reset && nFaultState == 0)
    {
        error_callback();
    }
    LOG_INF("nFault changed to %d", nFaultState);
}

static int initialize_input_with_interrupt(const struct gpio_dt_spec *gpio, struct gpio_callback *callback, gpio_callback_handler_t handler)
{
    if (!gpio_is_ready_dt(gpio))
    {
        LOG_ERR("Error: device %s is not ready\n",
                gpio->port->name);
        return ENODEV;
    }
    int ret = gpio_pin_configure_dt(gpio, GPIO_INPUT);
    if (ret != 0)
    {
        LOG_ERR("Error %d: failed to configure %s pin %d\n",
                ret, gpio->port->name, gpio->pin);
        return ret;
    }
    ret = gpio_pin_interrupt_configure_dt(gpio,
                                          GPIO_INT_EDGE_BOTH);
    if (ret != 0)
    {
        LOG_ERR("Error %d: failed to configure interrupt on %s pin %d\n",
                ret, gpio->port->name, gpio->pin);
        return ret;
    }
    gpio_init_callback(callback, handler, BIT(gpio->pin));
    ret = gpio_add_callback(gpio->port, callback);
    if (ret != 0)
    {
        LOG_ERR("Error %d: failed to add callback on %s pin %d\n",
                ret, gpio->port->name, gpio->pin);
        return ret;
    }
    return 0;
}

static int initialize_output(const struct gpio_dt_spec *gpio)
{
    if (!gpio_is_ready_dt(gpio))
    {
        LOG_ERR("Error: device %s is not ready\n",
                gpio->port->name);
        return ENODEV;
    }
    int ret = gpio_pin_configure_dt(gpio, GPIO_OUTPUT_INACTIVE);
    if (ret != 0)
    {
        LOG_ERR("Error %d: failed to configure %s pin %d\n",
                ret, gpio->port->name, gpio->pin);
        return ret;
    }
    return 0;
}

int printhead_routines_initialize(printhead_routines_init_t *init)
{
    if (init->error_callback == NULL)
    {
        return -1;
    }
    error_callback = init->error_callback;
    int ret;
    ret = initialize_input_with_interrupt(&nFAULT, &nFAULT_cb_data, nFault_int_handler);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_input_with_interrupt(&n_reset_fault, &n_reset_fault_cb_data, n_reset_fault_changed);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_input_with_interrupt(&n_reset_in, &n_reset_in_cb_data, n_reset_in_changed);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_output(&vpp_en);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_output(&comm_enable);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_output(&n_reset_mcu);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_output(&vpp_enable_cp);
    if (ret != 0)
    {
        return ret;
    }
    ret = initialize_output(&reset_disable_cp);
    if (ret != 0)
    {
        return ret;
    }
    return 0;
}

void printhead_routines_go_to_safe_state()
{
    gpio_pin_set_dt(&n_reset_mcu, 0);
    watch_reset = false;
}