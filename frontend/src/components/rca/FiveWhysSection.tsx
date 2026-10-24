import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { GitBranch, Network, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { RootState } from "../../app/store";
import { updateFiveWhysStep } from "../../features/rca/rcaSlice";
import { FiveWhysStep } from "../../types/rca";
import { FishboneDiagram } from "./FishboneDiagram";

export const FiveWhysSection: React.FC = () => {
  const dispatch = useDispatch();
  const steps = useSelector((state: RootState) => state.rca.currentInvestigation.five_whys_steps);
  const [activeTab, setActiveTab] = useState<"five_whys" | "fishbone">("five_whys");

  const handleStepChange = (updated: FiveWhysStep) => {
    dispatch(updateFiveWhysStep(updated));
  };

  return (
    <div className="form-section-card" id="sec-methodology">
      <div className="section-header">
        <div className="section-title">
          <GitBranch size={18} color="var(--turq-600)" />
          Section E: Root Cause Analysis Methodology & Causal Modeling
        </div>

        {/* Methodology Toggle Tabs */}
        <div style={{ display: "flex", gap: "0.4rem", background: "var(--ocean-950)", padding: "0.25rem", borderRadius: "8px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("five_whys")}
            style={{
              background: activeTab === "five_whys" ? "var(--turq-500)" : "transparent",
              color: activeTab === "five_whys" ? "#ffffff" : "var(--turq-300)",
              border: "none",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <GitBranch size={14} />
            5 Whys Causal Chain ({steps.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("fishbone")}
            style={{
              background: activeTab === "fishbone" ? "var(--turq-500)" : "transparent",
              color: activeTab === "fishbone" ? "#ffffff" : "var(--turq-300)",
              border: "none",
              borderRadius: "6px",
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <Network size={14} />
            Ishikawa 6M Fishbone
          </button>
        </div>
      </div>

      {activeTab === "fishbone" ? (
        <FishboneDiagram />
      ) : (
        <>
          {steps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", background: "var(--turq-50)", borderRadius: "8px", border: "1px dashed var(--turq-300)" }}>
              <GitBranch size={32} color="var(--turq-500)" style={{ margin: "0 auto 0.75rem", display: "block" }} />
              <strong>No 5 Whys analysis performed yet.</strong>
              <div style={{ marginTop: "0.35rem" }}>
                Click <strong>"Run 5 Whys & CAPA"</strong> in the top toolbar or prompt the AI Copilot to construct causal chains based on registered evidence.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>Causal ladder progressing from direct symptom to root systemic vulnerability:</span>
              </div>

              {steps.map((step, idx) => {
                const isRoot = idx === steps.length - 1;
                return (
                  <div
                    key={step.id}
                    style={{
                      border: isRoot ? "2px solid var(--turq-500)" : "1px solid var(--border)",
                      borderRadius: "10px",
                      padding: "1.2rem",
                      background: isRoot ? "linear-gradient(to right, #ffffff, var(--turq-50))" : "#ffffff",
                      boxShadow: isRoot ? "0 4px 15px rgba(6, 182, 212, 0.12)" : "var(--shadow-sm)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span
                          style={{
                            background: isRoot ? "var(--ocean-950)" : "var(--turq-600)",
                            color: "#ffffff",
                            fontFamily: "JetBrains Mono",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "6px",
                            boxShadow: "0 2px 4px rgba(6, 182, 212, 0.25)",
                          }}
                        >
                          WHY #{step.step_order}
                        </span>
                        {isRoot && (
                          <span className="badge badge-turq" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                            Target Root Cause Level
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600 }}>Evidence Strength:</span>
                        <select
                          className="form-select"
                          style={{
                            width: "auto",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            borderColor: step.evidence_strength === "Strong" ? "var(--turq-500)" : undefined,
                          }}
                          value={step.evidence_strength}
                          onChange={(e) => handleStepChange({ ...step, evidence_strength: e.target.value as any })}
                        >
                          <option value="Strong">Strong (Direct Sensor / Analytical Proof)</option>
                          <option value="Moderate">Moderate (Documented Correlation)</option>
                          <option value="Speculative / Unconfirmed">Speculative / Unconfirmed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          Why Question <HelpCircle size={12} color="var(--turq-500)" />
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={step.why_question}
                          onChange={(e) => handleStepChange({ ...step, why_question: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ color: "var(--ocean-900)", fontWeight: 700 }}>
                          Proposed Causal Answer
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ borderColor: "var(--turq-400)", fontWeight: 500 }}
                          value={step.proposed_answer}
                          onChange={(e) => handleStepChange({ ...step, proposed_answer: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ marginTop: "0.6rem" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          Supporting Evidence Citation
                        </label>
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
                        <label className="form-label" style={{ fontSize: "0.72rem", color: "#d97706" }}>
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
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

