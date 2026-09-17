from langgraph.graph import StateGraph, START, END

from app.graph.state import GraphState
from app.graph.nodes.planner import planner_node
from app.graph.nodes.token_budget import token_budget_node
from app.graph.nodes.research import research_node
from app.graph.nodes.composer import composer_node
from app.graph.nodes.image_planner import image_planner_node
from app.graph.nodes.image_gen import image_gen_node
from app.graph.nodes.merge import merge_node


def build_graph(checkpointer):
    builder = StateGraph(GraphState)

    builder.add_node("planner", planner_node)
    builder.add_node("token_budget", token_budget_node)
    builder.add_node("research", research_node)
    builder.add_node("composer", composer_node)
    builder.add_node("image_planner", image_planner_node)
    builder.add_node("image_gen", image_gen_node)
    builder.add_node("merge", merge_node)

    builder.add_edge(START, "planner")
    builder.add_edge("planner", "token_budget")
    builder.add_edge("token_budget", "research")
    builder.add_edge("research", "composer")
    builder.add_edge("composer", "image_planner")
    builder.add_edge("image_planner", "image_gen")
    builder.add_edge("image_gen", "merge")
    builder.add_edge("merge", END)

    graph = builder.compile(checkpointer=checkpointer)
    return graph
    