import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Crosshair, ShieldAlert, CheckCircle2 } from "lucide-react";
import { RootState } from "../../app/store";
import { updateRootCauseConfirmation } from "../../features/rca/rcaSlice";
import { CauseConfirmationStatus } from "../../types/rca";
import { Badge } from "../common/Badge";

export const RootCauseSection: React.FC = () => {
  const dispatch = useDispatch();
  const hypotheses = useSelector((state: RootState) => state.rca.currentInvestigation.root_cause_hypotheses);

  const handleStatusChange = (id: string, status: CauseConfirmationStatus) => {
    dispatch(updateRootCauseConfirmation({ id, status }));
  };

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <Crosshair size={18} color="var(--violet-600)" />
          Section F: Potential Root Cause Hypotheses & Human Review ({hypotheses.length})
        </div>
      </div>

      <div style={{ background: "#f8fafc", padding: "0.6rem 0.85rem", borderRadius: "6px", fontSize: "0.78rem", color: "#475569", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #e2e8f0" }}>
        <ShieldAlert size={15} color="#6366f1" />
        <span>
          <strong>Human Oversight Rule:</strong> AI-generated causes are strictly hypotheses. Only a qualified Quality Professional may confirm the actual root cause following physical evidence verification.
        </span>
      </div>

      {hypotheses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          No root cause hypotheses formulated yet. Run analysis to identify potential contributing factors across Ishikawa 6M categories (Machine, Method, Material, Measurement, Man, Environment).
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {hypotheses.map((hyp) => (
            <div
              key={hyp.id}
              style={{
                border: "1px solid",
                borderColor: hyp.user_confirmation_status === "Confirmed by qualified reviewer" ? "#10b981" : "#e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                background: hyp.user_confirmation_status === "Confirmed by qualified reviewer" ? "#f0fdf4" : "#ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: "0.8rem", color: "#0f172a" }}>
                    {hyp.id}
                  </span>
                  <span style={{ fontSize: "0.72rem", background: "var(--navy-800)", color: "#fff", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>
                    Category: {hyp.category}
                  </span>
                  <span style={{ fontSize: "0.72rem", background: "var(--violet-50)", color: "var(--violet-600)", padding: "0.1rem 0.5rem", borderRadius: "4px", border: "1px solid var(--violet-100)" }}>
                    AI Confidence: {hyp.confidence_label}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>
                    Confirmation Status:
                  </span>
                  <select
                    className="form-select"
                    style={{
                      width: "auto",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      borderColor: hyp.user_confirmation_status === "Confirmed by qualified reviewer" ? "#10b981" : undefined
                    }}
                    value={hyp.user_confirmation_status}
                    onChange={(e) => handleStatusChange(hyp.id, e.target.value as CauseConfirmationStatus)}
                  >
                    <option value="Suggested">Suggested (AI Hypothesis)</option>
                    <option value="Under investigation">Under Investigation</option>
                    <option value="Supported by reviewed evidence">Supported by Reviewed Evidence</option>
                    <option value="Confirmed by qualified reviewer">✓ Confirmed by Qualified Reviewer</option>
                    <option value="Rejected">✗ Rejected (Rule Out)</option>
                  </select>
                </div>
              </div>

              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.4rem" }}>
                {hyp.description}
              </div>

              {hyp.reasoning && (
                <div style={{ fontSize: "0.82rem", color: "#475569", marginBottom: "0.5rem", lineHeight: 1.5 }}>
                  <strong>Causal Mechanism:</strong> {hyp.reasoning}
                </div>
              )}

              {hyp.evidence_needed && (
                <div style={{ fontSize: "0.78rem", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "4px", border: "1px solid #e2e8f0", color: "#64748b" }}>
                  <strong style={{ color: "#d97706" }}>Evidence Needed to Assess / Confirm:</strong> {hyp.evidence_needed}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
