-- ============================================================================
-- TELDS & GridWatch AI — Supabase Database Migration & Schema
-- Project Ref: nuxmpdleqpqunkhbpqjj
-- URL: https://nuxmpdleqpqunkhbpqjj.supabase.co
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if needed (Clean Migration)
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS energy_analyses CASCADE;
DROP TABLE IF EXISTS consumer_readings CASCADE;
DROP TABLE IF EXISTS transformer_readings CASCADE;
DROP TABLE IF EXISTS consumers CASCADE;
DROP TABLE IF EXISTS transformers CASCADE;
DROP TABLE IF EXISTS feeders CASCADE;

-- 3. Create Tables

-- Feeders Table
CREATE TABLE feeders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    substation VARCHAR(150) NOT NULL,
    voltage_kv NUMERIC(6,2) DEFAULT 11.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transformers Table
CREATE TABLE transformers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feeder_id UUID REFERENCES feeders(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200),
    capacity_kva NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumers Table
CREATE TABLE consumers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transformer_id UUID REFERENCES transformers(id) ON DELETE CASCADE,
    meter_number VARCHAR(50) UNIQUE NOT NULL,
    consumer_name VARCHAR(150) NOT NULL,
    address VARCHAR(250),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transformer Readings Table (Time-Series)
CREATE TABLE transformer_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transformer_id UUID REFERENCES transformers(id) ON DELETE CASCADE,
    transformer_code VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    energy_kwh NUMERIC(12,4) NOT NULL,
    voltage_v NUMERIC(8,2) DEFAULT 415.00,
    current_a NUMERIC(8,2) DEFAULT 68.20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consumer Readings Table (Time-Series)
