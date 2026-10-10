from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class EquipmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    MAINTENANCE = "MAINTENANCE"
    INACTIVE = "INACTIVE"

class Feeder(Base):
    __tablename__ = "feeders"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    substation = Column(String(255), nullable=False)
    voltage_kv = Column(Float, default=11.0)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transformers = relationship("Transformer", back_populates="feeder", cascade="all, delete-orphan")

class Transformer(Base):
    __tablename__ = "transformers"

    id = Column(Integer, primary_key=True, index=True)
    feeder_id = Column(Integer, ForeignKey("feeders.id"), nullable=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    capacity_kva = Column(Float, nullable=False) # e.g. 250.0 kVA
    rated_current_a = Column(Float, nullable=True)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.ACTIVE)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    feeder = relationship("Feeder", back_populates="transformers")
    consumers = relationship("Consumer", back_populates="transformer", cascade="all, delete-orphan")
    readings = relationship("TransformerReading", back_populates="transformer", cascade="all, delete-orphan")
    analyses = relationship("EnergyAnalysis", back_populates="transformer", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="transformer", cascade="all, delete-orphan")

class Consumer(Base):
    __tablename__ = "consumers"

    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(Integer, ForeignKey("transformers.id"), nullable=False)
    consumer_number = Column(String(64), unique=True, index=True, nullable=False)
    meter_number = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(64), default="Residential") # Residential, Commercial, Industrial, Agricultural
    connection_phase = Column(String(16), default="3-Phase")
    sanctioned_load_kw = Column(Float, default=5.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    transformer = relationship("Transformer", back_populates="consumers")
    readings = relationship("ConsumerReading", back_populates="consumer", cascade="all, delete-orphan")
