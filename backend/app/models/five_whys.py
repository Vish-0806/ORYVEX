from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class FiveWhysStep(Base):
    __tablename__ = "five_whys_steps"

    id = Column(String(64), primary_key=True) # e.g. WHY-01
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), primary_key=True, nullable=False, index=True)
    step_order = Column(Integer, nullable=False) # 1, 2, 3, 4, 5
    why_question = Column(Text, nullable=False)
    proposed_answer = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=True)
    contradictory_evidence = Column(Text, nullable=True)
    evidence_strength = Column(String(64), default="Moderate", nullable=False) # Strong, Moderate, Speculative / Unconfirmed
    remaining_unknowns = Column(Text, nullable=True)

    investigation = relationship("Investigation", back_populates="five_whys_steps")
