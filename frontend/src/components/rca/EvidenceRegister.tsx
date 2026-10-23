import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FileCheck, Plus, Trash2, HelpCircle } from "lucide-react";
import { RootState } from "../../app/store";
import { updateEvidenceItem, removeEvidenceItem } from "../../features/rca/rcaSlice";
import { EvidenceItem } from "../../types/rca";

export const EvidenceRegister: React.FC = () => {
  const dispatch = useDispatch();
  const evidenceItems = useSelector((state: RootState) => state.rca.currentInvestigation.evidence_items);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Batch Record");
  const [newStatus, setNewStatus] = useState<"Supplied" | "Missing / Requested">("Supplied");
  const [newRef, setNewRef] = useState("");

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
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <FileCheck size={18} color="var(--emerald-600)" />
          Section D: Evidence Register & Investigation Gaps ({evidenceItems.length})
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={14} /> Add Evidence Record
        </button>
      </div>

      {showAddForm && (
        <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
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
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          No evidence records captured yet. Upload an incident document or paste text in the Copilot panel to automatically extract and register evidence.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {evidenceItems.map((evd) => (
            <div
              key={evd.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: evd.evidence_status === "Missing / Requested" ? "#fed7aa" : "#e2e8f0",
                background: evd.evidence_status === "Missing / Requested" ? "#fffaf5" : "#ffffff",
              }}
            >
              <div style={{ flex: 1, paddingRight: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.75rem", fontWeight: 700, color: "#1e293b" }}>
                    {evd.id}
                  </span>
                  <span style={{ fontSize: "0.72rem", background: "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: "4px", color: "#475569" }}>
                    {evd.evidence_type}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.45rem",
                      borderRadius: "9999px",
                      background: evd.evidence_status === "Missing / Requested" ? "#fef3c7" : "#d1fae5",
                      color: evd.evidence_status === "Missing / Requested" ? "#d97706" : "#059669",
                    }}
                  >
                    {evd.evidence_status}
                  </span>
                  {evd.source_reference && (
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Ref: {evd.source_reference}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#0f172a", fontWeight: 500 }}>
                  {evd.description}
                </div>
                {evd.extracted_quote && (
                  <div style={{ fontSize: "0.78rem", color: "#64748b", fontStyle: "italic", marginTop: "0.25rem", borderLeft: "2px solid #cbd5e1", paddingLeft: "0.5rem" }}>
                    "{evd.extracted_quote}"
                  </div>
                )}
                {evd.related_question && (
                  <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>
                    Investigation question: {evd.related_question}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "0.2rem 0.4rem" }}
                  onClick={() => dispatch(removeEvidenceItem(evd.id))}
                  title="Remove record"
                >
                  <Trash2 size={13} color="#e11d48" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
