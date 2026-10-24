import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { ClipboardCheck, UserCheck, ShieldCheck, Award, FileSignature } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";

export const ReviewSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  const isConfirmed = inv.confirmation_status === "Reviewed and Confirmed";

  const handleQuickSign = () => {
    dispatch(updateField({ field: "reviewer_name", value: "Dr. Elena Rostova, PhD" }));
    dispatch(updateField({ field: "reviewer_role", value: "VP of Quality Assurance & Regulatory Affairs" }));
    dispatch(updateField({ field: "confirmation_status", value: "Reviewed and Confirmed" }));
    dispatch(updateField({ field: "status", value: "Review completed" }));
    if (!inv.review_notes) {
      dispatch(updateField({
        field: "review_notes",
        value: "Investigation reviewed in full accordance with 21 CFR Part 211.192. Root cause hypothesis regarding chilling circuit thermal instability has been confirmed against historian logs. Corrective and preventive actions are approved for immediate execution."
      }));
    }
  };

  return (
    <div className="form-section-card" id="sec-review">
      <div className="section-header">
        <div className="section-title">
          <ClipboardCheck size={18} color="var(--turq-600)" />
          Section H: Qualified QA Sign-Off & Regulatory Disposition
        </div>

        {isConfirmed ? (
          <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <Award size={14} /> 21 CFR Part 11 Certified Sign-Off
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleQuickSign}
            style={{ display: "flex", alignItems: "center", gap: "0.35rem", borderColor: "var(--turq-400)", color: "var(--turq-800)" }}
          >
            <FileSignature size={14} color="var(--turq-600)" /> Quick Sign as Qualified QA Lead
          </button>
        )}
      </div>

      {isConfirmed && (
        <div
          style={{
            background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
            border: "1.5px solid #10b981",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#10b981", color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "#065f46", fontSize: "0.88rem" }}>
                GMP Investigation Legally Confirmed & Authorized
              </div>
              <div style={{ fontSize: "0.75rem", color: "#047857" }}>
                Signed by <strong>{inv.reviewer_name || "QA Authorized"}</strong> ({inv.reviewer_role || "QA Lead"})
              </div>
            </div>
          </div>
          <span style={{ fontSize: "0.72rem", background: "#ffffff", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid #a7f3d0", color: "#065f46", fontFamily: "JetBrains Mono", fontWeight: 700 }}>
            DISPOSITION: AUTHORIZED
          </span>
        </div>
      )}

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

      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="form-label">Formal Review Notes & Regulatory Disposition</label>
        <textarea
          className="form-textarea"
          style={{ minHeight: "85px" }}
          value={inv.review_notes || ""}
          onChange={(e) => dispatch(updateField({ field: "review_notes", value: e.target.value }))}
          placeholder="Document quality unit rationales, physical verification audits, and batch release or reject recommendations..."
        />
      </div>
    </div>
  );
};

