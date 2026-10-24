import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Cpu, FileText, FlaskConical, Scale, Users, Wind, CheckCircle2, AlertCircle } from "lucide-react";
import { RootState } from "../../app/store";
import { updateRootCauseConfirmation } from "../../features/rca/rcaSlice";
import { CauseConfirmationStatus, IshikawaCategory } from "../../types/rca";

const CATEGORY_ICONS: Record<IshikawaCategory, React.ReactNode> = {
  Machine: <Cpu size={15} color="var(--turq-600)" />,
  Method: <FileText size={15} color="var(--teal-600)" />,
  Material: <FlaskConical size={15} color="var(--turq-700)" />,
  Measurement: <Scale size={15} color="var(--turq-600)" />,
  Man: <Users size={15} color="var(--ocean-700)" />,
  Environment: <Wind size={15} color="var(--teal-600)" />,
};

const CATEGORIES: IshikawaCategory[] = ["Machine", "Method", "Material", "Measurement", "Man", "Environment"];

export const FishboneDiagram: React.FC = () => {
  const dispatch = useDispatch();
  const { currentInvestigation } = useSelector((state: RootState) => state.rca);
  const hypotheses = currentInvestigation.root_cause_hypotheses;

  const handleStatusChange = (id: string, status: CauseConfirmationStatus) => {
    dispatch(updateRootCauseConfirmation({ id, status }));
  };

  const getCausesByCategory = (cat: IshikawaCategory) => {
    return hypotheses.filter((h) => h.category.toLowerCase() === cat.toLowerCase());
  };

  return (
    <div className="fishbone-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--ocean-950)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--turq-600)" }}>Ishikawa 6M Causal Analysis Diagram</span>
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Interactive fishbone mapping potential contributing factors and root causes across 6 manufacturing dimensions.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--turq-500)" }} />
            Suggested Hypothesis
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
            Confirmed Root Cause
          </span>
        </div>
      </div>

      <div className="fishbone-spine">
        {/* The 6M Branches Grid */}
        <div className="fishbone-categories-grid">
          {CATEGORIES.map((cat) => {
            const causes = getCausesByCategory(cat);
            return (
              <div
                key={cat}
                className={`fishbone-category-card ${causes.length > 0 ? "has-cause" : ""}`}
              >
                <div className="fishbone-cat-header">
                  <div className="fishbone-cat-name">
                    {CATEGORY_ICONS[cat]}
                    {cat}
                  </div>
                  <span className="fishbone-cat-badge">
                    {causes.length} {causes.length === 1 ? "Cause" : "Causes"}
                  </span>
                </div>

                {causes.length === 0 ? (
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic", padding: "0.4rem 0" }}>
                    No anomalous factors identified in this branch.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {causes.map((c) => {
                      const isConfirmed = c.user_confirmation_status === "Confirmed by qualified reviewer";
                      return (
                        <div
                          key={c.id}
                          style={{
                            background: isConfirmed ? "#f0fdf4" : "var(--turq-50)",
                            border: `1.5px solid ${isConfirmed ? "#10b981" : "var(--turq-300)"}`,
                            borderRadius: "6px",
                            padding: "0.6rem",
                            fontSize: "0.78rem",
                            boxShadow: isConfirmed ? "0 0 10px rgba(16, 185, 129, 0.25)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                            <span style={{ fontFamily: "JetBrains Mono", fontWeight: 700, color: "var(--ocean-950)" }}>
                              {c.id}
                            </span>
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--turq-700)" }}>
                              AI: {c.confidence_label}
                            </span>
                          </div>

                          <div style={{ fontWeight: 600, color: "var(--ocean-900)", marginBottom: "0.35rem" }}>
                            {c.description}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.4rem", paddingTop: "0.35rem", borderTop: "1px solid rgba(6, 182, 212, 0.2)" }}>
                            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Status:</span>
                            <select
                              className="form-select"
                              style={{ width: "auto", padding: "0.15rem 0.4rem", fontSize: "0.7rem", fontWeight: 600 }}
                              value={c.user_confirmation_status}
                              onChange={(e) => handleStatusChange(c.id, e.target.value as CauseConfirmationStatus)}
                            >
                              <option value="Suggested">Suggested</option>
                              <option value="Under investigation">Under Investigation</option>
                              <option value="Supported by reviewed evidence">Supported by Evidence</option>
                              <option value="Confirmed by qualified reviewer">✓ Confirmed</option>
                              <option value="Rejected">✗ Rejected</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Central Spine Arrow & Problem Statement Head */}
        <div className="fishbone-head">
          <div className="fishbone-head-title">Observed Anomaly / Defect</div>
          <div className="fishbone-head-problem">
            {currentInvestigation.observed_result || currentInvestigation.incident_summary || "Out-of-Specification (OOS) Anomaly"}
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--turq-300)", borderTop: "1px solid rgba(6, 182, 212, 0.3)", paddingTop: "0.4rem" }}>
            Target Batch: <strong>{currentInvestigation.batch_number || "Pending Intake"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
