#include "printhead_routines.h"
#include <zephyr/logging/log.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/printer.h>

LOG_MODULE_REGISTER(printhead_routines, CONFIG_APP_LOG_LEVEL);

K_EVENT_DEFINE(printhead_routine_event);
#define PRINTHEAD_ROUTINE_CANCEL (1 << 0)

#define PRINTHEAD_SMF_DONE (1)
#define PRINTHEAD_SMF_ERROR (2)

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
        smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_ERROR);
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
        gpio_pin_set_dt(&vpp_en, 0);
        gpio_pin_set_dt(&n_reset_mcu, 0);
        LOG_ERR("Activate printhead failed: nRESET_FAULT is active indicates disabling reset not allowed by hardware");
        smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_ERROR);
        return;
    }

    gpio_pin_set_dt(&reset_disable_cp, 1);
    k_sleep(K_MSEC(1));
    gpio_pin_set_dt(&reset_disable_cp, 0);
    if (gpio_pin_get_dt(&n_reset_in) != 1)
    {
        gpio_pin_set_dt(&vpp_en, 0);
        gpio_pin_set_dt(&n_reset_mcu, 0);
        gpio_pin_set_dt(&comm_enable, 0);
        LOG_ERR("Activate printhead failed: nRESET_IN is not active indicates disabling did not work");
        smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_ERROR);
        return;
    }
    smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_ACTIVATE_ENABLE_CLOCK]);
    printhead_routine_state_object.next_delay = K_NO_WAIT;
}

static void printhead_routine_activate_enable_clock_run(void *o)
{
    const struct device *printhead;
    printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
    printer_sample_function(printhead);
    LOG_INF("Printhead ready");
    smf_set_terminate(SMF_CTX(&printhead_routine_state_object), PRINTHEAD_SMF_DONE);
}

static void printhead_routine_shutdown_disable_comm_reset_run(void *o)
{
    bool reset_disabled = false;
    bool comm_disabled = false;
    if (gpio_pin_get_dt(&n_reset_mcu) == 1)
    {
        gpio_pin_set_dt(&n_reset_mcu, 0);
        reset_disabled = true;
    }
    if (gpio_pin_get_dt(&comm_enable) == 1)
    {
        gpio_pin_set_dt(&comm_enable, 0);
        comm_disabled = true;
    }
    if (reset_disabled) {
        LOG_INF("Reset disabled");
    } else {
        LOG_INF("Reset was already disabled");
    }
    if (comm_disabled) {
        LOG_INF("Comm disabled");
    } else {
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
    k_event_clear(&printhead_routine_event, 0xFFFFFFFF);
    printhead_routine_state_object.disable_phase = false;
    smf_set_initial(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[init_state]);
    printhead_routine_state_object.next_delay = K_NO_WAIT;
    bool canceled = false;
    while (1)
    {
        k_sleep(printhead_routine_state_object.next_delay);
        if (k_event_test(&printhead_routine_event, PRINTHEAD_ROUTINE_CANCEL))
        {
            canceled = true;
            LOG_WRN("Printhead routine cancelled");
            if (printhead_routine_state_object.disable_phase)
            {
                LOG_INF("Already in disable phase.");
            }
            else
            {
                smf_set_state(SMF_CTX(&printhead_routine_state_object), &printhead_routine_states[PRINTHEAD_ROUTINE_SHUTDOWN_DISABLE_COMM_RESET]);
            }
        }
        int ret = smf_run_state(SMF_CTX(&printhead_routine_state_object));
        if (ret != 0)
        {
            switch (ret)
            {
            case PRINTHEAD_SMF_DONE:
                if (canceled)
                {
                    LOG_WRN("Printhead finsihed (cancelled)");
                    return -ECANCELED;
                }
                LOG_INF("Printhead routine completed");
                return 0;
                break;
            case PRINTHEAD_SMF_ERROR:
                LOG_ERR("Printhead routine failed");
                return -EINVAL;
            default:
                LOG_ERR("Printhead routine failed with unknown error code %d", ret);
                return -EINVAL;
                break;
            }
            break;
        }
    }
}

void printhead_routine_cancel()
{
    k_event_set(&printhead_routine_event, PRINTHEAD_ROUTINE_CANCEL);
}