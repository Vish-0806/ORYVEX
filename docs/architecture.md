# ORYVEX — Architecture & System Design

## 1. System Overview
**ORYVEX** (AI-Powered Root Cause Intelligence System) is a purpose-built pharmaceutical quality investigation platform designed to assist Quality Assurance (QA) and Quality Control (QC) units during Out-of-Specification (OOS) and manufacturing deviation investigations in Active Pharmaceutical Ingredient (API) synthesis.

Tagline: *Every anomaly has an origin.*

---

## 2. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                       ORYVEX FRONTEND (React 18)                                    |
|                                                                                                    |
|  +----------------------------------------------------+  +---------------------------------------+ |
|  |           Structured RCA Form (Left Panel)         |  |       ORYVEX AI Copilot (Right Panel) | |
|  |  - Investigation Toolbar & Workflow Status         |  |  - Document Intake (PDF / Text)       | |
|  |  - Sec A: Investigation Metadata                   |  |  - Extraction Feedback & Audit        | |
|  |  - Sec B: Product & Manufacturing Context          |  |  - Conversational History             | |
|  |  - Sec C: Incident Description & Severity          |  |  - Structured Form Patcher (Redux)    | |
|  |  - Sec D: Evidence Register (Supplied vs Missing)  |  |  - Suggested Action Guidance          | |
|  |  - Sec E: 5 Whys Root Cause Methodology            |  +---------------------------------------+ |
|  |  - Sec F: Ishikawa Root Cause Hypotheses (6M)      |                      |                     |
|  |  - Sec G: Justified CAPA Recommendations           |                      |                     |
|  |  - Sec H: Qualified Reviewer Confirmation          |                      |                     |
|  +----------------------------------------------------+                      |                     |
|                           ^                                                  |                     |
|                           |-------------- Redux Toolkit Store <--------------+                     |
|                                                    |                                               |
+----------------------------------------------------|-----------------------------------------------+
                                                     | HTTP REST API (/api/v1)
                                                     v
+----------------------------------------------------------------------------------------------------+
|                                    ORYVEX BACKEND (FastAPI / Python)                               |
|                                                                                                    |
|  +-------------------+  +------------------------------------+  +--------------------------------+ |
|  |  FastAPI Router   |  |        Services Layer              |  |      Data Persistence Layer    | |
|  |  - /health        |  |  - PDFService (pypdf, OCR detect)  |  |  - SQLAlchemy 2.0 ORM          | |
|  |  - /rca/extract   |  |  - GroqService (retries, fallback) |  |  - PostgreSQL 18 Engine       | |
|  |  - /rca/analyze   |  |  - Pydantic v2 Schema Validators   |  |  - Idempotent init_db()        | |
|  |  - /rca/chat      |  +------------------------------------+  +--------------------------------+ |
|  |  - /investigations|                    |                                     |                  |
|  +-------------------+                    v                                     v                  |
|                           +----------------------------------+        +--------------------------+ |
|                           |     LangGraph Orchestrator       |        |   PostgreSQL 18 Database | |
|                           |  Node 1: Input Processing        |        |   - investigations       | |
|                           |  Node 2: Incident Extraction     |        |   - evidence_items       | |
|                           |  Node 3: Evidence Gap Analysis   |        |   - five_whys_steps      | |
|                           |  Node 4: 5 Whys & Ishikawa RCA   |        |   - root_cause_hypotheses| |
|                           |  Node 5: CAPA Recommendations    |        |   - capa_actions         | |
|                           |  Node 6: Output Validation       |        |   - copilot_messages     | |
|                           +----------------------------------+        +--------------------------+ |
|                                           |                                                        |
+-------------------------------------------|--------------------------------------------------------+
                                            v
                         +-------------------------------------+
                         |           Groq Cloud API            |
                         |  Model: openai/gpt-oss-120b         |
                         |  Fallback: qwen/qwen3.8-27b         |
                         +-------------------------------------+
```

---

## 3. Core Architectural Pillars

### 3.1 Strict Grounding & Anti-Hallucination
In pharmaceutical cGMP manufacturing (FDA 21 CFR §211.192), fabricating or assuming analytical results is a catastrophic compliance violation.
- **Null Preservation:** If an acceptance limit, batch number, or temperature reading is not explicitly present in the source document, ORYVEX leaves the field as `null` / unknown rather than inventing a plausible value.
- **Field Provenance:** Extracted values are tagged with source provenance excerpts and confidence ratings.
- **Evidence Status Distinction:** Supplied records are marked `Supplied`, while missing critical records (such as SCADA temperature logs or calibration sheets) are flagged as `Missing / Requested`.

### 3.2 Human Oversight & Qualified Review
- AI-generated root causes are strictly classified as **Hypotheses** with default status `Suggested`.
- The system **never** marks a root cause as `Confirmed by qualified reviewer` automatically.
- Only an authorized Quality Investigator can review the evidence, select confirmed status, and authorize batch disposition.

### 3.3 Dynamic Two-Way Redux Form Patching
When the user chats with the ORYVEX Copilot:
1. The user's natural language command (e.g. *"Change the batch number to ART-2026-042"*) is sent to the backend.
2. The AI identifies the intent as `field_update`.
3. The proposed field is sanitized against a strict allowlist of editable form fields.
4. The backend returns a structured JSON patch.
5. Redux Toolkit dispatches `applyStructuredPatch`, immediately updating the live controlled input in the left panel and tagging the field with a `copilot_patch` badge.
