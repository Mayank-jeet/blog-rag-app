import { useState } from "react";
import { sendMessage } from "../api/blogApi";
import { getThread } from "../api/threadsApi";
import UserMessageCard from "../components/UserMessageCard";
import AIMessageCard from "../components/AIMessageCard";
import ThreadSidebar from "../components/ThreadSidebar";
import TokenBudgetPanel from "../components/TokenBudgetPanel";
import GlobeCanvas from "../components/GlobeCanvas";
import GeneratingCard from "../components/GeneratingCard";
import tokenBugetIcon from "../assets/icons/token-budget.png"
function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [taskBudgets, setTaskBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTokenBudget, setShowTokenBudget] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "human", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(currentInput, threadId);
      setThreadId(data.thread_id);
      setMessages((prev) => [...prev, ...data.messages]); // backend now returns only the new reply (last_only)
      setTaskBudgets(data.task_budgets);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThread = async (id) => {
    setLoading(true);
    const data = await getThread(id);
    setThreadId(id);
    setMessages(data.messages);
    setTaskBudgets(data.task_budgets);
    setShowTokenBudget(false);
    setLoading(false);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    setThreadId(null);
    setMessages([]);
    setTaskBudgets([]);
    setInput("");
    setShowTokenBudget(false);
    setSidebarOpen(false);
  };

  return (
    <div className="app-container bg-[#000000]">
      <ThreadSidebar
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="chat-area text-white flex flex-col h-screen">
        <div
          className={`globe-layer ${messages.length === 0 ? "" : "away"}`}
          aria-hidden="true"
        >
          <GlobeCanvas active={messages.length === 0} />
          <h2 className="globe-heading text-lg md:text-xl lg:text-2xl font-semibold text-gray-400">
            What would you like to know about
            <span className="wave-dot">.</span>
            <span className="wave-dot">.</span>
            <span className="wave-dot">.</span>
          </h2>
        </div>
        <div className="topbar flex items-center text-xl ">
          <button
            className={`sidebar-toggle sidebar-open-btn ${sidebarOpen ? "is-hidden" : ""}`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
            tabIndex={sidebarOpen ? -1 : 0}
            aria-hidden={sidebarOpen}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 8h16" />
              <path className="icon-short-line" d="M4 16h16" />
            </svg>
          </button>
          <p className="font-bold">BlogGEN</p>
        </div>
        <div className="messages flex-1 min-h-0 overflow-y-auto">
          {messages.map((msg, i) =>
            msg.type === "human" ? (
              <UserMessageCard key={i} content={msg.content} />
            ) : (
              <AIMessageCard key={i} content={msg.content} />
            )
          )}
          {loading && <GeneratingCard />}
        </div>
        {showTokenBudget && (
          <TokenBudgetPanel taskBudgets={taskBudgets} />
        )}
        <div className={`input-bar ${messages.length > 0 ? "compact" : ""}`}>
          <div className="chat-input">
            <textarea
              className="chat-input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about a topic"
              disabled={loading}
              rows={2}
            />
            <div className="chat-input-footer">
              <button
                type="button"
                className="chat-input-icon-btn"
                onClick={() => setShowTokenBudget((prev) => !prev)}
              >
                <img src={tokenBugetIcon} alt="token-budget" className="w-4 h-4 object-contain" />
              </button>
              <button
                type="button"
                className="chat-input-send-btn"
                onClick={handleSend}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="send-button"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;