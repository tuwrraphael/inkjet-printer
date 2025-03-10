/*
 * Copyright (c) 2015-2019 Intel Corporation
 *
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file
 * @brief WebUSB enabled custom class driver
 *
 * This is a modified version of CDC ACM class driver
 * to support the WebUSB.
 */

#include <zephyr/logging/log.h>
LOG_MODULE_REGISTER(webusb, CONFIG_APP_LOG_LEVEL);

#include <zephyr/sys/byteorder.h>
#include <zephyr/usb/usb_device.h>
#include <usb_descriptor.h>
#include <string.h>

#include <pb_decode.h>
#include <pb_encode.h>
#include <pb_common.h>

#include "src/printer_request.pb.h"
#include "src/printer_system_state_response.pb.h"
#include "webusb.h"
#include "dropwatcher_light.h"
#include "printer_system_smf.h"
#include "failure_handling.h"
#include "pressure_control.h"
#include "print_control.h"
#include "regulator.h"
#include "printhead_routines.h"

/* Max packet size for Bulk endpoints */
#if defined(CONFIG_USB_DC_HAS_HS_SUPPORT)
#define WEBUSB_BULK_EP_MPS 512
#else
#define WEBUSB_BULK_EP_MPS 64
#endif

/* Number of interfaces */
#define WEBUSB_NUM_ITF 0x01
/* Number of Endpoints in the custom interface */
#define WEBUSB_NUM_EP 0x02

#define WEBUSB_IN_EP_IDX 0
#define WEBUSB_OUT_EP_IDX 1

static struct webusb_req_handlers *req_handlers;

uint8_t rx_buf[WEBUSB_BULK_EP_MPS];

#define INITIALIZER_IF(num_ep, iface_class)          \
	{                                                \
		.bLength = sizeof(struct usb_if_descriptor), \
		.bDescriptorType = USB_DESC_INTERFACE,       \
		.bInterfaceNumber = 0,                       \
		.bAlternateSetting = 0,                      \
		.bNumEndpoints = num_ep,                     \
		.bInterfaceClass = iface_class,              \
		.bInterfaceSubClass = 0,                     \
		.bInterfaceProtocol = 0,                     \
		.iInterface = 0,                             \
	}

#define INITIALIZER_IF_EP(addr, attr, mps, interval) \
	{                                                \
		.bLength = sizeof(struct usb_ep_descriptor), \
		.bDescriptorType = USB_DESC_ENDPOINT,        \
		.bEndpointAddress = addr,                    \
		.bmAttributes = attr,                        \
		.wMaxPacketSize = sys_cpu_to_le16(mps),      \
		.bInterval = interval,                       \
	}

USBD_CLASS_DESCR_DEFINE(primary, 0)
struct
{
	struct usb_if_descriptor if0;
	struct usb_ep_descriptor if0_in_ep;
	struct usb_ep_descriptor if0_out_ep;
} __packed webusb_desc = {
	.if0 = INITIALIZER_IF(WEBUSB_NUM_EP, USB_BCC_VENDOR),
	.if0_in_ep = INITIALIZER_IF_EP(AUTO_EP_IN, USB_DC_EP_BULK,
								   WEBUSB_BULK_EP_MPS, 0),
	.if0_out_ep = INITIALIZER_IF_EP(AUTO_EP_OUT, USB_DC_EP_BULK,
									WEBUSB_BULK_EP_MPS, 0),
};

static int process_printer_system_state_msg(void *priv);
static uint8_t tx_buf[64];
static int next_system_sate_message = 0;

/**
 * @brief Custom handler for standard requests in order to
 *        catch the request and return the WebUSB Platform
 *        Capability Descriptor.
 *
 * @param pSetup    Information about the request to execute.
 * @param len       Size of the buffer.
 * @param data      Buffer containing the request result.
 *
 * @return  0 on success, negative errno code on fail.
 */
int webusb_custom_handle_req(struct usb_setup_packet *pSetup,
							 int32_t *len, uint8_t **data)
{
	LOG_DBG("");

	/* Call the callback */
	if (req_handlers && req_handlers->custom_handler)
	{
		return req_handlers->custom_handler(pSetup, len, data);
	}

	return -EINVAL;
}

/**
 * @brief Handler called for WebUSB vendor specific commands.
 *
 * @param pSetup    Information about the request to execute.
 * @param len       Size of the buffer.
 * @param data      Buffer containing the request result.
 *
 * @return  0 on success, negative errno code on fail.
 */
