from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Boolean, String
from sqlalchemy.orm import relationship
from app.db.session import Base

class TransformerReading(Base):
    __tablename__ = "transformer_readings"

    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(Integer, ForeignKey("transformers.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    energy_kwh = Column(Float, nullable=False) # Total input reading for this interval
    voltage_v = Column(Float, nullable=True, default=415.0)
    current_a = Column(Float, nullable=True)
    power_factor = Column(Float, nullable=True, default=0.92)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transformer = relationship("Transformer", back_populates="readings")

class ConsumerReading(Base):
    __tablename__ = "consumer_readings"

    id = Column(Integer, primary_key=True, index=True)
    consumer_id = Column(Integer, ForeignKey("consumers.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    energy_kwh = Column(Float, nullable=False) # Consumed energy for this interval
    voltage_v = Column(Float, nullable=True, default=230.0)
    power_factor = Column(Float, nullable=True, default=0.95)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    consumer = relationship("Consumer", back_populates="readings")

class EnergyAnalysis(Base):
    __tablename__ = "energy_analyses"

    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(Integer, ForeignKey("transformers.id"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True) # Time slot analyzed
    interval_type = Column(String(32), default="hourly") # hourly, daily
    
    # Mathematical core:
    # Energy difference = Transformer input energy - Total consumer energy
    # Energy difference percentage = (Energy difference / Transformer input energy) * 100
    transformer_input_kwh = Column(Float, nullable=False)
    consumer_total_kwh = Column(Float, nullable=False)
    energy_difference_kwh = Column(Float, nullable=False)
    loss_percentage = Column(Float, nullable=False)
    
    # Loss Categorization
    expected_technical_loss_kwh = Column(Float, default=0.0)
    unexplained_loss_kwh = Column(Float, default=0.0)

    # Anomaly flags
    is_peak_hour = Column(Boolean, default=False) # Peak between 19:00 and 22:00
    is_anomaly = Column(Boolean, default=False)
    anomaly_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transformer = relationship("Transformer", back_populates="analyses")
    alerts = relationship("Alert", back_populates="analysis", cascade="all, delete-orphan")
