#ifndef REGULATOR_H
#define REGULATOR_H

typedef struct
{
    bool voltage_reading_available;
    uint32_t voltage_mv;
    uint32_t set_voltage_mv;
} regulator_info_t;

int regulator_initialize(void);

bool regulator_get_voltage(uint32_t *voltage_mv);

int regulator_set_voltage(uint32_t voltage_mv);

void regulator_get_info(regulator_info_t *info);

#endif // REGULATOR_H