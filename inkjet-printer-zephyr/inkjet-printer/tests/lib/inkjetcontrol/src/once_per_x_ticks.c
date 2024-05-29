#include <limits.h>

#include <zephyr/ztest.h>

#include <lib/inkjetcontrol/encoder.h>

static int32_t encoder_value = 0;
static uint32_t fire_abort_called = 0;
static int32_t load_line_called_with = 0;
static bool last_fire_aborted = false;

static int32_t get_value(void *inst)
{
	return encoder_value;
}

static void fire_abort(void *inst)
{
	fire_abort_called++;
	last_fire_aborted = true;
	return;
}

static void load_line(void *inst, uint32_t line)
{
	load_line_called_with = line;
	return;
}

static void before(void *f)
{
	encoder_value = 0;
	fire_abort_called = 0;
	load_line_called_with = -1;
	last_fire_aborted = false;
}

#define MAX_FIRE_LOOP (20)

static void fire_until_aborted(encoder_print_status_t *status)
{
	uint32_t fire_loop = 0;
	while (!last_fire_aborted)
	{
		if (fire_loop >= MAX_FIRE_LOOP)
		{
			break;
			printf("fire_loop >= MAX_FIRE_LOOP");
			ztest_test_fail();
		}
		encoder_printhead_fired_handler(status);
		fire_loop++;
	}
	last_fire_aborted = false;
}

static void encoder_advance(encoder_print_status_t *status, int32_t ticks)
{
	uint16_t ticks_pos = ticks < 0 ? -ticks : ticks;
	for (uint16_t i = 0; i < ticks_pos; i++)
	{
		encoder_value += ticks < 0 ? -1 : 1;
		encoder_tick_handler(status);
		fire_until_aborted(status);
	}
}

ZTEST(encoder_print_once_x_ticks, test_not_printing_before_first_line)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.sequential_fires = 1,
		.fire_every_ticks = 3,
		.print_first_line_after_encoder_tick = 7};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 6);
	zassert_equal(fire_abort_called, 6, "fire_abort not called for first 6 ticks");
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
}

ZTEST(encoder_print_once_x_ticks, test_normal_operation)
{
	uint32_t cases[] = {2, 3, 4};
	for (uint32_t casenr = 0; casenr < sizeof(cases) / sizeof(cases[0]); casenr++)
	{
		before(NULL);
		uint32_t fire_every_ticks = cases[casenr];

		encoder_print_init_t init = {
			.get_value = get_value,
			.fire_abort = fire_abort,
			.load_line = load_line,
			.sequential_fires = 1,
			.fire_every_ticks = fire_every_ticks,
			.print_first_line_after_encoder_tick = 2};

		encoder_print_status_t encoder_print_status;

		encoder_print_init(&encoder_print_status, &init);
		encoder_advance(&encoder_print_status, 1);
		zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
		encoder_advance(&encoder_print_status, 1);
		zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
		uint32_t printed = 0;
		for (int i = 0; i < 3; i++)
		{
			for (int j = 0; j < fire_every_ticks - 1; j++)
			{
				encoder_advance(&encoder_print_status, 1);
				zassert_equal(encoder_print_status.last_printed_line, printed + i, "last_printed_line not matched");
			}
			encoder_advance(&encoder_print_status, 1);
			zassert_equal(encoder_print_status.last_printed_line, printed + i + 1, "last_printed_line not matched (3)");
		}
	}
}

ZTEST(encoder_print_once_x_ticks, test_encoder_fire_after_skip)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.sequential_fires = 1,
		.fire_every_ticks = 3,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 1 /print0
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 2
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3
	// now print 0
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
	fire_until_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1); // -- encoder 4 /print1
	zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
}

ZTEST(encoder_print_once_x_ticks, test_every2_missed_tick)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.sequential_fires = 1,
		.fire_every_ticks = 2,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 1); // -- encoder 1 (print 0)
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1); // -- encoder 2
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3 (plan to print 1)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 4 (planned skip)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 5 (plan to print 2)
	fire_until_aborted(&encoder_print_status);	 // -- fire finished late (before 5 would be ok)
	encoder_advance(&encoder_print_status, 1);	 // -- encoder 6 (planned skip), detect
	zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
	zassert_equal(load_line_called_with, 3, "load_line not called with 3");
	zassert_equal(encoder_print_status.lost_lines_count, 1, "lost_lines_count not 1");
	zassert_equal(encoder_print_status.lost_lines[0], 2, "lost_lines[0] not 2");
	encoder_advance(&encoder_print_status, 1); // -- encoder 7 (plan to print 3)
	zassert_equal(encoder_print_status.last_printed_line, 3, "last_printed_line not 3");
}

ZTEST(encoder_print_once_x_ticks, test_every2_missed_tick_late)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.sequential_fires = 1,
		.fire_every_ticks = 2,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 1); // -- encoder 1 (print 0)
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1); // -- encoder 2
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3 (plan to print 1)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 4 (planned skip)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 5 (plan to print 2)
	encoder_advance(&encoder_print_status, 1);	 // -- encoder 6 (planned skip), fire finished late
	encoder_advance(&encoder_print_status, 1);	 // -- encoder 7 (plan to print 3), detect
	zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
	zassert_equal(load_line_called_with, 4, "load_line not called with 4");
	zassert_equal(encoder_print_status.lost_lines_count, 2, "lost_lines_count not 2");
	zassert_equal(encoder_print_status.lost_lines[0], 2, "lost_lines[0] not 2");
	zassert_equal(encoder_print_status.lost_lines[1], 3, "lost_lines[1] not 3");
	encoder_advance(&encoder_print_status, 1); // -- encoder 8 (planned skip)
	zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 3");
	encoder_advance(&encoder_print_status, 1); // -- encoder 9 (plan to print 4)
	zassert_equal(encoder_print_status.last_printed_line, 4, "last_printed_line not 4");
}

ZTEST(encoder_print_once_x_ticks, test_every3_missed_tick)
{
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.sequential_fires = 1,
		.fire_every_ticks = 3,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_status_t encoder_print_status;

	encoder_print_init(&encoder_print_status, &init);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 1 (plan to print 0)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 2 (planned skip)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3 (planned skip)
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
	encoder_advance(&encoder_print_status, 1); // -- encoder 4 (plan to print 1) print 0
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1); // -- encoder 5 (planned skip) detect
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 1");
	zassert_equal(load_line_called_with, 2, "load_line not called with 2");
	zassert_equal(encoder_print_status.lost_lines_count, 1, "lost_lines_count not 1");
	zassert_equal(encoder_print_status.lost_lines[0], 1, "lost_lines[0] not 1");
	encoder_advance(&encoder_print_status, 1); // -- encoder 6 (planned skip)
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1); // -- encoder 7 (plan to print 2)
	zassert_equal(encoder_print_status.last_printed_line, 2, "last_printed_line not 2");
}

ZTEST_SUITE(encoder_print_once_x_ticks, NULL, NULL, before, NULL, NULL);