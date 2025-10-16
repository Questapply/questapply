// src/components/sop/SOPEditor.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, RotateCcw, Save as SaveIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label as UiLabel } from "@/components/ui/label";
import { Sparkles, Scissors, Expand } from "lucide-react";

// API
import {
  getSopMeta,
  saveSopMeta,
  exportSop,
  type SopKey,
  type SopSections as ApiSopSections,
} from "@/api/sopApi";

// Shared
import {
  SECTION_ORDER,
  SECTION_DEFS,
  type SectionKey,
  type SopSections,
} from "@/components/shared/sopFormat";
import { assembleHtml, assemblePlainText } from "@/components/shared/sopFormat";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { generateSop, getSchools } from "@/api/sopApi";
/* ------------------- defaults (فقط مخصوص Editor) ------------------- */
const SECTION_DEFAULTS: Record<SectionKey, string> = {
  hook: "Write this: Open with 1–3 sentences that grab attention and set your focus; choose ONE angle below and fill the brackets.\n• Career Goals – State the role you aim for and the impact you want to create in [field].\n• Community Involvement – Show how work with [community/group] revealed a real problem you want to solve.\n• Contributions to Society – Explain the broader outcome you want your work to enable for [who/sector].\n• Future Goals – Describe what you’ll study now and your next step (PhD/industry/startup) and why.",
  segue:
    "Write this: In ~80–120 words, connect past → motivation → now; show how experiences built your skills and led you to graduate study. \n• Describe your background, interests, and motivations (“segue”) paragraph. \n•  Show the thread from past → motivation → now.",
  academic:
    "•If you have Academic Achievements, add them here. Sample items are listed below.\n• 2 Grades in Key Courses – e.g., Advanced [Course]: [grade]; ranked top [x%].\n• Participation in Research Projects – At [lab], built [method] for [task]; improved [metric] by [x%].\n• Worked with Notable Professors – Mentored by Prof. [Name] on [topic]; co-authored [paper/poster].",
  extracurricular:
    "If you have Extracurricular Activities, list them here. Sample items are provided below. \n• Member, [Society] — organized [event/workshop] for [n] participants. \n• Volunteering, [NGO/Lab] — built [tool] used by [group] to [outcome]. \n•  Community Project — led a team of [n] to deploy [solution] in [location].\n• Tutoring/Mentoring — supported [n] students in [subject]; average grade ↑ [x]. \n• Internship, [Company] — implemented [feature]; latency ↓ [x%]",
  publications:
    "If you have published papers—or manuscripts under review/in preparation—add them here. \n• [Surname], [Initials]. “[Title].” [Venue], [Year]. (DOI: [link]). \n•  Highlights: achieved [metric] on [dataset]; code: [repo link]. \n• [Surname], [Initials]. “[Title].” [Workshop/Journal], [Year]. \n• Under Review: “[Title],” [Target Venue], [Year].",
  problems:
    "If you have an issue in your background that needs explanation, add it here; example cases are listed below. \n• Low GPA. \n• Low grades in certain subjects. \n• Low grade in one or a few courses. \n• Academic probation. \n• Course withdrawals. \n•Gaps in education",
  whySchool:
    "This section is very important—please provide at least one reason why you want to apply to this university. Sample reasons are listed below. \n• Faculty fit: Prof. [Name] (Group: [Lab]) — alignment with my interest in [topic]. \n• Research strength: [Center/Lab] with facilities for [equipment/dataset].\n• Methodological match: emphasis on [approach] that supports my plan to study [sub-area].\n• Industry links: partnerships with [companies] enabling [internships/collab]",
  goal: "Short-term: contribute to explainable-AI research and co-author papers.\nLong-term: lead a lab building transparent, fair AI adopted by industry.\nConclusion: this program is the right environment to realize these goals.",
};

/* ------------------- UI <-> API mapping (فقط Editor) ------------------- */
const uiToApiKey: Record<SectionKey, SopKey> = {
  hook: "hook",
  segue: "segue",
  academic: "academic",
  extracurricular: "extrac", // API uses 'extrac'
  publications: "publications",
  problems: "problem", // API uses 'problem'
  whySchool: "why", // API uses 'why'
  goal: "goal",
};

