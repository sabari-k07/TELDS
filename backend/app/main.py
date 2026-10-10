from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.api.v1.router import api_router
from app.models.user import User, UserRole
from app.models.transformer import Feeder, Transformer, Consumer, EquipmentStatus
from app.core.security import get_password_hash

# Ensure tables are created
Base.metadata.create_all(bind=engine)

def seed_initial_data():
    """
    Auto-seeds realistic baseline users, feeders, transformers and consumers
    if the database is fresh, providing immediate out-of-the-box readiness.
    """
    db = SessionLocal()
    try:
        # Check if users exist
        if db.query(User).count() == 0:
            default_users = [
                User(
                    email="admin@telds.gov",
                    full_name="Chief Grid Administrator",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    is_active=True
                ),
                User(
                    email="engineer@telds.gov",
                    full_name="Rajesh Kumar (Senior Distribution Engineer)",
                    hashed_password=get_password_hash("engineer123"),
                    role=UserRole.ENGINEER,
                    is_active=True
                ),
                User(
                    email="operator@telds.gov",
                    full_name="Priya Sharma (Substation Operator)",
                    hashed_password=get_password_hash("operator123"),
                    role=UserRole.OPERATOR,
                    is_active=True
                ),
                User(
                    email="inspector@telds.gov",
                    full_name="Amit Patel (Field Inspection Lead)",
                    hashed_password=get_password_hash("inspector123"),
                    role=UserRole.FIELD_INSPECTOR,
                    is_active=True
                )
            ]
            db.add_all(default_users)
            db.commit()

        # Check if feeders exist
        if db.query(Feeder).count() == 0:
            f1 = Feeder(code="FDR-11KV-01", name="North Industrial Feeder", substation="Central 66/11kV Substation", voltage_kv=11.0)
            f2 = Feeder(code="FDR-11KV-02", name="Metro Commercial Feeder", substation="Central 66/11kV Substation", voltage_kv=11.0)
            f3 = Feeder(code="FDR-11KV-03", name="East Suburban Feeder", substation="Suburban 33/11kV Substation", voltage_kv=11.0)
            db.add_all([f1, f2, f3])
            db.commit()

            # Transformers
            t1 = Transformer(
                feeder_id=f1.id,
                code="TX-IND-101",
                name="Distribution Transformer 101 (Sector 4)",
                location="Sector 4 Industrial Area, Pole #42",
                capacity_kva=500.0,
                rated_current_a=695.0,
                status=EquipmentStatus.ACTIVE
            )
            t2 = Transformer(
                feeder_id=f2.id,
                code="TX-COM-204",
                name="Commercial Transformer 204 (Mall Complex)",
                location="City Center Road, Substation Yard 3",
                capacity_kva=315.0,
                rated_current_a=438.0,
                status=EquipmentStatus.ACTIVE
            )
            t3 = Transformer(
                feeder_id=f3.id,
                code="TX-RES-308",
                name="Residential DT 308 (Green Park)",
                location="Green Park Colony, Ring Road Junction",
                capacity_kva=250.0,
                rated_current_a=347.0,
                status=EquipmentStatus.ACTIVE
            )
            db.add_all([t1, t2, t3])
            db.commit()

            # Consumers for TX-RES-308
            consumers = [
                Consumer(transformer_id=t3.id, consumer_number="CON-1001", meter_number="MTR-8801", name="Aarav Sharma", category="Residential", sanctioned_load_kw=4.0),
                Consumer(transformer_id=t3.id, consumer_number="CON-1002", meter_number="MTR-8802", name="Deepak Varma", category="Residential", sanctioned_load_kw=5.0),
                Consumer(transformer_id=t3.id, consumer_number="CON-1003", meter_number="MTR-8803", name="Ananya Reddy", category="Residential", sanctioned_load_kw=6.0),
                Consumer(transformer_id=t3.id, consumer_number="CON-1004", meter_number="MTR-8804", name="Sunita Rao", category="Residential", sanctioned_load_kw=3.5),
                Consumer(transformer_id=t3.id, consumer_number="CON-1005", meter_number="MTR-8805", name="Kavita Nair", category="Residential", sanctioned_load_kw=5.0)
            ]
            db.add_all(consumers)
            db.commit()
    except Exception as e:
        print(f"Seed note: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    seed_initial_data()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Software-based Energy Monitoring & Analytics Platform for Transformer Loss Detection",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
