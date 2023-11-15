#include <WebUSB.h>

WebUSB WebUSBSerial(0 /* https:// */, "localhost:9000");
#define Serial WebUSBSerial

// from system clock, 1 tick = 62.5 ns

static volatile uint16_t init_timer1_cnt = 0;
static volatile uint16_t init_timer3_cnt = 0;
static volatile bool capture_next = false;
static volatile bool camera_ready = false;

#define JETTING_INT_PIN (2)

static void jetting_interrupt()
{
  if (capture_next)
  {
    TCNT1 = init_timer1_cnt;
    capture_next = false;
  }
}

static int update_configuration(uint16_t delay_after_jetting_signal_ticks,
                                uint16_t strobe_on_ticks,
                                int jetting_signal_mode,
                                uint16_t camera_ready_delay_ticks)
{
  cli();
  capture_next = false;
  if (delay_after_jetting_signal_ticks < 1)
  {
    return -1;
  }
  if (jetting_signal_mode != FALLING && jetting_signal_mode != RISING)
  {
    return -1;
  }
  if (strobe_on_ticks >= 0xFFFF)
  {
    return -1;
  }
  uint16_t ocr1b_value = 0xFFFF - strobe_on_ticks;
  if (delay_after_jetting_signal_ticks > ocr1b_value)
  {
    return -1;
  }

  if (camera_ready_delay_ticks >= 0xFFFF)
  {
    return -1;
  }

  init_timer1_cnt = ocr1b_value - delay_after_jetting_signal_ticks;
  init_timer3_cnt = 0xFFFF - camera_ready_delay_ticks;
  TCCR3B &= ~(1 << CS30);
  TCCR1B &= ~(1 << CS10);
  TCNT1 = 0;
  TCNT3 = 0;
  OCR1B = ocr1b_value;
  TCCR1B |= (1 << CS10);
  TCCR3B |= (1 << CS30);
  detachInterrupt(digitalPinToInterrupt(JETTING_INT_PIN));
  attachInterrupt(digitalPinToInterrupt(JETTING_INT_PIN), jetting_interrupt, jetting_signal_mode);
  sei();
  return 0;
}

void setup()
{

  while (!Serial)
  {
    ;
  }
  Serial.begin(0);
  pinMode(JETTING_INT_PIN, INPUT);
  digitalWrite(10, 0);
  pinMode(10, OUTPUT);
  attachInterrupt(digitalPinToInterrupt(JETTING_INT_PIN), jetting_interrupt, FALLING);

  // use pin 10 = PB6 = OC1B for the strobe output
  OCR1A = 1;
  OCR1B = OCR1A + 1;
  TCNT1 = 0;
  TCCR1A = (1 << COM1B1) | (1 << COM1B0) | (1 << WGM11) | (1 << WGM10);
  TCCR1B = (1 << WGM13) | (1 << WGM12) | (1 << CS10);

  TCNT3 = 0;
  TCCR3A = 0;
  TCCR3B = (1 << CS30);
  TIMSK3 = (1 << TOIE3);
  update_configuration(100, 200, RISING, 300);
}

uint8_t config_buf[7];
uint8_t config_buf_len = 0;
bool reading_config = false;

void loop()
{
  if (Serial && Serial.available())
  {
    int byte = Serial.read();
    if (reading_config)
    {
      if (config_buf_len < 7)
      {
        config_buf[config_buf_len++] = byte;
      }
      if (config_buf_len == 7)
      {
        uint16_t delay_after_jetting_signal_ticks = config_buf[0] | (config_buf[1] << 8);
        uint16_t strobe_on_ticks = config_buf[2] | (config_buf[3] << 8);
        int jetting_signal_mode = config_buf[4];
        uint16_t camera_ready_delay_ticks = config_buf[5] | (config_buf[6] << 8);
        int ret = update_configuration(
            delay_after_jetting_signal_ticks,
            strobe_on_ticks,
            jetting_signal_mode,
            camera_ready_delay_ticks);
        char buf[64];
        sprintf(buf, "OK %d, %d, %d, %d\r\n",
                delay_after_jetting_signal_ticks,
                strobe_on_ticks,
                jetting_signal_mode,
                camera_ready_delay_ticks);
        if (ret == 0)
        {
          Serial.print(buf);
        }
        else
        {
          Serial.write("ERR\r\n");
        }
        Serial.flush();
        reading_config = false;
      }
    }
    else if (byte == 'C')
    {
      config_buf_len = 0;
      reading_config = true;
    }
    else if (byte == 'R')
    {
      TCNT3 = init_timer3_cnt;
      camera_ready = true;
    }
  }
}

ISR(TIMER3_OVF_vect)
{
  if (camera_ready)
  {
    camera_ready = false;
    capture_next = true;
  }
}