import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Bot, Send, Upload, FileText, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, ShieldCheck, 
  MessageSquare, Search, AlertTriangle, ChevronRight, Check
} from "lucide-react";
import { RootState } from "../../app/store";
import { 
  setInputTab, 
  setPastedText, 
  setSelectedFileName, 
  setProcessing, 
  setChatLoading, 
  addMessage, 
  setError 
} from "../../features/copilot/copilotSlice";
import { 
  populateFromExtraction, 
  applyStructuredPatch,
  setAnalyzing,
  populateFromAnalysis,
  setAnalysisError
} from "../../features/rca/rcaSlice";
import { 
  extractIncidentFromFile, 
  extractIncidentFromText, 
  sendCopilotChat,
  runInvestigationAnalysis
} from "../../services/api";

const FICTIONAL_DEMO_TEXT = `INCIDENT ID: INC-2026-0881
DATE DISCOVERED: 2026-10-18
INCIDENT DATE: 2026-10-17
DEPARTMENT: Quality Control / Chemical Synthesis Operations
INVESTIGATION OWNER: Dr. Elena Rostova (Lead QC Analytical Specialist)

PRODUCT AND BATCH INFORMATION:
Product Name: Artemicort API (Synthetic Glucocorticoid Intermediate)
Batch Number: ART-2026-042
Manufacturing Stage: Stage 3 — Final Crystallization & Solvent Recovery
Equipment Identifier: Crystallizer Unit CR-04 (Vessel Capacity: 2,500 L)
Affected Quantity: 480 kg (Bulk API Crystalline Powder, Lots 1-4)

INCIDENT SUMMARY:
During release testing of Artemicort API Batch ART-2026-042, high-performance liquid chromatography (HPLC) analytical testing detected an unknown degradation impurity (Impurity D-7) at an elevated level exceeding acceptance criteria.

OBSERVED RESULT:
HPLC assay showed Impurity D-7 at 0.38% (w/w).

EXPECTED RESULT / SPECIFICATION:
Finished API Specification SPC-ART-004 mandates: Any individual unspecified impurity <= 0.10% (w/w); Total impurities <= 0.50% (w/w).

IMMEDIATE CONTAINMENT ACTIONS:
1. Batch ART-2026-042 placed under physical and SAP quarantine status in Warehouse Bay 3B.
2. Red quarantine security tags applied to all 16 fiber drums.
3. Crystallizer CR-04 tagged out of service pending investigation.

PROCESS AND OPERATIONS CONTEXT:
Cooling curve called for 68.0°C to 12.0°C over 6.0 hours. Chiller CH-02 experienced an intermittent flow valve alarm (AL-CH-309) at ~02:40 IST on 2026-10-17. The temperature plateaued at 44.5°C for approximately 85 minutes before cooling resumed. Agitation was 65 RPM.

MISSING MANUFACTURING RECORDS:
- SCADA continuous temperature trend logs for Crystallizer CR-04 between 01:00 and 06:00 IST pending retrieval.
- Metrology calibration for Dual-RTD Sensor TT-204 pending review.
- Raw Material CoA for Reagent Grade Isopropanol Lot IPA-8839 not yet reviewed.

INITIAL SEVERITY: Critical
Severity Rationale: OOS analytical result impacting finished bulk drug substance purity.`;

