import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Save, Sparkles, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { RootState } from "../../app/store";
import { 
  updateField, 
  setSaving, 
  setSaveSuccess, 
  setSaveError,
  setAnalyzing,
  populateFromAnalysis,
  setAnalysisError
} from "../../features/rca/rcaSlice";
import { saveInvestigation, runInvestigationAnalysis } from "../../services/api";
import { Badge } from "../common/Badge";

export const InvestigationHeader: React.FC = () => {
  const dispatch = useDispatch();
  const { currentInvestigation, isDirty, isSaving, lastSavedAt, saveError, isAnalyzing } = useSelector(
    (state: RootState) => state.rca
  );

  const handleSave = async () => {
    dispatch(setSaving(true));
    try {
      const saved = await saveInvestigation(currentInvestigation);
      dispatch(setSaveSuccess(saved));
    } catch (err: any) {
      dispatch(setSaveError(err.message || "Failed to save investigation to PostgreSQL"));
    }
  };

  const handleRunAnalysis = async () => {
    dispatch(setAnalyzing(true));
    try {
      const analysis = await runInvestigationAnalysis(
        currentInvestigation,
        currentInvestigation.evidence_items,
        currentInvestigation.id
      );
      dispatch(populateFromAnalysis(analysis));
    } catch (err: any) {
      dispatch(setAnalysisError(err.message || "Failed to execute RCA analysis"));
    }
  };

  return (
    <div className="investigation-toolbar" id="sec-toolbar">
      <div className="investigation-meta-left" style={{ flex: 1, marginRight: "1.5rem" }}>
        <div className="investigation-id-row">
          <span className="id-badge">{currentInvestigation.id}</span>
          <Badge type="status" value={currentInvestigation.status} />
          {currentInvestigation.initial_severity && (
            <Badge type="severity" value={currentInvestigation.initial_severity} />
          )}
          {isDirty && (
            <span style={{ fontSize: "0.75rem", color: "#d97706", display: "flex", alignItems: "center", gap: "0.2rem" }}>
              <span className="unsaved-dot" /> Unsaved changes
            </span>
          )}
        </div>

        <input
          type="text"
          value={currentInvestigation.title}
          onChange={(e) => dispatch(updateField({ field: "title", value: e.target.value }))}
          className="form-input"
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            border: "none",
            padding: "0.25rem 0",
            background: "transparent",
            color: "var(--ocean-950)",
            letterSpacing: "-0.02em",
          }}
          placeholder="Investigation Title (e.g., OOS Impurity in Artemicort Batch ART-2026-042)"
        />

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.2rem" }}>
          {lastSavedAt ? (
            <div style={{ fontSize: "0.73rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} color="#10b981" />
              <span>Saved to PostgreSQL: <strong>{new Date(lastSavedAt).toLocaleTimeString()}</strong></span>
            </div>
          ) : (
            <div style={{ fontSize: "0.73rem", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Clock size={12} />
              <span>Unsaved New Record</span>
            </div>
          )}

          {currentInvestigation.product_name && (
            <div style={{ fontSize: "0.73rem", color: "var(--turq-700)", fontWeight: 600, background: "var(--turq-50)", padding: "0.1rem 0.5rem", borderRadius: "4px", border: "1px solid var(--turq-100)" }}>
              API: {currentInvestigation.product_name}
            </div>
          )}

          {currentInvestigation.batch_number && (
            <div style={{ fontSize: "0.73rem", color: "var(--teal-700)", fontWeight: 600, background: "var(--teal-50)", padding: "0.1rem 0.5rem", borderRadius: "4px", border: "1px solid var(--teal-100)" }}>
              Batch: {currentInvestigation.batch_number}
            </div>
          )}
        </div>

        {saveError && (
          <div style={{ fontSize: "0.75rem", color: "#e11d48", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.4rem" }}>
            <AlertTriangle size={13} />
            {saveError}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          className="btn btn-turq-glow"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          title="Run LangGraph 5 Whys, Ishikawa Hypotheses, and CAPA generation"
        >
          <Sparkles size={16} />
          {isAnalyzing ? "Analyzing RCA..." : "Run 5 Whys & CAPA"}
        </button>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
          title="Persist complete investigation to PostgreSQL database"
        >
          <Save size={15} />
          {isSaving ? "Saving..." : "Save Investigation"}
        </button>
      </div>
    </div>
  );
};
