// src/components/ResumeEditor.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { RotateCcw, Save, Download, Trash2, Plus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  prefillResume,
  exportResume,
  saveResume,
  SaveResumePayload,
  getResume,
} from "@/api/resumeApi";

import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { Switch } from "../ui/switch";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label as UiLabel } from "../ui/label";

// ---- Types ----
export type SectionValue =
  | { title: string; content: string }
  | { title: string; content: any };

export type SectionsShape = Record<string, SectionValue>;

type Props = {
  sections: SectionsShape;
  setSections: React.Dispatch<React.SetStateAction<SectionsShape>>;
  initialSections: SectionsShape;
  selectedTemplateId: number | null;
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  targetBadge?: string;
  countryBadge?: string;
};

// ---- Structured data models ----
type ItemListData = { items: string[] };

type ExperienceBlock = {
  role: string;
  organization: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};
type ExperienceData = { blocks: ExperienceBlock[] };

type EducationBlock = {
  title: string;
  university: string;
  description?: string;
  start?: string;
  end?: string;
};
type EducationData = { blocks: EducationBlock[] };

type CertBlock = {
  header: string;
  skills: string[];
};
type CertData = { blocks: CertBlock[] };

type AwardBlock = {
  title: string;
  orgAndDate: string;
};
type AwardData = { blocks: AwardBlock[] };

type MembershipBlock = {
  organization: string;
  date: string;
};
type MembershipData = { blocks: MembershipBlock[] };

type ReferenceBlock = {
  nameTitle: string;
  place: string;
  contact: string;
};
type ReferenceData = { blocks: ReferenceBlock[] };

// ----- Personal (ساختاری، بدون AddNew)
type PersonalData = {
  fullName: string;
  headline: string;
  phone: string;
  email: string;
  linkedin: string;
};

// ---- Structured section keys ----
const STRUCTURED_KEYS = {
  interests: "interests",
  hobbies: "hobbies",
  publications: "publications",
  experience: "experience",
  education: "education",
  skills: "skills",
  awards: "awards",
  memberships: "memberships",
  refs: "refs",
} as const;

// ---- Defaults ----
const DEFAULT_RI_ITEMS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Future Research: Developing AI",
];
const DEFAULT_HOBBY_ITEMS = [
  "Artificial Intelligence and Machine Learning",
  "Competitive Programming and Hackathons",
  "New Item",
];
const DEFAULT_PUB_ITEMS = [
  'Brown, J., & Green, A. (2025). "AI Algorithms for Enhancing Cybersecurity Measures," Computer Science Journal, 33(4), 78-102',
  "New Item",
];

const DEFAULT_XP_BLOCK: ExperienceBlock = {
  role: "Computer Science Research Assistant",
  organization: "Tech University",
  location: "Tech city , USA",
  startDate: "September 2021",
  endDate: "Present",
  bullets: ["Conducted research on AI Algorithms for Cybersecurity."],
};
const DEFAULT_XP: ExperienceData = { blocks: [DEFAULT_XP_BLOCK] };

const DEFAULT_EDU_BLOCK: EducationBlock = {
  title: "PhD in Computer",
  university: "Tech University",
  description:
    'Dissertation: : "AI Algorithms for Enhancing Cybersecurity applications"',
  start: "2020",
  end: "2024",
};
const DEFAULT_EDU: EducationData = { blocks: [DEFAULT_EDU_BLOCK] };

const DEFAULT_CERT_BLOCK: CertBlock = {
  header:
    "Certified Information Systems Professional (CISSP) (ISC), April 2023",
  skills: [
    "Proficient in Python , Java and C++",
    "Experienced in machine learning and AI development",
  ],
};
const DEFAULT_CERT: CertData = { blocks: [DEFAULT_CERT_BLOCK] };

const DEFAULT_AWARD_BLOCK: AwardBlock = {
  title: "Outstanding Dissertation Award",
  orgAndDate: "Tech University , May 2024",
};
const DEFAULT_AWARDS: AwardData = { blocks: [DEFAULT_AWARD_BLOCK] };

const DEFAULT_MEMBERSHIP_BLOCK: MembershipBlock = {
  organization: "IEEE",
  date: "September 2022 – Present",
};
const DEFAULT_MEMBERSHIPS: MembershipData = {
  blocks: [DEFAULT_MEMBERSHIP_BLOCK],
};

