#define DT_DRV_COMPAT st_fire_stm32_combined_pwm

#include <zephyr/device.h>
#include <zephyr/drivers/printer_fire.h>
#include <zephyr/drivers/clock_control.h>
#include <zephyr/logging/log.h>
#include "stm32h7xx.h"
#include <stm32_ll_rcc.h>
#include <stm32h7xx_hal_tim.h>
#include <stm32h7xx_hal_tim_ex.h>
#include <zephyr/drivers/pinctrl.h>
#include <zephyr/drivers/reset.h>
#include <zephyr/irq.h>
#include <zephyr/drivers/clock_control/stm32_clock_control.h>
#include <lib/inkjetcontrol/encoder.h>
#include <zephyr/kernel.h>

LOG_MODULE_REGISTER(fire_stm32_combined_pwm, CONFIG_PRINTER_LOG_LEVEL);

struct fire_stm32_combined_pwm_data
{
	const struct reset_dt_spec reset;
	uint32_t freq;
	uint32_t tim_clk;
	void (*trigger_callback)(void);
	void (*fire_issued_callback)(void);
	void (*fire_cycle_completed_callback)(void);
	bool trigger_reset;
};

struct fire_stm32_combined_pwm_config
{
	TIM_TypeDef *timer;
	TIM_TypeDef *encoder_timer;
	TIM_TypeDef *clock_timer;
	uint32_t encoder_timer_trigger;
	uint32_t clock_timer_trigger;
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

static int fire_set_trigger(const struct device *dev, printer_fire_trigger_t trigger)
{
	LOG_INF("Set trigger %d", trigger);
	// struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer;
	uint32_t tmpsmcr = timer->SMCR;
	tmpsmcr &= ~TIM_SMCR_TS;
	tmpsmcr |= trigger == PRINTER_FIRE_TRIGGER_ENCODER ? cfg->encoder_timer_trigger : cfg->clock_timer_trigger;
	tmpsmcr &= ~TIM_SMCR_SMS; // reset slave mode
	timer->SMCR = tmpsmcr;
	return 0;
}

static int fire_set_fire_issued_callback(const struct device *dev, void (*callback)(void))
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	data->fire_issued_callback = callback;
	return 0;
}

static int fire_set_fire_cycle_completed_callback(const struct device *dev, void (*callback)(void))
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	data->fire_cycle_completed_callback = callback;
	return 0;
}

static int fire_set_trigger_callback(const struct device *dev, void (*callback)(void))
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	data->trigger_callback = callback;
	return 0;
}

static int fire_abort(const struct device *dev)
{
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer;
	timer->CR1 &= ~TIM_CR1_CEN;
	timer->CNT = 0;
	return 0;
}

static int fire_set_trigger_reset(const struct device *dev, bool reset)
{
	LOG_INF("Set trigger reset %d", reset);
	struct fire_stm32_combined_pwm_data *data = dev->data;
	data->trigger_reset = reset;
	return 0;
}

static int fire(const struct device *dev)
{
	const struct fire_stm32_combined_pwm_config *config = dev->config;
	// struct fire_stm32_combined_pwm_data *data = dev->data;
	TIM_TypeDef *timer = config->timer;

	/* Get the TIMx SMCR register value */
	uint32_t tmpsmcr = timer->SMCR;
	tmpsmcr &= ~TIM_SMCR_SMS;
	/* Set the slave mode */
	tmpsmcr |= TIM_SLAVEMODE_TRIGGER;

	/* Write to TIMx SMCR */
	timer->SMCR = tmpsmcr;
	return 0;
}

static uint64_t pwm_stm32_get_cycles_per_sec(const struct device *dev)
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	return (uint64_t)(data->tim_clk / (cfg->prescaler + 1));
}

