# ORYVEX — AI-Powered Root Cause Intelligence System

> **Tagline:** *Every anomaly has an origin.*

[![Built for](https://img.shields.io/badge/AIVOA.AI-AI%20Product%20Engineer%20Challenge-6366f1)](#)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2+-orange)](https://github.com/langchain-ai/langgraph)
[![Groq](https://img.shields.io/badge/Groq-Llama%20%2F%20GPT--OSS-f55036)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.4-336791)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.0+-764abc)](https://redux-toolkit.js.org)

---

## 1. Overview
**ORYVEX** is an enterprise AI-powered Root Cause Analysis (RCA) platform tailored for pharmaceutical Active Pharmaceutical Ingredient (API) quality investigation workflows (cGMP, FDA 21 CFR §211.192, and ICH Q9/Q10).

When an Out-of-Specification (OOS) lab result or unexpected manufacturing excursion occurs, ORYVEX transforms raw incident documents (PDF reports, quality email notices, or operator shift logs) into a structured, evidence-grounded investigation record with verified 5 Whys progression and actionable Corrective and Preventive Actions (CAPA).

---

## 2. Key Features

- **Document & Incident Intake:** Upload digitally rendered PDF quality reports or paste raw incident narrative text.
- **AI-Powered Structured Form Population:** Multi-stage LangGraph workflow extracts product name, batch number, equipment identifiers, measured values, and containment actions directly into the controlled RCA form.
- **Strict Grounding & Provenance:** Every extracted field displays source excerpts and confidence ratings. Missing information is explicitly preserved as `null` / unknown rather than hallucinated.
- **Evidence Gap Analysis:** Automatically audits available documentation and flags missing records (e.g., SCADA temperature trends, metrology sensor calibration logs) as `Missing / Requested`.
- **5 Whys & Ishikawa Analysis:** Generates grounded causal chains categorized across 6M dimensions (Machine, Method, Material, Measurement, Man, Environment) that halt at documented evidence gaps.
- **Mandatory Human Oversight:** AI root causes are strictly marked as `Suggested` hypotheses. Only a qualified Quality Investigator can confirm the root cause after physical evidence verification.
- **Actionable CAPA Generation:** Proposes justified Corrective Actions (immediate containment) and Preventive Actions (systemic recurrence prevention) with concrete effectiveness verification methods.
- **Interactive Copilot Chat & Redux Form Patching:** Quality investigators can ask questions or issue natural language commands (e.g. *"Change batch number to ART-2026-042"*), which the AI validates and applies directly to the active Redux form state.
- **PostgreSQL Persistence:** Complete investigation records, evidence items, 5 Whys steps, and CAPAs are saved, queried, and updated in PostgreSQL.

---

## 3. Technology Stack

- **Frontend:** React 18, Redux Toolkit, Lucide Icons, Vite, Plain CSS design system (dark navy branding with violet/cyan accents).
- **Backend:** Python 3.10+, FastAPI, Pydantic v2.
- **AI Orchestration:** LangGraph (multi-node state graph), Groq Cloud API (`openai/gpt-oss-120b` and `qwen/qwen3.8-27b`).
- **Database:** PostgreSQL 18 with SQLAlchemy 2.0 ORM.
- **Document Processing:** PyPDF for digital PDF text extraction with scanned/image OCR detection.
- **Testing:** Pytest (15 automated unit and integration tests).

---

## 4. Quick Start Guide

### 4.1 Database Setup (PostgreSQL 18)
Ensure PostgreSQL is running on port 5434 and database `oryvex_db` is created:
```powershell
postgres -D "c:\Users\Vishal S Naik\pg_oryvex_data" -p 5434
createdb -h 127.0.0.1 -p 5434 -U postgres oryvex_db
```

### 4.2 Backend Setup
```powershell
cd backend
# Verify .env exists and contains GROQ_API_KEY
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/v1/health`

### 4.3 Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 5. Running Automated Tests

Run the backend test suite:
```powershell
python -m pytest backend/tests -v
```
**Results:** `15 passed in 1.95s` (100% test pass rate covering health, PDF extraction, Pydantic schemas, PostgreSQL CRUD, LangGraph nodes, and Copilot security allowlist).

---

## 6. Demonstration Scenario

A comprehensive fictional demonstration incident is provided in:
- Text format: `fictional_sample_data/API_Batch_402_Impurity_Incident.txt`
- PDF format: `fictional_sample_data/API_Batch_402_Impurity_Investigation_Report.pdf`

**Scenario Summary:** Artemicort API Batch ART-2026-042 experienced an elevated HPLC degradation impurity (Impurity D-7 at 0.38% vs. limit <= 0.10%) following an 85-minute cooling plateau at 44.5°C caused by Crystallizer CR-04 chiller valve alarm AL-CH-309.

In the application:
1. Click **"Load Fictional Impurity Incident"** in the Copilot panel (or upload the demo PDF).
2. Click **"Extract & Populate Form"** to run live LangGraph extraction.
3. Review the populated RCA sections, provenance tags, and missing evidence requests.
4. Test the Copilot chat: *"Change batch number to ART-2026-042"* or *"Which evidence is missing?"*.
5. Click **"Run 5 Whys & CAPA"** to generate structured causal hypotheses and CAPAs.
6. As qualified reviewer, confirm the root cause and click **"Save Investigation"** to persist to PostgreSQL.
7. Open **"Saved Investigations"** to verify retrieval and reloading.

---

## 7. Compliance and Submission Restrictions
In strict adherence to assignment requirements:
- Built strictly for the **Root Cause Analysis (RCA)** module in API manufacturing.
- **NOT** published or uploaded to public repositories or external hosting platforms.
- Real API keys and credentials are kept out of committed artifacts.
- All demo data is explicitly labeled as **fictional and for demonstration purposes only**.
