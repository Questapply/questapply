/* =========================
 * Types (SOP sections)
 * ========================= */
export type SopKey =
  | "country"
  | "hook"
  | "segue"
  | "academic"
  | "extrac"
  | "publications"
  | "problem"
  | "why" // کلید درست در بک‌اند
  | "whySchool" // برای سازگاری قدیمی فرانت؛ بک‌اند نادیده می‌گیرد
  | "goal";

export type SopSection = { title: string; content: string };
export type SopSections = Partial<Record<SopKey, SopSection>>;

/* =========================
 * Types (Samples bundle)
 * ========================= */
export type SopProgram = { id: number; name: string };

export type SopSampleItem = {
  id: number;
  title: string | null;
  file_url: string; // مستقیم برای دانلود/بازشدن
  program_id: number;
  program_name: string;
  level: string | null;
  date: string | null;
  ext: string | null; // doc, docx, pdf, ...
  file_size_kb: number | null;
};

export type SopSampleBundle = {
  filters: {
    programs: SopProgram[];
    levels: string[];
    selected: {
      program_id: number | null;
      level: string | null;
    };
  };
  items: SopSampleItem[];
  paging: { limit: number; offset: number; total: number };
};

/* =========================
 * Base URLs & headers
 * ========================= */
export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const SOP_BASE = `${URL}/sop`;

function authHeaders(extra: Record<string, string> = {}) {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function toQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || Number.isNaN(v)) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/* =========================
 * SOP Meta / Generate / Export
 * ========================= */

