from backend.app.ai.state import RCAWorkflowState

def input_processing_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 1: Validate and prepare raw text input.
    """
    source_input = state.get("source_input", "").strip()
    source_type = state.get("source_type", "pasted_text")
    
    if not source_input:
        return {
            **state,
            "processing_status": "failed",
            "safe_error_information": "Empty source input provided. Please supply an incident report, email, or PDF."
        }
    
    # Enforce reasonable size limits (e.g. 50,000 characters)
    if len(source_input) > 50000:
        source_input = source_input[:50000]
        state["warnings"] = state.get("warnings", []) + ["Source document was truncated to 50,000 characters for processing."]

    return {
        **state,
        "extracted_text": source_input,
        "processing_status": "processing"
    }
