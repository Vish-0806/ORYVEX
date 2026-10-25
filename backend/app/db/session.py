from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings
import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    try:
        from backend.app.models.investigation import Investigation
        from backend.app.models.evidence import EvidenceItem
        from backend.app.models.five_whys import FiveWhysStep
        from backend.app.models.root_cause import RootCauseHypothesis
        from backend.app.models.capa import CapaAction
        from backend.app.models.copilot_message import CopilotMessage
        Base.metadata.create_all(bind=engine)

        # Ensure composite primary keys (investigation_id, id) for child tables
        from sqlalchemy import text
        child_tables = [
            'evidence_items',
            'five_whys_steps',
            'root_cause_hypotheses',
            'capa_actions',
            'copilot_messages'
        ]
        with engine.begin() as conn:
            for tbl in child_tables:
                col_count = conn.execute(text(f"""
                    SELECT array_length(conkey, 1)
                    FROM pg_constraint
                    WHERE conname = '{tbl}_pkey'
                      AND conrelid = '{tbl}'::regclass
                """)).scalar()
                if col_count == 1:
                    conn.execute(text(f"ALTER TABLE {tbl} DROP CONSTRAINT {tbl}_pkey;"))
                    conn.execute(text(f"ALTER TABLE {tbl} ADD CONSTRAINT {tbl}_pkey PRIMARY KEY (investigation_id, id);"))

        logger.info("Database tables and composite primary keys verified successfully.")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database tables: {e}")
        return False