static int set_timing(const struct device *dev, uint32_t light_delay, uint32_t light_duration, uint32_t fire_delay, uint32_t fire_duration)
{
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	uint64_t cycles_per_sec = pwm_stm32_get_cycles_per_sec(dev);

	uint32_t min_mask_cycles = (uint32_t)((cycles_per_sec * cfg->min_mask_period) / (1000 * 1000 * 1000));
	uint32_t pulse34_start_cycles = (uint32_t)((cycles_per_sec * (fire_delay + light_delay)) / (1000 * 1000 * 1000));
	uint32_t pulse34_end_cycles = (uint32_t)((cycles_per_sec * (fire_delay + light_delay + light_duration)) / (1000 * 1000 * 1000));
	uint32_t pulse12_start_cycles = (uint32_t)((cycles_per_sec * fire_delay) / (1000 * 1000 * 1000));
	uint32_t pulse12_end_cycles = (uint32_t)((cycles_per_sec * (fire_delay + fire_duration)) / (1000 * 1000 * 1000));
	uint32_t mask_cycles = pulse12_end_cycles > pulse34_end_cycles ? pulse12_end_cycles : pulse34_end_cycles;

	mask_cycles = mask_cycles > min_mask_cycles ? mask_cycles : min_mask_cycles;

	LOG_INF("Set timing: %d - %d, %d - %d, mask: %d", pulse12_start_cycles, pulse12_end_cycles, pulse34_start_cycles, pulse34_end_cycles, mask_cycles);

	TIM_TypeDef *timer = cfg->timer;
	TIM_HandleTypeDef htim1;
	htim1.Instance = timer;
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_2, pulse12_start_cycles);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_1, pulse12_end_cycles);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, pulse34_start_cycles);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_4, pulse34_end_cycles);
	__HAL_TIM_SET_AUTORELOAD(&htim1, mask_cycles - 1);
	return 0;
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

	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_3, pulse34_start_cycles);
	__HAL_TIM_SET_COMPARE(&htim1, TIM_CHANNEL_4, pulse34_end_cycles);
	__HAL_TIM_SET_AUTORELOAD(&htim1, mask_cycles - 1);
	return 0;
}

static const struct printer_fire_api fire_stm32_combined_pwm_api = {
	.request_fire = &fire,
	.set_light_timing = &set_light_timing,
	.set_trigger = &fire_set_trigger,
	.set_fire_issued_callback = &fire_set_fire_issued_callback,
	.set_fire_cycle_completed_callback = &fire_set_fire_cycle_completed_callback,
	.set_trigger_callback = &fire_set_trigger_callback,
	.abort = &fire_abort,
	.set_trigger_reset = &fire_set_trigger_reset,
	.set_timing = &set_timing,
};

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

	data->trigger_callback = NULL;
	data->fire_issued_callback = NULL;
	data->fire_cycle_completed_callback = NULL;
	data->trigger_reset = true;

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
	printer_fire_set_trigger(dev, PRINTER_FIRE_TRIGGER_CLOCK);
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
	__HAL_TIM_ENABLE_IT(&htim1, TIM_IT_UPDATE);
	__HAL_TIM_ENABLE_IT(&htim1, TIM_IT_CC2);
	// // __HAL_TIM_ENABLE(&htim1);

	uint32_t tmpcr2 = cfg->clock_timer->CR2;
	tmpcr2 &= ~TIM_CR2_MMS;
	tmpcr2 |= TIM_TRGO_UPDATE;
	cfg->clock_timer->CR2 = tmpcr2;

	return 0;
}

static void timer_update_irq_handler(const struct device *dev)
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer;
	if (timer->SR & TIM_SR_UIF)
	{
		timer->SR &= ~TIM_SR_UIF;
		if (data->fire_cycle_completed_callback != NULL)
		{
			data->fire_cycle_completed_callback();
		}
	}
}

static void timer_cc_irq_handler(const struct device *dev)
{
	struct fire_stm32_combined_pwm_data *data = dev->data;
	const struct fire_stm32_combined_pwm_config *cfg = dev->config;
	TIM_TypeDef *timer = cfg->timer;
	if (timer->SR & TIM_SR_CC2IF)
	{
		timer->SR &= ~TIM_SR_CC2IF;
		if (data->fire_issued_callback != NULL)
		{
			data->fire_issued_callback();
		}
	}
}

#define TIMER(idx) DT_INST_PARENT(idx)

/** TIMx instance from DT */
#define TIM(idx) ((TIM_TypeDef *)DT_REG_ADDR(TIMER(idx)))
#define ENCODER_TIMER(idx) ((TIM_TypeDef *)DT_REG_ADDR(DT_PROP(DT_DRV_INST(idx), encoder_timer)))
#define CLOCK_TIMER(idx) ((TIM_TypeDef *)DT_REG_ADDR(DT_PROP(DT_DRV_INST(idx), clock_timer)))

