/*
 * Adapted from drivers/sensor/qdec_stm32/qdec_stm32.c
 * Copyright (c) 2022, Valerio Setti <vsetti@baylibre.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

#define DT_DRV_COMPAT st_stm32_qdec_linear

#include <errno.h>

#include <zephyr/sys/__assert.h>
#include <zephyr/sys/util.h>
#include <zephyr/device.h>
#include <zephyr/init.h>
#include <zephyr/drivers/sensor.h>
#include <zephyr/drivers/pinctrl.h>
#include <zephyr/drivers/clock_control/stm32_clock_control.h>
#include <zephyr/logging/log.h>

#include <stm32_ll_tim.h>

LOG_MODULE_REGISTER(qdec_stm32_linear, CONFIG_SENSOR_LOG_LEVEL);

/* Device constant configuration parameters */
struct qdec_stm32_dev_cfg
{
	const struct pinctrl_dev_config *pin_config;
	struct stm32_pclken pclken;
	struct stm32_pclken encoder_xor_timer_pclken;
	TIM_TypeDef *timer_inst;
	TIM_TypeDef *encoder_xor_timer;
	uint32_t encoder_xor_timer_remap;
	uint32_t encoder_mode;
	bool is_input_polarity_inverted;
	uint8_t input_filtering_level;
	void (*irq_config_func)(const struct device *dev);
	uint32_t irqn;
};

/* Device run time data */
struct qdec_stm32_dev_data
{
	int32_t position;
	uint32_t irq_counter;
};

static int qdec_stm32_fetch(const struct device *dev, enum sensor_channel chan)
{
	struct qdec_stm32_dev_data *dev_data = dev->data;
	const struct qdec_stm32_dev_cfg *dev_cfg = dev->config;

	if ((chan != SENSOR_CHAN_ALL) && (chan != SENSOR_CHAN_POS_DX))
	{
		return -ENOTSUP;
	}
	if (IS_TIM_32B_COUNTER_INSTANCE(dev_cfg->timer_inst))
	{
		int64_t encoder_value = dev_cfg->timer_inst->CNT;
		if (encoder_value > CONFIG_QDEC_STM32_LINEAR_MAX_ENCODER_COUNT)
		{
			encoder_value = encoder_value - ((int64_t)(UINT32_MAX) + 1);
		}
		dev_data->position = (int32_t)encoder_value;
	}
	else
	{
		int32_t encoder_value = dev_cfg->timer_inst->CNT;
		if (encoder_value > CONFIG_QDEC_STM32_LINEAR_MAX_ENCODER_COUNT)
		{
			encoder_value = encoder_value - ((int32_t)(UINT16_MAX) + 1);
		}
		dev_data->position = encoder_value;
	}
	return 0;
}

static int qdec_stm32_get(const struct device *dev, enum sensor_channel chan,
						  struct sensor_value *val)
{
	struct qdec_stm32_dev_data *const dev_data = dev->data;

	if (chan == SENSOR_CHAN_POS_DX)
	{
		val->val1 = dev_data->position;
		val->val2 = 0;
	}
	else
	{
		return -ENOTSUP;
	}

	return 0;
}

