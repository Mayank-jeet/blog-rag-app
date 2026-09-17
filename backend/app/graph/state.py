from typing import TypedDict, List,Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class GraphState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    topic: str
    research_tasks: List[dict]
    task_budgets: List[dict]
    research_results: List[dict]
    final_blog: str
    blog_with_image_markers: str
    generated_images: List[dict]
    final_output: str