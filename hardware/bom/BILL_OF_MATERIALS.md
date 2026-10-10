# TELDS Hardware Bill of Materials (BOM)
## Project: Transformer Energy Loss Detection System Edge Telemetry Node
**Revision:** v1.0 | **Target Production:** 1 Unit Prototype & Batch (100 units)

---

### Component Summary Table

| Item | Ref Des | Component Description | Value / Package | Manufacturer Part # | Qty | Unit Cost (USD) | Total Cost (USD) | Sourcing / Supplier |
|---|---|---|---|---|---|---|---|---|
| **1** | U1 | Microcontroller Module | Dual-Core 240MHz, WiFi/BLE | ESP32-WROOM-32D | 1 | $3.50 | $3.50 | Espressif / DigiKey |
| **2** | CT1 | Non-Invasive Current Transformer | 100A AC, 50mA Out (Split-Core) | SCT-013-000 | 1 | $7.20 | $7.20 | YHDC / Mouser |
| **3** | CT2 | Non-Invasive Current Transformer | 100A AC, 50mA Out (Split-Core) | SCT-013-000 | 1 | $7.20 | $7.20 | YHDC / Mouser |
| **4** | U2 | Precision AC Voltage Sensor | 0-250V AC In, Analog Out | ZMPT101B Module | 1 | $3.80 | $3.80 | Zeming / LCSC |
| **5** | DISP1 | OLED Graphical Display | 0.96" 128x64 I2C Blue/White | SSD1306 4-pin | 1 | $2.80 | $2.80 | Adafruit / AliExpress |
| **6** | PS1 | Isolated AC-DC Power Supply | 230V AC to 5V DC 600mA (3W) | HLK-PM01 | 1 | $3.10 | $3.10 | Hi-Link / LCSC |
| **7** | VR1 | Low-Dropout Voltage Regulator | 3.3V 800mA, SOT-223 | AMS1117-3.3 | 1 | $0.25 | $0.25 | Advanced Monolithic |
| **8** | R_B1, R_B2 | Burden Resistors | 33Ω 1% 1/2W Through-Hole | MFR-50FTE52-33R | 2 | $0.10 | $0.20 | Yageo / DigiKey |
| **9** | R1, R2, R3, R4 | Voltage Bias Divider Resistors | 10kΩ 0.1% Precision 0805 | ERA-6AEB103V | 4 | $0.08 | $0.32 | Panasonic |
| **10** | C1, C2, C3 | DC Bias Bypass Capacitors | 10µF 16V Tantalum / Low-ESR | TAJA106K016RNJ | 3 | $0.20 | $0.60 | AVX / Mouser |
| **11** | C4, C5, C6 | Decoupling Ceramic Capacitors | 100nF (0.1µF) 50V 0805 | C0805C104K5RACTU | 3 | $0.04 | $0.12 | KEMET |
| **12** | D1, D2, D3, D4 | ADC Over-voltage Clamp Diodes | Dual Schottky SOT-23 | BAT54S | 2 | $0.12 | $0.24 | Diodes Inc. |
| **13** | MOV1 | Metal Oxide Varistor (Surge) | 470V Clamp (14mm disc) | 14D471K | 1 | $0.35 | $0.35 | Bourns |
| **14** | F1 | Mains AC Safety Fuse | 500mA 250V Slow-Blow with holder | 0218.500MXP | 1 | $0.45 | $0.45 | Littelfuse |
| **15** | J1 | Mains AC Terminal Block | 2-pin 5.08mm Pitch Screw | 1757242 | 1 | $0.55 | $0.55 | Phoenix Contact |
| **16** | J2, J3 | CT Sensor Input Jacks | 3.5mm Stereo Audio Jack PCB | SJ-3523-SMT-TR | 2 | $0.40 | $0.80 | CUI Devices |
| **17** | LED1 | Normal Grid Indicator LED | 5mm Green Through-Hole | WP7113GD | 1 | $0.08 | $0.08 | Kingbright |
| **18** | LED2 | Anomaly Alert Indicator LED | 5mm Red High-Brightness | WP7113ID | 1 | $0.08 | $0.08 | Kingbright |
| **19** | BZ1 | Audible Piezo Alarm Buzzer | 5V Active Buzzer 85dB | PKM13EPYH4002-B0 | 1 | $0.65 | $0.65 | Murata |
| **20** | PCB1 | 2-Layer FR4 Printed Circuit Board | 100mm × 80mm, 1.6mm, 1oz | Custom Fabrication | 1 | $4.00 | $4.00 | JLCPCB / PCBWay |
| **21** | ENC1 | IP54 Weatherproof Enclosure | Polycarbonate/ABS (140×100×50mm) | Custom 3D Printed / Molded | 1 | $6.50 | $6.50 | In-House / Formlabs |
| **22** | GLAND1, 2 | Cable Glands for CT Cables | PG9 (Diameter 4-8mm) Nylon IP68 | PG9-BLK | 2 | $0.50 | $1.00 | Essentra |
| **23** | GLAND3 | Cable Gland for Mains AC | PG7 (Diameter 3-6.5mm) Nylon | PG7-BLK | 1 | $0.45 | $0.45 | Essentra |
| **24** | HARD1 | Screws, Standoffs, Gasket | M3 Standoffs & Neoprene O-ring | Misc Hardware Kit | 1 | $1.50 | $1.50 | McMaster-Carr |
| **TOTAL** | — | **Single Unit Prototype Cost** | — | — | **35** | — | **$39.54** | *(~₹3,280 INR)* |

