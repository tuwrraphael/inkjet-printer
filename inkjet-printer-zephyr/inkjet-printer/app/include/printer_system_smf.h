#ifndef PRINTER_SYSTEM_SMF_H
#define PRINTER_SYSTEM_SMF_H

int printer_system_smf();

void printer_system_smf_go_to_safe_state();
void go_to_dropwatcher();
void go_to_idle();

void request_printhead_fire();

#endif // PRINTER_SYSTEM_SMF_H