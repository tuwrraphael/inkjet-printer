#ifndef INKJET_CONTROL_H
#define INKJET_CONTROL_H

#include <stdint.h>

#define MAX_LOST_LINES_MEMORY (10)

typedef struct
{
    int32_t (*get_value)(void);
    void (*fire_abort)(void);
    void (*load_line)(uint32_t line);
    uint32_t sequential_fires;
    uint32_t fire_every_ticks;
    uint32_t print_first_line_after_encoder_tick;
} encoder_print_init_t;

typedef struct
{
    encoder_print_init_t init;
    uint32_t remaining_sequential_fires;
    uint32_t expected_encoder_value;
    int32_t last_printed_line;
    uint32_t last_loaded_line;
    uint32_t lost_lines_count;
    int32_t lost_lines[MAX_LOST_LINES_MEMORY];
} encoder_print_status_t;

void encoder_print_init(encoder_print_status_t *status, encoder_print_init_t *init);

void encoder_tick_handler(encoder_print_status_t *status);
void printhead_fired_handler(encoder_print_status_t *status);

#endif /* INKJET_CONTROL_H */