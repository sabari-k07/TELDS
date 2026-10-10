from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.analysis import ReadingUploadResponse
from app.services.csv_processor import CSVProcessorService
from app.models.user import UserRole
from app.api.v1.deps import require_role

router = APIRouter(prefix="/readings", tags=["Meter Readings & Ingestion"])

@router.post("/upload", response_model=ReadingUploadResponse)
async def upload_meter_readings_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role([UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATOR]))
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a standard CSV file."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        result = CSVProcessorService.process_combined_readings_csv(
            file_content=content,
            db=db
        )
        return {
            "status": "success",
            "filename": file.filename,
            "records_processed": result["records_processed"],
            "records_failed": result["records_failed"],
            "analyses_generated": result["analyses_generated"],
            "anomalies_detected": result["anomalies_detected"],
            "errors": result["errors"]
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to process CSV: {str(e)}")
