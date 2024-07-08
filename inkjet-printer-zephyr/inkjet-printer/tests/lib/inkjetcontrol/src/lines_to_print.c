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

ZTEST(encoder_lines_to_print, test_prints_no_lines)
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
        .lines_to_print = 0,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_init(&encoder_print_status, &init);
    encoder_advance(&encoder_print_status, 1); // -- encoder 1
    zassert_equal(encoder_print_status.last_printed_line, -1, "something was printed");
    encoder_advance(&encoder_print_status, 1); // -- encoder 2
    zassert_equal(encoder_print_status.last_printed_line, -1, "something was printed");
    zassert_equal(encoder_print_status.printed_lines, 0, "printed lines not 0");
}

ZTEST(encoder_lines_to_print, test_prints_two_lines)
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
        .lines_to_print = 2,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_init(&encoder_print_status, &init);
    encoder_advance(&encoder_print_status, 1); // -- encoder 1
    zassert_equal(encoder_print_status.last_printed_line, 0, "last_printed_line not 0");
    encoder_advance(&encoder_print_status, 1); // -- encoder 2
    zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
    zassert_equal(encoder_print_status.printed_lines, 2, "printed lines not 2");
    encoder_advance(&encoder_print_status, 1); // -- encoder 3
    zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
    zassert_equal(encoder_print_status.printed_lines, 2, "printed lines not 2");
}


ZTEST_SUITE(encoder_lines_to_print, NULL, NULL, before, NULL, NULL);