# ORYVEX — API Endpoints & Workflow Documentation

The ORYVEX backend exposes a versioned REST API (`/api/v1`) designed for pharmaceutical RCA workflows.

---

## 1. System & Health

### `GET /api/v1/health`
Checks application status, PostgreSQL database connectivity, and Groq engine readiness.

**Response (200 OK):**
```json
{
  "status": "online",
  "system": "ORYVEX - AI-Powered Root Cause Intelligence System",
  "version": "1.0.0",
  "database": "healthy",
  "ai_engine": {
    "provider": "Groq",
    "model": "openai/gpt-oss-120b",
    "configured": true
  }
}
```

---

## 2. Root Cause Intelligence Workflow

### `POST /api/v1/rca/extract`
Intakes an incident document via PDF upload or form-data narrative. Executes the LangGraph extraction graph.

**Request:** `multipart/form-data`
- `file`: PDF file (optional)
- `source_text`: String text (optional if file provided)
- `source_type`: `"pdf"` | `"pasted_text"` | `"email"`

**Response (200 OK):**
```json
{
  "title": "OOS Impurity Level Detected in Artemicort Batch ART-2026-042",
  "product_name": "Artemicort API",
  "batch_number": "ART-2026-042",
  "manufacturing_stage": "Stage 3 — Final Crystallization",
  "equipment_id": "Crystallizer Unit CR-04",
  "observed_result": "HPLC assay showed Impurity D-7 at 0.38% (w/w)",
  "expected_result": "Any individual unspecified impurity <= 0.10% (w/w)",
  "initial_severity": "Critical",
  "extracted_fields": ["product_name", "batch_number", "observed_result", "..."],
  "unknown_fields": ["raw_materials"],
  "field_provenance": {
    "batch_number": {
      "excerpt": "Batch Number: ART-2026-042",
      "confidence": "High"
    }
  },
  "initial_evidence": [
    {
      "id": "EVD-01",
      "description": "HPLC Analytical Testing Report",
      "evidence_type": "Analytical Log",
      "evidence_status": "Supplied"
    }
  ],
  "missing_evidence_notices": [
    "SCADA continuous temperature trend logs (Temperature Log)",
    "Metrology calibration verification for Dual-RTD Sensor TT-204 (Calibration)"
  ]
}
```

---

### `POST /api/v1/rca/analyze`
Executes the LangGraph 5 Whys, Ishikawa 6M root cause hypothesis generation, and CAPA formulation workflow.

**Request Body (JSON):**
```json
{
  "investigation_id": "RCA-2026-001",
  "incident_data": {
    "product_name": "Artemicort API",
    "batch_number": "ART-2026-042",
    "observed_result": "Impurity D-7 at 0.38%"
  },
  "evidence_items": [
    {
      "id": "EVD-01",
      "description": "HPLC analytical log",
      "evidence_type": "Analytical Log",
      "evidence_status": "Supplied"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "five_whys_steps": [
    {
      "id": "WHY-01",
      "step_order": 1,
      "why_question": "Why did Impurity D-7 exceed the 0.10% acceptance limit?",
      "proposed_answer": "Thermal degradation occurred during the crystallization cooling plateau.",
      "supporting_evidence": "HPLC assay result 0.38% and 85-minute temperature hold at 44.5 C",
      "evidence_strength": "Strong",
      "remaining_unknowns": "SCADA trend log verification"
    }
  ],
  "root_cause_hypotheses": [
    {
      "id": "RCH-01",
      "description": "Chiller loop valve actuator failure causing extended thermal plateau",
      "category": "Machine",
      "reasoning": "Intermittent valve alarm AL-CH-309 halted secondary cooling, maintaining degradation temperature.",
      "confidence_label": "High",
      "user_confirmation_status": "Suggested"
    }
  ],
  "capa_recommendations": [
    {
      "id": "CAPA-01",
      "action_type": "Corrective",
      "description": "Inspect and rebuild secondary chiller flow valve AL-CH-309 actuator",
      "suggested_role": "Maintenance Engineering Lead",
      "effectiveness_verification": "Verify cooling curve on next 3 production batches"
    }
  ]
}
```

---

### `POST /api/v1/rca/chat`
Handles conversational follow-ups and returns structured patches for user commands that update form fields.

**Request Body (JSON):**
```json
{
  "message": "Change the batch number to ART-2026-042 and set immediate containment to quarantine warehouse Bay 3B",
  "current_form_state": {
    "title": "Active Investigation",
    "batch_number": "ART-2026-001"
  },
  "conversation_history": []
}
```

**Response (200 OK):**
```json
{
  "reply": "I have updated the batch number to ART-2026-042 and recorded the immediate containment actions for Warehouse Bay 3B.",
  "intent": "field_update",
  "patch": {
    "batch_number": "ART-2026-042",
    "immediate_containment": "Batch placed under physical and SAP quarantine status in Warehouse Bay 3B."
  },
  "modified_fields": ["batch_number", "immediate_containment"]
}
```

---

## 3. Investigation Persistence (PostgreSQL)

- `POST /api/v1/investigations`: Create and save investigation with full child collections.
- `GET /api/v1/investigations`: Search & list saved records.
- `GET /api/v1/investigations/{id}`: Fetch single record.
- `PUT /api/v1/investigations/{id}`: Transactionally update record and child tables.
