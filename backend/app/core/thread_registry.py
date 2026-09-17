import uuid
from datetime import datetime, timezone

_threads: dict[str, dict] = {}


def create_thread(name: str) -> str:
    thread_id = str(uuid.uuid4())
    _threads[thread_id] = {
        "id": thread_id,
        "name": name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return thread_id

def truncate_topic(topic: str, max_words: int = 5, max_chars: int = 30) -> str:
    """Builds a fallback thread name from the raw topic, word by word,
    stopping as soon as EITHER the word count or character limit is hit."""
    words = topic.split()
    result = ""

    for i, word in enumerate(words):
        if i >= max_words:
            break
        candidate = (result + " " + word).strip()
        if len(candidate) > max_chars:
            break
        result = candidate

    if not result:
        result = topic[:max_chars]

    return result

def list_threads() -> list[dict]:
    return sorted(_threads.values(), key=lambda t: t["created_at"], reverse=True)


def thread_exists(thread_id: str) -> bool:
    return thread_id in _threads