import { useState } from "react";
import { sendMessage } from "../api/blogApi";
import { getThread } from "../api/threadsApi";
import UserMessageCard from "../components/UserMessageCard";
import AIMessageCard from "../components/AIMessageCard";
import ThreadSidebar from "../components/ThreadSidebar";
import TokenBudgetPanel from "../components/TokenBudgetPanel";
import tokenBugetIcon from "../assets/icons/token-budget.png"
import sendButtonIcon from "../assets/icons/send-button.png"
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
      setMessages(data.messages);
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
      />

      <main className="chat-area text-white flex flex-col h-screen">
        <div className="topbar flex items-center text-xl ">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen((prev) => !prev)}>
            ☰
          </button>
          <p className="font-bold">BlogGEN</p>
        </div>
        <div className="messages flex-1 min-h-0 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <div className="max-w-[480px] w-full">
                <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">
                  What would you like to know about
                  <span className="wave-dot">.</span>
                  <span className="wave-dot">.</span>
                  <span className="wave-dot">.</span>
                </h2>
              </div>
            </div>
          ) : (
            messages.map((msg, i) =>
              msg.type === "human" ? (
                <UserMessageCard key={i} content={msg.content} />
              ) : (
                <AIMessageCard key={i} content={msg.content} />
              )
            )
          )}
          {loading && <p>Generating
                <span className="wave-dot">.</span>
                <span className="wave-dot">.</span>
                <span className="wave-dot">.</span>
                </p>}
        </div>
        {showTokenBudget && (
          <TokenBudgetPanel taskBudgets={taskBudgets} />
        )}
        <div className="input-bar">
          <input
            className="rounded-l-full rounded-r-full bg-[#495057] text-white px-4 py-2 w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about a topic"
            disabled={loading}
          />
          <button className="rounded-full text-2xl bg-[#495057]" onClick={handleSend} disabled={loading}>
            <img src={sendButtonIcon} alt="send-button" className="w-4 h-4 object-contain"></img>
          </button>
          <button
              className="rounded-full text-2xl bg-[#495057]"
              onClick={() => setShowTokenBudget((prev) => !prev)}>
              <img src={tokenBugetIcon} alt="token-budget" className="w-4 h-4 object-contain"></img>
            </button>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;