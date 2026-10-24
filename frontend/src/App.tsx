import React from "react";
import { Header } from "./components/layout/Header";
import { WorkflowStepper } from "./components/layout/WorkflowStepper";
import { InvestigationHeader } from "./components/rca/InvestigationHeader";
import { MetadataSection } from "./components/rca/MetadataSection";
import { ManufacturingSection } from "./components/rca/ManufacturingSection";
import { IncidentSection } from "./components/rca/IncidentSection";
import { EvidenceRegister } from "./components/rca/EvidenceRegister";
import { FiveWhysSection } from "./components/rca/FiveWhysSection";
import { RootCauseSection } from "./components/rca/RootCauseSection";
import { CapaSection } from "./components/rca/CapaSection";
import { ReviewSection } from "./components/rca/ReviewSection";
import { CopilotPanel } from "./components/copilot/CopilotPanel";
import { InvestigationListDrawer } from "./components/investigations/InvestigationListDrawer";

export const App: React.FC = () => {
  return (
    <div className="app-container">
      {/* Top Enterprise Navigation */}
      <Header />

      {/* Interactive Workflow Progress Stepper */}
      <WorkflowStepper />

      {/* Main Two-Panel Workspace */}
      <main className="workspace-layout">
        {/* Left Panel: Structured RCA Investigation Form */}
        <div className="form-panel">
          <InvestigationHeader />
          <MetadataSection />
          <ManufacturingSection />
          <IncidentSection />
          <EvidenceRegister />
          <FiveWhysSection />
          <RootCauseSection />
          <CapaSection />
          <ReviewSection />
        </div>

        {/* Right Panel: ORYVEX AI Copilot */}
        <CopilotPanel />
      </main>

      {/* Slide-over Investigation List Drawer */}
      <InvestigationListDrawer />
    </div>
  );
};

export default App;

