import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { getLorMeta, saveLorSections, exportLor } from "@/api/lorApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void; // بعد از Export/Save برای رفرش لیست LORها
};

type SectionMap = Record<string, { title: string; content: string }>;

export default function LorEditDialog({ open, onOpenChange, onSaved }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sections, setSections] = useState<SectionMap>({});

  // ترتیب پیش‌فرض سکشن‌ها
  const defaultOrder = useMemo(
    () => [
      "greeting-recipient",
      "candidate",
      "recommender",
      "general-assessment",
      "comparison-with-peers",
      "skills-and-traits",
      "discussing-school",
      "final-endorsement",
      "date",
    ],
    []
  );

  // تبدیل /lor/meta → {slug:{title,content}}
  function normalizeMeta(metaResp: any): SectionMap {
    const obj = (metaResp && metaResp.sections) || metaResp || {};
    const out: SectionMap = {};
    for (const [slug, val] of Object.entries<any>(obj)) {
      if (val && typeof val === "object") {
        const title =
          (val as any).title ||
          String(slug)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase());
        const content =
          (val as any).content ??
          (val as any).text ??
          (val as any).custom_text ??
          (Object.values(val)
            .filter((v) => typeof v === "string" && v.trim())
            .join(" ") ||
            "");
        out[slug] = { title, content: String(content ?? "") };
      } else {
        out[slug] = {
          title: String(slug)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (m) => m.toUpperCase()),
          content: String(val ?? ""),
        };
      }
    }
    return out;
  }

  // اگر هیچ سکشنی نبود، یک اسکلت خالی بساز
  function ensureSkeleton(map: SectionMap): SectionMap {
    if (Object.keys(map).length) return map;
    const skel: SectionMap = {};
    defaultOrder.forEach((slug) => {
      skel[slug] = {
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
        content: "",
      };
    });
    return skel;
  }

  // آرایهٔ مرتب‌شده برای رندر
  const orderedEntries = useMemo(() => {
    const keys = Object.keys(sections);
    const sorted = [...keys].sort((a, b) => {
      const ia = defaultOrder.indexOf(a);
      const ib = defaultOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sorted.map((k) => [k, sections[k]] as const);
  }, [sections, defaultOrder]);

  // لود اولیه
  useEffect(() => {
    if (!open) return;
    let canceled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getLorMeta(); // { sections: {...} }
        if (canceled) return;
        setSections(ensureSkeleton(normalizeMeta(data)));
      } catch (e: any) {
        toast({
          title: "Load failed",
          description: e?.message || "Unable to load LOR content",
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
  }, [open, onOpenChange, toast]);

  function handleClose() {
    onOpenChange(false);
  }

  async function handleSave() {
    try {
      setSaving(true);
      await saveLorSections(sections); // POST /lor/meta { sections: {...} }
      toast({ title: "Saved", description: "LOR content updated." });
      onSaved?.();
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

  // ساخت آرایهٔ مرتب برای Export + متن ساده
  function toStructuredAndPlain() {
    const structured = orderedEntries.map(([slug, sec]) => ({
      title: sec.title || slug,
      content: sec.content || "",
    }));
    const plain = structured
      .map((s) => `${s.title.toUpperCase()}\n${(s.content || "").trim()}\n`)
      .join("\n");
    return { structured, plain };
  }

  async function handleExport(format: "pdf" | "docx") {
    try {
      setSaving(true);
      const { structured, plain } = toStructuredAndPlain();

      // exportLor(format, sections?, content?, opts?)
      const { blob, filename } = await exportLor(
        format,
        structured, // ← آرایهٔ مرتب
        plain, // ← متن ساده (برای txt یا fallback)
        { title: "LOR" }
      );

      // دانلود محلی بدون باز شدن تب جدید
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `lor.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Exported",
        description: `${format.toUpperCase()} downloaded.`,
      });

      // خیلی مهم: لیست LORs در Documents رفرش شود
      onSaved?.();
    } catch (e: any) {
      toast({
        title: "Export failed",
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
          <DialogTitle>Edit Letter of Recommendation</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {orderedEntries.map(([slug, sec]) => {
              const words = (sec.content || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean).length;
              return (
                <div key={slug} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {sec.title || slug}
                    </label>
                    <span className="text-xs text-gray-500">{words} words</span>
                  </div>
                  <Textarea
                    className="min-h-28"
                    value={sec.content}
                    onChange={(e) =>
                      setSections((prev) => ({
                        ...prev,
                        [slug]: { ...prev[slug], content: e.target.value },
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={saving || loading}
            variant="secondary"
          >
            {saving ? "Working…" : "Generate PDF"}
          </Button>
          <Button
            onClick={() => handleExport("docx")}
            disabled={saving || loading}
            variant="secondary"
          >
            {saving ? "Working…" : "Generate Word"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
