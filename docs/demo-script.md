# ORYVEX — Product Demonstration Script (5–8 Minutes)

This script provides an exact, timing-budgeted walkthrough for demonstrating ORYVEX to evaluators and pharmaceutical quality professionals.

---

### Scene 1: Introduction & Problem Context (0:00 – 1:15)
- **Visual:** Open browser at `http://localhost:5173`. Show the enterprise navy branding, product title *"ORYVEX — AI-Powered Root Cause Intelligence System"*, and tagline *"Every anomaly has an origin."*
- **Script:**
  > *"Welcome to ORYVEX. In active pharmaceutical ingredient (API) manufacturing, an Out-of-Specification (OOS) lab result or temperature excursion triggers an intensive investigation under cGMP and FDA 21 CFR §211.192.*
  > *Quality investigators are often overwhelmed by dozens of pages of batch records, SCADA logs, and lab reports. Traditional software forces manual form-filling, leading to delays and missed evidence.*
  > *ORYVEX introduces an AI-powered investigation partner. Let's see how it intakes source reports, automatically populates structured forms, audits evidence gaps, generates 5 Whys and CAPA recommendations, and preserves strict human oversight."*

---

### Scene 2: Intake & AI-Powered Extraction (1:15 – 2:30)
- **Visual:**
  - In the Right Panel (ORYVEX AI Copilot), click the **"Load Fictional Impurity Incident"** button.
  - Show the text area populate with the fictional Artemicort API Batch ART-2026-042 report.
  - Point out that users can also upload digitally rendered PDFs.
  - Click **"Extract & Populate Form"**.
  - Highlight the processing indicator showing LangGraph node execution.
- **Script:**
  > *"Here we have an incident report for Artemicort API Batch ART-2026-042, where HPLC testing detected an unknown degradation impurity, Impurity D-7, at 0.38% against an acceptance limit of 0.10%.*
  > *When I click 'Extract & Populate Form', the FastAPI backend initiates our multi-step LangGraph workflow powered by Groq.*
  > *Notice that instantly, the left-hand RCA form is populated with the product name, batch number, crystallizer unit, observed result, and containment actions.*
  > *Crucially, notice the provenance tags. ORYVEX proves where each piece of information came from, and leaves unstated fields unknown rather than hallucinating plausible values."*

---

### Scene 3: Evidence Register & Missing Records (2:30 – 3:45)
- **Visual:**
  - Scroll down the Left Panel to **Section D: Evidence Register**.
  - Show the distinction between green `Supplied` badges and amber `Missing / Requested` badges.
  - Point out that ORYVEX flagged that SCADA temperature trends between 01:00 and 06:00 IST and sensor TT-204 calibration sheets are missing.
- **Script:**
  > *"A critical requirement in pharmaceutical quality is distinguishing supplied evidence from missing evidence.*
  > *In Section D, ORYVEX has registered the HPLC testing sheet as 'Supplied'.*
  > *At the same time, it identified critical evidence gaps: the SCADA continuous temperature trend and the calibration record for sensor TT-204. It flags these with 'Missing / Requested' badges so the investigator knows exactly what records to request from metrology and plant operations."*

---

### Scene 4: Interactive Copilot Chat & Structured Form Patching (3:45 – 4:45)
- **Visual:**
  - In the Copilot chat box, type or click: *"Change the batch number to ART-2026-042"*.
  - Show the Copilot reply with a confirmation and visual patch box.
  - Show the live batch number input in Section B update immediately with a violet *"Copilot Patch"* provenance tag.
  - Ask: *"Which evidence is currently missing?"* and show the AI contextual breakdown.
- **Script:**
  > *"Now let's observe our two-way interaction. The Copilot isn't just an isolated chatbot—it actively interacts with the structured Redux state.*
  > *When I instruct it to update a field, it validates the action against an allowlist, issues a structured patch, and updates the active form input in real time with full provenance tracking.*
  > *Manual user edits are protected, ensuring investigators maintain complete control."*

---

### Scene 5: 5 Whys, Ishikawa Root Causes, and CAPA (4:45 – 6:15)
- **Visual:**
  - Click **"Run 5 Whys & CAPA"** in the top toolbar.
  - Show **Section E (5 Whys)** populate:
    * Why 1: Impurity D-7 exceeded limit -> Thermal degradation.
    * Why 2: Temperature plateaued at 44.5°C for 85 minutes -> Chiller CH-02 valve alarm AL-CH-309.
    * Why 3: Solenoid valve seized due to mechanical seal wear.
  - Show **Section F (Root Cause Hypotheses)**: Category Machine, AI Confidence High, Confirmation Status **"Suggested"**.
  - Explain why it is not marked confirmed automatically.
  - Show user change status to **"Confirmed by qualified reviewer"**.
  - Show **Section G (CAPA Recommendations)**: Corrective overhaul of valve FV-309 and preventive recalibration with effectiveness verification.
- **Script:**
  > *"Now we trigger the deep root cause analysis. LangGraph traverses the evidence to build a logical 5 Whys progression that stops where facts run out, rather than fabricating speculative causes.*
  > *In Section F, our Ishikawa hypothesis categorizes this under 'Machine'.*
  > *In accordance with our human oversight policy, ORYVEX marks this as 'Suggested'. The AI cannot approve its own conclusion.*
  > *As the qualified investigator, once I verify the physical valve, I confirm the cause.*
  > *In Section G, ORYVEX proposes targeted CAPAs: overhaul the flow valve actuator, update maintenance intervals, and verify effectiveness across the next three commercial batches."*

---

### Scene 6: Qualified Review, PostgreSQL Persistence & Reload (6:15 – 7:30)
- **Visual:**
  - Fill in reviewer details: *"Dr. Arthur Vance"*, Role: *"QA Director"*, Status: *"Reviewed and Confirmed"*.
  - Click **"Save Investigation"**.
  - Show the status bar update: *"Last saved to PostgreSQL: [Time]"*.
  - Click **"Saved Investigations"** in the header.
  - Show the record in the slide-over PostgreSQL drawer.
  - Click **"Start New Investigation"** (form clears), then click the saved record from the drawer (form completely reloads with all evidence, 5 Whys, and CAPA intact).
- **Script:**
  > *"Finally, we record our qualified review notes and click 'Save Investigation'.*
  > *The entire relational tree is saved to PostgreSQL 18.*
  > *When we open our 'Saved Investigations' drawer, we can search, filter, and reopen our investigation at any time with full persistence across application restarts.*
  > *This is ORYVEX: turning complex manufacturing anomalies into structured, evidence-grounded investigations."*
