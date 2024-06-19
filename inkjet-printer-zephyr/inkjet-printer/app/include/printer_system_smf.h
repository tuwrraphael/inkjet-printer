#ifndef PRINTER_SYSTEM_SMF_H
#define PRINTER_SYSTEM_SMF_H

#include "print_control.h"

enum printer_system_smf_state
{
    PRINTER_SYSTEM_STARTUP,
    PRINTER_SYSTEM_IDLE,
    PRINTER_SYSTEM_ERROR,
    PRINTER_SYSTEM_DROPWATCHER,
    PRINTER_SYSTEM_PRINT
};

int printer_system_smf();

void printer_system_smf_go_to_safe_state();
void go_to_dropwatcher();
void go_to_idle();
void go_to_print();

void request_printhead_fire();

void request_set_nozzle_data(uint32_t *data);

void request_change_encoder_mode_settings(print_control_encoder_mode_settings_t *settings);

void request_prime_nozzles();

enum printer_system_smf_state printer_system_smf_get_state();

#endif // PRINTER_SYSTEM_SMF_H