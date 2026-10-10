from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base

class PointType(str, enum.Enum):
    SUBSTATION_BREAKER = "SUBSTATION_BREAKER"
    SECTIONALIZER_POLE = "SECTIONALIZER_POLE"
    DISTRIBUTION_TAP = "DISTRIBUTION_TAP"
    LATERAL_BRANCH = "LATERAL_BRANCH"
    END_OF_LINE = "END_OF_LINE"

class SegmentStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    INVESTIGATION_RECOMMENDED = "INVESTIGATION_RECOMMENDED"
    SENSOR_FAULT = "SENSOR_FAULT"
    UNCERTAIN_DATA = "UNCERTAIN_DATA"

class FeederPoint(Base):
    __tablename__ = "feeder_points"

    id = Column(Integer, primary_key=True, index=True)
    feeder_id = Column(Integer, ForeignKey("feeders.id"), nullable=False)
    code = Column(String(32), index=True, nullable=False)  # P0, P1, P2, P3, P4
    name = Column(String(255), nullable=False)
    sequence_order = Column(Integer, nullable=False)  # 0, 1, 2, 3, 4
    point_type = Column(Enum(PointType), default=PointType.SECTIONALIZER_POLE)
    virtual_node_id = Column(String(64), unique=True, nullable=False)  # e.g., ESP32-NODE-P0
    pole_number = Column(String(64), nullable=True)
    nominal_voltage_v = Column(Float, default=415.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_branch = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    feeder = relationship("Feeder")
    telemetry_readings = relationship("SegmentTelemetryReading", back_populates="point", cascade="all, delete-orphan")

class FeederSegment(Base):
    __tablename__ = "feeder_segments"

    id = Column(Integer, primary_key=True, index=True)
    feeder_id = Column(Integer, ForeignKey("feeders.id"), nullable=False)
    code = Column(String(64), unique=True, index=True, nullable=False)  # SEG-P0-P1, SEG-P1-P2, etc.
    name = Column(String(255), nullable=False)
    upstream_point_id = Column(Integer, ForeignKey("feeder_points.id"), nullable=False)
    downstream_point_id = Column(Integer, ForeignKey("feeder_points.id"), nullable=False)
    length_km = Column(Float, default=1.0)
    conductor_type = Column(String(128), default="ACSR Dog 100mm²")
    line_resistance_ohms = Column(Float, default=0.27)
    expected_technical_loss_pct = Column(Float, default=2.2)  # Baseline line I²R loss allowance
    measurement_uncertainty_pct = Column(Float, default=1.5)  # Dual-sensor CT/PT combined tolerance
    configured_threshold_pct = Column(Float, default=6.0)     # Threshold to flag abnormal loss
    has_legitimate_branches = Column(Boolean, default=False)
    branch_load_ratio = Column(Float, default=0.0)            # Expected branch draw fraction
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    feeder = relationship("Feeder")
    upstream_point = relationship("FeederPoint", foreign_keys=[upstream_point_id])
    downstream_point = relationship("FeederPoint", foreign_keys=[downstream_point_id])
    analyses = relationship("SegmentLocalisationAnalysis", back_populates="segment", cascade="all, delete-orphan")

class SegmentTelemetryReading(Base):
    __tablename__ = "segment_telemetry_readings"

    id = Column(Integer, primary_key=True, index=True)
    point_id = Column(Integer, ForeignKey("feeder_points.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    v_rms = Column(Float, nullable=False)            # Volts True RMS
    i_rms = Column(Float, nullable=False)            # Amperes True RMS
    active_power_kw = Column(Float, nullable=False)  # Active power (kW)
    energy_kwh = Column(Float, nullable=False)        # Cumulative energy (kWh)
    power_factor = Column(Float, default=0.95)
    frequency_hz = Column(Float, default=50.0)
    wireless_rssi_dbm = Column(Integer, default=-65)  # Simulated WiFi / LoRa RSSI
    packet_latency_ms = Column(Integer, default=35)   # Simulated latency
    is_valid = Column(Boolean, default=True)
    error_flags = Column(String(128), nullable=True)  # SENSOR_DISCONNECTED, VOLTAGE_SAG, etc.

    point = relationship("FeederPoint", back_populates="telemetry_readings")

class SegmentLocalisationAnalysis(Base):
    __tablename__ = "segment_localisation_analyses"

    id = Column(Integer, primary_key=True, index=True)
    segment_id = Column(Integer, ForeignKey("feeder_segments.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    upstream_energy_kwh = Column(Float, nullable=False)
    downstream_energy_kwh = Column(Float, nullable=False)
    branch_energy_kwh = Column(Float, default=0.0)
    discrepancy_kwh = Column(Float, nullable=False)
    discrepancy_pct = Column(Float, nullable=False)
    technical_loss_kwh = Column(Float, default=0.0)
    unexplained_loss_kwh = Column(Float, default=0.0)
    uncertainty_band_pct = Column(Float, default=1.5)
    effective_threshold_pct = Column(Float, default=6.0)
    status = Column(Enum(SegmentStatus), default=SegmentStatus.NORMAL)
    is_suspected_abnormal = Column(Boolean, default=False)
    confidence_score = Column(Float, default=1.0)     # 0.0 to 1.0 based on sensor validity
    scenario_id = Column(String(64), nullable=True)   # NORMAL, ANOMALY_P2_P3, SENSOR_FAULT, MISSING_DATA
    remarks = Column(Text, nullable=True)

    segment = relationship("FeederSegment", back_populates="analyses")
