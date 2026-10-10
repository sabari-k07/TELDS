/*
 * =====================================================================================
 * Project: Transformer Energy Loss Detection System (TELDS)
 * Component: ESP32 Edge Telemetry & Dual-Point Current Measurement Firmware
 * Microcontroller: ESP32 DevKit v1 (38-pin / 30-pin)
 * Sensors:
 *   - CT1: SCT-013-000 (100A/50mA) -> Transformer Input Current
 *   - CT2: SCT-013-000 (100A/50mA) -> Consumer Aggregate Current
 *   - Voltage: ZMPT101B Active AC Voltage Sensor (0-250V AC)
 *   - Display: SSD1306 0.96" I2C OLED (128x64)
 * =====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

// OLED Display Configuration
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// Pin Definitions
#define PIN_CT1_INPUT        34  // Transformer Input Current ADC (ADC1_CH6)
#define PIN_CT2_CONSUMER     35  // Consumer Aggregate Current ADC (ADC1_CH7)
#define PIN_VOLTAGE_SENSOR   32  // ZMPT101B Voltage ADC (ADC1_CH4)
#define PIN_LED_NORMAL        2  // Green LED (Normal Operation)
#define PIN_LED_ANOMALY       4  // Red LED (Loss Anomaly Detected)
#define PIN_BUZZER           15  // Audible alert on critical loss

// Network & Server Configuration
const char* WIFI_SSID     = "TELDS_Distribution_Grid";
const char* WIFI_PASSWORD = "GridSecurityKey2026";
const char* BACKEND_URL   = "http://192.168.1.100:8000/api/v1/telemetry/reading";
const char* TRANSFORMER_CODE = "TX-RES-308";

// Sampling & Calibration Parameters
const int SAMPLES_PER_CYCLE  = 100;    // Samples across 50Hz mains cycle (20ms)
const float ADC_REF_VOLTAGE  = 3.3;    // ESP32 ADC Reference
const int ADC_RESOLUTION     = 4095;   // 12-bit ADC
const float V_BIAS           = 1.65;   // DC Midpoint Bias (3.3V / 2)
const float CT_CALIBRATION_1 = 30.0;   // Calibration factor for CT1 (Turns ratio & burden resistor)
const float CT_CALIBRATION_2 = 30.0;   // Calibration factor for CT2
const float VOLTAGE_CALIB    = 230.0;  // Nominal AC RMS Voltage

// Threshold Constants
const float WARNING_LOSS_THRESHOLD_PCT  = 10.0; // 10% discrepancy warning
const float CRITICAL_LOSS_THRESHOLD_PCT = 18.0; // 18% discrepancy critical

// Telemetry state variables
float current_rms_input = 0.0;
float current_rms_consumer = 0.0;
float voltage_rms = 230.0;
float power_input_kw = 0.0;
float power_consumer_kw = 0.0;
float loss_percentage = 0.0;
float energy_diff_kwh = 0.0;
bool is_anomaly = false;
unsigned long last_sample_time = 0;
const unsigned long SAMPLE_INTERVAL_MS = 2000; // 2-second telemetry loop

// Function Declarations
float calculate_rms_current(int pin, float calibration);
float calculate_rms_voltage(int pin);
void evaluate_loss_and_anomalies();
void update_oled_display();
void send_telemetry_to_backend();

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n[TELDS] Initializing ESP32 Dual-Point Current Monitoring Node...");

  // Pin Modes
  pinMode(PIN_LED_NORMAL, OUTPUT);
  pinMode(PIN_LED_ANOMALY, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  digitalWrite(PIN_LED_NORMAL, HIGH);
  digitalWrite(PIN_LED_ANOMALY, LOW);

  // Initialize I2C OLED
  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("[TELDS] Warning: SSD1306 OLED not found at 0x3C");
  } else {
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setTextSize(1);
    display.setCursor(10, 10);
    display.println("TELDS Edge Node v1.0");
    display.setCursor(10, 25);
    display.println("ESP32 Dual CT Monitor");
    display.setCursor(10, 42);
    display.println("Connecting WiFi...");
    display.display();
  }

  // Connect to Local Grid WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(400);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[TELDS] Connected to WiFi. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[TELDS] Operating in Autonomous Edge/Offline Buffer Mode.");
  }

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db); // Full range 0 - 3.3V
  Serial.println("[TELDS] Edge Sensor Conditioning Initialized.");
}

void loop() {
  unsigned long current_time = millis();
  if (current_time - last_sample_time >= SAMPLE_INTERVAL_MS) {
    last_sample_time = current_time;

    // 1. Sample CT1 (Transformer Input Current RMS)
    current_rms_input = calculate_rms_current(PIN_CT1_INPUT, CT_CALIBRATION_1);

    // 2. Sample CT2 (Consumer Aggregate Meter Current RMS)
    current_rms_consumer = calculate_rms_current(PIN_CT2_CONSUMER, CT_CALIBRATION_2);

    // 3. Sample AC Mains Voltage RMS
    voltage_rms = calculate_rms_voltage(PIN_VOLTAGE_SENSOR);

    // 4. Calculate Powers (kW, assuming PF = 0.92)
    const float PF = 0.92;
    power_input_kw = (voltage_rms * current_rms_input * PF) / 1000.0;
    power_consumer_kw = (voltage_rms * current_rms_consumer * PF) / 1000.0;

    // 5. Evaluate Energy Discrepancy & Edge Anomaly Threshold
    evaluate_loss_and_anomalies();

    // 6. Update Hardware OLED and Status LEDs
    update_oled_display();

    // 7. Transmit Wireless JSON Telemetry to Central Platform
    if (WiFi.status() == WL_CONNECTED) {
      send_telemetry_to_backend();
    }
  }
}

/**
 * Samples AC current waveform across full cycles and calculates True RMS
 */
