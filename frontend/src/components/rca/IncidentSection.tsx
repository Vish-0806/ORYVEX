import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AlertCircle } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";
import { Badge } from "../common/Badge";

export const IncidentSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <AlertCircle size={18} color="var(--rose-600)" />
          Section C: Incident Description & Severity
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Incident Summary
          <Badge type="provenance" value={inv.field_provenance.incident_summary?.source} />
        </label>
        <textarea
          className="form-textarea"
          style={{ minHeight: "65px" }}
          value={inv.incident_summary || ""}
          onChange={(e) => dispatch(updateField({ field: "incident_summary", value: e.target.value }))}
          placeholder="Concise overview of the deviation or OOS measurement..."
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">
            Observed Result
            <Badge type="provenance" value={inv.field_provenance.observed_result?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.observed_result || ""}
            onChange={(e) => dispatch(updateField({ field: "observed_result", value: e.target.value }))}
            placeholder="e.g. HPLC Impurity D-7 at 0.38% (w/w)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Expected Result / Specification Limit
            <Badge type="provenance" value={inv.field_provenance.expected_result?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.expected_result || ""}
            onChange={(e) => dispatch(updateField({ field: "expected_result", value: e.target.value }))}
            placeholder="e.g. Any individual unspecified impurity <= 0.10% (w/w)"
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
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
