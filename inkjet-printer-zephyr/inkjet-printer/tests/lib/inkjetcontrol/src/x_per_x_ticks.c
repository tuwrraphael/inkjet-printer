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

static void error_cb_fail_test(void *inst)
{
	printf("Error callback called\n");
	ztest_test_fail();
}

static void load_line(void *inst, uint32_t line, bool wait_fired)
{
	load_line_called_with = line;
	encoder_print_status_t *encoder_print_status = (encoder_print_status_t *)inst;
	encoder_signal_load_line_completed(encoder_print_status, line);
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
        encoder_fire_issued_handler(status);
        encoder_fire_cycle_completed_handler(status);
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

ZTEST(encoder_print_x_per_x_ticks, test_270dpi_normal_operation)
{
    encoder_print_status_t encoder_print_status;
    encoder_print_init_t init = {
        .get_value = get_value,
        .fire_abort = fire_abort,
        .load_line = load_line,
        .load_error_cb = error_cb_fail_test,
        .inst = &encoder_print_status,
        .sequential_fires = 3,
        .fire_every_ticks = 2,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_init(&encoder_print_status, &init);
    encoder_advance(&encoder_print_status, 1); // -- encoder 1 (plan to print 0, 1, 2)
    zassert_equal(encoder_print_status.last_printed_line, 2, "last_printed_line not 2");
    encoder_advance(&encoder_print_status, 1); // -- encoder 2 (skip)
    zassert_equal(encoder_print_status.last_printed_line, 2, "last_printed_line not 2");
    encoder_advance(&encoder_print_status, 1); // -- encoder 3 (plan to print 3, 4, 5)
    zassert_equal(encoder_print_status.last_printed_line, 5, "last_printed_line not 5");
}

ZTEST(encoder_print_x_per_x_ticks, test_270dpi_missed_tick)
{
    encoder_print_status_t encoder_print_status;
    encoder_print_init_t init = {
        .get_value = get_value,
        .fire_abort = fire_abort,
        .load_line = load_line,
        .load_error_cb = error_cb_fail_test,
        .inst = &encoder_print_status,
        .sequential_fires = 3,
        .fire_every_ticks = 2,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_init(&encoder_print_status, &init);
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 1 (plan to print 0, 1, 2)
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 2 (skip)
    encoder_advance(&encoder_print_status, 1);   // -- encoder 3 (plan to print 3, 4, 5)
    zassert_equal(encoder_print_status.last_printed_line, 2, "last_printed_line not 2");
    encoder_advance(&encoder_print_status, 1); // -- encoder 4 (skip), detect
    zassert_equal(encoder_print_status.last_printed_line, 2, "last_printed_line not 2");
    zassert_equal(load_line_called_with, 6, "load_line not called with 7");
    zassert_equal(encoder_print_status.lost_lines_count, 3, "lost_lines_count not 3");
    zassert_equal(encoder_print_status.lost_lines[0], 3, "lost_lines[0] not 3");
    zassert_equal(encoder_print_status.lost_lines[1], 4, "lost_lines[1] not 4");
    zassert_equal(encoder_print_status.lost_lines[2], 5, "lost_lines[2] not 5");
    encoder_advance(&encoder_print_status, 1); // -- encoder 5 (plan to print 6, 7, 8)
    zassert_equal(encoder_print_status.last_printed_line, 8, "last_printed_line not 8");
}

ZTEST_SUITE(encoder_print_x_per_x_ticks, NULL, NULL, before, NULL, NULL);