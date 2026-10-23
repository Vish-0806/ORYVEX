import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Factory } from "lucide-react";
import { RootState } from "../../app/store";
import { updateField } from "../../features/rca/rcaSlice";
import { Badge } from "../common/Badge";

export const ManufacturingSection: React.FC = () => {
  const dispatch = useDispatch();
  const inv = useSelector((state: RootState) => state.rca.currentInvestigation);

  return (
    <div className="form-section-card">
      <div className="section-header">
        <div className="section-title">
          <Factory size={18} color="var(--cyan-600)" />
          Section B: Product & Manufacturing Context
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">
            API / Product Name
            <Badge type="provenance" value={inv.field_provenance.product_name?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.product_name || ""}
            onChange={(e) => dispatch(updateField({ field: "product_name", value: e.target.value }))}
            placeholder="e.g. Artemicort API"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Batch Number
            <Badge type="provenance" value={inv.field_provenance.batch_number?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.batch_number || ""}
            onChange={(e) => dispatch(updateField({ field: "batch_number", value: e.target.value }))}
            placeholder="e.g. ART-2026-042"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Manufacturing Stage
            <Badge type="provenance" value={inv.field_provenance.manufacturing_stage?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.manufacturing_stage || ""}
            onChange={(e) => dispatch(updateField({ field: "manufacturing_stage", value: e.target.value }))}
            placeholder="e.g. Stage 3 Crystallization"
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
        <div className="form-group">
          <label className="form-label">
            Equipment Identifier
            <Badge type="provenance" value={inv.field_provenance.equipment_id?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.equipment_id || ""}
            onChange={(e) => dispatch(updateField({ field: "equipment_id", value: e.target.value }))}
            placeholder="e.g. Crystallizer CR-04"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Affected Quantity / Lot Size
            <Badge type="provenance" value={inv.field_provenance.affected_quantity?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.affected_quantity || ""}
            onChange={(e) => dispatch(updateField({ field: "affected_quantity", value: e.target.value }))}
            placeholder="e.g. 480 kg (Bulk API Crystalline Powder)"
          />
        </div>
      </div>
    </div>
  );
};
