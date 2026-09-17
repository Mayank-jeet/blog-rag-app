from langgraph.checkpoint.memory import InMemorySaver
from app.graph.graph_builder import build_graph

graph = build_graph(InMemorySaver())