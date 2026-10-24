import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FileCheck, Plus, Trash2, HelpCircle, AlertTriangle, CheckCircle2, Filter } from "lucide-react";
import { RootState } from "../../app/store";
import { updateEvidenceItem, removeEvidenceItem } from "../../features/rca/rcaSlice";
import { EvidenceItem } from "../../types/rca";

export const EvidenceRegister: React.FC = () => {
  const dispatch = useDispatch();
  const evidenceItems = useSelector((state: RootState) => state.rca.currentInvestigation.evidence_items);

  const [filter, setFilter] = useState<"ALL" | "SUPPLIED" | "MISSING">("ALL");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Batch Record");
  const [newStatus, setNewStatus] = useState<"Supplied" | "Missing / Requested">("Supplied");
  const [newRef, setNewRef] = useState("");

  const missingCount = evidenceItems.filter((e) => e.evidence_status === "Missing / Requested").length;
  const suppliedCount = evidenceItems.filter((e) => e.evidence_status === "Supplied").length;

  const filteredItems = evidenceItems.filter((e) => {
    if (filter === "SUPPLIED") return e.evidence_status === "Supplied";
    if (filter === "MISSING") return e.evidence_status === "Missing / Requested";
    return true;
  });

  const handleAdd = () => {
    if (!newDesc.trim()) return;
    const item: EvidenceItem = {
      id: `EVD-${(evidenceItems.length + 1).toString().padStart(2, "0")}`,
      description: newDesc.trim(),
      evidence_type: newType,
      source_reference: newRef.trim() || undefined,
      evidence_status: newStatus,
    };
    dispatch(updateEvidenceItem(item));
    setNewDesc("");
    setNewRef("");
    setShowAddForm(false);
  };

  return (
    <div className="form-section-card" id="sec-evidence">
      <div className="section-header">
        <div className="section-title">
          <FileCheck size={18} color="var(--turq-600)" />
          Section D: Evidence Register & Investigation Gaps ({evidenceItems.length})
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {/* Quick Filter Buttons */}
          <div style={{ display: "flex", background: "var(--ocean-950)", padding: "0.2rem", borderRadius: "6px" }}>
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              style={{
                border: "none",
                background: filter === "ALL" ? "var(--turq-500)" : "transparent",
                color: filter === "ALL" ? "#ffffff" : "var(--turq-300)",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              All ({evidenceItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("SUPPLIED")}
              style={{
                border: "none",
                background: filter === "SUPPLIED" ? "var(--turq-500)" : "transparent",
                color: filter === "SUPPLIED" ? "#ffffff" : "var(--turq-300)",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Supplied ({suppliedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("MISSING")}
              style={{
                border: "none",
                background: filter === "MISSING" ? "#f59e0b" : "transparent",
                color: filter === "MISSING" ? "#ffffff" : "#fcd34d",
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Gaps ({missingCount})
            </button>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={14} /> Add Evidence
          </button>
        </div>
      </div>

      {/* Missing evidence alert banner if any */}
      {missingCount > 0 && (
        <div
          style={{
            background: "linear-gradient(to right, #fffbeb, #ffffff)",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <AlertTriangle size={16} color="#d97706" />
            <span style={{ fontSize: "0.78rem", color: "#92400e", fontWeight: 600 }}>
              AI Audit: <strong>{missingCount} missing evidence item{missingCount > 1 ? "s" : ""}</strong> required before root cause can be scientifically certified.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilter("MISSING")}
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              color: "#b45309",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Filter Gaps
          </button>
        </div>
      )}

      {showAddForm && (
        <div style={{ background: "var(--turq-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--turq-200)", marginBottom: "1rem" }}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Evidence Type</label>
              <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="Batch Record">Batch Record (BMR/MPR)</option>
                <option value="Analytical Log">Analytical Log (HPLC/GC)</option>
                <option value="Calibration">Calibration Log</option>
                <option value="Temperature Log">Temperature / SCADA Log</option>
                <option value="SOP">Standard Operating Procedure</option>
                <option value="Personnel Record">Training / Shift Log</option>
                <option value="Other">Other Diagnostic Record</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Evidence Status</label>
              <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)}>
                <option value="Supplied">Supplied / Available</option>
                <option value="Missing / Requested">Missing / Requested by Investigator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Source Citation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SCADA Historian, BMR Page 22"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Evidence Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Temperature trend log for Crystallizer CR-04 between 01:00 and 06:00 IST"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save Record</button>
          </div>
        </div>
      )}

      {evidenceItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", background: "var(--turq-50)", borderRadius: "8px", border: "1px dashed var(--turq-300)" }}>
          <FileCheck size={28} color="var(--turq-500)" style={{ margin: "0 auto 0.5rem", display: "block" }} />
          <strong>No evidence records captured yet.</strong>
          <div style={{ marginTop: "0.25rem" }}>
            Upload an incident document or paste text in the Copilot panel to automatically extract and register evidence.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {filteredItems.map((evd) => {
            const isMissing = evd.evidence_status === "Missing / Requested";
            return (
              <div
                key={evd.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  border: isMissing ? "1px solid #fed7aa" : "1px solid var(--border)",
                  borderLeft: isMissing ? "4px solid #f59e0b" : "4px solid var(--turq-500)",
                  background: isMissing ? "#fffdfa" : "#ffffff",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ flex: 1, paddingRight: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.75rem", fontWeight: 700, color: "var(--ocean-950)" }}>
                      {evd.id}
                    </span>
                    <span style={{ fontSize: "0.72rem", background: "var(--turq-50)", border: "1px solid var(--turq-200)", padding: "0.1rem 0.45rem", borderRadius: "4px", color: "var(--turq-800)", fontWeight: 600 }}>
                      {evd.evidence_type}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        background: isMissing ? "#fef3c7" : "rgba(6, 182, 212, 0.12)",
                        color: isMissing ? "#b45309" : "var(--turq-700)",
                        border: isMissing ? "1px solid #fde68a" : "1px solid var(--turq-300)",
                      }}
                    >
                      {evd.evidence_status}
                    </span>
                    {evd.source_reference && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Source: <strong>{evd.source_reference}</strong>
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ocean-950)", fontWeight: 600 }}>
                    {evd.description}
                  </div>
                  {evd.extracted_quote && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.35rem", borderLeft: "2px solid var(--turq-400)", paddingLeft: "0.5rem" }}>
                      "{evd.extracted_quote}"
                    </div>
                  )}
                  {evd.related_question && (
                    <div style={{ fontSize: "0.75rem", color: "#d97706", marginTop: "0.35rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <HelpCircle size={13} />
                      Investigation Gap Question: {evd.related_question}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "0.25rem 0.45rem" }}
                    onClick={() => dispatch(removeEvidenceItem(evd.id))}
                    title="Remove record"
                  >
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

