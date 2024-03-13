#include "moving_average.h"
#include <string.h>

void moving_average_init(moving_average_t *moving_average)
{
    memset(moving_average, 0, sizeof(moving_average_t));
}
void moving_average_add(moving_average_t *moving_average, float data)
{
    moving_average->count = (moving_average->count >= MOVING_AVERAGE_SIZE) ? moving_average->count : moving_average->count + 1;
    moving_average->sum -= moving_average->data[moving_average->index];
    moving_average->data[moving_average->index] = data;
    moving_average->sum += data;
    moving_average->index = (moving_average->index + 1) % MOVING_AVERAGE_SIZE;
    if (moving_average->count < MOVING_AVERAGE_SIZE)
    {
        moving_average->avg = 0;
    }
    else
    {
        moving_average->avg = moving_average->sum / MOVING_AVERAGE_SIZE;
    }
}