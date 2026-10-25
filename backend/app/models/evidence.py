from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String(64), primary_key=True) # e.g. EVD-01
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), primary_key=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    evidence_type = Column(String(128), nullable=False) # Batch Record, Analytical Log, Calibration, Temperature Log, SOP, Personnel Record, Visual/Physical, Other
    source_reference = Column(String(255), nullable=True) # e.g. BMR Page 14, QC Certificate
    extracted_quote = Column(Text, nullable=True)
    related_question = Column(Text, nullable=True)
    evidence_status = Column(String(64), default="Supplied", nullable=False) # Supplied, Missing / Requested, Contradictory, Verified
    notes = Column(Text, nullable=True)

    investigation = relationship("Investigation", back_populates="evidence_items")
