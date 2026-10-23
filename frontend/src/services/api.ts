import { InvestigationData, InvestigationListItem, EvidenceItem } from "../types/rca";

const API_BASE = "/api/v1";

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return await res.json();
}

export async function extractIncidentFromFile(file: File, sourceType: string = "pdf") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("source_type", sourceType);

  const res = await fetch(`${API_BASE}/rca/extract`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(err.detail || "Failed to extract incident data from file");
  }

  return await res.json();
}

export async function extractIncidentFromText(sourceText: string, sourceType: string = "pasted_text") {
  const res = await fetch(`${API_BASE}/rca/extract-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_text: sourceText,
      source_type: sourceType,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Extraction failed" }));
    throw new Error(err.detail || "Failed to extract incident data from text");
  }

  return await res.json();
}

export async function runInvestigationAnalysis(
  incidentData: Partial<InvestigationData>,
  evidenceItems: EvidenceItem[],
  investigationId?: string
) {
  const res = await fetch(`${API_BASE}/rca/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investigation_id: investigationId,
      incident_data: incidentData,
      evidence_items: evidenceItems,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Failed to execute RCA & CAPA analysis");
  }

  return await res.json();
}

export async function sendCopilotChat(
  message: string,
  currentFormState: Partial<InvestigationData>,
  history: Array<{ role: string; content: string }>,
  investigationId?: string
) {
  const res = await fetch(`${API_BASE}/rca/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      investigation_id: investigationId,
      message,
      current_form_state: currentFormState,
      conversation_history: history,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Copilot chat failed" }));
    throw new Error(err.detail || "Failed to process message with Copilot");
  }

  return await res.json();
}

export async function listInvestigations(search?: string, status?: string): Promise<InvestigationListItem[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status);

  const res = await fetch(`${API_BASE}/investigations?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load investigations list");
  return await res.json();
}

export async function getInvestigation(id: string): Promise<InvestigationData> {
  const res = await fetch(`${API_BASE}/investigations/${id}`);
  if (!res.ok) throw new Error(`Failed to load investigation ${id}`);
  return await res.json();
}

export async function saveInvestigation(data: InvestigationData): Promise<InvestigationData> {
  // If ID exists in database, use PUT; if starting with TEMP- or new, use POST
  const isExisting = !data.id.startsWith("TEMP-");
  const url = isExisting ? `${API_BASE}/investigations/${data.id}` : `${API_BASE}/investigations`;
  const method = isExisting ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Save failed" }));
    throw new Error(err.detail || "Failed to save investigation to database");
  }

  return await res.json();
}
