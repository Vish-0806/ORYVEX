import logging
from langgraph.graph import StateGraph, END
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.nodes.input_processing import input_processing_node
from backend.app.ai.nodes.extraction import extraction_node
from backend.app.ai.nodes.evidence_gap_analysis import evidence_gap_node
from backend.app.ai.nodes.root_cause_investigation import root_cause_node
from backend.app.ai.nodes.capa_generation import capa_generation_node
from backend.app.ai.nodes.validation import validation_node

logger = logging.getLogger(__name__)

def should_continue_after_input(state: RCAWorkflowState) -> str:
    if state.get("processing_status") == "failed":
        return "validation"
    return "extraction"

def should_continue_after_extraction(state: RCAWorkflowState) -> str:
    if state.get("processing_status") == "failed":
        return "validation"
    return "evidence_gap"

# Build Full End-to-End Master Workflow Graph
def build_rca_graph():
    builder = StateGraph(RCAWorkflowState)

    # Add Nodes
    builder.add_node("input_processing", input_processing_node)
    builder.add_node("extraction", extraction_node)
    builder.add_node("evidence_gap", evidence_gap_node)
    builder.add_node("root_cause", root_cause_node)
    builder.add_node("capa", capa_generation_node)
    builder.add_node("validation", validation_node)

    # Set Entry Point
    builder.set_entry_point("input_processing")

    # Add Edges
    builder.add_conditional_edges(
        "input_processing",
        should_continue_after_input,
        {"extraction": "extraction", "validation": "validation"}
    )
    builder.add_conditional_edges(
        "extraction",
        should_continue_after_extraction,
        {"evidence_gap": "evidence_gap", "validation": "validation"}
    )
    builder.add_edge("evidence_gap", "root_cause")
    builder.add_edge("root_cause", "capa")
    builder.add_edge("capa", "validation")
    builder.add_edge("validation", END)

    return builder.compile()

# Build Extraction Only Workflow Graph
def build_extraction_graph():
    builder = StateGraph(RCAWorkflowState)

    builder.add_node("input_processing", input_processing_node)
    builder.add_node("extraction", extraction_node)
    builder.add_node("evidence_gap", evidence_gap_node)
    builder.add_node("validation", validation_node)

    builder.set_entry_point("input_processing")

    builder.add_conditional_edges(
        "input_processing",
        should_continue_after_input,
        {"extraction": "extraction", "validation": "validation"}
    )
    builder.add_conditional_edges(
        "extraction",
        should_continue_after_extraction,
        {"evidence_gap": "evidence_gap", "validation": "validation"}
    )
    builder.add_edge("evidence_gap", "validation")
    builder.add_edge("validation", END)

    return builder.compile()

# Build RCA & CAPA Investigation Only Workflow Graph
def build_investigation_graph():
    builder = StateGraph(RCAWorkflowState)

    builder.add_node("evidence_gap", evidence_gap_node)
    builder.add_node("root_cause", root_cause_node)
    builder.add_node("capa", capa_generation_node)
    builder.add_node("validation", validation_node)

    builder.set_entry_point("evidence_gap")

    builder.add_edge("evidence_gap", "root_cause")
    builder.add_edge("root_cause", "capa")
    builder.add_edge("capa", "validation")
    builder.add_edge("validation", END)

    return builder.compile()

# Pre-compiled graph instances
rca_full_graph = build_rca_graph()
rca_extraction_graph = build_extraction_graph()
rca_investigation_graph = build_investigation_graph()
