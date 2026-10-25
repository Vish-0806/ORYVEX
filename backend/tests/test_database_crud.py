import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import SessionLocal
from backend.app.models.investigation import Investigation

client = TestClient(app)

def test_investigation_lifecycle_crud():
    payload = {
        "title": "Automated Test RCA Investigation",
        "status": "Draft",
        "department": "Quality Assurance Testing",
        "product_name": "Test Active Substance",
        "batch_number": "TST-9901",
        "manufacturing_stage": "Filtration",
        "incident_summary": "Particle contamination detected in rinse sample",
        "observed_result": "3 particles > 10 microns",
        "expected_result": "0 particles > 10 microns",
        "initial_severity": "Major",
        "evidence_items": [
            {
                "id": "EVD-T1",
                "description": "Particle counter printout",
                "evidence_type": "Analytical Log",
                "evidence_status": "Supplied"
            }
        ],
        "five_whys_steps": [
            {
                "id": "WHY-T1",
                "step_order": 1,
                "why_question": "Why were particles present?",
                "proposed_answer": "Filter integrity compromised",
                "evidence_strength": "Moderate"
            }
        ],
        "root_cause_hypotheses": [
            {
                "id": "RCH-T1",
                "description": "O-ring degradation in filter housing",
                "category": "Machine",
                "confidence_label": "Medium",
                "user_confirmation_status": "Suggested"
            }
        ],
        "capa_actions": [
            {
                "id": "CAPA-T1",
                "action_type": "Corrective",
                "description": "Replace housing gasket and retest",
                "status": "Proposed",
                "review_status": "Awaiting Review"
            }
        ]
    }

    # 1. CREATE
    create_res = client.post("/api/v1/investigations", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    inv_id = created["id"]
    assert inv_id.startswith("RCA-")
    assert len(created["evidence_items"]) == 1
    assert len(created["five_whys_steps"]) == 1
    assert len(created["root_cause_hypotheses"]) == 1
    assert len(created["capa_actions"]) == 1

    # 2. GET SINGLE
    get_res = client.get(f"/api/v1/investigations/{inv_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == inv_id
    assert fetched["product_name"] == "Test Active Substance"
    assert fetched["evidence_items"][0]["id"] == "EVD-T1"

    # 3. LIST WITH SEARCH
    list_res = client.get(f"/api/v1/investigations?search=TST-9901")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["id"] == inv_id for i in items)

    # 4. UPDATE
    update_payload = {
        "title": "Automated Test RCA Investigation - Updated",
        "status": "Investigation in progress",
        "reviewer_name": "QA Lead Tester",
        "confirmation_status": "Reviewed and Confirmed"
    }
    update_res = client.put(f"/api/v1/investigations/{inv_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["title"] == "Automated Test RCA Investigation - Updated"
    assert updated["status"] == "Investigation in progress"
    assert updated["reviewer_name"] == "QA Lead Tester"

    # Cleanup test record
    db = SessionLocal()
    try:
        db.query(Investigation).filter(Investigation.id == inv_id).delete()
        db.commit()
    finally:
        db.close()


def test_multiple_investigations_with_same_child_ids():
    payload_1 = {
        "title": "Investigation Alpha",
        "product_name": "Product A",
        "evidence_items": [
            {"id": "EVD-01", "description": "Log A", "evidence_type": "Analytical Log"},
            {"id": "EVD-02", "description": "Log B", "evidence_type": "Batch Record"}
        ],
        "five_whys_steps": [
            {"id": "WHY-01", "step_order": 1, "why_question": "Why?", "proposed_answer": "Answer 1"}
        ],
        "root_cause_hypotheses": [
            {"id": "RCH-01", "description": "Cause 1", "category": "Method"}
        ],
        "capa_actions": [
            {"id": "CAPA-01", "action_type": "Corrective", "description": "Fix 1"}
        ]
    }

    payload_2 = {
        "title": "Investigation Beta",
        "product_name": "Product B",
        "evidence_items": [
            {"id": "EVD-01", "description": "Log X", "evidence_type": "Analytical Log"},
            {"id": "EVD-02", "description": "Log Y", "evidence_type": "Batch Record"}
        ],
        "five_whys_steps": [
            {"id": "WHY-01", "step_order": 1, "why_question": "Why again?", "proposed_answer": "Answer 2"}
        ],
        "root_cause_hypotheses": [
            {"id": "RCH-01", "description": "Cause 2", "category": "Machine"}
        ],
        "capa_actions": [
            {"id": "CAPA-01", "action_type": "Preventive", "description": "Fix 2"}
        ]
    }

    res1 = client.post("/api/v1/investigations", json=payload_1)
    assert res1.status_code == 201
    id1 = res1.json()["id"]

    res2 = client.post("/api/v1/investigations", json=payload_2)
    assert res2.status_code == 201
    id2 = res2.json()["id"]

    # Verify both exist and have their independent child rows with same IDs
    fetch1 = client.get(f"/api/v1/investigations/{id1}").json()
    fetch2 = client.get(f"/api/v1/investigations/{id2}").json()

    assert fetch1["evidence_items"][0]["id"] == "EVD-01"
    assert fetch2["evidence_items"][0]["id"] == "EVD-01"
    assert fetch1["evidence_items"][0]["description"] == "Log A"
    assert fetch2["evidence_items"][0]["description"] == "Log X"

    # Cleanup
    db = SessionLocal()
    try:
        db.query(Investigation).filter(Investigation.id.in_([id1, id2])).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

