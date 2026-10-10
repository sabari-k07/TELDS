# Transformer Energy Loss Detection System (TELDS)
## Comprehensive Final Project Engineering & Research Report

---

### Executive Abstract
Electrical distribution systems globally suffer significant Aggregate Technical and Commercial (AT&C) losses, which degrade utility revenue, strain generation capacity, and impair power quality. Conventional loss estimation relies on monthly aggregate billing cycles, obscuring the precise distribution transformers (DTs) and feeder branches responsible for losses. 

The **Transformer Energy Loss Detection System (TELDS)** presents an end-to-end cyber-physical IoT and software platform designed to identify unexplained energy discrepancies in real-time. The system implements a dual-point current measurement edge architecture using an **ESP32** microcontroller, non-invasive **SCT-013-000 split-core current transformers**, and a **ZMPT101B voltage sensor**, synchronized with a cloud-native **FastAPI / React** analytics dashboard. By evaluating mathematical differences:
$$\Delta \text{ Energy} = E_{\text{Transformer Input}} - \sum E_{\text{Consumer Mappings}}$$
and isolating standard technical resistance losses ($6.0\%$), the platform detects anomalies with high sensitivity during evening peak hours (**7:00 PM – 10:00 PM**). Crucially, the system operates under a strict ethical non-theft classification policy, flagging anomalies for objective field inspection rather than automated accusation.

---

### 1. Introduction & Problem Statement
In power distribution networks, energy sent from the distribution substation does not equal the energy recorded across retail consumer meters. These discrepancies stem from:
1. **Technical Losses:** Inherent physical dissipation ($I^2R$ copper losses in winding conductors, iron core hysteresis, eddy current losses, and loose mechanical connections).
2. **Commercial Losses:** Meter calibration drift, faulty CT wiring, unmetered public utility taps, phase imbalances, and unauthorized bypass.

Traditional utilities operate blindly between billing cycles. TELDS bridges this gap by providing **continuous edge telemetry**, **automated CSV batch ingestion**, **peak-hour surveillance**, and **formal investigation audit logs**.

---

### 2. System Architecture
TELDS utilizes a modular 4-tier cyber-physical architecture:

```text
[ Grid Infrastructure ]
   ├── Distribution Transformer 11kV/415V (CT1 Measuring Point)
   └── Consumer Service Drop Junction (CT2 Measuring Point)
              │ (Analog AC Waveforms)
              ▼
[ Tier 1: Hardware Edge Telemetry Node ]
   ├── SCT-013 Current Transformers + Burden & 1.65V DC Bias Network
   ├── ZMPT101B Active AC Voltage Sensor
   ├── ESP32 Dual-Core 240MHz (True RMS Integration at 5kHz)
   ├── Local OLED (SSD1306) & Red/Green Warning LEDs
   └── Wi-Fi / Cellular HTTP REST Telemetry Dispatcher
              │ (JSON Packets / TLS)
              ▼
[ Tier 2: Central Backend & Analytics Engine (FastAPI) ]
   ├── API Gateways & OAuth2 JWT Role-Based Access Control
   ├── Energy Calculator Service (Technical vs Unexplained Isolation)
   ├── CSV Processing Engine (Pandas Batch Alignment & Validation)
   └── Anomaly Detection & Dispatch Alert Manager
              │ (SQLAlchemy ORM)
              ▼
[ Tier 3: Relational Persistence Layer (PostgreSQL / SQLite) ]
   ├── Users, Feeders, Transformers, Consumers, Readings, Analyses, Alerts
              │ (REST / JSON API)
              ▼
[ Tier 4: Engineering & Operations Web Dashboard (React + Vite) ]
   ├── Real-Time KPI Metric Cards & Recharts Telemetry Visualizations
   ├── Peak-Hour (7 PM - 10 PM) Comparative Dynamics
   ├── Investigation Desk with Field Notes & State Transitions
   └── Regulatory CSV Energy Audit Exporter
```

---

### 3. Mathematical Model & Analytical Formulation

#### 3.1 True RMS Calculation on Edge Microcontroller
The continuous voltage $v(t)$ and current $i(t)$ signals are sampled at discrete intervals $\Delta t = 200\,\mu\text{s}$ over a full $20\,\text{ms}$ mains cycle ($N = 100$ samples):
$$I_{\text{RMS}} = \sqrt{\frac{1}{N} \sum_{k=1}^{N} \left( \frac{V_{\text{ADC}}[k] - V_{\text{bias}}}{V_{\text{ref}}} \times V_{\text{ref}} \times K_{\text{CT}} \right)^2}$$
where $V_{\text{bias}} = 1.65\,\text{V}$ and $K_{\text{CT}} = 30.0$ (calibrated burden factor).

