// src/components/ChatPanel.tsx
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Send } from "lucide-react";

export default function ChatPanel() {
  const [resumeType, setResumeType] = useState("ATS / Industry");
  const [messages, setMessages] = useState([
    {
      type: "ai",
      content:
        "Welcome! I'm here to help you create an outstanding resume. What would you like to work on first?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMessage = { type: "me", content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setTimeout(() => {
      const aiResponse = {
        type: "ai",
        content: `I'll help you with "${inputValue}". Processing your request...`,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 600);
    setInputValue("");
  };

  const handleQuickAction = (action: string) => {
    const responses: Record<string, string> = {
      "Shorten Summary": "✅ shorten applied on **summary**.",
      "Add metrics to Experience": "✅ metrics added to **experience**.",
      "Tone: Formal": "✅ formal tone applied to document.",
    };
    setMessages((prev) => [
      ...prev,
      { type: "ai", content: responses[action] || `✅ ${action} completed.` },
    ]);
  };

  const handleSaveSnapshot = () => {
    const id = `RES-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const timestamp = new Date().toLocaleString();
    setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        content: `📸 Snapshot saved as **${id}** at ${timestamp}.`,
      },
    ]);
  };

  return (
    <div
      className="
      flex flex-col h-full min-h-0 overflow-hidden rounded-xl border
      bg-white text-slate-900 border-slate-200
      dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
    "
    >
      {/* Header */}
      <div
        className="
        p-4 border-b flex items-center justify-between gap-2 shrink-0
        border-slate-200 dark:border-slate-700
      "
      >
        <Select value={resumeType} onValueChange={setResumeType}>
          <SelectTrigger
            className="
            w-40 h-8 text-xs
            bg-slate-50 border-slate-200 text-slate-700
            dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200
          "
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className="
            bg-white text-slate-900 border-slate-200
            dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700
          "
          >
            <SelectItem value="ATS / Industry">ATS / Industry</SelectItem>
            <SelectItem value="Research / Academic">
              Research / Academic
            </SelectItem>
            <SelectItem value="Concise">Concise</SelectItem>
          </SelectContent>
        </Select>

        <Badge
          variant="outline"
          className="
          text-xs
          border-green-300 text-green-700 bg-green-100/70
          dark:border-green-800 dark:text-green-300 dark:bg-green-900/30
        "
        >
          Draft v1 • Ready
        </Badge>

        <Button
          size="sm"
          onClick={handleSaveSnapshot}
          className="
          text-xs
          bg-purple-600 hover:bg-purple-700 text-white
          dark:bg-purple-500 dark:hover:bg-purple-600
        "
        >
          Save Snapshot
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-[220px] md:min-h-0 md:overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.type === "me" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
              max-w-[80%] p-3 rounded-lg text-sm border
              ${
                m.type === "me"
                  ? "bg-purple-50 border-purple-200 text-slate-800 dark:bg-purple-500/20 dark:border-purple-700 dark:text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              }
            `}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Input */}
      <div
        className="
        p-4 border-t space-y-3 shrink-0
        border-slate-200 dark:border-slate-700
      "
      >
        <div className="flex flex-wrap gap-2">
          {["Shorten Summary", "Add metrics to Experience", "Tone: Formal"].map(
            (a) => (
              <Button
                key={a}
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction(a)}
                className="
                text-xs
                bg-slate-50 border-slate-200 text-slate-600
                hover:bg-slate-100
                dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300
                dark:hover:bg-slate-700/70
              "
              >
                {a}
              </Button>
            )
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type anything… e.g., Improve Education with GPA 3.7"
            className="
            flex-1 text-sm
            bg-slate-50 border-slate-200 placeholder-slate-400
            dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-500
          "
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            className="
            bg-purple-600 hover:bg-purple-700 text-white
            dark:bg-purple-500 dark:hover:bg-purple-600
          "
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