const apiToUiKey: Record<SopKey, SectionKey | null> = {
  country: null, // سکشن UI جدا دارد
  hook: "hook",
  segue: "segue",
  academic: "academic",
  extrac: "extracurricular",
  publications: "publications",
  problem: "problems",
  why: "whySchool",
  whySchool: "whySchool", // ← legacy key را هم نگه دار
  goal: "goal",
};

const localTransform = (
  key: SectionKey,
  action: "improve" | "shorten" | "expand"
) => {
  const current = sections[key]?.content || "";
  let next = current;

  if (action === "shorten") {
    const w = current.split(/\s+/).filter(Boolean);
    const target = Math.max(18, Math.floor(w.length * 0.7));
    next = w.slice(0, target).join(" ") + (w.length > target ? "…" : "");
  } else if (action === "expand") {
    next =
      (current ? current + " " : "") +
      "This additional context further clarifies my motivation and readiness for graduate study.";
  } else {
    // improve: تمیزکاری ساده‌ی نگارشی
    next = current.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
  }

  updateSection(key, next);
};

/* ------------------- theme util ------------------- */
function getCurrentTheme(): "light" | "dark" {
  try {
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.body.classList.contains("dark")) return "dark";
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {}
  return "light";
}

/* ------------------- empty scaffold ------------------- */
const emptySections: SopSections = SECTION_ORDER.reduce((acc, k) => {
  acc[k] = { title: SECTION_DEFS[k].title, content: "" };
  return acc;
}, {} as SopSections);

