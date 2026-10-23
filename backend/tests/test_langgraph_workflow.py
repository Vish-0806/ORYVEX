import pytest
from backend.app.ai.nodes.input_processing import input_processing_node
from backend.app.ai.nodes.validation import validation_node

def test_input_processing_empty():
    state = {"source_input": "   ", "source_type": "pasted_text"}
    out = input_processing_node(state)
    assert out["processing_status"] == "failed"
    assert "Empty source input" in out["safe_error_information"]

def test_input_processing_valid():
    state = {"source_input": "Incident report narrative", "source_type": "email"}
    out = input_processing_node(state)
    assert out["processing_status"] == "processing"
    assert out["extracted_text"] == "Incident report narrative"

def test_validation_node_enforces_human_oversight():
    # If a model illegally output Confirmed, validation_node must downgrade to Suggested
    state = {
        "structured_incident": {"title": "Test Anomaly", "incident_summary": "Summary"},
        "five_whys_analysis": [
            {"id": "WHY-01", "why_question": "Why?", "proposed_answer": "Because"}
        ],
        "root_cause_hypotheses": [
            {
                "id": "RCH-01",
                "description": "Contamination",
                "category": "Machine",
                "user_confirmation_status": "Confirmed by qualified reviewer" # Illegal for AI to declare!
            }
        ],
        "capa_recommendations": [
            {
                "id": "CAPA-01",
                "action_type": "Preventive",
                "description": "Clean filter"
            }
        ],
        "processing_status": "extracted"
    }

    validated = validation_node(state)
    assert validated["processing_status"] == "completed"
    # Verify strict human oversight enforcement
    assert validated["root_cause_hypotheses"][0]["user_confirmation_status"] == "Suggested"
    assert validated["capa_recommendations"][0]["status"] == "Proposed"
    assert validated["capa_recommendations"][0]["review_status"] == "Awaiting Review"
