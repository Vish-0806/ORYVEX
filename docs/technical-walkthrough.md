# ORYVEX — Technical Walkthrough Outline (5–10 Minutes)

This document serves as the guide for the engineering and architectural walkthrough of the ORYVEX codebase.

---

### Section 1: Technology Stack & Architectural Decision Records (0:00 – 2:00)
- **Frontend Stack**:
  - React 18 with Vite for modern, fast HMR bundling.
  - Redux Toolkit (`rcaSlice`, `copilotSlice`, `investigationsSlice`) for centralized single-source-of-truth investigation state management.
  - Plain CSS design system (`index.css`) with curated HSL enterprise navy/violet/cyan tokens, responsive two-panel CSS Grid & Flexbox layout.
- **Backend Stack**:
  - Python 3.10 with FastAPI for asynchronous, OpenAPI-documented routing.
  - Pydantic v2 schemas enforcing strict request/response data validation.
- **AI & Reasoning Stack**:
  - LangGraph for multi-step state graph orchestration (input processing -> extraction -> evidence gap analysis -> 5 Whys -> CAPA -> validation).
  - Groq Cloud API using `openai/gpt-oss-120b` (with automatic fallback to `qwen/qwen3.8-27b`) with JSON mode for deterministic structured responses.
- **Data Persistence Stack**:
  - PostgreSQL 18 with SQLAlchemy 2.0 ORM.
  - Normalized relational schema supporting transaction-safe saves and cascade updates.

---

### Section 2: LangGraph Multi-Step Workflow Breakdown (2:00 – 4:30)
- **Code Reference**: [graph.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/ai/graph.py) and [state.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/ai/state.py).
- **Node Walkthrough**:
  1. `input_processing_node`: Validates raw string/PDF extracted text, applies size boundaries (50k chars), handles encoding.
  2. `extraction_node`: Invokes Groq with strict grounding instructions. Extracts only explicit facts into Pydantic models. Extracts provenance quotes and separates unknown/null values.
  3. `evidence_gap_node`: Audits available records against standard pharmaceutical API requirements (BMR, SCADA, HPLC, calibration). Categorizes records as `Supplied` or `Missing / Requested`.
  4. `root_cause_node`: Conducts grounded 5 Whys progression. Halts speculative leaps where evidence is absent. Categorizes causes using Ishikawa 6M (Machine, Method, Material, Measurement, Man, Environment). Enforces `user_confirmation_status = 'Suggested'`.
  5. `capa_generation_node`: Generates justified Corrective Actions (remediate condition) and Preventive Actions (eliminate root cause), linking each to a cause hypothesis and defining an effectiveness verification method.
  6. `validation_node`: Sanitizes schema fields, strips sensitive internals, verifies human oversight constraints.

---

### Section 3: Safe Structured Form Patching & Copilot Security (4:30 – 6:30)
- **Code Reference**: [rca.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/api/v1/rca.py#L125-L175) and [chat_update_prompt.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/ai/prompts/chat_update_prompt.py).
- **Security Safeguards**:
  - Strict field allowlist: only approved investigation fields (`title`, `batch_number`, `observed_result`, `immediate_containment`, etc.) can be modified.
  - Prompt injection protection: prompts explicitly prevent user input from declaring root causes confirmed or bypassing QA sign-offs.
  - Dynamic Redux patching: returns structured JSON `{ "intent": "field_update", "patch": { ... } }`, dispatched directly to the form without reloading or overwriting unedited fields.

---

### Section 4: PostgreSQL Persistence & Database Architecture (6:30 – 8:00)
- **Code Reference**: [investigation.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/models/investigation.py) and [investigations.py](file:///c:/Users/Vishal%20S%20Naik/MyProjects/ORYVEX/backend/app/api/v1/investigations.py).
- **Relational Integrity**:
  - `investigations`: Parent table holding core investigation metadata, dates, severity, and review sign-offs.
  - `evidence_items`: Foreign key linked to investigation with cascade deletion.
  - `five_whys_steps`: Ordered sequential steps (`step_order` 1-5).
  - `root_cause_hypotheses`: Causal hypotheses with evidence links and confirmation status.
  - `capa_actions`: CAPAs with action type, assigned role, timeframe, and review status.
  - Transaction safety: uses SQLAlchemy atomic transactions (`commit()`, `rollback()`) to prevent partial or corrupted saves.

---

### Section 5: Automated Testing & Verification (8:00 – 10:00)
- **Code Reference**: `backend/tests/` (15 automated tests).
- **Test Categories**:
  - Health endpoint status and dependency verification (`test_health.py`).
  - PDF extraction, empty file, and corrupt file handling (`test_pdf_service.py`).
  - Pydantic schema validation and unknown/null preservation (`test_schemas.py`).
  - PostgreSQL CRUD lifecycle, search filtering, and transactional updates (`test_database_crud.py`).
  - LangGraph node execution and human oversight enforcement (`test_langgraph_workflow.py`).
  - Copilot chat intent routing and field allowlist security filtering (`test_copilot_chat.py`).
- Run live test execution: `python -m pytest backend/tests -v`.
