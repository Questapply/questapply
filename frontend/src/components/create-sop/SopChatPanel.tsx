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
      className="flex flex-col h-full min-h-0 overflow-hidden rounded-xl border"
      style={{ background: "#111827", borderColor: "#25324a" }}
    >
      {/* header */}
      <div
        className="p-4 border-b flex items-center justify-between gap-2"
        style={{ borderColor: "#25324a" }}
      >
        <Badge
          variant="outline"
          className="text-xs"
          style={{
            background: "#0b213a",
            borderColor: "#25324a",
            color: "#22c55e",
          }}
        >
          Draft v1 • Skeleton
        </Badge>
        <Button
          size="sm"
          className="text-xs"
          style={{ background: "#7c3aed", color: "white" }}
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
              className="max-w-[80%] p-3 rounded-lg text-sm border"
              style={{
                background: msg.type === "me" ? "#7c3aed20" : "#0e1526",
                borderColor: "#25324a",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      <div className="p-4 border-t" style={{ borderColor: "#25324a" }}>
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type anything… e.g., Shorten publications"
            className="text-sm"
            style={{ background: "#0e1526", borderColor: "#25324a" }}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
          />
          <Button
            size="sm"
            onClick={sendChat}
            style={{ background: "#7c3aed", color: "white" }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
