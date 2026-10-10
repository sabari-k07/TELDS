# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Transformer Energy Loss Detection System (TELDS) is a software-based energy monitoring and analytics platform designed to identify unexplained energy differences between transformer input readings and total consumer meter readings, helping electricity distribution engineers detect abnormal energy losses without automatically classifying them as theft.

## Goals
1. Provide a secure, role-based dashboard for energy monitoring operators and field inspection teams to visualize energy differences and loss percentages.
2. Enable CSV upload and validation for meter readings (transformer and consumer) with automatic energy-loss calculations.
3. Detect abnormal energy patterns using threshold-based anomaly detection, specifically highlighting peak-hour analysis (7 PM - 10 PM).
4. Support alert investigation, status tracking, and reporting with historical data charts.
5. Provide a full-stack software solution (no physical hardware required initially) utilizing simulated data and database storage.

## Non-Goals (Out of Scope)
- Direct integration with physical smart meters (API is designed to make it possible later, but initial version is CSV/simulated data only).
- Automatic classification of energy loss as electricity theft.
- Paid third-party services or physical sensors.

## Users
- Electricity distribution engineers
- Electricity board administrators
- Energy monitoring operators
- Field inspection teams

## Constraints
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend**: Python, FastAPI.
- **Database**: PostgreSQL (SQLAlchemy, Alembic).
- **Data analysis**: Pandas, NumPy.
- **Testing**: Pytest, Vitest, React Testing Library.
- **Deployment**: Docker, Docker Compose.
- Must operate entirely as software using sample data and CSV uploads in the initial version.

## Success Criteria
- [ ] Users can log in securely based on their roles.
- [ ] Users can upload CSVs of meter readings, which the system processes, validates, and stores in the PostgreSQL database.
- [ ] Dashboard displays accurate calculations: `Energy difference = Transformer input energy - Total consumer energy` and `Percentage = (Difference / Input) * 100`.
- [ ] System generates alerts for threshold breaches and peak hour anomalies, allowing users to track investigations.
- [ ] Full suite of automated tests passes.
- [ ] Complete documentation (PRD, Architecture, DB Schema, API Docs, User Guide) is available.
- [ ] Application runs correctly via Docker Compose.
