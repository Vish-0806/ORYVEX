from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from backend.app.schemas.evidence import EvidenceItemBase
from backend.app.schemas.five_whys import FiveWhysStepBase
from backend.app.schemas.root_cause import RootCauseHypothesisBase
from backend.app.schemas.capa import CapaActionBase

class ExtractRequest(BaseModel):
    source_text: str = Field(..., description="Pasted incident text or extracted PDF text")
    source_type: Literal["pasted_text", "pdf", "email"] = "pasted_text"
    filename: Optional[str] = None

class ExtractResponse(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    investigation_owner: Optional[str] = None
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
    
    # Extraction analysis metadata
    extracted_fields: List[str] = Field(default_factory=list)
    unknown_fields: List[str] = Field(default_factory=list)
    field_provenance: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    initial_evidence: List[EvidenceItemBase] = Field(default_factory=list)
    missing_evidence_notices: List[str] = Field(default_factory=list)
    extraction_summary: str
    warnings: List[str] = Field(default_factory=list)

class AnalyzeRequest(BaseModel):
    investigation_id: Optional[str] = None
    incident_data: Dict[str, Any] = Field(..., description="Current RCA form state")
    evidence_items: List[EvidenceItemBase] = Field(default_factory=list)
    focal_question: Optional[str] = None

class AnalyzeResponse(BaseModel):
    five_whys_steps: List[FiveWhysStepBase] = Field(default_factory=list)
    root_cause_hypotheses: List[RootCauseHypothesisBase] = Field(default_factory=list)
    evidence_gaps: List[EvidenceItemBase] = Field(default_factory=list, description="Recommended missing evidence records")
    capa_recommendations: List[CapaActionBase] = Field(default_factory=list)
    methodology_notes: str
    investigator_guidance: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class ChatMessagePayload(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    investigation_id: Optional[str] = None
    message: str = Field(..., description="User message or instruction")
    current_form_state: Dict[str, Any] = Field(..., description="Current front-end form state to protect edits and contextualize")
    conversation_history: List[ChatMessagePayload] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    intent: Literal["question", "field_update", "analyze_request", "capa_request", "clarification_needed"]
    patch: Optional[Dict[str, Any]] = Field(None, description="Structured fields to update in form")
    modified_fields: List[str] = Field(default_factory=list)
    clarification: Optional[str] = None
    suggested_actions: List[str] = Field(default_factory=list)
