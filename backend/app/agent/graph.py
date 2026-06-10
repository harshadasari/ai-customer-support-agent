import operator
import time
from typing import Annotated, Optional

from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import SystemMessage, ToolMessage

from app.agent.llm import get_llm
from app.agent.prompts import SYSTEM_PROMPT
from app.tools.tools import AGENT_TOOLS
from app.trace.tracer import trace_step, TRACE_STORE, _current_run_id


class AgentState(MessagesState):
    trace: Annotated[list, operator.add]
    decision: Optional[str]
    run_id: str


def agent_node(state: AgentState):
    llm = get_llm().bind_tools(AGENT_TOOLS)
    messages = state["messages"]

    step_no = len(state.get("trace", []))
    with trace_step(step_no, "llm", "agent_call") as box:
        response = llm.invoke(messages)
        usage = getattr(response, "usage_metadata", {}) or {}
        box["tokens_in"] = usage.get("input_tokens", 0)
        box["tokens_out"] = usage.get("output_tokens", 0)
        box["output"] = str(response.content)[:200]

    return {"messages": [response], "trace": [box["_step"]]}


def traced_tools_node(state: AgentState):
    """Wrap ToolNode to capture tool I/O in traces."""
    tool_node = ToolNode(AGENT_TOOLS)
    start = time.perf_counter()
    result = tool_node.invoke(state)

    tool_traces = []
    for msg in result.get("messages", []):
        if isinstance(msg, ToolMessage):
            step_no = len(state.get("trace", [])) + len(tool_traces)
            content = str(msg.content)[:500] if msg.content else ""
            step = trace_step.__wrapped__ if hasattr(trace_step, '__wrapped__') else None
            from app.models import TraceStep
            ts = TraceStep(
                step=step_no,
                type="tool",
                name=msg.name or "unknown_tool",
                input=msg.tool_call_id,
                output=content,
                latency_ms=round((time.perf_counter() - start) * 1000 / max(1, len(result.get("messages", []))), 2),
            )
            tool_traces.append(ts)
            run_id = _current_run_id.get()
            if run_id:
                TRACE_STORE[run_id].append(ts)

    result["trace"] = tool_traces
    return result


def extract_decision(state: AgentState):
    for msg in reversed(state["messages"]):
        content = getattr(msg, "content", "")
        if isinstance(content, str):
            for keyword in ("APPROVED", "DENIED", "ESCALATED", "NEEDS_INFO"):
                if keyword in content:
                    return {"decision": keyword}
    return {}


graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", traced_tools_node)
graph_builder.add_node("extract", extract_decision)

graph_builder.add_edge(START, "agent")
graph_builder.add_conditional_edges("agent", tools_condition)
graph_builder.add_edge("tools", "extract")
graph_builder.add_edge("extract", "agent")

agent_graph = graph_builder.compile()
