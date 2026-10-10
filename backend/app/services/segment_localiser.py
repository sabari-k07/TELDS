"""
Segment-Level Energy Loss Localisation Service.

Core Principles:
1. Physics-based conservation of energy across consecutive line sections (P0-P1, P1-P2, P2-P3, P3-P4).
2. Explicit accounting of technical I²R losses and dual-sensor measurement uncertainty bands.
3. Accounting for legitimate lateral branches and metered distribution loads.
4. Strict safety against false accusations: Insufficient or delayed measurements trigger
   UNCERTAIN_DATA status rather than false abnormal alarms.
5. Detected segments are formally designated as 'Suspected Locations for Field Investigation',
   never automated determinations of unauthorized tapping.
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import math

class SegmentLocalisationEngine:

    @staticmethod
    def calculate_segment_loss(
        upstream_energy_kwh: float,
        downstream_energy_kwh: float,
        branch_energy_kwh: float = 0.0,
        expected_tech_loss_pct: float = 2.2,
        uncertainty_pct: float = 1.5,
        threshold_pct: float = 6.0,
        upstream_valid: bool = True,
        downstream_valid: bool = True,
        upstream_flags: Optional[str] = None,
        downstream_flags: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculates energy balance across a distribution segment between consecutive nodes.
        """
        # 1. Check for sensor faults
        if upstream_flags and "FAULT" in upstream_flags:
            return {
                "status": "SENSOR_FAULT",
                "is_suspected_abnormal": False,
                "confidence_score": 0.0,
                "discrepancy_kwh": 0.0,
                "discrepancy_pct": 0.0,
                "technical_loss_kwh": 0.0,
                "unexplained_loss_kwh": 0.0,
                "effective_threshold_pct": threshold_pct + uncertainty_pct,
                "remarks": f"Sensor fault detected at upstream node ({upstream_flags}). Localisation inhibited."
            }

        if downstream_flags and "FAULT" in downstream_flags:
            return {
                "status": "SENSOR_FAULT",
                "is_suspected_abnormal": False,
                "confidence_score": 0.0,
                "discrepancy_kwh": 0.0,
                "discrepancy_pct": 0.0,
                "technical_loss_kwh": 0.0,
                "unexplained_loss_kwh": 0.0,
                "effective_threshold_pct": threshold_pct + uncertainty_pct,
                "remarks": f"Sensor fault detected at downstream node ({downstream_flags}). Localisation inhibited."
            }

        # 2. Check for missing or invalid data
        if not upstream_valid or not downstream_valid:
            return {
                "status": "UNCERTAIN_DATA",
                "is_suspected_abnormal": False,
                "confidence_score": 0.3,
                "discrepancy_kwh": 0.0,
                "discrepancy_pct": 0.0,
                "technical_loss_kwh": 0.0,
                "unexplained_loss_kwh": 0.0,
                "effective_threshold_pct": threshold_pct + uncertainty_pct,
                "remarks": "Insufficient or delayed measurements at node. Location cannot be reliably determined."
            }

        # Upstream must be greater than zero for valid percentage calculation
        if upstream_energy_kwh <= 0.0:
            return {
                "status": "UNCERTAIN_DATA",
                "is_suspected_abnormal": False,
                "confidence_score": 0.2,
                "discrepancy_kwh": 0.0,
                "discrepancy_pct": 0.0,
                "technical_loss_kwh": 0.0,
                "unexplained_loss_kwh": 0.0,
                "effective_threshold_pct": threshold_pct + uncertainty_pct,
                "remarks": "Upstream energy flow is zero or unmetered. Feeder section appears de-energized."
            }

        # 3. Energy balance calculation
        # Energy Difference = Upstream - (Downstream + Legitimate Branches)
        total_accounted_downstream = downstream_energy_kwh + branch_energy_kwh
        discrepancy_kwh = max(0.0, round(upstream_energy_kwh - total_accounted_downstream, 3))
        discrepancy_pct = round((discrepancy_kwh / upstream_energy_kwh) * 100.0, 2)

        # Technical loss calculation based on line parameters
        technical_loss_kwh = round(upstream_energy_kwh * (expected_tech_loss_pct / 100.0), 3)
        unexplained_loss_kwh = max(0.0, round(discrepancy_kwh - technical_loss_kwh, 3))

        # Effective detection threshold includes sensor uncertainty buffer
        effective_threshold_pct = round(threshold_pct + uncertainty_pct, 2)

        # 4. Status classification
        if discrepancy_pct > effective_threshold_pct:
            status = "INVESTIGATION_RECOMMENDED"
            is_suspected_abnormal = True
            remarks = (
                f"Abnormal discrepancy of {discrepancy_pct}% ({discrepancy_kwh} kWh) exceeds "
                f"effective threshold ({effective_threshold_pct}%). Suspected location for field inspection."
            )
        else:
            status = "NORMAL"
            is_suspected_abnormal = False
            remarks = (
                f"Discrepancy of {discrepancy_pct}% is within permissible technical & uncertainty band "
                f"({effective_threshold_pct}%)."
            )

        return {
            "status": status,
            "is_suspected_abnormal": is_suspected_abnormal,
            "confidence_score": 0.95,
            "discrepancy_kwh": discrepancy_kwh,
            "discrepancy_pct": discrepancy_pct,
            "technical_loss_kwh": technical_loss_kwh,
            "unexplained_loss_kwh": unexplained_loss_kwh,
            "effective_threshold_pct": effective_threshold_pct,
            "remarks": remarks
        }

    @staticmethod
    def get_feeder_topology_template() -> Dict[str, Any]:
        """
        Returns the standard 5-point distribution feeder topology model:
        P0 (Substation) -> P1 (Pole 1) -> P2 (Pole 2) -> P3 (Pole 3 with Branch) -> P4 (End of Line).
        """
        points = [
            {
                "code": "P0",
                "name": "Substation 11kV Feeder Outgoing Breaker",
                "sequence_order": 0,
                "point_type": "SUBSTATION_BREAKER",
                "virtual_node_id": "ESP32-NODE-P0",
                "pole_number": "SUB-BAY-01",
                "nominal_voltage_v": 415.0,
                "latitude": 12.9716,
                "longitude": 77.5946,
                "is_branch": False
            },
            {
                "code": "P1",
                "name": "Sectionalizer Pole #14 (Industrial Zone Entrance)",
                "sequence_order": 1,
                "point_type": "SECTIONALIZER_POLE",
                "virtual_node_id": "ESP32-NODE-P1",
                "pole_number": "POLE-IND-14",
                "nominal_voltage_v": 415.0,
                "latitude": 12.9730,
                "longitude": 77.5960,
                "is_branch": False
            },
            {
                "code": "P2",
                "name": "Intermediate Sectionalizer Pole #28 (Commercial Tap)",
                "sequence_order": 2,
                "point_type": "SECTIONALIZER_POLE",
                "virtual_node_id": "ESP32-NODE-P2",
                "pole_number": "POLE-COM-28",
                "nominal_voltage_v": 415.0,
                "latitude": 12.9745,
                "longitude": 77.5975,
                "is_branch": False
            },
            {
                "code": "P3",
                "name": "Residential Distribution Pole #42 (Branch Feeder)",
                "sequence_order": 3,
                "point_type": "DISTRIBUTION_TAP",
                "virtual_node_id": "ESP32-NODE-P3",
                "pole_number": "POLE-RES-42",
                "nominal_voltage_v": 415.0,
                "latitude": 12.9760,
                "longitude": 77.5990,
                "is_branch": False
            },
            {
                "code": "P4",
                "name": "Terminal End-of-Line Pole #56 (Feeder Tail)",
                "sequence_order": 4,
                "point_type": "END_OF_LINE",
                "virtual_node_id": "ESP32-NODE-P4",
                "pole_number": "POLE-END-56",
                "nominal_voltage_v": 415.0,
                "latitude": 12.9775,
                "longitude": 77.6005,
                "is_branch": False
            }
        ]

        segments = [
            {
                "code": "SEG-P0-P1",
                "name": "Substation Bay 01 to Sectionalizer Pole 14",
                "upstream_code": "P0",
                "downstream_code": "P1",
                "length_km": 1.2,
                "conductor_type": "ACSR Dog 100mm²",
                "line_resistance_ohms": 0.32,
                "expected_technical_loss_pct": 2.0,
                "measurement_uncertainty_pct": 1.5,
                "configured_threshold_pct": 5.5,
                "has_legitimate_branches": False,
                "branch_load_ratio": 0.0
            },
            {
                "code": "SEG-P1-P2",
                "name": "Sectionalizer Pole 14 to Sectionalizer Pole 28",
                "upstream_code": "P1",
                "downstream_code": "P2",
                "length_km": 1.5,
                "conductor_type": "ACSR Dog 100mm²",
                "line_resistance_ohms": 0.40,
                "expected_technical_loss_pct": 2.4,
                "measurement_uncertainty_pct": 1.5,
                "configured_threshold_pct": 6.0,
                "has_legitimate_branches": False,
                "branch_load_ratio": 0.0
            },
            {
                "code": "SEG-P2-P3",
                "name": "Sectionalizer Pole 28 to Distribution Pole 42",
                "upstream_code": "P2",
                "downstream_code": "P3",
                "length_km": 1.8,
                "conductor_type": "ACSR Dog 100mm²",
                "line_resistance_ohms": 0.48,
                "expected_technical_loss_pct": 2.8,
                "measurement_uncertainty_pct": 1.5,
                "configured_threshold_pct": 6.5,
                "has_legitimate_branches": True,
                "branch_load_ratio": 0.04  # ~5 kWh legitimate lateral branch load
            },
            {
                "code": "SEG-P3-P4",
                "name": "Distribution Pole 42 to Terminal Pole 56",
                "upstream_code": "P3",
                "downstream_code": "P4",
                "length_km": 0.9,
                "conductor_type": "ACSR Dog 100mm²",
                "line_resistance_ohms": 0.24,
                "expected_technical_loss_pct": 1.8,
                "measurement_uncertainty_pct": 1.5,
                "configured_threshold_pct": 5.0,
                "has_legitimate_branches": False,
                "branch_load_ratio": 0.0
            }
        ]

        return {"points": points, "segments": segments}

    @classmethod
    def generate_scenario_data(cls, scenario_id: str) -> Dict[str, Any]:
        """
        Generates synchronized multi-point telemetry and segment analysis for the 4 test scenarios:
        1. SCENARIO_NORMAL: All segments healthy, normal technical loss.
        2. SCENARIO_ANOMALY_P2_P3: Segment P2-P3 has an abnormal 18% discrepancy.
        3. SCENARIO_SENSOR_FAULT: Node P2 has hardware transducer failure.
        4. SCENARIO_MISSING_DATA: Node P1 packet delayed/dropped, uncertainty handled cleanly.
        """
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Base node telemetry configurations
        nodes_telemetry: Dict[str, Dict[str, Any]] = {
            "P0": {
                "node_id": "ESP32-NODE-P0",
                "v_rms": 416.2,
                "i_rms": 218.4,
                "active_power_kw": 150.0,
                "energy_kwh": 150.0,
                "power_factor": 0.96,
                "frequency_hz": 50.02,
                "rssi_dbm": -62,
                "packet_latency_ms": 28,
                "is_valid": True,
                "error_flags": None
            },
            "P1": {
                "node_id": "ESP32-NODE-P1",
                "v_rms": 414.0,
                "i_rms": 214.0,
                "active_power_kw": 146.5,
                "energy_kwh": 146.5,
                "power_factor": 0.95,
                "frequency_hz": 50.01,
                "rssi_dbm": -68,
                "packet_latency_ms": 34,
                "is_valid": True,
                "error_flags": None
            },
            "P2": {
                "node_id": "ESP32-NODE-P2",
                "v_rms": 411.8,
                "i_rms": 209.5,
                "active_power_kw": 142.8,
                "energy_kwh": 142.8,
                "power_factor": 0.95,
                "frequency_hz": 50.00,
                "rssi_dbm": -71,
                "packet_latency_ms": 42,
                "is_valid": True,
                "error_flags": None
            },
            "P3": {
                "node_id": "ESP32-NODE-P3",
                "v_rms": 409.5,
                "i_rms": 196.2,
                "active_power_kw": 133.5,
                "energy_kwh": 133.5,
                "power_factor": 0.94,
                "frequency_hz": 49.99,
                "rssi_dbm": -75,
                "packet_latency_ms": 48,
                "is_valid": True,
                "error_flags": None
            },
            "P4": {
                "node_id": "ESP32-NODE-P4",
                "v_rms": 407.2,
                "i_rms": 192.8,
                "active_power_kw": 130.8,
                "energy_kwh": 130.8,
                "power_factor": 0.94,
                "frequency_hz": 49.98,
                "rssi_dbm": -79,
                "packet_latency_ms": 55,
                "is_valid": True,
                "error_flags": None
            }
        }

        scenario_meta = {
            "id": scenario_id,
            "timestamp": now_iso,
            "feeder_code": "FDR-11KV-NORTH",
            "feeder_name": "11kV North Industrial & Residential Ring Feeder",
        }

        branch_loads = {
            "SEG-P0-P1": 0.0,
            "SEG-P1-P2": 0.0,
            "SEG-P2-P3": 5.0,  # 5.0 kWh legitimate lateral commercial branch
            "SEG-P3-P4": 0.0
        }

        # Apply Scenario Overrides
        if scenario_id == "SCENARIO_ANOMALY_P2_P3":
            # Significant discrepancy injected between P2 and P3
            # P2 throughput is 142.8 kWh, but downstream P3 only sees 112.0 kWh (+ 5.0 kWh branch = 117.0 kWh accounted)
            # Unaccounted = 25.8 kWh (18.06% loss)
            nodes_telemetry["P3"]["energy_kwh"] = 112.0
            nodes_telemetry["P3"]["active_power_kw"] = 112.0
            nodes_telemetry["P3"]["v_rms"] = 405.0
            nodes_telemetry["P4"]["energy_kwh"] = 109.5
            nodes_telemetry["P4"]["active_power_kw"] = 109.5
            scenario_meta["title"] = "Scenario B: Localised Discrepancy in Segment P2–P3"
            scenario_meta["description"] = (
                "Simulated abnormal discrepancy (18.1%) on line segment P2–P3. "
                "System flags Segment P2–P3 as suspected location while P0–P1, P1–P2, and P3–P4 remain normal."
            )

        elif scenario_id == "SCENARIO_SENSOR_FAULT":
            # Transducer hardware fault at Node P2
            nodes_telemetry["P2"]["v_rms"] = 0.0
            nodes_telemetry["P2"]["i_rms"] = 0.0
            nodes_telemetry["P2"]["active_power_kw"] = 0.0
            nodes_telemetry["P2"]["energy_kwh"] = 0.0
            nodes_telemetry["P2"]["is_valid"] = False
            nodes_telemetry["P2"]["error_flags"] = "TRANSDUCER_OPEN_CIRCUIT_FAULT"
            scenario_meta["title"] = "Scenario C: Sensor Hardware Fault at Node P2"
            scenario_meta["description"] = (
                "Simulated hardware transducer failure on pole sensor Node P2 (0V/0A). "
                "System marks adjacent segments as SENSOR_FAULT to avoid false theft classifications."
            )

        elif scenario_id == "SCENARIO_MISSING_DATA":
            # Delayed or lost wireless packet at Node P1
            nodes_telemetry["P1"]["is_valid"] = False
            nodes_telemetry["P1"]["rssi_dbm"] = -108  # Extreme attenuation
            nodes_telemetry["P1"]["packet_latency_ms"] = 4200
            nodes_telemetry["P1"]["error_flags"] = "WIRELESS_TIMEOUT_PACKET_LOSS"
            scenario_meta["title"] = "Scenario D: Missing / Delayed Telemetry at Node P1"
            scenario_meta["description"] = (
                "Simulated wireless interference causing delayed or dropped telemetry at Node P1. "
                "System marks Segments P0–P1 and P1–P2 as UNCERTAIN_DATA and refrains from assigning an unverified location."
            )

        else:  # SCENARIO_NORMAL
            scenario_meta["title"] = "Scenario A: Normal Feeder Operation"
            scenario_meta["description"] = (
                "All 5 measurement points report synchronized, valid telemetry. "
                "All segment discrepancies (1.8% to 2.8%) are strictly within technical line loss bounds."
            )

        # Compute Segment Analysis for each segment
        template = cls.get_feeder_topology_template()
        segments_result: List[Dict[str, Any]] = []

        for seg_def in template["segments"]:
            up_code = seg_def["upstream_code"]
            down_code = seg_def["downstream_code"]
            up_node = nodes_telemetry[up_code]
            down_node = nodes_telemetry[down_code]
            branch_val = branch_loads.get(seg_def["code"], 0.0)

            analysis = cls.calculate_segment_loss(
                upstream_energy_kwh=up_node["energy_kwh"],
                downstream_energy_kwh=down_node["energy_kwh"],
                branch_energy_kwh=branch_val,
                expected_tech_loss_pct=seg_def["expected_technical_loss_pct"],
                uncertainty_pct=seg_def["measurement_uncertainty_pct"],
                threshold_pct=seg_def["configured_threshold_pct"],
                upstream_valid=up_node["is_valid"],
                downstream_valid=down_node["is_valid"],
                upstream_flags=up_node["error_flags"],
                downstream_flags=down_node["error_flags"]
            )

            segments_result.append({
                "segment_id": seg_def["code"],
                "name": seg_def["name"],
                "upstream_point": up_code,
                "downstream_point": down_code,
                "length_km": seg_def["length_km"],
                "conductor_type": seg_def["conductor_type"],
                "line_resistance_ohms": seg_def["line_resistance_ohms"],
                "upstream_reading_kwh": up_node["energy_kwh"],
                "downstream_reading_kwh": down_node["energy_kwh"],
                "branch_energy_kwh": branch_val,
                "discrepancy_kwh": analysis["discrepancy_kwh"],
                "discrepancy_pct": analysis["discrepancy_pct"],
                "technical_loss_kwh": analysis["technical_loss_kwh"],
                "unexplained_loss_kwh": analysis["unexplained_loss_kwh"],
                "expected_tech_loss_pct": seg_def["expected_technical_loss_pct"],
                "uncertainty_band_pct": seg_def["measurement_uncertainty_pct"],
                "effective_threshold_pct": analysis["effective_threshold_pct"],
                "status": analysis["status"],
                "is_suspected_abnormal": analysis["is_suspected_abnormal"],
                "confidence_score": analysis["confidence_score"],
                "remarks": analysis["remarks"],
                "timestamp": now_iso
            })

        # Summary KPIs
        total_feeder_input = nodes_telemetry["P0"]["energy_kwh"]
        total_feeder_output = nodes_telemetry["P4"]["energy_kwh"] + sum(branch_loads.values())
        overall_discrepancy_kwh = max(0.0, round(total_feeder_input - total_feeder_output, 3))
        overall_loss_pct = round((overall_discrepancy_kwh / total_feeder_input) * 100.0, 2) if total_feeder_input > 0 else 0.0

        abnormal_segments = [s["segment_id"] for s in segments_result if s["is_suspected_abnormal"]]
        faulty_segments = [s["segment_id"] for s in segments_result if s["status"] == "SENSOR_FAULT"]
        uncertain_segments = [s["segment_id"] for s in segments_result if s["status"] == "UNCERTAIN_DATA"]

        summary = {
            "total_feeder_input_kwh": total_feeder_input,
            "total_feeder_output_kwh": total_feeder_output,
            "overall_discrepancy_kwh": overall_discrepancy_kwh,
            "overall_loss_pct": overall_loss_pct,
            "monitored_points_count": len(template["points"]),
            "monitored_segments_count": len(segments_result),
            "abnormal_segments_count": len(abnormal_segments),
            "abnormal_segment_ids": abnormal_segments,
            "faulty_segment_ids": faulty_segments,
            "uncertain_segment_ids": uncertain_segments,
            "highest_loss_segment": max(segments_result, key=lambda s: s["discrepancy_pct"])["segment_id"] if segments_result else None
        }

        return {
            "meta": scenario_meta,
            "nodes_telemetry": nodes_telemetry,
            "segments": segments_result,
            "summary": summary
        }
