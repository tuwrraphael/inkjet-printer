#include "printhead_routines.h"
#include <zephyr/logging/log.h>
#include <zephyr/device.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/printer.h>

LOG_MODULE_REGISTER(printhead_routines, CONFIG_APP_LOG_LEVEL);

#define PRINTHEAD_SMF_DONE (1)
#define PRINTHEAD_SMF_ERROR (2)
#define PRINTHEAD_SMF_CANCEL (3)

static const struct gpio_dt_spec vpp_en = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_en), gpios);
static const struct gpio_dt_spec comm_enable = GPIO_DT_SPEC_GET(DT_NODELABEL(comm_enable), gpios);
static const struct gpio_dt_spec n_reset_mcu = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_mcu), gpios);
static const struct gpio_dt_spec vpp_enable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(vpp_enable_cp), gpios);
static const struct gpio_dt_spec reset_disable_cp = GPIO_DT_SPEC_GET(DT_NODELABEL(reset_disable_cp), gpios);

static const struct gpio_dt_spec n_reset_fault = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_fault), gpios);
static const struct gpio_dt_spec n_reset_in = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_in), gpios);

static struct gpio_dt_spec nFAULT = GPIO_DT_SPEC_GET(DT_NODELABEL(nfault), gpios);

enum printhead_activate_state
{
    PRINTHEAD_ACTIVATE_ENABLE_VPP,
    PRINTHEAD_ACTIVATE_ENABLE_VPP_PULSE,
    PRINTHEAD_ACTIVATE_ENABLE_COMM_RESET,
    PRINTHEAD_ACTIVATE_ENABLE_RESET_PULSE,
    PRINTHEAD_ACTIVATE_ENABLE_CLOCK,
    PRINTHEAD_SHUTDOWN_DISABLE_COMM_RESET,
    PRINTHEAD_SHUTDOWN_DISABLE_VPP
};

static void printhead_activate_enable_vpp_run(void *o);
static void printhead_activate_enable_vpp_pulse_run(void *o);
static void printhead_activate_enable_comm_reset_run(void *o);
static void printhead_activate_enable_reset_pulse_run(void *o);
static void printhead_activate_enable_clock_run(void *o);
static void printhead_shutdown_disable_comm_reset_run(void *o);
static void printhead_shutdown_disable_vpp_run(void *o);
static void printhead_shutdown_disable_comm_reset_entry(void *o);

const struct smf_state printhead_activate_states[] = {
    [PRINTHEAD_ACTIVATE_ENABLE_VPP] = SMF_CREATE_STATE(NULL, printhead_activate_enable_vpp_run, NULL),
    [PRINTHEAD_ACTIVATE_ENABLE_VPP_PULSE] = SMF_CREATE_STATE(NULL, printhead_activate_enable_vpp_pulse_run, NULL),
    [PRINTHEAD_ACTIVATE_ENABLE_COMM_RESET] = SMF_CREATE_STATE(NULL, printhead_activate_enable_comm_reset_run, NULL),
    [PRINTHEAD_ACTIVATE_ENABLE_RESET_PULSE] = SMF_CREATE_STATE(NULL, printhead_activate_enable_reset_pulse_run, NULL),
    [PRINTHEAD_ACTIVATE_ENABLE_CLOCK] = SMF_CREATE_STATE(NULL, printhead_activate_enable_clock_run, NULL),
    [PRINTHEAD_SHUTDOWN_DISABLE_COMM_RESET] = SMF_CREATE_STATE(printhead_shutdown_disable_comm_reset_entry, printhead_shutdown_disable_comm_reset_run, NULL),
    [PRINTHEAD_SHUTDOWN_DISABLE_VPP] = SMF_CREATE_STATE(NULL, printhead_shutdown_disable_vpp_run, NULL)};

struct printhead_activate_state_object
{
    struct smf_ctx ctx;
    k_timeout_t next_delay;
    bool disable_phase;

} printhead_activate_state_object;

static int check_nfault()
{
    if (gpio_pin_get_dt(&nFAULT) != 1)
    {
        LOG_ERR("Activate printhead failed: nFAULT is active indicates temperature error");
        smf_set_terminate(SMF_CTX(&printhead_activate_state_object), PRINTHEAD_SMF_ERROR);
        return EINVAL;
    }
    return 0;
}

static void printhead_activate_enable_vpp_run(void *o)
{
    gpio_pin_set_dt(&vpp_en, 1);
    smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_ACTIVATE_ENABLE_VPP_PULSE]);
    printhead_activate_state_object.next_delay = K_MSEC(1);
}

static void printhead_activate_enable_vpp_pulse_run(void *o)
{
    if (check_nfault() != 0)
    {
        return;
    }
    LOG_INF("Turning VPPH/VPPL on");
    gpio_pin_set_dt(&vpp_enable_cp, 1);
    k_sleep(K_MSEC(1));
    gpio_pin_set_dt(&vpp_enable_cp, 0);
    smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_ACTIVATE_ENABLE_COMM_RESET]);
    printhead_activate_state_object.next_delay = K_MSEC(500);
}

