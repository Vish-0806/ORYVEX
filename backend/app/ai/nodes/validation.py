import logging
from backend.app.ai.state import RCAWorkflowState

logger = logging.getLogger(__name__)

def validation_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 6: Output Validation, Schema Compliance, and Safe Formatting.
    """
    validation_issues = []
    structured = state.get("structured_incident", {})
    
    # 1. Check basic title/summary presence
    if not structured.get("title") and not structured.get("incident_summary"):
        validation_issues.append("Neither title nor incident_summary could be identified from the source.")
        
    # 2. Check 5 Whys consistency
    five_whys = state.get("five_whys_analysis", [])
    for step in five_whys:
        if not step.get("why_question") or not step.get("proposed_answer"):
            validation_issues.append(f"Step {step.get('id', 'unknown')} has missing question or answer.")

    # 3. Check Root Cause Hypotheses
    hypotheses = state.get("root_cause_hypotheses", [])
    valid_categories = {"Man", "Machine", "Method", "Material", "Measurement", "Environment"}
    for hyp in hypotheses:
        if hyp.get("category") not in valid_categories:
            hyp["category"] = "Method" # Safe fallback
        # Strict security enforcement
        hyp["user_confirmation_status"] = "Suggested"

    # 4. Check CAPA actions
    capas = state.get("capa_recommendations", [])
    for c in capas:
        if c.get("action_type") not in ["Corrective", "Preventive"]:
            c["action_type"] = "Preventive"
        c["status"] = "Proposed"
        c["review_status"] = "Awaiting Review"

    status = "completed"
    if state.get("processing_status") == "failed":
        status = "failed"
    elif validation_issues:
        status = "partial"

    return {
        **state,
        "validation_issues": validation_issues,
        "processing_status": status
    }
