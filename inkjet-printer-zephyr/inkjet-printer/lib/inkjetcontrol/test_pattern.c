#include <lib/inkjetcontrol/test_pattern.h>
#include <lib/inkjetcontrol/nozzle_data.h>
#include <stdbool.h>

uint8_t get_nozzle_zig_zag(uint32_t line)
{
    bool flip = (line / 128) % 2 == 1;
    uint8_t active_nozzle = 0;
    if (flip)
    {
        active_nozzle = line % 128;
    }
    else
    {
        active_nozzle = 127 - (line % 128);
    }
    return active_nozzle;
}

void get_pixels_zig_zag(uint32_t line, uint32_t *pixels)
{
    uint8_t active_nozzle = get_nozzle_zig_zag(line);
    set_nozzle(active_nozzle, true, pixels);
}