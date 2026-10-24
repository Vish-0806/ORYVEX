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
    <div className="form-section-card" id="sec-manufacturing">
      <div className="section-header">
        <div className="section-title">
          <div className="section-title-icon">
            <Factory size={16} />
          </div>
          Section B: Product & API Manufacturing Context
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">
            Active Pharmaceutical Ingredient (API)
            <Badge type="provenance" value={inv.field_provenance.product_name?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.product_name || ""}
            onChange={(e) => dispatch(updateField({ field: "product_name", value: e.target.value }))}
            placeholder="e.g. Artemicort API (Glucocorticoid Intermediate)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Batch / Lot Number
            <Badge type="provenance" value={inv.field_provenance.batch_number?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            style={{ fontFamily: "JetBrains Mono", fontWeight: 600 }}
            value={inv.batch_number || ""}
            onChange={(e) => dispatch(updateField({ field: "batch_number", value: e.target.value }))}
            placeholder="e.g. ART-2026-042"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Manufacturing Unit Operation
            <Badge type="provenance" value={inv.field_provenance.manufacturing_stage?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.manufacturing_stage || ""}
            onChange={(e) => dispatch(updateField({ field: "manufacturing_stage", value: e.target.value }))}
            placeholder="e.g. Stage 3 Crystallization & Solvent Recovery"
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
        <div className="form-group">
          <label className="form-label">
            Process Equipment Tag
            <Badge type="provenance" value={inv.field_provenance.equipment_id?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.equipment_id || ""}
            onChange={(e) => dispatch(updateField({ field: "equipment_id", value: e.target.value }))}
            placeholder="e.g. Crystallizer CR-04 (2,500 L)"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Affected Quantity / Batch Scale
            <Badge type="provenance" value={inv.field_provenance.affected_quantity?.source} />
          </label>
          <input
            type="text"
            className="form-input"
            value={inv.affected_quantity || ""}
            onChange={(e) => dispatch(updateField({ field: "affected_quantity", value: e.target.value }))}
            placeholder="e.g. 480 kg (Bulk API Crystalline Powder, Lots 1-4)"
          />
        </div>
      </div>
    </div>
  );
};
