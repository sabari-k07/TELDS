# TELDS Hardware Circuit Schematic Specification
## Dual-Point Current Monitoring & Grid Telemetry Edge Node

### 1. Circuit Overview
The TELDS Edge Unit is an industrial IoT sensor node based on the **ESP32-WROOM-32D** microcontroller. It performs simultaneous True RMS current sampling at two critical grid interfaces:
1. **CT1**: Secondary side of the Distribution Transformer (Input Current).
2. **CT2**: Aggregated consumer outgoing feeder / metered junction (Output Current).

By comparing the real-time load profiles at both measuring points, the node calculates instantaneous energy discrepancy, flags anomalies, drives visual/audible alarms, and transmits wireless telemetry via Wi-Fi/GSM to the central TELDS server.

---

### 2. Functional Subsystems

#### 2.1 Power Supply Stage
- **Input:** 230V AC ± 15% 50Hz mains or 12V DC auxiliary station battery.
- **AC/DC Converter:** Hi-Link HLK-PM01 (230V AC to 5V DC 600mA encapsulated converter) with MOV (Metal Oxide Varistor 14D471K) surge suppression and 500mA slow-blow fuse.
- **3.3V Low-Dropout Regulator:** AMS1117-3.3 providing clean 3.3V (up to 800mA) with 10µF tantalum and 100nF ceramic decoupling capacitors.

#### 2.2 Dual AC Current Measurement Circuit (CT1 & CT2)
- **Current Transformer (CT):** SCT-013-000 Non-invasive Split-Core Current Transformer (100A input, 50mA current output at rated load, 1:2000 turns ratio).
- **Burden Resistor ($R_B$):**
  $$I_{\text{peak}} = 100\text{A} \times \frac{\sqrt{2}}{2000} \approx 0.0707\text{A}$$
  $$R_B = \frac{V_{\text{peak}}}{I_{\text{peak}}} = \frac{1.16\text{V}}{0.0707\text{A}} \approx 16.4\Omega \quad \rightarrow \quad \text{Selected } 18\Omega \text{ (1\% metal film)} \text{ or } 33\Omega \text{ for 50A range}$$
- **DC Midpoint Bias Network:**
  ESP32 ADC accepts only unipolar signals ($0\text{V}$ to $3.3\text{V}$). A precision voltage divider ($R_1 = 10\text{k}\Omega$, $R_2 = 10\text{k}\Omega$, 0.1% tolerance) provides a stable $V_{\text{bias}} = 1.65\text{V}$ DC midpoint reference.
- **Filtering Capacitor:** $10\mu\text{F}$ low-ESR electrolytic capacitor in parallel with $100\text{nF}$ ceramic across the bias rail to bypass AC ripples to ground.
- **Transient Protection:** Dual Schottky clamping diodes (BAT54S) on ADC inputs to prevent over-voltage spikes exceeding 3.3V or dipping below 0V.

#### 2.3 AC Voltage Measurement Subsystem
- **Module:** ZMPT101B Active Precision Voltage Transformer with onboard operational amplifier (LM358) and adjustable gain potentiometer.
- **Output:** Sinusoidal analog signal centered at 1.65V DC, mapped to GPIO 32.

#### 2.4 Microcontroller (ESP32-WROOM-32D)
- **Clock:** 240 MHz Dual-Core Xtensa LX6.
- **ADC:** 12-bit SAR ADC (Sampling at 5 kHz per channel for 100 samples per 20ms mains cycle).
- **Pinout Allocation:**
  - `GPIO 34` (ADC1_CH6): CT1 Input Current
  - `GPIO 35` (ADC1_CH7): CT2 Consumer Aggregate Current
  - `GPIO 32` (ADC1_CH4): ZMPT101B Voltage
  - `GPIO 21` (I2C SDA): OLED Display & Real-Time Clock
  - `GPIO 22` (I2C SCL): OLED Display & Real-Time Clock
  - `GPIO 2`: Green Status LED (Normal Grid Operation)
  - `GPIO 4`: Red Status LED (Loss Anomaly Warning)
  - `GPIO 15`: 5V Active Piezo Buzzer (Critical Loss Audio Alarm)

#### 2.5 Display & User Interface
- **OLED Display:** 0.96" I2C SSD1306 (128x64 resolution, address 0x3C).
- **Indicators:** High-brightness 5mm LEDs and audible buzzer.

---

### 3. Netlist Summary

| Net Name | From | To | Purpose |
|---|---|---|---|
| `MAINS_L`, `MAINS_N` | Terminal Block J1 | HLK-PM01 / ZMPT101B | 230V AC Utility In |
| `+5V` | HLK-PM01 Pin 4 | AMS1117 In, Buzzer, OLED VCC | Primary DC rail |
| `+3.3V` | AMS1117 Pin 2 | ESP32 VDD, Bias Dividers | Clean digital/analog supply |
| `GND` | Common Plane | Ground Plane | System Reference Ground |
| `VBIAS_1V65` | R1/R2 Junction | CT1 & CT2 Burden Common | 1.65V DC Virtual Ground |
| `CT1_ADC` | CT1(+) via 1k resistor | ESP32 GPIO 34 | Transformer Input Current |
| `CT2_ADC` | CT2(+) via 1k resistor | ESP32 GPIO 35 | Consumer Output Current |
| `VOLT_ADC` | ZMPT101B Analog Out | ESP32 GPIO 32 | Grid AC Voltage |
| `I2C_SDA` | ESP32 GPIO 21 | OLED SDA | Display Data |
| `I2C_SCL` | ESP32 GPIO 22 | OLED SCL | Display Clock |

---

### 4. Autonomous Feeder Line Sensor Pole Node (ESP32-LSU for P0–P4 Localisation)

For segment-level loss localisation along distribution lines, outdoor pole-mounted units (Node P0 through P4) utilize the **ESP32-LSU** architecture:

```
[ Overhead 11kV/415V Line ]
            |
    [ Split-Core CT / Rogowski ]
            | (Analog Signal)
    [ Shunt Burden + INA181 Amp ] ---> [ ESP32 ADC1 (GPIO 34/35) ]
                                                |
    [ Solar 10W / Line Harvester ]              | (UART / SPI)
            |                                   v
    [ CN3791 MPPT + LiFePO4 Pack ] ---> [ SIM7080G NB-IoT / SX1262 LoRa ] ---> [ Cloud TELDS Backend ]
```

#### 4.1 Solar & Line Power Harvesting Subsystem
* **Solar Panel:** 10W Monocrystalline 18V Voc outdoor panel mounted on pole bracket.
* **MPPT Charge Controller:** Analog Devices / Consonance **CN3791** MPPT LiFePO4 charger with automatic float regulation.
* **Energy Storage:** 3.2V 6000mAh 32700 LiFePO4 cell rated for -20°C to +70°C utility pole environments.
* **Ultra-Low Power LDO:** TPS7A02 low-quiescent-current (25nA Iq) 3.3V voltage regulator.

#### 4.2 Multi-Point Wireless Telemetry Modem
* **Primary Cellular Interface:** SIM7080G multi-band Cat-M1 / NB-IoT modem controlled via AT commands on ESP32 `UART2` (`GPIO 16` RX, `GPIO 17` TX).
* **Secondary Sub-GHz Mesh (Substations/Rural):** Semtech SX1262 868/915 MHz LoRa transceiver via SPI interface for peer-to-peer pole hopping.
* **Simulated Telemetry Note:** In current prototype testing, all wireless transmission packets, latency delays, and RSSI metrics are simulated through the modular software simulation engine.