#define FIRE_STM32_COMBINED_PWM_INIT(idx)                                                            \
	static void fire_##idx##_stm32_irq_config(const struct device *dev);                             \
	static struct fire_stm32_combined_pwm_data fire_stm32_combined_pwm_data##idx = {                 \
		.reset = RESET_DT_SPEC_GET(TIMER(idx)),                                                      \
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
		.encoder_timer = ENCODER_TIMER(idx),                                                         \
		.clock_timer = CLOCK_TIMER(idx),                                                             \
		.encoder_timer_trigger = DT_PROP(DT_DRV_INST(idx), encoder_timer_trigger),                   \
		.clock_timer_trigger = DT_PROP(DT_DRV_INST(idx), clock_timer_trigger),                       \
	};                                                                                               \
                                                                                                     \
	ISR_DIRECT_DECLARE(fire_##idx##_trgcom_isr_handler)                                              \
	{                                                                                                \
		struct fire_stm32_combined_pwm_data *data = &fire_stm32_combined_pwm_data##idx;              \
		const struct fire_stm32_combined_pwm_config *cfg = &fire_stm32_combined_pwm_##idx##_config;  \
		TIM_TypeDef *timer = cfg->timer;                                                             \
		if (timer->SR & TIM_SR_TIF)                                                                  \
		{                                                                                            \
			timer->SR &= ~TIM_SR_TIF;                                                                \
			if (data->trigger_callback != NULL)                                                      \
			{                                                                                        \
				data->trigger_callback();                                                            \
			}                                                                                        \
			if (data->trigger_reset == true)                                                         \
			{                                                                                        \
				/* reset the slave mode */                                                           \
				uint32_t tmpsmcr = timer->SMCR;                                                      \
				tmpsmcr &= ~TIM_SMCR_SMS;                                                            \
				timer->SMCR = tmpsmcr;                                                               \
			}                                                                                        \
		}                                                                                            \
		ISR_DIRECT_PM(); /* done after do_stuff() due to latency concerns */                         \
		return 1;                                                                                    \
	}                                                                                                \
                                                                                                     \
	static void fire_##idx##_stm32_irq_config(const struct device *dev)                              \
	{                                                                                                \
		IRQ_DIRECT_CONNECT(DT_IRQ_BY_NAME(TIMER(idx), trgcom, irq),                                  \
						   DT_IRQ_BY_NAME(TIMER(idx), trgcom, priority),                             \
						   fire_##idx##_trgcom_isr_handler,                                          \
						   0);                                                                       \
		irq_enable(DT_IRQ_BY_NAME(TIMER(idx), trgcom, irq));                                         \
		IRQ_CONNECT(DT_IRQ_BY_NAME(TIMER(idx), up, irq),                                             \
					DT_IRQ_BY_NAME(TIMER(idx), up, priority),                                        \
					timer_update_irq_handler,                                                        \
					DEVICE_DT_INST_GET(idx),                                                         \
					0);                                                                              \
		irq_enable(DT_IRQ_BY_NAME(TIMER(idx), up, irq));                                             \
		IRQ_CONNECT(DT_IRQ_BY_NAME(TIMER(idx), cc, irq),                                             \
					DT_IRQ_BY_NAME(TIMER(idx), cc, priority),                                        \
					timer_cc_irq_handler,                                                            \
					DEVICE_DT_INST_GET(idx),                                                         \
					0);                                                                              \
		irq_enable(DT_IRQ_BY_NAME(TIMER(idx), cc, irq));                                             \
	};                                                                                               \
                                                                                                     \
	DEVICE_DT_INST_DEFINE(idx, fire_stm32_combined_pwm_init, NULL,                                   \
						  &fire_stm32_combined_pwm_data##idx,                                        \
						  &fire_stm32_combined_pwm_##idx##_config, POST_KERNEL,                      \
						  CONFIG_PRINTER_INIT_PRIORITY, &fire_stm32_combined_pwm_api);

DT_INST_FOREACH_STATUS_OKAY(FIRE_STM32_COMBINED_PWM_INIT)
