import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
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

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <CheckSquare size={18} color="var(--emerald-600)" />
          Section G: CAPA Recommendations & Effectiveness Verification ({capas.length})
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> Add CAPA Action
        </button>
      </div>

      {showAdd && (
        <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Action Type</label>
              <select className="form-select" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                <option value="Corrective">Corrective Action (Immediate Fix/Containment)</option>
                <option value="Preventive">Preventive Action (Systemic/Recurrence Prevention)</option>
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
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          No CAPA actions defined yet. Run the investigation analysis to generate justified Corrective and Preventive actions based on identified root causes.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {capas.map((capa) => (
            <div
              key={capa.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: "0.8rem", color: "#0f172a" }}>
                    {capa.id}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.5rem",
                      borderRadius: "4px",
                      background: capa.action_type === "Corrective" ? "var(--amber-50)" : "var(--emerald-50)",
                      color: capa.action_type === "Corrective" ? "var(--amber-600)" : "var(--emerald-600)",
                      border: "1px solid",
                      borderColor: capa.action_type === "Corrective" ? "var(--amber-100)" : "var(--emerald-100)",
                    }}
                  >
                    {capa.action_type}
                  </span>
                  {capa.suggested_role && (
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Role: {capa.suggested_role}
                    </span>
                  )}
                  {capa.suggested_timeframe && (
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      Timeframe: {capa.suggested_timeframe}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <select
                    className="form-select"
                    style={{ width: "auto", padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                    value={capa.review_status}
                    onChange={(e) => dispatch(updateCapaAction({ ...capa, review_status: e.target.value as any }))}
                  >
                    <option value="Awaiting Review">Awaiting Review</option>
                    <option value="Approved">Approved by QA</option>
                    <option value="Needs Revision">Needs Revision</option>
                  </select>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: "0.2rem 0.4rem" }}
                    onClick={() => dispatch(removeCapaAction(capa.id))}
                  >
                    <Trash2 size={13} color="#e11d48" />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.25rem" }}>
                {capa.description}
              </div>

              {capa.rationale && (
                <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "0.25rem" }}>
                  <strong>Rationale:</strong> {capa.rationale}
                </div>
              )}

              {capa.effectiveness_verification && (
                <div style={{ fontSize: "0.78rem", background: "#f0fdf4", padding: "0.4rem 0.6rem", borderRadius: "4px", color: "#166534", border: "1px solid #bbf7d0", marginTop: "0.35rem" }}>
                  <strong>Verification Method:</strong> {capa.effectiveness_verification}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
