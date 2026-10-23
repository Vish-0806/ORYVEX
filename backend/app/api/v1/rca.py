import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from backend.app.schemas.rca import (
    ExtractRequest, ExtractResponse,
    AnalyzeRequest, AnalyzeResponse,
    ChatRequest, ChatResponse
)
from backend.app.services.pdf_service import PDFService, PDFExtractionError
from backend.app.services.groq_service import groq_service
from backend.app.ai.graph import rca_extraction_graph, rca_investigation_graph
from backend.app.ai.prompts.chat_update_prompt import build_chat_prompt
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rca", tags=["Root Cause Analysis Engine"])

@router.post("/extract", response_model=ExtractResponse)
async def extract_incident_information(
    file: Optional[UploadFile] = File(None),
    source_text: Optional[str] = Form(None),
    source_type: Optional[str] = Form("pasted_text")
):
    """
    Intake incident data via PDF upload or text/email and execute LangGraph extraction.
    """
    text_to_process = ""
    effective_source_type = source_type or "pasted_text"
    filename = None

    if file:
        filename = file.filename
        PDFService.validate_file(file, max_mb=settings.MAX_UPLOAD_MB)
        file_bytes = await file.read()
        try:
            text_to_process, num_pages = PDFService.extract_text_from_bytes(file_bytes, filename)
            effective_source_type = "pdf"
        except PDFExtractionError as pe:
            raise HTTPException(status_code=422, detail=str(pe))
    elif source_text and source_text.strip():
        text_to_process = source_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Either a PDF file or source_text must be provided.")

    # Execute LangGraph extraction workflow
    initial_state = {
        "source_type": effective_source_type,
        "source_input": text_to_process,
        "filename": filename,
        "warnings": []
    }

    try:
        final_state = rca_extraction_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph extraction workflow execution failure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI extraction workflow error: {str(e)}")

    if final_state.get("processing_status") == "failed":
        raise HTTPException(
            status_code=422,
            detail=final_state.get("safe_error_information", "Could not extract incident information.")
        )

    structured = final_state.get("structured_incident", {})
    evidence_register = final_state.get("evidence_register", [])
    
    # Separate supplied vs missing evidence notices
    missing_notices = [
        f"{e.get('description')} ({e.get('evidence_type')})"
        for e in evidence_register
        if e.get("evidence_status") == "Missing / Requested"
    ]

    return ExtractResponse(
        title=structured.get("title"),
        department=structured.get("department"),
        investigation_owner=structured.get("investigation_owner"),
        incident_date=structured.get("incident_date"),
        date_discovered=structured.get("date_discovered"),
        product_name=structured.get("product_name"),
        batch_number=structured.get("batch_number"),
        manufacturing_stage=structured.get("manufacturing_stage"),
        equipment_id=structured.get("equipment_id"),
        affected_quantity=structured.get("affected_quantity"),
        process_parameters=structured.get("process_parameters"),
        raw_materials=structured.get("raw_materials"),
        incident_summary=structured.get("incident_summary"),
        detailed_description=structured.get("detailed_description"),
        expected_result=structured.get("expected_result"),
        observed_result=structured.get("observed_result"),
        immediate_containment=structured.get("immediate_containment"),
        potential_impact=structured.get("potential_impact"),
        initial_severity=structured.get("initial_severity"),
        severity_rationale=structured.get("severity_rationale"),
        extracted_fields=final_state.get("extracted_fields", []),
        unknown_fields=final_state.get("unknown_fields", []),
        field_provenance=final_state.get("field_provenance", {}),
        initial_evidence=evidence_register,
        missing_evidence_notices=missing_notices,
        extraction_summary=final_state.get("extraction_summary", "Extraction completed successfully."),
        warnings=final_state.get("warnings", [])
    )

@router.post("/extract-json", response_model=ExtractResponse)
async def extract_incident_json(payload: ExtractRequest):
    """
    JSON endpoint for text/email extraction requests.
    """
    return await extract_incident_information(
        file=None,
        source_text=payload.source_text,
        source_type=payload.source_type
    )

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_investigation(payload: AnalyzeRequest):
    """
    Execute LangGraph 5 Whys, Root Cause Hypotheses, and CAPA generation workflow.
    """
    initial_state = {
        "structured_incident": payload.incident_data,
        "evidence_register": [e.dict() for e in payload.evidence_items],
        "investigation_id": payload.investigation_id,
        "warnings": []
    }

    try:
        final_state = rca_investigation_graph.invoke(initial_state)
    except Exception as e:
        logger.error(f"LangGraph investigation workflow failure: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI RCA investigation error: {str(e)}")

    evidence_items = final_state.get("evidence_register", [])
    evidence_gaps = [
        e for e in evidence_items
        if e.get("evidence_status") == "Missing / Requested"
    ]

    return AnalyzeResponse(
        five_whys_steps=final_state.get("five_whys_analysis", []),
        root_cause_hypotheses=final_state.get("root_cause_hypotheses", []),
        evidence_gaps=evidence_gaps,
        capa_recommendations=final_state.get("capa_recommendations", []),
        methodology_notes=final_state.get("methodology_notes", "Structured 5 Whys and 6M Ishikawa analysis executed."),
        investigator_guidance=final_state.get("investigator_guidance", []),
        warnings=final_state.get("warnings", [])
    )

@router.post("/chat", response_model=ChatResponse)
async def copilot_chat(payload: ChatRequest):
    """
    Handle Copilot conversation, follow-up queries, and structured form field modifications.
    """
    ALLOWED_EDIT_FIELDS = {
        "title", "department", "investigation_owner", "incident_date", "date_discovered",
        "product_name", "batch_number", "manufacturing_stage", "equipment_id", "affected_quantity",
        "incident_summary", "detailed_description", "expected_result", "observed_result",
        "immediate_containment", "potential_impact", "initial_severity", "severity_rationale",
        "reviewer_name", "reviewer_role", "review_notes"
    }

    messages = build_chat_prompt(
        payload.message,
        payload.current_form_state,
        payload.conversation_history
    )

    try:
        ai_response = groq_service.chat_completion(messages=messages, response_json=True, temperature=0.1)
    except Exception as e:
        logger.error(f"Error communicating with Groq in chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Copilot inference error: {str(e)}")

    intent = ai_response.get("intent", "question")
    patch = ai_response.get("patch") or {}
    reply = ai_response.get("reply", "Understood.")
    clarification = ai_response.get("clarification")
    suggested_actions = ai_response.get("suggested_actions", [])

    # Validate and filter patch against editable allowlist
    sanitized_patch = {}
    modified_fields = []
    if intent == "field_update" and isinstance(patch, dict):
        for field, val in patch.items():
            if field in ALLOWED_EDIT_FIELDS:
                sanitized_patch[field] = val
                modified_fields.append(field)
            else:
                logger.warning(f"Rejected attempt to modify unauthorized field '{field}' via chat.")

    return ChatResponse(
        reply=reply,
        intent=intent,
        patch=sanitized_patch if sanitized_patch else None,
        modified_fields=modified_fields,
        clarification=clarification,
        suggested_actions=suggested_actions
    )
