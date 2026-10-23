from pydantic import BaseModel, Field
from typing import Optional, Literal

class EvidenceItemBase(BaseModel):
    id: str = Field(..., description="Unique evidence identifier, e.g. EVD-01")
    description: str = Field(..., description="Description of the evidence item")
    evidence_type: str = Field(..., description="Batch Record, Analytical Log, Calibration, Temperature Log, SOP, Personnel Record, Visual/Physical, Other")
    source_reference: Optional[str] = Field(None, description="Document or system citation")
    extracted_quote: Optional[str] = Field(None, description="Direct excerpt or observation")
    related_question: Optional[str] = Field(None, description="Related investigation question or hypothesis")
    evidence_status: Literal["Supplied", "Missing / Requested", "Contradictory", "Verified"] = "Supplied"
    notes: Optional[str] = Field(None, description="Investigator notes")

class EvidenceItemCreate(EvidenceItemBase):
    pass

class EvidenceItemResponse(EvidenceItemBase):
    investigation_id: Optional[str] = None

    class Config:
        from_attributes = True
