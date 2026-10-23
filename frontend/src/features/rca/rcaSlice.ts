import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { 
  InvestigationData, 
  EvidenceItem, 
  FiveWhysStep, 
  RootCauseHypothesis, 
  CapaAction,
  CauseConfirmationStatus
} from "../../types/rca";

export const createInitialInvestigation = (): InvestigationData => ({
  id: `TEMP-${Date.now().toString().slice(-4)}`,
  title: "New API Quality Investigation",
  status: "Draft",
  department: "",
  investigation_owner: "",
  source_type: "pasted_text",
  source_preview: "",
  incident_date: "",
  date_discovered: "",
  product_name: "",
  batch_number: "",
  manufacturing_stage: "",
  equipment_id: "",
  affected_quantity: "",
  process_parameters: null,
  raw_materials: null,
  incident_summary: "",
  detailed_description: "",
  expected_result: "",
  observed_result: "",
  immediate_containment: "",
  potential_impact: "",
  initial_severity: null,
  severity_rationale: "",
  reviewer_name: "",
  reviewer_role: "",
  review_notes: "",
  confirmation_status: "Pending Review",
  field_provenance: {},
  evidence_items: [],
  five_whys_steps: [],
  root_cause_hypotheses: [],
  capa_actions: [],
});

interface ExtractionMeta {
  extractedFields: string[];
  unknownFields: string[];
  summary: string;
  missingNotices: string[];
  warnings: string[];
}

interface RCAState {
  currentInvestigation: InvestigationData;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  lastSavedAt: string | null;
  extractionMeta: ExtractionMeta | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  conflictNotification: { field: string; incomingValue: any; currentValue: any } | null;
}

const initialState: RCAState = {
  currentInvestigation: createInitialInvestigation(),
  isDirty: false,
  isSaving: false,
  saveError: null,
  lastSavedAt: null,
  extractionMeta: null,
  isAnalyzing: false,
  analysisError: null,
  conflictNotification: null,
};

