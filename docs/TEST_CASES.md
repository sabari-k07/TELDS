# TELDS Test Cases & Quality Assurance Matrix

## 1. Test Suite Overview
The testing regime for the Transformer Energy Loss Detection System (TELDS) spans four verification layers:
1. **Edge Hardware & Firmware Layer:** ADC sampling, True RMS calculation, burden network linearity, and edge thresholding.
2. **Backend Engine Layer:** Analytical loss formulas, peak hour window logic, database transactions, and JWT authentication.
3. **Data Ingestion Layer:** CSV schema validation, batch timestamp alignment, and error isolation.
4. **Frontend & User Interface Layer:** Recharts graph updates, responsive dark mode layout, role switching, and report exports.

---

## 2. Test Cases Matrix

| Test ID | Test Category | Scenario / Objective | Input Data | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-HW-01** | Firmware / ADC | True RMS current sampling linearity | Sinusoidal AC wave (50Hz, 10A peak) | Measured RMS within ±1.5% of true RMS (7.07A) | **PASS** |
| **TC-HW-02** | Firmware / ADC | DC bias midpoint cancellation | 1.65V DC offset on GPIO 34 | Offset cancelled to zero in software RMS integration | **PASS** |
| **TC-HW-03** | Firmware / Alert | Edge threshold trigger on critical loss | CT1=60A, CT2=45A (25% loss) | Red LED Pin 4 HIGH, Buzzer Pin 15 pulses, Alert JSON queued | **PASS** |
| **TC-HW-04** | Firmware / Alert | Normal technical loss tolerance | CT1=50A, CT2=47A (6% loss) | Green LED Pin 2 HIGH, Red LED LOW, Normal status | **PASS** |
| **TC-HW-05** | Firmware / UI | SSD1306 OLED display update | Telemetry loop (2s interval) | Display shows CT1, CT2, V, Loss %, and status text | **PASS** |
| **TC-HW-06** | Hardware / Safety | Creepage & air-gap insulation | 230V AC mains terminal J1 | Physical separation ≥ 6.3mm with 2mm isolation slot | **PASS** |
|---|---|---|---|---|---|
| **TC-BE-01** | Backend / Math | Energy difference calculation | Tx Input = 100 kWh, Consumer = 85 kWh | Energy difference = 15.0 kWh, Loss = 15.0% | **PASS** |
| **TC-BE-02** | Backend / Math | Technical vs Unexplained separation | Tx Input = 100 kWh, Loss = 15 kWh | Tech Loss = 6.0 kWh, Unexplained Loss = 9.0 kWh | **PASS** |
| **TC-BE-03** | Backend / Policy | Non-theft classification compliance | Unexplained Loss = 18.5 kWh | Alert flagged as "Unexplained Discrepancy", NOT "Theft" | **PASS** |
| **TC-BE-04** | Backend / Time | Peak hour window detection | Timestamp: 2026-10-10 20:15:00 | `is_peak_hour = True` (Between 19:00 and 22:00) | **PASS** |
| **TC-BE-05** | Backend / Time | Off-peak daytime window | Timestamp: 2026-10-10 11:30:00 | `is_peak_hour = False` | **PASS** |
| **TC-BE-06** | Backend / Edge | Negative difference detection | Tx Input = 100 kWh, Consumer = 105 kWh | Loss = -5.0%, Flagged as meter calibration / reverse flow | **PASS** |
| **TC-BE-07** | Backend / Auth | Valid JWT login | `engineer@telds.gov` / `engineer123` | HTTP 200, JWT token returned with role `ENGINEER` | **PASS** |
| **TC-BE-08** | Backend / Auth | Invalid password rejection | `engineer@telds.gov` / `wrongpass` | HTTP 401 Unauthorized | **PASS** |
|---|---|---|---|---|---|
| **TC-CSV-01** | Ingestion / Valid | Standard batch CSV upload | Valid 30-row readings file | HTTP 200, 30 records processed, analyses generated | **PASS** |
| **TC-CSV-02** | Ingestion / Schema | Missing required column | CSV missing `consumer_kwh` | HTTP 422 Unprocessable Entity, descriptive column error | **PASS** |
| **TC-CSV-03** | Ingestion / Type | Non-numeric energy readings | String value "N/A" in kWh column | Graceful fallback or rejection without crashing server | **PASS** |
|---|---|---|---|---|---|
| **TC-UI-01** | Frontend / Role | Role-based view switching | Switch to `FIELD_INSPECTOR` | UI displays inspector badge and tailored action buttons | **PASS** |
| **TC-UI-02** | Frontend / Chart | Recharts telemetry graph render | 12-interval time series | Area chart & Line chart render with peak hour markers | **PASS** |
| **TC-UI-03** | Frontend / Alert | Investigation note submission | Input note on alert #1 | Alert status updates to `INVESTIGATING`, note logged | **PASS** |
| **TC-UI-04** | Frontend / Export | Regulatory CSV report download | Click "Export CSV" | Browser initiates download of RFC 4180 compliant CSV | **PASS** |
| **TC-UI-05** | Standalone App | Zero-dependency browser execution | Open `telds_dashboard.html` | App runs smoothly in Chrome/Edge without dev servers | **PASS** |
