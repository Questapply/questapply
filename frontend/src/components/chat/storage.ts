// chat/storage.ts
import type { ChatMessage } from "./ChatHistory";

export type SessionMeta = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
};

// ---------- Keys ----------
const threadStorageKey = (threadKey: string) => `chat:thread:${threadKey}`;
const SESSION_LIST_KEY = (pageId: string) => `chat:sessions:${pageId}`;
export const THREAD_KEY = (pageId: string, sessionId: string) =>
  `chat:thread:${pageId}:${sessionId}`;

// ---------- Session utils ----------
export function makeSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function listSessionsLocal(pageId: string): SessionMeta[] {
  try {
    const raw = localStorage.getItem(SESSION_LIST_KEY(pageId));
    const arr = raw ? (JSON.parse(raw) as SessionMeta[]) : [];
    if (!Array.isArray(arr)) return [];
    return arr.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveSessionsLocal(pageId: string, list: SessionMeta[]) {
  try {
    localStorage.setItem(SESSION_LIST_KEY(pageId), JSON.stringify(list));
  } catch {
    // no-op
  }
}

export function upsertSessionMetaLocal(pageId: string, meta: SessionMeta) {
  const list = listSessionsLocal(pageId);
  const i = list.findIndex((x) => x.id === meta.id);
  if (i >= 0) list[i] = meta;
  else list.unshift(meta);
  saveSessionsLocal(pageId, list);
}

export function updateSessionTitleLocal(
  pageId: string,
  sessionId: string,
  title: string
) {
  const list = listSessionsLocal(pageId);
  const i = list.findIndex((x) => x.id === sessionId);
  if (i >= 0) {
    list[i].title = title;
    list[i].updatedAt = Date.now();
    saveSessionsLocal(pageId, list);
  }
}

export function createNewSessionLocal(pageId: string): SessionMeta {
  const id = makeSessionId();
  const now = Date.now();
  const meta: SessionMeta = {
    id,
    title: `New chat — ${new Date(now).toLocaleString()}`,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  };
  upsertSessionMetaLocal(pageId, meta);
  return meta;
}

export function finalizeSessionLocal(
  pageId: string,
  sessionId: string,
  messagesCount: number
) {
  const list = listSessionsLocal(pageId);
  const i = list.findIndex((x) => x.id === sessionId);
  if (i >= 0) {
    list[i].messageCount = messagesCount;
    list[i].updatedAt = Date.now();
    saveSessionsLocal(pageId, list);
  }
}

// ---------- Local thread IO ----------
export function loadThreadLocal(threadKey: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(threadStorageKey(threadKey));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return (arr as ChatMessage[]).map((m) => ({
      ...m,
      timestamp: m?.timestamp ? new Date(m.timestamp as any) : new Date(),
    }));
  } catch {
    return [];
  }
}

export function saveThreadLocal(threadKey: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(threadStorageKey(threadKey), JSON.stringify(messages));
  } catch {
    // no-op
  }
}

export function deleteThreadLocal(threadKey: string) {
  try {
    localStorage.removeItem(threadStorageKey(threadKey));
  } catch {
    // no-op
  }
}

// ---------- Server (optional) ----------
const SERVER_URL = (import.meta as any)?.env?.VITE_CHAT_SERVER_URL || ""; // خالی = غیرفعال

export async function loadThreadFromServer(
  threadKey: string
): Promise<ChatMessage[] | null> {
  if (!SERVER_URL) return null;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${SERVER_URL}/chat/threads/${encodeURIComponent(threadKey)}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { messages: ChatMessage[] };
    if (!data?.messages) return null;
    return data.messages.map((m) => ({
      ...m,
      timestamp: m?.timestamp ? new Date(m.timestamp as any) : new Date(),
    }));
  } catch {
    return null;
  }
}

export async function saveThreadToServer(
  threadKey: string,
  messages: ChatMessage[]
): Promise<void> {
  if (!SERVER_URL) return;
  try {
    const token = localStorage.getItem("token");
    await fetch(`${SERVER_URL}/chat/threads/${encodeURIComponent(threadKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });
  } catch {
    // no-op
  }
}

// ---------- Hydrate ----------
export async function hydrateThread(threadKey: string): Promise<ChatMessage[]> {
  const fromServer = await loadThreadFromServer(threadKey);
  if (fromServer && fromServer.length) {
    saveThreadLocal(threadKey, fromServer);
    return fromServer;
  }
  return loadThreadLocal(threadKey);
}

// ---------- Older sessions on server (stubs) ----------

export async function archiveSessionsToServer(
  pageId: string,
  metas: SessionMeta[]
) {
  // TODO: call your API to archive metas in Redis
  // await fetch(`${SERVER_URL}/chat/sessions/archive`, { ... })
}

export async function fetchOlderSessionsFromServer(
  pageId: string,
  offset: number,
  limit: number
): Promise<SessionMeta[]> {
  // TODO: call your API to get older metas from Redis
  // const res = await fetch(`${SERVER_URL}/chat/sessions?${new URLSearchParams({ pageId, offset: String(offset), limit: String(limit) })}`);
  // return await res.json();
  return [];
}

// ---------- Keep only last N in local (optional helper) ----------
export async function capSessionsLocalAndMaybeArchive(
  pageId: string,
  keep: number = 5
) {
  const list = listSessionsLocal(pageId);
  if (list.length <= keep) return;

  const keepers = list.slice(0, keep);
  const toArchive = list.slice(keep);

  // اختیاری: بفرست سرور
  try {
    await archiveSessionsToServer(pageId, toArchive);
  } catch {
    // no-op
  }

  saveSessionsLocal(pageId, keepers);
  // اگر خواستی پیام‌های قدیمی رو هم از لوکال پاک کنی:
  // toArchive.forEach(m => deleteThreadLocal(THREAD_KEY(pageId, m.id)));
}
