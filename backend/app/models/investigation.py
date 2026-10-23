from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.db.session import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(64), default="Draft", nullable=False) # Draft, Information extracted, Investigation in progress, Awaiting qualified review, Review completed
    department = Column(String(128), nullable=True)
    investigation_owner = Column(String(128), nullable=True)
    source_type = Column(String(64), default="pasted_text", nullable=False) # pdf, pasted_text, email
    source_preview = Column(Text, nullable=True)
    
    # Dates
    incident_date = Column(String(64), nullable=True)
    date_discovered = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Product & Manufacturing Context
    product_name = Column(String(255), nullable=True)
    batch_number = Column(String(128), nullable=True)
    manufacturing_stage = Column(String(128), nullable=True)
    equipment_id = Column(String(128), nullable=True)
    affected_quantity = Column(String(128), nullable=True)
    process_parameters = Column(JSON, nullable=True) # list or dict of parameters
    raw_materials = Column(JSON, nullable=True) # list or dict of materials
    
    # Incident Description
    incident_summary = Column(Text, nullable=True)
    detailed_description = Column(Text, nullable=True)
    expected_result = Column(Text, nullable=True)
    observed_result = Column(Text, nullable=True)
    immediate_containment = Column(Text, nullable=True)
    potential_impact = Column(Text, nullable=True)
    initial_severity = Column(String(64), nullable=True) # Minor, Major, Critical
    severity_rationale = Column(Text, nullable=True)
    
    # Review & Qualified Oversight
    reviewer_name = Column(String(128), nullable=True)
    reviewer_role = Column(String(128), nullable=True)
    review_notes = Column(Text, nullable=True)
    confirmation_status = Column(String(64), default="Pending Review", nullable=False) # Pending Review, Reviewed and Confirmed, Revisions Requested
    
    # Field Provenance Tracking (JSON map of field -> {source: 'extracted' | 'user_edit' | 'ai_suggested', excerpt: str})
    field_provenance = Column(JSON, default=dict, nullable=False)

    # Relationships
    evidence_items = relationship("EvidenceItem", back_populates="investigation", cascade="all, delete-orphan", order_by="EvidenceItem.id")
    five_whys_steps = relationship("FiveWhysStep", back_populates="investigation", cascade="all, delete-orphan", order_by="FiveWhysStep.step_order")
    root_cause_hypotheses = relationship("RootCauseHypothesis", back_populates="investigation", cascade="all, delete-orphan", order_by="RootCauseHypothesis.id")
    capa_actions = relationship("CapaAction", back_populates="investigation", cascade="all, delete-orphan", order_by="CapaAction.id")
    copilot_messages = relationship("CopilotMessage", back_populates="investigation", cascade="all, delete-orphan", order_by="CopilotMessage.created_at")
