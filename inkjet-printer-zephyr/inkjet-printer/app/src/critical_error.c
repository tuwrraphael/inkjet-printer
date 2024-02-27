#include <zephyr/drivers/gpio.h>

#include "pressure_control.h"
#include "printhead_routines.h"
#include "printer_system_smf.h"

static const struct gpio_dt_spec n_reset_mcu = GPIO_DT_SPEC_GET(DT_NODELABEL(n_reset_mcu), gpios);

void critical_error_handler(){
    gpio_pin_set(n_reset_mcu.port, n_reset_mcu.pin, 0);
    printer_system_smf_go_to_error();
    printhead_routine_cancel();
    pressure_control_enable(false);
}