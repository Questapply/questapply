import { useState } from "react";
import { Button } from "../ui/button";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  isDarkMode?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const ChatComposer = ({
  onSendMessage,
  placeholder = "Ask about schools, programs, or professors...",
  isDarkMode = false,
  isLoading = false,
  disabled = false,
}: ChatComposerProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={`border-t p-4 ${
        isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-teal-500 focus:border-teal-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-teal-500 focus:border-teal-500"
            } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            rows={1}
            style={{
              minHeight: "44px",
              maxHeight: "120px",
              height: "auto",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className={`h-11 w-11 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg transition-all duration-200 ${
              !message.trim() || isLoading || disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-xl hover:scale-105"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </form>

      <div
        className={`text-xs mt-2 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Press{" "}
        <kbd
          className={`px-1 py-0.5 rounded text-xs ${
            isDarkMode
              ? "bg-gray-700 border border-gray-600"
              : "bg-gray-100 border border-gray-300"
          }`}
        >
          Enter
        </kbd>{" "}
        to send,{" "}
        <kbd
          className={`px-1 py-0.5 rounded text-xs ${
            isDarkMode
              ? "bg-gray-700 border border-gray-600"
              : "bg-gray-100 border border-gray-300"
          }`}
        >
          Shift + Enter
        </kbd>{" "}
        for new line
      </div>
    </div>
  );
};

export default ChatComposer;
