import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MailOpen, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";

type ApiItem = {
  id: number;
  user_id: number;
  subject: string;
  kind: "important" | "info" | "warning" | "success";
  final_status: "unread" | "read" | string;
  date: string;
};
type ApiListResponse = {
  page: number;
  limit: number;
  total: number;
  items: ApiItem[];
};

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const headers = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token || ""}`,
    "Content-Type": "application/json",
  };
};

export default function NotificationsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const res = await fetch(`${API_URL}/notifications?${qs.toString()}`, {
        headers: headers(),
        credentials: "include",
      });
      if (res.status === 401) return navigate("/auth/login");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiListResponse = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
        My Notifications
      </h1>

      {err && (
        <div className="mb-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {err}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left font-semibold">ID</th>
                <th className="py-3 px-3 text-left font-semibold">Subject</th>
                <th className="py-3 px-3 text-left font-semibold">Status</th>
                <th className="py-3 px-3 text-left font-semibold">Kind</th>
                <th className="py-3 px-3 text-left font-semibold">Date</th>
                <th className="py-3 pr-6 pl-3 text-left font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading && items.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="animate-pulse">
                      <td className="py-4 pl-6 pr-3">
                        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="h-4 w-44 bg-gray-200 dark:bg-gray-800 rounded" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                      </td>
                      <td className="py-4 px-3">
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
                      </td>
                      <td className="py-4 pr-6 pl-3">
                        <div className="h-8 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                      </td>
                    </tr>
                  ))
                : items.map((n) => {
                    const unread = n.final_status === "unread";
                    return (
                      <tr
                        key={n.id}
                        className={`${
                          unread
                            ? "bg-blue-50/40 dark:bg-blue-900/10"
                            : "bg-white dark:bg-gray-900"
                        } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                      >
                        <td className="py-4 pl-6 pr-3 text-gray-900 dark:text-gray-100">
                          {n.id}
                        </td>
                        <td className="py-4 px-3 text-gray-800 dark:text-gray-200">
                          {n.subject}
                        </td>
                        <td className="py-4 px-3">
                          <span className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            {unread ? (
                              <>
                                <Mail className="w-5 h-5" />
                                <CircleDot className="w-3.5 h-3.5 text-amber-500" />
                              </>
                            ) : (
                              <MailOpen className="w-5 h-5 text-gray-500" />
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-3 capitalize text-gray-700 dark:text-gray-300">
                          {n.kind}
                        </td>
                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">
                          {n.date}
                        </td>
                        <td className="py-3 pr-6 pl-3">
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={() =>
                              navigate(`/dashboard/notifications/${n.id}`)
                            }
                          >
                            View Notification
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
              You’re up to date
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= Math.max(1, Math.ceil(total / limit))}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && items.length === 0
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sk-m-${i}`}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse"
              >
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            ))
          : items.map((n) => {
              const unread = n.final_status === "unread";
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border border-gray-200 dark:border-gray-800 ${
                    unread
                      ? "bg-blue-50/50 dark:bg-blue-900/10"
                      : "bg-white dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      #{n.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {unread ? (
                        <>
                          <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          <CircleDot className="w-3.5 h-3.5 text-amber-500" />
                        </>
                      ) : (
                        <MailOpen className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {n.subject}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{n.kind}</span> • {n.date}
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      className="h-9 rounded-lg px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white w-full"
                      onClick={() =>
                        navigate(`/dashboard/notifications/${n.id}`)
                      }
                    >
                      View Notification
                    </Button>
                  </div>
                </div>
              );
            })}

        {!loading && items.length === 0 && (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            You’re up to date
          </div>
        )}

        {/* Pagination (mobile) */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= Math.max(1, Math.ceil(total / limit))}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
