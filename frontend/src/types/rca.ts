export type WorkflowStatus = 
  | "Draft"
  | "Information extracted"
  | "Investigation in progress"
  | "Awaiting qualified review"
  | "Review completed";

export type SeverityLevel = "Minor" | "Major" | "Critical";

export type EvidenceStatus = "Supplied" | "Missing / Requested" | "Contradictory" | "Verified";

export type IshikawaCategory = "Man" | "Machine" | "Method" | "Material" | "Measurement" | "Environment";

export type CauseConfirmationStatus = 
  | "Suggested"
  | "Under investigation"
  | "Supported by reviewed evidence"
  | "Confirmed by qualified reviewer"
  | "Rejected";

export type CapaType = "Corrective" | "Preventive";
export type CapaStatus = "Proposed" | "Accepted" | "In Progress" | "Completed" | "Rejected";
export type CapaReviewStatus = "Awaiting Review" | "Approved" | "Needs Revision";

export interface EvidenceItem {
  id: string;
  description: string;
  evidence_type: string;
  source_reference?: string | null;
  extracted_quote?: string | null;
  related_question?: string | null;
  evidence_status: EvidenceStatus;
  notes?: string | null;
}

export interface FiveWhysStep {
  id: string;
  step_order: number;
  why_question: string;
  proposed_answer: string;
  supporting_evidence?: string | null;
  contradictory_evidence?: string | null;
  evidence_strength: "Strong" | "Moderate" | "Speculative / Unconfirmed";
  remaining_unknowns?: string | null;
}

export interface RootCauseHypothesis {
  id: string;
  description: string;
  category: IshikawaCategory;
  reasoning?: string | null;
  confidence_label: "Low" | "Medium" | "High";
  supporting_evidence_refs: string[];
  contradictory_evidence_refs: string[];
  evidence_needed?: string | null;
  user_confirmation_status: CauseConfirmationStatus;
}

export interface CapaAction {
  id: string;
  action_type: CapaType;
  description: string;
  rationale?: string | null;
  related_cause_id?: string | null;
  required_resources?: string | null;
  suggested_role?: string | null;
  suggested_timeframe?: string | null;
  effectiveness_verification?: string | null;
  status: CapaStatus;
  review_status: CapaReviewStatus;
}

export interface FieldProvenance {
  source: "extracted" | "user_edit" | "copilot_patch";
  excerpt?: string;
  confidence?: string;
}

export interface InvestigationData {
  id: string;
  title: string;
  status: WorkflowStatus;
  department?: string | null;
  investigation_owner?: string | null;
  source_type: "pdf" | "pasted_text" | "email";
  source_preview?: string | null;
  
  incident_date?: string | null;
  date_discovered?: string | null;
  created_at?: string;
  updated_at?: string;
  
  product_name?: string | null;
  batch_number?: string | null;
  manufacturing_stage?: string | null;
  equipment_id?: string | null;
  affected_quantity?: string | null;
  process_parameters?: any;
  raw_materials?: any;
  
  incident_summary?: string | null;
  detailed_description?: string | null;
  expected_result?: string | null;
  observed_result?: string | null;
  immediate_containment?: string | null;
  potential_impact?: string | null;
  initial_severity?: SeverityLevel | null;
  severity_rationale?: string | null;
  
  reviewer_name?: string | null;
  reviewer_role?: string | null;
  review_notes?: string | null;
  confirmation_status: "Pending Review" | "Reviewed and Confirmed" | "Revisions Requested";
  
  field_provenance: Record<string, FieldProvenance>;
  
  evidence_items: EvidenceItem[];
  five_whys_steps: FiveWhysStep[];
  root_cause_hypotheses: RootCauseHypothesis[];
  capa_actions: CapaAction[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  patch?: Record<string, any>;
  modified_fields?: string[];
  suggested_actions?: string[];
  intent?: string;
}

export interface InvestigationListItem {
  id: string;
  title: string;
  status: WorkflowStatus;
  product_name?: string;
  batch_number?: string;
  initial_severity?: SeverityLevel;
  confirmation_status: string;
  created_at: string;
  updated_at: string;
}
