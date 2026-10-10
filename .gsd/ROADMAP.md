# ROADMAP.md

> **Current Phase**: Phase 6 Completed
> **Milestone**: v1.0 — Production Ready

## Must-Haves (from SPEC)
- [x] Secure login and role-based access control (Admin, Engineer, Operator, Inspector)
- [x] Interactive dashboard with Recharts & Chart.js
- [x] CSV upload, validation, and batch processing
- [x] Automatic energy-loss calculations:
  - `Energy difference = Transformer input energy - Total consumer energy`
  - `Energy difference percentage = (Energy difference / Transformer input energy) * 100`
- [x] Peak-hour surveillance (7:00 PM - 10:00 PM / 19:00 - 22:00)
- [x] Clear technical vs unexplained loss separation without auto theft classification
- [x] PostgreSQL & SQLite fallback database with SQLAlchemy models
- [x] Anomaly alert investigation workflow and notes log
- [x] Exportable regulatory CSV audit reports
- [x] Dockerized deployment (docker-compose.yml)
- [x] Full documentation suite (PRD, Architecture, DB Schema, API Docs, User Guide, Deployment, Testing Plan)

## Phases

### Phase 1: Foundation & Documentation
**Status**: 🟩 Completed
**Deliverables**: Project directory scaffolding, `PRD.md`, `ARCHITECTURE.md`, `DB_SCHEMA.md`, `API_DOCS.md`, `docker-compose.yml`.

### Phase 2: Backend Core & Database
**Status**: 🟩 Completed
**Deliverables**: FastAPI backend in `backend/app/`, SQLAlchemy models, Pydantic schemas, JWT authentication, and Alembic migrations configuration.

### Phase 3: Analytics Engine & Ingestion Logic
**Status**: 🟩 Completed
**Deliverables**: `EnergyCalculator` service, `CSVProcessorService` with Pandas validation, and `ReportGeneratorService`.

### Phase 4: Frontend Development
**Status**: 🟩 Completed
**Deliverables**: React 18 + Vite + TypeScript + Tailwind CSS application in `frontend/`, interactive KPI cards, Recharts visualizations, and role switcher.

### Phase 5: Anomaly Alerts & Regulatory Reporting
**Status**: 🟩 Completed
**Deliverables**: Anomaly investigation tracker with note logs, status workflows, and CSV export.

### Phase 6: Testing, Seed Data & Standalone Browser App
**Status**: 🟩 Completed
**Deliverables**: Pytest suite in `backend/tests/`, realistic datasets in `sample_data/`, zero-dependency `telds_dashboard.html`, and complete documentation.
