// src/components/professors/MyProfessors.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Heart,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import NavigationButtons from "@/components/layout/NavigationButtons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ProfessorRow = {
  ID: number;
  name: string;
  title?: string;
  email?: string;
  image?: string | null;
  school_name?: string;
  university?: string;
  research_area?: string; // serialized یا csv
  programs?: { id?: string | number; name: string; level?: string | null }[];
  program_name?: string; // fallback: رشته‌ها در یک فیلد
  responseStatus?: "responded" | "pending" | "declined";
  lastContacted?: string | null;

  response?: string; // متن پاسخ/یادداشت شما
  status?: string; // New | Considered | Contacted | Responded | Declined
};

const STATUS_OPTIONS = [
  {
    value: "Considered",
    label: "Considered",
    pillClass: "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white",
  },
  { value: "Sent", label: "Sent", pillClass: "bg-indigo-500 text-white" },
  {
    value: "No Response",
    label: "No Response",
    pillClass: "bg-red-500 text-white",
  },
  {
    value: "Encourage to Apply",
    label: "Encourage to Apply",
    pillClass: "bg-slate-600 text-white",
  },
  {
    value: "Interview",
    label: "Interview",
    pillClass: "bg-sky-500 text-white",
  },
  {
    value: "Apply to Program",
    label: "Apply to Program",
    pillClass: "bg-green-500 text-white",
  },
] as const;

type StatusVal = (typeof STATUS_OPTIONS)[number]["value"];

