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

import {
  getSopMeta,
  saveSopMeta,
  type SopKey,
  type SopSections as ApiSopSections,
} from "@/api/sopApi";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sopId: string | null;
  onSaved?: () => void;
};

/** کلیدهای قابل نمایش در UI (کاننیکال: why) */
type UiSopKey =
  | "hook"
  | "segue"
  | "academic"
  | "extrac"
  | "publications"
  | "problem"
  | "why"
  | "goal";

/** ترتیب نمایش در UI */
const SOP_KEYS_ORDER: UiSopKey[] = [
  "hook",
  "segue",
  "academic",
  "extrac",
  "publications",
  "problem",
  "why", // کاننیکال
  "goal",
];

/** عناوین UI (فقط برای کلیدهای قابل نمایش) */
const UI_TITLES: Record<UiSopKey, string> = {
  hook: "Hook",
  segue: "Segue (Journey / Motivation)",
  academic: "Academic Achievements",
  extrac: "Extracurricular Activities",
  publications: "Publications",
  problem: "Problems in Background",
  why: "Why This School?",
  goal: "Your Goal / Conclusion",
};

type SectionsState = Partial<Record<SopKey, string>>;
type TitlesState = Partial<Record<SopKey, string>>;
type SectionBlock = { title?: string; content?: string };

/** نگاشت alias: اگر whySchool هست ولی why خالی است → why را پر کن */
function normalizeWhyAlias(secs: SectionsState): SectionsState {
  const next = { ...secs };
  if ((!next.why || !next.why.trim()) && next.whySchool) {
    next.why = next.whySchool;
  }
  return next;
}

export default function SopEditDialog({
  open,
  onOpenChange,
  sopId,
  onSaved,
}: Props) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState<string>("Statement of Purpose");

  // متن خام هر سکشن (Partial تا نبودن یک کلید ارور نده)
  const [sections, setSections] = useState<SectionsState>({
    hook: "",
    segue: "",
    academic: "",
    extrac: "",
    publications: "",
    problem: "",
    why: "", // کاننیکال
    whySchool: "", // فقط برای سازگاری؛ در UI نمایش نمی‌دهیم
    goal: "",
    country: "",
  });

  // عنوان قابل ویرایش (Partial)
  const [sectionTitles, setSectionTitles] = useState<TitlesState>({
    hook: UI_TITLES.hook,
    segue: UI_TITLES.segue,
    academic: UI_TITLES.academic,
    extrac: UI_TITLES.extrac,
    publications: UI_TITLES.publications,
    problem: UI_TITLES.problem,
    why: UI_TITLES.why,
    goal: UI_TITLES.goal,
    country: "Target / Program / Country", // نمایش نمی‌دهیم
  });

  // لود داده‌ها وقتی مودال باز می‌شود
  useEffect(() => {
    if (!open) return;
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getSopMeta(sopId ?? undefined);
        if (canceled) return;

        const apiSecs = (data?.sections || {}) as Partial<ApiSopSections>;

        // محتوا
        const nextSections: SectionsState = { ...sections };
        const nextTitles: TitlesState = { ...sectionTitles };

        const entries = Object.entries(apiSecs) as [SopKey, SectionBlock][];

        for (const [k, sec] of entries) {
          const content = typeof sec?.content === "string" ? sec.content : "";
          const t =
            typeof sec?.title === "string" && sec.title.trim()
              ? sec.title
              : (UI_TITLES as Record<string, string>)[k] ||
                sectionTitles[k] ||
                "";

          nextSections[k] = content;
          nextTitles[k] = t;
        }

        const normalized = normalizeWhyAlias(nextSections);

        setSections(normalized);
        setSectionTitles(nextTitles);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        toast({
          title: "Load failed",
          description: message || "Unable to load SOP",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  async function handleSave() {
    try {
      setSaving(true);

      // فقط کلیدهای کاننیکال UI را ذخیره می‌کنیم (why به‌جای whySchool)
      const payloadSections = Object.fromEntries(
        SOP_KEYS_ORDER.map((k) => [
          k,
          {
            title: sectionTitles[k] || UI_TITLES[k],
            content: sections[k] || "",
          },
        ])
      ) as Partial<ApiSopSections>;

      await saveSopMeta({ sections: payloadSections });

      toast({ title: "Saved", description: "SOP updated." });
      onSaved?.();
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast({
        title: "Save failed",
        description: message || "Unexpected error",
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
          <DialogTitle>Edit Statement of Purpose</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* سکشن‌ها */}
            {SOP_KEYS_ORDER.map((k) => {
              const val = sections[k] || "";
              const words = val.trim()
                ? val.trim().split(/\s+/).filter(Boolean).length
                : 0;
              return (
                <div key={k} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {UI_TITLES[k]}
                    </label>
                    <span className="text-xs text-gray-500">{words} words</span>
                  </div>
                  <Textarea
                    className="min-h-28"
                    value={val}
                    onChange={(e) =>
                      setSections((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
