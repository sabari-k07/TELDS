from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class AlertStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    FIELD_INSPECTION_SCHEDULED = "FIELD_INSPECTION_SCHEDULED"
    RESOLVED = "RESOLVED"
    FALSE_ALARM = "FALSE_ALARM"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(Integer, ForeignKey("transformers.id"), nullable=False, index=True)
    analysis_id = Column(Integer, ForeignKey("energy_analyses.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.HIGH)
    status = Column(Enum(AlertStatus), default=AlertStatus.OPEN)
    
    loss_percentage = Column(Float, nullable=False)
    energy_difference_kwh = Column(Float, nullable=False)
    is_peak_hour = Column(Boolean, default=False)
    
    description = Column(Text, nullable=True)
    investigation_notes = Column(Text, nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Audit trail
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    transformer = relationship("Transformer", back_populates="alerts")
    analysis = relationship("EnergyAnalysis", back_populates="alerts")
    assigned_user = relationship("User", foreign_keys=[assigned_to_id])
