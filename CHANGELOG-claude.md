# blog-rag-app: change log (kept during the Claude-assisted UI / perf work)

Rule for this file: every change is logged BEFORE or WHILE it is made, with the original
code of anything that is not pure CSS, so any step can be undone by hand.

Recommended: make a git checkpoint at every "CHECKPOINT" line below.
    git add -A && git commit -m "checkpoint: <name>"

---------------------------------------------------------------------------------------------

## PART A: UI-only changes (done, logic/flow untouched)  [2026-10-23]

All CSS changes are in `frontend/src/styles/App.css`.

| # | What | Files |
|---|------|-------|
| A1 | AI message: 90% width on desktop, full width + side padding at <=768px; markdown images fit the message (full width on mobile) | App.css |
| A2 | Markdown spacing for AI messages (paragraphs, headings, lists), because Tailwind's reset removed them | App.css |
| A3 | Compact input once a thread has messages (pill shape, token + send buttons on the right, round light send button with 20px icon), smooth morph transition from/to the large input | App.css, ChatPage.jsx |
| A4 | Sidebar slides OVER the chat at <=768px instead of squeezing it | App.css |
| A5 | Slimmer sidebar; thread list with rail + sliding diamond marker; one-line thread names with fade at the end | App.css, ThreadSidebar.jsx |
| A6 | Compact input floats over the messages (messages visible around/behind it); `:has()` bottom padding | App.css |

### JSX edits made in Part A (originals, for rollback)

**ChatPage.jsx** (A3): the only JSX change
```jsx
// ORIGINAL
<div className="input-bar">
// NOW
<div className={`input-bar ${messages.length > 0 ? "compact" : ""}`}>
```

**ThreadSidebar.jsx** (A5)
```jsx
// ADDED (before `return (`):
const activeIndex = threads.findIndex((t) => t.id === activeThreadId); // UI only

// ORIGINAL list markup
<ul>
  {threads.map((t) => (
    <li
      key={t.id}
      className={`text-white px-6 py-2 mb-1 rounded-lg cursor-pointer ${
        t.id === activeThreadId
          ? "bg-white/[0.12]"
          : "bg-white/[0.04] hover:bg-white/[0.08]"
      }`}
      onClick={() => onSelectThread(t.id)}
    >
      {t.name}
    </li>
  ))}
</ul>
// NOW: wrapped in <div className="thread-list ..." style={{"--active-index": ...}}>,
// li uses className "thread-item [active]", title={t.name}, name wrapped in <span className="thread-name">.
// onClick / effect / props are unchanged.
```

CHECKPOINT: "ui-complete" (commit here before starting Part B)

---------------------------------------------------------------------------------------------

## PART B: Payload investigation: "send only the new message instead of the whole thread"  [2026-10-23]

### Status: INVESTIGATED ONLY. NO BACKEND OR API CODE HAS BEEN CHANGED YET. Waiting for approval.

### Findings (current behavior, verified by reading the code)
1. `GraphState.messages` uses the `add_messages` reducer and the graph is compiled with a
   checkpointer (`InMemorySaver`). Every `graph.invoke(..., thread_id)` therefore returns the
   ENTIRE accumulated thread in `result["messages"]`.
2. `routes_blog.py` -> `generate_blog` serializes ALL of `result["messages"]` into the response.
3. `merge_node` writes the final blog (images embedded as base64 data URIs) into one AIMessage.
   So every previous AI message, including all its base64 images, is re-sent on every send.
   Payload grows with thread length.
4. Frontend `ChatPage.jsx` -> `handleSend` does `setMessages(data.messages)` (replace, not append).
5. `task_budgets` is overwritten on each run (token_budget_node), NOT accumulated, so it is
   fine to keep returning it as is.
6. `GET /threads/{id}` (loading an old thread) legitimately needs the full thread. Unchanged.

### Original code at the spots that a fix would touch (for rollback)

**backend/app/api/routes_blog.py**
```python
class BlogRequest(BaseModel):
    topic: str
    thread_id: str | None = None
...
    return {
        "thread_id": thread_id,
        "messages": [{"type": m.type, "content": m.content} for m in result["messages"]],
        "task_budgets": result["task_budgets"],
    }
```

**frontend/src/pages/ChatPage.jsx** (inside handleSend)
```jsx
      const data = await sendMessage(currentInput, threadId);
      setThreadId(data.thread_id);
      setMessages(data.messages);
      setTaskBudgets(data.task_budgets);
```

**frontend/src/api/blogApi.js**
```js
    body: JSON.stringify({ topic, thread_id: threadId }),
```

### Planned change (NOT applied): see conversation for the proposal and risks.
