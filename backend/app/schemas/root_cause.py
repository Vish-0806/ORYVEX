from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class RootCauseHypothesisBase(BaseModel):
    id: str = Field(..., description="Unique hypothesis identifier, e.g. RCH-01")
    description: str = Field(..., description="Hypothesis description")
    category: Literal["Man", "Machine", "Method", "Material", "Measurement", "Environment"] = Field(..., description="Ishikawa category")
    reasoning: Optional[str] = Field(None, description="Detailed causal reasoning")
    confidence_label: Literal["Low", "Medium", "High"] = Field("Medium", description="AI assessment confidence label")
    supporting_evidence_refs: List[str] = Field(default_factory=list, description="Referenced evidence item IDs")
    contradictory_evidence_refs: List[str] = Field(default_factory=list, description="Contradicting evidence references")
    evidence_needed: Optional[str] = Field(None, description="Records or experiments required to assess this cause")
    user_confirmation_status: Literal[
        "Suggested",
        "Under investigation",
        "Supported by reviewed evidence",
        "Confirmed by qualified reviewer",
        "Rejected"
    ] = Field("Suggested", description="Human reviewer confirmation status")

class RootCauseHypothesisCreate(RootCauseHypothesisBase):
    pass

class RootCauseHypothesisResponse(RootCauseHypothesisBase):
    investigation_id: Optional[str] = None

    class Config:
        from_attributes = True
