# MASTER PROMPT: Transformer Energy Loss Detection System — Full-Stack Project + PRD Documentation

Act as a senior full-stack software architect, UI/UX designer, Python developer, database engineer, QA engineer, and technical documentation writer.

Build a complete, functional, full-stack web application named **Transformer Energy Loss Detection System (TELDS)**. Follow professional software engineering practices and implement the project according to the detailed Product Requirements Document (PRD) below.

Do not build only a UI prototype. Implement the frontend, backend, database, data-processing logic, API integration, validation, testing, and setup documentation.

## 1. Project Overview

**Project name:** Transformer Energy Loss Detection System

**Project type:** Full-stack web application

**Domain:** Electrical energy monitoring and distribution analytics

**Primary objective:** Analyze transformer input energy and consumer meter readings to identify unexplained energy differences, detect abnormal consumption patterns, and help utility engineers investigate potential energy losses.

The initial version must work entirely through software using CSV uploads and simulated sample data. Do not require physical sensors or real electricity meters to run the MVP.

## 2. Problem Statement

Rural electricity feeders can experience unexplained differences between energy supplied by a transformer and energy recorded by consumer meters. These differences may increase during peak hours, such as 7 PM to 10 PM. Manual inspections may not quickly identify the affected time periods or feeder sections.

Develop a software-based monitoring system that validates meter readings, calculates energy differences, identifies abnormal patterns, displays analytical dashboards, generates alerts, and provides reports for further investigation.

Important: An energy difference is not proof of electricity theft. The system must consider technical losses, incomplete readings, meter faults, timing mismatches, and other possible explanations.

## 3. Required Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts or Chart.js
* React Router
* Axios or an equivalent API client

### Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Pandas
* NumPy

### Database

* PostgreSQL
* Alembic database migrations

### Testing

* Pytest
* FastAPI TestClient or HTTPX
* Vitest
* React Testing Library

### Deployment and development tools

* Git
* Docker
* Docker Compose
* Environment variables
* Swagger/OpenAPI documentation

Use compatible, stable package versions. Do not introduce paid services or unnecessary technologies.

## 4. User Roles

Implement role-based access control for:

1. **Administrator:** Manage users, transformers, feeders, thresholds, and system settings.
2. **Engineer/Analyst:** Upload meter data, analyze energy losses, review alerts, and generate reports.
3. **Field Inspector:** View assigned investigation alerts, add notes, and update investigation status.

## 5. Core Functional Modules

### Module A: Authentication

* Login and logout.
* Secure password hashing.
* Role-based authorization.
* Protected application routes.
* Clear authentication error messages.
* Never store plain-text passwords.

### Module B: Dashboard

Create a professional dashboard with:

* Total transformers monitored.
* Total feeders monitored.
* Total energy supplied in the selected period.
* Total consumer energy recorded.
* Total unaccounted energy difference.
* Overall energy difference percentage.
* Number of active alerts.
* Daily and hourly energy trend charts.
* Peak-hour analysis from 7 PM to 10 PM.
* Recent alerts and investigation status.

All dashboard figures must be calculated from database data, not hardcoded values.

### Module C: Transformer and Feeder Management

* Create, view, edit, and deactivate transformers.
* Manage feeders associated with transformers.
* Store transformer codes, feeder codes, descriptions, capacity, and status.
* Support filtering and searching.
* Allow users to navigate from a transformer to its feeders and associated readings.

### Module D: Meter Reading Management

* Upload CSV files containing transformer and consumer meter readings.
* Provide a downloadable CSV template.
* Preview uploaded data before importing.
* Validate column names, dates, units, numeric values, and duplicates.
* Report invalid rows with row numbers and error explanations.
* Track import history and import status.
* Support historical readings and date-range filtering.

Suggested CSV fields:

meter_code, feeder_code, interval_start, interval_end, energy_kwh

The system must clearly distinguish interval energy readings from cumulative meter-register readings. If cumulative readings are supported, calculate interval usage carefully and handle resets or rollovers.

### Module E: Energy Loss Calculation

Implement the following formulas:

Energy Difference = Transformer Input Energy − Total Consumer Energy

Energy Difference Percentage = (Energy Difference / Transformer Input Energy) × 100

Requirements:

* Match transformer and consumer readings over compatible time intervals.
* Convert units consistently before calculations.
* Handle missing data and zero input energy safely.
* Flag negative differences for reconciliation.
* Never silently treat missing consumer readings as zero.
* Display the underlying values used in every calculation.
* Store or efficiently calculate results from the database.

For example:

Transformer input energy = 1,000 kWh

