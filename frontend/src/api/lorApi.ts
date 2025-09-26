// lorApi.ts

// از هر کدام که وجود داشت استفاده کن؛ در غیر این صورت localhost
export const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const LOR_BASE = `${API_BASE}/lor`;

export function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type LorSampleItem = {
  id: number;
  title: string | null;
  type: string | null;
  level: string | null;
  program_id: number | null;
  date: string | null;
  file_url: string | null;
  ext: string | null;
  preview_img_url?: string | null;
};

// ---------- helpers ----------
function toYMD(d: string | Date | undefined | null): string | null {
  if (!d) return null;
  try {
    const dt = typeof d === "string" ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10); // YYYY-MM-DD
  } catch {
    return null;
  }
}

// ---------- core fetchers ----------
async function apiGet(path: string) {
  const res = await fetch(`${LOR_BASE}${path}`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "include",
  });
  const txt = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(txt);
      throw new Error(j.message || txt);
    } catch {
      throw new Error(txt || `GET ${path} failed`);
    }
  }
  return txt ? JSON.parse(txt) : null;
}

async function apiPostJson(path: string, body: any) {
  const res = await fetch(`${LOR_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });
  const txt = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(txt);
      throw new Error(j.message || txt);
    } catch {
      throw new Error(txt || `POST ${path} failed`);
    }
  }
  return txt ? JSON.parse(txt) : null;
}

async function apiPostBlob(path: string, body: any) {
  const res = await fetch(`${LOR_BASE}${path}`, {
    method: "POST",
    headers: { ...authHeaders(), Accept: "*/*" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition") || "";
  const m = cd.match(/filename="?([^"]+)"?/i);
  const filename = m?.[1] || "lor-export";
  return { blob, filename };
}

// ---------- LOR API ----------
export function getLorMeta() {
  // فقط "/meta" (نه "/lor/meta") چون LOR_BASE قبلاً /lor را دارد
  return apiGet("/meta");
}

/* ---------- Save/Generate/Export ---------- */
export function saveLorSections(
  sections: Record<string, { title?: string; content?: string }>
) {
  return apiPostJson(`/meta`, { sections });
}

// export async function exportLor(
//   format: "txt" | "pdf" | "docx",
//   sections?: any,
//   content?: string,
//   opts?: { template_id?: number | null; title?: string }
// ) {
//   return apiPostBlob(`/export`, {
//     format,
//     sections,
//     content,
//     ...(opts?.template_id ? { template_id: opts.template_id } : {}),
//     ...(opts?.title ? { title: opts.title } : {}),
//   });
// }

// lorApi.ts
export async function exportLor(
  format: "pdf" | "docx" | "txt",
  sections:
    | Record<string, { title: string; content: string }>
    | { title: string; content: string }[],
  content?: string,
  opts?: {
    title?: string;
    template_id?: number | string;
    return?: "json" | "blob";
    std_id?: number;
  }
) {
  const body: any = {
    format,
    title: opts?.title ?? "LOR",
    sections,
    content: content ?? "",
    template_id: opts?.template_id ?? null,
    std_id: opts?.std_id ?? null,
    return: opts?.return === "json" ? "json" : undefined,
  };

  const url = `${LOR_BASE}/export${opts?.return === "json" ? "?json=1" : ""}`;
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());

  if (opts?.return === "json") {
    return res.json(); // { ok, url, filename, format }
  } else {
    const blob = await res.blob();
    // سعی کن filename را از header بخوانی
    const cd = res.headers.get("content-disposition") || "";
    const mQuoted = cd.match(/filename="([^"]+)"/i);
    const filename = mQuoted ? mQuoted[1] : `LOR.${format}`;
    return { blob, filename };
  }
}

export async function fetchSamples(type: string | null | undefined) {
  const t = type && type !== "all" ? `?type=${encodeURIComponent(type)}` : "";
  const data = await apiGet(`/sample${t}`);
  return (data?.items || []) as LorSampleItem[];
}

export async function fetchSampleById(id: number) {
  const data = await apiGet(`/sample/${id}`);
  return data as {
    id: number;
    file_url: string;
    ext: string;
    title: string | null;
  };
}

export async function generateLor(
  sections?: any,
  opts?: { template_id?: number | null }
) {
  return apiPostJson(`/generate`, {
    sections,
    ...(opts?.template_id ? { template_id: opts.template_id } : {}),
    previewOnly: true,
  });
}

/* ---------- Recommender flow ---------- */
/** Create/send a recommender request */
export function sendRecommenderRequest(payload: {
  recommender_name: string;
  recommender_email: string;
  recommender_type: string; // "Professor" | "Colleague" | ...
  deadline: string | Date; // YYYY-MM-DD or Date
  message?: string; // optional custom template
  candidate_name?: string;
  candidate_email?: string;
}) {
  // بک‌اند انتظار دارد: fullname, email, type, deadline, template
  const body = {
    fullname: payload.recommender_name,
    email: payload.recommender_email,
    type: payload.recommender_type,
    deadline: toYMD(payload.deadline) ?? String(payload.deadline || ""),
    ...(payload.message ? { template: payload.message } : {}),
  };
  return apiPostJson("/recommender/request", body);
}

/** List previously sent requests */
export function getRecommenderRequests() {
  return apiGet("/recommender/requests");
}

/** Send a reminder for a specific request
 *  بک‌اند: { id, email, value? }
 */
export function remindRecommender(id: number, email: string, value?: string) {
  return apiPostJson("/recommender/remind", {
    id,
    email,
    ...(value ? { value } : {}),
  });
}

/* ---------- Template selection (local) ---------- */
const KEY = "lor_template_id";

export function setSelectedTemplateId(id: number | null) {
  if (id == null) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, String(id));
  window.dispatchEvent(
    new CustomEvent("lor:template:selected", { detail: id })
  );
}

export function getSelectedTemplateId(): number | null {
  const v = localStorage.getItem(KEY);
  return v ? Number(v) : null;
}

export function clearSelectedTemplateId() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(
    new CustomEvent("lor:template:selected", { detail: null })
  );
}

export function getLorDocuments() {
  return apiGet("/documents"); // GET /api/lor/documents
}
export async function deleteLorDocument(fileUrl: string) {
  const res = await fetch(
    `${LOR_BASE}/documents?url=${encodeURIComponent(fileUrl)}`,
    {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteLorRequest(
  requestId: string | number
): Promise<{ ok: true }> {
  const res = await fetch(`${LOR_BASE}/recommender/requests/${requestId}`, {
    method: "DELETE",
    headers: authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