float calculate_rms_current(int pin, float calibration) {
  long sum_squared_voltage = 0;
  int sample_count = 0;

  for (int i = 0; i < SAMPLES_PER_CYCLE; i++) {
    int raw_adc = analogRead(pin);
    // Convert ADC raw to voltage centered at 1.65V DC midpoint bias
    float voltage = ((float)raw_adc / ADC_RESOLUTION) * ADC_REF_VOLTAGE - V_BIAS;
    sum_squared_voltage += (long)(voltage * voltage * 10000.0);
    sample_count++;
    delayMicroseconds(200); // 200us * 100 = 20ms (one complete 50Hz cycle)
  }

  float mean_square = (float)sum_squared_voltage / (sample_count * 10000.0);
  float rms_voltage = sqrt(mean_square);
  float rms_current = rms_voltage * calibration;

  // Filter out low noise floor
  if (rms_current < 0.15) rms_current = 0.0;
  return rms_current;
}

/**
 * Samples AC voltage waveform and calculates True RMS
 */
float calculate_rms_voltage(int pin) {
  long sum_sq = 0;
  for (int i = 0; i < 50; i++) {
    int raw = analogRead(pin);
    float v = ((float)raw / ADC_RESOLUTION) * ADC_REF_VOLTAGE - V_BIAS;
    sum_sq += (long)(v * v * 1000.0);
    delayMicroseconds(400);
  }
  float rms = sqrt((float)sum_sq / (50.0 * 1000.0)) * 220.0;
  if (rms < 50.0) rms = 230.0; // Fallback to nominal if sensor not driven
  return rms;
}

/**
 * Core mathematical evaluation on edge microcontroller
 */
void evaluate_loss_and_anomalies() {
  // Energy difference in kW load
  float diff_kw = power_input_kw - power_consumer_kw;
  energy_diff_kwh = diff_kw * (SAMPLE_INTERVAL_MS / 3600000.0);

  if (power_input_kw > 0.05) {
    loss_percentage = (diff_kw / power_input_kw) * 100.0;
  } else {
    loss_percentage = 0.0;
  }

  // Edge Thresholding
  if (loss_percentage >= CRITICAL_LOSS_THRESHOLD_PCT) {
    is_anomaly = true;
    digitalWrite(PIN_LED_ANOMALY, HIGH);
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_BUZZER, HIGH); // Alarm on critical loss
  } else if (loss_percentage >= WARNING_LOSS_THRESHOLD_PCT) {
    is_anomaly = true;
    digitalWrite(PIN_LED_ANOMALY, HIGH);
    digitalWrite(PIN_LED_NORMAL, LOW);
    digitalWrite(PIN_BUZZER, LOW);
  } else {
    is_anomaly = false;
    digitalWrite(PIN_LED_ANOMALY, LOW);
    digitalWrite(PIN_LED_NORMAL, HIGH);
    digitalWrite(PIN_BUZZER, LOW);
  }
}

/**
 * Displays live telemetry on SSD1306 128x64 OLED
 */
void update_oled_display() {
  display.clearDisplay();

  // Header Bar
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.printf("TELDS Node: %s", TRANSFORMER_CODE);
  display.drawLine(0, 10, 127, 10, WHITE);

  // Current CT1 and CT2
  display.setCursor(0, 14);
  display.printf("Tx Input  (CT1): %4.1fA", current_rms_input);
  display.setCursor(0, 25);
  display.printf("Consumer  (CT2): %4.1fA", current_rms_consumer);

  // Power & Voltage
  display.setCursor(0, 36);
  display.printf("V: %3.0fV  P_in: %4.1fkW", voltage_rms, power_input_kw);

  // Loss Percentage & Status Pill
  display.drawLine(0, 47, 127, 47, WHITE);
  display.setCursor(0, 52);
  display.printf("Loss: %4.1f%%", loss_percentage);

  display.setCursor(76, 52);
  if (is_anomaly) {
    display.print("[ALERT!]");
  } else {
    display.print("[NORMAL]");
  }

  display.display();
}

/**
 * Transmits structured JSON packet to TELDS Central Platform via HTTP POST
 */
void send_telemetry_to_backend() {
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["transformer_code"] = TRANSFORMER_CODE;
  doc["current_ct1_input_a"] = round(current_rms_input * 100) / 100.0;
  doc["current_ct2_consumer_a"] = round(current_rms_consumer * 100) / 100.0;
  doc["voltage_v"] = round(voltage_rms * 10) / 10.0;
  doc["input_power_kw"] = round(power_input_kw * 100) / 100.0;
  doc["consumer_power_kw"] = round(power_consumer_kw * 100) / 100.0;
  doc["loss_percentage"] = round(loss_percentage * 100) / 100.0;
  doc["is_anomaly"] = is_anomaly;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    Serial.printf("[TELDS Telemetry] Sent payload -> HTTP %d\n", httpResponseCode);
  } else {
    Serial.printf("[TELDS Telemetry] Send failed: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  http.end();
}
