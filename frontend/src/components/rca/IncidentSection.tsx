import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AlertCircle, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";
import { Badge } from "../common/Badge";

export const IncidentSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  const getSeverityColor = (sev?: string | null) => {
    switch (sev) {
      case "Critical":
        return { bg: "rgba(239, 68, 68, 0.12)", border: "#ef4444", text: "#b91c1c" };
      case "Major":
        return { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", text: "#b45309" };
      default:
        return { bg: "rgba(6, 182, 212, 0.12)", border: "var(--turq-500)", text: "var(--turq-700)" };
    }
  };

  const sevStyle = getSeverityColor(inv.initial_severity);

  return (
    <div className="form-section-card" id="sec-incident">
      <div className="section-header">
        <div className="section-title">
          <AlertCircle size={18} color="var(--turq-600)" />
          Section C: Incident Description & OOS Severity Assessment
        </div>

        {inv.initial_severity && (
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              background: sevStyle.bg,
              border: `1.5px solid ${sevStyle.border}`,
              color: sevStyle.text,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <ShieldAlert size={14} />
            {inv.initial_severity} Severity
          </span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          Incident Summary
          <Badge type="provenance" value={inv.field_provenance.incident_summary?.source} />
        </label>
        <textarea
          className="form-textarea"
          style={{ minHeight: "70px", fontWeight: 500 }}
          value={inv.incident_summary || ""}
          onChange={(e) => dispatch(updateField({ field: "incident_summary", value: e.target.value }))}
          placeholder="Concise overview of the deviation or OOS measurement..."
        />
      </div>

      {/* Side-by-Side OOS Comparison Panel */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(15, 23, 42, 0.02))",
          border: "1px solid var(--turq-200)",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--turq-500)" }} />
          Analytical Deviation & Acceptance Criteria Delta
        </div>

        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: "#b91c1c" }}>
              Observed Result (Actual)
              <Badge type="provenance" value={inv.field_provenance.observed_result?.source} />
            </label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: "#fca5a5", background: "#fff5f5", fontWeight: 600 }}
              value={inv.observed_result || ""}
              onChange={(e) => dispatch(updateField({ field: "observed_result", value: e.target.value }))}
              placeholder="e.g. HPLC Impurity D-7 at 0.38% (w/w)"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ color: "#047857" }}>
              Expected Result / Specification Limit (Target)
              <Badge type="provenance" value={inv.field_provenance.expected_result?.source} />
            </label>
            <input
              type="text"
              className="form-input"
              style={{ borderColor: "#a7f3d0", background: "#f0fdf4", fontWeight: 600 }}
              value={inv.expected_result || ""}
              onChange={(e) => dispatch(updateField({ field: "expected_result", value: e.target.value }))}
              placeholder="e.g. Any individual unspecified impurity <= 0.10% (w/w)"
            />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">
            Immediate Containment Actions
            <Badge type="provenance" value={inv.field_provenance.immediate_containment?.source} />
          </label>
          <textarea
            className="form-textarea"
            value={inv.immediate_containment || ""}
            onChange={(e) => dispatch(updateField({ field: "immediate_containment", value: e.target.value }))}
            placeholder="Quarantine status, physical security tags applied, batch holds..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Potential Product Quality Impact
            <Badge type="provenance" value={inv.field_provenance.potential_impact?.source} />
          </label>
          <textarea
            className="form-textarea"
            value={inv.potential_impact || ""}
            onChange={(e) => dispatch(updateField({ field: "potential_impact", value: e.target.value }))}
            placeholder="Stability risks, crystal morphology impact, pharmacopeial compliance..."
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
        <div className="form-group">
          <label className="form-label">
            Initial Severity Level
            <Badge type="provenance" value={inv.field_provenance.initial_severity?.source} />
          </label>
          <select
            className="form-select"
            value={inv.initial_severity || "Major"}
            onChange={(e) => dispatch(updateField({ field: "initial_severity", value: e.target.value as any }))}
          >
            <option value="Minor">Minor Deviation</option>
            <option value="Major">Major Non-Conformance</option>
            <option value="Critical">Critical (Out-of-Specification)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Severity Rationale
            <Badge type="provenance" value={inv.field_provenance.severity_rationale?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.severity_rationale || ""}
            onChange={(e) => dispatch(updateField({ field: "severity_rationale", value: e.target.value }))}
            placeholder="Regulatory and quality justification for chosen severity"
          />
        </div>
      </div>
    </div>
  );
};