int webusb_vendor_handle_req(struct usb_setup_packet *pSetup,
							 int32_t *len, uint8_t **data)
{
	/* Call the callback */
	if (req_handlers && req_handlers->vendor_handler)
	{
		return req_handlers->vendor_handler(pSetup, len, data);
	}

	return -EINVAL;
}

/**
 * @brief Register Custom and Vendor request callbacks
 *
 * This function registers Custom and Vendor request callbacks
 * for handling the device requests.
 *
 * @param [in] handlers Pointer to WebUSB request handlers structure
 */
void webusb_register_request_handlers(struct webusb_req_handlers *handlers)
{
	req_handlers = handlers;
}

static void webusb_write_cb(uint8_t ep, int size, void *priv)
{
	LOG_DBG("ep %x size %u", ep, size);
	if (next_system_sate_message != 0)
	{
		process_printer_system_state_msg(priv);
	}
}
const pb_msgdesc_t *decode_printer_request_type(pb_istream_t *stream)
{
	pb_wire_type_t wire_type;
	uint32_t tag;
	bool eof;

	while (pb_decode_tag(stream, &wire_type, &tag, &eof))
	{
		if (wire_type == PB_WT_STRING)
		{
			pb_field_iter_t iter;
			if (pb_field_iter_begin(&iter, PrinterRequest_fields, NULL) &&
				pb_field_iter_find(&iter, tag))
			{
				/* Found our field. */
				return iter.submsg_desc;
			}
		}

		/* Wasn't our field.. */
		pb_skip_field(stream, wire_type);
	}

	return NULL;
}

bool decode_unionmessage_contents(pb_istream_t *stream, const pb_msgdesc_t *messagetype, void *dest_struct)
{
	pb_istream_t substream;
	bool status;
	if (!pb_make_string_substream(stream, &substream))
		return false;

	status = pb_decode(&substream, messagetype, dest_struct);
	pb_close_string_substream(stream, &substream);
	return status;
}

static PrinterSystemState map_system_state_to_proto(enum printer_system_smf_state state)
{
	switch (state)
	{
	case PRINTER_SYSTEM_STARTUP:
		return PrinterSystemState_PrinterSystemState_STARTUP;
	case PRINTER_SYSTEM_IDLE:
		return PrinterSystemState_PrinterSystemState_IDLE;
	case PRINTER_SYSTEM_ERROR:
		return PrinterSystemState_PrinterSystemState_ERROR;
	case PRINTER_SYSTEM_DROPWATCHER:
		return PrinterSystemState_PrinterSystemState_DROPWATCHER;
	case PRINTER_SYSTEM_PRINT:
		return PrinterSystemState_PrinterSystemState_PRINT;
	case PRINTER_SYSTEM_KEEP_ALIVE:
		return PrinterSystemState_PrinterSystemState_KEEP_ALIVE;
	default:
		return PrinterSystemState_PrinterSystemState_UNSPECIFIED;
	}
}

static PressureControlAlgorithm map_pressure_control_algorithm_to_proto(pressure_control_algorithm_t algorithm)
{
	switch (algorithm)
	{
	case PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE:
		return PressureControlAlgorithm_PressureControlAlgorithm_TARGET_PRESSURE;
	case PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT:
		return PressureControlAlgorithm_PressureControlAlgorithm_FEED_WITH_LIMIT;
	case PRESSURE_CONTROL_ALGORITHM_NONE:
		return PressureControlAlgorithm_PressureControlAlgorithm_NONE;
	default:
		return PressureControlAlgorithm_PressureControlAlgorithm_UNSPECIFIED;
	}
}

static PressureControlDirection map_pressure_control_direction_to_proto(pressure_direction_t direction)
{
	switch (direction)
	{
	case PRESSURE_DIRECTION_VACUUM:
		return PressureControlDirection_PressureControlDirection_VACUUM;
	case PRESSURE_DIRECTION_PRESSURE:
		return PressureControlDirection_PressureControlDirection_PRESSURE;
	default:
		return PressureControlDirection_PressureControlDirection_UNSPECIFIED;
	}
}

static pressure_direction_t map_proto_to_pressure_control_direction(PressureControlDirection direction)
{
	switch (direction)
	{
	case PressureControlDirection_PressureControlDirection_VACUUM:
		return PRESSURE_DIRECTION_VACUUM;
	case PressureControlDirection_PressureControlDirection_PRESSURE:
		return PRESSURE_DIRECTION_PRESSURE;
	default:
		return PRESSURE_DIRECTION_VACUUM;
	}
}

