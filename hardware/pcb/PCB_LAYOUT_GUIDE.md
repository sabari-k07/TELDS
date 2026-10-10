# TELDS PCB Layout Design Guide & Manufacturing Specifications

## 1. Board Physical Specifications

| Parameter | Specification | Notes |
|---|---|---|
| **Board Dimensions** | 100.0 mm × 80.0 mm | Standard eurocard-compatible form factor |
| **Layer Count** | 2 Layers | Top: Component & Signal Routing, Bottom: Ground Plane |
| **Board Material** | FR-4 Standard | High Tg (140°C - 150°C) |
| **Finished Thickness** | 1.6 mm ± 10% | Mechanical rigidity for industrial terminal blocks |
| **Copper Weight** | 1 oz (35 µm) Outer | Suitable for 2A continuous peak load |
| **Solder Mask** | Matte Dark Blue / Green | High contrast against white silkscreen |
| **Silkscreen** | White, Top & Bottom | Legible reference designators and safety labels |
| **Surface Finish** | HASL Lead-Free (RoHS) | Cost-effective, corrosion-resistant |
| **Minimum Trace Width** | 0.254 mm (10 mil) | Digital signals (I2C, SPI) |
| **Power Trace Width** | 1.27 mm (50 mil) | 5V & 3.3V power rails |
| **Minimum Clearance** | 0.254 mm (10 mil) | Low-voltage digital traces |
| **High-Voltage Isolation** | ≥ 6.35 mm (250 mil) | Mains L/N to Low-Voltage logic |
| **Isolation Milling Slot** | 2.0 mm wide × 25.0 mm | Physical air-gap route beneath HLK-PM01 |
| **Mounting Holes** | 4 × M3 (3.2 mm drill) | Located at (5,5), (95,5), (5,75), (95,75) mm |

---

## 2. Floorplanning & Component Placement

The PCB layout is partitioned into three distinct electrical zones:

```text
+-------------------------------------------------------------------------+
| [ZONE 1: HIGH VOLTAGE MAINS] |    [ZONE 2: LOW VOLTAGE ANALOG SENSING]  |
| - 230V AC Screw Terminal J1  |    - CT1 Burden & Bias Network           |
| - 500mA Fuse F1              |    - CT2 Burden & Bias Network           |
| - MOV Surge Suppressor       |    - ZMPT101B AC Voltage Sensor          |
| - HLK-PM01 AC-DC Converter   |    - 1.65V Precision Reference Rail      |
|                              |                                          |
| ======== ISOLATION AIR-GAP SLOT (2mm x 25mm) =========================  |
|                                                                         |
|                      [ZONE 3: DIGITAL CORE & TELEMETRY]                 |
|                      - ESP32-WROOM-32D Module                           |
|                      - AMS1117-3.3 LDO Regulator                        |
|                      - SSD1306 OLED 4-pin Header                        |
|                      - Status LEDs (Green/Red) & Active Buzzer          |
|                      - Micro-USB / USB-C UART Flash Port                |
+-------------------------------------------------------------------------+
```

---

## 3. High-Voltage Safety & Creepage Guidelines
1. **Creepage Distance:** Under IEC 60950-1 and IEC 61010-1 for 250V AC working voltage, clearance must be at least 4.0 mm (pollution degree 2) and creepage 6.3 mm.
2. **Isolation Slot:** A 2.0 mm wide mechanical routing slot is milled between the AC input pins and the 5V DC secondary pins of the HLK-PM01 converter.
3. **No Copper Zones:** The top and bottom copper fill is completely pulled back by 8.0 mm around all high-voltage traces.

---

## 4. Grounding & Noise Mitigation Strategy
1. **Star Grounding:** The analog ground (AGND) return from CT1, CT2, and ZMPT101B connects to the main digital ground (DGND) at a single star point near the AMS1117 regulator.
2. **Solid Bottom Ground Plane:** The entire bottom layer acts as an unbroken ground return plane, except where high-voltage creepage cutouts are mandatory.
3. **Analog Guard Rings:** Ground copper surrounds the high-impedance ADC lines (GPIO 34 and GPIO 35) to prevent capacitive crosstalk from the ESP32 Wi-Fi RF power amplifier bursts.

---

## 5. Manufacturing Gerber File Package List

| Gerber File Name | Layer Description |
|---|---|
| `telds_edge_v1_0.GTL` | Top Copper Layer |
| `telds_edge_v1_0.GBL` | Bottom Copper Ground Plane |
| `telds_edge_v1_0.GTS` | Top Solder Mask |
| `telds_edge_v1_0.GBS` | Bottom Solder Mask |
| `telds_edge_v1_0.GTO` | Top Silkscreen (Component Legends) |
| `telds_edge_v1_0.GBO` | Bottom Silkscreen |
| `telds_edge_v1_0.GKO` | Board Outline & Milling Slots |
| `telds_edge_v1_0.DRL` | Excellon NC Drill File |

---

## 6. Autonomous Feeder Line Sensor Unit (ESP32-LSU for P0–P4 Localisation)

For segment-level multi-point monitoring at pole sites, the **ESP32-LSU** carrier board (80mm × 65mm) follows specialized outdoor distribution layout rules:
1. **RF Grounding & Antenna Isolation:** Dedicated 50-ohm coplanar waveguide with ground stitching for the SMA cellular / LoRa antenna connector. Keep antenna trace > 15 mm away from low-level ADC inputs.
2. **Thermal Management:** Multi-via thermal copper pour under the CN3791 MPPT solar charger IC to sink heat into the inner ground plane without convection airflow.
3. **Environmental Protection:** Specification calls for IPC-CC-830 certified silicone or acrylic conformal coating (e.g., HumiSeal 1B31) to protect against condensation, salt fog, and utility pole temperature swings (-20°C to +70°C).
