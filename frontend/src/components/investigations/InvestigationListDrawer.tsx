import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Search, Database, Clock, RefreshCw, ChevronRight } from "lucide-react";
import { RootState } from "../../app/store";
import { 
  setDrawerOpen, 
  setSearchQuery, 
  setStatusFilter, 
  setItems, 
  setLoading, 
  setError 
} from "../../features/investigations/investigationsSlice";
import { loadInvestigation, resetToNewInvestigation } from "../../features/rca/rcaSlice";
import { listInvestigations, getInvestigation } from "../../services/api";
import { Badge } from "../common/Badge";

export const InvestigationListDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { items, isLoading, error, isDrawerOpen, searchQuery, statusFilter } = useSelector(
    (state: RootState) => state.investigations
  );

  const fetchItems = async () => {
    dispatch(setLoading(true));
    try {
      const data = await listInvestigations(searchQuery, statusFilter);
      dispatch(setItems(data));
    } catch (err: any) {
      dispatch(setError(err.message || "Failed to load investigations from database"));
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      fetchItems();
    }
  }, [isDrawerOpen, searchQuery, statusFilter]);

  const handleSelectInvestigation = async (id: string) => {
    try {
      const full = await getInvestigation(id);
      dispatch(loadInvestigation(full));
      dispatch(setDrawerOpen(false));
    } catch (err: any) {
      alert(`Could not load investigation ${id}: ${err.message}`);
    }
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={() => dispatch(setDrawerOpen(false))}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to right, var(--ocean-950), var(--ocean-900))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--turq-500)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <Database size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff" }}>
                Saved Investigations
              </h2>
              <div style={{ fontSize: "0.7rem", color: "var(--turq-300)" }}>
                PostgreSQL 18 Audited Quality Records
              </div>
            </div>
          </div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--turq-300)" }}
            onClick={() => dispatch(setDrawerOpen(false))}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--turq-50)", display: "flex", gap: "0.75rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--turq-600)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "2.2rem" }}
              placeholder="Search by title, batch, or API product..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
          </div>

          <select
            className="form-select"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Information extracted">Information extracted</option>
            <option value="Investigation in progress">Investigation in progress</option>
            <option value="Awaiting qualified review">Awaiting qualified review</option>
            <option value="Review completed">Review completed</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={fetchItems} title="Refresh records">
            <RefreshCw size={14} color="var(--turq-700)" />
          </button>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {isLoading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
              <RefreshCw size={20} className="spin" color="var(--turq-600)" style={{ margin: "0 auto 0.5rem auto" }} />
              Loading records from PostgreSQL...
            </div>
          )}

          {error && (
            <div style={{ padding: "1rem", background: "#fff1f2", color: "#e11d48", borderRadius: "8px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {!isLoading && items.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-muted)" }}>
              <Database size={32} color="var(--turq-400)" style={{ margin: "0 auto 0.75rem auto" }} />
              <div style={{ fontWeight: 700, color: "var(--ocean-950)" }}>No saved investigations found</div>
              <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Investigations saved to PostgreSQL will appear in this registry.
              </div>
            </div>
          )}

          {!isLoading && items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectInvestigation(item.id)}
              style={{
                border: "1.5px solid var(--border)",
                borderRadius: "8px",
                padding: "1rem",
                background: "#ffffff",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "var(--shadow-sm)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--turq-500)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(6, 182, 212, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.78rem", fontWeight: 700, color: "var(--ocean-950)" }}>
                  {item.id}
                </span>
                <Badge type="status" value={item.status} />
              </div>

              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--ocean-950)", marginBottom: "0.25rem" }}>
                {item.title}
              </div>

              <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {item.product_name && <span>API: <strong style={{ color: "var(--ocean-950)" }}>{item.product_name}</strong></span>}
                {item.batch_number && <span>Batch: <strong style={{ color: "var(--ocean-950)" }}>{item.batch_number}</strong></span>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border)", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={12} />
                  Updated: {new Date(item.updated_at).toLocaleString()}
                </span>
                <span style={{ color: "var(--turq-700)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  Open Record <ChevronRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              dispatch(resetToNewInvestigation());
              dispatch(setDrawerOpen(false));
            }}
          >
            Start New Investigation
          </button>
          <button className="btn btn-dark" onClick={() => dispatch(setDrawerOpen(false))}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

