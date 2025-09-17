// src/api/submission.ts
const API_BASE = "http://localhost:5000/api";

export type SubmissionDoc = {
  key: string;
  name: string;
  required: boolean;
  status: "missing" | "completed" | "pending";
  url?: string | null;
  meta?: Record<string, any>;
};

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getSubmissionDocs(relId: number | string, token: string) {
  const res = await fetch(`${API_BASE}/submission/${relId}/docs`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!res.ok)
    throw new Error(`GET docs failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function startOrUpdateSubmission(
  relId: number | string,
  token: string,
  reviewEnabled = false
) {
  const res = await fetch(`${API_BASE}/submission/${relId}/start`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ reviewEnabled }),
  });
  if (!res.ok)
    throw new Error(`Start submission failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function patchSubmissionDocs(
  relId: number | string,
  token: string,
  docs: any[]
) {
  const res = await fetch(`${API_BASE}/submission/${relId}/docs`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ docs }),
  });
  if (!res.ok)
    throw new Error(`PATCH docs failed: ${res.status} ${res.statusText}`);
  return res.json();
}
export async function getSubmissionFees(relId: number | string, token: string) {
  const res = await fetch(`${API_BASE}/submission/${relId}/fees`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`fees ${res.status}`);
  return res.json(); // { application, submission, total, currency, symbol, isDomestic, raw }
}
export async function getProgramDetails(relId: number | string, token: string) {
  const res = await fetch(`${API_BASE}/program-data/details/${relId}`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`program details ${res.status}`);
  return res.json(); // ProgramDetail
}

export async function uploadSubmissionFile(
  relId: number | string,
  token: string,
  docKey: string,
  file: File
) {
  const form = new FormData();
  form.append("file", file);
  form.append("docKey", docKey);

  const res = await fetch(`${API_BASE}/submission/${relId}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // مهم: Content-Type رو دستی ست نکن؛ خود مرورگر boundary می‌ذاره
    } as any,
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed: ${res.status} ${txt}`);
  }
  return res.json(); // { ok, relId, doc, documents, progress }
}
