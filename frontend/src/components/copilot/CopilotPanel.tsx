import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Bot, Send, Upload, FileText, CheckCircle, 
  AlertCircle, Sparkles, RefreshCw, ArrowRight 
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

  const [chatInput, setChatInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, isChatLoading]);

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
            `**Extraction Completed.**\n\n` +
            `• Successfully populated **${result.extracted_fields?.length || 0} fields** on the RCA form.\n` +
            `• **${result.unknown_fields?.length || 0} fields** were absent in the source and preserved as unknown.\n` +
            `• Identified **${result.initial_evidence?.length || 0} evidence records** (including missing record requests).\n\n` +
            `*Next Step:* Review the populated fields, ask for corrections in chat, or trigger 5 Whys & CAPA analysis.`,
          timestamp: new Date().toISOString(),
          suggested_actions: [
            "Which evidence is missing?",
            "Run 5 Whys & Root Cause Analysis",
            "Change the batch number to ART-2026-042",
          ],
        })
      );
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

  return (
    <div className="copilot-panel">
      {/* Copilot Header */}
      <div className="copilot-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--violet-600)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Bot size={17} />
          </div>
          <div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--navy-900)" }}>
              ORYVEX AI Copilot
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Pharmaceutical Investigation Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Document & Incident Intake Section */}
      <div className="copilot-intake-card">
        <div className="intake-tabs">
          <button
            className={`tab-btn ${inputTab === "text" ? "active" : ""}`}
            onClick={() => dispatch(setInputTab("text"))}
          >
            <FileText size={13} style={{ display: "inline", marginRight: "4px" }} />
            Paste Incident Text
          </button>
          <button
            className={`tab-btn ${inputTab === "pdf" ? "active" : ""}`}
            onClick={() => dispatch(setInputTab("pdf"))}
          >
            <Upload size={13} style={{ display: "inline", marginRight: "4px" }} />
            Upload PDF Document
          </button>
        </div>

        {inputTab === "text" ? (
          <div>
            <textarea
              className="form-textarea"
              style={{ minHeight: "85px", fontSize: "0.8rem", marginBottom: "0.5rem" }}
              placeholder="Paste OOS lab notice, manufacturing deviation report, or quality email narrative..."
              value={pastedText}
              onChange={(e) => dispatch(setPastedText(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => dispatch(setPastedText(FICTIONAL_DEMO_TEXT))}
                title="Populate input with clearly identified fictional API batch scenario"
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
        ) : (
          <div>
            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
                background: "#ffffff",
                marginBottom: "0.5rem",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("pdf-file-input")?.click()}
            >
              <Upload size={22} color="var(--violet-600)" style={{ margin: "0 auto 0.4rem auto" }} />
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155" }}>
                {selectedFileName ? selectedFileName : "Click to select or drag PDF file"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Accepts digitally rendered PDF reports (Max 10MB)
              </div>
              <input
                id="pdf-file-input"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
        )}

        {isProcessing && (
          <div style={{ marginTop: "0.6rem", padding: "0.5rem 0.75rem", background: "var(--violet-50)", borderRadius: "6px", fontSize: "0.78rem", color: "var(--violet-700)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RefreshCw size={14} className="spin" />
            <span>{processingStep || "Executing LangGraph AI workflow..."}</span>
          </div>
        )}

        {error && (
          <div style={{ marginTop: "0.6rem", padding: "0.5rem 0.75rem", background: "#fff1f2", borderRadius: "6px", fontSize: "0.78rem", color: "#e11d48", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extraction Summary Card */}
      {extractionMeta && (
        <div style={{ padding: "0.75rem 1.25rem", background: "#f0fdfa", borderBottom: "1px solid #ccfbf1", fontSize: "0.78rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#0f766e", fontWeight: 600, marginBottom: "0.2rem" }}>
            <CheckCircle size={14} />
            AI Extraction Summary
          </div>
          <div style={{ color: "#334155" }}>{extractionMeta.summary}</div>
          {extractionMeta.missingNotices.length > 0 && (
            <div style={{ marginTop: "0.3rem", color: "#d97706" }}>
              <strong>Missing Records:</strong> {extractionMeta.missingNotices.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Copilot Chat Message Stream */}
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
                <div style={{ fontWeight: 600, color: "var(--violet-700)", marginBottom: "0.2rem" }}>
                  ✓ Updated Structured RCA Form Fields:
                </div>
                {Object.entries(msg.patch).map(([field, val]) => (
                  <div key={field}>
                    <strong>{field}:</strong> {String(val)}
                  </div>
                ))}
              </div>
            )}

            {/* Suggested action pills */}
            {msg.suggested_actions && msg.suggested_actions.length > 0 && (
              <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
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
            <RefreshCw size={14} className="spin" />
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Thinking & analyzing investigation context...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Area */}
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
            placeholder="Ask a question or command a field update (e.g. 'Set severity to Critical')..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isChatLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0 0.8rem" }}
            disabled={isChatLoading || !chatInput.trim()}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
