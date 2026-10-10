import React, { useState, useEffect, FC } from 'react';
import { 
  SegmentScenarioData, 
  SegmentAnalysisResult, 
  NodeTelemetry,
  SegmentStatus 
} from '../../types';
import { api } from '../../services/api';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  ArrowRight, 
  Zap, 
  Gauge, 
  Radio, 
  Info,
  RefreshCw
} from 'lucide-react';

const FALLBACK_SCENARIOS: Record<string, SegmentScenarioData> = {
  SCENARIO_NORMAL: {
    meta: {
      id: 'SCENARIO_NORMAL',
      title: 'Scenario A: Normal Feeder Operation',
      description: 'All 5 measurement points report synchronized, valid telemetry. Discrepancies (1.8% to 2.8%) are strictly within technical line loss bounds.',
      timestamp: '2026-10-10 19:00:00 UTC',
      feeder_code: 'FDR-11KV-NORTH',
      feeder_name: '11kV North Industrial & Residential Ring Feeder'
    },
    nodes_telemetry: {
      P0: { node_id: 'ESP32-NODE-P0', v_rms: 416.2, i_rms: 218.4, active_power_kw: 150.0, energy_kwh: 150.0, power_factor: 0.96, frequency_hz: 50.02, rssi_dbm: -62, packet_latency_ms: 28, is_valid: true },
      P1: { node_id: 'ESP32-NODE-P1', v_rms: 414.0, i_rms: 214.0, active_power_kw: 146.5, energy_kwh: 146.5, power_factor: 0.95, frequency_hz: 50.01, rssi_dbm: -68, packet_latency_ms: 34, is_valid: true },
      P2: { node_id: 'ESP32-NODE-P2', v_rms: 411.8, i_rms: 209.5, active_power_kw: 142.8, energy_kwh: 142.8, power_factor: 0.95, frequency_hz: 50.00, rssi_dbm: -71, packet_latency_ms: 42, is_valid: true },
      P3: { node_id: 'ESP32-NODE-P3', v_rms: 409.5, i_rms: 196.2, active_power_kw: 133.5, energy_kwh: 133.5, power_factor: 0.94, frequency_hz: 49.99, rssi_dbm: -75, packet_latency_ms: 48, is_valid: true },
      P4: { node_id: 'ESP32-NODE-P4', v_rms: 407.2, i_rms: 192.8, active_power_kw: 130.8, energy_kwh: 130.8, power_factor: 0.94, frequency_hz: 49.98, rssi_dbm: -79, packet_latency_ms: 55, is_valid: true }
    },
    segments: [
      {
        segment_id: 'SEG-P0-P1',
        name: 'Substation Bay 01 to Sectionalizer Pole 14',
        upstream_point: 'P0',
        downstream_point: 'P1',
        length_km: 1.2,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.32,
        upstream_reading_kwh: 150.0,
        downstream_reading_kwh: 146.5,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 3.5,
        discrepancy_pct: 2.33,
        technical_loss_kwh: 3.0,
        unexplained_loss_kwh: 0.5,
        expected_tech_loss_pct: 2.0,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.0,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Discrepancy of 2.33% is within permissible technical & uncertainty band (7.0%).',
        timestamp: '2026-10-10 19:00:00 UTC'
      },
      {
        segment_id: 'SEG-P1-P2',
        name: 'Sectionalizer Pole 14 to Sectionalizer Pole 28',
        upstream_point: 'P1',
        downstream_point: 'P2',
        length_km: 1.5,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.40,
        upstream_reading_kwh: 146.5,
        downstream_reading_kwh: 142.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 3.7,
        discrepancy_pct: 2.53,
        technical_loss_kwh: 3.52,
        unexplained_loss_kwh: 0.18,
        expected_tech_loss_pct: 2.4,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Discrepancy of 2.53% is within permissible technical & uncertainty band (7.5%).',
        timestamp: '2026-10-10 19:00:00 UTC'
      },
      {
        segment_id: 'SEG-P2-P3',
        name: 'Sectionalizer Pole 28 to Distribution Pole 42',
        upstream_point: 'P2',
        downstream_point: 'P3',
        length_km: 1.8,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.48,
        upstream_reading_kwh: 142.8,
        downstream_reading_kwh: 133.5,
        branch_energy_kwh: 5.0,
        discrepancy_kwh: 4.3,
        discrepancy_pct: 3.01,
        technical_loss_kwh: 4.0,
        unexplained_loss_kwh: 0.3,
        expected_tech_loss_pct: 2.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 8.0,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Discrepancy of 3.01% is within permissible technical & uncertainty band (8.0%). Lateral branch accounted.',
        timestamp: '2026-10-10 19:00:00 UTC'
      },
      {
        segment_id: 'SEG-P3-P4',
        name: 'Distribution Pole 42 to Terminal Pole 56',
        upstream_point: 'P3',
        downstream_point: 'P4',
        length_km: 0.9,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.24,
        upstream_reading_kwh: 133.5,
        downstream_reading_kwh: 130.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 2.7,
        discrepancy_pct: 2.02,
        technical_loss_kwh: 2.4,
        unexplained_loss_kwh: 0.3,
        expected_tech_loss_pct: 1.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 6.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Discrepancy of 2.02% is within permissible technical & uncertainty band (6.5%).',
        timestamp: '2026-10-10 19:00:00 UTC'
      }
    ],
    summary: {
      total_feeder_input_kwh: 150.0,
      total_feeder_output_kwh: 135.8,
      overall_discrepancy_kwh: 14.2,
      overall_loss_pct: 9.47,
      monitored_points_count: 5,
      monitored_segments_count: 4,
      abnormal_segments_count: 0,
      abnormal_segment_ids: [],
      faulty_segment_ids: [],
      uncertain_segment_ids: [],
      highest_loss_segment: 'SEG-P2-P3'
    }
  },
  SCENARIO_ANOMALY_P2_P3: {
    meta: {
      id: 'SCENARIO_ANOMALY_P2_P3',
      title: 'Scenario B: Localised Discrepancy in Segment P2–P3',
      description: 'Simulated abnormal discrepancy (18.1%) on line segment P2–P3. System highlights Segment P2–P3 as suspected location while P0–P1, P1–P2, and P3–P4 remain normal.',
      timestamp: '2026-10-10 19:30:00 UTC',
      feeder_code: 'FDR-11KV-NORTH',
      feeder_name: '11kV North Industrial & Residential Ring Feeder'
    },
    nodes_telemetry: {
      P0: { node_id: 'ESP32-NODE-P0', v_rms: 416.2, i_rms: 218.4, active_power_kw: 150.0, energy_kwh: 150.0, power_factor: 0.96, frequency_hz: 50.02, rssi_dbm: -62, packet_latency_ms: 28, is_valid: true },
      P1: { node_id: 'ESP32-NODE-P1', v_rms: 414.0, i_rms: 214.0, active_power_kw: 146.5, energy_kwh: 146.5, power_factor: 0.95, frequency_hz: 50.01, rssi_dbm: -68, packet_latency_ms: 34, is_valid: true },
      P2: { node_id: 'ESP32-NODE-P2', v_rms: 411.8, i_rms: 209.5, active_power_kw: 142.8, energy_kwh: 142.8, power_factor: 0.95, frequency_hz: 50.00, rssi_dbm: -71, packet_latency_ms: 42, is_valid: true },
      P3: { node_id: 'ESP32-NODE-P3', v_rms: 405.0, i_rms: 172.5, active_power_kw: 112.0, energy_kwh: 112.0, power_factor: 0.93, frequency_hz: 49.97, rssi_dbm: -76, packet_latency_ms: 50, is_valid: true },
      P4: { node_id: 'ESP32-NODE-P4', v_rms: 403.1, i_rms: 168.2, active_power_kw: 109.5, energy_kwh: 109.5, power_factor: 0.93, frequency_hz: 49.96, rssi_dbm: -80, packet_latency_ms: 58, is_valid: true }
    },
    segments: [
      {
        segment_id: 'SEG-P0-P1',
        name: 'Substation Bay 01 to Sectionalizer Pole 14',
        upstream_point: 'P0',
        downstream_point: 'P1',
        length_km: 1.2,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.32,
        upstream_reading_kwh: 150.0,
        downstream_reading_kwh: 146.5,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 3.5,
        discrepancy_pct: 2.33,
        technical_loss_kwh: 3.0,
        unexplained_loss_kwh: 0.5,
        expected_tech_loss_pct: 2.0,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.0,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Normal operation. Discrepancy within technical bounds.',
        timestamp: '2026-10-10 19:30:00 UTC'
      },
      {
        segment_id: 'SEG-P1-P2',
        name: 'Sectionalizer Pole 14 to Sectionalizer Pole 28',
        upstream_point: 'P1',
        downstream_point: 'P2',
        length_km: 1.5,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.40,
        upstream_reading_kwh: 146.5,
        downstream_reading_kwh: 142.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 3.7,
        discrepancy_pct: 2.53,
        technical_loss_kwh: 3.52,
        unexplained_loss_kwh: 0.18,
        expected_tech_loss_pct: 2.4,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Normal operation. Discrepancy within technical bounds.',
        timestamp: '2026-10-10 19:30:00 UTC'
      },
      {
        segment_id: 'SEG-P2-P3',
        name: 'Sectionalizer Pole 28 to Distribution Pole 42',
        upstream_point: 'P2',
        downstream_point: 'P3',
        length_km: 1.8,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.48,
        upstream_reading_kwh: 142.8,
        downstream_reading_kwh: 112.0,
        branch_energy_kwh: 5.0,
        discrepancy_kwh: 25.8,
        discrepancy_pct: 18.07,
        technical_loss_kwh: 4.0,
        unexplained_loss_kwh: 21.8,
        expected_tech_loss_pct: 2.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 8.0,
        status: 'INVESTIGATION_RECOMMENDED',
        is_suspected_abnormal: true,
        confidence_score: 0.96,
        remarks: 'Abnormal discrepancy of 18.07% (25.8 kWh) exceeds effective threshold (8.0%). Suspected location for field inspection.',
        timestamp: '2026-10-10 19:30:00 UTC'
      },
      {
        segment_id: 'SEG-P3-P4',
        name: 'Distribution Pole 42 to Terminal Pole 56',
        upstream_point: 'P3',
        downstream_point: 'P4',
        length_km: 0.9,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.24,
        upstream_reading_kwh: 112.0,
        downstream_reading_kwh: 109.5,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 2.5,
        discrepancy_pct: 2.23,
        technical_loss_kwh: 2.02,
        unexplained_loss_kwh: 0.48,
        expected_tech_loss_pct: 1.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 6.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Normal operation downstream of anomaly. No compounding discrepancy.',
        timestamp: '2026-10-10 19:30:00 UTC'
      }
    ],
    summary: {
      total_feeder_input_kwh: 150.0,
      total_feeder_output_kwh: 114.5,
      overall_discrepancy_kwh: 35.5,
      overall_loss_pct: 23.67,
      monitored_points_count: 5,
      monitored_segments_count: 4,
      abnormal_segments_count: 1,
      abnormal_segment_ids: ['SEG-P2-P3'],
      faulty_segment_ids: [],
      uncertain_segment_ids: [],
      highest_loss_segment: 'SEG-P2-P3'
    }
  },
  SCENARIO_SENSOR_FAULT: {
    meta: {
      id: 'SCENARIO_SENSOR_FAULT',
      title: 'Scenario C: Sensor Hardware Fault at Node P2',
      description: 'Simulated hardware transducer failure on pole sensor Node P2 (0V/0A). System marks adjacent segments as SENSOR_FAULT to avoid false theft classifications.',
      timestamp: '2026-10-10 20:00:00 UTC',
      feeder_code: 'FDR-11KV-NORTH',
      feeder_name: '11kV North Industrial & Residential Ring Feeder'
    },
    nodes_telemetry: {
      P0: { node_id: 'ESP32-NODE-P0', v_rms: 416.2, i_rms: 218.4, active_power_kw: 150.0, energy_kwh: 150.0, power_factor: 0.96, frequency_hz: 50.02, rssi_dbm: -62, packet_latency_ms: 28, is_valid: true },
      P1: { node_id: 'ESP32-NODE-P1', v_rms: 414.0, i_rms: 214.0, active_power_kw: 146.5, energy_kwh: 146.5, power_factor: 0.95, frequency_hz: 50.01, rssi_dbm: -68, packet_latency_ms: 34, is_valid: true },
      P2: { node_id: 'ESP32-NODE-P2', v_rms: 0.0, i_rms: 0.0, active_power_kw: 0.0, energy_kwh: 0.0, power_factor: 0.0, frequency_hz: 0.0, rssi_dbm: -82, packet_latency_ms: 120, is_valid: false, error_flags: 'TRANSDUCER_OPEN_CIRCUIT_FAULT' },
      P3: { node_id: 'ESP32-NODE-P3', v_rms: 409.5, i_rms: 196.2, active_power_kw: 133.5, energy_kwh: 133.5, power_factor: 0.94, frequency_hz: 49.99, rssi_dbm: -75, packet_latency_ms: 48, is_valid: true },
      P4: { node_id: 'ESP32-NODE-P4', v_rms: 407.2, i_rms: 192.8, active_power_kw: 130.8, energy_kwh: 130.8, power_factor: 0.94, frequency_hz: 49.98, rssi_dbm: -79, packet_latency_ms: 55, is_valid: true }
    },
    segments: [
      {
        segment_id: 'SEG-P0-P1',
        name: 'Substation Bay 01 to Sectionalizer Pole 14',
        upstream_point: 'P0',
        downstream_point: 'P1',
        length_km: 1.2,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.32,
        upstream_reading_kwh: 150.0,
        downstream_reading_kwh: 146.5,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 3.5,
        discrepancy_pct: 2.33,
        technical_loss_kwh: 3.0,
        unexplained_loss_kwh: 0.5,
        expected_tech_loss_pct: 2.0,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.0,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Upstream section fully healthy.',
        timestamp: '2026-10-10 20:00:00 UTC'
      },
      {
        segment_id: 'SEG-P1-P2',
        name: 'Sectionalizer Pole 14 to Sectionalizer Pole 28',
        upstream_point: 'P1',
        downstream_point: 'P2',
        length_km: 1.5,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.40,
        upstream_reading_kwh: 146.5,
        downstream_reading_kwh: 0.0,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 0.0,
        discrepancy_pct: 0.0,
        technical_loss_kwh: 0.0,
        unexplained_loss_kwh: 0.0,
        expected_tech_loss_pct: 2.4,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.5,
        status: 'SENSOR_FAULT',
        is_suspected_abnormal: false,
        confidence_score: 0.0,
        remarks: 'Sensor fault detected at downstream node P2 (TRANSDUCER_OPEN_CIRCUIT_FAULT). Localisation inhibited.',
        timestamp: '2026-10-10 20:00:00 UTC'
      },
      {
        segment_id: 'SEG-P2-P3',
        name: 'Sectionalizer Pole 28 to Distribution Pole 42',
        upstream_point: 'P2',
        downstream_point: 'P3',
        length_km: 1.8,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.48,
        upstream_reading_kwh: 0.0,
        downstream_reading_kwh: 133.5,
        branch_energy_kwh: 5.0,
        discrepancy_kwh: 0.0,
        discrepancy_pct: 0.0,
        technical_loss_kwh: 0.0,
        unexplained_loss_kwh: 0.0,
        expected_tech_loss_pct: 2.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 8.0,
        status: 'SENSOR_FAULT',
        is_suspected_abnormal: false,
        confidence_score: 0.0,
        remarks: 'Sensor fault detected at upstream node P2 (TRANSDUCER_OPEN_CIRCUIT_FAULT). Localisation inhibited.',
        timestamp: '2026-10-10 20:00:00 UTC'
      },
      {
        segment_id: 'SEG-P3-P4',
        name: 'Distribution Pole 42 to Terminal Pole 56',
        upstream_point: 'P3',
        downstream_point: 'P4',
        length_km: 0.9,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.24,
        upstream_reading_kwh: 133.5,
        downstream_reading_kwh: 130.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 2.7,
        discrepancy_pct: 2.02,
        technical_loss_kwh: 2.4,
        unexplained_loss_kwh: 0.3,
        expected_tech_loss_pct: 1.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 6.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Downstream section operating normally.',
        timestamp: '2026-10-10 20:00:00 UTC'
      }
    ],
    summary: {
      total_feeder_input_kwh: 150.0,
      total_feeder_output_kwh: 135.8,
      overall_discrepancy_kwh: 14.2,
      overall_loss_pct: 9.47,
      monitored_points_count: 5,
      monitored_segments_count: 4,
      abnormal_segments_count: 0,
      abnormal_segment_ids: [],
      faulty_segment_ids: ['SEG-P1-P2', 'SEG-P2-P3'],
      uncertain_segment_ids: [],
      highest_loss_segment: 'SEG-P0-P1'
    }
  },
  SCENARIO_MISSING_DATA: {
    meta: {
      id: 'SCENARIO_MISSING_DATA',
      title: 'Scenario D: Missing / Delayed Telemetry at Node P1',
      description: 'Simulated wireless interference causing delayed or dropped telemetry at Node P1. System marks Segments P0–P1 and P1–P2 as UNCERTAIN_DATA and refrains from assigning an unverified location.',
      timestamp: '2026-10-10 20:30:00 UTC',
      feeder_code: 'FDR-11KV-NORTH',
      feeder_name: '11kV North Industrial & Residential Ring Feeder'
    },
    nodes_telemetry: {
      P0: { node_id: 'ESP32-NODE-P0', v_rms: 416.2, i_rms: 218.4, active_power_kw: 150.0, energy_kwh: 150.0, power_factor: 0.96, frequency_hz: 50.02, rssi_dbm: -62, packet_latency_ms: 28, is_valid: true },
      P1: { node_id: 'ESP32-NODE-P1', v_rms: 414.0, i_rms: 214.0, active_power_kw: 146.5, energy_kwh: 146.5, power_factor: 0.95, frequency_hz: 50.01, rssi_dbm: -108, packet_latency_ms: 4200, is_valid: false, error_flags: 'WIRELESS_TIMEOUT_PACKET_LOSS' },
      P2: { node_id: 'ESP32-NODE-P2', v_rms: 411.8, i_rms: 209.5, active_power_kw: 142.8, energy_kwh: 142.8, power_factor: 0.95, frequency_hz: 50.00, rssi_dbm: -71, packet_latency_ms: 42, is_valid: true },
      P3: { node_id: 'ESP32-NODE-P3', v_rms: 409.5, i_rms: 196.2, active_power_kw: 133.5, energy_kwh: 133.5, power_factor: 0.94, frequency_hz: 49.99, rssi_dbm: -75, packet_latency_ms: 48, is_valid: true },
      P4: { node_id: 'ESP32-NODE-P4', v_rms: 407.2, i_rms: 192.8, active_power_kw: 130.8, energy_kwh: 130.8, power_factor: 0.94, frequency_hz: 49.98, rssi_dbm: -79, packet_latency_ms: 55, is_valid: true }
    },
    segments: [
      {
        segment_id: 'SEG-P0-P1',
        name: 'Substation Bay 01 to Sectionalizer Pole 14',
        upstream_point: 'P0',
        downstream_point: 'P1',
        length_km: 1.2,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.32,
        upstream_reading_kwh: 150.0,
        downstream_reading_kwh: 146.5,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 0.0,
        discrepancy_pct: 0.0,
        technical_loss_kwh: 0.0,
        unexplained_loss_kwh: 0.0,
        expected_tech_loss_pct: 2.0,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.0,
        status: 'UNCERTAIN_DATA',
        is_suspected_abnormal: false,
        confidence_score: 0.3,
        remarks: 'Insufficient or delayed measurements at node P1. Location cannot be reliably determined.',
        timestamp: '2026-10-10 20:30:00 UTC'
      },
      {
        segment_id: 'SEG-P1-P2',
        name: 'Sectionalizer Pole 14 to Sectionalizer Pole 28',
        upstream_point: 'P1',
        downstream_point: 'P2',
        length_km: 1.5,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.40,
        upstream_reading_kwh: 146.5,
        downstream_reading_kwh: 142.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 0.0,
        discrepancy_pct: 0.0,
        technical_loss_kwh: 0.0,
        unexplained_loss_kwh: 0.0,
        expected_tech_loss_pct: 2.4,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 7.5,
        status: 'UNCERTAIN_DATA',
        is_suspected_abnormal: false,
        confidence_score: 0.3,
        remarks: 'Insufficient or delayed measurements at node P1. Location cannot be reliably determined.',
        timestamp: '2026-10-10 20:30:00 UTC'
      },
      {
        segment_id: 'SEG-P2-P3',
        name: 'Sectionalizer Pole 28 to Distribution Pole 42',
        upstream_point: 'P2',
        downstream_point: 'P3',
        length_km: 1.8,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.48,
        upstream_reading_kwh: 142.8,
        downstream_reading_kwh: 133.5,
        branch_energy_kwh: 5.0,
        discrepancy_kwh: 4.3,
        discrepancy_pct: 3.01,
        technical_loss_kwh: 4.0,
        unexplained_loss_kwh: 0.3,
        expected_tech_loss_pct: 2.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 8.0,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Downstream segment verified normal with available valid nodes.',
        timestamp: '2026-10-10 20:30:00 UTC'
      },
      {
        segment_id: 'SEG-P3-P4',
        name: 'Distribution Pole 42 to Terminal Pole 56',
        upstream_point: 'P3',
        downstream_point: 'P4',
        length_km: 0.9,
        conductor_type: 'ACSR Dog 100mm²',
        line_resistance_ohms: 0.24,
        upstream_reading_kwh: 133.5,
        downstream_reading_kwh: 130.8,
        branch_energy_kwh: 0.0,
        discrepancy_kwh: 2.7,
        discrepancy_pct: 2.02,
        technical_loss_kwh: 2.4,
        unexplained_loss_kwh: 0.3,
        expected_tech_loss_pct: 1.8,
        uncertainty_band_pct: 1.5,
        effective_threshold_pct: 6.5,
        status: 'NORMAL',
        is_suspected_abnormal: false,
        confidence_score: 0.95,
        remarks: 'Downstream segment operating normally.',
        timestamp: '2026-10-10 20:30:00 UTC'
      }
    ],
    summary: {
      total_feeder_input_kwh: 150.0,
      total_feeder_output_kwh: 135.8,
      overall_discrepancy_kwh: 14.2,
      overall_loss_pct: 9.47,
      monitored_points_count: 5,
      monitored_segments_count: 4,
      abnormal_segments_count: 0,
      abnormal_segment_ids: [],
      faulty_segment_ids: [],
      uncertain_segment_ids: ['SEG-P0-P1', 'SEG-P1-P2'],
      highest_loss_segment: 'SEG-P2-P3'
    }
  }
};