static pressure_control_algorithm_t map_proto_to_pressure_control_algorithm(PressureControlAlgorithm algorithm)
{
	switch (algorithm)
	{
	case PressureControlAlgorithm_PressureControlAlgorithm_TARGET_PRESSURE:
		return PRESSURE_CONTROL_ALGORITHM_TARGET_PRESSURE;
	case PressureControlAlgorithm_PressureControlAlgorithm_FEED_WITH_LIMIT:
		return PRESSURE_CONTROL_ALGORITHM_FEED_WITH_LIMIT;
	default:
		return PRESSURE_CONTROL_ALGORITHM_NONE;
	}
}

static EncoderMode map_encoder_mode_to_proto(encoder_mode_t encoder_mode)
{
	switch (encoder_mode)
	{
	case ENCODER_MODE_OFF:
		return EncoderMode_EncoderMode_OFF;
	case ENCODER_MODE_ON:
		return EncoderMode_EncoderMode_ON;
	case ENCODER_MODE_PAUSED:
		return EncoderMode_EncoderMode_PAUSED;
	default:
		return EncoderMode_EncoderMode_UNSPECIFIED;
	}
}

static void map_pump_parameters_to_proto(pressure_control_algorithm_init_t *in, PressureControlPumpParameters *out)
{
	out->algorithm = map_pressure_control_algorithm_to_proto(in->algorithm);
	out->direction = map_pressure_control_direction_to_proto(in->direction);
	out->target_pressure = in->target_pressure;
	out->max_pressure_limit = in->max_pressure_limit;
	out->min_pressure_limit = in->min_pressure_limit;
	out->feed_pwm = in->feed_pwm;
	out->feed_time = in->feed_time;
}

static int set_printer_system_state_msg(pb_ostream_t *tx_stream)
{
	PrinterSystemStateResponse response = PrinterSystemStateResponse_init_zero;
	response.state = map_system_state_to_proto(printer_system_smf_get_state());
	response.error_flags = failure_handling_get_error_state();
	pressure_control_info_t pressure_info;
	switch (next_system_sate_message)
	{
	case 0:
		print_control_info_t print_control_info;
		print_control_get_info(&print_control_info);
		response.has_print_control = true;
		response.print_control.has_encoder_mode_settings = true;
		response.print_control.encoder_mode_settings.fire_every_ticks = print_control_info.encoder_mode_settings.fire_every_ticks;
		response.print_control.encoder_mode_settings.print_first_line_after_encoder_tick = print_control_info.encoder_mode_settings.print_first_line_after_encoder_tick;
		response.print_control.encoder_mode_settings.sequential_fires = print_control_info.encoder_mode_settings.sequential_fires;
		response.print_control.encoder_value = print_control_info.encoder_value;
		response.print_control.expected_encoder_value = print_control_info.expected_encoder_value;
		response.print_control.last_printed_line = print_control_info.last_printed_line;
		response.print_control.lost_lines_count = print_control_info.lost_lines_count;
		response.print_control.lost_lines_by_slow_data = print_control_info.lost_lines_by_slow_data;
		response.print_control.printed_lines = print_control_info.printed_lines;
		response.print_control.nozzle_priming_active = print_control_info.nozzle_priming_active;
		response.print_control.encoder_mode = map_encoder_mode_to_proto(print_control_info.encoder_mode);
		break;
	case 1:
		pressure_control_get_info(&pressure_info);
		response.has_pressure_control = true;
		response.pressure_control.has_parameters = true;

		response.pressure_control.parameters.has_ink_pump = true;
		map_pump_parameters_to_proto(&pressure_info.algorithm[PRESSURE_CONTROL_INK_PUMP_IDX], &response.pressure_control.parameters.ink_pump);

		response.pressure_control.pressure = pressure_info.pressure;
		response.pressure_control.done = pressure_info.done;
		response.pressure_control.enabled = pressure_info.enabled;
		break;
	case 2:
		pressure_control_info_t pressure_info;
		pressure_control_get_info(&pressure_info);
		response.has_pressure_control = true;
		response.pressure_control.has_parameters = true;

		response.pressure_control.parameters.has_capping_pump = true;
		map_pump_parameters_to_proto(&pressure_info.algorithm[PRESSURE_CONTROL_CAPPING_PUMP_IDX], &response.pressure_control.parameters.capping_pump);

		response.pressure_control.pressure = pressure_info.pressure;
		response.pressure_control.done = pressure_info.done;
		response.pressure_control.enabled = pressure_info.enabled;
		break;
	case 3:
		response.has_waveform_control = true;
		regulator_info_t info;
		regulator_get_info(&info);
		printhead_routines_info_t printhead_info;
		printhead_routines_get_info(&printhead_info);
		response.waveform_control.has_voltage_mv = info.voltage_reading_available;
		response.waveform_control.voltage_mv = info.voltage_mv;
		response.waveform_control.set_voltage_mv = info.set_voltage_mv;
		response.waveform_control.clock_period_ns = printhead_info.activated_period;
	default:
		break;
	}
	bool status = pb_encode(tx_stream, PrinterSystemStateResponse_fields, &response);
	if (status != true)
	{
		LOG_ERR("Failed to encode PrinterSystemStateResponse %d: %s", next_system_sate_message, tx_stream->errmsg);
		return status;
	}
	return 0;
}

