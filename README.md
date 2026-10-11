# Transformer Energy Loss Detection System (TELDS)

> **Complete Cyber-Physical Energy Monitoring & Analytics Platform**  
> Combines Edge IoT Dual-Point Current Measurement Hardware (ESP32) with a High-Performance Full-Stack Web Platform (FastAPI + React) for Distribution Utilities.

---

## ⚡ The 4 Pillars of TELDS

### 1. SCADA Digital Twin & Full-Stack Web Application
- **Main SCADA Control Center (`index.html`):** High-density digital twin control center powered by Google Stitch SCADA interface, featuring interactive feeder SVG topology (DT-01, SEG-01 to SEG-12), persistent right-side forensic inspector drawer, live 1-second telemetry streams, harmonic waveform traces, segment circuit breakers, and crew dispatching.
- **Floating Minimized Hardware Lab (`telds_dashboard.html`):** The 9-tab legacy prototype engine is accessible as a persistent minimized picture-in-picture widget docked at the bottom right corner with minimize, maximize, and standalone tab controls.
- **Cloud Database (Supabase PostgreSQL):** Integrated with Supabase (`nuxmpdleqpqunkhbpqjj.supabase.co`), complete with table schemas, row-level security, and audit logs defined in [`supabase_schema.sql`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/supabase_schema.sql).
- **Mathematical Engine:**
  - $\Delta \text{ Energy} = \text{Transformer Input} - \sum \text{Consumer Meter Consumption}$
  - $\text{Loss } \% = (\Delta \text{ Energy} / \text{Transformer Input}) \times 100$
- **Loss Separation:** Isolates 6.0% technical baseline from unexplained losses. **Never automatically classifies loss as electricity theft.**
- **Peak-Hour Dynamics:** Dedicated surveillance for 19:00 – 22:00 (7 PM – 10 PM).

### 2. Virtual Hardware Prototype & Unauthorised Power Tapping Detection
- **System Description:** Microcontroller-based unauthorised power tapping detection system using two current measurement points (CT1 incoming vs. CT2 outgoing) and wireless communication.
- **ESP32 Edge Engine:** Compares incoming and outgoing current values, calculates the discrepancy, and checks it against a configurable threshold.
- **Persistence Filter:** Confirms discrepancies across configurable consecutive cycles to filter out transient motor inrush spikes, preventing nuisance tripping.
- **Automated Wireless Alerting:** Generates simulated Wi-Fi/MQTT JSON alert telemetry, activating local alarms and flagging the monitored distribution line as `SUSPICIOUS (TAPPING SUSPECTED)`.
- **Scenario Simulation Engine:** 4 realistic scenarios (Balanced Normal, Inrush Transient, Confirmed Tapping, High Peak Bypass) built into [`telds_dashboard.html`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/telds_dashboard.html).
- **Physical Prototype Extension:** Complete schematic diagrams, 2-layer PCB layout with 2mm isolation slots, weatherproof IP54 enclosure specifications, and itemized Bill of Materials.
- **C++ Firmware:** [`hardware/firmware/esp32_firmware.ino`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/firmware/esp32_firmware.ino) with True RMS 5kHz sampling and edge threshold detection.
- **Wokwi Simulation:** Ready-to-run in browser via [`hardware/simulation/diagram.json`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/simulation/diagram.json) and [`wokwi.toml`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/simulation/wokwi.toml).
- **Virtual ESP32 Simulator Script:** Standalone Python script [`hardware/virtual_esp32_simulator.py`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/virtual_esp32_simulator.py) streaming live HTTP telemetry to backend.

### 3. Hardware Design Documents
- **Circuit Schematic:** Detailed specification ([`hardware/schematics/CIRCUIT_SCHEMATIC.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/schematics/CIRCUIT_SCHEMATIC.md)) and vector schematic diagram ([`hardware/schematics/schematic_diagram.svg`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/schematics/schematic_diagram.svg)).
- **PCB Layout:** 2-layer FR4 board design with high-voltage 2mm creepage isolation slot ([`hardware/pcb/PCB_LAYOUT_GUIDE.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/pcb/PCB_LAYOUT_GUIDE.md)), vector layout ([`hardware/pcb/pcb_layout.svg`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/pcb/pcb_layout.svg)), and Gerber specs ([`hardware/pcb/gerber_specs.txt`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/pcb/gerber_specs.txt)).
- **3D Enclosure Model:** Parametric OpenSCAD 3D printable model ([`hardware/enclosure/enclosure_model.scad`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/enclosure/enclosure_model.scad)), IP54 weather rating specs ([`hardware/enclosure/ENCLOSURE_SPEC.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/enclosure/ENCLOSURE_SPEC.md)), and 3D technical blueprint ([`hardware/enclosure/enclosure_3d_render.svg`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/enclosure/enclosure_3d_render.svg)).
- **Bill of Materials (BOM):** Itemized component list, footprints, and costs totaling $39.54 prototype unit cost ([`hardware/bom/BILL_OF_MATERIALS.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/bom/BILL_OF_MATERIALS.md) & [`hardware/bom/bom.csv`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/bom/bom.csv)).

### 4. Complete Project Documentation
- [`docs/PRD.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/PRD.md): Product Requirements Document.
- [`docs/ARCHITECTURE.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/ARCHITECTURE.md): System Architecture & IoT Data Flow.
- [`docs/DB_SCHEMA.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/DB_SCHEMA.md): Database Schemas & Entities.
- [`docs/API_DOCS.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/API_DOCS.md): REST API Specifications.
- [`docs/TEST_CASES.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/TEST_CASES.md): Verification Matrix across Hardware, Firmware, API, and UI.
- [`docs/USER_GUIDE.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/USER_GUIDE.md): Operational Manual for Engineers & Operators.
- [`docs/INSTALLATION_INSTRUCTIONS.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/INSTALLATION_INSTRUCTIONS.md): Setup Guide (Docker, Local, Simulator, Standalone).
- [`docs/FINAL_PROJECT_REPORT.md`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docs/FINAL_PROJECT_REPORT.md): Comprehensive Final Engineering Project Report.

---

## 🚀 Quick Execution Options

1. **Zero-Setup Browser Mode:** Open [`telds_dashboard.html`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/telds_dashboard.html) directly in Chrome or Edge.
2. **Containerized Deployment:** Run `docker-compose up --build` with [`docker-compose.yml`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/docker-compose.yml).
3. **Live Hardware Telemetry Stream:** Run `python hardware/virtual_esp32_simulator.py`.