export const CopilotPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, inputTab, pastedText, selectedFileName, isProcessing, processingStep, isChatLoading, error } = useSelector(
    (state: RootState) => state.copilot
  );
  const { currentInvestigation, extractionMeta } = useSelector((state: RootState) => state.rca);

  const [activePanelTab, setActivePanelTab] = useState<"chat" | "intake" | "gaps">("chat");
  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, isChatLoading, activePanelTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      dispatch(setSelectedFileName(file.name));
    }
  };

  const handleExtract = async () => {
    if (inputTab === "pdf" && !selectedFile) {
      dispatch(setError("Please select a PDF file first."));
      return;
    }
    if (inputTab === "text" && !pastedText.trim()) {
      dispatch(setError("Please paste incident text or email first."));
      return;
    }

    dispatch(setProcessing({ isProcessing: true, step: "Extracting structured incident fields via LangGraph & Groq..." }));

    try {
      let result;
      if (inputTab === "pdf" && selectedFile) {
        result = await extractIncidentFromFile(selectedFile);
      } else {
        result = await extractIncidentFromText(pastedText);
      }

      dispatch(populateFromExtraction(result));
      dispatch(setProcessing({ isProcessing: false }));

      // Add Copilot assistant message
      dispatch(
        addMessage({
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: 
            `**Extraction Completed Successfully.**\n\n` +
            `• Populated **${result.extracted_fields?.length || 0} fields** on the RCA form.\n` +
            `• Preserved **${result.unknown_fields?.length || 0} unstated fields** as unknown (zero-hallucination guarantee).\n` +
            `• Identified **${result.initial_evidence?.length || 0} evidence records** (including missing data requests).\n\n` +
            `*Recommended Next Action:* Inspect the highlighted missing records, command edits via chat, or click **"Run 5 Whys & CAPA"** to construct causal trees.`,
          timestamp: new Date().toISOString(),
          suggested_actions: [
            "Which evidence is missing?",
            "Run 5 Whys & Root Cause Analysis",
            "Change the batch number to ART-2026-042",
          ],
        })
      );

      // Automatically switch user to Chat tab to see conversation and next actions
      setActivePanelTab("chat");
    } catch (err: any) {
      dispatch(setError(err.message || "Extraction failed."));
      dispatch(setProcessing({ isProcessing: false }));
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = (customMessage || chatInput).trim();
    if (!textToSend) return;

    if (!customMessage) setChatInput("");

    // Add user message to state
    dispatch(
      addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        content: textToSend,
        timestamp: new Date().toISOString(),
      })
    );

    dispatch(setChatLoading(true));

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendCopilotChat(textToSend, currentInvestigation, history, currentInvestigation.id);

      // Check if structured patch was returned
      if (response.intent === "field_update" && response.patch && Object.keys(response.patch).length > 0) {
        dispatch(applyStructuredPatch(response.patch));
      }

      // Check if user requested analysis
      if (response.intent === "analyze_request") {
        dispatch(setAnalyzing(true));
        runInvestigationAnalysis(currentInvestigation, currentInvestigation.evidence_items, currentInvestigation.id)
          .then((analysis) => dispatch(populateFromAnalysis(analysis)))
          .catch((err) => dispatch(setAnalysisError(err.message)));
      }

      dispatch(
        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          timestamp: new Date().toISOString(),
          patch: response.patch,
          modified_fields: response.modified_fields,
          suggested_actions: response.suggested_actions,
          intent: response.intent,
        })
      );
      dispatch(setChatLoading(false));
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to communicate with Copilot."));
      dispatch(setChatLoading(false));
    }
  };

  const missingGapsCount = extractionMeta?.missingNotices?.length || 0;

  return (
    <div className="copilot-panel">
      {/* 1. Master Header */}
      <div className="copilot-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--turq-500)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 0 12px rgba(6, 182, 212, 0.4)" }}>
            <Bot size={17} />
          </div>
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--ocean-950)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              ORYVEX AI Copilot
              <span style={{ fontSize: "0.62rem", padding: "0.08rem 0.35rem", borderRadius: "9999px", background: "rgba(6, 182, 212, 0.12)", color: "var(--turq-700)", fontWeight: 700, border: "1px solid var(--turq-300)" }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              LangGraph + Groq Investigation Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="copilot-nav-tabs">
        <button
          type="button"
          className={`copilot-nav-tab ${activePanelTab === "chat" ? "active" : ""}`}
          onClick={() => setActivePanelTab("chat")}
        >
          <MessageSquare size={13} />
          AI Copilot Chat
        </button>
        <button
          type="button"
          className={`copilot-nav-tab ${activePanelTab === "intake" ? "active" : ""}`}
          onClick={() => setActivePanelTab("intake")}
        >
          <Upload size={13} />
          Document Intake
        </button>
        <button
          type="button"
          className={`copilot-nav-tab ${activePanelTab === "gaps" ? "active" : ""}`}
          onClick={() => setActivePanelTab("gaps")}
        >
          <Search size={13} />
          Audit Gaps
          {missingGapsCount > 0 && (
            <span className="copilot-tab-badge">{missingGapsCount}</span>
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT BODIES */}

      {/* --- TAB A: AI COPILOT CHAT --- */}
      {activePanelTab === "chat" && (
        <div style={{ flex: "1 1 0%", minHeight: 0, display: "flex", flexDirection: "column" }}>
          {/* Active Context Bar */}
          <div className="copilot-context-banner">
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <FileText size={13} color="var(--turq-600)" />
              <span style={{ fontWeight: 600 }}>
                {currentInvestigation.batch_number 
                  ? `Batch ${currentInvestigation.batch_number} • ${currentInvestigation.product_name || "API Intermediate"}`
                  : selectedFileName || "New Investigation Session"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
              {missingGapsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActivePanelTab("gaps")}
                  style={{
                    background: "#fef3c7",
                    color: "#b45309",
                    border: "1px solid #fde68a",
                    borderRadius: "4px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.45rem",
                    cursor: "pointer",
                  }}
                >
                  {missingGapsCount} Missing Records
                </button>
              )}
              <button
                type="button"
                onClick={() => setActivePanelTab("intake")}
                style={{
                  background: "transparent",
                  color: "var(--turq-700)",
                  border: "none",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Upload/Intake
              </button>
            </div>
          </div>

          {/* Scrollable Message Stream */}
          <div className="copilot-chat-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}`}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>

                {/* Structured Form Patch Visual Indicator */}
                {msg.patch && Object.keys(msg.patch).length > 0 && (
                  <div className="chat-bubble-patch">
                    <div style={{ fontWeight: 700, color: "var(--turq-800)", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <ShieldCheck size={13} color="var(--turq-600)" /> Updated Structured RCA Form Fields:
                    </div>
                    {Object.entries(msg.patch).map(([field, val]) => (
                      <div key={field} style={{ fontSize: "0.72rem", color: "var(--ocean-950)" }}>
                        <strong>{field}:</strong> {String(val)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested action pills */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div style={{ marginTop: "0.55rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {msg.suggested_actions.map((act, i) => (
                      <button
                        key={i}
                        className="suggestion-pill"
                        onClick={() => handleSendMessage(act)}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="chat-bubble chat-bubble-assistant" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RefreshCw size={14} className="spin" color="var(--turq-600)" />
                <span style={{ fontSize: "0.78rem", color: "var(--turq-800)", fontWeight: 500 }}>
                  Analyzing investigation context via Groq...
                </span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Input Form & Quick Prompt Suggestions */}
          <div className="copilot-input-area">
            <div className="prompt-suggestions">
              <button className="suggestion-pill" onClick={() => handleSendMessage("Which evidence is currently missing?")}>
                Which evidence is missing?
              </button>
              <button className="suggestion-pill" onClick={() => handleSendMessage("Change the batch number to ART-2026-042")}>
                Set batch to ART-2026-042
              </button>
              <button className="suggestion-pill" onClick={() => handleSendMessage("Explain the reasoning behind potential root cause number 1")}>
                Explain root cause 1
              </button>
              <button className="suggestion-pill" onClick={() => handleSendMessage("Suggest preventive actions for the suspected chiller issue")}>
                Suggest preventive actions
              </button>
            </div>

            <form
              className="chat-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                type="text"
                className="form-input"
                style={{ fontSize: "0.82rem", padding: "0.5rem 0.8rem" }}
                placeholder="Ask a question or command a field update (e.g. 'Set severity to Critical')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "0 0.85rem", flexShrink: 0 }}
                disabled={isChatLoading || !chatInput.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB B: DOCUMENT INTAKE --- */}
      {activePanelTab === "intake" && (
        <div className="copilot-tab-body">
          <div className="copilot-intake-card">
            <div style={{ marginBottom: "0.85rem", fontSize: "0.82rem", color: "var(--ocean-950)", fontWeight: 700 }}>
              Smart Ingestion & Extraction Engine
            </div>

            <div className="intake-tabs">
              <button
                className={`tab-btn ${inputTab === "pdf" ? "active" : ""}`}
                onClick={() => dispatch(setInputTab("pdf"))}
              >
                <Upload size={13} style={{ display: "inline", marginRight: "4px" }} />
                Upload PDF Document
              </button>
              <button
                className={`tab-btn ${inputTab === "text" ? "active" : ""}`}
                onClick={() => dispatch(setInputTab("text"))}
              >
                <FileText size={13} style={{ display: "inline", marginRight: "4px" }} />
                Paste Incident Text
              </button>
            </div>

            {inputTab === "pdf" ? (
              <div>
                <div
                  style={{
                    border: "2px dashed var(--turq-400)",
                    borderRadius: "10px",
                    padding: "1.5rem",
                    textAlign: "center",
                    background: "var(--turq-50)",
                    marginBottom: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => document.getElementById("pdf-file-input")?.click()}
                >
                  <Upload size={28} color="var(--turq-600)" style={{ margin: "0 auto 0.5rem auto" }} />
                  <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--ocean-950)" }}>
                    {selectedFileName ? selectedFileName : "Click to select or drag PDF file"}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    Accepts digitally rendered PDF reports (e.g. incident_report_ART-2026-042.pdf)
                  </div>
                  <input
                    id="pdf-file-input"
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    LangGraph 3-pass extraction
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleExtract}
                    disabled={isProcessing || !selectedFile}
                  >
                    <Sparkles size={14} />
                    {isProcessing ? "Extracting..." : "Process PDF & Populate"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "140px", fontSize: "0.8rem", marginBottom: "0.6rem", borderColor: "var(--turq-300)" }}
                  placeholder="Paste OOS lab notice, manufacturing deviation report, or quality email narrative..."
                  value={pastedText}
                  onChange={(e) => dispatch(setPastedText(e.target.value))}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => dispatch(setPastedText(FICTIONAL_DEMO_TEXT))}
                    title="Populate input with clearly identified fictional API batch scenario"
                    style={{ fontSize: "0.72rem" }}
                  >
                    Load Fictional Impurity Incident
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleExtract}
                    disabled={isProcessing || !pastedText.trim()}
                  >
                    <Sparkles size={14} />
                    {isProcessing ? "Extracting..." : "Extract & Populate Form"}
                  </button>
                </div>
              </div>
            )}

            {isProcessing && (
              <div style={{ marginTop: "0.85rem", padding: "0.75rem 1rem", background: "rgba(6, 182, 212, 0.08)", border: "1px solid var(--turq-300)", borderRadius: "8px", fontSize: "0.78rem", color: "var(--turq-800)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <RefreshCw size={14} className="spin" />
                <span>{processingStep || "Executing LangGraph AI workflow..."}</span>
              </div>
            )}

            {error && (
              <div style={{ marginTop: "0.85rem", padding: "0.75rem 1rem", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", fontSize: "0.78rem", color: "#e11d48", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick guide card */}
          <div style={{ padding: "1.25rem 1.4rem", margin: "1rem 1.4rem", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid var(--border-subtle)" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <ShieldCheck size={15} color="var(--turq-600)" />
              GMP Zero-Hallucination Protocol
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Under EU & FDA cGMP Annex 11, ORYVEX strictly grounds all extracted facts in explicit source document text. Any missing parameter (such as lot numbers, dates, or specifications) is preserved as unknown rather than assumed.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB C: AUDIT & EVIDENCE GAPS --- */}
      {activePanelTab === "gaps" && (
        <div className="copilot-tab-body" style={{ padding: "1.25rem 1.4rem" }}>
          {extractionMeta ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--turq-800)", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                <CheckCircle2 size={16} color="var(--turq-600)" />
                Extraction Summary & Data Provenance
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--ocean-950)", background: "#f0fdfa", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--turq-300)", marginBottom: "1rem" }}>
                {extractionMeta.summary}
              </div>

              {/* Missing Records Audit List */}
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", fontWeight: 700, color: "#b45309", marginBottom: "0.5rem" }}>
                  <AlertTriangle size={15} color="#d97706" />
                  Identified Missing Records & Audit Gaps ({missingGapsCount})
                </div>

                {extractionMeta.missingNotices.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {extractionMeta.missingNotices.map((notice, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "8px",
                          padding: "0.6rem 0.85rem",
                          fontSize: "0.74rem",
                          color: "#92400e",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.4rem",
                          lineHeight: 1.45,
                        }}
                      >
                        <span style={{ fontWeight: 800, color: "#d97706" }}>#{i + 1}</span>
                        <span>{notice}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.75rem", color: "var(--turq-700)", padding: "0.6rem", background: "#ecfeff", borderRadius: "6px" }}>
                    No critical evidence gaps detected. All mandatory records were referenced in source document.
                  </div>
                )}
              </div>

              {/* Action trigger */}
              <div style={{ marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", fontSize: "0.8rem" }}
                  onClick={() => {
                    setActivePanelTab("chat");
                    handleSendMessage("Which evidence is currently missing and how do we verify each gap?");
                  }}
                >
                  <MessageSquare size={14} />
                  Ask Copilot to Resolve Evidence Gaps
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <Search size={32} color="var(--turq-400)" style={{ margin: "0 auto 0.75rem auto" }} />
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.35rem" }}>
                No Document Extracted Yet
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                Upload an Out-of-Specification (OOS) report or deviation narrative in the Intake tab to run the automated AI Evidence Audit.
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActivePanelTab("intake")}
              >
                Go to Document Intake
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CopilotPanel;