static int process_printer_system_state_msg(void *priv)
{
	struct usb_cfg_data *cfg = priv;
	pb_ostream_t tx_stream = pb_ostream_from_buffer(tx_buf, sizeof(tx_buf));
	int res = set_printer_system_state_msg(&tx_stream);
	if (res != 0)
	{
		next_system_sate_message = 0;
		return res;
	}
	else
	{
		usb_transfer(cfg->endpoint[WEBUSB_IN_EP_IDX].ep_addr, tx_buf, tx_stream.bytes_written,
					 USB_TRANS_WRITE, webusb_write_cb, cfg);
		next_system_sate_message = (next_system_sate_message + 1) % 4;
	}
	return 0;
}

static void webusb_read_cb(uint8_t ep, int size, void *priv)
{
	struct usb_cfg_data *cfg = priv;

	LOG_DBG("cfg %p ep %x size %u", cfg, ep, size);

	if (size <= 0)
	{
		goto done;
	}

	pb_istream_t stream = pb_istream_from_buffer(rx_buf, size);

	const pb_msgdesc_t *type = decode_printer_request_type(&stream);
	bool status = false;

	if (type == GetPrinterSystemStateRequest_fields)
	{
		GetPrinterSystemStateRequest request = {};
		status = decode_unionmessage_contents(&stream, GetPrinterSystemStateRequest_fields, &request);
		if (status)
		{
			if (next_system_sate_message != 0)
			{
				LOG_ERR("GetPrinterSystemStateRequest: already processing a request");
			}
			process_printer_system_state_msg(priv);
		}
		else
		{
			LOG_ERR("Failed to decode GetPrinterSystemStateRequest");
		}
	}
	else if (type == ChangePrinterSystemStateRequest_fields)
	{
		ChangePrinterSystemStateRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangePrinterSystemStateRequest_fields, &request);
		if (status)
		{
			if (request.state == PrinterSystemState_PrinterSystemState_IDLE)
			{
				go_to_idle();
			}
			else if (request.state == PrinterSystemState_PrinterSystemState_DROPWATCHER)
			{
				go_to_dropwatcher();
			}
			else if (request.state == PrinterSystemState_PrinterSystemState_ERROR)
			{
				printer_system_smf_go_to_safe_state();
			}
			else if (request.state == PrinterSystemState_PrinterSystemState_PRINT)
			{
				go_to_print();
			}
			else if (request.state == PrinterSystemState_PrinterSystemState_KEEP_ALIVE)
			{
				go_to_keep_alive();
			}
			else
			{
				LOG_WRN("Transition to %d is not supported", request.state);
			}
			LOG_DBG("ChangePrinterSystemStateRequest: state=%d", request.state);
		}
		else
		{
			LOG_ERR("Failed to decode ChangePrinterSystemStateRequest");
		}
	}
	else if (type == ChangeDropwatcherParametersRequest_fields)
	{
		ChangeDropwatcherParametersRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeDropwatcherParametersRequest_fields, &request);
		if (status)
		{
			set_light_timing(request.delay_nanos, request.flash_on_time_nanos);
		}
		else
		{
			LOG_ERR("Failed to decode ChangeDropwatcherParametersRequest");
		}
	}
	else if (type == CameraFrameRequest_fields)
	{
		CameraFrameRequest request = {};
		status = decode_unionmessage_contents(&stream, CameraFrameRequest_fields, &request);
		if (status)
		{
			request_printhead_fire();
			LOG_INF("CameraFrameRequest");
		}
		else
		{
			LOG_ERR("Failed to decode CameraFrameRequest");
		}
	}
	else if (type == ChangeNozzleDataRequest_fields)
	{
		ChangeNozzleDataRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeNozzleDataRequest_fields, &request);
		if (status)
		{
			request_set_nozzle_data(request.data);
			LOG_INF("ChangeNozzleDataRequest: %x, %x, %x, %x", request.data[0], request.data[1], request.data[2], request.data[3]);
		}
		else
		{
			LOG_ERR("Failed to decode SetNozzleDataRequest");
		}
	}
	else if (type == ChangePressureControlParametersRequest_fields)
	{
		ChangePressureControlParametersRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangePressureControlParametersRequest_fields, &request);
		if (status)
		{

			if (request.parameters.has_ink_pump)
			{
				pressure_control_algorithm_init_t ink_pump_init;
				ink_pump_init.algorithm = map_proto_to_pressure_control_algorithm(request.parameters.ink_pump.algorithm);
				ink_pump_init.direction = map_proto_to_pressure_control_direction(request.parameters.ink_pump.direction);
				ink_pump_init.target_pressure = request.parameters.ink_pump.target_pressure;
				ink_pump_init.max_pressure_limit = request.parameters.ink_pump.max_pressure_limit;
				ink_pump_init.min_pressure_limit = request.parameters.ink_pump.min_pressure_limit;
				ink_pump_init.feed_pwm = request.parameters.ink_pump.feed_pwm;
				ink_pump_init.feed_time = request.parameters.ink_pump.feed_time;
				pressure_control_update_parameters(PRESSURE_CONTROL_INK_PUMP_IDX, &ink_pump_init);
			}

			if (request.parameters.has_capping_pump)
			{
				pressure_control_algorithm_init_t capping_pump_init;
				capping_pump_init.algorithm = map_proto_to_pressure_control_algorithm(request.parameters.capping_pump.algorithm);
				capping_pump_init.direction = map_proto_to_pressure_control_direction(request.parameters.capping_pump.direction);
				capping_pump_init.target_pressure = request.parameters.capping_pump.target_pressure;
				capping_pump_init.max_pressure_limit = request.parameters.capping_pump.max_pressure_limit;
				capping_pump_init.min_pressure_limit = request.parameters.capping_pump.min_pressure_limit;
				capping_pump_init.feed_pwm = request.parameters.capping_pump.feed_pwm;
				capping_pump_init.feed_time = request.parameters.capping_pump.feed_time;
				pressure_control_update_parameters(PRESSURE_CONTROL_CAPPING_PUMP_IDX, &capping_pump_init);
			}

			if (request.parameters.enable)
			{
				pressure_control_enable();
			}
			else
			{
				pressure_control_disable();
			}
		}
		else
		{
			LOG_ERR("Failed to decode PressureControlChangeParametersRequest");
		}
	}
	else if (type == ChangeEncoderPositionRequest_fields)
	{
		ChangeEncoderPositionRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeEncoderPositionRequest_fields, &request);
		if (status)
		{
			print_control_set_encoder_position(request.position);
			LOG_INF("SetEncoderPositionRequest: position %d", request.position);
		}
		else
		{
			LOG_ERR("Failed to decode SetEncoderPositionRequest");
		}
	}
	else if (type == ChangeEncoderModeSettingsRequest_fields)
	{
		ChangeEncoderModeSettingsRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeEncoderModeSettingsRequest_fields, &request);
		if (status)
		{
			print_control_encoder_mode_settings_t settings;
			settings.fire_every_ticks = request.encoder_mode_settings.fire_every_ticks;
			settings.print_first_line_after_encoder_tick = request.encoder_mode_settings.print_first_line_after_encoder_tick;
			settings.sequential_fires = request.encoder_mode_settings.sequential_fires;
			settings.start_paused = request.encoder_mode_settings.start_paused;
			settings.lines_to_print = request.encoder_mode_settings.lines_to_print;
			request_change_encoder_mode_settings(&settings);
			LOG_INF("ChangeEncoderModeSettingsRequest: fire_every_ticks %d, print_first_line_after_encoder_tick %d, sequential_fires %d",
					request.encoder_mode_settings.fire_every_ticks, request.encoder_mode_settings.print_first_line_after_encoder_tick, request.encoder_mode_settings.sequential_fires);
		}
		else
		{
			LOG_ERR("Failed to decode ChangeEncoderModeSettingsRequest");
		}
	}
	else if (type == ChangePrintMemoryRequest_fields)
	{
		ChangePrintMemoryRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangePrintMemoryRequest_fields, &request);
		if (status)
		{
			print_control_set_print_memory(request.offset, request.data, request.data_count);
			LOG_INF("ChangePrintMemoryRequest: offset %d, data_count %d", request.offset, request.data_count);
		}
		else
		{
			LOG_ERR("Failed to decode ChangePrintMemoryRequest");
		}
	}
	else if (type == NozzlePrimingRequest_fields)
	{
		NozzlePrimingRequest request = {};
		status = decode_unionmessage_contents(&stream, NozzlePrimingRequest_fields, &request);
		if (status)
		{
			request_prime_nozzles();
			LOG_INF("NozzlePrimingRequest");
		}
		else
		{
			LOG_ERR("Failed to decode NozzlePrimingRequest");
		}
	}
	else if (type == ChangeEncoderModeRequest_fields)
	{
		ChangeEncoderModeRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeEncoderModeRequest_fields, &request);
		if (status)
		{
			request_change_encoder_mode(request.paused);
			LOG_INF("ChangeEncoderModeRequest: paused %d", request.paused);
		}
		else
		{
			LOG_ERR("Failed to decode ChangeEncoderModeRequest");
		}
	}
	else if (type == ChangeWaveformControlSettingsRequest_fields)
	{
		ChangeWaveformControlSettingsRequest request = {};
		status = decode_unionmessage_contents(&stream, ChangeWaveformControlSettingsRequest_fields, &request);
		if (status)
		{
			waveform_settings_t settings;
			settings.voltage = request.settings.voltage_mv;
			settings.clock_period_ns = request.settings.clock_period_ns;
			request_set_waveform_settings(&settings);
			LOG_INF("ChangeWaveformControlSettingsRequest: voltage %d", request.settings.voltage_mv);
		}
		else
		{
			LOG_ERR("Failed to decode ChangeWaveformControlSettingsRequest");
		}
	}
	else
	{
		LOG_INF("Unknown message type");
	}
