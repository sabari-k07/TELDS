from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.transformers import router as transformers_router
from app.api.v1.readings import router as readings_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.reports import router as reports_router
from app.api.v1.telemetry import router as telemetry_router
from app.api.v1.segments import router as segments_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(transformers_router)
api_router.include_router(readings_router)
api_router.include_router(analytics_router)
api_router.include_router(alerts_router)
api_router.include_router(reports_router)
api_router.include_router(telemetry_router)
api_router.include_router(segments_router, prefix="/segments", tags=["Segment Localisation"])
