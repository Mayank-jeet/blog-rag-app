from app.graph.state import GraphState

IMPORTANCE_TO_MAX_TOKENS = {
    "high": 800,
    "medium": 400,
    "low": 200,
}

def token_budget_node(state: GraphState) -> GraphState:
    task_budgets = []
    for task in state["research_tasks"]:
        max_tokens = IMPORTANCE_TO_MAX_TOKENS.get(task["importance"], 400)
        task_budgets.append({
            "task": task["task"],
            "importance": task["importance"],
            "max_tokens": max_tokens,
        })
    state["task_budgets"] = task_budgets
    return state