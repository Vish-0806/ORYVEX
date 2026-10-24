import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PlusCircle, Database, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { resetToNewInvestigation } from "../../features/rca/rcaSlice";
import { setDrawerOpen } from "../../features/investigations/investigationsSlice";
import { checkHealth } from "../../services/api";

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);
  const [aiModel, setAiModel] = useState<string>("openai/gpt-oss-120b");

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setDbHealthy(data.database === "healthy");
        if (data.ai_engine?.model) setAiModel(data.ai_engine.model);
      })
      .catch(() => setDbHealthy(false));
  }, []);

  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo-mark">
          <span>O</span>
        </div>
        <div className="brand-title-wrap">
          <div className="brand-title">
            ORYVEX
            <span className="brand-badge">API Quality Intelligence</span>
          </div>
          <div className="brand-tagline">Every anomaly has an origin.</div>
        </div>
      </div>

      <div className="header-actions">
        {/* System Diagnostics Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginRight: "1rem" }}>
          {/* AI Engine Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.74rem",
              background: "rgba(6, 182, 212, 0.12)",
              color: "var(--turq-300)",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
            }}
          >
            <Sparkles size={13} color="var(--turq-400)" />
            <span>Groq AI: {aiModel}</span>
          </div>

          {/* Database Connection Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.74rem",
              background: dbHealthy ? "rgba(16, 185, 129, 0.12)" : "rgba(244, 63, 94, 0.12)",
              color: dbHealthy ? "#6ee7b7" : "#fda4af",
              border: `1px solid ${dbHealthy ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
            }}
          >
            {dbHealthy === true ? (
              <>
                <CheckCircle2 size={13} color="#10b981" />
                <span>PostgreSQL 18 Connected</span>
              </>
            ) : dbHealthy === false ? (
              <>
                <AlertCircle size={13} color="#f43f5e" />
                <span>Database Offline</span>
              </>
            ) : (
              <span>Verifying DB...</span>
            )}
          </div>
        </div>

        <button
          className="btn btn-dark"
          onClick={() => dispatch(setDrawerOpen(true))}
          title="Browse saved investigations in PostgreSQL"
        >
          <Database size={15} color="var(--turq-400)" />
          Saved Investigations
        </button>

        <button
          className="btn btn-primary"
          onClick={() => dispatch(resetToNewInvestigation())}
          title="Start fresh Root Cause Analysis investigation"
        >
          <PlusCircle size={15} />
          New Investigation
        </button>
      </div>
    </header>
  );
};
