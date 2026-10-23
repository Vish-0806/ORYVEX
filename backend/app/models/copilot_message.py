from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.db.session import Base

class CopilotMessage(Base):
    __tablename__ = "copilot_messages"

    id = Column(String(64), primary_key=True)
    investigation_id = Column(String(64), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    message_metadata = Column(JSON, nullable=True) # e.g. suggested_patches, tool_invocations, warnings

    investigation = relationship("Investigation", back_populates="copilot_messages")
