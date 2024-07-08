#include <limits.h>

#include <zephyr/ztest.h>

#include <lib/inkjetcontrol/test_pattern.h>

ZTEST(test_pattern, test_get_nozzle_zig_zag)
{
    zassert_equal(get_nozzle_zig_zag(0), 127, "get_nozzle_zig_zag(0) should return 127");
    zassert_equal(get_nozzle_zig_zag(1), 126, "get_nozzle_zig_zag(1) should return 126");
    zassert_equal(get_nozzle_zig_zag(2), 125, "get_nozzle_zig_zag(1) should return 125");
    zassert_equal(get_nozzle_zig_zag(127), 0, "get_nozzle_zig_zag(127) should return 0");
    zassert_equal(get_nozzle_zig_zag(128), 0, "get_nozzle_zig_zag(128) should return 0");
    zassert_equal(get_nozzle_zig_zag(129), 1, "get_nozzle_zig_zag(129) should return 1");
    zassert_equal(get_nozzle_zig_zag(130), 2, "get_nozzle_zig_zag(130) should return 2");
    zassert_equal(get_nozzle_zig_zag(255), 127, "get_nozzle_zig_zag(255) should return 127");
    zassert_equal(get_nozzle_zig_zag(256), 127, "get_nozzle_zig_zag(256) should return 127");
    zassert_equal(get_nozzle_zig_zag(257), 126, "get_nozzle_zig_zag(257) should return 126");
}

ZTEST_SUITE(test_pattern, NULL, NULL, NULL, NULL, NULL);