from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from app.models.transformer import EquipmentStatus

class FeederBase(BaseModel):
    code: str
    name: str
    substation: str
    voltage_kv: float = 11.0
    status: EquipmentStatus = EquipmentStatus.ACTIVE

class FeederCreate(FeederBase):
    pass

class FeederOut(FeederBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConsumerBase(BaseModel):
    consumer_number: str
    meter_number: str
    name: str
    category: str = "Residential"
    connection_phase: str = "3-Phase"
    sanctioned_load_kw: float = 5.0

class ConsumerCreate(ConsumerBase):
    transformer_id: int

class ConsumerOut(ConsumerBase):
    id: int
    transformer_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TransformerBase(BaseModel):
    code: str
    name: str
    location: str
    capacity_kva: float
    rated_current_a: Optional[float] = None
    status: EquipmentStatus = EquipmentStatus.ACTIVE
    feeder_id: Optional[int] = None

class TransformerCreate(TransformerBase):
    pass

class TransformerOut(TransformerBase):
    id: int
    created_at: datetime
    consumer_count: Optional[int] = 0

    class Config:
        from_attributes = True

class TransformerDetail(TransformerOut):
    consumers: List[ConsumerOut] = []
    feeder: Optional[FeederOut] = None