export const rcaSlice = createSlice({
  name: "rca",
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: keyof InvestigationData; value: any; source?: "extracted" | "user_edit" | "copilot_patch" }>
    ) => {
      const { field, value, source = "user_edit" } = action.payload;
      (state.currentInvestigation as any)[field] = value;
      state.isDirty = true;
      state.currentInvestigation.field_provenance[field as string] = {
        source,
        excerpt: source === "user_edit" ? "Manual user entry / edit" : undefined,
      };
    },

    applyStructuredPatch: (state, action: PayloadAction<Record<string, any>>) => {
      const patch = action.payload;
      for (const [key, val] of Object.entries(patch)) {
        if (key in state.currentInvestigation) {
          (state.currentInvestigation as any)[key] = val;
          state.currentInvestigation.field_provenance[key] = {
            source: "copilot_patch",
            excerpt: "Updated via ORYVEX Copilot command",
          };
        }
      }
      state.isDirty = true;
    },

    populateFromExtraction: (state, action: PayloadAction<any>) => {
      const ext = action.payload;
      const inv = state.currentInvestigation;

      // Map scalar fields if extracted
      const fieldsToMap: Array<keyof InvestigationData> = [
        "title", "department", "investigation_owner", "incident_date", "date_discovered",
        "product_name", "batch_number", "manufacturing_stage", "equipment_id", "affected_quantity",
        "process_parameters", "raw_materials", "incident_summary", "detailed_description",
        "expected_result", "observed_result", "immediate_containment", "potential_impact",
        "initial_severity", "severity_rationale"
      ];

      fieldsToMap.forEach((f) => {
        if (ext[f] !== undefined && ext[f] !== null) {
          (inv as any)[f] = ext[f];
          inv.field_provenance[f as string] = {
            source: "extracted",
            excerpt: ext.field_provenance?.[f]?.excerpt || "Direct extraction from document",
            confidence: ext.field_provenance?.[f]?.confidence || "High",
          };
        }
      });

      // Populate initial evidence register
      if (ext.initial_evidence && Array.isArray(ext.initial_evidence)) {
        inv.evidence_items = ext.initial_evidence;
      }

      inv.status = "Information extracted";
      state.isDirty = true;
      state.extractionMeta = {
        extractedFields: ext.extracted_fields || [],
        unknownFields: ext.unknown_fields || [],
        summary: ext.extraction_summary || "Extraction completed successfully.",
        missingNotices: ext.missing_evidence_notices || [],
        warnings: ext.warnings || [],
      };
    },

    populateFromAnalysis: (state, action: PayloadAction<any>) => {
      const data = action.payload;
      const inv = state.currentInvestigation;

      if (data.five_whys_steps && Array.isArray(data.five_whys_steps)) {
        inv.five_whys_steps = data.five_whys_steps;
      }

      if (data.root_cause_hypotheses && Array.isArray(data.root_cause_hypotheses)) {
        inv.root_cause_hypotheses = data.root_cause_hypotheses;
      }

      if (data.evidence_gaps && Array.isArray(data.evidence_gaps)) {
        // Merge evidence gaps into evidence register
        const existingIds = new Set(inv.evidence_items.map((e) => e.id));
        data.evidence_gaps.forEach((gap: EvidenceItem) => {
          if (!existingIds.has(gap.id)) {
            inv.evidence_items.push(gap);
            existingIds.add(gap.id);
          }
        });
      }

      if (data.capa_recommendations && Array.isArray(data.capa_recommendations)) {
        inv.capa_actions = data.capa_recommendations;
      }

      inv.status = "Investigation in progress";
      state.isDirty = true;
      state.isAnalyzing = false;
    },

    updateRootCauseConfirmation: (
      state,
      action: PayloadAction<{ id: string; status: CauseConfirmationStatus }>
    ) => {
      const { id, status } = action.payload;
      const hyp = state.currentInvestigation.root_cause_hypotheses.find((h) => h.id === id);
      if (hyp) {
        hyp.user_confirmation_status = status;
        state.isDirty = true;
        if (status === "Confirmed by qualified reviewer") {
          state.currentInvestigation.status = "Awaiting qualified review";
        }
      }
    },

    updateEvidenceItem: (state, action: PayloadAction<EvidenceItem>) => {
      const updated = action.payload;
      const idx = state.currentInvestigation.evidence_items.findIndex((e) => e.id === updated.id);
      if (idx !== -1) {
        state.currentInvestigation.evidence_items[idx] = updated;
      } else {
        state.currentInvestigation.evidence_items.push(updated);
      }
      state.isDirty = true;
    },

    removeEvidenceItem: (state, action: PayloadAction<string>) => {
      state.currentInvestigation.evidence_items = state.currentInvestigation.evidence_items.filter(
        (e) => e.id !== action.payload
      );
      state.isDirty = true;
    },

    updateFiveWhysStep: (state, action: PayloadAction<FiveWhysStep>) => {
      const step = action.payload;
      const idx = state.currentInvestigation.five_whys_steps.findIndex((s) => s.id === step.id);
      if (idx !== -1) {
        state.currentInvestigation.five_whys_steps[idx] = step;
        state.isDirty = true;
      }
    },

    updateCapaAction: (state, action: PayloadAction<CapaAction>) => {
      const capa = action.payload;
      const idx = state.currentInvestigation.capa_actions.findIndex((c) => c.id === capa.id);
      if (idx !== -1) {
        state.currentInvestigation.capa_actions[idx] = capa;
      } else {
        state.currentInvestigation.capa_actions.push(capa);
      }
      state.isDirty = true;
    },

    removeCapaAction: (state, action: PayloadAction<string>) => {
      state.currentInvestigation.capa_actions = state.currentInvestigation.capa_actions.filter(
        (c) => c.id !== action.payload
      );
      state.isDirty = true;
    },

    loadInvestigation: (state, action: PayloadAction<InvestigationData>) => {
      state.currentInvestigation = action.payload;
      state.isDirty = false;
      state.extractionMeta = null;
      state.saveError = null;
      state.lastSavedAt = action.payload.updated_at || new Date().toISOString();
    },

    resetToNewInvestigation: (state) => {
      state.currentInvestigation = createInitialInvestigation();
      state.isDirty = false;
      state.extractionMeta = null;
      state.saveError = null;
      state.lastSavedAt = null;
      state.conflictNotification = null;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    setSaveSuccess: (state, action: PayloadAction<InvestigationData>) => {
      state.currentInvestigation = action.payload;
      state.isSaving = false;
      state.isDirty = false;
      state.saveError = null;
      state.lastSavedAt = new Date().toISOString();
    },

    setSaveError: (state, action: PayloadAction<string>) => {
      state.isSaving = false;
      state.saveError = action.payload;
    },

    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
      state.analysisError = null;
    },

    setAnalysisError: (state, action: PayloadAction<string>) => {
      state.isAnalyzing = false;
      state.analysisError = action.payload;
    },

    dismissConflict: (state) => {
      state.conflictNotification = null;
    },
  },
});

export const {
  updateField,
  applyStructuredPatch,
  populateFromExtraction,
  populateFromAnalysis,
  updateRootCauseConfirmation,
  updateEvidenceItem,
  removeEvidenceItem,
  updateFiveWhysStep,
  updateCapaAction,
  removeCapaAction,
  loadInvestigation,
  resetToNewInvestigation,
  setSaving,
  setSaveSuccess,
  setSaveError,
  setAnalyzing,
  setAnalysisError,
  dismissConflict,
} = rcaSlice.actions;

export default rcaSlice.reducer;
