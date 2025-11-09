// src/components/sop/SopChatPanel.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function SopChatPanel() {
  const [messages, setMessages] = useState<
    { type: "ai" | "me"; content: string }[]
  >([
    {
      type: "ai",
      content:
        "Welcome! I can help you refine each section, adjust tone, and prepare a strong SOP.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [...m, { type: "me", content: chatInput }]);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { type: "ai", content: "Noted. (AI actions are disabled for now)" },
      ]);
    }, 300);
    setChatInput("");
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 overflow-hidden rounded-xl border
               bg-white border-slate-200
               dark:bg-slate-900 dark:border-slate-700"
    >
      {/* header */}
      <div
        className="p-4 border-b flex items-center justify-between gap-2
                 border-slate-200 dark:border-slate-700"
      >
        <Badge
          variant="outline"
          className="text-xs
                   bg-emerald-50 border-emerald-200 text-emerald-700
                   dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
        >
          Draft v1 • Skeleton
        </Badge>
        <Button
          size="sm"
          className="text-xs
                   bg-violet-600 text-white hover:bg-violet-700
                   dark:bg-violet-500 dark:hover:bg-violet-600"
          onClick={() =>
            setMessages((m) => [
              ...m,
              {
                type: "ai",
                content: `📸 Snapshot saved at ${new Date().toLocaleString()}`,
              },
            ])
          }
        >
          Save Snapshot
        </Button>
      </div>

      {/* messages */}
      <div className="flex-1 min-h-[220px] md:min-h-0 md:overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.type === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm border
              ${
                msg.type === "me"
                  ? "bg-violet-50 text-violet-900 border-violet-200 dark:bg-violet-900/20 dark:text-violet-100 dark:border-violet-800"
                  : "bg-white text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type anything… e.g., Shorten publications"
            className="text-sm
                     bg-white border-slate-200 text-slate-900 placeholder-slate-400
                     dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
          <Button
            size="sm"
            onClick={sendChat}
            className="bg-violet-600 text-white hover:bg-violet-700
                     dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
