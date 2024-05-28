#include <limits.h>

#include <zephyr/ztest.h>

#include <lib/inkjetcontrol.h>

static uint32_t encoder_value = 0;
static uint32_t fire_abort_called = 0;

uint32_t get_value(void)
{
	return encoder_value;
}

void fire_abort(void)
{
	fire_abort_called = 1;
	return;
}

static void before(void *f)
{
	encoder_value = 0;
	fire_abort_called = 0;
}

static void encoder_advance(encoder_print_status_t *status, int32_t ticks)
{
	uint16_t ticks_pos = ticks < 0 ? -ticks : ticks;
	for (uint16_t i = 0; i < ticks_pos; i++)
	{
		encoder_value += ticks < 0 ? -1 : 1;
		encoder_tick_handler(status);
	}
}

ZTEST(inkjet_lib, test_normal_operation)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.first_line_after_encoder_position = 3};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(fire_abort_called, 1, "fire_abort not called after 1 tick");
}

ZTEST_SUITE(inkjet_lib, NULL, NULL, before, NULL, NULL);