from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(String(64), primary_key=True) # e.g. CAPA-01
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(64), nullable=False) # Corrective, Preventive
    description = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    related_cause_id = Column(String(64), nullable=True) # refers to RCH-XX
    required_resources = Column(Text, nullable=True)
    suggested_role = Column(String(128), nullable=True)
    suggested_timeframe = Column(String(128), nullable=True)
    effectiveness_verification = Column(Text, nullable=True)
    status = Column(String(64), default="Proposed", nullable=False) # Proposed, Accepted, In Progress, Completed, Rejected
    review_status = Column(String(64), default="Awaiting Review", nullable=False) # Awaiting Review, Approved, Needs Revision

    investigation = relationship("Investigation", back_populates="capa_actions")
