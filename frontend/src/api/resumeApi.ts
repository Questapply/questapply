// src/api/resumeApi.ts
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const BASE = `${API_BASE}/resume-data`;

export type SaveResumePayload = {
  templateId: number | null;
  title: string;
  sections: Record<string, { title: string; content: string }>;
};

export interface SaveResumeResponse {
  id?: string; // برای استاب/سازگاری
  new_resume_id?: string; // خروجی واقعی بک‌اند
  success?: boolean;
  message?: string;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
// resumeApi.ts

export async function listResumes() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/user-resumes-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch resumes summary");
  return res.json(); // [{id,title,updated_at,status,size,file_type,...}]
}

export async function prefillResume() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/prefill`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Prefill HTTP ${res.status}`);
  console.log("Profile resume:->", res);
  return res.json(); // { sections, context }
}

// (preview/edit)
export async function getResume(resumeId: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/resume/${resumeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) {
    const err: any = new Error("NotFound");
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error("Failed to fetch resume");
  return res.json();
}
// Delete resume
export async function deleteResume(resumeId: string) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}/resume/${resumeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    // 204 هم ok محسوب می‌شود؛ پس اگر ok نیست، خطاست
    throw new Error(`Failed to delete resume (${res.status})`);
  }

  // پاسخ بدنه ندارد (204) → چیزی parse نکن
  return true;
}

export async function fetchTemplates(allowedIds?: number[] | string) {
  const r = await fetch(`${BASE}/templates`, { headers: authHeaders() });
  if (!r.ok) throw new Error(`Templates HTTP ${r.status}`);
  const data = await r.json();

  // اگر آیدی ندادیم، همه را برگردان (سازگاری عقب‌رو)
  if (!allowedIds) return data;

  // allowedIds می‌تواند آرایه یا رشته "84,85,86,87" باشد
  const ids = Array.isArray(allowedIds)
    ? allowedIds.map(Number)
    : String(allowedIds)
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n));

  const set = new Set(ids);
  return Array.isArray(data)
    ? data.filter((t: any) => set.has(Number(t.id ?? t.ID)))
    : [];
}

/**
 * Save (create/update) resume.
 * - از templateId و sections همان‌طور که هست استفاده می‌کنیم (بک‌اند خودش اگر آبجکت بود JSON.stringify می‌کند).
 * - نوع خروجی با بک‌اند هماهنگ شد: SaveResumeResponse
 */
export async function saveResume(
  payload: SaveResumePayload,
  resumeId?: string | null
): Promise<SaveResumeResponse> {
  const body = {
    resume_id: resumeId ?? "new_resume_placeholder",
    template_id: payload.templateId,
    sections: payload.sections,
    display_name: payload.title ?? "My Resume",
  };

  const r = await fetch(`${BASE}/save-resume`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  // استاب قدیمی اگر لازم داری—اما خروجی رو هم‌سان با بک‌اند نگه داریم
  if (r.status === 404) {
    const id = crypto.randomUUID();
    localStorage.setItem(`resume:${id}`, JSON.stringify(payload));
    return { id, new_resume_id: id, success: true, message: "local stub" };
  }

  if (!r.ok) throw new Error(`Save HTTP ${r.status}`);
  return (await r.json()) as SaveResumeResponse;
}

/** مسیر صحیح Preview + پاس دادن templateId در صورت نیاز */
export function previewResumeUrl(id: string, templateId?: number | null) {
  const qs = templateId ? `?templateId=${templateId}` : "";
  return `/dashboard/resume/preview/${id}${qs}`;
}

/**
 * Export (pdf/docx/txt) — همیشه blob برمی‌گرداند.
 * از همان BASE بالا استفاده می‌کنیم تا با VITE_API_BASE هماهنگ باشد.
 */
export async function exportResume(opts: {
  resumeId: string;
  templateId?: number | null;
  // sections?: any; // نیازی نیست چون بک‌اند از DB می‌خوانَد؛ اگر می‌خوای بفرستی، اضافه کن
  format: "pdf" | "docx" | "txt";
}): Promise<Blob> {
  const accept =
    opts.format === "pdf"
      ? "application/pdf, application/octet-stream"
      : opts.format === "docx"
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/octet-stream"
      : "text/plain, application/octet-stream";

  const r = await fetch(`${BASE}/export`, {
    method: "POST",
    headers: { ...authHeaders(), Accept: accept },
    body: JSON.stringify({
      resume_id: opts.resumeId,
      template_id: opts.templateId ?? undefined,
      format: opts.format,
    }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(
      `Export HTTP ${r.status}${txt ? " — " + txt.slice(0, 200) : ""}`
    );
  }
  return r.blob();
}
