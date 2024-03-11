#define DT_DRV_COMPAT st_fire_stm32_combined_pwm

#include <zephyr/device.h>
// #include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/printer_fire.h>
#include <zephyr/drivers/clock_control.h>
#include <zephyr/logging/log.h>
#include "stm32h7xx.h"
#include <stm32_ll_rcc.h>
#include <stm32h7xx_hal_tim.h>
#include <stm32h7xx_hal_tim_ex.h>
#include <zephyr/drivers/pinctrl.h>
// #include <stm32h7xx.h>
#include <zephyr/drivers/reset.h>
#include <zephyr/irq.h>
#include <zephyr/drivers/clock_control/stm32_clock_control.h>
LOG_MODULE_REGISTER(fire_stm32_combined_pwm, CONFIG_PRINTER_LOG_LEVEL);

struct fire_stm32_combined_pwm_data
{
	const struct reset_dt_spec reset;
	uint32_t freq;
	uint32_t tim_clk;
	uint32_t irq_counter;
};

struct fire_stm32_combined_pwm_config
{
	TIM_TypeDef *timer;
	uint32_t prescaler;
	struct stm32_pclken pclken;
	void (*irq_config_func)(const struct device *dev);
	const struct pinctrl_dev_config *pcfg;
	uint32_t irqn;
	uint32_t pulse12_start;
	uint32_t pulse34_start;
	uint32_t pulse12_end;
	uint32_t pulse34_end;
	uint32_t min_mask_period;
};

static int fire(const struct device *dev)
{
	const struct fire_stm32_combined_pwm_config *config = dev->config;
	struct fire_stm32_combined_pwm_data *data = dev->data;
	LOG_INF("Fire %x, %x", TIM1->CNT, TIM4->CNT);
	TIM_TypeDef *timer = config->timer;

	/* Get the TIMx SMCR register value */
	uint32_t tmpsmcr = timer->SMCR;
	tmpsmcr &= ~TIM_SMCR_SMS;
	/* Set the slave mode */
	tmpsmcr |= TIM_SLAVEMODE_TRIGGER;

	/* Write to TIMx SMCR */
	timer->SMCR = tmpsmcr;
	return data->irq_counter;
}

static uint64_t pwm_stm32_get_cycles_per_sec(const struct device *dev)
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	return (uint64_t)(data->tim_clk / (cfg->prescaler + 1));
}

static int set_light_timing(const struct device *dev, uint32_t delay, uint32_t duration)
{
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	uint64_t cycles_per_sec = pwm_stm32_get_cycles_per_sec(dev);


	uint32_t min_mask_cycles = (uint32_t)((cycles_per_sec * cfg->min_mask_period) / (1000 * 1000 * 1000));
	uint32_t pulse34_start_cycles = (uint32_t)((cycles_per_sec * (cfg->pulse12_start + delay)) / (1000 * 1000 * 1000));
	uint32_t pulse34_end_cycles = (uint32_t)((cycles_per_sec * (cfg->pulse12_start + delay + duration)) / (1000 * 1000 * 1000));
	uint32_t pulse12_end_cycles = (uint32_t)((cycles_per_sec * cfg->pulse12_end) / (1000 * 1000 * 1000));
	uint32_t mask_cycles = pulse12_end_cycles > pulse34_end_cycles ? pulse12_end_cycles : pulse34_end_cycles;

	mask_cycles = mask_cycles > min_mask_cycles ? mask_cycles : min_mask_cycles;

	LOG_INF("Set light timing: %d - %d, mask: %d", pulse34_start_cycles, pulse34_end_cycles, mask_cycles);

	TIM_TypeDef *timer = cfg->timer;
	TIM_HandleTypeDef htim1;
	htim1.Instance = timer;

	// TIM_OC_InitTypeDef sConfigOC = {0};
	// sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM2;
	// sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
	// sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
	// sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
	// sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
	// sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
	// sConfigOC.Pulse = pulse34_start_cycles;
	// if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_3) != HAL_OK)
	// {
	// 	LOG_ERR("Timer PWM ConfigChannel 3 failed");
	// 	return -ENODEV;
	// }
	// sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM1;
	// sConfigOC.Pulse = pulse34_end_cycles;
	// if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_4) != HAL_OK)
	// {
	// 	LOG_ERR("Timer PWM ConfigChannel 4 failed");
	// 	return -ENODEV;
	// }

	// HAL_TIM_

	// 	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_3);
	// HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_4);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, pulse34_start_cycles);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_4, pulse34_end_cycles);
	__HAL_TIM_SET_AUTORELOAD(&htim1, mask_cycles - 1);
	return 0;
}

