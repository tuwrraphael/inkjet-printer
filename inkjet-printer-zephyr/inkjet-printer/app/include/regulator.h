#ifndef REGULATOR_H
#define REGULATOR_H

int regulator_initialize(void);

double regulator_get_voltage(void);

int set_regulator_voltage(double voltage);

#endif // REGULATOR_H