// GET /api/sop/meta
// (بک‌اند فعلی sopId را نادیده می‌گیرد؛ پارامتر صرفاً برای سازگاری با فرانت است)
export async function getSopMeta(sopId?: string | number): Promise<{
  sections?: Partial<SopSections>;
  target?: string | null;
  country?: string | null;
}> {
  const url = new URL(`${SOP_BASE}/meta`);
  if (sopId != null) url.searchParams.set("sopId", String(sopId)); // ignored by server, kept for compatibility
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET /sop/meta → ${res.status}`);
  return res.json();
}

// POST /api/sop/meta  → ذخیره چند سکشن
export async function saveSopMeta(payload: {
  sopId?: string | number | null; // ignored by server; kept for compatibility
  sections: Partial<SopSections>;
  target?: string | null;
  country?: string | null;
}): Promise<{ ok: true }> {
  const res = await fetch(`${SOP_BASE}/meta`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// POST /api/sop/generate  → مونتاژ ساده (HTML/Text) بدون ساخت فایل
export async function generateSop(payload: {
  sections?: Partial<SopSections>;
  preview?: boolean; // بک‌اند از آن استفاده نمی‌کند؛ برای سازگاری UI
}): Promise<{ html?: string; content?: string; tokens_used?: any }> {
  const res = await fetch(`${SOP_BASE}/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// POST /api/sop/export  → ساخت و دانلود فایل (pdf/docx/txt)
// اگر sections/content ندهی، بک‌اند از usermeta همان کاربر می‌سازد.
export async function exportSop(payload: {
  format: "txt" | "pdf" | "docx";
  title?: string;
  sections?:
    | Array<{ title: string; content: string } | any>
    | Record<string, any>;
  content?: string;
}): Promise<Blob> {
  const res = await fetch(`${SOP_BASE}/export`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

// دانلود سریع فایل ساخته‌شده از بک‌اند (بر اساس usermeta فعلی)
export async function downloadSopFile(params: {
  format: "txt" | "pdf" | "docx";
  title?: string;
}): Promise<Blob> {
  const res = await fetch(`${SOP_BASE}/export`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      format: params.format,
      title: params.title ?? "SOP",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.blob();
}

// لیست لینک‌های ذخیره‌شده در usermeta (اگر استفاده می‌کنی)
export async function getSopDocuments(): Promise<
  { type: string; title: string; url: string }[]
> {
  const res = await fetch(`${SOP_BASE}/documents`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =========================
 * Samples (یک API یکپارچه)
 * ========================= */

// GET /api/sop/sample  (یک‌جا: programs + levels + defaults + items)
export async function getSopSampleBundle(params?: {
  programId?: number | null;
  level?: string | null;
  limit?: number;
  offset?: number;
}): Promise<SopSampleBundle> {
  const qp = toQuery({
    program_id: params?.programId ?? undefined,
    level: params?.level ?? undefined,
    limit: params?.limit ?? undefined,
    offset: params?.offset ?? undefined,
  });

  const res = await fetch(`${SOP_BASE}/sample${qp}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`GET /sop/sample${qp} → ${res.status}`);

  const data = await res.json();

  // --- حالت جدید (object با filters/items/paging)
  if (!Array.isArray(data) && data?.items) {
    const normalizedItems: SopSampleItem[] = (data.items as any[]).map(
      (r: any) => ({
        id: r.id,
        title: r.title ?? r.name ?? null,
        file_url: r.file_url ?? r.file, // fallback برای legacy key
        program_id: r.program_id,
        program_name: r.program_name ?? r.name,
        level: r.level ?? null,
        date: r.date ?? null,
        ext: (() => {
          const url = r.file_url ?? r.file;
          try {
            const u = new URL(url);
            const last = u.pathname.split("/").pop() || "";
            const dot = last.lastIndexOf(".");
            return dot >= 0 ? last.slice(dot + 1).toLowerCase() : null;
          } catch {
            return null;
          }
        })(),
        file_size_kb: r.file_size_kb ?? null,
      })
    );

    return {
      filters: {
        programs: data.filters?.programs ?? [],
        levels: data.filters?.levels ?? [],
        selected: {
          program_id:
            data.filters?.selected?.program_id ?? params?.programId ?? null,
          level: data.filters?.selected?.level ?? params?.level ?? null,
        },
      },
      items: normalizedItems,
      paging: data.paging ?? {
        limit: params?.limit ?? 30,
        offset: params?.offset ?? 0,
        total: normalizedItems.length,
      },
    };
  }

  // --- حالت legacy (آرایه‌ی ساده مثل چیزی که الآن برمی‌گرده)
  const legacy = Array.isArray(data) ? data : [];
  const items: SopSampleItem[] = legacy.map((r: any) => ({
    id: r.id,
    title: r.title ?? r.name ?? null,
    file_url: r.file, // در legacy کلید file داریم
    program_id: r.program_id,
    program_name: r.name,
    level: r.level ?? null,
    date: r.date ?? null,
    ext: (() => {
      try {
        const u = new URL(r.file);
        const last = u.pathname.split("/").pop() || "";
        const dot = last.lastIndexOf(".");
        return dot >= 0 ? last.slice(dot + 1).toLowerCase() : null;
      } catch {
        return null;
      }
    })(),
    file_size_kb: r.file_size_kb ?? null,
  }));

  return {
    filters: {
      programs: [], // بک‌اند legacy اینها رو نمی‌ده
      levels: [],
      selected: {
        program_id: params?.programId ?? null,
        level: params?.level ?? null,
      },
    },
    items,
    paging: {
      limit: params?.limit ?? 30,
      offset: params?.offset ?? 0,
      total: items.length,
    },
  };
}

// POST /api/sop/prefs  (به‌روزرسانی پیش‌فرض‌های فیلتر کاربر)
export async function saveSopPrefs(payload: {
  program_id?: number | null;
  level?: string | null;
}): Promise<{ ok: true }> {
  const res = await fetch(`${SOP_BASE}/prefs`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* =========================
 * (اختیاری) Endpoints کمکی — اگر در جایی نیاز شد
 * ========================= */

// فقط در صورت نیاز: دریافت جداگانه‌ی برنامه‌ها
export async function getSopPrograms(): Promise<SopProgram[]> {
  const res = await fetch(`${SOP_BASE}/programs`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET /sop/programs → ${res.status}`);
  return res.json();
}

// فقط در صورت نیاز: دریافت جداگانه‌ی لِوِل‌ها
export async function getSopLevels(): Promise<string[]> {
  const res = await fetch(`${SOP_BASE}/levels`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET /sop/levels → ${res.status}`);
  return res.json();
}

// فقط در صورت نیاز: گرفتن پیش‌فرض‌های فعلی کاربر
export async function getSopPrefs(): Promise<{
  program_id: number | null;
  level: string | null;
}> {
  const res = await fetch(`${SOP_BASE}/prefs`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET /sop/prefs → ${res.status}`);
  return res.json();
}

// خروجی /api/sop/documents → [{ type:"sop", title:string, url:string }]
// جایگزین کن
export function mapSopDocsToCards(
  docs: Array<{ type?: string; title?: string; url: string }>
) {
  return (docs || []).map((d, i) => {
    let ext: string | null = null;
    try {
      const u = new URL(d.url);
      const last = (u.pathname.split("/").pop() || "").toLowerCase();
      const dot = last.lastIndexOf(".");
      ext = dot >= 0 ? last.slice(dot + 1).toUpperCase() : null;
    } catch {}
    return {
      id: String(i + 1),
      title: d.title || `SOP ${i + 1}`,
      lastUpdated: null,
      status: "verified",
      size: null,
      type: ext || "FILE",
      url: d.url, // ← به‌جای directUrl
    };
  });
}
export async function deleteSopDocument(
  fileUrl: string
): Promise<{ ok: true }> {
  const url = `${SOP_BASE}/documents?url=${encodeURIComponent(fileUrl)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
