import React from "react";
import { WorkflowStatus, SeverityLevel, CauseConfirmationStatus } from "../../types/rca";

interface BadgeProps {
  type: "status" | "severity" | "confirmation" | "provenance";
  value: string | null | undefined;
}

export const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  if (!value) return null;

  if (type === "status") {
    const s = value as WorkflowStatus;
    let cls = "badge-draft";
    if (s === "Information extracted") cls = "badge-extracted";
    else if (s === "Investigation in progress") cls = "badge-investigating";
    else if (s === "Awaiting qualified review") cls = "badge-review";
    else if (s === "Review completed") cls = "badge-completed";
    return <span className={`badge ${cls}`}>{value}</span>;
  }

  if (type === "severity") {
    const s = value as SeverityLevel;
    let cls = "badge-minor";
    if (s === "Critical") cls = "badge-critical";
    else if (s === "Major") cls = "badge-major";
    return <span className={`badge ${cls}`}>{value}</span>;
  }

  if (type === "confirmation") {
    const c = value as CauseConfirmationStatus;
    let cls = "badge-draft";
    if (c === "Confirmed by qualified reviewer") cls = "badge-completed";
    else if (c === "Under investigation") cls = "badge-investigating";
    else if (c === "Rejected") cls = "badge-critical";
    else if (c === "Supported by reviewed evidence") cls = "badge-extracted";
    return <span className={`badge ${cls}`}>{value}</span>;
  }

  if (type === "provenance") {
    let cls = "provenance-extracted";
    if (value === "user_edit") cls = "provenance-edited";
    else if (value === "copilot_patch") cls = "provenance-patch";
    return <span className={`provenance-tag ${cls}`}>{value === "user_edit" ? "Manual Edit" : value === "copilot_patch" ? "Copilot Patch" : "Extracted"}</span>;
  }

  return <span className="badge badge-draft">{value}</span>;
};
