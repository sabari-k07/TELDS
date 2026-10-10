from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.db.session import get_db
from app.services.segment_localiser import SegmentLocalisationEngine

router = APIRouter()

class TelemetryPacketInput(BaseModel):
    node_id: str = Field(..., example="ESP32-NODE-P0")
    timestamp: Optional[str] = None
    v_rms: float = Field(..., example=415.2)
    i_rms: float = Field(..., example=210.5)
    active_power_kw: float = Field(..., example=145.0)
    energy_kwh: float = Field(..., example=145.0)
    power_factor: float = Field(0.95, example=0.95)
    rssi_dbm: int = Field(-65, example=-65)
    packet_latency_ms: int = Field(35, example=35)
    is_valid: bool = True
    error_flags: Optional[str] = None

class CustomSegmentAnalysisInput(BaseModel):
    upstream_energy_kwh: float
    downstream_energy_kwh: float
    branch_energy_kwh: float = 0.0
    expected_tech_loss_pct: float = 2.2
    uncertainty_pct: float = 1.5
    threshold_pct: float = 6.0
    upstream_valid: bool = True
    downstream_valid: bool = True
    upstream_flags: Optional[str] = None
    downstream_flags: Optional[str] = None

@router.get("/topology", summary="Retrieve Feeder Multi-Point Topology & Segments")
def get_feeder_topology():
    """
    Returns the ordered 5-point distribution feeder model (P0, P1, P2, P3, P4)
    and segments (P0-P1, P1-P2, P2-P3, P3-P4) with line parameters.
    """
    return SegmentLocalisationEngine.get_feeder_topology_template()

@router.get("/scenarios/{scenario_id}", summary="Simulate & Analyze Feeder Scenarios")
def get_scenario_data(scenario_id: str):
    """
    Executes and evaluates multi-point energy balance for 4 test scenarios:
    - SCENARIO_NORMAL: Balanced grid operations within technical line loss.
    - SCENARIO_ANOMALY_P2_P3: Localised 18% discrepancy in Segment P2-P3.
    - SCENARIO_SENSOR_FAULT: Node P2 hardware transducer failure.
    - SCENARIO_MISSING_DATA: Wireless packet loss / delay at Node P1 with uncertainty handling.
    """
    valid_scenarios = {
        "SCENARIO_NORMAL",
        "SCENARIO_ANOMALY_P2_P3",
        "SCENARIO_SENSOR_FAULT",
        "SCENARIO_MISSING_DATA"
    }
    if scenario_id not in valid_scenarios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario_id. Must be one of: {list(valid_scenarios)}"
        )
    return SegmentLocalisationEngine.generate_scenario_data(scenario_id)

@router.post("/telemetry", summary="Ingest Virtual ESP32 Line Sensor Telemetry")
def ingest_telemetry_packet(packet: TelemetryPacketInput):
    """
    Simulates wireless receipt of telemetry packet from virtual ESP32 pole sensor.
    """
    return {
        "status": "TELEMETRY_RECORDED",
        "node_id": packet.node_id,
        "energy_kwh": packet.energy_kwh,
        "wireless_quality": "EXCELLENT" if packet.rssi_dbm > -70 else "MARGINAL" if packet.rssi_dbm > -90 else "POOR",
        "is_simulated": True
    }

@router.post("/analyse", summary="Calculate Custom Segment Loss Localisation")
def analyse_segment(input_data: CustomSegmentAnalysisInput):
    """
    Calculates segment-level energy balance with configurable uncertainty & technical loss buffers.
    """
    return SegmentLocalisationEngine.calculate_segment_loss(
        upstream_energy_kwh=input_data.upstream_energy_kwh,
        downstream_energy_kwh=input_data.downstream_energy_kwh,
        branch_energy_kwh=input_data.branch_energy_kwh,
        expected_tech_loss_pct=input_data.expected_tech_loss_pct,
        uncertainty_pct=input_data.uncertainty_pct,
        threshold_pct=input_data.threshold_pct,
        upstream_valid=input_data.upstream_valid,
        downstream_valid=input_data.downstream_valid,
        upstream_flags=input_data.upstream_flags,
        downstream_flags=input_data.downstream_flags
    )
