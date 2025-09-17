// chat/ChatHistory.tsx
import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

export type QuickReply = { label: string; text?: string };

export type ChatMessage = {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date | string;
  resultType?: "cards" | "text";
  resultData?: any;
  resultCount?: number;
  resultDescription?: string;
  suggestions?: QuickReply[]; // 👈 جدید
};

export type ChatHistoryProps = {
  messages: ChatMessage[];
  onResultClick?: (data: any, resultType?: string) => void;
  onQuickReply?: (text: string, originId?: string) => void; // 👈 جدید
  isDarkMode?: boolean;
  showTyping?: boolean;
  loadingSession?: boolean; // 👈 جدید
  welcomeMessage?: string;
};

const ChatHistory = ({
  messages,
  onResultClick,
  onQuickReply,
  isDarkMode = false,
  showTyping = false,
  loadingSession = false,
  welcomeMessage,
}: ChatHistoryProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // فقط viewport داخلی ScrollArea را اسکرول بده (نه کل صفحه)
  useEffect(() => {
    const vp = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (vp) vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, showTyping]);

  const formatTime = (ts: Date | string) => {
    const d = typeof ts === "string" ? new Date(ts) : ts;
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === "user";
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
          <div
            className={`rounded-2xl px-4 py-3 ${
              isUser
                ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-100 border border-gray-600"
                : "bg-gray-100 text-gray-900 border border-gray-200"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* کپسول کارت‌ها (اختیاری) */}
            {!isUser &&
              message.resultType === "cards" &&
              message.resultData && (
                <Button
                  variant="outline"
                  size="sm"
                  className={`mt-3 w-full justify-start ${
                    isDarkMode
                      ? "border-gray-500 bg-gray-800 hover:bg-gray-700 text-gray-200"
                      : "border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() =>
                    onResultClick?.(message.resultData, message.resultType)
                  }
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isDarkMode ? "bg-teal-400" : "bg-teal-500"
                      }`}
                    />
                    <span className="font-medium">
                      {message.resultCount} {message.resultDescription}
                    </span>
                  </div>
                </Button>
              )}

            {/* دکمه‌های پیشنهاد (Quick Replies) */}
            {!isUser &&
              Array.isArray(message.suggestions) &&
              message.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.suggestions.map((sug, idx) => (
                    <Button
                      key={`${message.id}-sug-${idx}`}
                      variant="secondary"
                      size="sm"
                      disabled={showTyping}
                      className={`${
                        isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-600"
                          : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                      }`}
                      onClick={() =>
                        onQuickReply?.(sug.text || sug.label, message.id)
                      }
                    >
                      {sug.label}
                    </Button>
                  ))}
                </div>
              )}
          </div>

          <div
            className={`text-xs mt-1 ${isUser ? "text-right" : "text-left"} ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-4">
        <AnimatePresence mode="popLayout">
          {loadingSession ? (
            <div className="space-y-3">
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-8 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <div className="mb-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  💬
                </div>
              </div>
              <p className="text-sm">
                {welcomeMessage ||
                  "Start a conversation to find what you're looking for"}
              </p>
            </motion.div>
          ) : (
            messages.map(renderMessage)
          )}

          {/* تایپینگ */}
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start mb-4"
            >
              <div className="max-w-[85%] order-1">
                <div
                  className={`rounded-2xl px-4 py-3 inline-flex items-center gap-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 border border-gray-600"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  <span className="font-medium text-xs opacity-70">AI</span>
                  <TypingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default ChatHistory;

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
    </div>
  );
}
