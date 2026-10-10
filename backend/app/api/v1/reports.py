from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.report_generator import ReportGeneratorService

router = APIRouter(prefix="/reports", tags=["Reports & Data Export"])

@router.get("/summary")
def get_report_data(
    transformer_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    return ReportGeneratorService.get_summary_data(db, transformer_id, start_date, end_date)

@router.get("/export-csv")
def download_csv_report(
    transformer_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    csv_content = ReportGeneratorService.export_csv_report(db, transformer_id, start_date, end_date)
    filename = f"TELDS_Loss_Report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