---

### Batch Production Estimation (100+ Units)
At scale, volume component discounts and multi-panel PCB fabrication reduce the unit bill of materials cost from **$39.54** down to **$21.80 USD** (~₹1,810 INR).

---

### Autonomous Feeder Line Sensor Pole Node (ESP32-LSU for P0–P4 Localisation)

For segment-level loss localisation at pole sites P0 through P4, the pole-mount unit integrates autonomous solar harvesting and cellular/LoRa wireless telemetry:

| Item | Ref Des | Description | Part # / Spec | Qty | Unit Cost (USD) | Sourcing |
|---|---|---|---|---|---|---|
| **L1** | U_MOD1 | Cellular NB-IoT / Cat-M1 Modem | SIMCom SIM7080G + SMA Antenna | 1 | $11.50 | Waveshare / DigiKey |
| **L2** | U_MPPT | MPPT Solar Battery Charger | CN3791 12V/18V MPPT Controller | 1 | $2.40 | Consonance / LCSC |
| **L3** | PV1 | Monocrystalline Solar Panel | 10W 18V Voc Aluminum Frame | ECO-WORTHY 10W | 1 | $12.00 | Amazon / Sunking |
| **L4** | BAT1 | High-Temp LiFePO4 Battery | 32700 Cylindrical (3.2V 6000mAh) | IFR32700-6000 | 1 | $6.80 | EVE / Mouser |
| **L5** | CT_A | Split-Core Rogowski / AC CT | 100A:50mA (Class 1.0) | SCT-013-000 | 1 | $7.20 | YHDC |
| **L6** | U_MCU | Microcontroller SoC | ESP32-WROOM-32D | 1 | $3.50 | Espressif |
| **L7** | ENC_P | IP67 UV-Polycarbonate Pole Box | 160×120×65mm with Pole Mount Clamp | Bud Industries / Custom | 1 | $8.50 | Bud / Polycase |
| **L8** | GLD_P | Weatherproof Cable Glands | PG9 IP68 Glands | 2 | $0.80 | Essentra |
| **L9** | MISC | Antenna Pigtail & Bracket | SMA IP67 Pigtail + SS Pole Clamp | Misc Hardware | 1 | $1.50 | McMaster-Carr |
| **TOTAL** | — | **Single Pole Node Cost (ESP32-LSU)** | — | **10** | **$54.20** | *(~₹4,500 INR)* |
