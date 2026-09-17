import json
from app.graph.state import GraphState
from app.services.llm_client import call_llm

PLANNER_SYSTEM_PROMPT = """You are a research planner for a blog-writing pipeline.
Given a topic, break it into 3-6 research tasks needed to write a thorough blog,
depending on how much the topic warrants.

Return JSON in this exact shape:
{"tasks": [{"task": "short description", "importance": "high|medium|low"}]}

Generate as many task objects as needed inside the "tasks" array — the example
above shows the shape of ONE item, not the total count.
"""


def parse_tasks(result: str) -> list[dict]:
    data = json.loads(result)
    return data["tasks"]


def planner_node(state: GraphState) -> GraphState:
    topic = state["messages"][-1].content
    result = call_llm(
        prompt=f"Topic: {topic}",
        model="gpt-5.6-luna",
        system_message=PLANNER_SYSTEM_PROMPT,
        max_tokens=800,
    )
    state["research_tasks"] = parse_tasks(result)
    state["topic"] = topic
    return state