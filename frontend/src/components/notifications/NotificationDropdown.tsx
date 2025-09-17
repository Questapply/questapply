import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "message" | "update" | "alert" | "success";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Application Update",
    message: "Your application to MIT has been updated",
    time: "2 min ago",
    read: false,
    type: "update",
  },
  {
    id: "2",
    title: "Professor Response",
    message: "Dr. Smith has replied to your email",
    time: "1 hour ago",
    read: false,
    type: "message",
  },
  {
    id: "3",
    title: "Document Approved",
    message: "Your SOP has been approved by the advisor",
    time: "3 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "4",
    title: "Deadline Reminder",
    message: "Application deadline for Stanford in 3 days",
    time: "5 hours ago",
    read: true,
    type: "alert",
  },
  {
    id: "5",
    title: "New Program Match",
    message: "We found a new program matching your profile",
    time: "1 day ago",
    read: true,
    type: "update",
  },
];

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications"); // Assuming you'll create this route
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "message":
        return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
      case "update":
        return <div className="h-2 w-2 rounded-full bg-purple-500"></div>;
      case "alert":
        return <div className="h-2 w-2 rounded-full bg-amber-500"></div>;
      case "success":
        return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-500"></div>;
    }
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <button
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
      </HoverCardTrigger>
      <HoverCardContent
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
                {unreadCount} new
              </span>
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
            {notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 border-b border-gray-100 dark:border-gray-800 ${
                  !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
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
                    <div className="h-2 w-2 rounded-full bg-teal-500"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 text-xs bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
              onClick={handleViewAll}
            >
              View all
            </Button>
          </div>
        </AnimatePresence>
      </HoverCardContent>
    </HoverCard>
  );
};

export default NotificationDropdown;
