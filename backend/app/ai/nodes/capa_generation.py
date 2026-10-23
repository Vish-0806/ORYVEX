import logging
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.prompts.capa_prompt import build_capa_prompt
from backend.app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

def capa_generation_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 5: CAPA Recommendations Generation.
    """
    if state.get("processing_status") == "failed":
        return state

    structured_incident = state.get("structured_incident", {})
    root_causes = state.get("root_cause_hypotheses", [])
    evidence = state.get("evidence_register", [])

    try:
        messages = build_capa_prompt(structured_incident, root_causes, evidence)
        result = groq_service.chat_completion(messages=messages, response_json=True, temperature=0.1)

        capas = result.get("capa_recommendations", [])
        for idx, capa in enumerate(capas):
            if not capa.get("id"):
                capa["id"] = f"CAPA-{idx + 1:02d}"
            # STRICT RULE: Mark AI suggestions as proposed / awaiting review
            capa["status"] = "Proposed"
            capa["review_status"] = "Awaiting Review"

        return {
            **state,
            "capa_recommendations": capas,
            "processing_status": "capa_generated"
        }

    except Exception as e:
        logger.error(f"Error in capa_generation_node: {e}", exc_info=True)
        return {
            **state,
            "warnings": state.get("warnings", []) + [f"CAPA generation notice: {str(e)}"],
            "processing_status": "capa_generated"
        }
