import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bot, UserCog, CalendarClock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApiNotif = {
  id: number;
  user_id: number; // 0 = Automatic
  subject: string;
  content: string; // ممکنه HTML داشته باشه؛ ما به متنِ ساده تبدیلش می‌کنیم
  kind: "important" | "info" | "warning" | "success";
  final_status: "unread" | "read" | string;
  date: string;
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const headers = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token || ""}`,
    "Content-Type": "application/json",
  };
};

// تبدیل HTML به متن ساده (بدون لینک)
function htmlToPlainText(html: string): string {
  try {
    const div = document.createElement("div");
    div.innerHTML = html ?? "";
    return (div.textContent || div.innerText || "").trim();
  } catch {
    return html || "";
  }
}

// رنگ پس‌زمینه بر اساس kind
function kindBg(kind: ApiNotif["kind"]) {
  switch (kind) {
    case "important":
      return "bg-rose-100/70 dark:bg-rose-900/20";
    case "warning":
      return "bg-amber-100/70 dark:bg-amber-900/20";
    case "success":
      return "bg-emerald-100/70 dark:bg-emerald-900/20";
    case "info":
    default:
      return "bg-violet-100/70 dark:bg-violet-900/20";
  }
}
// معادل سادهٔ stripslashes در PHP
function phpStripSlashes(input: string): string {
  if (!input) return "";
  return input
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

// HTML امن + بازنویسی لینک‌ها (اختیاری)
function sanitizeAndRewriteHTML(raw: string): string {
  const txt = phpStripSlashes(raw);
  // اگر اصلا HTML ندارد، همینی که هست را برگردان
  if (!/[<>]/.test(txt)) return txt;

  const parser = new DOMParser();
  const doc = parser.parseFromString(txt, "text/html");

  // فقط تگ‌های مجاز را نگه داریم: a, b, strong, i, em, u, br, span
  const allowed = new Set(["A", "B", "STRONG", "I", "EM", "U", "BR", "SPAN"]);
  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const c of children) {
      if (c.nodeType === Node.ELEMENT_NODE) {
        const el = c as HTMLElement;
        if (!allowed.has(el.tagName)) {
          // تگ‌های غیرمجاز را به متن تبدیل کن
          const textNode = document.createTextNode(el.textContent || "");
          el.replaceWith(textNode);
          continue;
        }
        // لینک‌ها را بازنویسی/بی‌اثر کن تا به نسخهٔ PHP نروند
        if (el.tagName === "A") {
          const a = el as HTMLAnchorElement;
          // اگر خواستی به روت SPA خودت هدایت کند تغییر بده:
          // مثلا if (a.href.includes("questapply.com")) a.setAttribute("href", "/documents");
          // یا کلاً بی‌اثر کن:
          a.removeAttribute("href");
          a.classList.add("font-semibold", "text-violet-600");
        }
        walk(el);
      }
    }
  };
  walk(doc.body);

  return doc.body.innerHTML;
}

export default function NotificationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [n, setN] = useState<ApiNotif | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const creatorLabel = useMemo(
    () => (n?.user_id === 0 ? "Automatic" : "Admin/User"),
    [n?.user_id]
  );

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        headers: headers(),
        credentials: "include",
      });
      if (res.status === 401) return navigate("/auth/login");
      if (res.status === 404) return navigate("/notifications");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiNotif = await res.json();
      setN(data);
    } catch (e) {
      setErr("Failed to load notification");
    } finally {
      setLoading(false);
    }
  }

  // به‌محض ورود، خوانده‌شدن را ثبت کن (بدون قطع نمایش)
  async function markRead() {
    try {
      await fetch(`${API_URL}/notifications/${id}/mark-read`, {
        method: "POST",
        headers: headers(),
        credentials: "include",
      });
    } catch {}
  }

  useEffect(() => {
    load();
    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !n) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  }
  if (err && !n) {
    return (
      <div className="p-4 md:p-6 max-w-5xl mx-auto text-sm text-red-500">
        {err}
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/notifications")}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }
  if (!n) return null;

  const contentPlain = htmlToPlainText(n.content);
  const contentHTML = sanitizeAndRewriteHTML(n.content);
  const isHTML = /[<>]/.test(contentHTML);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* عنوان */}
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
        {n.subject}
      </h1>

      {/* کارت‌های خلاصه (ریسپانسیو) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className={`rounded-xl ${kindBg(n.kind)} p-4 shadow-sm`}>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Kind :
          </div>
          <div className="font-semibold capitalize text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Info className="w-4 h-4 opacity-70" /> {n.kind}
          </div>
        </div>

        <div className="rounded-xl bg-violet-100/70 dark:bg-violet-900/20 p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Status :
          </div>
          <div className="font-semibold capitalize text-gray-900 dark:text-gray-100">
            {n.final_status}
          </div>
        </div>

        <div className="rounded-xl bg-violet-100/70 dark:bg-violet-900/20 p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Date :
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 opacity-70" /> {n.date}
          </div>
        </div>

        <div className="rounded-xl bg-violet-100/70 dark:bg-violet-900/20 p-4 shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Creator :
          </div>
          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {n.user_id === 0 ? (
              <Bot className="w-4 h-4 opacity-70" />
            ) : (
              <UserCog className="w-4 h-4 opacity-70" />
            )}
            {creatorLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
        Content :
      </div>
      <div className="rounded-xl p-4 shadow-sm bg-violet-100/70 dark:bg-violet-900/20 text-gray-900 dark:text-gray-100">
        {isHTML ? (
          // اگر HTML دارد، امن رندر می‌کنیم (بعد از sanitize)
          <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
        ) : (
          // اگر HTML نبود، متن سادهٔ بدون بک‌اسلش
          <pre className="whitespace-pre-wrap font-sans">
            {phpStripSlashes(n.content) || "-"}
          </pre>
        )}
      </div>

      {/* دکمه برگشت */}
      <div className="mt-6">
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={() => navigate("/dashboard/notifications")}
        >
          Back to My Notifications
        </Button>
      </div>
    </div>
  );
}
