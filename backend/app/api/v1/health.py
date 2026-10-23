from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.db.session import get_db
from backend.app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    """
    Check application and dependency status without leaking sensitive credentials.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1;"))
    except Exception as e:
        db_status = f"unhealthy: {type(e).__name__}"

    ai_configured = bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 10)

    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "ai_engine": {
            "provider": "Groq",
            "model": settings.GROQ_MODEL,
            "configured": ai_configured
        }
    }
