// pages/HelpCenter/SupportTicket.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

/* ---------- Types ---------- */
type TicketStatus = "open" | "answered" | "closed";
type TicketPriority = "low" | "medium" | "high";

type Ticket = {
  id: number;
  title: string;
  department: string;
  status: TicketStatus;
  priority: TicketPriority;
  updatedAt: string; // DB datetime string
};

type TicketMessage = {
  sender: "Admin" | "User";
  content: string;
  date: string; // "YYYY-MM-DD HH:mm:ss"
};

type TicketAttachment = {
  filename: string;
  storedAs: string; // relative saved path
  mimetype: string;
  size: number;
};

type TicketDetails = Ticket & {
  content: string; // main post content
  createdAt: string;
  authorDisplayName: string;
  messages: TicketMessage[];
  attachments?: TicketAttachment[];
};

/* ---------- UI helpers ---------- */
function StatusBadge({ status }: { status: TicketStatus }) {
  const map = {
    open: { text: "Pending", bg: "bg-orange-500", fg: "text-white" },
    answered: { text: "Answered", bg: "bg-green-600", fg: "text-white" },
    closed: { text: "Closed", bg: "bg-gray-500", fg: "text-white" },
  } as const;
  const s = map[status];
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${s.bg} ${s.fg}`}>
      {s.text}
    </span>
  );
}

function PriorityTag({ priority }: { priority: TicketPriority }) {
  const map = {
    low: { class: "text-gray-400", text: "Low" },
    medium: { class: "text-purple-600", text: "Medium" },
    high: { class: "text-red-600", text: "High" },
  } as const;
  const p = map[priority];
  return <span className={`text-xs font-medium ${p.class}`}>{p.text}</span>;
}

function formatDateShort(d: string) {
  const dt = new Date(d);
  return isNaN(dt.getTime())
    ? d
    : dt.toLocaleString(undefined, { month: "short", day: "2-digit" });
}

/* ---------- Component ---------- */
export default function HelpCenterTicket() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<TicketDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // New ticket form
  const [lang, setLang] = useState<"fa" | "en">("fa");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("low");
  const [department, setDepartment] = useState("Account Issues");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reply
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  /* 401 helper */
  const handleMaybe401 = useCallback(
    (res: Response) => {
      if (res.status === 401) {
        navigate("/auth?mode=login");
        return true;
      }
      return false;
    },
    [navigate]
  );

  /* Fetch list */
  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (handleMaybe401(res)) return;
      if (!res.ok) throw new Error("Failed to load tickets");
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch (e: any) {
      setError(e.message || "Error loading tickets");
    } finally {
      setLoadingList(false);
    }
  }, [token, handleMaybe401]);

  /* Fetch details */
  const fetchDetails = useCallback(
    async (id: number) => {
      if (!token) return;
      setLoadingDetails(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (handleMaybe401(res)) return;
        if (!res.ok) throw new Error("Failed to load ticket");
        const data: TicketDetails = await res.json();
        setDetails(data);
      } catch (e: any) {
        setError(e.message || "Error loading ticket");
      } finally {
        setLoadingDetails(false);
      }
    },
    [token, handleMaybe401]
  );

  /* Initial auth guard + list load */
  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }
    fetchTickets();
  }, [token, navigate, fetchTickets]);

  /* Load details on selection */
  useEffect(() => {
    if (selectedId) {
      fetchDetails(selectedId);
    } else {
      setDetails(null);
    }
  }, [selectedId, fetchDetails]);

  /* Right header */
  const rightHeader = useMemo(() => {
    if (selectedId && details) return details.title;
    return "New Ticket";
  }, [selectedId, details]);

  /* Create ticket */
  async function handleSubmitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("language", lang);
      form.append("title", title.trim());
      form.append("priority", priority);
      form.append("department", department);
      form.append("description", description.trim());
      if (files && files.length) {
        Array.from(files).forEach((f) => form.append("attachments", f, f.name));
      }

      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form, // مهم: Content-Type را خود مرورگر ست می‌کند
      });
      if (handleMaybe401(res)) return;
      if (!res.ok) throw new Error("Failed to submit ticket");

      const created: Ticket = await res.json();

      // لیست را تازه کن تا updatedAt درست شود
      await fetchTickets();

      // انتخاب و لود جزئیات
      setSelectedId(created.id);
      await fetchDetails(created.id);

      // reset form
      setLang("fa");
      setTitle("");
      setPriority("low");
      setDepartment("Account Issues");
      setDescription("");
      setFiles(null);
    } catch (e: any) {
      setError(e.message || "Error submitting ticket");
    } finally {
      setSubmitting(false);
    }
  }

  /* Send reply */
  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }
    if (!selectedId || !reply.trim()) return;

    setReplying(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/tickets/${selectedId}/replies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: reply.trim() }),
      });
      if (handleMaybe401(res)) return;
      if (!res.ok) throw new Error("Failed to send reply");

      setReply("");

      // جزئیات و لیست را تازه کنیم (status=open و زمان آپدیت)
      await Promise.all([fetchDetails(selectedId), fetchTickets()]);
    } catch (e: any) {
      setError(e.message || "Error sending reply");
    } finally {
      setReplying(false);
    }
  }
  const goToNewTicket = () => {
    setSelectedId(null);
    setDetails(null);
    setReply("");
  };
  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Support Ticket
      </h2>

      {error && (
        <div className="mb-4 text-sm rounded border border-red-300 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tickets list */}
        <aside className="lg:col-span-1">
          <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="px-4 py-3 border-b dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Tickets
              </h3>
            </div>

            <div className="p-2 max-h-[70vh] overflow-auto">
              {loadingList && tickets.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading…
                </div>
              ) : tickets.length ? (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`group w-full text-left rounded-lg px-3 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedId === t.id ? "bg-gray-50 dark:bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <svg
                          width="22"
                          height="22"
                          viewBox="-0.5 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6.723 5.48a5.251 5.251 0 1 1 8.265 4.802"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.44 3.353a8.7 8.7 0 0 0 6.26 2.65 8.7 8.7 0 0 0 3.347-.666m-6.224 4.416a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-6-2.578v1.078a3 3 0 0 0 3 3h1.423m12.454 12a9.74 9.74 0 0 0-5.23-8.634M2.2 23.253a9.74 9.74 0 0 1 5.225-8.632"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-100 truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateShort(t.updatedAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={t.status} />
                        <PriorityTag priority={t.priority} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                  You have not sent a ticket yet.
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right: new ticket or details */}
        <section className="lg:col-span-2">
          <div className="rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
            <div className="px-4 py-3 border-b dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                {rightHeader}
              </h3>

              {selectedId && details && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Status:
                    </span>
                    <StatusBadge status={details.status} />
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Priority:
                    </span>
                    <PriorityTag priority={details.priority} />
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                    Updated: {new Date(details.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={goToNewTicket}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:border-purple-400"
                  >
                    + New Ticket
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              {selectedId && details ? (
                loadingDetails ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Loading…
                  </div>
                ) : (
                  /* DETAILS VIEW */
                  <div className="space-y-6">
                    {/* Main message (user) */}
                    <div className="flex flex-col items-end">
                      <div className="w-full md:w-11/12 lg:w-10/12">
                        <div
                          className="flex items-center justify-between"
                          style={{ direction: "rtl" }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200">
                              {details.authorDisplayName?.[0]?.toUpperCase() ||
                                "U"}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">
                              {details.authorDisplayName}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(details.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="mt-2 rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {details.content}
                        </div>

                        {/* Attachments (if any) */}
                        {details.attachments &&
                          details.attachments.length > 0 && (
                            <div className="mt-3 text-sm">
                              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Attachments
                              </div>
                              <ul className="list-disc ml-5 space-y-1">
                                {details.attachments.map((f, i) => (
                                  <li
                                    key={i}
                                    className="text-gray-700 dark:text-gray-300 break-all"
                                  >
                                    <a
                                      href={`/${f.storedAs}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline"
                                    >
                                      {f.filename}
                                    </a>{" "}
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({f.mimetype}, {Math.round(f.size / 1024)}{" "}
                                      KB)
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Chat history */}
                    <div className="space-y-4">
                      {details.messages.map((m, idx) => {
                        const isAdmin = m.sender === "Admin";
                        const bubble =
                          "rounded-lg px-4 py-3 " +
                          (isAdmin
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200");
                        return (
                          <div
                            key={idx}
                            className={`flex ${
                              isAdmin ? "justify-start" : "justify-end"
                            }`}
                          >
                            <div className="w-full md:w-11/12 lg:w-10/12">
                              <div
                                className={`flex items-center justify-between ${
                                  isAdmin ? "flex-row" : "flex-row-reverse"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isAdmin ? (
                                    <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="-0.5 0 25 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M6.723 5.48a5.251 5.251 0 1 1 8.265 4.802"
                                          stroke="#ffffff"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        <path
                                          d="M7.44 3.353a8.7 8.7 0 0 0 6.26 2.65 8.7 8.7 0 0 0 3.347-.666m-6.224 4.416a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-6-2.578v1.078a3 3 0 0 0 3 3h1.423m12.454 12a9.74 9.74 0 0 0-5.23-8.634M2.2 23.253a9.74 9.74 0 0 1 5.225-8.632"
                                          stroke="#ffffff"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200">
                                      U
                                    </div>
                                  )}
                                  <span className="text-sm text-gray-700 dark:text-gray-200">
                                    {isAdmin
                                      ? "Customer Support"
                                      : details.authorDisplayName}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(
                                    m.date.replace(" ", "T")
                                  ).toLocaleString()}
                                </div>
                              </div>

                              <div className={`mt-2 ${bubble}`}>
                                {m.content}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply form */}
                    <form onSubmit={handleReply} className="mt-4 flex gap-2">
                      <input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Your reply"
                        className="flex-1 px-3 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        required
                      />
                      <Button disabled={replying}>
                        {replying ? "Sending…" : "Submit"}
                      </Button>
                    </form>
                  </div>
                )
              ) : (
                /* NEW TICKET FORM */
                <form onSubmit={handleSubmitNew} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Language
                      </label>
                      <select
                        className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                        value={lang}
                        onChange={(e) => setLang(e.target.value as "fa" | "en")}
                      >
                        <option value="fa">Persian - فارسی</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Priority
                      </label>
                      <select
                        className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as TicketPriority)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Department
                    </label>
                    <select
                      className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option>Account Issues</option>
                      <option>Billing</option>
                      <option>Technical Issue</option>
                      <option>Application</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100"
                      placeholder="Ticket subject"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-100 resize-y"
                      placeholder="Describe your issue…"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Attachments (optional)
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 text-sm cursor-pointer bg-white dark:bg-gray-900 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-300">
                        Drag & drop or{" "}
                        <span className="text-purple-600">browse</span>
                      </span>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => setFiles(e.target.files)}
                      />
                      {files && files.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {Array.from(files)
                            .map((f) => f.name)
                            .join(", ")}
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Ticket"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(null);
                        setDetails(null);
                      }}
                      className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
