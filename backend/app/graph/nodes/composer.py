from app.graph.state import GraphState
from app.services.llm_client import call_llm

COMPOSER_SYSTEM_PROMPT = """You are writing a complete, well-structured blog post.
Use the provided research notes where available. For skipped tasks, rely on your
own general knowledge. Write in clear sections with headings."""

BASE_TOKENS = 500
TOKENS_PER_TASK = 300
MAX_TOKENS_CEILING = 4000


def calculate_composer_budget(research_results: list[dict]) -> int:
    """Scales the composer's token budget with how many tasks actually have content,
    capped so very research-heavy topics don't produce runaway-length blogs."""
    non_skipped = [r for r in research_results if not r["skipped"]]
    dynamic_budget = BASE_TOKENS + (len(non_skipped) * TOKENS_PER_TASK)
    return min(dynamic_budget, MAX_TOKENS_CEILING)


def build_composer_context(research_results: list[dict]) -> str:
    """Turns research results into a single text block the composer LLM call can read."""
    context_parts = []
    for r in research_results:
        if r["skipped"]:
            context_parts.append(f"Task: {r['task']} (no external research — use general knowledge)")
        else:
            context_parts.append(f"Task: {r['task']}\nNotes: {r['notes']}")
    return "\n\n".join(context_parts)


def composer_node(state: GraphState) -> GraphState:
    combined_context = build_composer_context(state["research_results"])
    max_tokens = calculate_composer_budget(state["research_results"])

    blog = call_llm(
        prompt=f"Topic: {state['topic']}\n\nResearch context:\n{combined_context}",
        model="claude-sonnet-5",
        system_message=COMPOSER_SYSTEM_PROMPT,
        max_tokens=max_tokens,
    )

    state["final_blog"] = blog
    return state