export default function MyProfessors() {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = useMemo(() => localStorage.getItem("token") || "", []);
  useEffect(() => {
    if (!token) navigate("/auth?mode=login");
  }, [token, navigate]);

  // data/paging state
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ProfessorRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // UI state
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const getResponseBadge = (status?: string) => {
    switch (status) {
      case "responded":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Responded
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="h-3 w-3 mr-1" /> Declined
          </Badge>
        );
      default:
        return null;
    }
  };

  const fetchByIds = useCallback(
    async (ids: number[], pageNum: number) => {
      if (!ids.length) {
        setRows([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      const start = (pageNum - 1) * limit;
      const pagedIds = ids.slice(start, start + limit);
      const params = new URLSearchParams({
        ids: pagedIds.join(","),
        light: pageNum > 1 ? "1" : "0",
      });
      const res = await fetch(`${API_URL}/professor-data/by-ids?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("by-ids failed");
      const data = await res.json();
      setRows(Array.isArray(data.professors) ? data.professors : []);
      setTotalPages(Math.max(1, Math.ceil(ids.length / limit)));
    },
    [limit, token]
  );

  const fetchMyProfessorsDirect = useCallback(
    async (pageNum: number) => {
      // این اندپوینت صفحه‌بندی سرور ندارد؛ اینجا کل را می‌گیریم و در کلاینت صفحه‌بندی می‌کنیم.
      const res = await fetch(`${API_URL}/professor-data/my-professors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404 || res.status === 501) return false;
      if (!res.ok) throw new Error("my-professors failed");
      const data = await res.json();

      const list: ProfessorRow[] = Array.isArray(data.professors)
        ? data.professors.map((p: any) => ({
            // نگاشت مینیمال به فیلدهای فعلی
            ID: p.ID,
            name: p.name,
            title: p.title ?? undefined,
            email: p.email ?? undefined,
            image: p.image ?? null,
            school_name: p.school?.name ?? p.school_name ?? undefined,
            university: p.school?.name ?? undefined,
            // برای سازگاری با رندر فعلی:
            research_area: undefined, // عمداً خالی؛ از research_first3/rest استفاده می‌کنیم
            programs: Array.isArray(p.programs)
              ? p.programs.map((r: any) => ({
                  id: r.id,
                  name: r.name,
                  level: r.level,
                }))
              : [],
            program_name: undefined,
            responseStatus: undefined,
            lastContacted: undefined,
            // جدیدها:
            response: p.response ?? "",
            status: p.status ?? "Considered",
            // مقادیر خام برای research که بعداً ازشون استفاده می‌کنیم
            // (در خود رندر می‌خوانیم)
            // @ts-ignore
            _research_first3: p.research_first3 || [],
            // @ts-ignore
            _research_rest: p.research_rest || [],
          }))
        : [];

      // صفحه‌بندی سمت کلاینت
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / limit));
      const start = (pageNum - 1) * limit;
      const pageSlice = list.slice(start, start + limit);

      setRows(pageSlice);
      setTotalPages(pages);
      return true;
    },
    [limit, token]
  );

  const fetchFavoritesIdsThenDetails = useCallback(
    async (pageNum: number) => {
      const res = await fetch(`${API_URL}/professor-data/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("favorites failed");
      const data = await res.json();
      const ids = (data?.favorites || []).map((s: string | number) =>
        Number(s)
      );
      await fetchByIds(ids, pageNum);
    },
    [token, fetchByIds]
  );

  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const ok = await fetchMyProfessorsDirect(pageNum);
        if (ok === false) {
          // فالبک: با لیست علاقه‌مندی‌ها و سپس by-ids
          await fetchFavoritesIdsThenDetails(pageNum);
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Error",
          description: "Could not load your professors.",
          variant: "destructive",
        });
        setRows([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [fetchMyProfessorsDirect, fetchFavoritesIdsThenDetails, toast]
  );

  useEffect(() => {
    if (token) loadPage(page);
  }, [token, page, loadPage]);

  // ---------- Mutations (Batch Save via /my-professors/save) ----------
  const debouncers = useRef<Record<string, any>>({});
  const pendingSaves = useRef<{
    statuses: Record<string, string>;
    responses: Record<string, string>;
  }>({
    statuses: {},
    responses: {},
  });

  const debounce = (key: string, fn: () => void, delay = 600) => {
    if (debouncers.current[key]) clearTimeout(debouncers.current[key]);
    debouncers.current[key] = setTimeout(fn, delay);
  };

  const flushSaves = async () => {
    const payload = pendingSaves.current;
    // چیزی برای ذخیره نیست
    if (
      Object.keys(payload.statuses).length === 0 &&
      Object.keys(payload.responses).length === 0
    ) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/professor-data/my-professors/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      // بعد از ذخیره موفق، بافر را خالی کن
      pendingSaves.current = { statuses: {}, responses: {} };
    } catch (err) {
      console.error(err);
      toast({
        title: "Save failed",
        description: "Could not save changes.",
        variant: "destructive",
      });
    }
  };

  const queueSave = (patch: {
    statuses?: Record<string, string>;
    responses?: Record<string, string>;
  }) => {
    if (patch.statuses) {
      Object.assign(pendingSaves.current.statuses, patch.statuses);
    }
    if (patch.responses) {
      Object.assign(pendingSaves.current.responses, patch.responses);
    }
    debounce("save_all", flushSaves, 700);
  };

  const onChangeResponse = (id: number, response: string) => {
    setRows((cur) => cur.map((r) => (r.ID === id ? { ...r, response } : r)));
    queueSave({ responses: { [String(id)]: response } });
  };

  const onChangeStatus = (id: number, status: StatusVal) => {
    setRows((cur) => cur.map((r) => (r.ID === id ? { ...r, status } : r)));
    queueSave({ statuses: { [String(id)]: status } });
  };

  // حذف از لیست علاقه‌مندی‌ها همان قبلی

  const removeFromList = async (id: number) => {
    setBusyIds((prev) => new Set(prev).add(id));
    const prev = rows;
    setRows((cur) => cur.filter((r) => r.ID !== id));
    try {
      const res = await fetch(`${API_URL}/professor-data/favorites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ professorId: id, action: "remove" }),
      });
      if (!res.ok) throw new Error("remove failed");
      toast({
        title: "Removed",
        description: "Professor removed from My Professors.",
      });

      // اگر صفحه فعلی خالی شد یک صفحه برگرد
      if (prev.length === 1 && page > 1) setPage((p) => Math.max(1, p - 1));
      else loadPage(page);
    } catch {
      setRows(prev);
      toast({
        title: "Error",
        description: "Could not remove the professor.",
        variant: "destructive",
      });
    } finally {
      setBusyIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const sendReminder = async (id: number) => {
    try {
      await fetch(`${API_URL}/professor-data/reminders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ professorId: id }),
      });
      toast({ title: "Reminder set", description: "We saved your reminder." });
    } catch {
      toast({
        title: "Error",
        description: "Could not save the reminder.",
        variant: "destructive",
      });
    }
  };

  // ---------- Helpers ----------
  const parseResearch = (raw?: string) => {
    if (!raw) return [];
    // سعی برای unserialize-like
    const rx = /s:\d+:"(.*?)";/g;
    const hits: string[] = [];
    let m;
    while ((m = rx.exec(raw)) !== null) hits.push(m[1].trim());
    if (hits.length) return hits;
    // CSV
    return raw
      .split(/[,\n;]/)
      .map((x) => x.trim())
      .filter(Boolean);
  };
  // ---------- Helpers ----------
  const getResearchList = (r: any): string[] => {
    // اگر ساختار جدید باشد (research_first3 / research_rest از بک‌اند جدید)
    // @ts-ignore
    if (Array.isArray(r._research_first3) || Array.isArray(r._research_rest)) {
      // @ts-ignore
      const a = Array.isArray(r._research_first3) ? r._research_first3 : [];
      // @ts-ignore
      const b = Array.isArray(r._research_rest) ? r._research_rest : [];
      return [...a, ...b].filter(Boolean);
    }
    // سازگاری با قدیمی (رشتهٔ serialized/csv)
    return parseResearch(r.research_area);
  };

  const splitPrograms = (row: ProfessorRow) => {
    if (row.programs && row.programs.length)
      return row.programs.map((p) => p.name);
    if (row.program_name) {
      return row.program_name
        .replace(/\r/g, "")
        .split(/\n|;|\|/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const formatDate = (s?: string | null) => {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  // ---------- Render ----------
  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <NavigationButtons isDarkMode={isDarkMode} />

      <div className="space-y-6 mt-4 md:mt-7">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Professors
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage your professor contacts for recommendations.
          </p>
        </motion.div>

        {/* Header row (table-like) */}
        <div className="hidden md:grid grid-cols-12 gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300 px-3 border rounded-md py-2">
          <div className="col-span-2">Professor</div>
          <div className="col-span-2">Research interest</div>
          <div className="col-span-3">Response</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Program</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground px-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your saved professors…
          </div>
        )}

        {/* Empty */}
        {!loading && rows.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No saved professors yet.
          </div>
        )}

        {/* Rows */}
        {!loading && rows.length > 0 && (
          <div className="space-y-4">
            {rows.map((r) => {
              const school = r.school_name || r.university || "";
              const researchAll = getResearchList(r);
              const first = researchAll.slice(0, 3);
              const rest = researchAll.slice(3);

              const programs = splitPrograms(r);
              const busy = busyIds.has(r.ID);

              return (
                <div
                  key={r.ID}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3"
                >
                  {/* Professor */}
                  <div className="md:col-span-2 flex gap-2">
                    <img
                      src={r.image || "/placeholder.svg"}
                      alt={r.name}
                      className="w-16 h-20 rounded-full object-cover border-2 border-purple-100 dark:border-purple-900/40"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {r.name}
                      </div>
                      {school && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {school}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Research interest */}
                  <div className="md:col-span-2">
                    {researchAll.length ? (
                      <ul className="space-y-1">
                        {first.map((it, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {it}
                            </span>
                          </li>
                        ))}
                        {rest.length > 0 && <ShowMore items={rest} />}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Response (note) */}
                  <div className="md:col-span-3">
                    <textarea
                      className="w-full min-h-[86px] resize-vertical rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-2 py-1.5 text-sm"
                      placeholder="Response"
                      value={r.response ?? ""}
                      onChange={(e) => onChangeResponse(r.ID, e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 w-40 p-1">
                    <StatusPicker
                      value={r.status as StatusVal}
                      onChange={(val) => onChangeStatus(r.ID, val)}
                    />
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {getResponseBadge(r.responseStatus)}
                    </div>
                  </div>

                  {/* Program */}
                  <div className="md:col-span-2">
                    {programs.length ? (
                      <div className="space-y-1">
                        {programs.map((p, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-700 dark:text-gray-300 truncate"
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="md:col-span-1 flex md:flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start px-2"
                      onClick={() => {
                        if (r.email) window.location.href = `mailto:${r.email}`;
                        else
                          toast({
                            title: "No email",
                            description: "No email on file.",
                          });
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Create email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start px-2"
                      onClick={() => sendReminder(r.ID)}
                    >
                      <Send className="h-4 w-4 mr-1" /> Remind
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start px-2 text-red-600"
                      onClick={() => removeFromList(r.ID)}
                      disabled={busy}
                      title="Remove from My Professors"
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${
                          busy ? "text-gray-400" : "text-red-500"
                        } fill-red-500`}
                      />
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

/** ShowMore bullet list for research */
function ShowMore({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <li className="mt-1">
      {!open ? (
        <button
          className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
          onClick={() => setOpen(true)}
        >
          + Show More
        </button>
      ) : (
        <ul className="space-y-1 mt-1">
          {items.map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-amber-500 mt-0.5">•</span>
              <span className="text-gray-700 dark:text-gray-300">{it}</span>
            </li>
          ))}
          <button
            className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
            onClick={() => setOpen(false)}
          >
            Show Less
          </button>
        </ul>
      )}
    </li>
  );
}
function StatusPicker({
  value,
  onChange,
}: {
  value: StatusVal | undefined;
  onChange: (val: StatusVal) => void;
}) {
  const current =
    STATUS_OPTIONS.find((s) => s.value === value) ?? STATUS_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-transparent ${current.pillClass}`}
        >
          {current.label}
          <ChevronDown className="h-4 w-4 opacity-80" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-40 ">
        {STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer rounded-full my-1 ${opt.pillClass}`}
          >
            <span className="p-1 w-full">{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
