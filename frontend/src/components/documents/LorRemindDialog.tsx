import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { authHeaders, LOR_BASE } from "@/api/lorApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number | string | null;
  teacherEmail: string | null;
  recommenderName?: string | null;
  onSent?: () => void; // برای رفرش لیست
};

export default function LorRemindDialog({
  open,
  onOpenChange,
  requestId,
  teacherEmail,
  recommenderName,
  onSent,
}: Props) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(
    "Dear Recommender,\n\nJust a friendly reminder about my recommendation letter. Please let me know if you need anything from me. Thank you!"
  );

  useEffect(() => {
    if (!open) return;
    // می‌توان موضوع یا متن را شخصی‌سازی کرد
    if (recommenderName && message.includes("Recommender")) {
      setMessage((m) => m.replace("Recommender", recommenderName));
    }
  }, [open, recommenderName]);

  async function handleSend() {
    if (!requestId || !teacherEmail) {
      toast({
        title: "Missing data",
        description: "Request id or email is missing.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSending(true);
      const res = await fetch(`${LOR_BASE}/recommender/remind`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          id: requestId,
          email: teacherEmail,
          value: message,
        }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || "Failed to send reminder");
      toast({
        title: "Reminder sent",
        description: "Email reminder has been sent.",
      });
      onSent?.();
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Send failed",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Reminder</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">To</label>
            <Input value={teacherEmail || ""} disabled />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Message</label>
            <Textarea
              className="min-h-36"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !teacherEmail || !requestId}
          >
            {sending ? "Sending…" : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
