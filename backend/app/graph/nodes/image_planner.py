from app.graph.state import GraphState
from app.services.llm_client import call_llm

IMAGE_PLANNER_SYSTEM_PROMPT = """You are editing a blog post to mark where images would
genuinely help the reader understand a concept — not just decoratively.

Insert markers directly into the text, in this exact format:
[IMAGE: a clear, specific description of what the image should show]

Only add markers where a diagram, process, or visual comparison would clarify
something better than text alone (e.g. a cycle, a structure, a step-by-step process).
Do not add an image for every section — use judgment. Return the FULL blog text,
unchanged except for the inserted markers."""


def image_planner_node(state: GraphState) -> GraphState:
    blog_with_markers = call_llm(
        prompt=state["final_blog"],
        model="claude-sonnet-5",
        system_message=IMAGE_PLANNER_SYSTEM_PROMPT,
        max_tokens=4000,
    )
    state["blog_with_image_markers"] = blog_with_markers
    return state