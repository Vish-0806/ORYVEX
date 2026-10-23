import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { GitBranch, AlertTriangle } from "lucide-react";
import { RootState } from "../../app/store";
import { updateFiveWhysStep } from "../../features/rca/rcaSlice";
import { FiveWhysStep } from "../../types/rca";

export const FiveWhysSection: React.FC = () => {
  const dispatch = useDispatch();
  const steps = useSelector((state: RootState) => state.rca.currentInvestigation.five_whys_steps);

  const handleStepChange = (updated: FiveWhysStep) => {
    dispatch(updateFiveWhysStep(updated));
  };

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <GitBranch size={18} color="var(--violet-600)" />
          Section E: 5 Whys Root Cause Investigation Methodology
        </div>
      </div>

      {steps.length === 0 ? (
        <div style={{ textAlign: "center", padding: "1.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
          No 5 Whys analysis performed yet. Click <strong>"Run 5 Whys & CAPA"</strong> in the top toolbar or prompt the Copilot to analyze potential causal chains based on registered evidence.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {steps.map((step) => (
            <div
              key={step.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span
                  style={{
                    background: "var(--navy-900)",
                    color: "var(--cyan-100)",
                    fontFamily: "JetBrains Mono",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  WHY #{step.step_order}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Evidence Strength:</span>
                  <select
                    className="form-select"
                    style={{ width: "auto", padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                    value={step.evidence_strength}
                    onChange={(e) => handleStepChange({ ...step, evidence_strength: e.target.value as any })}
                  >
                    <option value="Strong">Strong (Direct Sensor / Analytical Proof)</option>
                    <option value="Moderate">Moderate (Documented Correlation)</option>
                    <option value="Speculative / Unconfirmed">Speculative / Unconfirmed (Requires Review)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Why Question</label>
                  <input
                    type="text"
                    className="form-input"
                    value={step.why_question}
                    onChange={(e) => handleStepChange({ ...step, why_question: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Proposed Causal Answer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={step.proposed_answer}
                    onChange={(e) => handleStepChange({ ...step, proposed_answer: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-2" style={{ marginTop: "0.25rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Supporting Evidence Citation</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: "0.78rem" }}
                    value={step.supporting_evidence || ""}
                    onChange={(e) => handleStepChange({ ...step, supporting_evidence: e.target.value })}
                    placeholder="e.g. Temperature trend log EVD-01, chiller alarm log EVD-02"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem", color: "#d97706" }}>
                    Remaining Unknowns / Investigation Gap
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ fontSize: "0.78rem" }}
                    value={step.remaining_unknowns || ""}
                    onChange={(e) => handleStepChange({ ...step, remaining_unknowns: e.target.value })}
                    placeholder="Evidence still needed before deeper causal certainty can be confirmed"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
