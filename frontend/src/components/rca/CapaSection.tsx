import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckSquare, Plus, Trash2, CheckCircle2, AlertCircle, Clock, UserCheck, Sparkles } from "lucide-react";
import { RootState } from "../../app/store";
import { updateCapaAction, removeCapaAction } from "../../features/rca/rcaSlice";
import { CapaAction } from "../../types/rca";

export const CapaSection: React.FC = () => {
  const dispatch = useDispatch();
  const capas = useSelector((state: RootState) => state.rca.currentInvestigation.capa_actions);

  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<"Corrective" | "Preventive">("Corrective");
  const [newDesc, setNewDesc] = useState("");
  const [newRationale, setNewRationale] = useState("");
  const [newRole, setNewRole] = useState("Quality Assurance Specialist");
  const [newTimeframe, setNewTimeframe] = useState("14 Days");
  const [newVerification, setNewVerification] = useState("");

  const handleAdd = () => {
    if (!newDesc.trim()) return;
    const action: CapaAction = {
      id: `CAPA-${(capas.length + 1).toString().padStart(2, "0")}`,
      action_type: newType,
      description: newDesc.trim(),
      rationale: newRationale.trim() || undefined,
      suggested_role: newRole,
      suggested_timeframe: newTimeframe,
      effectiveness_verification: newVerification.trim() || undefined,
      status: "Proposed",
      review_status: "Awaiting Review",
    };
    dispatch(updateCapaAction(action));
    setNewDesc("");
    setNewRationale("");
    setNewVerification("");
    setShowAdd(false);
  };

  const approvedCount = capas.filter((c) => c.review_status === "Approved").length;

  return (
    <div className="form-section-card" id="sec-capa">
      <div className="section-header">
        <div className="section-title">
          <CheckSquare size={18} color="var(--turq-600)" />
          Section G: CAPA Recommendations & Effectiveness Verification ({capas.length})
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {approvedCount > 0 && (
            <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={13} /> {approvedCount} QA Approved
            </span>
          )}

          <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={14} /> Add CAPA Action
          </button>
        </div>
      </div>

      {showAdd && (
        <div style={{ background: "var(--turq-50)", padding: "1.2rem", borderRadius: "10px", border: "1px solid var(--turq-200)", marginBottom: "1.2rem" }}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Action Type</label>
              <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                <option value="Corrective">Corrective Action (Immediate Containment)</option>
                <option value="Preventive">Preventive Action (Systemic Recurrence Prevention)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Suggested Role</label>
              <input
                type="text"
                className="form-input"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Timeframe</label>
              <input
                type="text"
                className="form-input"
                value={newTimeframe}
                onChange={(e) => setNewTimeframe(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Action Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Overhaul flow control valve FV-309 and recalibrate chiller CH-02 loop"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Causal Rationale</label>
              <input
                type="text"
                className="form-input"
                placeholder="Why this action addresses the identified cause"
                value={newRationale}
                onChange={(e) => setNewRationale(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Effectiveness Verification Method</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Audit temperature curve on next 3 consecutive batches"
                value={newVerification}
                onChange={(e) => setNewVerification(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>Save CAPA Action</button>
          </div>
        </div>
      )}

      {capas.length === 0 ? (
        <div
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, var(--turq-50) 100%)",
            border: "1.5px solid var(--turq-300)",
            borderRadius: "12px",
            padding: "1.75rem 1.5rem",
            boxShadow: "inset 0 0 20px rgba(6, 182, 212, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--ocean-950)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckSquare size={18} color="var(--turq-600)" />
                21 CFR 211.192 CAPA Strategy & Action Framework
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                GMP compliance requires pairing immediate containment actions with long-term preventive engineering controls.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-turq-glow btn-sm"
              onClick={() => {
                const runBtn = document.querySelector("#sec-toolbar button.btn-turq-glow") as HTMLButtonElement;
                if (runBtn) runBtn.click();
              }}
            >
              <Sparkles size={14} />
              Generate AI CAPAs
            </button>
          </div>

          <div className="grid-2">
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid rgba(6, 182, 212, 0.3)",
                borderLeft: "4px solid var(--turq-500)",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 2px 6px rgba(6, 182, 212, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <span className="badge badge-turq" style={{ fontSize: "0.72rem" }}>
                  Corrective Pillar
                </span>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--ocean-950)" }}>
                  Immediate Containment
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Physical & ERP quarantine of implicated API batches, tagging out compromised equipment, and executing immediate remedial cleanings or repairs.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid rgba(16, 185, 129, 0.3)",
                borderLeft: "4px solid #10b981",
                borderRadius: "8px",
                padding: "1rem",
                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                <span className="badge badge-emerald" style={{ fontSize: "0.72rem" }}>
                  Preventive Pillar
                </span>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#065f46" }}>
                  Systemic Recurrence Elimination
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Preventive maintenance schedules, metrology calibration interval updates, SOP revisions, operator retraining, and consecutive 3-batch verification protocols.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {capas.map((capa) => {
            const isApproved = capa.review_status === "Approved";
            const isCorrective = capa.action_type === "Corrective";

            return (
              <div
                key={capa.id}
                style={{
                  border: isApproved ? "1.5px solid #10b981" : "1px solid var(--border)",
                  borderLeft: isCorrective ? "4px solid var(--turq-500)" : "4px solid #10b981",
                  borderRadius: "10px",
                  padding: "1.1rem",
                  background: isApproved ? "linear-gradient(to right, #f0fdf4, #ffffff)" : "#ffffff",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: "0.8rem", color: "var(--ocean-950)" }}>
                      {capa.id}
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.15rem 0.55rem",
                        borderRadius: "5px",
                        background: isCorrective ? "rgba(6, 182, 212, 0.12)" : "rgba(16, 185, 129, 0.12)",
                        color: isCorrective ? "var(--turq-700)" : "#059669",
                        border: isCorrective ? "1px solid var(--turq-300)" : "1px solid #a7f3d0",
                      }}
                    >
                      {capa.action_type} Action
                    </span>
                    {capa.suggested_role && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <UserCheck size={12} /> {capa.suggested_role}
                      </span>
                    )}
                    {capa.suggested_timeframe && (
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={12} /> {capa.suggested_timeframe}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => dispatch(updateCapaAction({ ...capa, review_status: isApproved ? "Awaiting Review" : "Approved" }))}
                      style={{
                        background: isApproved ? "#10b981" : "transparent",
                        color: isApproved ? "#ffffff" : "#059669",
                        border: "1px solid #10b981",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.2rem 0.55rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <CheckCircle2 size={12} />
                      {isApproved ? "Approved" : "Approve"}
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: "0.2rem 0.4rem" }}
                      onClick={() => dispatch(removeCapaAction(capa.id))}
                      title="Remove CAPA"
                    >
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.35rem" }}>
                  {capa.description}
                </div>

                {capa.rationale && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-main)", marginBottom: "0.4rem", lineHeight: 1.5 }}>
                    <strong style={{ color: "var(--turq-800)" }}>Causal Rationale:</strong> {capa.rationale}
                  </div>
                )}

                {capa.effectiveness_verification && (
                  <div style={{ fontSize: "0.78rem", background: "linear-gradient(to right, #f0fdf4, #ffffff)", padding: "0.5rem 0.75rem", borderRadius: "6px", color: "#166534", border: "1px solid #bbf7d0", marginTop: "0.4rem" }}>
                    <strong style={{ color: "#15803d" }}>Effectiveness Verification Protocol:</strong> {capa.effectiveness_verification}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