#### 3.2 Real Power & Energy Integration
$$P_{\text{Real}} = V_{\text{RMS}} \times I_{\text{RMS}} \times \text{PF} \quad (\text{PF} \approx 0.92)$$
$$E\,(\text{kWh}) = \int_{0}^{T} \frac{P_{\text{Real}}(t)}{1000} \, dt$$

#### 3.3 Loss Percentage & Unexplained Component Separation
$$\Delta E = E_{\text{Tx Input}} - \sum E_{\text{Consumer}}$$
$$\text{Loss } \% = \left(\frac{\Delta E}{E_{\text{Tx Input}}}\right) \times 100$$
$$E_{\text{Technical}} = E_{\text{Tx Input}} \times 0.060$$
$$E_{\text{Unexplained}} = \max\left(0,\, \Delta E - E_{\text{Technical}}\right)$$

---

### 4. Hardware Design & Engineering Validation

#### 4.1 Circuit Schematic
- **Burden Resistance:** $33\,\Omega$ ($1\%$ metal film) chosen to yield a nominal $1.16\,\text{V}$ peak output at $50\,\text{A}$, perfectly spanning the ESP32 $0-3.3\,\text{V}$ ADC input range around the $1.65\,\text{V}$ virtual ground.
- **Overvoltage Protection:** BAT54S dual Schottky diodes clamp transient spikes to $-0.3\,\text{V}$ and $3.6\,\text{V}$, preventing microcontroller latch-up.
- **Creepage & Safety:** Complete physical $2.0\,\text{mm} \times 25.0\,\text{mm}$ air-gap isolation milling slot separating $230\,\text{V}$ AC mains from low-voltage logic (IEC 61010-1 compliance).

#### 4.2 PCB Layout & Mechanical Enclosure
- **PCB:** Compact 2-layer FR4 board ($100\,\text{mm} \times 80\,\text{mm}$) with unbroken star ground return plane.
- **Enclosure:** Weatherproof IP54-rated Polycarbonate housing ($140\,\text{mm} \times 100\,\text{mm} \times 50\,\text{mm}$) featuring dual PG9 cable glands for CT clamps, acrylic OLED viewing bezel, and external mounting flanges for substation pole deployment.
- **Bill of Materials:** Complete prototype unit fabricated at **$39.54 USD** (~₹3,280 INR), dropping to **$21.80 USD** at volume (100+ units).

---

### 5. Experimental Results & Peak-Hour Findings
Testing using the virtual hardware simulator across residential feeder **TX-RES-308** yielded the following findings:

| Time Window | Category | Avg Tx Input | Avg Consumer Load | Difference | Loss % | Grid Classification |
|---|---|---|---|---|---|---|
| **00:00 – 06:00** | Night Base | 20.5 kWh | 19.3 kWh | 1.2 kWh | **5.85%** | Normal Technical Dissipation |
| **06:00 – 18:00** | Daytime Active | 32.5 kWh | 30.6 kWh | 1.9 kWh | **5.84%** | Normal Technical Dissipation |
| **19:00 – 22:00** | **Evening Peak** | **48.3 kWh** | **33.9 kWh** | **14.4 kWh** | **29.81%** | **CRITICAL ANOMALY ALERT** |
| **22:00 – 24:00** | Night Descent | 26.0 kWh | 24.5 kWh | 1.5 kWh | **5.76%** | Normal Technical Dissipation |

#### Key Engineering Finding:
Losses remain strictly within technical specifications ($5.8\%$) during off-peak hours, but surge to **$29.8\%$** exclusively during the 19:00 – 22:00 peak interval. This empirical signature pinpoints unmetered evening load (such as heavy domestic heating/cooling bypass) or high-resistance thermal junctions under heavy current draw, directing field inspection teams directly to pole #42 rather than conducting exhaustive feeder-wide sweeps.

---

### 6. Economic Viability & Return on Investment (ROI)
For an average 250 kVA distribution transformer delivering 15,000 kWh/month at $0.10/kWh:
- An undetected 20% evening discrepancy amounts to ~2,000 kWh wasted/unbilled per month = **$200/month loss per transformer**.
- TELDS Edge Hardware cost: **$39.54**.
- **Payback Period:** Under **1 month** per monitored transformer.

---

### 7. Conclusion & Future Roadmap
The Transformer Energy Loss Detection System demonstrates a complete, reliable, and cost-effective methodology for modernizing electric utility distribution management. Future enhancements include:
1. Long-range **LoRaWAN / Cellular NB-IoT** transceivers for deep rural substations lacking Wi-Fi coverage.
2. Machine learning auto-correlation with weather and temperature telemetry to dynamically adjust technical copper loss baselines.
3. Integration with smart-meter AMI (Advanced Metering Infrastructure) head-end systems.
