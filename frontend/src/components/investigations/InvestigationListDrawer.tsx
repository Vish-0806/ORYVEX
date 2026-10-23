import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, Search, Database, Clock, RefreshCw } from "lucide-react";
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
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Database size={18} color="var(--violet-600)" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--navy-900)" }}>
              Saved Investigations (PostgreSQL)
            </h2>
          </div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            onClick={() => dispatch(setDrawerOpen(false))}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "0.75rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "10px", color: "#94a3b8" }} />
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
            <RefreshCw size={14} />
          </button>
        </div>

        {/* List Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {isLoading && (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <RefreshCw size={20} className="spin" style={{ margin: "0 auto 0.5rem auto" }} />
              Loading records from PostgreSQL...
            </div>
          )}

          {error && (
            <div style={{ padding: "1rem", background: "#fff1f2", color: "#e11d48", borderRadius: "8px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {!isLoading && items.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "3rem 1.5rem", color: "#94a3b8" }}>
              <Database size={32} style={{ margin: "0 auto 0.75rem auto", opacity: 0.5 }} />
              <div style={{ fontWeight: 600, color: "#475569" }}>No saved investigations found</div>
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
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "1rem",
                background: "#ffffff",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--violet-600)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <span style={{ fontFamily: "JetBrains Mono", fontSize: "0.78rem", fontWeight: 700, color: "var(--navy-900)" }}>
                  {item.id}
                </span>
                <Badge type="status" value={item.status} />
              </div>

              <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--navy-900)", marginBottom: "0.25rem" }}>
                {item.title}
              </div>

              <div style={{ display: "flex", gap: "1rem", fontSize: "0.78rem", color: "#64748b" }}>
                {item.product_name && <span>API: <strong>{item.product_name}</strong></span>}
                {item.batch_number && <span>Batch: <strong>{item.batch_number}</strong></span>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9", fontSize: "0.72rem", color: "#94a3b8" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={12} />
                  Updated: {new Date(item.updated_at).toLocaleString()}
                </span>
                <span style={{ color: "var(--violet-600)", fontWeight: 600 }}>Click to open &rarr;</span>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
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
