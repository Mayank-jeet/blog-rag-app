from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
import os


def get_llm(model: str):
    if model.startswith("gpt"):
        return ChatOpenAI(model=model, api_key=os.getenv("OPENAI_API_KEY"))
    elif model.startswith("claude"):
        return ChatAnthropic(model=model, api_key=os.getenv("ANTHROPIC_API_KEY"))
    else:
        raise ValueError(f"Unknown model: {model}")


def extract_text(content) -> str:
    """Normalizes LLM response content into a plain string.
    Some providers (notably Anthropic) can return content as a list of
    content blocks instead of a flat string."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
            elif isinstance(block, str):
                parts.append(block)
        return "".join(parts)
    return str(content)


def call_llm(prompt: str, model: str, system_message: str = "", max_tokens: int = 400) -> str:
    llm = get_llm(model)
    llm = llm.bind(max_tokens=max_tokens)
    messages = [SystemMessage(content=system_message), HumanMessage(content=prompt)]
    try:
        response = llm.invoke(messages)
        return extract_text(response.content)
    except Exception as e:
        print("LLM call failed:", repr(e))
        return ""