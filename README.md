# Transformer Energy Loss Detection System (TELDS)

> **Complete Cyber-Physical Energy Monitoring & Analytics Platform**  
> Combines Edge IoT Dual-Point Current Measurement Hardware (ESP32) with a High-Performance Full-Stack Web Platform (FastAPI + React) for Distribution Utilities.

---

## ⚡ The 4 Pillars of TELDS

### 1. Full-Stack Web Application
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide Icons.
- **Backend:** Python, FastAPI, SQLAlchemy ORM, Alembic migrations, and Pandas analytics.
- **Mathematical Engine:**
  - $\Delta \text{ Energy} = \text{Transformer Input} - \sum \text{Consumer Meter Consumption}$
  - $\text{Loss } \% = (\Delta \text{ Energy} / \text{Transformer Input}) \times 100$
- **Loss Separation:** Isolates 6.0% technical baseline from unexplained losses. **Never automatically classifies loss as electricity theft.**
- **Peak-Hour Dynamics:** Dedicated surveillance for 19:00 – 22:00 (7 PM – 10 PM).
- **Interactive Standalone App:** [`telds_dashboard.html`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/telds_dashboard.html) (zero-dependency, double-click to run in any browser).

### 2. Virtual Hardware Prototype
- **Microcontroller:** ESP32 DevKit v1 with dual-core 240MHz architecture.
- **Measuring Point 1 (CT1):** Transformer secondary winding input current (SCT-013-000, 100A/50mA).
- **Measuring Point 2 (CT2):** Consumer aggregate outgoing feeder current (SCT-013-000, 100A/50mA).
- **Voltage Measurement:** ZMPT101B active AC voltage transformer module (230V AC nominal).
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
