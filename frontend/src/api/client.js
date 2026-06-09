// src/api/client.js
// Centralized API calls to the FastAPI backend

const BASE_URL = "http://localhost:8000";

// ── Upload ────────────────────────────────────────────────────────────────────
export async function uploadPDFs(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

// ── Status ────────────────────────────────────────────────────────────────────
export async function getStatus() {
  const res = await fetch(`${BASE_URL}/status`);
  if (!res.ok) throw new Error("Status check failed");
  return res.json();
}

// ── Chat (streaming) ──────────────────────────────────────────────────────────
export async function streamChat(question, onToken, onSources, onDone, onError) {
  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Chat failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.type === "sources") onSources(parsed.data);
        else if (parsed.type === "token") onToken(parsed.data);
        else if (parsed.type === "done") onDone(parsed.data);
        else if (parsed.type === "error") onError(parsed.data);
      } catch (e) {
        // ignore parse errors on incomplete chunks
      }
    }
  }
}

// ── Chat History ──────────────────────────────────────────────────────────────
export async function getChatHistory() {
  const res = await fetch(`${BASE_URL}/chat/history`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function clearChatHistory() {
  const res = await fetch(`${BASE_URL}/chat/history`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear history");
  return res.json();
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export async function generateQuiz(topic, quiz_type, num_questions = 5) {
  const res = await fetch(`${BASE_URL}/quiz/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, quiz_type, num_questions }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Quiz generation failed");
  }
  return res.json();
}

export async function scoreQuiz(questions, user_answers, quiz_type) {
  const res = await fetch(`${BASE_URL}/quiz/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions, user_answers, quiz_type }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Scoring failed");
  }
  return res.json();
}

// ── Summarize ─────────────────────────────────────────────────────────────────
export async function summarize(topic, summary_type) {
  const res = await fetch(`${BASE_URL}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, summary_type }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Summarization failed");
  }
  return res.json();
}
// Video generator
export async function getVideos(topic) {
  const response = await fetch("http://localhost:8000/videos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  return response.json();
}