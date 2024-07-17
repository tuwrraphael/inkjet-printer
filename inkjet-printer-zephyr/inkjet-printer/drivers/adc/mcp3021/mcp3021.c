/*
 * Copyright (c) 2019 Vestas Wind Systems A/S
 * Copyright (c) 2020 Innoseis BV
 * Copyright (c) 2023 Cruise LLC
 *
 * SPDX-License-Identifier: Apache-2.0
 */
#include <zephyr/device.h>
#include <zephyr/devicetree.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/drivers/i2c.h>
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/sys/byteorder.h>
#include <zephyr/sys/util.h>

#define ADC_CONTEXT_USES_KERNEL_TIMER 1
#include "adc_context.h"

#define DT_DRV_COMPAT mcp_mcp3021

LOG_MODULE_REGISTER(mcp3021, CONFIG_ADC_LOG_LEVEL);

#define mcp3021_REF_INTERNAL 5000

struct mcp3021_config
{
	const struct i2c_dt_spec bus;
};

struct mcp3021_data
{
	struct adc_context ctx;
	k_timeout_t ready_time;
	struct k_sem acq_sem;
	int16_t *buffer;
	int16_t *buffer_ptr;
	bool differential;
};

static int mcp3021_read_reg(const struct device *dev, uint8_t *reg_val)
{
	const struct mcp3021_config *config = dev->config;
	uint8_t buf[3] = {0};
	int rc = i2c_read_dt(&config->bus, buf, sizeof(buf));

	reg_val[0] = buf[0];
	reg_val[1] = buf[1];

	return rc;
}

static int mcp3021_read_sample(const struct device *dev, uint16_t *buff)
{
	int res;
	uint8_t sample[2] = {0};
	// const struct mcp3021_config *config = dev->config;
	res = mcp3021_read_reg(dev, sample);
	buff[0] = sys_get_be16(sample) >> 2;
	return res;
}

static int mcp3021_channel_setup(const struct device *dev,
								 const struct adc_channel_cfg *channel_cfg)
{
	return 0;
}

static int mcp3021_validate_buffer_size(const struct adc_sequence *sequence)
{
	size_t needed = sizeof(int16_t);

	if (sequence->options)
	{
		needed *= (1 + sequence->options->extra_samplings);
	}

	if (sequence->buffer_size < needed)
	{
		LOG_ERR("Insufficient buffer %i < %i", sequence->buffer_size, needed);
		return -ENOMEM;
	}

	return 0;
}

static int mcp3021_validate_sequence(const struct device *dev, const struct adc_sequence *sequence)
{
	// const struct mcp3021_data *data = dev->data;

	if (sequence->channels != BIT(0))
	{
		LOG_ERR("Invalid Channel 0x%x", sequence->channels);
		return -EINVAL;
	}

	if (sequence->oversampling)
	{
		LOG_ERR("Oversampling not supported");
		return -EINVAL;
	}

	return mcp3021_validate_buffer_size(sequence);
}

static void adc_context_update_buffer_pointer(struct adc_context *ctx, bool repeat_sampling)
{
	struct mcp3021_data *data = CONTAINER_OF(ctx, struct mcp3021_data, ctx);

	if (repeat_sampling)
	{
		data->buffer = data->buffer_ptr;
	}
}

static void adc_context_start_sampling(struct adc_context *ctx)
{
	struct mcp3021_data *data = CONTAINER_OF(ctx, struct mcp3021_data, ctx);

	data->buffer_ptr = data->buffer;
	k_sem_give(&data->acq_sem);
}

static int mcp3021_adc_start_read(const struct device *dev, const struct adc_sequence *sequence,
								  bool wait)
{
	int rc = 0;
	struct mcp3021_data *data = dev->data;

	rc = mcp3021_validate_sequence(dev, sequence);
	if (rc != 0)
	{
		return rc;
	}

	data->buffer = sequence->buffer;

	adc_context_start_read(&data->ctx, sequence);

	return rc;
}

static int mcp3021_adc_perform_read(const struct device *dev)
{
	int rc;
	struct mcp3021_data *data = dev->data;

	k_sem_take(&data->acq_sem, K_FOREVER);

	rc = mcp3021_read_sample(dev, data->buffer);
	if (rc != 0)
	{
		adc_context_complete(&data->ctx, rc);
		return rc;
	}
	data->buffer++;

	adc_context_on_sampling_done(&data->ctx, dev);

	return rc;
}

static int mcp3021_read(const struct device *dev, const struct adc_sequence *sequence)
{
	int rc;
	struct mcp3021_data *data = dev->data;

	adc_context_lock(&data->ctx, false, NULL);
	rc = mcp3021_adc_start_read(dev, sequence, false);

	while (rc == 0 && k_sem_take(&data->ctx.sync, K_NO_WAIT) != 0)
	{
		rc = mcp3021_adc_perform_read(dev);
	}
	k_sem_reset(&data->ctx.sync); // the rc != short circuits and the sem is not reset

	adc_context_release(&data->ctx, rc);
	return rc;
}

static int mcp3021_init(const struct device *dev)
{
	int rc = 0;
	// uint8_t status;
	const struct mcp3021_config *config = dev->config;
	struct mcp3021_data *data = dev->data;

	adc_context_init(&data->ctx);

	k_sem_init(&data->acq_sem, 0, 1);

	if (!device_is_ready(config->bus.bus))
	{
		return -ENODEV;
	}

	adc_context_unlock_unconditionally(&data->ctx);

	return rc;
}

#define ADC_mcp3021_INST_DEFINE(n)                                                    \
	static const struct adc_driver_api api_##n = {                                    \
		.channel_setup = mcp3021_channel_setup,                                       \
		.read = mcp3021_read,                                                         \
		.ref_internal = DT_PROP(DT_DRV_INST(n), ref_internal_mv),                   \
	};                                                                                \
	static const struct mcp3021_config config_##n = {.bus = I2C_DT_SPEC_INST_GET(n)}; \
	static struct mcp3021_data data_##n;                                              \
	DEVICE_DT_INST_DEFINE(n, mcp3021_init, NULL, &data_##n, &config_##n, POST_KERNEL, \
						  CONFIG_ADC_INIT_PRIORITY, &api_##n);

DT_INST_FOREACH_STATUS_OKAY(ADC_mcp3021_INST_DEFINE);