static const struct printer_fire_api fire_stm32_combined_pwm_api = {
	.fire = &fire,
	.set_light_timing = &set_light_timing};

static int counter_stm32_get_tim_clk(const struct stm32_pclken *pclken, uint32_t *tim_clk)
{
	int r;
	const struct device *clk;
	uint32_t bus_clk, apb_psc;

	clk = DEVICE_DT_GET(STM32_CLOCK_CONTROL_NODE);

	if (!device_is_ready(clk))
	{
		return -ENODEV;
	}

	r = clock_control_get_rate(clk, (clock_control_subsys_t)pclken,
							   &bus_clk);
	if (r < 0)
	{
		return r;
	}

#if defined(CONFIG_SOC_SERIES_STM32H7X)
	if (pclken->bus == STM32_CLOCK_BUS_APB1)
	{
		apb_psc = STM32_D2PPRE1;
	}
	else
	{
		apb_psc = STM32_D2PPRE2;
	}
#else
	if (pclken->bus == STM32_CLOCK_BUS_APB1)
	{
#if defined(CONFIG_SOC_SERIES_STM32MP1X)
		apb_psc = (uint32_t)(READ_BIT(RCC->APB1DIVR, RCC_APB1DIVR_APB1DIV));
#else
		apb_psc = STM32_APB1_PRESCALER;
#endif
	}
#if !defined(CONFIG_SOC_SERIES_STM32F0X) && !defined(CONFIG_SOC_SERIES_STM32G0X)
	else
	{
#if defined(CONFIG_SOC_SERIES_STM32MP1X)
		apb_psc = (uint32_t)(READ_BIT(RCC->APB2DIVR, RCC_APB2DIVR_APB2DIV));
#else
		apb_psc = STM32_APB2_PRESCALER;
#endif
	}
#endif
#endif

#if defined(RCC_DCKCFGR_TIMPRE) || defined(RCC_DCKCFGR1_TIMPRE) || \
	defined(RCC_CFGR_TIMPRE)
	/*
	 * There are certain series (some F4, F7 and H7) that have the TIMPRE
	 * bit to control the clock frequency of all the timers connected to
	 * APB1 and APB2 domains.
	 *
	 * Up to a certain threshold value of APB{1,2} prescaler, timer clock
	 * equals to HCLK. This threshold value depends on TIMPRE setting
	 * (2 if TIMPRE=0, 4 if TIMPRE=1). Above threshold, timer clock is set
	 * to a multiple of the APB domain clock PCLK{1,2} (2 if TIMPRE=0, 4 if
	 * TIMPRE=1).
	 */

	if (LL_RCC_GetTIMPrescaler() == LL_RCC_TIM_PRESCALER_TWICE)
	{
		/* TIMPRE = 0 */
		if (apb_psc <= 2u)
		{
			LL_RCC_ClocksTypeDef clocks;

			LL_RCC_GetSystemClocksFreq(&clocks);
			*tim_clk = clocks.HCLK_Frequency;
		}
		else
		{
			*tim_clk = bus_clk * 2u;
		}
	}
	else
	{
		/* TIMPRE = 1 */
		if (apb_psc <= 4u)
		{
			LL_RCC_ClocksTypeDef clocks;

			LL_RCC_GetSystemClocksFreq(&clocks);
			*tim_clk = clocks.HCLK_Frequency;
		}
		else
		{
			*tim_clk = bus_clk * 4u;
		}
	}
#else
	/*
	 * If the APB prescaler equals 1, the timer clock frequencies
	 * are set to the same frequency as that of the APB domain.
	 * Otherwise, they are set to twice (×2) the frequency of the
	 * APB domain.
	 */
	if (apb_psc == 1u)
	{
		*tim_clk = bus_clk;
	}
	else
	{
		*tim_clk = bus_clk * 2u;
	}
#endif

	return 0;
}

