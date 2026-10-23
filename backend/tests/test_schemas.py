import pytest
from pydantic import ValidationError
from backend.app.schemas.evidence import EvidenceItemCreate
from backend.app.schemas.five_whys import FiveWhysStepCreate
from backend.app.schemas.root_cause import RootCauseHypothesisCreate
from backend.app.schemas.capa import CapaActionCreate
from backend.app.schemas.investigation import InvestigationCreate

def test_evidence_schema_valid():
    evd = EvidenceItemCreate(
        id="EVD-01",
        description="HPLC chromatogram run 4",
        evidence_type="Analytical Log",
        evidence_status="Supplied"
    )
    assert evd.id == "EVD-01"
    assert evd.evidence_status == "Supplied"

def test_evidence_schema_invalid_status():
    with pytest.raises(ValidationError):
        EvidenceItemCreate(
            id="EVD-01",
            description="HPLC log",
            evidence_type="Analytical Log",
            evidence_status="InvalidStatus" # type: ignore
        )

def test_root_cause_hypothesis_schema():
    hyp = RootCauseHypothesisCreate(
        id="RCH-01",
        description="Chiller valve failure",
        category="Machine",
        confidence_label="Medium",
        user_confirmation_status="Suggested"
    )
    assert hyp.category == "Machine"
    assert hyp.user_confirmation_status == "Suggested"

def test_capa_action_schema():
    capa = CapaActionCreate(
        id="CAPA-01",
        action_type="Corrective",
        description="Overhaul chiller valve AL-CH-309",
        status="Proposed",
        review_status="Awaiting Review"
    )
    assert capa.action_type == "Corrective"
    assert capa.status == "Proposed"

def test_investigation_schema_preserves_nulls():
    inv = InvestigationCreate(
        title="OOS Investigation",
        status="Draft",
        product_name=None, # Missing/unknown in source
        batch_number=None,
        observed_result="0.38% Impurity D-7"
    )
    assert inv.product_name is None
    assert inv.batch_number is None
    assert inv.observed_result == "0.38% Impurity D-7"
