import io
import csv
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reading import EnergyAnalysis
from app.models.transformer import Transformer

class ReportGeneratorService:
    """
    Generates daily, weekly, and monthly loss reports with CSV export capabilities.
    """

    @classmethod
    def get_summary_data(
        cls, 
        db: Session, 
        transformer_id: Optional[int] = None, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(
            EnergyAnalysis,
            Transformer.name.label("transformer_name"),
            Transformer.code.label("transformer_code"),
            Transformer.location.label("location")
        ).join(Transformer, EnergyAnalysis.transformer_id == Transformer.id)

        if transformer_id:
            query = query.filter(EnergyAnalysis.transformer_id == transformer_id)
        if start_date:
            query = query.filter(EnergyAnalysis.timestamp >= start_date)
        if end_date:
            query = query.filter(EnergyAnalysis.timestamp <= end_date)

        records = query.order_by(EnergyAnalysis.timestamp.desc()).all()
        
        result = []
        for r, tx_name, tx_code, loc in records:
            result.append({
                "id": r.id,
                "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M"),
                "transformer_code": tx_code,
                "transformer_name": tx_name,
                "location": loc,
                "input_kwh": round(r.transformer_input_kwh, 2),
                "consumer_kwh": round(r.consumer_total_kwh, 2),
                "difference_kwh": round(r.energy_difference_kwh, 2),
                "loss_percentage": round(r.loss_percentage, 2),
                "technical_loss_kwh": round(r.expected_technical_loss_kwh, 2),
                "unexplained_loss_kwh": round(r.unexplained_loss_kwh, 2),
                "is_peak_hour": "Yes" if r.is_peak_hour else "No",
                "is_anomaly": "Yes" if r.is_anomaly else "No",
                "anomaly_reason": r.anomaly_reason or "Normal"
            })
        return result

    @classmethod
    def export_csv_report(
        cls, 
        db: Session, 
        transformer_id: Optional[int] = None, 
        start_date: Optional[datetime] = None, 
        end_date: Optional[datetime] = None
    ) -> str:
        data = cls.get_summary_data(db, transformer_id, start_date, end_date)
        output = io.StringIO()
        fieldnames = [
            "timestamp", "transformer_code", "transformer_name", "location",
            "input_kwh", "consumer_kwh", "difference_kwh", "loss_percentage",
            "technical_loss_kwh", "unexplained_loss_kwh", "is_peak_hour",
            "is_anomaly", "anomaly_reason"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for row in data:
            writer.writerow(row)
        return output.getvalue()
