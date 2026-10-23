from pydantic import BaseModel, Field
from typing import Optional, Literal

class FiveWhysStepBase(BaseModel):
    id: str = Field(..., description="Unique step identifier, e.g. WHY-01")
    step_order: int = Field(..., description="Order of the why step (1-5)")
    why_question: str = Field(..., description="Targeted why question")
    proposed_answer: str = Field(..., description="Plausible answer based on evidence")
    supporting_evidence: Optional[str] = Field(None, description="Observed facts or document citations")
    contradictory_evidence: Optional[str] = Field(None, description="Conflicting evidence or uncertainty")
    evidence_strength: Literal["Strong", "Moderate", "Speculative / Unconfirmed"] = "Moderate"
    remaining_unknowns: Optional[str] = Field(None, description="Gaps preventing deeper causal certainty")

class FiveWhysStepCreate(FiveWhysStepBase):
    pass

class FiveWhysStepResponse(FiveWhysStepBase):
    investigation_id: Optional[str] = None

    class Config:
        from_attributes = True
