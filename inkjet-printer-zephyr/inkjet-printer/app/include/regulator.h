#ifndef REGULATOR_H
#define REGULATOR_H

int regulator_initialize(void);

bool regulator_get_voltage(double *voltage_mv);

int regulator_set_voltage(double voltage_mv);

#endif // REGULATOR_H