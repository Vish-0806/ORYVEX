import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Save, Sparkles, Clock, AlertTriangle } from "lucide-react";
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
    <div className="investigation-toolbar">
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
            fontSize: "1.1rem",
            fontWeight: 600,
            border: "none",
            padding: "0.2rem 0",
            background: "transparent",
            color: "var(--navy-950)",
          }}
          placeholder="Investigation Title (e.g., OOS Impurity in Artemicort Batch ART-2026-042)"
        />

        {lastSavedAt && (
          <div style={{ fontSize: "0.72rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Clock size={12} />
            Last saved to PostgreSQL: {new Date(lastSavedAt).toLocaleTimeString()}
          </div>
        )}

        {saveError && (
          <div style={{ fontSize: "0.75rem", color: "#e11d48", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
            <AlertTriangle size={13} />
            {saveError}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          className="btn btn-secondary"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          title="Run LangGraph 5 Whys, Ishikawa Hypotheses, and CAPA generation"
        >
          <Sparkles size={15} color="var(--violet-600)" />
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
