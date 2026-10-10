from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.db.session import get_db
from app.models.reading import EnergyAnalysis
from app.models.transformer import Transformer
from app.models.alert import Alert, AlertStatus
from app.schemas.analysis import DashboardSummary

router = APIRouter(prefix="/analytics", tags=["Energy Analytics & Dashboard"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    transformer_id: Optional[int] = None,
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db)
):
    query = db.query(EnergyAnalysis)
    if transformer_id:
        query = query.filter(EnergyAnalysis.transformer_id == transformer_id)
    
    # Calculate totals
    analyses = query.all()
    if not analyses:
        return {
            "period": f"Last {days} days",
            "total_transformer_input_kwh": 0.0,
            "total_consumer_energy_kwh": 0.0,
            "total_energy_difference_kwh": 0.0,
            "average_loss_percentage": 0.0,
            "technical_loss_kwh": 0.0,
            "unexplained_loss_kwh": 0.0,
            "peak_hour_loss_percentage": 0.0,
            "total_transformers_monitored": db.query(Transformer).count(),
            "active_anomalies_count": 0,
            "high_loss_transformers_count": 0
        }

    total_in = sum(a.transformer_input_kwh for a in analyses)
    total_out = sum(a.consumer_total_kwh for a in analyses)
    total_diff = sum(a.energy_difference_kwh for a in analyses)
    tech_loss = sum(a.expected_technical_loss_kwh for a in analyses)
    unexplained = sum(a.unexplained_loss_kwh for a in analyses)
    avg_loss_pct = round((total_diff / total_in * 100.0), 2) if total_in > 0 else 0.0

    # Peak hour analysis
    peak_analyses = [a for a in analyses if a.is_peak_hour]
    peak_in = sum(a.transformer_input_kwh for a in peak_analyses)
    peak_diff = sum(a.energy_difference_kwh for a in peak_analyses)
    peak_loss_pct = round((peak_diff / peak_in * 100.0), 2) if peak_in > 0 else 0.0

    active_anomalies = db.query(Alert).filter(Alert.status.in_([AlertStatus.OPEN, AlertStatus.INVESTIGATING])).count()
    tx_count = db.query(Transformer).count()

    return {
        "period": f"Last {days} days",
        "total_transformer_input_kwh": round(total_in, 2),
        "total_consumer_energy_kwh": round(total_out, 2),
        "total_energy_difference_kwh": round(total_diff, 2),
        "average_loss_percentage": avg_loss_pct,
        "technical_loss_kwh": round(tech_loss, 2),
        "unexplained_loss_kwh": round(unexplained, 2),
        "peak_hour_loss_percentage": peak_loss_pct,
        "total_transformers_monitored": tx_count,
        "active_anomalies_count": active_anomalies,
        "high_loss_transformers_count": sum(1 for a in analyses if a.loss_percentage > 12.0)
    }

@router.get("/timeseries")
def get_analytics_timeseries(
    transformer_id: Optional[int] = None,
    limit: int = Query(default=48, ge=6, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(EnergyAnalysis)
    if transformer_id:
        query = query.filter(EnergyAnalysis.transformer_id == transformer_id)
    
    records = query.order_by(EnergyAnalysis.timestamp.asc()).limit(limit).all()
    
    chart_data = []
    for r in records:
        chart_data.append({
            "id": r.id,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M"),
            "time_label": r.timestamp.strftime("%H:%M"),
            "transformer_input_kwh": round(r.transformer_input_kwh, 2),
            "consumer_total_kwh": round(r.consumer_total_kwh, 2),
            "energy_difference_kwh": round(r.energy_difference_kwh, 2),
            "loss_percentage": round(r.loss_percentage, 2),
            "technical_loss_kwh": round(r.expected_technical_loss_kwh, 2),
            "unexplained_loss_kwh": round(r.unexplained_loss_kwh, 2),
            "is_peak_hour": r.is_peak_hour,
            "is_anomaly": r.is_anomaly
        })
    return chart_data

@router.get("/peak-hour-comparison")
def get_peak_hour_comparison(
    transformer_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EnergyAnalysis)
    if transformer_id:
        query = query.filter(EnergyAnalysis.transformer_id == transformer_id)
    analyses = query.all()

    peak = [a for a in analyses if a.is_peak_hour]
    off_peak = [a for a in analyses if not a.is_peak_hour]

    def stats(items):
        if not items:
            return {"count": 0, "avg_loss_pct": 0.0, "total_diff_kwh": 0.0, "anomalies": 0}
        total_in = sum(i.transformer_input_kwh for i in items)
        total_diff = sum(i.energy_difference_kwh for i in items)
        return {
            "count": len(items),
            "avg_loss_pct": round((total_diff / total_in * 100.0), 2) if total_in > 0 else 0.0,
            "total_diff_kwh": round(total_diff, 2),
            "anomalies": sum(1 for i in items if i.is_anomaly)
        }

    return {
        "peak_hours_window": "19:00 - 22:00 (7 PM - 10 PM)",
        "peak_stats": stats(peak),
        "off_peak_stats": stats(off_peak)
    }

@router.get("/transformer-ranking")
def get_transformer_loss_ranking(db: Session = Depends(get_db)):
    """
    Ranks transformers by average loss percentage to prioritize inspections.
    """
    transformers = db.query(Transformer).all()
    ranking = []
    
    for t in transformers:
        analyses = db.query(EnergyAnalysis).filter(EnergyAnalysis.transformer_id == t.id).all()
        if analyses:
            total_in = sum(a.transformer_input_kwh for a in analyses)
            total_diff = sum(a.energy_difference_kwh for a in analyses)
            avg_loss = round((total_diff / total_in * 100.0), 2) if total_in > 0 else 0.0
            anomaly_count = sum(1 for a in analyses if a.is_anomaly)
        else:
            avg_loss = 0.0
            anomaly_count = 0
            
        ranking.append({
            "transformer_id": t.id,
            "code": t.code,
            "name": t.name,
            "location": t.location,
            "capacity_kva": t.capacity_kva,
            "average_loss_percentage": avg_loss,
            "anomalies_detected": anomaly_count,
            "status": t.status
        })
    
    ranking.sort(key=lambda x: x["average_loss_percentage"], reverse=True)
    return ranking
