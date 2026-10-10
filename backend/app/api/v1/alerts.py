from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.alert import Alert, AlertStatus, AlertSeverity
from app.models.transformer import Transformer
from app.schemas.alert import AlertOut, AlertStatusUpdate
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/alerts", tags=["Anomaly Alerts & Investigation"])

@router.get("", response_model=List[AlertOut])
def list_alerts(
    status_filter: Optional[AlertStatus] = None,
    severity_filter: Optional[AlertSeverity] = None,
    transformer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Alert, Transformer.name.label("transformer_name"), Transformer.code.label("transformer_code"))\
              .join(Transformer, Alert.transformer_id == Transformer.id)

    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity_filter:
        query = query.filter(Alert.severity == severity_filter)
    if transformer_id:
        query = query.filter(Alert.transformer_id == transformer_id)

    results = query.order_by(Alert.created_at.desc()).all()
    
    alerts_out = []
    for alert, t_name, t_code in results:
        alert_dict = {
            "id": alert.id,
            "title": alert.title,
            "severity": alert.severity,
            "status": alert.status,
            "loss_percentage": alert.loss_percentage,
            "energy_difference_kwh": alert.energy_difference_kwh,
            "is_peak_hour": alert.is_peak_hour,
            "description": alert.description,
            "investigation_notes": alert.investigation_notes,
            "transformer_id": alert.transformer_id,
            "transformer_name": t_name,
            "transformer_code": t_code,
            "assigned_to_id": alert.assigned_to_id,
            "created_at": alert.created_at,
            "updated_at": alert.updated_at,
            "resolved_at": alert.resolved_at
        }
        alerts_out.append(alert_dict)
    return alerts_out

@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(
    alert_id: int,
    update_data: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.status = update_data.status
    if update_data.investigation_notes:
        timestamp_prefix = f"[{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} by {current_user.full_name}]: "
        existing_notes = alert.investigation_notes or ""
        alert.investigation_notes = (existing_notes + "\n" + timestamp_prefix + update_data.investigation_notes).strip()
    
    if update_data.assigned_to_id:
        alert.assigned_to_id = update_data.assigned_to_id
    
    if update_data.status in [AlertStatus.RESOLVED, AlertStatus.FALSE_ALARM]:
        alert.resolved_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(alert)

    tx = db.query(Transformer).filter(Transformer.id == alert.transformer_id).first()
    return {
        **alert.__dict__,
        "transformer_name": tx.name if tx else None,
        "transformer_code": tx.code if tx else None
    }
