from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class RootCauseHypothesis(Base):
    __tablename__ = "root_cause_hypotheses"

    id = Column(String(64), primary_key=True) # e.g. RCH-01
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(64), nullable=False) # Man, Machine, Method, Material, Measurement, Environment
    reasoning = Column(Text, nullable=True)
    confidence_label = Column(String(64), default="Medium", nullable=False) # Low, Medium, High (Explicitly marked as AI assessment)
    supporting_evidence_refs = Column(JSON, default=list, nullable=False) # list of evidence IDs
    contradictory_evidence_refs = Column(JSON, default=list, nullable=False)
    evidence_needed = Column(Text, nullable=True)
    user_confirmation_status = Column(String(64), default="Suggested", nullable=False) # Suggested, Under investigation, Supported by reviewed evidence, Confirmed by qualified reviewer, Rejected

    investigation = relationship("Investigation", back_populates="root_cause_hypotheses")
