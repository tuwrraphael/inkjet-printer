#include <lib/inkjetcontrol/nozzle_data.h>

void set_nozzle(uint8_t nozzle_id, bool value, uint32_t *data)
{
    uint8_t patternid = nozzle_id / 32;
    uint8_t bitid = nozzle_id % 32;
    if (value)
    {
        data[patternid] |= (1 << (bitid));
    }
    else
    {
        data[patternid] &= ~(1 << (bitid));
    }
}