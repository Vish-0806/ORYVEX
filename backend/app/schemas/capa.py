from pydantic import BaseModel, Field
from typing import Optional, Literal

class CapaActionBase(BaseModel):
    id: str = Field(..., description="Unique action identifier, e.g. CAPA-01")
    action_type: Literal["Corrective", "Preventive"] = Field(..., description="Corrective (immediate fix) or Preventive (root cause/system)")
    description: str = Field(..., description="Detailed action description")
    rationale: Optional[str] = Field(None, description="Justification and relationship to cause")
    related_cause_id: Optional[str] = Field(None, description="Linked hypothesis ID, e.g. RCH-01")
    required_resources: Optional[str] = Field(None, description="Parts, procedures, or personnel required")
    suggested_role: Optional[str] = Field(None, description="AI-suggested responsible department/role")
    suggested_timeframe: Optional[str] = Field(None, description="Suggested execution timeframe")
    effectiveness_verification: Optional[str] = Field(None, description="How effectiveness should be validated")
    status: Literal["Proposed", "Accepted", "In Progress", "Completed", "Rejected"] = "Proposed"
    review_status: Literal["Awaiting Review", "Approved", "Needs Revision"] = "Awaiting Review"

class CapaActionCreate(CapaActionBase):
    pass

class CapaActionResponse(CapaActionBase):
    investigation_id: Optional[str] = None

    class Config:
        from_attributes = True
