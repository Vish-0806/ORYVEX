import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PlusCircle, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { resetToNewInvestigation } from "../../features/rca/rcaSlice";
import { setDrawerOpen } from "../../features/investigations/investigationsSlice";
import { checkHealth } from "../../services/api";

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const [dbHealthy, setDbHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth()
      .then((data) => setDbHealthy(data.database === "healthy"))
      .catch(() => setDbHealthy(false));
  }, []);

  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-logo-mark">O</div>
        <div>
          <div className="brand-title">ORYVEX</div>
          <div className="brand-tagline">Every anomaly has an origin.</div>
        </div>
      </div>

      <div className="header-actions">
        {/* Backend / Database Connection Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", marginRight: "1rem" }}>
          {dbHealthy === true ? (
            <>
              <CheckCircle2 size={14} color="#10b981" />
              <span style={{ color: "#94a3b8" }}>PostgreSQL 18 Connected</span>
            </>
          ) : dbHealthy === false ? (
            <>
              <AlertCircle size={14} color="#f43f5e" />
              <span style={{ color: "#fda4af" }}>Database Offline</span>
            </>
          ) : (
            <span style={{ color: "#94a3b8" }}>Connecting...</span>
          )}
        </div>

        <button
          className="btn btn-dark"
          onClick={() => dispatch(setDrawerOpen(true))}
          title="Browse saved investigations in PostgreSQL"
        >
          <Database size={15} />
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
