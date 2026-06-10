import operator
from typing import Annotated, Optional

from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_core.messages import SystemMessage

from app.agent.llm import get_llm
from app.agent.prompts import SYSTEM_PROMPT
from app.tools.tools import AGENT_TOOLS
from app.trace.tracer import trace_step


class AgentState(MessagesState):
    trace: Annotated[list, operator.add]
    decision: Optional[str]
    run_id: str


def agent_node(state: AgentState):
    llm = get_llm().bind_tools(AGENT_TOOLS)
    messages = state["messages"]
    if not any(isinstance(m, SystemMessage) for m in messages):
        messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(messages)

    step_no = len(state.get("trace", []))
    with trace_step(step_no, "llm", "agent_call") as box:
        response = llm.invoke(messages)
        usage = getattr(response, "usage_metadata", {}) or {}
        box["tokens_in"] = usage.get("input_tokens", 0)
        box["tokens_out"] = usage.get("output_tokens", 0)
        box["output"] = str(response.content)[:200]

    return {"messages": [response], "trace": [box["_step"]]}


def extract_decision(state: AgentState):
    last = state["messages"][-1]
    content = getattr(last, "content", "")
    if isinstance(content, str):
        for keyword in ("APPROVED", "DENIED", "ESCALATED"):
            if keyword in content:
                return {"decision": keyword}
    return {}


graph_builder = StateGraph(AgentState)
graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", ToolNode(AGENT_TOOLS))
graph_builder.add_node("extract", extract_decision)

graph_builder.add_edge(START, "agent")
graph_builder.add_conditional_edges("agent", tools_condition)
graph_builder.add_edge("tools", "extract")
graph_builder.add_edge("extract", "agent")

agent_graph = graph_builder.compile()
