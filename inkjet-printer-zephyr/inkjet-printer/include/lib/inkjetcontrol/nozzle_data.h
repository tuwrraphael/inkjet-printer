#ifndef NOZZLE_DATA_H
#define NOZZLE_DATA_H

#include <stdint.h>
#include <stdbool.h>

void set_nozzle(uint8_t nozzle_id, bool value, uint32_t *data);

#endif // NOZZLE_DATA_H