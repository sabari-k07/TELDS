# TELDS Installation & Setup Instructions

This document provides complete instructions for running the **Transformer Energy Loss Detection System (TELDS)** across all environments.

---

## 1. Quick Start: Zero-Dependency Standalone Mode
No installation required. For immediate demonstration or client presentation:
1. Open [`telds_dashboard.html`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/telds_dashboard.html) in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox).
2. The entire platform runs locally with simulated grid telemetry, live charts, role switching, CSV upload simulation, and report generation.

---

## 2. Docker Compose Deployment (Full-Stack Containerized)
Runs PostgreSQL, FastAPI backend, and React frontend in synchronized containers.

### Prerequisites:
- Docker Engine 20.10+
- Docker Compose v2.0+

### Steps:
```bash
# 1. Clone or navigate to the project directory
cd "software based E-system"

# 2. Build and start all services
docker-compose up --build

# 3. Access endpoints:
# Frontend Web App:     http://localhost:5173
# FastAPI Swagger Docs: http://localhost:8000/docs
# PostgreSQL Database:  localhost:5432 (User: telds_user, DB: telds_db)
```

To stop containers:
```bash
docker-compose down
```

---

## 3. Local Development Setup (Manual)

### 3.1 Backend Setup (Python FastAPI):
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations (optional, auto-created on launch)
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
*Note: If no PostgreSQL instance is found, the backend automatically defaults to local SQLite (`telds.db`) for instant zero-config testing.*

### 3.2 Frontend Setup (React Vite):
```bash
cd frontend

# Install Node dependencies
npm install

# Run Vite development server
npm run dev
```
Open `http://localhost:5173`.

---

## 4. Virtual ESP32 Hardware Simulator Setup
To simulate live IoT sensor telemetry streaming into the central backend:

```bash
# Run the Python Virtual ESP32 Node
python hardware/virtual_esp32_simulator.py
```
This simulator:
- Generates 2-point current readings (CT1 Input vs CT2 Consumer Aggregate).
- Models evening peak-hour load profiles (19:00 - 22:00).
- Transmits live HTTP JSON packets to `http://localhost:8000/api/v1/telemetry/reading`.
- Automatically logs anomalies in the database and displays a real-time terminal dashboard.

---

## 5. Wokwi ESP32 Web Simulator (Virtual Firmware)
To run the actual C++ firmware on an emulated ESP32 microcontroller in your browser:
1. Navigate to [Wokwi ESP32 Simulator](https://wokwi.com).
2. Load [`hardware/simulation/diagram.json`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/simulation/diagram.json).
3. Copy the C++ code from [`hardware/firmware/esp32_firmware.ino`](file:///c:/Users/ELCOT/OneDrive/Desktop/software%20based%20E-system/hardware/firmware/esp32_firmware.ino).
4. Click **Start Simulation**.
5. Adjust the potentiometers to simulate varying current loads on CT1 and CT2, and observe the live OLED display and status LEDs!