CREATE TABLE consumer_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumers(id) ON DELETE SET NULL,
    meter_number VARCHAR(50) NOT NULL,
    transformer_code VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    energy_kwh NUMERIC(12,4) NOT NULL,
    voltage_v NUMERIC(8,2) DEFAULT 230.00,
    current_a NUMERIC(8,2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy Analyses Table (Aggregated Reconciliation & Anomaly Flags)
CREATE TABLE energy_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transformer_code VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    transformer_energy_kwh NUMERIC(12,4) NOT NULL,
    total_consumer_energy_kwh NUMERIC(12,4) NOT NULL,
    energy_difference_kwh NUMERIC(12,4) NOT NULL,
    loss_percentage NUMERIC(6,2) NOT NULL,
    is_peak_hour BOOLEAN DEFAULT FALSE,
    is_anomaly BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts & Investigation Tickets
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code VARCHAR(50) UNIQUE NOT NULL,
    transformer_code VARCHAR(50) NOT NULL,
    segment_id VARCHAR(50),
    severity VARCHAR(30) DEFAULT 'MEDIUM',
    suspicious_loss_kwh NUMERIC(10,2),
    mismatch_percentage NUMERIC(6,2),
    status VARCHAR(50) DEFAULT 'INVESTIGATING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 4. Enable Row Level Security (RLS) & Grant Public Read Access for Dashboard
ALTER TABLE feeders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformer_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumer_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anon read feeders" ON feeders FOR SELECT USING (true);
CREATE POLICY "Allow anon read transformers" ON transformers FOR SELECT USING (true);
CREATE POLICY "Allow anon read consumers" ON consumers FOR SELECT USING (true);
CREATE POLICY "Allow anon read transformer_readings" ON transformer_readings FOR SELECT USING (true);
CREATE POLICY "Allow anon read consumer_readings" ON consumer_readings FOR SELECT USING (true);
CREATE POLICY "Allow anon read energy_analyses" ON energy_analyses FOR SELECT USING (true);
CREATE POLICY "Allow anon read alerts" ON alerts FOR SELECT USING (true);

-- Allow anonymous insert for telemetry simulations (Optional/Dev mode)
CREATE POLICY "Allow anon insert transformer_readings" ON transformer_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert consumer_readings" ON consumer_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert energy_analyses" ON energy_analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert alerts" ON alerts FOR INSERT WITH CHECK (true);

-- 5. Seed Initial Data
-- Insert Feeders
INSERT INTO feeders (code, name, substation, voltage_kv) VALUES
('FDR-11KV-01', 'North Industrial Feeder', 'Central 66/11kV Substation', 11.00),
('FDR-11KV-02', 'Metro Commercial Feeder', 'Central 66/11kV Substation', 11.00),
('FDR-11KV-03', 'East Suburban Feeder', 'Suburban 33/11kV Substation', 11.00);

-- Insert Transformers
INSERT INTO transformers (feeder_id, code, name, location, capacity_kva)
SELECT f.id, 'TX-IND-101', 'Distribution Transformer 101', 'Sector 4 Industrial Area', 500.0
FROM feeders f WHERE f.code = 'FDR-11KV-01';

INSERT INTO transformers (feeder_id, code, name, location, capacity_kva)
SELECT f.id, 'TX-COM-204', 'Commercial Transformer 204', 'City Center Mall Complex', 315.0
FROM feeders f WHERE f.code = 'FDR-11KV-02';

INSERT INTO transformers (feeder_id, code, name, location, capacity_kva)
SELECT f.id, 'TX-RES-308', 'Residential DT 308', 'Green Park Colony', 250.0
FROM feeders f WHERE f.code = 'FDR-11KV-03';

-- Insert Consumers for TX-RES-308
INSERT INTO consumers (transformer_id, meter_number, consumer_name, address)
SELECT t.id, m.meter_num, m.c_name, m.c_addr
FROM transformers t,
(VALUES 
    ('MTR-8801', 'Rajiv Menon', 'House 12, Green Park Block A'),
    ('MTR-8802', 'Sunita Rao', 'House 15, Green Park Block A'),
    ('MTR-8803', 'Vikram Singh', 'House 22, Green Park Block B'),
    ('MTR-8804', 'Kavita Das', 'House 31, Green Park Block B'),
    ('MTR-8805', 'Anil Mehta', 'House 44, Green Park Block C')
) AS m(meter_num, c_name, c_addr)
WHERE t.code = 'TX-RES-308';

-- Insert Hourly Time-Series Transformer Readings
INSERT INTO transformer_readings (transformer_id, transformer_code, timestamp, energy_kwh, voltage_v, current_a)
SELECT t.id, t.code, r.ts, r.kwh, r.v, r.a
FROM transformers t,
(VALUES
    ('2026-10-10 00:00:00+00'::timestamptz, 18.5, 416.2, 28.5),
    ('2026-10-10 03:00:00+00'::timestamptz, 16.0, 417.0, 24.6),
    ('2026-10-10 06:00:00+00'::timestamptz, 24.0, 415.5, 36.9),
    ('2026-10-10 09:00:00+00'::timestamptz, 32.0, 414.0, 49.2),
    ('2026-10-10 12:00:00+00'::timestamptz, 28.0, 414.8, 43.1),
    ('2026-10-10 15:00:00+00'::timestamptz, 35.0, 413.5, 53.8),
    ('2026-10-10 18:00:00+00'::timestamptz, 38.0, 412.0, 58.4),
    ('2026-10-10 19:00:00+00'::timestamptz, 45.0, 408.2, 69.2),
    ('2026-10-10 20:00:00+00'::timestamptz, 52.0, 404.1, 79.9),
    ('2026-10-10 21:00:00+00'::timestamptz, 48.0, 406.0, 73.8),
    ('2026-10-10 22:00:00+00'::timestamptz, 30.0, 413.8, 46.1),
    ('2026-10-10 23:00:00+00'::timestamptz, 22.0, 415.4, 33.8)
) AS r(ts, kwh, v, a)
WHERE t.code = 'TX-RES-308';

-- Insert Energy Analysis Reconciliation Table
INSERT INTO energy_analyses (transformer_code, timestamp, transformer_energy_kwh, total_consumer_energy_kwh, energy_difference_kwh, loss_percentage, is_peak_hour, is_anomaly, status)
VALUES
('TX-RES-308', '2026-10-10 00:00:00+00', 18.5, 17.5, 1.0, 5.41, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 03:00:00+00', 16.0, 15.2, 0.8, 5.00, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 06:00:00+00', 24.0, 22.6, 1.4, 5.83, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 09:00:00+00', 32.0, 30.1, 1.9, 5.94, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 12:00:00+00', 28.0, 26.4, 1.6, 5.71, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 15:00:00+00', 35.0, 32.8, 2.2, 6.29, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 18:00:00+00', 38.0, 34.5, 3.5, 9.21, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 19:00:00+00', 45.0, 32.0, 13.0, 28.89, TRUE, TRUE, 'CRITICAL_THEFT'),
('TX-RES-308', '2026-10-10 20:00:00+00', 52.0, 34.2, 17.8, 34.23, TRUE, TRUE, 'CRITICAL_THEFT'),
('TX-RES-308', '2026-10-10 21:00:00+00', 48.0, 35.5, 12.5, 26.04, TRUE, TRUE, 'CRITICAL_THEFT'),
('TX-RES-308', '2026-10-10 22:00:00+00', 30.0, 28.1, 1.9, 6.33, FALSE, FALSE, 'NORMAL'),
('TX-RES-308', '2026-10-10 23:00:00+00', 22.0, 20.8, 1.2, 5.45, FALSE, FALSE, 'NORMAL');

-- Insert Alerts
INSERT INTO alerts (alert_code, transformer_code, segment_id, severity, suspicious_loss_kwh, mismatch_percentage, status, notes)
VALUES
('ALT-2026-0901', 'TX-RES-308', 'SEG-P1-P2', 'CRITICAL', 17.80, 34.23, 'INVESTIGATING', 'Persistent evening peak diversion detected between Pole 14 and Pole 28. Suspected direct shunt hook.'),
('ALT-2026-0902', 'TX-RES-308', 'SEG-P2-P3', 'HIGH', 13.00, 28.89, 'FIELD_INSPECTION_SCHEDULED', 'Discrepancy exceeds permissible tolerance threshold across 3 consecutive polling intervals.');

-- Success Verification Notice
SELECT 'Supabase schema created and seeded successfully for project nuxmpdleqpqunkhbpqjj' AS status;