export default function SOPEditor() {
  // state (کاملاً داخل Editor)
  const [sections, setSections] = useState<SopSections>(emptySections);

  // preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // export modal
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "docx">(
    "txt"
  );
  const [target, setTarget] = useState<{
    level: string;
    program: string;
    university: string;
    country: string;
  }>({ level: "", program: "", university: "", country: "" });

  const [isCreated, setIsCreated] = useState(false);

  const [univId, setUnivId] = useState<string>("");
  const [univName, setUnivName] = useState<string>("");

  const [schoolSearch, setSchoolSearch] = useState("");
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const schoolSearchRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const REQUIRED_SECTIONS: SectionKey[] = [
    "hook",
    "segue",
    "academic",
    "whySchool",
    "goal",
  ];
  const REQUIRED_TARGET_FIELDS: Array<keyof typeof target> = [
    "country",
    "program",
    "level",
    "university",
  ];
  // word counter
  const totalWords = useMemo(
    () =>
      SECTION_ORDER.reduce((sum, k) => {
        const n = (sections[k]?.content || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        return sum + n;
      }, 0),
    [sections]
  );
  // بالای return و داخل function SOPEditor()
  const applyQuickEdit = (
    key: SectionKey,
    action: "improve" | "shorten" | "expand"
  ) => {
    const current = sections[key]?.content || "";
    let next = current;

    if (action === "shorten") {
      const w = current.split(/\s+/).filter(Boolean);
      const target = Math.max(18, Math.floor(w.length * 0.7));
      next = w.slice(0, target).join(" ") + (w.length > target ? "…" : "");
    } else if (action === "expand") {
      next =
        (current ? current + " " : "") +
        "This experience further strengthened my readiness for graduate study.";
    } else {
      // improve: کمی تمیزکاری سبک
      next = current.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
    }

    setSections((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { title: SECTION_DEFS[key].title }),
        content: next,
      },
    }));
  };

  /* ------------------- load meta → sections ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getSopMeta();
        console.log("[SOPEditor] meta response:", res);
        console.log(
          "[SOPEditor] country raw section:",
          (res as any)?.sections?.country
        );
        const ui: SopSections = { ...emptySections };

        if (res?.sections) {
          (Object.keys(res.sections) as SopKey[]).forEach((apiKey) => {
            const srv = (res.sections as any)[apiKey];

            // 1) سکشن کشور/هدف: فقط inputs را پر کن
            if (apiKey === "country") {
              const sel = (srv?.selects as Record<string, string>) || {};
              const next = {
                level: sel.sop_name_level || sel.level || "",
                program:
                  sel.sop_name_program_name ||
                  sel.program_name ||
                  sel.sop_name_program ||
                  "",
                university:
                  sel.sop_name_university_name ||
                  sel.university_name ||
                  sel.sop_name_university ||
                  "",
                country:
                  sel.sop_name_destination_name ||
                  sel.country_name ||
                  sel.sop_name_destination ||
                  "",
              };
              console.log("[SOPEditor] computed target from selects:", next);

              // اگر selects خالی بود از متن content استخراج کن (سازگاری با قبلی)
              if (
                !next.level &&
                !next.program &&
                !next.university &&
                !next.country
              ) {
                const raw = (srv?.content as string) || "";
                const mLevel =
                  raw.match(/Level<\/strong>:\s*([^<\n]+)/i) ||
                  raw.match(/- Level:\s*([^\n<]+)/i);
                const mProg =
                  raw.match(/Program<\/strong>:\s*([^<\n]+)/i) ||
                  raw.match(/- Program:\s*([^\n<]+)/i);
                const mUni =
                  raw.match(/University<\/strong>:\s*([^<\n]+)/i) ||
                  raw.match(/- University:\s*([^\n<]+)/i);
                const mCtry =
                  raw.match(/Country<\/strong>:\s*([^<\n]+)/i) ||
                  raw.match(/- Country:\s*([^\n<]+)/i);
                next.level = (mLevel?.[1] || "").trim();
                next.program = (mProg?.[1] || "").trim();
                next.university = (mUni?.[1] || "").trim();
                next.country = (mCtry?.[1] || "").trim();
              }
              setTarget(next);
              console.log("[SOPEditor] target state set to:", next);
              return; // ← ادامه نده چون country سکشن UI ندارد
            }

            // 2) بقیه‌ی سکشن‌ها
            const uiKey = apiToUiKey[apiKey];
            if (!uiKey) return;
            ui[uiKey] = {
              title: SECTION_DEFS[uiKey].title,
              content:
                srv?.content && String(srv.content).trim()
                  ? srv.content
                  : SECTION_DEFAULTS[uiKey],
            };
          });
        } else {
          SECTION_ORDER.forEach((k) => {
            ui[k] = {
              title: SECTION_DEFS[k].title,
              content: SECTION_DEFAULTS[k],
            };
          });
        }

        setSections(ui);
      } catch (e: any) {
        console.error("Load SOP meta failed:", e);
        const ui: SopSections = { ...emptySections };
        SECTION_ORDER.forEach((k) => {
          ui[k] = {
            title: SECTION_DEFS[k].title,
            content: SECTION_DEFAULTS[k],
          };
        });
        setSections(ui);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await getSchools({ limit: 30 });
        setSchools(items);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // اگر از بک‌اند نام دانشگاه برگشته بود، به univName بریز
    if (target.university && !univName) setUnivName(target.university);
  }, [target.university, univName]);

  /* ------------------- helpers & actions ------------------- */
  const updateSection = (key: SectionKey, content: string) => {
    setIsCreated(false);
    setSections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { title: SECTION_DEFS[key].title }), content },
    }));
  };

  // Save فقط یک سکشن
  const saveOneSection = async (key: SectionKey) => {
    try {
      const apiKey = uiToApiKey[key];
      await saveSopMeta({
        sections: {
          [apiKey]: {
            title: SECTION_DEFS[key].title,
            content: sections[key]?.content || "",
          },
        } as Partial<ApiSopSections>,
      });
      toast({
        title: "Saved",
        description: `Section "${SECTION_DEFS[key].title}" saved.`,
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    const cleared: SopSections = SECTION_ORDER.reduce((acc, k) => {
      acc[k] = { title: SECTION_DEFS[k].title, content: "" };
      return acc;
    }, {} as SopSections);
    setSections(cleared);
  };

  const handlePreview = async () => {
    try {
      // پیش‌نمایش باید متن ساده داشته باشد (نه HTML)
      const countryPlain =
        `- Level: ${target.level}\n` +
        `- Program: ${target.program}\n` +
        `- University: ${target.university}\n` +
        `- Country: ${target.country}.`;

      const payload: any = {
        sections: {
          country: {
            title: "Country / Program / Level / University",
            content: countryPlain,
          },
        },
      };

      SECTION_ORDER.forEach((uiKey) => {
        const apiKey = uiToApiKey[uiKey];
        payload.sections[apiKey] = {
          title: SECTION_DEFS[uiKey].title,
          content: sections[uiKey]?.content || "",
        };
      });

      const res = await generateSop({ sections: payload.sections });
      setPreviewHtml(res?.html || "");
      setPreviewOpen(true);
    } catch (e: any) {
      toast({
        title: "Preview failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const handleSaveAndCreate = async () => {
    try {
      // 1) اعتبارسنجی‌های اجباری
      const missingTarget = REQUIRED_TARGET_FIELDS.filter(
        (f) => !target[f].trim()
      );
      if (missingTarget.length) {
        toast({
          title: "Fill required fields",
          description:
            "Please complete Country / Program / Level / University.",
          variant: "destructive",
        });
        return;
      }

      const missingSections = REQUIRED_SECTIONS.filter(
        (k) => !(sections[k]?.content || "").trim()
      );
      if (missingSections.length) {
        toast({
          title: "Fill required sections",
          description: `Please complete: ${missingSections
            .map((k) => SECTION_DEFS[k].title)
            .join(", ")}`,
          variant: "destructive",
        });
        return;
      }

      // 2) ساخت payload برای ذخیره (Country جداگانه + بقیه از SECTION_ORDER)
      const apiPayload: Partial<ApiSopSections> = {};

      // Country (با selects برای سازگاری بک‌اند)
      (apiPayload as any).country = {
        title: "Country / Program / Level / University",
        content:
          `<strong>- Level</strong>: ${target.level}<br>` +
          `- <strong>Program</strong>: ${target.program}<br>` +
          `- <strong>University</strong>: ${target.university}<br>` +
          `- <strong>Country</strong>: ${target.country}.`,
        selects: {
          sop_name_level: target.level,
          sop_name_program_name: target.program,
          sop_name_university_name: target.university,
          sop_name_destination_name: target.country,
        },
      };

      // سایر سکشن‌ها
      SECTION_ORDER.forEach((uiKey) => {
        const apiKey = uiToApiKey[uiKey];
        (apiPayload as any)[apiKey] = {
          title: SECTION_DEFS[uiKey].title,
          content: sections[uiKey]?.content || "",
        };
      });

      await saveSopMeta({ sections: apiPayload });

      // 3) ساخت ساختار خروجی (structured) + متن ساده (plain)
      const compiledCountryHtml =
        `<strong>- Level</strong>: ${target.level}<br>` +
        `- <strong>Program</strong>: ${target.program}<br>` +
        `- <strong>University</strong>: ${target.university}<br>` +
        `- <strong>Country</strong>: ${target.country}.`;

      const structured = [
        {
          title: "Country / Program / Level / University",
          content: compiledCountryHtml,
        },
        ...SECTION_ORDER.map((k) => ({
          title: SECTION_DEFS[k].title,
          content: sections[k]?.content || "",
        })),
      ];

      const countryPlain =
        `- Level: ${target.level}\n` +
        `- Program: ${target.program}\n` +
        `- University: ${target.university}\n` +
        `- Country: ${target.country}.`;

      const plain = `${countryPlain}\n\n${assemblePlainText(sections)}`;

      await exportSop({
        format: "pdf",
        title: "My SOP",
        sections: structured,
        content: plain,
      });

      setIsCreated(true);
      toast({
        title: "Done",
        description: "SOP saved and created. Check My Documents.",
      });
    } catch (e: any) {
      toast({
        title: "Operation failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      // چون بک‌اند بخش country را Required می‌داند، این سکشن را هم باید بفرستیم
      const countryPlain =
        `- Level: ${target.level}\n` +
        `- Program: ${target.program}\n` +
        `- University: ${target.university}\n` +
        `- Country: ${target.country}.`;

      const structured = [
        {
          title: "Country / Program / Level / University",
          content: countryPlain,
        },
        ...SECTION_ORDER.map((k) => ({
          title: SECTION_DEFS[k].title,
          content: sections[k]?.content || "",
        })),
      ];

      const plain = `${countryPlain}\n\n${assemblePlainText(sections)}`;

      const blob = await exportSop({
        format: exportFormat,
        title: "My SOP",
        sections: structured,
        content: plain,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sop.${exportFormat === "docx" ? "docx" : exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="rounded-xl border flex flex-col h-full min-h-0 overflow-hidden"
      style={{ background: "#111827", borderColor: "#25324a" }}
    >
      {/* toolbar */}
      <div className="p-4 border-b" style={{ borderColor: "#25324a" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              style={{ background: "#0b213a", borderColor: "#25324a" }}
            >
              Target: CS Ph.D. • Stanford
            </Badge>
            <Badge
              variant="outline"
              style={{ background: "#0b213a", borderColor: "#25324a" }}
            >
              Words ~ {totalWords}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
              style={{
                background: "#0e1526",
                borderColor: "#25324a",
                color: "#9ca3af",
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreview}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
              style={{
                background: "#0e1526",
                borderColor: "#25324a",
                color: "#9ca3af",
              }}
            >
              Preview
            </Button>
            <Button
              size="sm"
              onClick={() => setExportOpen(true)}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
              style={{
                background: "#7c3aed",
                color: "white",
              }}
            >
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button
              size="sm"
              onClick={handleSaveAndCreate}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
              style={{ background: "#22c55e", color: "white" }}
            >
              <SaveIcon className="w-4 h-4 mr-1" /> Save & Create
            </Button>
          </div>
        </div>
      </div>

      {/* sections */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* Target / Program / Level / University */}
        <div
          className="p-4 rounded-xl border mb-4"
          style={{ background: "#111827", borderColor: "#25324a" }}
        >
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <h3 className="font-medium">
              Country / Program / Level / University
            </h3>
            <Badge
              variant="outline"
              className="text-xs"
              style={{
                background: "#052e1a",
                borderColor: "#14532d",
                color: "#22c55e",
              }}
            >
              Required
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-3">
              <Input
                placeholder="Country (e.g., Canada (CA))"
                value={target.country}
                onChange={(e) => {
                  setTarget((s) => ({ ...s, country: e.target.value }));
                  setIsCreated(false);
                }}
              />
              <Input
                placeholder="Program (e.g., Computer Science)"
                value={target.program}
                onChange={(e) => {
                  setTarget((s) => ({ ...s, program: e.target.value }));
                  setIsCreated(false);
                }}
              />
              <Input
                placeholder="Level (e.g., Ph.D. / Master / Bachelor)"
                value={target.level}
                onChange={(e) => {
                  setTarget((s) => ({ ...s, level: e.target.value }));
                  setIsCreated(false);
                }}
              />
              <div className="space-y-2">
                <Label htmlFor="univ">University</Label>
                <Select
                  value={univId}
                  onValueChange={(val) => {
                    setUnivId(val);
                    const found = schools.find((s) => s.id === val);
                    setUnivName(found?.name || "");
                    setTarget((s) => ({ ...s, university: found?.name || "" })); // برای Preview
                    setIsCreated(false);
                  }}
                  onOpenChange={(open) => {
                    if (open)
                      setTimeout(() => schoolSearchRef.current?.focus(), 0);
                  }}
                >
                  <SelectTrigger id="univ" className="w-full">
                    <SelectValue
                      placeholder={univName || "Select university"}
                    />
                  </SelectTrigger>
                  <SelectContent
                    side="bottom"
                    position="popper"
                    sideOffset={6}
                    align="start"
                    avoidCollisions={false}
                    className="p-0"
                  >
                    {/* نوار جستجو */}
                    <div className="p-2 sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
                      <Input
                        ref={schoolSearchRef}
                        placeholder="Search university..."
                        value={schoolSearch}
                        onChange={async (e) => {
                          const v = e.target.value;
                          setSchoolSearch(v);
                          try {
                            const { items } = await getSchools({
                              search: v,
                              limit: 30,
                            });
                            setSchools(items);
                          } catch {}
                        }}
                      />
                    </div>

                    {schools.length ? (
                      schools.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No results
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <span
                  className="text-[12px] md:text-sm font-medium"
                  style={{ color: "#9ca3af" }}
                >
                  Preview
                </span>
              </div>
              <div
                className="min-h-32 p-3 rounded border-2 border-dashed text-[13px] md:text-sm whitespace-pre-wrap"
                style={{
                  borderColor: "#25324a",
                  background: "#0b1020",
                  color: "#e5e7eb",
                }}
              >
                {target.level ||
                target.program ||
                target.university ||
                target.country ? (
                  <>
                    <strong>- Level</strong>: {target.level || "—"}
                    {"\n"}- <strong>Program</strong>: {target.program || "—"}
                    {"\n"}- <strong>University</strong>:{" "}
                    {target.university || "—"}
                    {"\n"}- <strong>Country</strong>: {target.country || "—"}.
                  </>
                ) : (
                  <em style={{ color: "#9ca3af" }}>
                    Fill Level, Program, University, Country…
                  </em>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ background: "#22c55e", color: "white" }}
                  onClick={async () => {
                    const compiled =
                      `<strong>- Level</strong>: ${target.level || ""}<br>` +
                      `- <strong>Program</strong>: ${
                        target.program || ""
                      }<br>` +
                      `- <strong>University</strong>: ${
                        target.university || ""
                      }<br>` +
                      `- <strong>Country</strong>: ${target.country || ""}.`;

                    try {
                      await saveSopMeta({
                        sections: {
                          country: {
                            title: "Country / Program / Level / University",
                            content: compiled,
                            selects: {
                              sop_name_level: target.level,
                              sop_name_program_name: target.program,
                              sop_name_university_name: target.university,
                              sop_name_destination_name: target.country,
                            },
                          },
                        } as any,
                      });

                      // برای همسانی با پیش‌نمایش local
                      setSections((prev) => ({
                        ...prev,
                        country: {
                          title: "Country / Program / Level / University",
                          content: compiled,
                        } as any,
                      }));

                      toast({
                        title: "Saved",
                        description: `Section "Target" saved.`,
                      });
                    } catch (e: any) {
                      toast({
                        title: "Save failed",
                        description: e?.message ?? "Unexpected error",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <SaveIcon className="w-3 h-3 mr-1" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {SECTION_ORDER.map((key) => {
          const def = SECTION_DEFS[key];
          const val = sections[key]?.content ?? "";
          const words = val.trim().split(/\s+/).filter(Boolean).length;

          return (
            <div
              key={key}
              className="p-4 rounded-xl border"
              style={{ background: "#111827", borderColor: "#25324a" }}
            >
              {/* header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-medium">{def.title}</h3>
                  {(() => {
                    const required = REQUIRED_SECTIONS.includes(key);
                    return (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          background: required ? "#052e1a" : "#0b213a",
                          borderColor: required ? "#14532d" : "#25324a",
                          color: required ? "#22c55e" : "#9ca3af",
                        }}
                      >
                        {required ? "Required" : "Optional"}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              {/* body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Textarea
                    value={val}
                    onChange={(e) => updateSection(key, e.target.value)}
                    placeholder={SECTION_DEFAULTS[key]}
                    className="min-h-28 md:min-h-32 text-[13px] md:text-sm"
                    style={{
                      background: "#0e1526",
                      borderColor: "#25324a",
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <span
                      className="text-[12px] md:text-sm font-medium"
                      style={{ color: "#9ca3af" }}
                    >
                      Preview
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyQuickEdit(key, "improve")}
                        className="text-xs gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Improve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyQuickEdit(key, "shorten")}
                        className="text-xs gap-1"
                      >
                        <Scissors className="w-3 h-3" /> Shorten
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyQuickEdit(key, "expand")}
                        className="text-xs gap-1"
                      >
                        <Expand className="w-3 h-3" /> Expand
                      </Button>
                    </div>
                  </div>
                  <div
                    className="min-h-32 p-3 rounded border-2 border-dashed text-[13px] md:text-sm whitespace-pre-wrap"
                    style={{
                      borderColor: "#25324a",
                      background: "#0b1020",
                      color: "#e5e7eb",
                    }}
                  >
                    {val || SECTION_DEFAULTS[key]}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Button
                      size="sm"
                      className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                      style={{ background: "#22c55e", color: "white" }}
                      onClick={() => saveOneSection(key)}
                    >
                      <SaveIcon className="w-3 h-3 mr-1" /> Save
                    </Button>
                    <span
                      className="text-[12px] md:text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      Word ~ {words}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export SOP</DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={exportFormat}
            onValueChange={(v: any) => setExportFormat(v)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="txt" id="exp-txt" />
              <UiLabel htmlFor="exp-txt">Text (.txt)</UiLabel>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pdf" id="exp-pdf" />
              <UiLabel htmlFor="exp-pdf">PDF (.pdf)</UiLabel>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="docx" id="exp-docx" />
              <UiLabel htmlFor="exp-docx">Word (.docx)</UiLabel>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Download</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview (assembled)</DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh]">
            <iframe
              title="SOP Preview"
              className="w-full h-[60vh] rounded-md border"
              srcDoc={previewHtml}
              sandbox="allow-same-origin"
              style={{ background: "white" }}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
