export type UserRole = 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'FIELD_INSPECTOR';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Feeder {
  id: number;
  code: string;
  name: string;
  substation: string;
  voltage_kv: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  created_at: string;
}

export interface Transformer {
  id: number;
  feeder_id: number | null;
  code: string;
  name: string;
  location: string;
  capacity_kva: number;
  rated_current_a?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  created_at: string;
  consumer_count?: number;
}

export interface Consumer {
  id: number;
  transformer_id: number;
  consumer_number: string;
  meter_number: string;
  name: string;
  category: string;
  connection_phase: string;
  sanctioned_load_kw: number;
  created_at: string;
}

export interface EnergyAnalysis {
  id: number;
  timestamp: string;
  time_label?: string;
  transformer_input_kwh: number;
  consumer_total_kwh: number;
  energy_difference_kwh: number;
  loss_percentage: number;
  technical_loss_kwh: number;
  unexplained_loss_kwh: number;
  is_peak_hour: boolean;
  is_anomaly: boolean;
  anomaly_reason?: string;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'FIELD_INSPECTION_SCHEDULED' | 'RESOLVED' | 'FALSE_ALARM';

export interface Alert {
  id: number;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  loss_percentage: number;
  energy_difference_kwh: number;
  is_peak_hour: boolean;
  description?: string;
  investigation_notes?: string;
  transformer_id: number;
  transformer_name?: string;
  transformer_code?: string;
  assigned_to_id?: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DashboardSummary {
  period: string;
  total_transformer_input_kwh: number;
  total_consumer_energy_kwh: number;
  total_energy_difference_kwh: number;
  average_loss_percentage: number;
  technical_loss_kwh: number;
  unexplained_loss_kwh: number;
  peak_hour_loss_percentage: number;
  total_transformers_monitored: number;
  active_anomalies_count: number;
  high_loss_transformers_count: number;
}

export interface ReadingUploadResponse {
  status: string;
  filename: string;
  records_processed: number;
  records_failed: number;
  analyses_generated: number;
  anomalies_detected: number;
  errors: string[];
}

export type SegmentStatus = 'NORMAL' | 'INVESTIGATION_RECOMMENDED' | 'SENSOR_FAULT' | 'UNCERTAIN_DATA';

export interface FeederPointModel {
  code: string;
  name: string;
  sequence_order: number;
  point_type: string;
  virtual_node_id: string;
  pole_number?: string;
  nominal_voltage_v: number;
  latitude: number;
  longitude: number;
  is_branch: boolean;
}

export interface FeederSegmentModel {
  code: string;
  name: string;
  upstream_code: string;
  downstream_code: string;
  length_km: number;
  conductor_type: string;
  line_resistance_ohms: number;
  expected_technical_loss_pct: number;
  measurement_uncertainty_pct: number;
  configured_threshold_pct: number;
  has_legitimate_branches: boolean;
  branch_load_ratio: number;
}

export interface NodeTelemetry {
  node_id: string;
  v_rms: number;
  i_rms: number;
  active_power_kw: number;
  energy_kwh: number;
  power_factor: number;
  frequency_hz: number;
  rssi_dbm: number;
  packet_latency_ms: number;
  is_valid: boolean;
  error_flags?: string | null;
}

export interface SegmentAnalysisResult {
  segment_id: string;
  name: string;
  upstream_point: string;
  downstream_point: string;
  length_km: number;
  conductor_type: string;
  line_resistance_ohms: number;
  upstream_reading_kwh: number;
  downstream_reading_kwh: number;
  branch_energy_kwh: number;
  discrepancy_kwh: number;
  discrepancy_pct: number;
  technical_loss_kwh: number;
  unexplained_loss_kwh: number;
  expected_tech_loss_pct: number;
  uncertainty_band_pct: number;
  effective_threshold_pct: number;
  status: SegmentStatus;
  is_suspected_abnormal: boolean;
  confidence_score: number;
  remarks: string;
  timestamp: string;
}

export interface SegmentScenarioData {
  meta: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    feeder_code: string;
    feeder_name: string;
  };
  nodes_telemetry: Record<string, NodeTelemetry>;
  segments: SegmentAnalysisResult[];
  summary: {
    total_feeder_input_kwh: number;
    total_feeder_output_kwh: number;
    overall_discrepancy_kwh: number;
    overall_loss_pct: number;
    monitored_points_count: number;
    monitored_segments_count: number;
    abnormal_segments_count: number;
    abnormal_segment_ids: string[];
    faulty_segment_ids: string[];
    uncertain_segment_ids: string[];
    highest_loss_segment?: string | null;
  };
}
