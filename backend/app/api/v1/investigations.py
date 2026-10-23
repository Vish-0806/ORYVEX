import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from backend.app.db.session import get_db
from backend.app.models.investigation import Investigation
from backend.app.models.evidence import EvidenceItem
from backend.app.models.five_whys import FiveWhysStep
from backend.app.models.root_cause import RootCauseHypothesis
from backend.app.models.capa import CapaAction
from backend.app.schemas.investigation import (
    InvestigationCreate, InvestigationUpdate, InvestigationResponse, InvestigationListItem
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/investigations", tags=["Investigation Persistence"])

def generate_investigation_id(db: Session) -> str:
    """Generate safe, sequential RCA-YYYY-XXX identifier."""
    year = datetime.now().year
    count = db.query(Investigation).filter(Investigation.id.like(f"RCA-{year}-%")).count()
    return f"RCA-{year}-{count + 1:03d}"

@router.post("", response_model=InvestigationResponse, status_code=201)
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    """
    Persist a new RCA investigation and all associated child entities in PostgreSQL.
    """
    investigation_id = payload.id if payload.id and not payload.id.startswith("TEMP-") else generate_investigation_id(db)
    
    # Check if exists
    existing = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if existing:
        investigation_id = f"RCA-{datetime.now().year}-{uuid.uuid4().hex[:4].upper()}"

    db_investigation = Investigation(
        id=investigation_id,
        title=payload.title,
        status=payload.status,
        department=payload.department,
        investigation_owner=payload.investigation_owner,
        source_type=payload.source_type,
        source_preview=payload.source_preview,
        incident_date=payload.incident_date,
        date_discovered=payload.date_discovered,
        product_name=payload.product_name,
        batch_number=payload.batch_number,
        manufacturing_stage=payload.manufacturing_stage,
        equipment_id=payload.equipment_id,
        affected_quantity=payload.affected_quantity,
        process_parameters=payload.process_parameters,
        raw_materials=payload.raw_materials,
        incident_summary=payload.incident_summary,
        detailed_description=payload.detailed_description,
        expected_result=payload.expected_result,
        observed_result=payload.observed_result,
        immediate_containment=payload.immediate_containment,
        potential_impact=payload.potential_impact,
        initial_severity=payload.initial_severity,
        severity_rationale=payload.severity_rationale,
        reviewer_name=payload.reviewer_name,
        reviewer_role=payload.reviewer_role,
        review_notes=payload.review_notes,
        confirmation_status=payload.confirmation_status,
        field_provenance=payload.field_provenance or {}
    )

    db.add(db_investigation)

    # Add Evidence Items
    for idx, evd in enumerate(payload.evidence_items or []):
        db_evd = EvidenceItem(
            id=evd.id or f"EVD-{idx + 1:02d}",
            investigation_id=investigation_id,
            description=evd.description,
            evidence_type=evd.evidence_type,
            source_reference=evd.source_reference,
            extracted_quote=evd.extracted_quote,
            related_question=evd.related_question,
            evidence_status=evd.evidence_status,
            notes=evd.notes
        )
        db.add(db_evd)

    # Add 5 Whys Steps
    for idx, step in enumerate(payload.five_whys_steps or []):
        db_step = FiveWhysStep(
            id=step.id or f"WHY-{idx + 1:02d}",
            investigation_id=investigation_id,
            step_order=step.step_order or (idx + 1),
            why_question=step.why_question,
            proposed_answer=step.proposed_answer,
            supporting_evidence=step.supporting_evidence,
            contradictory_evidence=step.contradictory_evidence,
            evidence_strength=step.evidence_strength,
            remaining_unknowns=step.remaining_unknowns
        )
        db.add(db_step)

    # Add Root Cause Hypotheses
    for idx, hyp in enumerate(payload.root_cause_hypotheses or []):
        db_hyp = RootCauseHypothesis(
            id=hyp.id or f"RCH-{idx + 1:02d}",
            investigation_id=investigation_id,
            description=hyp.description,
            category=hyp.category,
            reasoning=hyp.reasoning,
            confidence_label=hyp.confidence_label,
            supporting_evidence_refs=hyp.supporting_evidence_refs or [],
            contradictory_evidence_refs=hyp.contradictory_evidence_refs or [],
            evidence_needed=hyp.evidence_needed,
            user_confirmation_status=hyp.user_confirmation_status
        )
        db.add(db_hyp)

    # Add CAPA Actions
    for idx, capa in enumerate(payload.capa_actions or []):
        db_capa = CapaAction(
            id=capa.id or f"CAPA-{idx + 1:02d}",
            investigation_id=investigation_id,
            action_type=capa.action_type,
            description=capa.description,
            rationale=capa.rationale,
            related_cause_id=capa.related_cause_id,
            required_resources=capa.required_resources,
            suggested_role=capa.suggested_role,
            suggested_timeframe=capa.suggested_timeframe,
            effectiveness_verification=capa.effectiveness_verification,
            status=capa.status,
            review_status=capa.review_status
        )
        db.add(db_capa)

    try:
        db.commit()
        db.refresh(db_investigation)
        return db_investigation
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to persist investigation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database save error: {str(e)}")

@router.get("", response_model=List[InvestigationListItem])
def list_investigations(
    search: Optional[str] = Query(None, description="Search by title, batch, or product"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    List persisted investigations with optional search and filtering.
    """
    query = db.query(Investigation)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Investigation.title.ilike(term),
                Investigation.batch_number.ilike(term),
                Investigation.product_name.ilike(term),
                Investigation.id.ilike(term)
            )
        )

    if status and status.strip():
        query = query.filter(Investigation.status == status.strip())

    items = query.order_by(desc(Investigation.updated_at)).all()
    return items

@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(investigation_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full investigation details including evidence, 5 Whys, root causes, and CAPAs.
    """
    item = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found.")
    return item

@router.put("/{investigation_id}", response_model=InvestigationResponse)
def update_investigation(investigation_id: str, payload: InvestigationUpdate, db: Session = Depends(get_db)):
    """
    Update an existing investigation, replacing or updating child collections transactionally.
    """
    item = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not item:
        raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found.")

    update_data = payload.dict(exclude_unset=True)

    # Separate children from parent fields
    evidence_items = update_data.pop("evidence_items", None)
    five_whys_steps = update_data.pop("five_whys_steps", None)
    root_cause_hypotheses = update_data.pop("root_cause_hypotheses", None)
    capa_actions = update_data.pop("capa_actions", None)

    for key, value in update_data.items():
        setattr(item, key, value)
    
    item.updated_at = datetime.now(timezone.utc)

    # Replace Evidence if provided
    if evidence_items is not None:
        db.query(EvidenceItem).filter(EvidenceItem.investigation_id == investigation_id).delete()
        for idx, evd in enumerate(evidence_items):
            db.add(EvidenceItem(
                id=evd.get("id") or f"EVD-{idx + 1:02d}",
                investigation_id=investigation_id,
                description=evd.get("description", ""),
                evidence_type=evd.get("evidence_type", "Other"),
                source_reference=evd.get("source_reference"),
                extracted_quote=evd.get("extracted_quote"),
                related_question=evd.get("related_question"),
                evidence_status=evd.get("evidence_status", "Supplied"),
                notes=evd.get("notes")
            ))

    # Replace 5 Whys if provided
    if five_whys_steps is not None:
        db.query(FiveWhysStep).filter(FiveWhysStep.investigation_id == investigation_id).delete()
        for idx, step in enumerate(five_whys_steps):
            db.add(FiveWhysStep(
                id=step.get("id") or f"WHY-{idx + 1:02d}",
                investigation_id=investigation_id,
                step_order=step.get("step_order") or (idx + 1),
                why_question=step.get("why_question", ""),
                proposed_answer=step.get("proposed_answer", ""),
                supporting_evidence=step.get("supporting_evidence"),
                contradictory_evidence=step.get("contradictory_evidence"),
                evidence_strength=step.get("evidence_strength", "Moderate"),
                remaining_unknowns=step.get("remaining_unknowns")
            ))

    # Replace Root Causes if provided
    if root_cause_hypotheses is not None:
        db.query(RootCauseHypothesis).filter(RootCauseHypothesis.investigation_id == investigation_id).delete()
        for idx, hyp in enumerate(root_cause_hypotheses):
            db.add(RootCauseHypothesis(
                id=hyp.get("id") or f"RCH-{idx + 1:02d}",
                investigation_id=investigation_id,
                description=hyp.get("description", ""),
                category=hyp.get("category", "Method"),
                reasoning=hyp.get("reasoning"),
                confidence_label=hyp.get("confidence_label", "Medium"),
                supporting_evidence_refs=hyp.get("supporting_evidence_refs", []),
                contradictory_evidence_refs=hyp.get("contradictory_evidence_refs", []),
                evidence_needed=hyp.get("evidence_needed"),
                user_confirmation_status=hyp.get("user_confirmation_status", "Suggested")
            ))

    # Replace CAPA if provided
    if capa_actions is not None:
        db.query(CapaAction).filter(CapaAction.investigation_id == investigation_id).delete()
        for idx, capa in enumerate(capa_actions):
            db.add(CapaAction(
                id=capa.get("id") or f"CAPA-{idx + 1:02d}",
                investigation_id=investigation_id,
                action_type=capa.get("action_type", "Preventive"),
                description=capa.get("description", ""),
                rationale=capa.get("rationale"),
                related_cause_id=capa.get("related_cause_id"),
                required_resources=capa.get("required_resources"),
                suggested_role=capa.get("suggested_role"),
                suggested_timeframe=capa.suggested_timeframe if hasattr(capa, 'suggested_timeframe') else capa.get("suggested_timeframe"),
                effectiveness_verification=capa.get("effectiveness_verification"),
                status=capa.get("status", "Proposed"),
                review_status=capa.get("review_status", "Awaiting Review")
            ))

    try:
        db.commit()
        db.refresh(item)
        return item
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update investigation {investigation_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Database update error: {str(e)}")
