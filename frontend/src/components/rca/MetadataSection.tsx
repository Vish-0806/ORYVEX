import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FileText } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";
import { Badge } from "../common/Badge";

export const MetadataSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  return (
    <div className="form-section-card" id="sec-metadata">
      <div className="section-header">
        <div className="section-title">
          <div className="section-title-icon">
            <FileText size={16} />
          </div>
          Section A: Investigation Metadata & Origin
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">
            Department
            <Badge type="provenance" value={inv.field_provenance.department?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.department || ""}
            onChange={(e) => dispatch(updateField({ field: "department", value: e.target.value }))}
            placeholder="e.g., Quality Control / Chemical Synthesis"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Lead Investigator / Owner
            <Badge type="provenance" value={inv.field_provenance.investigation_owner?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.investigation_owner || ""}
            onChange={(e) => dispatch(updateField({ field: "investigation_owner", value: e.target.value }))}
            placeholder="Lead Quality Specialist name/role"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Source Intake Channel
            <Badge type="provenance" value={inv.field_provenance.source_type?.source} />
          </label>
          <select
            className="form-select"
            value={inv.source_type || "pasted_text"}
            onChange={(e) => dispatch(updateField({ field: "source_type", value: e.target.value }))}
          >
            <option value="pasted_text">Pasted Incident Narrative</option>
            <option value="pdf">Digitally Rendered PDF Report</option>
            <option value="email">Quality Assurance Email Alert</option>
          </select>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
        <div className="form-group">
          <label className="form-label">
            Incident Occurrence Date
            <Badge type="provenance" value={inv.field_provenance.incident_date?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.incident_date || ""}
            onChange={(e) => dispatch(updateField({ field: "incident_date", value: e.target.value }))}
            placeholder="YYYY-MM-DD or date string"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Date Discovered / Reported
            <Badge type="provenance" value={inv.field_provenance.date_discovered?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.date_discovered || ""}
            onChange={(e) => dispatch(updateField({ field: "date_discovered", value: e.target.value }))}
            placeholder="YYYY-MM-DD or date string"
          />
        </div>
      </div>
    </div>
  );
};