static void printhead_activate_enable_comm_reset_run(void *o)
{
    LOG_INF("Enable comm");
    gpio_pin_set_dt(&comm_enable, 1);

    LOG_INF("Disabling reset");
    gpio_pin_set_dt(&n_reset_mcu, 1);
    smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_ACTIVATE_ENABLE_RESET_PULSE]);
    printhead_activate_state_object.next_delay = K_MSEC(1);
}

static void printhead_activate_enable_reset_pulse_run(void *o)
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
        smf_set_terminate(SMF_CTX(&printhead_activate_state_object), PRINTHEAD_SMF_ERROR);
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
        smf_set_terminate(SMF_CTX(&printhead_activate_state_object), PRINTHEAD_SMF_ERROR);
        return;
    }
    smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_ACTIVATE_ENABLE_CLOCK]);
    printhead_activate_state_object.next_delay = K_NO_WAIT;
}

static void printhead_activate_enable_clock_run(void *o)
{
    const struct device *printhead;
    printhead = DEVICE_DT_GET(DT_NODELABEL(printhead));
    printer_sample_function(printhead);
    LOG_INF("Printhead ready");
    smf_set_terminate(SMF_CTX(&printhead_activate_state_object), PRINTHEAD_SMF_DONE);
}

static void printhead_shutdown_disable_comm_reset_run(void *o)
{
    bool reset_diabled = false;
    bool comm_disabled = false;
    if (gpio_pin_get_dt(&n_reset_mcu) == 1)
    {
        gpio_pin_set_dt(&n_reset_mcu, 0);
        reset_diabled = true;
    }
    if (gpio_pin_get_dt(&comm_enable) == 1)
    {
        gpio_pin_set_dt(&comm_enable, 0);
        comm_disabled = true;
    }
    LOG_INF(reset_diabled ? "Reset disabled" : "Reset was already disabled");
    LOG_INF(comm_disabled ? "Comm disabled" : "Comm was already disabled");
    smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_SHUTDOWN_DISABLE_VPP]);
    printhead_activate_state_object.next_delay = K_MSEC(1);
}

static void printhead_shutdown_disable_vpp_run(void *o)
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
    smf_set_terminate(SMF_CTX(&printhead_activate_state_object), PRINTHEAD_SMF_DONE);
}

static void printhead_shutdown_disable_comm_reset_entry(void *o)
{
    printhead_activate_state_object.disable_phase = true;
}

static int activate_printhead_smf(struct k_event *cancelevent, uint32_t events, struct smf_state *init_state)
{
    printhead_activate_state_object.disable_phase = false;
    smf_set_initial(SMF_CTX(&printhead_activate_state_object), init_state);
    printhead_activate_state_object.next_delay = K_NO_WAIT;
    while (1)
    {
        k_sleep(printhead_activate_state_object.next_delay);
        if (cancelevent != NULL && k_event_test(cancelevent, events))
        {
            LOG_WRN("Printhead routine cancelled");
            if (printhead_activate_state_object.disable_phase)
            {
                LOG_INF("Already in disable phase.");
            }
            else
            {
                smf_set_state(SMF_CTX(&printhead_activate_state_object), &printhead_activate_states[PRINTHEAD_SHUTDOWN_DISABLE_COMM_RESET]);
            }
        }
        int ret = smf_run_state(SMF_CTX(&printhead_activate_state_object));
        if (ret != 0)
        {
            switch (ret)
            {
            case PRINTHEAD_SMF_DONE:
                LOG_INF("Printhead activated");
                return 0;
                break;
            case PRINTHEAD_SMF_ERROR:
                LOG_ERR("Printhead activation failed");
                return -EINVAL;
            case PRINTHEAD_SMF_CANCEL:
                LOG_WRN("Printhead activation cancelled");
                return -ECANCELED;
            default:
                LOG_ERR("Printhead activation failed with unknown error code %d", ret);
                return -EINVAL;
                break;
            }
            break;
        }
    }
}

void activate_printhead_work_cb(struct k_work *item)
{
    LOG_INF("Activating printhead");
    printhead_routine_work_t *parameters = CONTAINER_OF(item, printhead_routine_work_t, work);
    activate_printhead_smf(parameters->cancelevent, parameters->events, &printhead_activate_states[PRINTHEAD_ACTIVATE_ENABLE_VPP]);
}

void printhead_shutdown_work_cb(struct k_work *item)
{
    LOG_INF("Shutting down printhead");
    printhead_routine_work_t *parameters = CONTAINER_OF(item, printhead_routine_work_t, work);
    activate_printhead_smf(parameters->cancelevent, parameters->events, &printhead_activate_states[PRINTHEAD_SHUTDOWN_DISABLE_COMM_RESET]);
}