from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.transformer import Transformer
from app.models.reading import TransformerReading, ConsumerReading, EnergyAnalysis
from app.models.alert import Alert, AlertStatus, AlertSeverity
from app.services.energy_calculator import EnergyCalculator

router = APIRouter(prefix="/telemetry", tags=["Live IoT Telemetry"])

class TelemetryPayload(BaseModel):
    transformer_code: str
    current_ct1_input_a: float
    current_ct2_consumer_a: float
    voltage_v: Optional[float] = 230.0
    input_power_kw: Optional[float] = 0.0
    consumer_power_kw: Optional[float] = 0.0
    loss_percentage: Optional[float] = 0.0
    is_anomaly: Optional[bool] = False

# In-memory buffer for high-frequency live feed
_live_buffer: List[Dict[str, Any]] = []

@router.post("/reading")
def ingest_telemetry_reading(payload: TelemetryPayload, db: Session = Depends(get_db)):
    tx = db.query(Transformer).filter(Transformer.code == payload.transformer_code).first()
    if not tx:
        # Fallback to create or find first
        tx = db.query(Transformer).first()
        if not tx:
            raise HTTPException(status_code=404, detail="Transformer not configured")

    now = datetime.now(timezone.utc)
    
    # Calculate energy in kWh (assuming interval equivalent)
    tx_input_kwh = (payload.input_power_kw or (payload.voltage_v * payload.current_ct1_input_a * 0.92 / 1000.0)) * (2.0 / 3600.0)
    consumer_kwh = (payload.consumer_power_kw or (payload.voltage_v * payload.current_ct2_consumer_a * 0.92 / 1000.0)) * (2.0 / 3600.0)

    calc = EnergyCalculator.calculate_energy_difference(
        transformer_input_kwh=tx_input_kwh,
        consumer_total_kwh=consumer_kwh,
        timestamp=now
    )

    # Persist analysis
    analysis = EnergyAnalysis(
        transformer_id=tx.id,
        timestamp=now,
        interval_type="telemetry_stream",
        transformer_input_kwh=calc["transformer_input_kwh"],
        consumer_total_kwh=calc["consumer_total_kwh"],
        energy_difference_kwh=calc["energy_difference_kwh"],
        loss_percentage=calc["loss_percentage"],
        expected_technical_loss_kwh=calc["expected_technical_loss_kwh"],
        unexplained_loss_kwh=calc["unexplained_loss_kwh"],
        is_peak_hour=calc["is_peak_hour"],
        is_anomaly=calc["is_anomaly"],
        anomaly_reason=calc["anomaly_reason"]
    )
    db.add(analysis)
    db.flush()

    if calc["is_anomaly"]:
        alert = Alert(
            transformer_id=tx.id,
            analysis_id=analysis.id,
            title=f"Live Anomaly Stream on {tx.name}",
            severity=calc["anomaly_severity"],
            status=AlertStatus.OPEN,
            loss_percentage=calc["loss_percentage"],
            energy_difference_kwh=calc["energy_difference_kwh"],
            is_peak_hour=calc["is_peak_hour"],
            description=f"Wireless alert from ESP32 edge node: CT1={payload.current_ct1_input_a}A, CT2={payload.current_ct2_consumer_a}A. Loss: {calc['loss_percentage']}%"
        )
        db.add(alert)

    db.commit()

    entry = {
        "timestamp": now.strftime("%H:%M:%S"),
        "transformer_code": payload.transformer_code,
        "current_ct1": payload.current_ct1_input_a,
        "current_ct2": payload.current_ct2_consumer_a,
        "voltage": payload.voltage_v,
        "loss_pct": calc["loss_percentage"],
        "is_peak": calc["is_peak_hour"],
        "is_anomaly": calc["is_anomaly"]
    }
    _live_buffer.insert(0, entry)
    if len(_live_buffer) > 50:
        _live_buffer.pop()

    return {"status": "ingested", "loss_percentage": calc["loss_percentage"], "is_anomaly": calc["is_anomaly"]}

@router.get("/live-feed")
def get_live_stream_feed():
    return _live_buffer
