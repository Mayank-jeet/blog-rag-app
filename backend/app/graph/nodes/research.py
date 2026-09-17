from app.graph.state import GraphState
from app.graph.nodes.router import needs_research
from app.services.tavily_client import search_web
from app.services.llm_client import call_llm

SYNTHESIS_SYSTEM_PROMPT = """Summarize the following search results into concise,
factual notes usable for writing a blog section. Be direct, no filler."""

def research_node(state: GraphState) -> GraphState:
    research_results = []
    budgets_by_task = {b["task"]: b["max_tokens"] for b in state["task_budgets"]}

    for task in state["research_tasks"]:
        max_tokens = budgets_by_task.get(task["task"], 400)

        if needs_research(task):
            raw = search_web(task["task"])
            notes = call_llm(
                prompt=f"Search results: {raw}",
                model="gpt-5.6-luna",
                system_message=SYNTHESIS_SYSTEM_PROMPT,
                max_tokens=max_tokens,
            )
            research_results.append({"task": task["task"], "notes": notes, "skipped": False})
        else:
            research_results.append({"task": task["task"], "notes": None, "skipped": True})

    state["research_results"] = research_results
    return state