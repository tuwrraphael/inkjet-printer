#-------------------------------------------------------------------------------
# Zephyr Example Application
#
# Copyright (c) 2021 Nordic Semiconductor ASA
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.13.1)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})

project(app LANGUAGES C)

set(PROTOC_OPTIONS "--experimental_allow_proto3_optional")



list(APPEND CMAKE_MODULE_PATH ${ZEPHYR_BASE}/modules/nanopb)
include(nanopb)
zephyr_nanopb_sources(app src/printer_system_state.proto)
zephyr_nanopb_sources(app src/printer_system_state_response.proto)
zephyr_nanopb_sources(app src/printer_request.proto)
zephyr_nanopb_sources(app src/pressure_control.proto)
zephyr_nanopb_sources(app src/print_control.proto)

target_sources(app PRIVATE src/main.c)
target_sources(app PRIVATE src/printhead_routines.c)
target_sources(app PRIVATE src/pressure_control.c)
target_sources(app PRIVATE src/pressure_control_algorithm.c)
target_sources(app PRIVATE src/printer_system_smf.c)
target_sources(app PRIVATE src/failure_handling.c)
target_sources(app PRIVATE src/webusb.c)
target_sources(app PRIVATE src/webusb_initialize.c)
target_sources(app PRIVATE src/dropwatcher_light.c)
target_sources(app PRIVATE src/moving_average.c)
target_sources(app PRIVATE src/print_control.c)
include_directories(include)