done:
	usb_transfer(ep, rx_buf, sizeof(rx_buf), USB_TRANS_READ,
				 webusb_read_cb, cfg);
}

/**
 * @brief Callback used to know the USB connection status
 *
 * @param status USB device status code.
 */
static void webusb_dev_status_cb(struct usb_cfg_data *cfg,
								 enum usb_dc_status_code status,
								 const uint8_t *param)
{
	ARG_UNUSED(param);
	ARG_UNUSED(cfg);

	/* Check the USB status and do needed action if required */
	switch (status)
	{
	case USB_DC_ERROR:
		LOG_DBG("USB device error");
		break;
	case USB_DC_RESET:
		LOG_DBG("USB device reset detected");
		break;
	case USB_DC_CONNECTED:
		LOG_DBG("USB device connected");
		break;
	case USB_DC_CONFIGURED:
		LOG_DBG("USB device configured");
		webusb_read_cb(cfg->endpoint[WEBUSB_OUT_EP_IDX].ep_addr,
					   0, cfg);
		break;
	case USB_DC_DISCONNECTED:
		LOG_DBG("USB device disconnected");
		break;
	case USB_DC_SUSPEND:
		LOG_DBG("USB device suspended");
		break;
	case USB_DC_RESUME:
		LOG_DBG("USB device resumed");
		break;
	case USB_DC_UNKNOWN:
	default:
		LOG_DBG("USB unknown state");
		break;
	}
}

/* Describe EndPoints configuration */
static struct usb_ep_cfg_data webusb_ep_data[] = {
	{.ep_cb = usb_transfer_ep_callback,
	 .ep_addr = AUTO_EP_IN},
	{.ep_cb = usb_transfer_ep_callback,
	 .ep_addr = AUTO_EP_OUT}};

USBD_DEFINE_CFG_DATA(webusb_config) = {
	.usb_device_description = NULL,
	.interface_descriptor = &webusb_desc.if0,
	.cb_usb_status = webusb_dev_status_cb,
	.interface = {
		.class_handler = NULL,
		.custom_handler = webusb_custom_handle_req,
		.vendor_handler = webusb_vendor_handle_req,
	},
	.num_endpoints = ARRAY_SIZE(webusb_ep_data),
	.endpoint = webusb_ep_data};
