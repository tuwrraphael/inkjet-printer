#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>

#include <lib/inkjetcontrol/encoder.h>

K_SEM_DEFINE(encoder_sem, 0, 1);

LOG_MODULE_REGISTER(encoder, CONFIG_INKJETCONTROL_LOG_LEVEL);

static void load_line(encoder_print_status_t *status, uint32_t line, bool wait_fired)
{
	if (status->loading_line)
	{
		status->init.load_error_cb(status->init.inst);
		return;
	}
	status->loading_line = true;
	status->init.load_line(status->init.inst, line, wait_fired);
	status->last_line_queued_for_loading = line;
	LOG_INF("Loading line %d", line);
}

void encoder_print_init(encoder_print_status_t *status, encoder_print_init_t *init)
{
	memcpy(&status->init, init, sizeof(encoder_print_init_t));
	status->remaining_sequential_fires = 0;
	status->expected_encoder_value = init->print_first_line_after_encoder_tick;
	status->last_printed_line = -1;
	status->lost_lines_count = 0;
	status->printed_lines = 0;
	status->loading_line = false;
	k_sem_reset(&encoder_sem);
	k_sem_give(&encoder_sem);
	for (uint32_t i = 0; i < MAX_LOST_LINES_MEMORY; i++)
	{
		status->lost_lines[i] = -1;
	}
	load_line(status, 0, false);
	LOG_DBG("Encoder print initialized");
}

void encoder_signal_load_line_completed(encoder_print_status_t *status, uint32_t line)
{
	status->loading_line = false;
	status->last_loaded_line = line;
	LOG_DBG("Loaded line");
}

void encoder_tick_handler(encoder_print_status_t *status)
{
	int32_t encoder_value = status->init.get_value(status->init.inst);
	// LOG_DBG("Encoder tick handler %d", encoder_value);

	if (k_sem_take(&encoder_sem, K_NO_WAIT) != 0)
	{
		LOG_DBG("Encoder tick during firing cycle");
	}
	else
	{
		// LOG_DBG("Encoder tick %d, expected %d", encoder_value, status->expected_encoder_value);
		if (encoder_value < status->expected_encoder_value)
		{
			status->init.fire_abort(status->init.inst);
			LOG_INF("Encoder jumped back, stop timer");
			k_sem_give(&encoder_sem);
		}
		else if (encoder_value > status->expected_encoder_value)
		{
			status->init.fire_abort(status->init.inst);
			int32_t next_printable_encoder_value = status->init.print_first_line_after_encoder_tick + ((encoder_value - status->init.print_first_line_after_encoder_tick) / (int32_t)status->init.fire_every_ticks) * (int32_t)status->init.fire_every_ticks + (int32_t)status->init.fire_every_ticks;
			uint32_t next_printable_line = ((next_printable_encoder_value - status->init.print_first_line_after_encoder_tick) / status->init.fire_every_ticks) * status->init.sequential_fires;
			LOG_DBG("Encoder jumped forward, next %d, %d", next_printable_encoder_value, next_printable_line);
			for (uint32_t i = status->last_printed_line + 1; i < next_printable_line; i++)
			{
				if (status->lost_lines_count < MAX_LOST_LINES_MEMORY)
				{
					status->lost_lines[status->lost_lines_count] = i;
				}
				status->lost_lines_count++;
			}
			uint32_t lost_lines = next_printable_line - status->last_printed_line - 1;
			load_line(status, next_printable_line, false);
			LOG_DBG("Encoder jumped forward, lost %d, total lost %d, loaded %d", lost_lines, status->lost_lines_count, next_printable_line);
			status->expected_encoder_value = next_printable_encoder_value;
			k_sem_give(&encoder_sem);
		}
		else if (status->last_line_queued_for_loading != status->last_loaded_line)
		{
			status->init.fire_abort(status->init.inst);
			LOG_ERR("Could not print line %d, still loading", status->last_line_queued_for_loading);
			k_sem_give(&encoder_sem);
		}
		else
		{
			status->remaining_sequential_fires = status->init.sequential_fires;
			LOG_INF("Start printing %d times at %d lost %d printed %d", status->remaining_sequential_fires, encoder_value, status->lost_lines_count, status->printed_lines);
		}
	}
}

void encoder_fire_issued_handler(encoder_print_status_t *status)
{
	LOG_DBG("issued line %d", status->last_line_queued_for_loading);
	status->issued_line = status->last_line_queued_for_loading;
	uint32_t next_line_nr = status->last_line_queued_for_loading + 1;
	load_line(status, next_line_nr, true);
}

void encoder_fire_cycle_completed_handler(encoder_print_status_t *status)
{
	LOG_DBG("printed line %d", status->issued_line);
	status->last_printed_line = status->issued_line;
	status->printed_lines++;
	if (status->remaining_sequential_fires > 1)
	{
		if (status->last_line_queued_for_loading != status->last_loaded_line)
		{
			status->init.fire_abort(status->init.inst);
			status->remaining_sequential_fires = 0;
			k_sem_give(&encoder_sem);
			LOG_ERR("cycle handler: Could not print line %d, still loading", status->last_line_queued_for_loading);
		}
		else
		{
			status->remaining_sequential_fires--;
			LOG_DBG("remaining %d", status->remaining_sequential_fires);
		}
	}
	else if (status->remaining_sequential_fires == 1)
	{
		status->init.fire_abort(status->init.inst);
		status->remaining_sequential_fires--;
		status->expected_encoder_value += status->init.fire_every_ticks;
		LOG_DBG("Stop printing, expected %d", status->expected_encoder_value);
		k_sem_give(&encoder_sem);
	}
}