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
    uint32_t lines_to_print;
    bool start_paused;
} print_control_encoder_mode_settings_t;

typedef enum
{
    ENCODER_MODE_OFF,
    ENCODER_MODE_ON,
    ENCODER_MODE_PAUSED
} encoder_mode_t;

typedef struct {
    print_control_encoder_mode_settings_t encoder_mode_settings;
    int32_t encoder_value;
    int32_t expected_encoder_value;
    int32_t last_printed_line;
    uint32_t lost_lines_count;
    uint32_t printed_lines;
    uint32_t lost_lines_by_slow_data;
    bool nozzle_priming_active;
    encoder_mode_t encoder_mode;
} print_control_info_t;
 
int print_control_start_encoder_mode(print_control_encoder_mode_settings_t *init);
int print_control_start_manual_fire_mode();
void print_control_pause_encoder_mode();
void print_control_resume_encoder_mode();
int print_control_request_fire();
void print_control_set_encoder_position(int32_t value);
void print_control_disable();
void print_control_set_print_memory(uint32_t offset, uint32_t *data, uint32_t length);
int print_control_initialize(print_control_init_t *init);
void print_control_get_info(print_control_info_t *info);
void print_control_go_to_safe_state();
int print_control_nozzle_priming();

#endif