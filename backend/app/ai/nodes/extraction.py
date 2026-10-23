import logging
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.prompts.extraction_prompt import build_extraction_prompt
from backend.app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

def extraction_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 2: Structured Incident Extraction using Groq.
    """
    if state.get("processing_status") == "failed":
        return state

    extracted_text = state.get("extracted_text", "")
    source_type = state.get("source_type", "pasted_text")

    try:
        messages = build_extraction_prompt(extracted_text, source_type)
        result = groq_service.chat_completion(messages=messages, response_json=True, temperature=0.1)

        # Separate extracted vs unknown fields
        candidate_fields = [
            "title", "department", "investigation_owner", "incident_date", "date_discovered",
            "product_name", "batch_number", "manufacturing_stage", "equipment_id", "affected_quantity",
            "process_parameters", "raw_materials", "incident_summary", "detailed_description",
            "expected_result", "observed_result", "immediate_containment", "potential_impact",
            "initial_severity", "severity_rationale"
        ]

        structured_incident = {}
        extracted_fields = []
        unknown_fields = []

        for field in candidate_fields:
            val = result.get(field)
            if val is not None and str(val).strip() and str(val).lower() not in ["null", "none", "unknown", "n/a"]:
                structured_incident[field] = val
                extracted_fields.append(field)
            else:
                structured_incident[field] = None
                unknown_fields.append(field)

        field_provenance = result.get("field_provenance", {})
        initial_evidence = result.get("initial_evidence", [])
        warnings = result.get("warnings", [])

        # Assign unique IDs to evidence if missing
        for idx, evd in enumerate(initial_evidence):
            if not evd.get("id"):
                evd["id"] = f"EVD-{idx + 1:02d}"

        return {
            **state,
            "structured_incident": structured_incident,
            "field_provenance": field_provenance,
            "extracted_fields": extracted_fields,
            "unknown_fields": unknown_fields,
            "evidence_register": initial_evidence,
            "extraction_summary": result.get("extraction_summary", "Extraction completed successfully."),
            "warnings": state.get("warnings", []) + warnings,
            "processing_status": "extracted"
        }

    except Exception as e:
        logger.error(f"Error in extraction_node: {e}", exc_info=True)
        return {
            **state,
            "processing_status": "failed",
            "safe_error_information": f"Structured extraction encountered an error: {str(e)}"
        }
