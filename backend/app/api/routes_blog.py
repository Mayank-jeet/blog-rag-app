from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from app.graph.graph_instance import graph
from app.core.thread_registry import create_thread,truncate_topic
from app.services.llm_client import call_llm

router = APIRouter()

NAMING_SYSTEM_PROMPT = """Generate a short, clear title (3-6 words) for a chat thread,
based on the topic below. Return ONLY the title text — no quotes, no punctuation at the end."""


class BlogRequest(BaseModel):
    topic: str
    thread_id: str | None = None


@router.post("/generate-blog")
async def generate_blog(req: BlogRequest):
    thread_id = req.thread_id

    if thread_id is None:
        try:
            thread_name = call_llm(
                prompt=f"Topic: {req.topic}",
                model="gpt-5.6-luna",
                system_message=NAMING_SYSTEM_PROMPT,
                max_tokens=40,
            ).strip()
            if not thread_name:
                thread_name = truncate_topic(req.topic)
        except Exception as e:
            print("Thread name generation failed:", repr(e))
            thread_name = truncate_topic(req.topic)
        thread_id = create_thread(thread_name)
    config = {"configurable": {"thread_id": thread_id}}
    result = graph.invoke({"messages": [HumanMessage(content=req.topic)]}, config=config)

    return {
        "thread_id": thread_id,
        "messages": [{"type": m.type, "content": m.content} for m in result["messages"]],
        "task_budgets": result["task_budgets"],
    }