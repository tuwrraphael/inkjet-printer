#ifndef PRINT_CONTROL_H
#define PRINT_CONTROL_H

#include <stdint.h>

typedef void (*print_control_error_callback_t)(uint32_t);

typedef struct {
    print_control_error_callback_t error_callback;
} print_control_init_t;

typedef struct
{
    uint32_t sequential_fires;
    uint32_t fire_every_ticks;
    uint32_t print_first_line_after_encoder_tick;
} print_control_encoder_mode_init_t;

int print_control_start_encoder_mode(print_control_encoder_mode_init_t *init);
int print_control_start_manual_fire_mode();
int print_control_request_fire();

int print_control_initialize(print_control_init_t *init);
void print_control_go_to_safe_state();

#endif