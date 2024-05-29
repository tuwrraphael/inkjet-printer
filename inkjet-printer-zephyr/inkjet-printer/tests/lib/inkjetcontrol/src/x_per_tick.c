#include <limits.h>

#include <zephyr/ztest.h>

#include <lib/inkjetcontrol.h>

static int32_t encoder_value = 0;
static uint32_t fire_abort_called = 0;
static int32_t load_line_called_with = 0;
static bool last_fire_aborted = false;

static int32_t get_value(void)
{
    return encoder_value;
}

static void fire_abort(void)
{
    fire_abort_called++;
    last_fire_aborted = true;
    return;
}

static void load_line(uint32_t line)
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
        printhead_fired_handler(status);
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

ZTEST(encoder_print_x_per_tick, test_normal_operation)
{
    encoder_print_init_t init = {
        .get_value = get_value,
        .fire_abort = fire_abort,
        .load_line = load_line,
        .sequential_fires = 2,
        .fire_every_ticks = 1,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_status_t encoder_print_status;

    encoder_print_init(&encoder_print_status, &init);
    encoder_advance(&encoder_print_status, 1);
    zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
    encoder_advance(&encoder_print_status, 1);
    zassert_equal(encoder_print_status.last_printed_line, 3, "last_printed_line not 3");
}

ZTEST(encoder_print_x_per_tick, test_2x_missed_tick)
{
    encoder_print_init_t init = {
        .get_value = get_value,
        .fire_abort = fire_abort,
        .load_line = load_line,
        .sequential_fires = 2,
        .fire_every_ticks = 1,
        .print_first_line_after_encoder_tick = 1};

    encoder_print_status_t encoder_print_status;

    encoder_print_init(&encoder_print_status, &init);
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 1 (plan to print 0 and 1)
    printhead_fired_handler(&encoder_print_status);
    zassert_equal(last_fire_aborted, false, "last_fire_aborted not false");
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 2 (plan to print 2 and 3)
    printhead_fired_handler(&encoder_print_status);
    zassert_equal(last_fire_aborted, true, "last_fire_aborted not true");
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 3 (plan to print 4 and 5), detect
    zassert_equal(encoder_print_status.last_printed_line, 1, "last_printed_line not 1");
    zassert_equal(load_line_called_with, 6, "load_line not called with 6");
    zassert_equal(encoder_print_status.lost_lines_count, 4, "lost_lines_count not 4");
    zassert_equal(encoder_print_status.lost_lines[0], 2, "lost_lines[0] not 2");
    zassert_equal(encoder_print_status.lost_lines[1], 3, "lost_lines[1] not 3");
    zassert_equal(encoder_print_status.lost_lines[2], 4, "lost_lines[2] not 4");
    zassert_equal(encoder_print_status.lost_lines[3], 5, "lost_lines[3] not 5");
    encoder_value++;
    encoder_tick_handler(&encoder_print_status); // -- encoder 4 (plan to print 6 and 7)
    printhead_fired_handler(&encoder_print_status);
    zassert_equal(encoder_print_status.last_printed_line, 6, "last_printed_line not 6");
    printhead_fired_handler(&encoder_print_status);
    zassert_equal(encoder_print_status.last_printed_line, 7, "last_printed_line not 7");
}

ZTEST_SUITE(encoder_print_x_per_tick, NULL, NULL, before, NULL, NULL);