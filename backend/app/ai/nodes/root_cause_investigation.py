import logging
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.prompts.rca_prompt import build_rca_prompt
from backend.app.services.groq_service import groq_service

logger = logging.getLogger(__name__)

def root_cause_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 4: 5 Whys and Ishikawa Root Cause Hypotheses Generation.
    """
    if state.get("processing_status") == "failed":
        return state

    structured_incident = state.get("structured_incident", {})
    evidence_register = state.get("evidence_register", [])

    try:
        messages = build_rca_prompt(structured_incident, evidence_register)
        result = groq_service.chat_completion(messages=messages, response_json=True, temperature=0.1)

        five_whys = result.get("five_whys_steps", [])
        hypotheses = result.get("root_cause_hypotheses", [])
        methodology_notes = result.get("methodology_notes", "")
        investigator_guidance = result.get("investigator_guidance", [])

        # Quality Control: Enforce human oversight constraints
        for idx, step in enumerate(five_whys):
            if not step.get("id"):
                step["id"] = f"WHY-{idx + 1:02d}"
            if not step.get("step_order"):
                step["step_order"] = idx + 1

        for idx, hyp in enumerate(hypotheses):
            if not hyp.get("id"):
                hyp["id"] = f"RCH-{idx + 1:02d}"
            # STRICT RULE: NEVER confirm root causes automatically
            hyp["user_confirmation_status"] = "Suggested"

        return {
            **state,
            "five_whys_analysis": five_whys,
            "root_cause_hypotheses": hypotheses,
            "methodology_notes": methodology_notes,
            "investigator_guidance": investigator_guidance,
            "processing_status": "rca_investigated"
        }

    except Exception as e:
        logger.error(f"Error in root_cause_node: {e}", exc_info=True)
        return {
            **state,
            "warnings": state.get("warnings", []) + [f"Root cause generation error: {str(e)}"],
            "processing_status": "rca_investigated"
        }
