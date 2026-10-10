from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class TransformerReadingCreate(BaseModel):
    transformer_id: int
    timestamp: datetime
    energy_kwh: float
    voltage_v: Optional[float] = 415.0
    current_a: Optional[float] = None
    power_factor: Optional[float] = 0.92

class ConsumerReadingCreate(BaseModel):
    consumer_id: int
    timestamp: datetime
    energy_kwh: float
    voltage_v: Optional[float] = 230.0
    power_factor: Optional[float] = 0.95

class ReadingUploadResponse(BaseModel):
    status: str
    filename: str
    records_processed: int
    records_failed: int
    analyses_generated: int
    anomalies_detected: int
    errors: List[str] = []

class EnergyAnalysisOut(BaseModel):
    id: int
    transformer_id: int
    timestamp: datetime
    interval_type: str
    transformer_input_kwh: float
    consumer_total_kwh: float
    energy_difference_kwh: float
    loss_percentage: float
    expected_technical_loss_kwh: float
    unexplained_loss_kwh: float
    is_peak_hour: bool
    is_anomaly: bool
    anomaly_reason: Optional[str] = None

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    period: str
    total_transformer_input_kwh: float
    total_consumer_energy_kwh: float
    total_energy_difference_kwh: float
    average_loss_percentage: float
    technical_loss_kwh: float
    unexplained_loss_kwh: float
    peak_hour_loss_percentage: float
    total_transformers_monitored: int
    active_anomalies_count: int
    high_loss_transformers_count: int