const DEFAULT_REF_BLOCK_1: ReferenceBlock = {
  nameTitle: "Dr. Sarah Thompson - Associate Professor of Computer Science",
  place: "Department of Computer Science, MIT",
  contact: "+1 (617) 253-1234 - sarah.thompson@mit.edu",
};
const DEFAULT_REF_BLOCK_2: ReferenceBlock = {
  nameTitle: "New Reference Name - New Reference Title",
  place: "New Reference Place",
  contact: "New Reference Tel - New Reference Email",
};
const DEFAULT_REFS: ReferenceData = {
  blocks: [DEFAULT_REF_BLOCK_1, DEFAULT_REF_BLOCK_2],
};
// --- Personal (structured, no Add New)

const PERSONAL_KEY = "personal";

function personalToMultiline(p: PersonalData): string {
  const lines = [
    p.fullName || "",
    p.headline || "",
    p.phone ? `Phone: ${p.phone}` : "",
    p.email ? `Email: ${p.email}` : "",
    p.linkedin ? `LinkedIn: ${p.linkedin}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function defaultPersonalFromInitial(initial: SectionsShape): PersonalData {
  const raw = (initial[PERSONAL_KEY] as any)?.content || "";
  const lines = String(raw).split(/\r?\n/);
  return {
    fullName: lines[0] ?? "",
    headline: lines[1] ?? "",
    // اگر در initial «Phone: …» و … بودند، پاکسازی کن
    phone: (lines[2] || "").replace(/^Phone:\s*/i, ""),
    email: (lines[3] || "").replace(/^Email:\s*/i, ""),
    linkedin: (lines[4] || "").replace(/^LinkedIn:\s*/i, ""),
  };
}

function parsePersonalLoose(
  multiline: string,
  fallback: PersonalData
): PersonalData {
  const lines = multiline
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let out: PersonalData = { ...fallback };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const phoneRe = /(phone[:\s\-]?|^\+?\d[\d\s\-\(\)]{6,})/i;
  const linkedRe = /linkedin\.com/i;

  // خط اول را اگر ایمیل/تلفن/لینکدین نبود، به عنوان fullName بگذار
  if (
    lines[0] &&
    !emailRe.test(lines[0]) &&
    !linkedRe.test(lines[0]) &&
    !phoneRe.test(lines[0])
  ) {
    out.fullName = lines[0];
  }

  for (const l of lines.slice(1)) {
    const plain = l.replace(/^(Phone|Email|LinkedIn)\s*:\s*/i, "");
    if (emailRe.test(plain)) {
      out.email = plain;
    } else if (linkedRe.test(plain)) {
      out.linkedin = plain;
    } else if (phoneRe.test(l)) {
      // اگر به‌صورت "Phone: ..." بود
      out.phone = plain;
    } else {
      // اگر هیچ‌کدام نبود و headline خالی است، بگذار تو headline
      if (!out.headline) out.headline = l;
    }
  }
  return out;
}

function mergeFromApiSections(
  initial: SectionsShape,
  apiSections: Record<string, any> | undefined | null
): SectionsShape {
  const src = apiSections || {};
  const personalDefault = defaultPersonalFromInitial(initial);

  return Object.keys(initial).reduce((acc, key) => {
    const init = initial[key] as any;
    const fromApi = src[key];

    // PERSONAL
    if (key === PERSONAL_KEY) {
      let model: PersonalData = { ...personalDefault };

      if (typeof fromApi === "string") {
        model = parsePersonalLoose(fromApi, personalDefault);
      } else if (fromApi && typeof fromApi === "object") {
        if (typeof fromApi.content === "string") {
          model = parsePersonalLoose(fromApi.content, personalDefault);
        } else if (fromApi.content && typeof fromApi.content === "object") {
          model = {
            fullName: fromApi.content.fullName ?? personalDefault.fullName,
            headline: fromApi.content.headline ?? personalDefault.headline,
            phone: fromApi.content.phone ?? personalDefault.phone,
            email: fromApi.content.email ?? personalDefault.email,
            linkedin: fromApi.content.linkedin ?? personalDefault.linkedin,
          };
        }
      }

      acc[key] = { title: init.title, content: model };
      return acc;
    }

    // ... بقیه‌ی merge که خودت داری (سکشن‌های ساختاری و ساده) ...
    // (همان نسخه‌ی فعلی‌ات را نگه دار)
    if (fromApi && typeof fromApi === "object" && "content" in fromApi) {
      const val =
        typeof fromApi.content === "string" ? fromApi.content : fromApi.content;
      const isEmptyString =
        typeof val === "string" ? val.trim().length === 0 : false;
      acc[key] = {
        title:
          typeof fromApi.title === "string" && fromApi.title.trim()
            ? fromApi.title
            : init.title,
        content: isEmptyString ? init.content || "" : val,
      };
      return acc;
    }
    if (typeof fromApi === "string") {
      acc[key] = {
        title: init.title,
        content: fromApi.trim() ? fromApi : init.content || "",
      };
      return acc;
    }

    acc[key] = {
      title: init.title,
      content: typeof init.content === "string" ? init.content : "",
    };
    return acc;
  }, {} as SectionsShape);
}

// ---------- Component ----------
export default function ResumeEditor({
  sections,
  setSections,
  initialSections,
  selectedTemplateId,
  resumeId,
  setResumeId,
  targetBadge,
  countryBadge,
}: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "doc">(
    "txt"
  );
  const [canExportPreview, setCanExportPreview] = useState<boolean>(!!resumeId);

  const [enabledSections, setEnabledSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.keys(initialSections).reduce((p, k) => ({ ...p, [k]: true }), {})
  );

  const [target, setTarget] = useState<string | undefined>(targetBadge);
  const [country, setCountry] = useState<string | undefined>(countryBadge);

  // Load existing resume or prefill
  useEffect(() => {
    let canceled = false;

    async function run() {
      try {
        if (resumeId) {
          const data = await getResume(resumeId);
          if (canceled) return;
          const merged = mergeFromApiSections(initialSections, data?.sections);
          setSections(merged);

          const ctx = data?.context || {};
          if (!targetBadge && ctx?.target_level) setTarget(ctx.target_level);
          if (!countryBadge && ctx?.country) setCountry(ctx.country);
        } else {
          const data = await prefillResume();
          if (canceled) return;
          const merged = mergeFromApiSections(initialSections, data?.sections);
          setSections(merged);

          const ctx = data?.context || {};
          if (!targetBadge && ctx?.target_level) setTarget(ctx.target_level);
          if (!countryBadge && ctx?.country) setCountry(ctx.country);
        }
      } catch (e: any) {
        console.error("load (resume/prefill) failed", e);
        toast({
          title: "Load failed",
          description: e?.message ?? "Failed to load data.",
          variant: "destructive",
        });
      }
    }

    run();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, initialSections, setSections]);

  const sectionIsEnabled = (key: string) => enabledSections[key] !== false;
  const setSectionEnabled = (key: string, on: boolean) =>
    setEnabledSections((p) => ({ ...p, [key]: on }));

  const totalWords = useMemo(() => {
    let sum = 0;
    for (const [key, val] of Object.entries(sections)) {
      if (!sectionIsEnabled(key)) continue;
      const content = (val as any)?.content;
      const display =
        content && typeof content === "string" && content.trim().length > 0
          ? content
          : (initialSections[key] as any)?.content || "";
      const count =
        typeof display === "string"
          ? display.split(/\s+/).filter(Boolean).length
          : 0;
      sum += count;
    }
    return sum;
  }, [sections, enabledSections, initialSections]);

  const updateSectionContent = (sectionKey: string, content: any) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] ?? {
          title: (initialSections[sectionKey] as any).title,
        }),
        content,
      },
    }));
  };
  function normalizeSectionsForSave(input: SectionsShape): SectionsShape {
    const out: SectionsShape = {};
    for (const [k, v] of Object.entries(input)) {
      const title = (v as any).title;
      const content = (v as any).content;

      if (k === PERSONAL_KEY && content && typeof content === "object") {
        // PERSONAL به رشته
        out[k] = {
          title,
          content: personalToMultiline(content as PersonalData),
        };
      } else {
        out[k] = { title, content };
      }
    }
    return out;
  }

  async function handleSaveSection(sectionKey: string) {
    try {
      if (!sectionIsEnabled(sectionKey)) {
        toast({
          title: "Disabled",
          description: `Section "${sectionKey}" is OFF.`,
        });
        return;
      }
      const one = sections[sectionKey] ?? {
        title: (initialSections[sectionKey] as any).title,
        content: "",
      };
      const normalizedOne = normalizeSectionsForSave({ [sectionKey]: one });
      const payload: SaveResumePayload = {
        templateId: selectedTemplateId ?? 0,
        title: "My Resume",
        sections: normalizedOne as any,
      };
      const res = await saveResume(payload, resumeId ?? null);
      const savedId =
        (res as any)?.id || (res as any)?.new_resume_id || resumeId || null;
      if (savedId && !resumeId) setResumeId(savedId);

      toast({ title: "Saved", description: `Section "${sectionKey}" saved.` });
    } catch (e: any) {
      toast({
        title: "Save section failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  }

  function handleReset() {
    const cleared: SectionsShape = Object.keys(initialSections).reduce(
      (acc, key) => {
        // ریست: متن پیش‌فرض برگردد تا دوباره داخل textarea بنشیند
        acc[key] = {
          title: (initialSections[key] as any).title,
          content:
            typeof (initialSections[key] as any).content === "string"
              ? (initialSections[key] as any).content
              : "",
        };
        return acc;
      },
      {} as SectionsShape
    );
    setSections(cleared);
  }

  function buildPayload(): SaveResumePayload {
    // ابتدا فقط سکشن‌های روشن را جمع می‌کنیم
    const raw: SectionsShape = Object.keys(initialSections).reduce(
      (acc, key) => {
        if (!sectionIsEnabled(key)) return acc;
        const cur = sections[key] ?? {
          title: (initialSections[key] as any).title,
          content: "",
        };
        acc[key] = {
          title: (cur as any).title || (initialSections[key] as any).title,
          content: (cur as any).content ?? "",
        };
        return acc;
      },
      {} as SectionsShape
    );

    // سپس نرمال‌سازی (تبدیل personal به رشته)
    const normalized = normalizeSectionsForSave(raw);

    return {
      templateId: selectedTemplateId ?? null,
      title: "My Resume",
      sections: normalized as any,
    };
  }

  async function handleSaveAndCreate() {
    try {
      const res = await saveResume(buildPayload(), resumeId ?? null);
      const savedId =
        (res as any)?.id || (res as any)?.new_resume_id || resumeId || null;
      if (savedId) setResumeId(savedId);
      setCanExportPreview(true);
      toast({
        title: "Saved",
        description: "Resume saved to My Documents → Resumes.",
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  }

  function toTxtBlob() {
    const lines: string[] = [];
    for (const [key, val] of Object.entries(sections)) {
      if (!sectionIsEnabled(key)) continue;
      const sTitle = (val as any)?.title ?? key;
      const c = (val as any)?.content;
      if (typeof c === "string") {
        const display =
          c.trim().length > 0
            ? c
            : (initialSections[key] as any)?.content || "";
        lines.push(`${String(sTitle).toUpperCase()}\n${display}\n`);
      } else {
        lines.push(
          `${String(sTitle).toUpperCase()}\n${JSON.stringify(c, null, 2)}\n`
        );
      }
    }
    return new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  }

  async function ensureSavedThenExport() {
    // فقط وقتی Preview/Export مجاز است اجازه بده، و هرگز خودش ذخیره نکند
    if (!canExportPreview || !resumeId) {
      toast({
        title: "Not ready",
        description: "First, use Save & Create to finalize your resume.",
      });
      return;
    }

    const apiFormat = exportFormat === "doc" ? "docx" : exportFormat;
    try {
      if (apiFormat === "txt") {
        const blob = toTxtBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await exportResume({
          resumeId: resumeId!,
          templateId: selectedTemplateId ?? undefined,
          format: apiFormat as "pdf" | "docx" | "txt",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume.${apiFormat}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  }

  function openPreview() {
    if (!resumeId || !canExportPreview) return;
    const t = selectedTemplateId ?? undefined;
    navigate(
      `/dashboard/resume/preview/${resumeId}${t ? `?templateId=${t}` : ""}`
    );
  }

  // ---- Small helpers ----
  const LineText = (props: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <Textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="min-h-10 text-[13px] md:text-sm bg-white text-gray-900 border border-gray-300
             focus-visible:ring-1 focus-visible:ring-gray-400
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
             dark:focus-visible:ring-gray-600"
    />
  );

  const SectionPreviewShell: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <div
      className="min-h-32 p-3 rounded border-2 border-dashed text-[13px] md:text-sm whitespace-pre-wrap bg-gray-50 text-gray-800 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
    >
      {children}
    </div>
  );

  // ---- Renderers ----
  // Personal (ساختاری، بدون Add New)
  const renderPersonal = (sectionKey: string, data?: PersonalData) => {
    const defaults = defaultPersonalFromInitial(initialSections);
    const model: PersonalData = {
      fullName: data?.fullName ?? defaults.fullName,
      headline: data?.headline ?? defaults.headline,
      phone: data?.phone ?? defaults.phone,
      email: data?.email ?? defaults.email,
      linkedin: data?.linkedin ?? defaults.linkedin,
    };
    const set = (patch: Partial<PersonalData>) =>
      updateSectionContent(sectionKey, { ...model, ...patch });

    const previewText = [
      model.fullName,
      model.headline,
      model.phone ? `Phone: ${model.phone}` : "",
      model.email ? `Email: ${model.email}` : "",
      model.linkedin ? `LinkedIn: ${model.linkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const wordCount = previewText.split(/\s+/).filter(Boolean).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          <LineText
            value={model.fullName}
            onChange={(v) => set({ fullName: v })}
            placeholder="Full Name"
          />
          <LineText
            value={model.headline}
            onChange={(v) => set({ headline: v })}
            placeholder="Headline / Title"
          />
          <LineText
            value={model.phone}
            onChange={(v) => set({ phone: v })}
            placeholder="Phone"
          />
          <LineText
            value={model.email}
            onChange={(v) => set({ email: v })}
            placeholder="Email"
          />
          <LineText
            value={model.linkedin}
            onChange={(v) => set({ linkedin: v })}
            placeholder="LinkedIn"
          />
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
          <SectionPreviewShell>{previewText}</SectionPreviewShell>
          <div className="flex items-center justify-between mt-2">
            <Button
              size="sm"
              className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
              style={{ backgroundColor: "#22c55e", color: "white" }}
              onClick={() => handleSaveSection(sectionKey)}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <span
              className="text-[12px] md:text-xs"
              style={{ color: "#9ca3af" }}
            >
              Word ~ {wordCount}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Generic item list renderer with custom defaults
  const renderItemList = (
    sectionKey: string,
    data: ItemListData | undefined,
    label: string,
    defaultItems: string[]
  ) => {
    const model: ItemListData =
      data && Array.isArray(data.items) ? data : { items: defaultItems };
    const set = (next: ItemListData) => updateSectionContent(sectionKey, next);
    const add = () => set({ items: [...model.items, `New ${label}`] });
    const del = (i: number) =>
      set({ items: model.items.filter((_, j) => j !== i) });
    const edit = (i: number, v: string) =>
      set({ items: model.items.map((t, j) => (j === i ? v : t)) });
    const preview = model.items.map((t) => `• ${t}`).join("\n");
    const words = preview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="space-y-2">
          {model.items.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <LineText
                value={t}
                onChange={(v) => edit(i, v)}
                placeholder={`${label} #${i + 1}`}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => del(i)}
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="h-8 px-2.5 text-xs"
            onClick={add}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
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
          <SectionPreviewShell>{preview}</SectionPreviewShell>
          <div className="flex items-center justify-between mt-2">
            <Button
              size="sm"
              className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
              style={{ backgroundColor: "#22c55e", color: "white" }}
              onClick={() => handleSaveSection(sectionKey)}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
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
    );
  };

  // Experience
  const renderExperience = (sectionKey: string, data?: ExperienceData) => {
    const xp: ExperienceData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_XP;
    const set = (next: ExperienceData) =>
      updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({
        blocks: [
          ...xp.blocks,
          {
            role: "New Item title",
            organization: "New Item University",
            location: "",
            startDate: "2020",
            endDate: "2024",
            bullets: [],
          },
        ],
      });
    const delBlock = (bi: number) =>
      set({ blocks: xp.blocks.filter((_, i) => i !== bi) });
    const editBlock = (bi: number, patch: Partial<ExperienceBlock>) =>
      set({
        blocks: xp.blocks.map((b, i) => (i === bi ? { ...b, ...patch } : b)),
      });

    const addBullet = (bi: number) =>
      set({
        blocks: xp.blocks.map((b, i) =>
          i === bi ? { ...b, bullets: [...b.bullets, "New Item"] } : b
        ),
      });
    const delBullet = (bi: number, idx: number) =>
      set({
        blocks: xp.blocks.map((b, i) =>
          i === bi
            ? { ...b, bullets: b.bullets.filter((_, j) => j !== idx) }
            : b
        ),
      });
    const editBullet = (bi: number, idx: number, v: string) =>
      set({
        blocks: xp.blocks.map((b, i) =>
          i === bi
            ? { ...b, bullets: b.bullets.map((t, j) => (j === idx ? v : t)) }
            : b
        ),
      });

    const previewText = xp.blocks
      .map((b) => {
        const header = `${b.role}\n${b.organization}${
          b.location ? ", " + b.location : ""
        }\n${b.startDate ?? ""} - ${b.endDate ?? ""}`;
        const bullets = b.bullets.map((t) => `• ${t}`).join("\n");
        return `${header}\n${bullets}`;
      })
      .join("\n\n");

    const wordCount = previewText.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {xp.blocks.map((b, bi) => (
          <div
            key={bi}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.role}
                  onChange={(v) => editBlock(bi, { role: v })}
                  placeholder="Role / Position"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(bi)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <LineText
                value={b.organization}
                onChange={(v) => editBlock(bi, { organization: v })}
                placeholder="Organization / University"
              />
              <LineText
                value={b.location ?? ""}
                onChange={(v) => editBlock(bi, { location: v })}
                placeholder="City, Country"
              />
              <div className="grid grid-cols-2 gap-2">
                <LineText
                  value={b.startDate ?? ""}
                  onChange={(v) => editBlock(bi, { startDate: v })}
                  placeholder="Start"
                />
                <LineText
                  value={b.endDate ?? ""}
                  onChange={(v) => editBlock(bi, { endDate: v })}
                  placeholder="End"
                />
              </div>
              {b.bullets.map((t, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <LineText
                    value={t}
                    onChange={(v) => editBullet(bi, idx, v)}
                    placeholder={`Bullet #${idx + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBullet(bi, idx)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="h-8 px-2.5 text-xs"
                onClick={() => addBullet(bi)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.role}</div>
                <div>
                  {b.organization}
                  {b.location ? `, ${b.location}` : ""}
                </div>
                <div>{(b.startDate ?? "") + " - " + (b.endDate ?? "")}</div>
                {b.bullets.map((t, idx) => (
                  <div key={idx}>• {t}</div>
                ))}
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
        <div className="text-right text-[12px]" style={{ color: "#9ca3af" }}>
          Word ~ {wordCount}
        </div>
      </div>
    );
  };

  // Education
  const renderEducation = (sectionKey: string, data?: EducationData) => {
    const edu: EducationData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_EDU;
    const set = (next: EducationData) => updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({ blocks: [...edu.blocks, { ...DEFAULT_EDU_BLOCK }] });
    const delBlock = (i: number) =>
      set({ blocks: edu.blocks.filter((_, j) => j !== i) });
    const editBlock = (i: number, patch: Partial<EducationBlock>) =>
      set({
        blocks: edu.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)),
      });

    return (
      <div className="space-y-6">
        {edu.blocks.map((b, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.title}
                  onChange={(v) => editBlock(i, { title: v })}
                  placeholder="Degree / Program title"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <LineText
                value={b.university}
                onChange={(v) => editBlock(i, { university: v })}
                placeholder="University"
              />
              <LineText
                value={b.description ?? ""}
                onChange={(v) => editBlock(i, { description: v })}
                placeholder='Dissertation / Description (e.g., "AI Algorithms ...")'
              />
              <div className="grid grid-cols-2 gap-2">
                <LineText
                  value={b.start ?? ""}
                  onChange={(v) => editBlock(i, { start: v })}
                  placeholder="Start year (e.g., 2020)"
                />
                <LineText
                  value={b.end ?? ""}
                  onChange={(v) => editBlock(i, { end: v })}
                  placeholder="End year (e.g., 2024)"
                />
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.title}</div>
                <div className="text-right">
                  {(b.start ?? "") + " - " + (b.end ?? "")}
                </div>
                <div>{b.university}</div>
                <div>{b.description}</div>
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
    );
  };

  const renderPublications = (sectionKey: string, data?: ItemListData) =>
    renderItemList(sectionKey, data, "Publication", DEFAULT_PUB_ITEMS);

  const renderCertSkills = (sectionKey: string, data?: CertData) => {
    const model: CertData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_CERT;
    const set = (next: CertData) => updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({ blocks: [...model.blocks, { ...DEFAULT_CERT_BLOCK }] });
    const delBlock = (i: number) =>
      set({ blocks: model.blocks.filter((_, j) => j !== i) });
    const editBlock = (i: number, patch: Partial<CertBlock>) =>
      set({
        blocks: model.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)),
      });

    const addItem = (i: number) =>
      set({
        blocks: model.blocks.map((b, j) =>
          j === i ? { ...b, skills: [...b.skills, "New Item"] } : b
        ),
      });
    const delItem = (i: number, k: number) =>
      set({
        blocks: model.blocks.map((b, j) =>
          j === i ? { ...b, skills: b.skills.filter((_, x) => x !== k) } : b
        ),
      });
    const editItem = (i: number, k: number, v: string) =>
      set({
        blocks: model.blocks.map((b, j) =>
          j === i
            ? { ...b, skills: b.skills.map((t, x) => (x === k ? v : t)) }
            : b
        ),
      });

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.header}
                  onChange={(v) => editBlock(i, { header: v })}
                  placeholder="Certification header"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {b.skills.map((t, k) => (
                <div key={k} className="flex items-start gap-2">
                  <LineText
                    value={t}
                    onChange={(v) => editItem(i, k, v)}
                    placeholder={`Skill #${k + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delItem(i, k)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="h-8 px-2.5 text-xs"
                onClick={() => addItem(i)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.header}</div>
                {b.skills.map((t, k) => (
                  <div key={k}>• {t}</div>
                ))}
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
    );
  };

  const renderAwards = (sectionKey: string, data?: AwardData) => {
    const model: AwardData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_AWARDS;
    const set = (next: AwardData) => updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({ blocks: [...model.blocks, { ...DEFAULT_AWARD_BLOCK }] });
    const delBlock = (i: number) =>
      set({ blocks: model.blocks.filter((_, j) => j !== i) });
    const editBlock = (i: number, patch: Partial<AwardBlock>) =>
      set({
        blocks: model.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)),
      });

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.title}
                  onChange={(v) => editBlock(i, { title: v })}
                  placeholder="Award title"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <LineText
                value={b.orgAndDate}
                onChange={(v) => editBlock(i, { orgAndDate: v })}
                placeholder="Organization , Date"
              />
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.title}</div>
                <div>{b.orgAndDate}</div>
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
    );
  };

  const renderMemberships = (sectionKey: string, data?: MembershipData) => {
    const model: MembershipData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_MEMBERSHIPS;
    const set = (next: MembershipData) =>
      updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({ blocks: [...model.blocks, { ...DEFAULT_MEMBERSHIP_BLOCK }] });
    const delBlock = (i: number) =>
      set({ blocks: model.blocks.filter((_, j) => j !== i) });
    const editBlock = (i: number, patch: Partial<MembershipBlock>) =>
      set({
        blocks: model.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)),
      });

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.organization}
                  onChange={(v) => editBlock(i, { organization: v })}
                  placeholder="Organization"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <LineText
                value={b.date}
                onChange={(v) => editBlock(i, { date: v })}
                placeholder="Date (e.g., September 2022 – Present)"
              />
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.organization}</div>
                <div>{b.date}</div>
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
    );
  };

  // References
  const renderReferences = (sectionKey: string, data?: ReferenceData) => {
    const model: ReferenceData =
      data && Array.isArray(data.blocks) ? data : DEFAULT_REFS;
    const set = (next: ReferenceData) => updateSectionContent(sectionKey, next);

    const addBlock = () =>
      set({ blocks: [...model.blocks, { ...DEFAULT_REF_BLOCK_2 }] });
    const delBlock = (i: number) =>
      set({ blocks: model.blocks.filter((_, j) => j !== i) });
    const editBlock = (i: number, patch: Partial<ReferenceBlock>) =>
      set({
        blocks: model.blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)),
      });

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <LineText
                  value={b.nameTitle}
                  onChange={(v) => editBlock(i, { nameTitle: v })}
                  placeholder="Name - Title"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => delBlock(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <LineText
                value={b.place}
                onChange={(v) => editBlock(i, { place: v })}
                placeholder="Place / Department"
              />
              <LineText
                value={b.contact}
                onChange={(v) => editBlock(i, { contact: v })}
                placeholder="Tel - Email"
              />
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
              <SectionPreviewShell>
                <div className="font-semibold">{b.nameTitle}</div>
                <div>{b.place}</div>
                <div>{b.contact}</div>
              </SectionPreviewShell>
              <div className="flex items-center justify-end mt-2">
                <Button
                  size="sm"
                  className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                  style={{ backgroundColor: "#22c55e", color: "white" }}
                  onClick={() => handleSaveSection(sectionKey)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="h-8 px-2.5 text-xs"
          onClick={addBlock}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
    );
  };

  // ---- UI ----
  return (
    <div
      className="rounded-xl border flex flex-col h-full min-h-0 overflow-hidden bg-white text-gray-900 border-gray-200
             dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
    >
      {/* Header */}
      <div
        className="p-4 border-b shrink-0 bg-white border-gray-200
                dark:bg-gray-900 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Target: {target ?? "—"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Country: {country ?? "—"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Words ~ {totalWords}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm bg-white text-gray-700 border-gray-300
             hover:bg-gray-50
             dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openPreview}
                      disabled={!canExportPreview || !resumeId}
                      className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm disabled:opacity-60 bg-white text-gray-700 border-gray-300
             hover:bg-gray-50
             dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      Preview
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!canExportPreview || !resumeId) && (
                  <TooltipContent>First, create and save</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      size="sm"
                      onClick={() => setExportOpen(true)}
                      disabled={!canExportPreview || !resumeId}
                      className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm disabled:opacity-60 bg-purple-600 hover:bg-purple-700 text-white
             dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </span>
                </TooltipTrigger>
                {(!canExportPreview || !resumeId) && (
                  <TooltipContent>First, create and save</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <Button
              size="sm"
              onClick={handleSaveAndCreate}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm text-gray-600   dark:bg-green-500 hover:bg-emerald-700 dark:text-white"
            >
              <Save className="w-4 h-4 mr-1" />
              Save & Create
            </Button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 md:min-h-0 md:overflow-y-auto p-4 space-y-4">
        {Object.entries(sections).map(([sectionKey, section]) => {
          const sTitle = (section as any).title;
          const enabled = sectionIsEnabled(sectionKey);
          const toggle = (on: boolean) => setSectionEnabled(sectionKey, on);
          const content = (section as any)?.content;

          const simpleDisplay =
            typeof content === "string" && content.trim().length > 0
              ? content
              : (initialSections[sectionKey] as any)?.content || "";
          const simpleWords = simpleDisplay
            ? simpleDisplay.split(/\s+/).filter(Boolean).length
            : 0;

          return (
            <div
              key={sectionKey}
              className="p-4 rounded-xl border bg-white border-gray-200
             dark:bg-gray-900 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-medium">{sTitle}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Essential section for academic resumes
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch checked={enabled} onCheckedChange={toggle} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {!enabled ? (
                <div className="text-sm text-gray-400">
                  This section is disabled.
                </div>
              ) : (
                <>
                  {sectionKey === PERSONAL_KEY &&
                    renderPersonal(sectionKey, content as PersonalData)}

                  {sectionKey === STRUCTURED_KEYS.interests &&
                    renderItemList(
                      sectionKey,
                      content as ItemListData,
                      "Interest",
                      DEFAULT_RI_ITEMS
                    )}
                  {sectionKey === STRUCTURED_KEYS.hobbies &&
                    renderItemList(
                      sectionKey,
                      content as ItemListData,
                      "Hobby",
                      DEFAULT_HOBBY_ITEMS
                    )}
                  {sectionKey === STRUCTURED_KEYS.publications &&
                    renderPublications(sectionKey, content as ItemListData)}
                  {sectionKey === STRUCTURED_KEYS.experience &&
                    renderExperience(sectionKey, content as ExperienceData)}
                  {sectionKey === STRUCTURED_KEYS.education &&
                    renderEducation(sectionKey, content as EducationData)}
                  {sectionKey === STRUCTURED_KEYS.skills &&
                    renderCertSkills(sectionKey, content as CertData)}
                  {sectionKey === STRUCTURED_KEYS.awards &&
                    renderAwards(sectionKey, content as AwardData)}
                  {sectionKey === STRUCTURED_KEYS.memberships &&
                    renderMemberships(sectionKey, content as MembershipData)}
                  {sectionKey === STRUCTURED_KEYS.refs &&
                    renderReferences(sectionKey, content as ReferenceData)}

                  {sectionKey !== PERSONAL_KEY &&
                    sectionKey !== STRUCTURED_KEYS.interests &&
                    sectionKey !== STRUCTURED_KEYS.hobbies &&
                    sectionKey !== STRUCTURED_KEYS.publications &&
                    sectionKey !== STRUCTURED_KEYS.experience &&
                    sectionKey !== STRUCTURED_KEYS.education &&
                    sectionKey !== STRUCTURED_KEYS.skills &&
                    sectionKey !== STRUCTURED_KEYS.awards &&
                    sectionKey !== STRUCTURED_KEYS.memberships &&
                    sectionKey !== STRUCTURED_KEYS.refs && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <Textarea
                            value={typeof content === "string" ? content : ""}
                            onChange={(e) =>
                              updateSectionContent(sectionKey, e.target.value)
                            }
                            placeholder={
                              (initialSections[sectionKey] as any)?.content ||
                              sTitle
                            }
                            className="min-h-28 md:min-h-32 text-[13px] md:text-sm bg-white text-gray-900 border border-gray-300
             focus-visible:ring-1 focus-visible:ring-gray-400
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
             dark:focus-visible:ring-gray-600"
                          />
                        </div>
                        <div>
                          <div className="mb-2">
                            <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                              Preview
                            </span>
                          </div>
                          <SectionPreviewShell>
                            {simpleDisplay}
                          </SectionPreviewShell>
                          <div className="flex items-center justify-between mt-2">
                            <Button
                              size="sm"
                              className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
                              style={{
                                backgroundColor: "#22c55e",
                                color: "white",
                              }}
                              onClick={() => handleSaveSection(sectionKey)}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <span className="text-[12px] md:text-xs text-gray-500 dark:text-gray-400">
                              Word ~ {simpleWords}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Resume</DialogTitle>
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
              <RadioGroupItem value="doc" id="exp-doc" />
              <UiLabel htmlFor="exp-doc">Word (.doc)</UiLabel>
            </div>
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await ensureSavedThenExport();
                setExportOpen(false);
              }}
              disabled={!canExportPreview || !resumeId}
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
