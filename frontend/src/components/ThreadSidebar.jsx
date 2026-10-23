import { useState, useEffect } from "react";
import { listThreads } from "../api/threadsApi";
import newChatIcon from "../assets/icons/new-chat.png";
function ThreadSidebar({ activeThreadId, onSelectThread, onNewChat, isOpen, onClose }) {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    listThreads().then((data) => setThreads(data.threads));
  }, [activeThreadId]);

  const activeIndex = threads.findIndex((t) => t.id === activeThreadId); // UI only: where the marker slides to

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`} >
      <div className="sidebar-content text-white">
        <div className="sidebar-header">
          <button className="new-chat-button bg-white/[0.06] hover:bg-white/[0.12]" onClick={onNewChat}>
            <img src={newChatIcon} alt="new-chat" className="w-4 h-4 object-contain" />
            <p>New chat</p>
          </button>
          <button
            className="sidebar-toggle sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close sidebar"
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
              <g className="icon-close-chevrons">
                <path d="M12 7 L7 12 L12 17" />
                <path d="M18 7 L13 12 L18 17" />
              </g>
            </svg>
          </button>
        </div>
        <div
          className={`thread-list ${activeIndex >= 0 ? "has-active" : ""}`}
          style={{ "--active-index": Math.max(activeIndex, 0) }}
        >
          <ul>
            {threads.map((t) => (
              <li
                key={t.id}
                className={`thread-item ${t.id === activeThreadId ? "active" : ""}`}
                onClick={() => onSelectThread(t.id)}
                title={t.name}
              >
                <span className="thread-name">{t.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default ThreadSidebar;