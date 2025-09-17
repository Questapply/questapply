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
import { getResume, saveResume } from "@/api/resumeApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string | null;
  onSaved?: (resumeId: string) => void; // برای رفرش لیست بعد از ذخیره
};

export default function ResumeEditDialog({
  open,
  onOpenChange,
  resumeId,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [templateId, setTemplateId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>("");
  const [sections, setSections] = useState<Record<string, string>>({});
  const [editSectionTitles, setEditSectionTitles] = useState<
    Record<string, string>
  >({});
  // لود رزومه وقتی مودال باز شد و id داریم
  useEffect(() => {
    if (!open || !resumeId) return;
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getResume(resumeId); // { resume_id, template_id, sections, display_name, ... }
        if (canceled) return;

        setTemplateId(data?.template_id ?? null);
        setTitle(data?.display_name ?? `Resume ${data?.resume_id}`);
        const s: Record<string, string> = {};
        const t: Record<string, string> = {};
        Object.entries(data?.sections || {}).forEach(([k, v]) => {
          try {
            const parsed = typeof v === "string" ? JSON.parse(v) : v;
            t[k] = parsed?.title ?? k; // عنوان اصلی سکشن
            s[k] = parsed?.content ?? parsed?.text ?? String(v); // متن قابل ویرایش
          } catch {
            t[k] = k;
            s[k] = String(v ?? "");
          }
        });
        setEditSectionTitles(t);
        setSections(s);
      } catch (e: any) {
        toast({
          title: "Load failed",
          description: e?.message || "Unable to load resume",
          variant: "destructive",
        });
        onOpenChange(false);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, [open, resumeId, toast, onOpenChange]);

  // بستن مودال → پاک‌سازی سبک
  function handleClose() {
    onOpenChange(false);
  }

  async function handleSave() {
    if (!resumeId) return;
    try {
      setSaving(true);

      // تبدیل به شکل موردنیاز بک‌اند
      const sectionsPayload = Object.fromEntries(
        Object.entries(sections).map(([k, content]) => [
          k,
          { title: editSectionTitles[k] ?? k, content },
        ])
      );

      await saveResume(
        { templateId, title: title || "My Resume", sections: sectionsPayload },
        resumeId
      );

      toast({ title: "Saved", description: "Resume updated." });
      onSaved?.(resumeId);
      onOpenChange(false);
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* اگر خواستی انتخاب Template هم اضافه کن */}
            {/* <Select … setTemplateId(...) /> */}

            {Object.entries(sections).map(([key, val]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{key}</label>
                  <span className="text-xs text-gray-500">
                    {val.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <Textarea
                  className="min-h-28"
                  value={val}
                  onChange={(e) =>
                    setSections((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || !resumeId}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
