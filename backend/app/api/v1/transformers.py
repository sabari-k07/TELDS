from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.transformer import Feeder, Transformer, Consumer
from app.models.user import UserRole
from app.schemas.transformer import (
    FeederCreate, FeederOut,
    TransformerCreate, TransformerOut, TransformerDetail,
    ConsumerCreate, ConsumerOut
)
from app.api.v1.deps import get_current_user, require_role

router = APIRouter(prefix="/transformers", tags=["Transformers & Feeders"])

# Feeders
@router.get("/feeders", response_model=List[FeederOut])
def get_feeders(db: Session = Depends(get_db)):
    return db.query(Feeder).all()

@router.post("/feeders", response_model=FeederOut, status_code=status.HTTP_201_CREATED)
def create_feeder(
    feeder_in: FeederCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.ENGINEER]))
):
    existing = db.query(Feeder).filter(Feeder.code == feeder_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Feeder code already exists")
    feeder = Feeder(**feeder_in.model_dump())
    db.add(feeder)
    db.commit()
    db.refresh(feeder)
    return feeder

# Transformers
@router.get("", response_model=List[TransformerOut])
def list_transformers(
    feeder_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transformer)
    if feeder_id:
        query = query.filter(Transformer.feeder_id == feeder_id)
    transformers = query.all()

    # Enrich with consumer count
    results = []
    for t in transformers:
        c_count = db.query(func.count(Consumer.id)).filter(Consumer.transformer_id == t.id).scalar() or 0
        t_dict = {
            "id": t.id,
            "feeder_id": t.feeder_id,
            "code": t.code,
            "name": t.name,
            "location": t.location,
            "capacity_kva": t.capacity_kva,
            "rated_current_a": t.rated_current_a,
            "status": t.status,
            "created_at": t.created_at,
            "consumer_count": c_count
        }
        results.append(t_dict)
    return results

@router.get("/{transformer_id}", response_model=TransformerDetail)
def get_transformer_detail(
    transformer_id: int,
    db: Session = Depends(get_db)
):
    transformer = db.query(Transformer).filter(Transformer.id == transformer_id).first()
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    c_count = db.query(func.count(Consumer.id)).filter(Consumer.transformer_id == transformer.id).scalar() or 0
    
    return {
        "id": transformer.id,
        "feeder_id": transformer.feeder_id,
        "code": transformer.code,
        "name": transformer.name,
        "location": transformer.location,
        "capacity_kva": transformer.capacity_kva,
        "rated_current_a": transformer.rated_current_a,
        "status": transformer.status,
        "created_at": transformer.created_at,
        "consumer_count": c_count,
        "consumers": transformer.consumers,
        "feeder": transformer.feeder
    }

@router.post("", response_model=TransformerOut, status_code=status.HTTP_201_CREATED)
def create_transformer(
    t_in: TransformerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.ENGINEER]))
):
    existing = db.query(Transformer).filter(Transformer.code == t_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transformer code already exists")
    transformer = Transformer(**t_in.model_dump())
    db.add(transformer)
    db.commit()
    db.refresh(transformer)
    return {
        **transformer.__dict__,
        "consumer_count": 0
    }

# Consumers
@router.get("/{transformer_id}/consumers", response_model=List[ConsumerOut])
def get_transformer_consumers(
    transformer_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Consumer).filter(Consumer.transformer_id == transformer_id).all()

@router.post("/consumers", response_model=ConsumerOut, status_code=status.HTTP_201_CREATED)
def create_consumer(
    c_in: ConsumerCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATOR]))
):
    existing = db.query(Consumer).filter(Consumer.meter_number == c_in.meter_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Meter number already registered")
    consumer = Consumer(**c_in.model_dump())
    db.add(consumer)
    db.commit()
    db.refresh(consumer)
    return consumer
