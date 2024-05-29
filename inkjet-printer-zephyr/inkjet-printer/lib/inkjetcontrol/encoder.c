#include <zephyr/logging/log.h>

#include <lib/inkjetcontrol/encoder.h>

LOG_MODULE_REGISTER(encoder, CONFIG_INKJETCONTROL_LOG_LEVEL);

static void load_line(encoder_print_status_t *status, uint32_t line)
{
	status->init.load_line(status->init.inst, line);
	status->last_loaded_line = line;
	LOG_INF("Loaded line %d", line);
}

void encoder_print_init(encoder_print_status_t *status, encoder_print_init_t *init)
{
	memcpy(&status->init, init, sizeof(encoder_print_init_t));
	status->remaining_sequential_fires = 0;
	status->expected_encoder_value = init->print_first_line_after_encoder_tick;
	status->last_printed_line = -1;
	status->lost_lines_count = 0;
	for (uint32_t i = 0; i < MAX_LOST_LINES_MEMORY; i++)
	{
		status->lost_lines[i] = -1;
	}
	load_line(status, 0);
	LOG_DBG("Encoder print initialized");
}

void encoder_tick_handler(encoder_print_status_t *status)
{
	int32_t encoder_value = status->init.get_value(status->init.inst);
	LOG_INF("Encoder tick handler %d", encoder_value);

	if (status->remaining_sequential_fires > 0)
	{
		LOG_INF("Encoder tick during firing cycle");
	}
	else
	{
		LOG_INF("Encoder tick %d, expected %d", encoder_value, status->expected_encoder_value);
		if (encoder_value < status->expected_encoder_value)
		{
			status->init.fire_abort(status->init.inst);
			LOG_INF("Encoder jumped back, stop timer");
		}
		else if (encoder_value > status->expected_encoder_value)
		{
			status->init.fire_abort(status->init.inst);
			uint32_t next_printable_encoder_value = status->init.print_first_line_after_encoder_tick + ((encoder_value - status->init.print_first_line_after_encoder_tick) / status->init.fire_every_ticks) * status->init.fire_every_ticks + status->init.fire_every_ticks;
			uint32_t next_printable_line = ((next_printable_encoder_value - status->init.print_first_line_after_encoder_tick) / status->init.fire_every_ticks) * status->init.sequential_fires;
			LOG_INF("Encoder jumped forward, next %d, %d", next_printable_encoder_value, next_printable_line);
			for (uint32_t i = status->last_printed_line + 1; i < next_printable_line; i++)
			{
				if (status->lost_lines_count < MAX_LOST_LINES_MEMORY)
				{
					status->lost_lines[status->lost_lines_count] = i;
				}
				status->lost_lines_count++;
			}
			uint32_t lost_lines = next_printable_line - status->last_printed_line - 1;
			load_line(status, next_printable_line);
			LOG_INF("Encoder jumped forward, lost %d, total lost %d, loaded %d", lost_lines, status->lost_lines_count, next_printable_line);
			status->expected_encoder_value = next_printable_encoder_value;
		}
		else
		{
			status->remaining_sequential_fires = status->init.sequential_fires;
			LOG_INF("Start printing %d times at %d lost %d", status->remaining_sequential_fires, encoder_value, status->lost_lines_count);
		}
	}
}
void encoder_printhead_fired_handler(encoder_print_status_t *status)
{
	LOG_INF("printed line %d", status->last_loaded_line);
	status->last_printed_line = status->last_loaded_line;
	if (status->remaining_sequential_fires > 1)
	{
		status->remaining_sequential_fires--;
		LOG_INF("remaining %d", status->remaining_sequential_fires);
	}
	else if (status->remaining_sequential_fires == 1)
	{
		status->remaining_sequential_fires--;
		status->init.fire_abort(status->init.inst);
		status->expected_encoder_value += status->init.fire_every_ticks;
		LOG_INF("Stop printing, expected %d", status->expected_encoder_value);
	}
	uint32_t next_line_nr = status->last_printed_line + 1;
	load_line(status, next_line_nr);
}