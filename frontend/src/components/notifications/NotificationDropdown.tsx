import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

/** -------- Types from backend -------- */
type ApiNotif = {
  id: number;
  user_id: number;
  subject: string;
  content: string;
  kind: "important" | "info" | "warning" | "success";
  final_status: "unread" | "read" | string;
  date: string;
};
type ApiUnreadResponse = {
  total_unread_count: number;
  notifications: ApiNotif[];
};
type ApiListResponse = {
  page: number;
  limit: number;
  total: number;
  items: ApiNotif[];
};

/** -------- UI types -------- */
type UiType = "message" | "update" | "alert" | "success";
type UiNotif = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: UiType;
};

/** -------- Config & Helpers -------- */
const API_URL =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/+$/, "") || ""; // e.g. http://localhost:5000/api

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token || ""}`,
    "Content-Type": "application/json",
  };
};

function mapKindToUiType(kind: ApiNotif["kind"]): UiType {
  switch (kind) {
    case "important":
    case "warning":
      return "alert";
    case "info":
      return "update";
    case "success":
      return "success";
    default:
      return "update";
  }
}
function formatRelative(t: string) {
  try {
    const d = new Date(t.replace(" ", "T"));
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
    const day = Math.floor(hr / 24);
    return `${day} day${day > 1 ? "s" : ""} ago`;
  } catch {
    return t;
  }
}
function mapApiToUi(n: ApiNotif): UiNotif {
  return {
    id: n.id,
    title: n.subject,
    message: n.content,
    time: formatRelative(n.date),
    read: n.final_status !== "unread",
    type: mapKindToUiType(n.kind),
  };
}

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UiNotif[]>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const unreadCount = useMemo(() => totalUnread ?? 0, [totalUnread]);

  function ensureTokenOrRedirect(): string | null {
    const token = localStorage.getItem("token");
    if (!token) {
      // اگر لاگین لازم داری، مسیر لاگین خودت رو بگذار
      navigate("/auth/login");
      return null;
    }
    return token;
  }

  async function fetchUnread(limit = 5) {
    const token = ensureTokenOrRedirect();
    if (!token) return;

    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams({ limit: String(limit) });
      const res = await fetch(
        `${API_URL}/notifications/unread?${qs.toString()}`,
        {
          method: "GET",
          headers: authHeaders(),
          credentials: "include",
        }
      );
      if (res.status === 401) {
        navigate("/auth/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiUnreadResponse = await res.json();

      setTotalUnread(data.total_unread_count || 0);
      const mapped = (data.notifications || []).map(mapApiToUi);
      setItems(mapped);

      // اگر هیچ unread نبود، ۵ مورد آخر کل نوتیف‌ها را بیاور
      if (mapped.length === 0) await fetchRecent(5);
    } catch (e) {
      console.error("[unread] error", e);
      setErr("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecent(limit = 5) {
    const token = ensureTokenOrRedirect();
    if (!token) return;

    try {
      const qs = new URLSearchParams({ limit: String(limit), page: "1" });
      const res = await fetch(`${API_URL}/notifications?${qs.toString()}`, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/auth/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiListResponse = await res.json();
      setItems((data.items || []).map(mapApiToUi));
    } catch (e) {
      console.error("[recent] error", e);
    }
  }

  async function markAllAsRead() {
    const token = ensureTokenOrRedirect();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.status === 401) {
        navigate("/auth/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // optimistic
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setTotalUnread(0);
    } catch (e) {
      console.error("[mark-all-read] error", e);
    }
  }

  useEffect(() => {
    if (open && items.length === 0 && !loading) {
      fetchUnread(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const getNotificationIcon = (type: UiType) => {
    switch (type) {
      case "message":
        return <div className="h-2 w-2 rounded-full bg-blue-500" />;
      case "update":
        return <div className="h-2 w-2 rounded-full bg-purple-500" />;
      case "alert":
        return <div className="h-2 w-2 rounded-full bg-amber-500" />;
      case "success":
        return <div className="h-2 w-2 rounded-full bg-green-500" />;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500" />;
    }
  };

  const onItemClick = (id: number) => {
    setOpen(false);
    navigate(`/dashboard/notifications/${id}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-teal-500 text-xs font-medium text-white"
            >
              {unreadCount}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
        align="end"
        side="bottom"
      >
        <AnimatePresence>
          <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-900/20 dark:to-blue-900/20 p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              <span className="text-xs font-medium text-teal-500 dark:text-teal-400">
                {loading ? "..." : `${unreadCount} new`}
              </span>
            </div>
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>

          <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
            {loading && items.length === 0 ? (
              <div className="p-4 text-xs text-gray-500">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-xs text-gray-500">You’re up to date</div>
            ) : (
              items.slice(0, 5).map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 border-b border-gray-100 dark:border-gray-800 ${
                    !notification.read
                      ? "bg-blue-50/50 dark:bg-blue-900/10"
                      : ""
                  } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}
                  onClick={() => onItemClick(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/notifications");
              }}
            >
              View all
            </Button>
          </div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
