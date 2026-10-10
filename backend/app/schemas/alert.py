from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    title: str
    severity: AlertSeverity = AlertSeverity.HIGH
    loss_percentage: float
    energy_difference_kwh: float
    is_peak_hour: bool = False
    description: Optional[str] = None

class AlertCreate(AlertBase):
    transformer_id: int
    analysis_id: Optional[int] = None

class AlertStatusUpdate(BaseModel):
    status: AlertStatus
    investigation_notes: Optional[str] = None
    assigned_to_id: Optional[int] = None

class AlertOut(AlertBase):
    id: int
    transformer_id: int
    transformer_name: Optional[str] = None
    transformer_code: Optional[str] = None
    status: AlertStatus
    investigation_notes: Optional[str] = None
    assigned_to_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