Total consumer energy = 820 kWh

Energy difference = 180 kWh

Energy difference percentage = 18%

Use this as a test case. Clearly mark example readings as simulated data.

### Module F: Abnormal Energy Difference Detection

Implement a transparent, rule-based detection system for the MVP.

Requirements:

* Configurable percentage thresholds.
* Configurable peak-hour periods.
* Alerts for unusually high energy differences.
* Detection of missing or inconsistent meter data.
* Optional consecutive-interval rules to reduce false alerts.
* Comparison with historical periods when sufficient data exists.
* Alert severity, status, timestamp, and explanation.
* Prevent duplicate alerts for the same event.

Do not implement machine learning as a mandatory dependency. Keep the detection logic modular so an ML model can be added later.

Do not claim that the system has identified the exact physical location of a loss unless section-level measurements or sufficient data support that conclusion.

### Module G: Alert Management

Create an alert management page containing:

* Alert ID.
* Transformer and feeder.
* Date and time interval.
* Energy difference in kWh.
* Difference percentage.
* Severity.
* Triggering rule.
* Data-quality warnings.
* Assigned user.
* Investigation notes.
* Current status.

Support these statuses:

* Open
* Under Investigation
* Resolved
* False Positive

Allow authorized users to update statuses and add investigation notes.

### Module H: Analytics and Reports

Provide:

* Daily energy analysis.
* Hourly energy analysis.
* Peak-hour comparison.
* Transformer and feeder comparisons.
* Historical trends.
* Date-range filters.
* CSV report export.
* Printable summary reports.
* Data-quality indicators.

Reports must show units, date ranges, calculation methods, and whether the source data is simulated or imported.

## 6. UI/UX Requirements

Design a modern, professional utility-monitoring dashboard.

Design guidelines:

* Responsive desktop, tablet, and mobile layouts.
* Clear sidebar navigation.
* Consistent typography and spacing.
* Readable KPI cards.
* Interactive charts with tooltips.
* Tables with sorting, filtering, and pagination.
* Clear loading, empty, success, and error states.
* Accessible labels and keyboard-friendly controls.
* Confirmation dialogs for destructive actions.
* Consistent colors for alert severity and status.
* Avoid excessive animations, unnecessary gradients, and decorative elements that reduce readability.

Required pages:

1. Login
2. Overview Dashboard
3. Transformers
4. Transformer Details
5. Feeders
6. Meter Readings
7. CSV Import
8. Energy Loss Analytics
9. Alerts
10. Alert Investigation Details
11. Reports
12. User Management
13. System Settings
14. Not Found / Error Page

Connect every page to the appropriate backend API. Do not leave fake buttons or nonfunctional navigation.

## 7. Database Design

Create normalized database tables for:

* Users
* Transformers
* Feeders
* Meters
* Consumers
* Meter Readings
* Data Imports
* Alerts
* Investigation Notes
* Audit Events

Define:

* Primary keys.
* Foreign keys.
* Appropriate indexes.
* Unique constraints for meter and interval combinations where applicable.
* Created and updated timestamps.
* Appropriate deletion and deactivation behavior.
* Database migrations.

Use SQLAlchemy models and Pydantic schemas. Avoid storing derived information redundantly unless justified.

## 8. Backend API Requirements

Implement documented REST APIs for:

Authentication:

* POST /api/auth/login
* GET /api/auth/me

Transformers and feeders:

* GET /api/transformers
* POST /api/transformers
* GET /api/transformers/{id}
* PATCH /api/transformers/{id}
* GET /api/feeders
* POST /api/feeders

Readings and imports:

* POST /api/imports/readings
* GET /api/imports
* GET /api/readings

Analytics:

* GET /api/analytics/overview
* GET /api/analytics/energy-loss
* GET /api/analytics/peak-hours

Alerts:

* GET /api/alerts
* GET /api/alerts/{id}
* PATCH /api/alerts/{id}
* POST /api/alerts/{id}/notes

Reports:

* GET /api/reports/energy-loss

System:

* GET /api/health

Add any additional endpoints required by the implementation.

Requirements:

* Validate all inputs.
* Enforce authentication and authorization.
* Use pagination for large datasets.
* Return consistent error responses.
* Avoid exposing sensitive information.
* Document request and response schemas.
* Ensure the frontend uses the real API rather than duplicated mock calculations.

## 9. Security and Reliability

Implement:

