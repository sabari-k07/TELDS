# Architecture Documentation

## System Overview
TELDS follows a standard modern 3-tier architecture:
1. **Frontend**: React Single Page Application (SPA).
2. **Backend**: Python FastAPI REST API.
3. **Database**: PostgreSQL Relational Database.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Alembic, Pandas, Pydantic.
- **Infrastructure**: Docker, Docker Compose.

## Component Diagram

```text
[ Web Browser ]
      |
      | (HTTP/JSON)
      v
[ FastAPI Backend ] ---> [ Pandas Processing Engine ]
      |
      | (SQLAlchemy)
      v
[ PostgreSQL DB ]
```

## Data Flow
1. Operator uploads a CSV file via the React Frontend.
2. Frontend sends a `POST /api/v1/readings/upload` request with the file.
3. FastAPI Backend receives the file and passes it to the Pandas Processing Engine.
4. Pandas validates timestamps, aligns intervals, and calculates `Energy Difference`.
5. Processed records are inserted into the PostgreSQL DB.
6. If anomalies are detected (e.g., loss > threshold during peak hours), an Alert record is created.
7. Frontend polls or requests updated metrics via `GET /api/v1/dashboard/metrics`.
