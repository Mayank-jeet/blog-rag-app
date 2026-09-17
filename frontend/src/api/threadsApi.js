const API_URL = import.meta.env.VITE_API_URL

export async function listThreads() {
  const res = await fetch(`${API_URL}/threads`);
  return res.json();
}

export async function getThread(threadId) {
  const res = await fetch(`${API_URL}/threads/${threadId}`);
  return res.json();
}