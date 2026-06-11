const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080/api/v1";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  ok: true;
  reply: string;
  suggestions: string[];
}

export interface ChatError {
  ok: false;
  error: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
  } catch {
    // ignore
  }
  return res.status === 0 ? "Cannot reach server. Is the backend running?" : "Chat request failed";
}

export async function apiChat(
  message: string,
  history: ChatMessage[],
  pageContext?: string | null
): Promise<ChatResult | ChatError> {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: history.slice(-12),
        page_context: pageContext ?? null,
      }),
    });
    if (!res.ok) return { ok: false, error: await parseError(res) };
    const data = await res.json();
    return {
      ok: true,
      reply: data.reply ?? "",
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  } catch {
    return { ok: false, error: "Cannot reach server. Start backend on port 8080." };
  }
}
