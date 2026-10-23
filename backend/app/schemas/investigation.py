from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from backend.app.schemas.evidence import EvidenceItemResponse, EvidenceItemCreate
from backend.app.schemas.five_whys import FiveWhysStepResponse, FiveWhysStepCreate
from backend.app.schemas.root_cause import RootCauseHypothesisResponse, RootCauseHypothesisCreate
from backend.app.schemas.capa import CapaActionResponse, CapaActionCreate
from backend.app.schemas.copilot import CopilotMessageResponse

class InvestigationBase(BaseModel):
    title: str = Field(..., description="Investigation title")
    status: str = Field("Draft", description="Draft, Information extracted, Investigation in progress, Awaiting qualified review, Review completed")
    department: Optional[str] = None
    investigation_owner: Optional[str] = None
    source_type: str = Field("pasted_text", description="pdf, pasted_text, email")
    source_preview: Optional[str] = None
    
    # Dates
    incident_date: Optional[str] = None
    date_discovered: Optional[str] = None
    
    # Product & Manufacturing Context
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    equipment_id: Optional[str] = None
    affected_quantity: Optional[str] = None
    process_parameters: Optional[Any] = None
    raw_materials: Optional[Any] = None
    
    # Incident Description
    incident_summary: Optional[str] = None
    detailed_description: Optional[str] = None
    expected_result: Optional[str] = None
    observed_result: Optional[str] = None
    immediate_containment: Optional[str] = None
    potential_impact: Optional[str] = None
    initial_severity: Optional[str] = None
    severity_rationale: Optional[str] = None
    
    # Review & Qualified Oversight
    reviewer_name: Optional[str] = None
    reviewer_role: Optional[str] = None
    review_notes: Optional[str] = None
    confirmation_status: str = Field("Pending Review", description="Pending Review, Reviewed and Confirmed, Revisions Requested")
    
    field_provenance: Optional[Dict[str, Any]] = Field(default_factory=dict)

class InvestigationCreate(InvestigationBase):
    id: Optional[str] = None
    evidence_items: Optional[List[EvidenceItemCreate]] = Field(default_factory=list)
    five_whys_steps: Optional[List[FiveWhysStepCreate]] = Field(default_factory=list)
    root_cause_hypotheses: Optional[List[RootCauseHypothesisCreate]] = Field(default_factory=list)
    capa_actions: Optional[List[CapaActionCreate]] = Field(default_factory=list)

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    department: Optional[str] = None
    investigation_owner: Optional[str] = None
    source_type: Optional[str] = None
    source_preview: Optional[str] = None
    
    incident_date: Optional[str] = None
    date_discovered: Optional[str] = None
    
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    equipment_id: Optional[str] = None
    affected_quantity: Optional[str] = None
    process_parameters: Optional[Any] = None
    raw_materials: Optional[Any] = None
    
    incident_summary: Optional[str] = None
    detailed_description: Optional[str] = None
    expected_result: Optional[str] = None
    observed_result: Optional[str] = None
    immediate_containment: Optional[str] = None
    potential_impact: Optional[str] = None
    initial_severity: Optional[str] = None
    severity_rationale: Optional[str] = None
    
    reviewer_name: Optional[str] = None
    reviewer_role: Optional[str] = None
    review_notes: Optional[str] = None
    confirmation_status: Optional[str] = None
    
    field_provenance: Optional[Dict[str, Any]] = None
    
    evidence_items: Optional[List[EvidenceItemCreate]] = None
    five_whys_steps: Optional[List[FiveWhysStepCreate]] = None
    root_cause_hypotheses: Optional[List[RootCauseHypothesisCreate]] = None
    capa_actions: Optional[List[CapaActionCreate]] = None

class InvestigationResponse(InvestigationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    evidence_items: List[EvidenceItemResponse] = Field(default_factory=list)
    five_whys_steps: List[FiveWhysStepResponse] = Field(default_factory=list)
    root_cause_hypotheses: List[RootCauseHypothesisResponse] = Field(default_factory=list)
    capa_actions: List[CapaActionResponse] = Field(default_factory=list)
    copilot_messages: List[CopilotMessageResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class InvestigationListItem(BaseModel):
    id: str
    title: str
    status: str
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    initial_severity: Optional[str] = None
    confirmation_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