* Secure password hashing.
* Backend-enforced role permissions.
* Environment-based configuration.
* File upload size and format validation.
* SQL injection protection through parameterized ORM operations.
* Appropriate CORS configuration.
* Audit logs for sensitive administrative changes.
* Safe error handling.
* Database transaction handling for imports.
* Protection against duplicate imports where possible.
* No secrets committed to Git.
* No real personal or utility data in the demo dataset.

## 10. Testing Requirements

Create automated tests for:

Calculation tests:

* 1,000 kWh input and 820 kWh consumer energy produces an 18% difference.
* Zero input energy.
* Negative energy difference.
* Missing readings.
* Threshold boundary conditions.

CSV tests:

* Valid file.
* Missing columns.
* Invalid timestamps.
* Negative or malformed values.
* Duplicate records.
* Empty file.

API tests:

* Successful login.
* Invalid credentials.
* Unauthorized requests.
* Role permission checks.
* Reading upload.
* Analytics responses.
* Alert creation and updates.

Frontend tests:

* Login validation.
* Dashboard rendering.
* CSV import feedback.
* Chart filtering.
* Alert status changes.
* Empty and error states.

Create integration tests that cover the flow from importing readings to calculating energy differences and displaying alerts.

## 11. Required Project Documentation

Create a `docs/` folder and generate these files as Markdown documents:

1. `docs/PRD.md` — Complete Product Requirements Document.
2. `docs/SYSTEM_ARCHITECTURE.md` — Architecture, components, and data flow.
3. `docs/DATABASE_SCHEMA.md` — Tables, fields, relationships, and constraints.
4. `docs/API_DOCUMENTATION.md` — Endpoints, authentication, parameters, and response examples.
5. `docs/USER_GUIDE.md` — Instructions for administrators, engineers, and inspectors.
6. `docs/TEST_PLAN.md` — Test scenarios and acceptance criteria.
7. `docs/DEPLOYMENT_GUIDE.md` — Local setup, Docker, environment configuration, and deployment.
8. `docs/DEVELOPMENT_ROADMAP.md` — Phases, milestones, and future enhancements.

Also create:

* `README.md`
* `.env.example`
* `.gitignore`
* `docker-compose.yml`
* Backend dependency file.
* Frontend package configuration.
* Sample CSV files.
* Database seed-data script.
* Automated tests.

The PRD must include the problem statement, goals, scope, personas, user stories, functional requirements, non-functional requirements, calculations, acceptance criteria, risks, and future improvements.

## 12. Recommended Project Structure

Create a maintainable structure similar to:

transformer-energy-loss/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── features/
│       ├── services/
│       ├── hooks/
│       └── types/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── alembic/
│   └── tests/
├── docs/
├── sample_data/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

You may improve this structure if there is a clear technical reason. Keep frontend and backend responsibilities separate.

## 13. Development Workflow

Follow this implementation sequence:

Phase 1: Inspect the workspace and prepare the project plan.

Phase 2: Set up the frontend, backend, database, environment variables, and Docker configuration.

Phase 3: Design the database schema and migrations.

Phase 4: Implement authentication, roles, transformer management, and feeder management.

Phase 5: Implement CSV imports, validation, and reading storage.

Phase 6: Implement energy-loss calculations and automated tests.

Phase 7: Implement detection rules, alert workflows, and reports.

Phase 8: Build and connect all frontend pages.

Phase 9: Add sample data, integration tests, error handling, and security checks.

Phase 10: Generate and verify all documentation files.

Phase 11: Run the project, execute tests, fix errors, and verify the end-to-end workflow.

At the end of each phase, summarize completed work, changed files, tests run, and remaining issues.

Do not stop after generating a plan or frontend mockup. Continue implementing the working project in the available workspace. If something cannot be completed, explain the limitation and provide the remaining steps.

## 14. Definition of Done

The project is complete when:

* Frontend and backend start using documented commands.
* PostgreSQL can be initialized through migrations.
* Sample data can be loaded.
* Users can authenticate and access authorized features.
* CSV readings can be uploaded and validated.
* Energy differences and percentages are calculated correctly.
* The dashboard displays actual backend results.
* Alerts can be created, reviewed, and updated.
* Reports can be generated and exported.
* Automated tests run and their results are documented.
* The documentation files exist and match the implementation.
* No secrets or real sensitive operational data are included.
* The application clearly distinguishes simulated data from live readings.

## Final Instruction

Start by inspecting the current workspace and its existing files. Preserve useful existing work and avoid overwriting files without checking them.

Create `docs/PRD.md` first and use it as the primary requirements reference throughout implementation.

Then build the complete full-stack application in phases. Prefer a working, tested, secure MVP over unfinished advanced features. Keep the code modular, explain major decisions, and verify the application before declaring it complete.