export const SegmentLocalisationView: FC = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCENARIO_ANOMALY_P2_P3');
  const [scenarioData, setScenarioData] = useState<SegmentScenarioData>(FALLBACK_SCENARIOS.SCENARIO_ANOMALY_P2_P3);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('SEG-P2-P3');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadScenario = async (id: string) => {
    setActiveScenarioId(id);
    setIsLoading(true);
    try {
      const res = await api.getSegmentScenario(id);
      if (res && res.segments) {
        setScenarioData(res);
      } else {
        setScenarioData(FALLBACK_SCENARIOS[id] || FALLBACK_SCENARIOS.SCENARIO_NORMAL);
      }
    } catch {
      setScenarioData(FALLBACK_SCENARIOS[id] || FALLBACK_SCENARIOS.SCENARIO_NORMAL);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScenario(activeScenarioId);
  }, []);

  const selectedSegment = scenarioData.segments.find(s => s.segment_id === selectedSegmentId) || scenarioData.segments[0];

  const getStatusBadge = (st: SegmentStatus) => {
    switch (st) {
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normal
          </span>
        );
      case 'INVESTIGATION_RECOMMENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Suspected Discrepancy
          </span>
        );
      case 'SENSOR_FAULT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
            Sensor Malfunction
          </span>
        );
      case 'UNCERTAIN_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/40 text-slate-300 border border-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Uncertain / Delayed
          </span>
        );
    }
  };

  const getSegmentStrokeColor = (st: SegmentStatus) => {
    switch (st) {
      case 'NORMAL': return '#10b981'; // emerald
      case 'INVESTIGATION_RECOMMENDED': return '#f43f5e'; // rose/red
      case 'SENSOR_FAULT': return '#a855f7'; // purple
      case 'UNCERTAIN_DATA': return '#64748b'; // slate
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Disclaimer */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                DISTRIBUTION LINE LOCALISATION
              </span>
              <span className="text-xs text-slate-400 font-mono">
                5-Point Multi-Hop Array (P0 → P4)
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>Feeder Segment-Level Energy Loss Localisation</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Synchronized current, voltage, and energy telemetry sampled across sectionalizer poles.
              Distinguishes expected line resistance losses from abnormal segment discrepancies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadScenario(activeScenarioId)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Readings</span>
            </button>
          </div>
        </div>

        {/* Mandatory Domain Protocol Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Localisation Safety Protocol: </span>
            A highlighted segment identifies a <strong className="text-amber-300">suspected location for field inspection</strong>, NOT proof of unauthorized tapping. The algorithm automatically halts attribution and tags <strong className="text-slate-300">UNCERTAIN DATA</strong> when sensor measurements are inconsistent, delayed, or missing.
          </div>
        </div>
      </div>

      {/* Scenario Switcher Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Active Test Simulation Scenario:</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'SCENARIO_NORMAL', label: 'Scenario A: Normal Balance', badge: 'Balanced', color: 'hover:border-emerald-500/50' },
            { id: 'SCENARIO_ANOMALY_P2_P3', label: 'Scenario B: P2–P3 Discrepancy', badge: '18% Loss', color: 'hover:border-rose-500/50' },
            { id: 'SCENARIO_SENSOR_FAULT', label: 'Scenario C: Sensor Fault (P2)', badge: 'Hardware Err', color: 'hover:border-purple-500/50' },
            { id: 'SCENARIO_MISSING_DATA', label: 'Scenario D: Delayed Packet (P1)', badge: 'Uncertain', color: 'hover:border-slate-500/50' }
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => loadScenario(sc.id)}
              className={`px-3 py-2 rounded-xl text-left transition-all border ${
                activeScenarioId === sc.id
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 font-bold shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white ' + sc.color
              }`}
            >
              <div className="font-semibold text-[11px] truncate">{sc.label}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{sc.badge}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400">Scenario Description: </span>
          <span className="text-white font-medium">{scenarioData.meta.description}</span>
        </div>
        <div className="font-mono text-slate-400 shrink-0">
          Sync Timestamp: <span className="text-cyan-400">{scenarioData.meta.timestamp}</span>
        </div>
      </div>

      {/* INTERACTIVE SINGLE-LINE TOPOLOGY DIAGRAM */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <h3 className="text-base font-bold text-white">
              Distribution Feeder Single-Line Topology &amp; Sensor Nodes
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Click segment or node to inspect telemetry
          </span>
        </div>

        {/* SVG Topology Diagram */}
        <div className="relative overflow-x-auto py-6">
          <div className="min-w-[860px]">
            {/* Feeder Track Container */}
            <div className="grid grid-cols-5 gap-3 items-center relative">
              {/* Ordered Points P0 to P4 */}
              {[
                { code: 'P0', label: 'P0: Substation Breaker', type: 'Source', km: '0.0 km' },
                { code: 'P1', label: 'P1: Pole #14', type: 'Sectionalizer', km: '1.2 km' },
                { code: 'P2', label: 'P2: Pole #28', type: 'Commercial Tap', km: '2.7 km' },
                { code: 'P3', label: 'P3: Pole #42', type: 'Distribution Tap', km: '4.5 km', hasBranch: true },
                { code: 'P4', label: 'P4: Pole #56', type: 'Tail Bus', km: '5.4 km' }
              ].map((pt, idx) => {
                const telemetry = scenarioData.nodes_telemetry[pt.code] || {
                  v_rms: 415,
                  i_rms: 200,
                  energy_kwh: 140,
                  rssi_dbm: -65,
                  is_valid: true
                };

                return (
                  <div key={pt.code} className="flex flex-col items-center relative z-10">
                    {/* Node Card */}
                    <div 
                      className={`w-full p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        !telemetry.is_valid
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                          : 'bg-slate-950/80 border-slate-800 hover:border-cyan-400 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-cyan-300">
                          {pt.code}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                          <Radio className="w-3 h-3 text-cyan-400" />
                          <span>{telemetry.rssi_dbm} dBm</span>
                        </div>
                      </div>

                      <div className="text-xs font-bold truncate text-white">{pt.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pt.km}</div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-left font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Energy:</span>
                          <span className="font-bold text-cyan-300">{telemetry.energy_kwh.toFixed(1)} kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">V_rms:</span>
                          <span className="text-slate-200">{telemetry.v_rms.toFixed(1)} V</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">I_rms:</span>
                          <span className="text-emerald-300">{telemetry.i_rms.toFixed(1)} A</span>
                        </div>
                      </div>

                      {!telemetry.is_valid && (
                        <div className="mt-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 py-1 px-1.5 rounded">
                          {telemetry.error_flags || 'TELEMETRY CORRUPT'}
                        </div>
                      )}
                    </div>

                    {pt.hasBranch && (
                      <div className="mt-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                        <span>Branch: 5.0 kWh</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Segment Connector Flow Bar */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              {scenarioData.segments.map((seg) => {
                const isSelected = selectedSegmentId === seg.segment_id;
                const strokeColor = getSegmentStrokeColor(seg.status);
                const isAbnormal = seg.status === 'INVESTIGATION_RECOMMENDED';

                return (
                  <div
                    key={seg.segment_id}
                    onClick={() => setSelectedSegmentId(seg.segment_id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected ? 'ring-2 ring-cyan-400' : ''
                    } ${
                      isAbnormal
                        ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-500/10'
                        : seg.status === 'SENSOR_FAULT'
                        ? 'bg-purple-950/20 border-purple-500/50'
                        : seg.status === 'UNCERTAIN_DATA'
                        ? 'bg-slate-900/40 border-slate-700 border-dashed'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-cyan-300">{seg.segment_id}</span>
                        {getStatusBadge(seg.status)}
                      </div>

                      <div className="text-xs text-slate-300 font-semibold">{seg.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {seg.length_km} km • R={seg.line_resistance_ohms}Ω
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Discrepancy:</span>
                        <span className={`font-bold ${isAbnormal ? 'text-rose-400 text-sm' : 'text-slate-200'}`}>
                          {seg.discrepancy_pct.toFixed(2)}% ({seg.discrepancy_kwh.toFixed(1)} kWh)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Tech Baseline:</span>
                        <span className="text-slate-400">{seg.expected_tech_loss_pct}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Threshold (+Uncert):</span>
                        <span className="text-amber-400">{seg.effective_threshold_pct}%</span>
                      </div>
                    </div>

                    {isAbnormal && (
                      <div className="mt-3 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold text-center">
                        SUSPECTED DISCREPANCY DETECTED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* METRICS TABLE FOR ALL SEGMENTS */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Segment Energy Accounting Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dual-sensor verification across consecutive nodes with technical line parameter adjustments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Segment ID</th>
                <th className="py-3 px-3">Upstream Node</th>
                <th className="py-3 px-3">Downstream Node</th>
                <th className="py-3 px-3">Upstream (kWh)</th>
                <th className="py-3 px-3">Downstream (kWh)</th>
                <th className="py-3 px-3">Branch (kWh)</th>
                <th className="py-3 px-3">Discrepancy (Δ)</th>
                <th className="py-3 px-3">Loss %</th>
                <th className="py-3 px-3">Threshold</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {scenarioData.segments.map((seg) => {
                const isSelected = selectedSegmentId === seg.segment_id;
                const isAbnormal = seg.status === 'INVESTIGATION_RECOMMENDED';

                return (
                  <tr 
                    key={seg.segment_id} 
                    onClick={() => setSelectedSegmentId(seg.segment_id)}
                    className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${isSelected ? 'bg-slate-800/50' : ''}`}
                  >
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-1.5">
                      <span className="font-mono text-cyan-400">{seg.segment_id}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{seg.upstream_point}</td>
                    <td className="py-3 px-3 text-slate-300">{seg.downstream_point}</td>
                    <td className="py-3 px-3 text-cyan-300">{seg.upstream_reading_kwh.toFixed(1)}</td>
                    <td className="py-3 px-3 text-emerald-300">{seg.downstream_reading_kwh.toFixed(1)}</td>
                    <td className="py-3 px-3 text-amber-300">{seg.branch_energy_kwh.toFixed(1)}</td>
                    <td className="py-3 px-3 font-semibold text-white">
                      {seg.discrepancy_kwh.toFixed(1)} kWh
                    </td>
                    <td className="py-3 px-3 font-bold">
                      <span className={isAbnormal ? 'text-rose-400' : 'text-slate-300'}>
                        {seg.discrepancy_pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{seg.effective_threshold_pct}%</td>
                    <td className="py-3 px-3 font-sans">{getStatusBadge(seg.status)}</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSegmentId(seg.segment_id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-black font-semibold text-[11px] transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED SEGMENT INSPECTOR PANEL */}
      {selectedSegment && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">{selectedSegment.segment_id}</span>
                <span className="text-slate-400">•</span>
                <span className="text-sm font-bold text-white">{selectedSegment.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedSegment.remarks}</p>
            </div>
            <div>{getStatusBadge(selectedSegment.status)}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px]">Conductor Properties</span>
              <div className="text-sm font-bold text-white font-mono">{selectedSegment.conductor_type}</div>
              <div className="text-xs text-slate-400 font-mono">
                Length: {selectedSegment.length_km} km | R = {selectedSegment.line_resistance_ohms} Ω
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px]">Technical vs Unexplained</span>
              <div className="text-sm font-bold text-cyan-300 font-mono">
                Tech: {selectedSegment.technical_loss_kwh.toFixed(1)} kWh ({selectedSegment.expected_tech_loss_pct}%)
              </div>
              <div className="text-xs text-rose-300 font-mono">
                Unexplained: {selectedSegment.unexplained_loss_kwh.toFixed(1)} kWh
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px]">Measurement Uncertainty</span>
              <div className="text-sm font-bold text-amber-400 font-mono">
                ±{selectedSegment.uncertainty_band_pct}% CT/PT Class 1.0
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Effective Threshold: {selectedSegment.effective_threshold_pct}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[11px]">Confidence &amp; Timestamp</span>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {(selectedSegment.confidence_score * 100).toFixed(0)}% Confidence
              </div>
              <div className="text-[11px] text-slate-400 font-mono truncate">
                {selectedSegment.timestamp}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