static int fire_stm32_combined_pwm_init(const struct device *dev)
{
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	struct fire_stm32_combined_pwm_data *data = dev->data;
	data->irq_counter = 0;
	TIM_TypeDef *timer = cfg->timer;
	TIM_HandleTypeDef htim1;
	uint32_t tim_clk;
	int r;

	/* initialize clock and check its speed  */
	r = clock_control_on(DEVICE_DT_GET(STM32_CLOCK_CONTROL_NODE),
						 (clock_control_subsys_t)&cfg->pclken);
	if (r < 0)
	{
		LOG_ERR("Could not initialize clock (%d)", r);
		return r;
	}
	r = counter_stm32_get_tim_clk(&cfg->pclken, &tim_clk);
	if (r < 0)
	{
		LOG_ERR("Could not obtain timer clock (%d)", r);
		return r;
	}
	data->tim_clk = tim_clk;
	data->freq = tim_clk / (cfg->prescaler + 1U);

	if (!device_is_ready(data->reset.dev))
	{
		LOG_ERR("reset controller not ready");
		return -ENODEV;
	}

	/* Reset timer to default state using RCC */
	(void)reset_line_toggle_dt(&data->reset);

	/* config/enable IRQ */
	cfg->irq_config_func(dev);

	TIM_ClockConfigTypeDef sClockSourceConfig = {0};
	TIM_SlaveConfigTypeDef sSlaveConfig = {0};

	TIM_OC_InitTypeDef sConfigOC = {0};
	TIM_BreakDeadTimeConfigTypeDef sBreakDeadTimeConfig = {0};

	uint64_t cycles_per_sec = pwm_stm32_get_cycles_per_sec(dev);

	uint32_t min_mask_cycles = (uint32_t)((cycles_per_sec * cfg->min_mask_period) / (1000 * 1000 * 1000));
	uint32_t pulse12_end_cycles = (uint32_t)((cycles_per_sec * cfg->pulse12_end) / (1000 * 1000 * 1000));
	uint32_t pulse34_end_cycles = (uint32_t)((cycles_per_sec * cfg->pulse34_end) / (1000 * 1000 * 1000));
	uint32_t pulse12_start_cycles = (uint32_t)((cycles_per_sec * cfg->pulse12_start) / (1000 * 1000 * 1000));
	uint32_t pulse34_start_cycles = (uint32_t)((cycles_per_sec * cfg->pulse34_start) / (1000 * 1000 * 1000));

	uint32_t mask_cycles = pulse12_end_cycles > pulse34_end_cycles ? pulse12_end_cycles : pulse34_end_cycles;
	mask_cycles = mask_cycles > min_mask_cycles ? mask_cycles : min_mask_cycles;

		LOG_INF("Mask cycles: %d | Pulse12 %d - %d | Pulse34 %d - %d", mask_cycles, pulse12_start_cycles, pulse12_end_cycles, pulse34_start_cycles, pulse34_end_cycles);

	htim1.Instance = timer;
	htim1.Init.Prescaler = cfg->prescaler;
	htim1.Init.CounterMode = TIM_COUNTERMODE_UP;
	htim1.Init.Period = mask_cycles - 1;
	htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
	htim1.Init.RepetitionCounter = 0;
	htim1.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
	LOG_INF("Timer Init");
	if (HAL_TIM_Base_Init(&htim1) != HAL_OK)
	{
		LOG_ERR("Timer Init failed");
		return -ENODEV;
	}
	sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
	if (HAL_TIM_ConfigClockSource(&htim1, &sClockSourceConfig) != HAL_OK)
	{
		LOG_ERR("Timer ConfigClockSource failed");
		return -ENODEV;
	}
	if (HAL_TIM_PWM_Init(&htim1) != HAL_OK)
	{
		LOG_ERR("Timer PWM Init failed");
		return -ENODEV;
	}
	if (HAL_TIM_OnePulse_Init(&htim1, TIM_OPMODE_SINGLE) != HAL_OK)
	{
		LOG_ERR("Timer OnePulse Init failed");
		return -ENODEV;
	}
	sSlaveConfig.SlaveMode = TIM_SLAVEMODE_TRIGGER;
	sSlaveConfig.InputTrigger = TIM_TS_ITR3;
	if (HAL_TIM_SlaveConfigSynchro(&htim1, &sSlaveConfig) != HAL_OK)
	{
		LOG_ERR("Timer SlaveConfigSynchro failed");
		return -ENODEV;
	}
	// sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
	// sMasterConfig.MasterOutputTrigger2 = TIM_TRGO2_RESET;
	// sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
	// if (HAL_TIMEx_MasterConfigSynchronization(&htim1, &sMasterConfig) != HAL_OK)
	// {
	// 	LOG_ERR("Timer MasterConfigSynchronization failed");
	// 	return -ENODEV;
	// }
	sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM2;
	sConfigOC.Pulse = pulse12_end_cycles;
	sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
	sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
	sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
	sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
	sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
	if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1) != HAL_OK)
	{
		LOG_ERR("Timer PWM ConfigChannel 1 failed");
		return -ENODEV;
	}
	sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM1;
	sConfigOC.Pulse = pulse12_start_cycles;
	if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_2) != HAL_OK)
	{
		LOG_ERR("Timer PWM ConfigChannel 2 failed");
		return -ENODEV;
	}
	sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM2;
	sConfigOC.Pulse = pulse34_start_cycles;
	if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_3) != HAL_OK)
	{
		LOG_ERR("Timer PWM ConfigChannel 3 failed");
		return -ENODEV;
	}
	sConfigOC.OCMode = TIM_OCMODE_COMBINED_PWM1;
	sConfigOC.Pulse = pulse34_end_cycles;
	if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_4) != HAL_OK)
	{
		LOG_ERR("Timer PWM ConfigChannel 4 failed");
		return -ENODEV;
	}
	sBreakDeadTimeConfig.OffStateRunMode = TIM_OSSR_DISABLE;
	sBreakDeadTimeConfig.OffStateIDLEMode = TIM_OSSI_DISABLE;
	sBreakDeadTimeConfig.LockLevel = TIM_LOCKLEVEL_OFF;
	sBreakDeadTimeConfig.DeadTime = 0;
	sBreakDeadTimeConfig.BreakState = TIM_BREAK_DISABLE;
	sBreakDeadTimeConfig.BreakPolarity = TIM_BREAKPOLARITY_HIGH;
	sBreakDeadTimeConfig.BreakFilter = 0;
	sBreakDeadTimeConfig.Break2State = TIM_BREAK2_DISABLE;
	sBreakDeadTimeConfig.Break2Polarity = TIM_BREAK2POLARITY_HIGH;
	sBreakDeadTimeConfig.Break2Filter = 0;
	sBreakDeadTimeConfig.AutomaticOutput = TIM_AUTOMATICOUTPUT_DISABLE;
	if (HAL_TIMEx_ConfigBreakDeadTime(&htim1, &sBreakDeadTimeConfig) != HAL_OK)
	{
		LOG_ERR("Timer ConfigBreakDeadTime failed");
		return -ENODEV;
	}

	/* configure pinmux */
	r = pinctrl_apply_state(cfg->pcfg, PINCTRL_STATE_DEFAULT);
	if (r < 0)
	{
		LOG_ERR("PWM pinctrl setup failed (%d)", r);
		return r;
	}

	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_3);
	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_4);
	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
	HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_2);
	__HAL_TIM_ENABLE_IT(&htim1, TIM_IT_TRIGGER);
	// // __HAL_TIM_ENABLE(&htim1);

	TIM_HandleTypeDef htim4;
	htim4.Instance = TIM4;
	TIM_MasterConfigTypeDef sMasterConfig = {0};
	sMasterConfig.MasterOutputTrigger = TIM_TRGO_UPDATE;
	sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_ENABLE;
	// if (HAL_TIMEx_MasterConfigSynchronization(&htim4, &sMasterConfig) != HAL_OK)
	// {
	// 	LOG_ERR("Timer MasterConfigSynchronization failed");
	// 	return -ENODEV;
	// }

	/* Reset the MMS Bits */
	uint32_t tmpcr2 = TIM4->CR2;
	tmpcr2 &= ~TIM_CR2_MMS;
	/* Select the TRGO source */
	tmpcr2 |= sMasterConfig.MasterOutputTrigger;

	/* Update TIMx CR2 */
	TIM4->CR2 = tmpcr2;

	return 0;
}

