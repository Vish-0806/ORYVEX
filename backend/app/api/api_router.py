from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.rca import router as rca_router
from backend.app.api.v1.investigations import router as investigations_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(rca_router)
api_router.include_router(investigations_router)
