const API_URL = import.meta.env.VITE_API_URL

export async function sendMessage(topic, threadId) {
  const res = await fetch(`${API_URL}/generate-blog`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, thread_id: threadId }),
  });
  return res.json();
}