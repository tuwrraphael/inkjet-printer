#ifndef INKJET_CONTROL_H
#define INKJET_CONTROL_H

#include <stdint.h>

typedef struct
{
    uint32_t (*get_value)(void);
    void (*fire_abort)(void);
    uint32_t sequential_fires;
    uint32_t fire_every_ticks;
    uint32_t first_line_after_encoder_position;
} encoder_print_init_t;

typedef struct
{
    encoder_print_init_t init;
} encoder_print_status_t;

void encoder_print_init(encoder_print_status_t *status, encoder_print_init_t *init);

void encoder_tick_handler(encoder_print_status_t *status);
void printhead_fired_handler(encoder_print_status_t *status);

#endif /* INKJET_CONTROL_H */