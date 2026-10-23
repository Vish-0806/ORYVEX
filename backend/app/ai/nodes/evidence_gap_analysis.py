import logging
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.prompts.evidence_prompt import build_evidence_prompt
from backend.app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

def evidence_gap_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 3: Evidence and Gap Analysis.
    """
    if state.get("processing_status") == "failed":
        return state

    structured_incident = state.get("structured_incident", {})
    existing_evidence = state.get("evidence_register", [])

    try:
        messages = build_evidence_prompt(structured_incident, existing_evidence)
        result = groq_service.chat_completion(messages=messages, response_json=True, temperature=0.1)

        supplied = result.get("supplied_evidence", existing_evidence)
        missing_requests = result.get("missing_evidence_requests", [])
        contradictions = result.get("contradictions", [])
        critical_unknowns = result.get("critical_unknowns", [])

        # Merge supplied and requested evidence while ensuring distinct IDs
        combined_evidence = list(supplied)
        current_ids = {e.get("id") for e in combined_evidence}
        
        counter = len(combined_evidence) + 1
        for req in missing_requests:
            req_id = req.get("id")
            if not req_id or req_id in current_ids:
                req_id = f"EVD-{counter:02d}"
                counter += 1
            req["id"] = req_id
            req["evidence_status"] = "Missing / Requested"
            combined_evidence.append(req)
            current_ids.add(req_id)

        return {
            **state,
            "evidence_register": combined_evidence,
            "missing_information_list": critical_unknowns,
            "contradictions": contradictions,
            "processing_status": "evidence_analyzed"
        }

    except Exception as e:
        logger.error(f"Error in evidence_gap_node: {e}", exc_info=True)
        # Non-fatal: keep existing evidence and proceed
        return {
            **state,
            "warnings": state.get("warnings", []) + [f"Evidence gap analysis notice: {str(e)}"],
            "processing_status": "evidence_analyzed"
        }
