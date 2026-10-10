# TELDS User Guide
## Transformer Energy Loss Detection System

### 1. Overview
The Transformer Energy Loss Detection System (TELDS) enables electrical distribution utilities to monitor and analyze energy discrepancies across low-voltage and medium-voltage distribution networks.

### 2. User Roles & Permissions
- **Admin**: System management, feeder and transformer registration, user management.
- **Distribution Engineer**: In-depth analytics, threshold configuration, anomaly review, and inspection dispatch.
- **Substation Operator**: Daily meter reading uploads, routine grid monitoring.
- **Field Inspector**: On-site inspection logs, hardware notes, and investigation status updates.

### 3. Core Workflows

#### 3.1 Uploading Meter Readings (CSV)
1. Navigate to **CSV Meter Ingestion** from the sidebar.
2. Download the template CSV if needed (`transformer_code, timestamp, transformer_kwh, consumer_meter_number, consumer_kwh`).
3. Drag & drop your synchronized reading batch file.
4. Click **Process & Analyze Readings**. The engine will immediately compute energy differences and flag any anomalies.

#### 3.2 Reading the Loss Dashboard
- **Total Transformer Input vs Consumer Billed**: Compares energy sent from substation vs aggregate metered consumption.
- **Energy Difference (Δ)**:
  $$\Delta \text{ Energy} = \text{Transformer Input} - \text{Total Consumer Consumption}$$
- **Loss Percentage**:
  $$\text{Loss } \% = \left(\frac{\Delta \text{ Energy}}{\text{Transformer Input}}\right) \times 100$$
- **Technical vs Unexplained Loss**: System applies a default 6.0% technical loss allowance (I²R copper loss, transformer core losses) and isolates the remaining unexplained difference.

#### 3.3 Peak-Hour Analysis (7 PM to 10 PM)
The system actively watches evening intervals between **19:00 and 22:00**. High loss deltas during this period typically indicate unmetered evening load or thermal issues.

#### 3.4 Investigating Anomalies
1. Open the **Investigations** tab.
2. Select an anomaly alert.
3. Review loss percentage and energy discrepancy.
4. Update the investigation status (e.g. `INVESTIGATING` -> `FIELD_INSPECTION_SCHEDULED` -> `RESOLVED`).
5. Add timestamped field notes.

#### 3.5 Generating Audit Reports
1. Go to **Energy Reports & Audit**.
2. Filter by daily, weekly, or monthly intervals.
3. Click **Export CSV** to download a spreadsheet suitable for regulatory filing.
