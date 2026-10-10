# TELDS - API Documentation

## Authentication
- `POST /api/v1/auth/login` - Authenticate and get JWT token.
- `GET /api/v1/auth/me` - Get current user details.

## Transformers
- `GET /api/v1/transformers` - List transformers.
- `GET /api/v1/transformers/{id}` - Get transformer details.

## Data Ingestion
- `POST /api/v1/readings/upload/transformer` - Upload CSV of transformer readings.
- `POST /api/v1/readings/upload/consumer` - Upload CSV of consumer readings.

## Dashboard & Analytics
- `GET /api/v1/analytics/summary` - Get high-level summary (total energy, loss, % loss).
- `GET /api/v1/analytics/timeseries` - Get hourly or daily difference data for charts.

## Alerts
- `GET /api/v1/alerts` - List generated alerts.
- `PUT /api/v1/alerts/{id}/status` - Update the status of an alert (e.g., OPEN to RESOLVED).
