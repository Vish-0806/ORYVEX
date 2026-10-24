import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Crosshair, ShieldAlert, CheckCircle2, XCircle, Search, Sparkles } from "lucide-react";
import { RootState } from "../../app/store";
import { updateRootCauseConfirmation } from "../../features/rca/rcaSlice";
import { CauseConfirmationStatus } from "../../types/rca";

export const RootCauseSection: React.FC = () => {
  const dispatch = useDispatch();
  const hypotheses = useSelector((state: RootState) => state.rca.currentInvestigation.root_cause_hypotheses);

  const handleStatusChange = (id: string, status: CauseConfirmationStatus) => {
    dispatch(updateRootCauseConfirmation({ id, status }));
  };

  const confirmedCount = hypotheses.filter((h) => h.user_confirmation_status === "Confirmed by qualified reviewer").length;

  return (
    <div className="form-section-card" id="sec-rootcauses">
      <div className="section-header">
        <div className="section-title">
          <Crosshair size={18} color="var(--turq-600)" />
          Section F: Potential Root Cause Hypotheses & Human Review ({hypotheses.length})
        </div>

        {confirmedCount > 0 ? (
          <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <CheckCircle2 size={13} /> {confirmedCount} Confirmed Root Cause{confirmedCount > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="badge badge-turq">
            Pending Qualified Sign-Off
          </span>
        )}
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.03))",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          fontSize: "0.78rem",
          color: "var(--ocean-950)",
          marginBottom: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          border: "1px solid var(--turq-300)",
        }}
      >
        <ShieldAlert size={18} color="var(--turq-600)" />
        <span>
          <strong>GMP Human Oversight Mandate:</strong> AI-generated causes are strictly exploratory suggestions. Under EU/FDA cGMP Annex 11, only a qualified QA reviewer may affirm a causal mechanism after validating supporting records.
        </span>
      </div>

      {hypotheses.length === 0 ? (
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
                <Crosshair size={18} color="var(--turq-600)" />
                Ishikawa 6M Causal Discovery Framework
              </div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                AI analyzes registered evidence across all 6 pharmaceutical manufacturing dimensions to isolate probable root causes.
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
              Run 5 Whys & Causal Discovery
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            {[
              { cat: "Machine", desc: "Sensors, chillers, valves, agitators, calibrations" },
              { cat: "Method", desc: "Batch recipe, cooling curve kinetics, SOP execution" },
              { cat: "Material", desc: "Raw reagents, solvents, CoA conformance, vendor lots" },
              { cat: "Measurement", desc: "HPLC analytical drift, column resolution, baseline noise" },
              { cat: "Man", desc: "Shift handover, operator training, manual overrides" },
              { cat: "Environment", desc: "Cleanroom humidity, HVAC differential pressure, utilities" },
            ].map((p) => (
              <div
                key={p.cat}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "8px",
                  padding: "0.75rem 0.9rem",
                  boxShadow: "0 1px 3px rgba(6, 182, 212, 0.08)",
                }}
              >
                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--turq-800)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.2rem" }}>
                  {p.cat}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {hypotheses.map((hyp) => {
            const isConfirmed = hyp.user_confirmation_status === "Confirmed by qualified reviewer";
            const isRejected = hyp.user_confirmation_status === "Rejected";

            return (
              <div
                key={hyp.id}
                style={{
                  border: isConfirmed ? "2px solid #10b981" : isRejected ? "1px solid #fecaca" : "1.5px solid var(--border)",
                  borderRadius: "10px",
                  padding: "1.2rem",
                  background: isConfirmed ? "linear-gradient(to right, #f0fdf4, #ffffff)" : isRejected ? "#fef2f2" : "#ffffff",
                  boxShadow: isConfirmed ? "0 4px 15px rgba(16, 185, 129, 0.15)" : "var(--shadow-sm)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "JetBrains Mono", fontWeight: 800, fontSize: "0.8rem", color: "var(--ocean-950)" }}>
                      {hyp.id}
                    </span>
                    <span style={{ fontSize: "0.72rem", background: "var(--ocean-950)", color: "var(--turq-300)", padding: "0.15rem 0.55rem", borderRadius: "5px", fontWeight: 700 }}>
                      6M Branch: {hyp.category}
                    </span>
                    <span style={{ fontSize: "0.72rem", background: "var(--turq-50)", color: "var(--turq-800)", padding: "0.15rem 0.55rem", borderRadius: "5px", border: "1px solid var(--turq-200)", fontWeight: 600 }}>
                      AI Confidence: {hyp.confidence_label}
                    </span>
                  </div>

                  {/* Interactive Status Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(hyp.id, "Confirmed by qualified reviewer")}
                      style={{
                        background: isConfirmed ? "#10b981" : "transparent",
                        color: isConfirmed ? "#ffffff" : "#059669",
                        border: "1px solid #10b981",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.6rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        transition: "all 0.15s ease",
                      }}
                      title="Confirm this hypothesis as root cause"
                    >
                      <CheckCircle2 size={13} />
                      {isConfirmed ? "Confirmed Root Cause" : "Confirm"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(hyp.id, "Rejected")}
                      style={{
                        background: isRejected ? "#ef4444" : "transparent",
                        color: isRejected ? "#ffffff" : "#dc2626",
                        border: "1px solid #ef4444",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        transition: "all 0.15s ease",
                      }}
                      title="Rule out / reject hypothesis"
                    >
                      <XCircle size={13} />
                      {isRejected ? "Rejected" : "Rule Out"}
                    </button>

                    <select
                      className="form-select"
                      style={{
                        width: "auto",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                      value={hyp.user_confirmation_status}
                      onChange={(e) => handleStatusChange(hyp.id, e.target.value as CauseConfirmationStatus)}
                    >
                      <option value="Suggested">Suggested</option>
                      <option value="Under investigation">Under Investigation</option>
                      <option value="Supported by reviewed evidence">Supported by Evidence</option>
                      <option value="Confirmed by qualified reviewer">Confirmed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.45rem" }}>
                  {hyp.description}
                </div>

                {hyp.reasoning && (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-main)", marginBottom: "0.6rem", lineHeight: 1.5, background: "rgba(6, 182, 212, 0.04)", padding: "0.6rem 0.8rem", borderRadius: "6px", borderLeft: "3px solid var(--turq-500)" }}>
                    <strong style={{ color: "var(--turq-800)" }}>Causal Mechanism:</strong> {hyp.reasoning}
                  </div>
                )}

                {hyp.evidence_needed && (
                  <div style={{ fontSize: "0.78rem", background: "#fffbeb", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #fde68a", color: "#92400e" }}>
                    <strong style={{ color: "#b45309" }}>Evidence Verification Requirement:</strong> {hyp.evidence_needed}
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

