import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ClipboardCheck, UserCheck } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";

export const ReviewSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <ClipboardCheck size={18} color="var(--violet-600)" />
          Section H: Qualified Review, Confirmation & Sign-Off
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">Qualified Reviewer Name</label>
          <input
            type="text"
            className="form-input"
            value={inv.reviewer_name || ""}
            onChange={(e) => dispatch(updateField({ field: "reviewer_name", value: e.target.value }))}
            placeholder="e.g. Dr. Arthur Vance"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reviewer Role</label>
          <input
            type="text"
            className="form-input"
            value={inv.reviewer_role || ""}
            onChange={(e) => dispatch(updateField({ field: "reviewer_role", value: e.target.value }))}
            placeholder="e.g. Quality Assurance Director"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Review Confirmation Status</label>
          <select
            className="form-select"
            value={inv.confirmation_status || "Pending Review"}
            onChange={(e) => {
              const val = e.target.value;
              dispatch(updateField({ field: "confirmation_status", value: val }));
              if (val === "Reviewed and Confirmed") {
                dispatch(updateField({ field: "status", value: "Review completed" }));
              }
            }}
          >
            <option value="Pending Review">Pending Qualified Review</option>
            <option value="Reviewed and Confirmed">Reviewed and Confirmed (Disposition Authorized)</option>
            <option value="Revisions Requested">Revisions Requested</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: "0.5rem" }}>
        <label className="form-label">Formal Review Notes & Regulatory Disposition</label>
        <textarea
          className="form-textarea"
          value={inv.review_notes || ""}
          onChange={(e) => dispatch(updateField({ field: "review_notes", value: e.target.value }))}
          placeholder="Document quality unit rationales, physical verification audits, and batch release or reject recommendations..."
        />
      </div>
    </div>
  );
};
