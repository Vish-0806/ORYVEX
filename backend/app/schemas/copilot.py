from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class CopilotMessageBase(BaseModel):
    role: str = Field(..., description="user, assistant, or system")
    content: str = Field(..., description="Message text")
    message_metadata: Optional[Dict[str, Any]] = Field(None, description="Structured payload or patch metadata")

class CopilotMessageCreate(CopilotMessageBase):
    id: Optional[str] = None
    investigation_id: Optional[str] = None

class CopilotMessageResponse(CopilotMessageBase):
    id: str
    investigation_id: str
    created_at: datetime

    class Config:
        from_attributes = True
