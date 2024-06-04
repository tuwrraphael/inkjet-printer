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

static void error_cb_fail_test(void *inst)
{
	printf("Error callback called\n");
	ztest_test_fail();
}

static void fire_abort(void *inst)
{
	fire_abort_called++;
	last_fire_aborted = true;
	return;
}

static void load_line(void *inst, uint32_t line, bool wait_fired)
{
	load_line_called_with = line;
	encoder_print_status_t *encoder_print_status = (encoder_print_status_t *)inst;
	encoder_signal_load_line_completed(encoder_print_status);
	return;
}

static void before(void *f)
{
	encoder_value = 0;
	fire_abort_called = 0;
	load_line_called_with = -1;
	last_fire_aborted = false;
}

static void fire_if_not_aborted(encoder_print_status_t *status)
{
	if (!last_fire_aborted)
	{
		encoder_fire_issued_handler(status);
		encoder_fire_cycle_completed_handler(status);
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
		fire_if_not_aborted(status);
	}
}

ZTEST(encoder_print_once_per_tick, test_not_printing_before_first_line_when_negative)
{
	encoder_print_status_t encoder_print_status;

	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 4};

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, -3);
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
	zassert_equal(encoder_print_status.expected_encoder_value, init.print_first_line_after_encoder_tick, "last_printed_line not -1");
	encoder_advance(&encoder_print_status, 6);
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(encoder_value, 4, "encoder_value not 4");
}

ZTEST(encoder_print_once_per_tick, test_not_printing_before_first_line)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 4};

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(fire_abort_called, 1, "fire_abort not called after 1 tick");
	encoder_advance(&encoder_print_status, 2);
	zassert_equal(fire_abort_called, 3, "fire_abort called after 2 ticks");
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not -1");
}

ZTEST(encoder_print_once_per_tick, test_normal_operation)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 0");
	zassert_equal(encoder_print_status.printed_lines, 2, "printed_lines not 2");
}

ZTEST(encoder_print_once_per_tick, test_prints_first_line_pos_5)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 5};

	encoder_print_init(&encoder_print_status, &init);
	encoder_advance(&encoder_print_status, 4);
	zassert_equal(fire_abort_called, 4, "fire_abort not called after 3 ticks");
	zassert_equal(encoder_print_status.last_printed_line, -1, "last_printed_line not 0");
	encoder_advance(&encoder_print_status, 1);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
}

ZTEST(encoder_print_once_per_tick, test_encoder_jitter_back)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_init(&encoder_print_status, &init);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status);
	encoder_value--;
	encoder_tick_handler(&encoder_print_status);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status);
	fire_if_not_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(fire_abort_called, 1, "fire_abort not called 1 time");
}

ZTEST(encoder_print_once_per_tick, test_missed_single_tick)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_init(&encoder_print_status, &init);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 1 (plan to print 0)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 2 (plan to print 1), not printed 0 yet jump forward
	fire_if_not_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(fire_abort_called, 1, "fire_abort not called 1 time");
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3 (plan to print 2), detect
	fire_if_not_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(fire_abort_called, 2, "fire_abort not called after jump detected");
	zassert_equal(load_line_called_with, 3, "load_line not called with 3");
	zassert_equal(encoder_print_status.lost_lines_count, 2, "lost_lines_count not 2");
	zassert_equal(encoder_print_status.lost_lines[0], 1, "lost_lines[0] not 1");
	zassert_equal(encoder_print_status.lost_lines[1], 2, "lost_lines[1] not 2");
	encoder_advance(&encoder_print_status, 1); // -- encoder 4 (plan to print 3)
	zassert_equal(encoder_print_status.last_printed_line, 3, "last_printed_line not 3");
	encoder_advance(&encoder_print_status, 1); // -- encoder 5 (plan to print 4)
	zassert_equal(encoder_print_status.last_printed_line, 4, "last_printed_line not 4");
}

ZTEST(encoder_print_once_per_tick, test_missed_two_ticks)
{
	encoder_print_status_t encoder_print_status;
	encoder_print_init_t init = {
		.get_value = get_value,
		.fire_abort = fire_abort,
		.load_line = load_line,
		.load_error_cb = error_cb_fail_test,
		.inst = &encoder_print_status,
		.sequential_fires = 1,
		.fire_every_ticks = 1,
		.print_first_line_after_encoder_tick = 1};

	encoder_print_init(&encoder_print_status, &init);
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 1 (plan to print 0)
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 2 (plan to print 1), not printed yet jump forward
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 3 (plan to print 2), not printed yet jump forward
	fire_if_not_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(fire_abort_called, 1, "fire_abort not called 1 time");
	encoder_value++;
	encoder_tick_handler(&encoder_print_status); // -- encoder 4 (plan to print 3), detect
	fire_if_not_aborted(&encoder_print_status);
	zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
	zassert_equal(fire_abort_called, 2, "fire_abort not called after jump detected");
	zassert_equal(load_line_called_with, 4, "load_line not called with 4");
	zassert_equal(encoder_print_status.lost_lines_count, 3, "lost_lines_count not 3");
	zassert_equal(encoder_print_status.lost_lines[0], 1, "lost_lines[0] not 1");
	zassert_equal(encoder_print_status.lost_lines[1], 2, "lost_lines[1] not 2");
	zassert_equal(encoder_print_status.lost_lines[2], 3, "lost_lines[2] not 3");
	encoder_advance(&encoder_print_status, 1); // -- encoder 5 (plan to print 4)
	zassert_equal(encoder_print_status.last_printed_line, 4, "last_printed_line not 4");
}

ZTEST_SUITE(encoder_print_once_per_tick, NULL, NULL, before, NULL, NULL);