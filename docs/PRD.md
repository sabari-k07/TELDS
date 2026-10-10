# Product Requirements Document (PRD)
## Transformer Energy Loss Detection System (TELDS)
**Document Version:** 2.0 (Full-Stack + IoT Hardware Scope)  
**Status:** Approved / Production Baseline

---

### 1. Project Overview & Vision
The **Transformer Energy Loss Detection System (TELDS)** is a cyber-physical energy monitoring and analytics platform. It combines edge IoT telemetry hardware (dual-point current measurement on distribution transformers) with an enterprise web application to detect, categorize, and investigate energy losses across electrical distribution networks.

---

### 2. Core Pillars of the Solution

#### Pillar 1: Full-Stack Web Application
- **Role-Based Access Control:** Secure access for Grid Administrators, Senior Distribution Engineers, Substation Operators, and Field Inspectors.
- **Analytical Telemetry Dashboard:** Real-time KPI cards for Transformer Input Energy, Total Consumer Billed Energy, Net Difference ($\Delta$), Loss %, and Active Anomalies.
- **Mathematical Engine:**
  - $\Delta \text{ Energy} = \text{Transformer Input} - \sum \text{Consumer Meter Read}$
  - $\text{Loss } \% = (\Delta \text{ Energy} / \text{Transformer Input}) \times 100$
- **Technical vs Unexplained Loss Isolation:** 6.0% technical loss allowance applied; unexplained loss isolated without automatic theft accusation.
- **Peak-Hour Dynamics:** Focused surveillance during high-demand evening hours (7:00 PM – 10:00 PM).
- **Audit Reports & CSV Ingestion:** Synchronized meter readings batch upload and CSV export.

#### Pillar 2: Virtual Hardware Prototype
- **Microcontroller:** Simulated ESP32 DevKit v1 with dual-core 240MHz architecture.
- **Measuring Point 1 (CT1):** Transformer secondary winding input current (SCT-013-000, 100A/50mA).
- **Measuring Point 2 (CT2):** Consumer aggregate outgoing feeder current (SCT-013-000, 100A/50mA).
- **Voltage Measurement:** ZMPT101B active AC voltage transformer module (230V AC nominal).
- **Edge Anomaly Detection:** True RMS integration at 5 kHz; edge threshold alerts (Warning > 10%, Critical > 18%).
- **Edge UI:** 0.96" SSD1306 OLED (128x64 I2C), Green Normal LED (GPIO 2), Red Anomaly LED (GPIO 4), Active Buzzer (GPIO 15).
- **Telemetry Dispatch:** Wireless HTTP REST JSON packets sent to central backend API (`/api/v1/telemetry/reading`).
- **Simulators Provided:** Both a Wokwi web simulation environment and a Python standalone virtual ESP32 streaming simulator.

#### Pillar 3: Hardware Design Documents
- **Circuit Schematic:** Vector schematic (`schematic_diagram.svg`) & documentation (`CIRCUIT_SCHEMATIC.md`) featuring burden resistors, 1.65V DC midpoint bias, TVS transient clamp protection, and power conversion (230V AC -> 5V -> 3.3V).
- **PCB Layout:** 2-layer FR4 board design (`100mm x 80mm`), high-voltage creepage air-gap isolation milling slot (2mm x 25mm), star ground plane, and Gerber RS-274X manufacturing specifications.
- **3D Enclosure Model:** Parametric 3D printable OpenSCAD model (`enclosure_model.scad`), IP54 weather rating specifications (`ENCLOSURE_SPEC.md`), dual PG9 cable glands for CT clamps, and 3D technical blueprint.
- **Bill of Materials (BOM):** Comprehensive BOM (`BILL_OF_MATERIALS.md`, `bom.csv`) covering all 24 electronic/mechanical components with unit and batch production costs ($39.54 prototype unit cost).

#### Pillar 4: Complete Project Documentation
- Product Requirements Document ([`PRD.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/PRD.md))
- System Architecture ([`ARCHITECTURE.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/ARCHITECTURE.md))
- Database Schema ([`DB_SCHEMA.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/DB_SCHEMA.md))
- API Documentation ([`API_DOCS.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/API_DOCS.md))
- Test Cases Matrix ([`TEST_CASES.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/TEST_CASES.md))
- Operational User Guide ([`USER_GUIDE.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/USER_GUIDE.md))
- Installation & Deployment Instructions ([`INSTALLATION_INSTRUCTIONS.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/INSTALLATION_INSTRUCTIONS.md))
- Comprehensive Final Project Report ([`FINAL_PROJECT_REPORT.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/FINAL_PROJECT_REPORT.md))
