from typing import TypedDict, List, Dict, Any, Optional

class RCAWorkflowState(TypedDict, total=False):
    # Inputs
    source_type: str # 'pasted_text', 'pdf', 'email'
    source_input: str # raw text
    filename: Optional[str]
    investigation_id: Optional[str]
    
    # Processed Text
    extracted_text: str
    
    # Stage 1: Structured Incident Information
    structured_incident: Dict[str, Any]
    field_provenance: Dict[str, Dict[str, Any]]
    extracted_fields: List[str]
    unknown_fields: List[str]
    extraction_summary: str
    
    # Stage 2: Evidence & Missing Information
    evidence_register: List[Dict[str, Any]]
    missing_information_list: List[str]
    contradictions: List[str]
    
    # Stage 3: Root Cause Investigation (5 Whys & Hypotheses)
    five_whys_analysis: List[Dict[str, Any]]
    root_cause_hypotheses: List[Dict[str, Any]]
    methodology_notes: str
    investigator_guidance: List[str]
    
    # Stage 4: CAPA Recommendations
    capa_recommendations: List[Dict[str, Any]]
    
    # Stage 5: Validation & Quality Control
    validation_issues: List[str]
    warnings: List[str]
    processing_status: str # 'completed', 'partial', 'failed'
    safe_error_information: Optional[str]
