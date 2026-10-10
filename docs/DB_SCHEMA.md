# Database Schema

## Entities

### 1. `users`
Stores user credentials and roles.
- `id`: UUID (PK)
- `email`: String (Unique)
- `hashed_password`: String
- `role`: Enum (ADMIN, ENGINEER, OPERATOR)
- `created_at`: DateTime

### 2. `transformers`
Stores transformer metadata.
- `id`: UUID (PK)
- `name`: String
- `location`: String
- `capacity_kva`: Float
- `created_at`: DateTime

### 3. `consumers`
Stores consumer meter metadata connected to specific transformers.
- `id`: UUID (PK)
- `transformer_id`: UUID (FK to transformers)
- `meter_number`: String (Unique)
- `name`: String
- `created_at`: DateTime

### 4. `transformer_readings`
Time-series data for transformer inputs.
- `id`: UUID (PK)
- `transformer_id`: UUID (FK to transformers)
- `timestamp`: DateTime
- `energy_kwh`: Float

### 5. `consumer_readings`
Time-series data for consumer usages.
- `id`: UUID (PK)
- `consumer_id`: UUID (FK to consumers)
- `timestamp`: DateTime
- `energy_kwh`: Float

### 6. `energy_analyses`
Pre-calculated hourly/daily energy difference results.
- `id`: UUID (PK)
- `transformer_id`: UUID (FK to transformers)
- `timestamp`: DateTime
- `transformer_energy_kwh`: Float
- `total_consumer_energy_kwh`: Float
- `energy_difference_kwh`: Float
- `loss_percentage`: Float
- `is_peak_hour`: Boolean
- `is_anomaly`: Boolean

### 7. `alerts`
Stores investigation tickets for anomalies.
- `id`: UUID (PK)
- `analysis_id`: UUID (FK to energy_analyses)
- `status`: Enum (OPEN, INVESTIGATING, RESOLVED, FALSE_ALARM)
- `notes`: Text
- `created_at`: DateTime
- `resolved_at`: DateTime (nullable)
