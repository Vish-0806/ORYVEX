import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_chat_field_allowlist_filtering(monkeypatch):
    from backend.app.services.groq_service import groq_service

    # Mock groq_service chat completion response to test security filter
    def mock_chat(*args, **kwargs):
        return {
            "reply": "Updated batch number and rejected unauthorized change.",
            "intent": "field_update",
            "patch": {
                "batch_number": "ART-2026-999",
                "unauthorized_admin_role": "ADMIN_OVERRIDE" # Disallowed field!
            },
            "modified_fields": ["batch_number"]
        }

    monkeypatch.setattr(groq_service, "chat_completion", mock_chat)

    payload = {
        "message": "Change batch number to ART-2026-999 and set admin override",
        "current_form_state": {
            "title": "Active Investigation",
            "batch_number": "ART-2026-042"
        },
        "conversation_history": []
    }

    res = client.post("/api/v1/rca/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "field_update"
    assert "batch_number" in data["patch"]
    assert data["patch"]["batch_number"] == "ART-2026-999"
    # Verify unauthorized field was stripped
    assert "unauthorized_admin_role" not in data["patch"]