static int qdec_stm32_initialize(const struct device *dev)
{
	const struct qdec_stm32_dev_cfg *const dev_cfg = dev->config;
	int retval;
	LL_TIM_ENCODER_InitTypeDef init_props;
	uint32_t max_counter_value;

	retval = pinctrl_apply_state(dev_cfg->pin_config, PINCTRL_STATE_DEFAULT);
	if (retval < 0)
	{
		return retval;
	}

	if (!device_is_ready(DEVICE_DT_GET(STM32_CLOCK_CONTROL_NODE)))
	{
		LOG_ERR("Clock control device not ready");
		return -ENODEV;
	}

	retval = clock_control_on(DEVICE_DT_GET(STM32_CLOCK_CONTROL_NODE),
							  (clock_control_subsys_t)&dev_cfg->pclken);
	if (retval < 0)
	{
		LOG_ERR("Could not initialize clock");
		return retval;
	}

	LL_TIM_ENCODER_StructInit(&init_props);

	init_props.EncoderMode = dev_cfg->encoder_mode;

	if (dev_cfg->is_input_polarity_inverted)
	{
		init_props.IC1Polarity = LL_TIM_IC_POLARITY_FALLING;
		init_props.IC2Polarity = LL_TIM_IC_POLARITY_FALLING;
	}

	init_props.IC1Filter = dev_cfg->input_filtering_level * LL_TIM_IC_FILTER_FDIV1_N2;
	init_props.IC2Filter = dev_cfg->input_filtering_level * LL_TIM_IC_FILTER_FDIV1_N2;

	if (IS_TIM_32B_COUNTER_INSTANCE(dev_cfg->timer_inst))
	{
		max_counter_value = UINT32_MAX;
	}
	else
	{
		max_counter_value = UINT16_MAX;
	}
	LL_TIM_SetAutoReload(dev_cfg->timer_inst, max_counter_value);

	if (LL_TIM_ENCODER_Init(dev_cfg->timer_inst, &init_props) != SUCCESS)
	{
		LOG_ERR("Initalization failed");
		return -EIO;
	}

	dev_cfg->irq_config_func(dev);

	LL_TIM_SetTriggerOutput(dev_cfg->timer_inst, LL_TIM_TRGO_CC1IF);
	LL_TIM_EnableCounter(dev_cfg->timer_inst);
	LL_TIM_EnableIT_CC1(dev_cfg->timer_inst);

	retval = clock_control_on(DEVICE_DT_GET(STM32_CLOCK_CONTROL_NODE),
							  (clock_control_subsys_t)&dev_cfg->encoder_xor_timer_pclken);

	LL_TIM_InitTypeDef TIM_InitStruct;
	LL_TIM_StructInit(&TIM_InitStruct);
	TIM_InitStruct.Prescaler = 0;
	TIM_InitStruct.CounterMode = LL_TIM_COUNTERMODE_UP;
	TIM_InitStruct.Autoreload = 10000;
	TIM_InitStruct.ClockDivision = LL_TIM_CLOCKDIVISION_DIV1;
	TIM_InitStruct.RepetitionCounter = 0;
	LL_TIM_Init(dev_cfg->encoder_xor_timer, &TIM_InitStruct);

	LL_TIM_IC_InitTypeDef icinit;
	LL_TIM_IC_StructInit(&icinit);

	icinit.ICPolarity = LL_TIM_IC_POLARITY_BOTHEDGE;
	// icinit.ICSelection = LL_TIM_IC_SELECTION_DIRECTTI;
	// icinit.ICPrescaler = LL_TIM_ICPSC_DIV1;
	icinit.ICFilter = dev_cfg->input_filtering_level * LL_TIM_IC_FILTER_FDIV1_N2;

	LL_TIM_IC_Init(dev_cfg->encoder_xor_timer, LL_TIM_CHANNEL_CH1, &icinit);
	LL_TIM_SetTriggerOutput(dev_cfg->encoder_xor_timer, LL_TIM_TRGO_CC1IF);
	LL_TIM_SetRemap(dev_cfg->encoder_xor_timer, dev_cfg->encoder_xor_timer_remap);
	LL_TIM_IC_EnableXORCombination(dev_cfg->encoder_xor_timer);
	LL_TIM_SetAutoReload(dev_cfg->encoder_xor_timer, 10000);
	LL_TIM_EnableCounter(dev_cfg->encoder_xor_timer);

	return 0;
}

static const struct sensor_driver_api qdec_stm32_driver_api = {
	.sample_fetch = qdec_stm32_fetch,
	.channel_get = qdec_stm32_get,
};

