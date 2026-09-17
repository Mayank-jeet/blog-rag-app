from app.services.llm_client import call_llm

ROUTER_SYSTEM_PROMPT = """You are deciding whether a research task requires looking up
current/external information, or whether it can be answered from general knowledge.
Respond with ONLY the word "research" or "skip" — nothing else."""

def needs_research(task: dict) -> bool:
    try:
        result = call_llm(
            prompt=f"Task: {task['task']}",
            model="gpt-5.6-luna",
            system_message=ROUTER_SYSTEM_PROMPT,
            max_tokens=10,
        )
    except Exception as e:
                print("Research decision generation failed:", repr(e))
                result="skip"
    return result.strip().lower() == "research"