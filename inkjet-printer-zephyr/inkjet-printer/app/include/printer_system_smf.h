#ifndef PRINTER_SYSTEM_SMF_H
#define PRINTER_SYSTEM_SMF_H

enum printer_system_smf_state
{
    PRINTER_SYSTEM_STARTUP,
    PRINTER_SYSTEM_IDLE,
    PRINTER_SYSTEM_ERROR,
    PRINTER_SYSTEM_DROPWATCHER
};

int printer_system_smf();

void printer_system_smf_go_to_safe_state();
void go_to_dropwatcher();
void go_to_idle();

void request_printhead_fire();

enum printer_system_smf_state printer_system_smf_get_state();

#endif // PRINTER_SYSTEM_SMF_H