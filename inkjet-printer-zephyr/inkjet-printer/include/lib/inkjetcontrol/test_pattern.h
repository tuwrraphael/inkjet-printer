#ifndef TEST_PATTERN_H
#define TEST_PATTERN_H

#include <stdint.h>

uint8_t get_nozzle_zig_zag(uint32_t line);
void get_pixels_zig_zag(uint32_t line, uint32_t *pixels);

#endif // TEST_PATTERN_H