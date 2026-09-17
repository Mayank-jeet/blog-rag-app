from fastapi import APIRouter, HTTPException
from app.core.thread_registry import list_threads, thread_exists
from app.graph.graph_instance import graph

router = APIRouter()


@router.get("/threads")
async def get_threads():
    return {"threads": list_threads()}


@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str):
    if not thread_exists(thread_id):
        raise HTTPException(status_code=404, detail="Thread not found")

    config = {"configurable": {"thread_id": thread_id}}
    state = graph.get_state(config)
    messages = state.values.get("messages", [])

    return {
        "messages": [{"type": m.type, "content": m.content} for m in messages],
        "task_budgets": state.values.get("task_budgets", []),
    }