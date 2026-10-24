import React from "react";
import { useSelector } from "react-redux";
import { Check, FileText, Search, GitBranch, ShieldCheck, ClipboardCheck } from "lucide-react";
import { RootState } from "../../app/store";

export const WorkflowStepper: React.FC = () => {
  const { currentInvestigation } = useSelector((state: RootState) => state.rca);

  const hasIntake = Boolean(currentInvestigation.product_name || currentInvestigation.batch_number);
  const hasEvidence = currentInvestigation.evidence_items.length > 0;
  const hasAnalysis = currentInvestigation.five_whys_steps.length > 0 || currentInvestigation.root_cause_hypotheses.length > 0;
  const hasCapa = currentInvestigation.capa_actions.length > 0;
  const hasSignOff = currentInvestigation.confirmation_status === "Reviewed and Confirmed";

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const steps = [
    { id: "sec-metadata", label: "Deviation Intake", icon: <FileText size={14} />, completed: hasIntake },
    { id: "sec-evidence", label: "Evidence Audit", icon: <Search size={14} />, completed: hasEvidence },
    { id: "sec-methodology", label: "5 Whys / Fishbone", icon: <GitBranch size={14} />, completed: hasAnalysis },
    { id: "sec-capa", label: "CAPA Actions", icon: <ShieldCheck size={14} />, completed: hasCapa },
    { id: "sec-review", label: "Qualified Sign-Off", icon: <ClipboardCheck size={14} />, completed: hasSignOff },
  ];

  return (
    <nav className="workflow-stepper" aria-label="Investigation Workflow Progress">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div
            className={`step-item ${step.completed ? "active" : ""}`}
            onClick={() => scrollTo(step.id)}
            title={`Jump to ${step.label}`}
          >
            <div className="step-number">
              {step.completed ? <Check size={12} strokeWidth={3} /> : idx + 1}
            </div>
            <span>{step.label}</span>
          </div>

          {idx < steps.length - 1 && <div className="step-connector" />}
        </React.Fragment>
      ))}
    </nav>
  );
};
