#include <zephyr/logging/log.h>

#include <lib/inkjetcontrol.h>

LOG_MODULE_REGISTER(inkjetcontrol, CONFIG_INKJETCONTROL_LOG_LEVEL);



void encoder_print_init(encoder_print_status_t *status, encoder_print_init_t *init)
{
	status->init = *init;
	LOG_DBG("Encoder print init");
}
void encoder_tick_handler(encoder_print_status_t *status)
{
}
void printhead_fired_handler(encoder_print_status_t *status)
{
}