void timer_irq_handler(const struct device *dev)
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer;
	// if (timer->SR & TIM_SR_UIF)
	// {
	// 	LOG_INF("Timer update");
	// 	// //disable the timer
	// 	// bool was_enabled = timer->CR1 & TIM_CR1_CEN;
	// 	// // timer->CR1 &= ~(TIM_CR1_CEN);

	// 	// /* Get the TIMx SMCR register value */
	// 	// uint32_t tmpsmcr = timer->SMCR;

	// 	// /* Reset the slave mode Bits */
	// 	// tmpsmcr &= ~TIM_SMCR_SMS;

	// 	// timer->SMCR = tmpsmcr;
	// 	// // clear the interrupt flag
	// 	timer->SR &= ~TIM_SR_UIF;
	// 	// LOG_INF("Timer IRQ %x, %d", TIM1->CNT, was_enabled);
	// 	//
	// }
	// if (timer->SR & TIM_SR_CC1IF)
	// {
	// 	/* Get the TIMx SMCR register value */

	// 	LOG_INF("Timer CC1");
	// 	timer->SR &= ~TIM_SR_CC1IF;
	// }
	if (timer->SR & TIM_SR_TIF)
	{
		uint32_t tmpsmcr = timer->SMCR;

		/* Reset the slave mode Bits */
		tmpsmcr &= ~TIM_SMCR_SMS;

		timer->SMCR = tmpsmcr;
		data->irq_counter++;
		LOG_INF("Timer trigger %d", data->irq_counter);
		timer->SR &= ~TIM_SR_TIF;
	}
	// LOG_INF("Timer IRQ %x, %x", TIM1->CNT, TIM4->CNT);
}

