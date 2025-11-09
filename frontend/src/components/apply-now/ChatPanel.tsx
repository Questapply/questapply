import { Badge } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function ChatPanel() {
  const [messages, setMessages] = useState<
    Array<{ role: "me" | "ai"; text: string }>
  >([
    {
      role: "ai",
      text: "Hi! I can help with deadlines, fees, and required documents for each program.",
    },
  ]);
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const v = value.trim();
    if (!v) return;
    setMessages((m) => [...m, { role: "me", text: v }]);
    setValue("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: `✅ Noted: "${v}". I can draft a checklist or show closest deadlines.`,
        },
      ]);
    }, 500);
  };

  const quick = (label: string) => {
    setMessages((m) => [
      ...m,
      { role: "ai", text: `⏩ ${label} — here’s what I recommend next…` },
    ]);
  };

  return (
    <div
      className="rounded-xl border flex flex-col
               h-screen lg:h-[calc(100vh-220px)]
               bg-slate-100 border-slate-300
               dark:bg-slate-900 dark:border-slate-700"
    >
      {/* header small */}
      <div
        className="p-3 md:p-4 border-b flex items-center justify-between
                 border-slate-300 dark:border-slate-700"
      >
        <Badge
          className="text-[11px]
                   bg-amber-50 text-slate-900 border-amber-200
                   dark:bg-slate-800/60 dark:text-slate-100 dark:border-slate-700"
          variant="outline"
        >
          Apply • Assistant
        </Badge>
        <span className="text-xs text-slate-700 dark:text-slate-400">
          Draft v1 • Helper
        </span>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] md:max-w-[75%] rounded-lg px-3 py-2 text-[13px] md:text-sm border
              ${
                m.role === "me"
                  ? "bg-violet-50 text-violet-900 border-violet-200 dark:bg-violet-900/20 dark:text-violet-100 dark:border-violet-800"
                  : "bg-white text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* quick actions */}
      <div className="px-3 md:px-4 pb-2 space-x-1.5">
        {[
          "Build docs checklist",
          "Show closest deadlines",
          "Estimate fees",
        ].map((q) => (
          <Button
            key={q}
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-[12px]
                       bg-white text-slate-700 border-slate-200 hover:bg-slate-50
                       dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
            onClick={() => quick(q)}
          >
            {q}
          </Button>
        ))}
      </div>

      {/* input */}
      <div
        className="p-3 md:p-4 border-t
                 border-slate-300 dark:border-slate-700"
      >
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder='Ask e.g. "What do I need for Stanford CS?"'
            className="flex-1 h-9 md:h-10 text-[13px] md:text-sm px-3 md:px-3.5
                     bg-white text-slate-900 placeholder-slate-400 border-slate-300
                     focus-visible:ring-0 focus-visible:border-slate-400
                     dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:border-slate-700 dark:focus-visible:border-slate-600"
          />
          <Button
            onClick={send}
            className="h-9 md:h-10 px-3 md:px-4
                     bg-violet-600 text-white hover:bg-violet-700
                     dark:bg-violet-500 dark:hover:bg-violet-600"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ChatPanel;
