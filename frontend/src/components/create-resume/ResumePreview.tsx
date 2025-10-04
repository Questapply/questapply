// // src/components/ResumePreview.tsx
// import { useEffect, useMemo, useState } from "react";
// import { useParams, useSearchParams, useNavigate } from "react-router-dom";
// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// export default function ResumePreview() {
//   const { id } = useParams<{ id: string }>();
//   const [search] = useSearchParams();
//   const navigate = useNavigate();

//   const templateId = useMemo(() => {
//     const t = search.get("templateId");
//     return t ? parseInt(t, 10) : undefined;
//   }, [search]);

//   const [blobUrl, setBlobUrl] = useState<string | null>(null);
//   const [err, setErr] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function fetchPreview(signal?: AbortSignal) {
//     if (!id) return;
//     setLoading(true);
//     setErr(null);

//     const body: any = { resume_id: id, format: "pdf" };
//     if (typeof templateId === "number") body.template_id = templateId;

//     try {
//       const token = localStorage.getItem("token") || "";
//       const resp = await fetch(`${API_URL}/resume-data/export`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           Accept: "application/pdf, application/octet-stream",
//         },
//         body: JSON.stringify(body),
//         cache: "no-store",
//         signal,
//       });

//       if (!resp.ok) {
//         const text = await resp.text().catch(() => "");
//         throw new Error(`Export HTTP ${resp.status} — ${text.slice(0, 200)}`);
//       }
//       const ct = resp.headers.get("Content-Type") || "";
//       if (!ct.includes("application/pdf")) {
//         const text = await resp.text().catch(() => "");
//         throw new Error(
//           `Unexpected content-type: ${ct} — ${text.slice(0, 200)}`
//         );
//       }

//       const blob = await resp.blob();
//       const url = URL.createObjectURL(blob);
//       setBlobUrl((prev) => {
//         if (prev) URL.revokeObjectURL(prev);
//         return url;
//       });
//     } catch (e: any) {
//       setErr(e?.message ?? "Failed to export preview");
//       setBlobUrl((prev) => {
//         if (prev) URL.revokeObjectURL(prev);
//         return null;
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     const ac = new AbortController();
//     fetchPreview(ac.signal);
//     return () => {
//       ac.abort();
//       setBlobUrl((prev) => {
//         if (prev) URL.revokeObjectURL(prev);
//         return null;
//       });
//     };
//   }, [id, templateId]);

//   if (!id) return <div className="p-6 text-red-500">Invalid resume id</div>;

//   return (
//     <div className="max-w-5xl mx-auto p-4">
//       <div className="flex gap-2 mb-3">
//         <button
//           onClick={() => navigate(-1)}
//           className="px-3 py-2 rounded border text-sm
//                      bg-white text-gray-800 border-gray-300
//                      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
//         >
//           ← Back
//         </button>

//         <button
//           onClick={() => fetchPreview()}
//           disabled={loading}
//           className="px-3 py-2 rounded border text-sm
//                      bg-white text-gray-800 border-gray-300
//                      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
//                      disabled:opacity-50"
//         >
//           {loading ? "Refreshing…" : "Refresh Preview"}
//         </button>

//         {blobUrl && (
//           <a
//             href={blobUrl}
//             download={`resume-${id}.pdf`}
//             className="px-3 py-2 rounded border text-sm
//                        bg-indigo-600 text-white border-indigo-600
//                        hover:bg-indigo-700"
//           >
//             Download PDF (templated)
//           </a>
//         )}
//       </div>

//       {err && (
//         <div
//           className="p-4 mb-3 rounded border text-sm
//                         bg-red-50 text-red-600 border-red-200
//                         dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
//         >
//           {err}
//         </div>
//       )}

//       {loading && (
//         <div className="p-6 text-gray-600 dark:text-gray-300">
//           Generating preview…
//         </div>
//       )}

//       {!loading && blobUrl && (
//         <iframe
//           title="resume-preview"
//           src={blobUrl}
//           className="w-full h-[80vh] rounded border
//                      bg-white border-gray-200
//                      dark:bg-gray-900 dark:border-gray-700"
//         />
//       )}
//     </div>
//   );
// }
/////////////////////////////////
// src/components/ResumePreview.tsx
// src/components/ResumePreview.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ResumePreview() {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const navigate = useNavigate();

  const templateId = useMemo(() => {
    const t = search.get("templateId");
    return t ? parseInt(t, 10) : undefined;
  }, [search]);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mime, setMime] = useState<string | null>(null);
  const [htmlDoc, setHtmlDoc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchPreview(signal?: AbortSignal) {
    if (!id) return;
    setLoading(true);
    setErr(null);
    setInfo(null);
    setHtmlDoc(null);
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setMime(null);

    const body: any = { resume_id: id, format: "html" }; // ← فقط HTML برای Preview
    if (typeof templateId === "number") body.template_id = templateId;

    try {
      const token = localStorage.getItem("token") || "";
      const resp = await fetch(`${API_URL}/resume-data/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // HTML را ترجیح می‌دهیم؛ اگر سرور PDF داد هم قابل نمایش است
          Accept: "text/html, application/pdf, */*",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal,
      });

      if (!resp.ok) {
        let text = "";
        try {
          text = await resp.text();
        } catch {}
        throw new Error(`Export HTTP ${resp.status} — ${text.slice(0, 200)}`);
      }

      const ct = (resp.headers.get("Content-Type") || "").toLowerCase();

      if (ct.includes("text/html")) {
        const html = await resp.text();
        setHtmlDoc(html);
        setMime("text/html");
        return;
      }

      if (ct.includes("application/pdf")) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setMime("application/pdf");
        return;
      }

      // فرمت‌های دیگر را برای Preview نمایش نمی‌دهیم
      setInfo("Preview تنها برای HTML/PDF پشتیبانی می‌شود.");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load preview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    fetchPreview(ac.signal);
    return () => {
      ac.abort();
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setMime(null);
      setHtmlDoc(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, templateId]);

  if (!id) return <div className="p-6 text-red-500">Invalid resume id</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded border text-sm
                     bg-white text-gray-800 border-gray-300
                     dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
        >
          ← Back
        </button>

        <button
          onClick={() => fetchPreview()}
          disabled={loading}
          className="px-3 py-2 rounded border text-sm
                     bg-white text-gray-800 border-gray-300
                     dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
                     disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh Preview"}
        </button>
      </div>

      {err && (
        <div
          className="p-4 mb-3 rounded border text-sm
                        bg-red-50 text-red-600 border-red-200
                        dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        >
          {err}
        </div>
      )}

      {info && (
        <div
          className="p-4 mb-3 rounded border text-sm
                        bg-amber-50 text-amber-700 border-amber-200
                        dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
        >
          {info}
        </div>
      )}

      {loading && (
        <div className="p-6 text-gray-600 dark:text-gray-300">
          Generating preview…
        </div>
      )}

      {/* نمایش HTML */}
      {!loading && htmlDoc && (
        <iframe
          title="resume-preview-html"
          srcDoc={htmlDoc}
          className="w-full h-[80vh] rounded border
                     bg-white border-gray-200
                     dark:bg-gray-900 dark:border-gray-700"
        />
      )}

      {/* نمایش PDF (اگر سرور PDF برگرداند) */}
      {!loading && !htmlDoc && blobUrl && mime === "application/pdf" && (
        <iframe
          title="resume-preview-pdf"
          src={blobUrl}
          className="w-full h-[80vh] rounded border
                     bg-white border-gray-200
                     dark:bg-gray-900 dark:border-gray-700"
        />
      )}
    </div>
  );
}