#define TIMER(idx) DT_INST_PARENT(idx)

/** TIMx instance from DT */
#define TIM(idx) ((TIM_TypeDef *)DT_REG_ADDR(TIMER(idx)))

#define FIRE_STM32_COMBINED_PWM_INIT(idx)                                                            \
	static struct fire_stm32_combined_pwm_data fire_stm32_combined_pwm_data##idx = {                 \
		.reset = RESET_DT_SPEC_GET(TIMER(idx)),                                                      \
	};                                                                                               \
                                                                                                     \
	static void fire_##idx##_stm32_irq_config(const struct device *dev)                              \
	{                                                                                                \
		IRQ_CONNECT(DT_IRQ_BY_NAME(TIMER(idx), trgcom, irq),                                         \
					DT_IRQ_BY_NAME(TIMER(idx), trgcom, priority),                                    \
					timer_irq_handler,                                                               \
					DEVICE_DT_INST_GET(idx),                                                         \
					0);                                                                              \
		irq_enable(DT_IRQ_BY_NAME(TIMER(idx), trgcom, irq));                                         \
	};                                                                                               \
	PINCTRL_DT_INST_DEFINE(idx);                                                                     \
                                                                                                     \
	static const struct fire_stm32_combined_pwm_config fire_stm32_combined_pwm_##idx##_config = {    \
		.timer = TIM(idx),                                                                           \
		.prescaler = DT_PROP(TIMER(idx), st_prescaler),                                              \
		.pclken = {.bus = DT_CLOCKS_CELL(TIMER(idx), bus), .enr = DT_CLOCKS_CELL(TIMER(idx), bits)}, \
		.irq_config_func = fire_##idx##_stm32_irq_config,                                            \
		.irqn = DT_IRQN(TIMER(idx)),                                                                 \
		.pcfg = PINCTRL_DT_INST_DEV_CONFIG_GET(idx),                                                 \
		.pulse12_start = DT_PROP(DT_DRV_INST(idx), pulse12_start),                                   \
		.pulse34_start = DT_PROP(DT_DRV_INST(idx), pulse34_start),                                   \
		.pulse12_end = DT_PROP(DT_DRV_INST(idx), pulse12_end),                                       \
		.pulse34_end = DT_PROP(DT_DRV_INST(idx), pulse34_end),                                       \
		.min_mask_period = DT_PROP(DT_DRV_INST(idx), min_mask_period),                               \
	};                                                                                               \
                                                                                                     \
	DEVICE_DT_INST_DEFINE(idx, fire_stm32_combined_pwm_init, NULL,                                   \
						  &fire_stm32_combined_pwm_data##idx,                                        \
						  &fire_stm32_combined_pwm_##idx##_config, POST_KERNEL,                      \
						  CONFIG_PRINTER_INIT_PRIORITY, &fire_stm32_combined_pwm_api);

DT_INST_FOREACH_STATUS_OKAY(FIRE_STM32_COMBINED_PWM_INIT)
