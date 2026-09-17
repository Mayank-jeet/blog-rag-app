import { useState, useEffect } from "react";
import { listThreads } from "../api/threadsApi";
import newChatIcon from "../assets/icons/new-chat.png";
function ThreadSidebar({ activeThreadId, onSelectThread, onNewChat, isOpen }) {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    listThreads().then((data) => setThreads(data.threads));
  }, [activeThreadId]);

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`} >
      <div className="sidebar-content text-white">
        <button className="new-chat-button bg-[#495057] mb-4" onClick={onNewChat}>
          <img src={newChatIcon} alt="new-chat" className="w-4 h-4 object-contain" />
          <p>New chat</p>
        </button>
        <ul>
          {threads.map((t) => (
            <li
              key={t.id}
              className={`text-white px-6 py-2 mb-1 rounded-lg cursor-pointer ${
                t.id === activeThreadId
                  ? "bg-[#30343f]"
                  : "bg-[#2a2a2a] hover:bg-[#333333]"
              }`}
              onClick={() => onSelectThread(t.id)}
            >
              {t.name}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default ThreadSidebar;