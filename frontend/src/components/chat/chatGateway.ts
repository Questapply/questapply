// chat/chatGateway.ts
import { N8nRequest, N8nResponse } from "./actions";

const DEFAULT_N8N_URL =
  (import.meta as any)?.env?.VITE_N8N_CHAT_WEBHOOK ||
  "http://localhost:5678/webhook/chat"; // آدرس وب‌هوک n8n خودت

console.debug("N8N URL =", DEFAULT_N8N_URL);

export async function sendToN8n(
  payload: N8nRequest,
  url: string = DEFAULT_N8N_URL,
  timeoutMs = 20000
): Promise<N8nResponse> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`n8n HTTP ${res.status}: ${text}`);
    }
    const json = (await res.json()) as N8nResponse;
    if (!json || !Array.isArray(json.actions)) {
      return { actions: [] };
    }
    return json;
  } finally {
    clearTimeout(to);
  }
}