static void timer_irq_handler(const struct device *dev)
{
	struct qdec_stm32_dev_data *data = dev->data;

	const struct qdec_stm32_dev_cfg *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer_inst;
	// // if (timer->SR & TIM_SR_UIF)
	// // {
	// // 	LOG_INF("Timer update");
	// // 	// //disable the timer
	// // 	// bool was_enabled = timer->CR1 & TIM_CR1_CEN;
	// // 	// // timer->CR1 &= ~(TIM_CR1_CEN);

	// // 	// /* Get the TIMx SMCR register value */
	// // 	// uint32_t tmpsmcr = timer->SMCR;

	// // 	// /* Reset the slave mode Bits */
	// // 	// tmpsmcr &= ~TIM_SMCR_SMS;

	// // 	// timer->SMCR = tmpsmcr;
	// // 	// // clear the interrupt flag
	// // 	timer->SR &= ~TIM_SR_UIF;
	// // 	// LOG_INF("Timer IRQ %x, %d", TIM1->CNT, was_enabled);
	// // 	//
	// // }
	// // if (timer->SR & TIM_SR_CC1IF)
	// // {
	// // 	/* Get the TIMx SMCR register value */

	// // 	LOG_INF("Timer CC1");
	// // 	timer->SR &= ~TIM_SR_CC1IF;
	// // }
	// if (timer->SR & TIM_SR_TIF)
	// {
	// 	// uint32_t tmpsmcr = timer->SMCR;

	// 	// /* Reset the slave mode Bits */
	// 	// tmpsmcr &= ~TIM_SMCR_SMS;

	// 	// timer->SMCR = tmpsmcr;
	// 	data->irq_counter++;
	// 	LOG_INF("Timer trigger %d", data->irq_counter);
	// 	timer->SR &= ~TIM_SR_TIF;
	// }
	// LOG_INF("Timer IRQ %x, %x", TIM1->CNT, TIM4->CNT);
	data->irq_counter++;

	if (timer->SR & TIM_SR_CC1IF)
	{
		timer->SR &= ~TIM_SR_CC1IF;
		uint32_t timer_cnt = cfg->encoder_xor_timer->CNT;
		// LOG_INF("Timer IRQ, %d, %d", timer->CNT, timer_cnt);
	}
}
#define TIMER(n) DT_INST_PARENT(n)
#define ENCODER_XOR_TIMER(idx) ((TIM_TypeDef *)DT_REG_ADDR(DT_PROP(DT_DRV_INST(idx), encoder_xor_timer)))
#define QDEC_STM32_INIT(n)                                                                                     \
	BUILD_ASSERT(!(DT_INST_PROP(n, st_encoder_mode) & ~TIM_SMCR_SMS),                                          \
				 "Encoder mode is not supported by this MCU");                                                 \
	static void qdec_##n##_stm32_irq_config(const struct device *dev)                                          \
	{                                                                                                          \
		IRQ_CONNECT(DT_IRQ_BY_NAME(TIMER(n), global, irq),                                                     \
					DT_IRQ_BY_NAME(TIMER(n), global, priority),                                                \
					timer_irq_handler,                                                                         \
					DEVICE_DT_INST_GET(n),                                                                     \
					0);                                                                                        \
		irq_enable(DT_IRQ_BY_NAME(TIMER(n), global, irq));                                                     \
	};                                                                                                         \
                                                                                                               \
	PINCTRL_DT_INST_DEFINE(n);                                                                                 \
	static const struct qdec_stm32_dev_cfg qdec##n##_stm32_config = {                                          \
		.pin_config = PINCTRL_DT_INST_DEV_CONFIG_GET(n),                                                       \
		.timer_inst = ((TIM_TypeDef *)DT_REG_ADDR(DT_INST_PARENT(n))),                                         \
		.pclken = {.bus = DT_CLOCKS_CELL(DT_INST_PARENT(n), bus),                                              \
				   .enr = DT_CLOCKS_CELL(DT_INST_PARENT(n), bits)},                                            \
		.encoder_xor_timer = ENCODER_XOR_TIMER(n),                                                             \
		.encoder_xor_timer_pclken = {.bus = DT_CLOCKS_CELL(DT_PROP(DT_DRV_INST(n), encoder_xor_timer), bus),   \
									 .enr = DT_CLOCKS_CELL(DT_PROP(DT_DRV_INST(n), encoder_xor_timer), bits)}, \
		.encoder_xor_timer_remap = DT_INST_PROP(n, encoder_xor_timer_remap),                                   \
		.encoder_mode = DT_INST_PROP(n, st_encoder_mode),                                                      \
		.is_input_polarity_inverted = DT_INST_PROP(n, st_input_polarity_inverted),                             \
		.input_filtering_level = DT_INST_PROP(n, st_input_filter_level),                                       \
		.irq_config_func = qdec_##n##_stm32_irq_config,                                                        \
		.irqn = DT_IRQN(TIMER(n)),                                                                             \
	};                                                                                                         \
                                                                                                               \
	static struct qdec_stm32_dev_data qdec##n##_stm32_data;                                                    \
                                                                                                               \
	SENSOR_DEVICE_DT_INST_DEFINE(n, qdec_stm32_initialize, NULL, &qdec##n##_stm32_data,                        \
								 &qdec##n##_stm32_config, POST_KERNEL,                                         \
								 CONFIG_SENSOR_INIT_PRIORITY, &qdec_stm32_driver_api);

DT_INST_FOREACH_STATUS_OKAY(QDEC_STM32_INIT)