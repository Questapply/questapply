import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { RotateCcw, Save, Download, Trash2, Plus } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  prefillResume,
  exportResume,
  saveResume,
  SaveResumePayload,
  getResume,
} from "@/api/resumeApi";

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

/* ---------- Types ---------- */
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

type CertBlock = { header: string; skills: string[] };
type CertData = { blocks: CertBlock[] };

type AwardBlock = { title: string; orgAndDate: string };
type AwardData = { blocks: AwardBlock[] };

type MembershipBlock = { organization: string; date: string };
type MembershipData = { blocks: MembershipBlock[] };

type ReferenceBlock = { nameTitle: string; place: string; contact: string };
type ReferenceData = { blocks: ReferenceBlock[] };

type PersonalData = {
  fullName: string;
  headline: string;
  phone: string;
  email: string;
  linkedin: string;
};

/* ---------- Keys ---------- */
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

const PERSONAL_KEY = "personal";

/* ---------- Defaults ---------- */
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
  header: "Certified Information Systems Professional (CISSP) (ISC), Apr 2023",
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

/* ---------- Personal helpers ---------- */
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
  const raw = (initial[PERSONAL_KEY] as any)?.content ?? "";
  if (raw && typeof raw === "object") {
    const obj = raw as any;
    return {
      fullName: obj.fullName ?? obj.name ?? "",
      headline: obj.headline ?? obj.title ?? "",
      phone: obj.phone ?? "",
      email: obj.email ?? "",
      linkedin: obj.linkedin ?? "",
    };
  }

  // ✅ اگر رشته بود، مثل قبل خط‌به‌خط بخون
  const lines = String(raw).split(/\r?\n/);
  return {
    fullName: lines[0] ?? "",
    headline: lines[1] ?? "",
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
    if (emailRe.test(plain)) out.email = plain;
    else if (linkedRe.test(plain)) out.linkedin = plain;
    else if (phoneRe.test(l)) out.phone = plain;
    else if (!out.headline) out.headline = l;
  }
  return out;
}

/* ---------- Merge ---------- */
function mergeFromApiSections(
  initial: SectionsShape, // این می‌تونه baseline باشه
  apiSections: Record<string, any> | undefined | null
): SectionsShape {
  const src = apiSections || {};
  const personalDefault = defaultPersonalFromInitial(initial);

  return Object.keys(initial).reduce((acc, key) => {
    const init = initial[key] as any;
    const fromApi = src[key];

    // ---------- Personal ----------
    if (key === PERSONAL_KEY) {
      let model: PersonalData = { ...personalDefault };

      if (typeof fromApi === "string") {
        // personal به‌صورت multiline
        model = parsePersonalLoose(fromApi, personalDefault);
      } else if (fromApi && typeof fromApi === "object") {
        if (typeof fromApi.content === "string") {
          model = parsePersonalLoose(fromApi.content, personalDefault);
        } else if (fromApi.content && typeof fromApi.content === "object") {
          const c = fromApi.content as any;
          model = {
            fullName: c.fullName ?? c.name ?? personalDefault.fullName,
            headline: c.headline ?? c.title ?? personalDefault.headline,
            phone: c.phone ?? personalDefault.phone,
            email: c.email ?? personalDefault.email,
            linkedin: c.linkedin ?? personalDefault.linkedin,
          };
        } else {
          // از API آبجکت بدون content یا خالی
          // هیچ‌چیز نکن؛ همون personalDefault باقی بمونه
        }
      } else {
        // از API چیزی نیومده → مقدار موجود در init را نگه دار (object یا multiline)
        const c = init?.content;
        if (c && typeof c === "object") {
          model = {
            fullName: c.fullName ?? c.name ?? personalDefault.fullName,
            headline: c.headline ?? c.title ?? personalDefault.headline,
            phone: c.phone ?? personalDefault.phone,
            email: c.email ?? personalDefault.email,
            linkedin: c.linkedin ?? personalDefault.linkedin,
          };
        } else if (typeof c === "string" && c.trim()) {
          model = parsePersonalLoose(c, personalDefault);
        }
      }

      acc[key] = {
        title:
          (fromApi && typeof fromApi.title === "string" && fromApi.title.trim()
            ? fromApi.title
            : init.title) ?? "Personal Informations",
        content: model,
      };
      return acc;
    }

    // ---------- سایر سکشن‌ها ----------
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
        // ⬅️ اگر رشته‌ی خالی از API آمد، مقدار init.content را دست‌نخورده نگه دار
        content: isEmptyString ? init.content : val,
      };
      return acc;
    }

    if (typeof fromApi === "string") {
      acc[key] = {
        title: init.title,
        // ⬅️ اگر رشته‌ی API خالی بود، مقدار قبلی (init.content) را نگه دار
        content: fromApi.trim() ? fromApi : init.content,
      };
      return acc;
    }

    // ⬅️ هیچ چیزی از API برای این سکشن نیامده: مقدار موجود را بدون تغییر نگه دار
    acc[key] = { title: init.title, content: init.content };
    return acc;
  }, {} as SectionsShape);
}

/* ---------- Save helpers ---------- */
function stripPlaceholders(items: string[]): string[] {
  return (items || [])
    .map((s) => String(s || "").trim())
    .filter((s) => s && !/^new\s+/i.test(s));
}

function stringForSave(
  sectionKey: string,
  value: string,
  initialSections: SectionsShape
): string {
  const init = ((initialSections[sectionKey] as any)?.content ?? "") as string;
  const v = String(value ?? "").trim();
  const i = String(init ?? "").trim();
  return v === i ? "" : v;
}

function normalizeSectionsForSave(
  input: SectionsShape,
  initialSections: SectionsShape
): SectionsShape {
  const out: SectionsShape = {};
  for (const [k, v] of Object.entries(input)) {
    const title = (v as any).title;
    const content = (v as any).content;

    if (k === PERSONAL_KEY && content && typeof content === "object") {
      out[k] = { title, content: personalToMultiline(content as PersonalData) };
    } else if (typeof content === "string") {
      out[k] = { title, content: stringForSave(k, content, initialSections) };
    } else if (content && typeof content === "object") {
      if ("items" in content && Array.isArray((content as any).items)) {
        out[k] = {
          title,
          content: { items: stripPlaceholders((content as any).items) },
        };
      } else if (
        "blocks" in content &&
        Array.isArray((content as any).blocks)
      ) {
        const cleanedBlocks = (content as any).blocks.map((b: any) => {
          const clone = { ...b };
          if (Array.isArray(clone.bullets))
            clone.bullets = stripPlaceholders(clone.bullets);
          if (Array.isArray(clone.skills))
            clone.skills = stripPlaceholders(clone.skills);
          return clone;
        });
        out[k] = { title, content: { blocks: cleanedBlocks } };
      } else out[k] = { title, content };
    } else out[k] = { title, content };
  }
  return out;
}
function normalizeOneSectionForSave(
  sectionKey: string,
  one: SectionValue
): SectionsShape {
  const title = (one as any).title;
  const content = (one as any).content;

  if (sectionKey === PERSONAL_KEY && content && typeof content === "object") {
    // پرسونال را همیشه به multiline تبدیل کن
    return {
      [sectionKey]: {
        title,
        content: personalToMultiline(content as PersonalData),
      },
    };
  }

  if (typeof content === "string") {
    // رشته را همان‌طور که هست بفرست (بدون مقایسه با initial)
    return { [sectionKey]: { title, content } };
  }

  if (content && typeof content === "object") {
    // اگر items/blocks دارد، فقط placeholderها را تمیز کن ولی محتوا را کامل بفرست
    if ("items" in content && Array.isArray((content as any).items)) {
      const cleaned = stripPlaceholders((content as any).items);
      return { [sectionKey]: { title, content: { items: cleaned } } };
    }
    if ("blocks" in content && Array.isArray((content as any).blocks)) {
      const cleanedBlocks = (content as any).blocks.map((b: any) => {
        const clone = { ...b };
        if (Array.isArray(clone.bullets))
          clone.bullets = stripPlaceholders(clone.bullets);
        if (Array.isArray(clone.skills))
          clone.skills = stripPlaceholders(clone.skills);
        return clone;
      });
      return { [sectionKey]: { title, content: { blocks: cleanedBlocks } } };
    }
    return { [sectionKey]: { title, content } };
  }

  return { [sectionKey]: { title, content } };
}

function cleanOneSectionForSave(sectionKey: string, section: any) {
  // هرچه در state هست را بدون diff می‌فرستیم؛ فقط placeholderهای لیست‌ها را حذف می‌کنیم
  const title = section?.title ?? "";
  const content = section?.content;

  // Personal: آبجکت را به multiline تبدیل کن تا با بک‌اند سازگار بماند
  if (sectionKey === PERSONAL_KEY && content && typeof content === "object") {
    return { title, content: personalToMultiline(content) };
  }

  if (typeof content === "string") {
    return { title, content: content }; // همینی که هست
  }

  if (content && typeof content === "object") {
    // items
    if (Array.isArray((content as any).items)) {
      const items = (content as any).items
        .map((s: any) => String(s || "").trim())
        .filter((s: string) => s && !/^new\s+/i.test(s));
      return { title, content: { items } };
    }
    // blocks
    if (Array.isArray((content as any).blocks)) {
      const blocks = (content as any).blocks.map((b: any) => {
        const clone = { ...b };
        if (Array.isArray(clone.bullets)) {
          clone.bullets = clone.bullets
            .map((s: any) => String(s || "").trim())
            .filter((s: string) => s && !/^new\s+/i.test(s));
        }
        if (Array.isArray(clone.skills)) {
          clone.skills = clone.skills
            .map((s: any) => String(s || "").trim())
            .filter((s: string) => s && !/^new\s+/i.test(s));
        }
        return clone;
      });
      return { title, content: { blocks } };
    }
  }

  // سایر ساختارها
  return { title, content };
}

async function ensureResumeIdUtil(
  selectedTemplateId: number | null,
  resumeId: string | null,
  setResumeId: (id: string | null) => void
): Promise<string | null> {
  if (resumeId) return resumeId;
  const payload: SaveResumePayload = {
    templateId: selectedTemplateId ?? null,
    title: "My Resume",
    sections: {} as any,
  };
  const res = await saveResume(payload, null);
  const savedId = (res as any)?.id || (res as any)?.new_resume_id || null;
  if (savedId) setResumeId(savedId);
  return savedId;
}

/* ---------- Component ---------- */
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

  const [enabledSections, setEnabledSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.keys(initialSections).reduce((p, k) => ({ ...p, [k]: true }), {})
  );

  const [target, setTarget] = useState<string | undefined>(targetBadge);
  const [country, setCountry] = useState<string | undefined>(countryBadge);
  const baselineRef = React.useRef<SectionsShape | null>(null);
  useEffect(() => {
    let canceled = false;
    async function run() {
      try {
        if (resumeId) {
          const data = await getResume(resumeId);
          if (canceled) return;

          // ⬅️ به‌جای initialSections از baseline استفاده کن
          const base = baselineRef.current ?? initialSections;
          const merged = mergeFromApiSections(base, data?.sections);

          setSections(merged);
          // ⬅️ baseline را هم آپدیت کن تا دفعه‌های بعدی هم همین رفتار حفظ شود
          baselineRef.current = merged;

          const ctx = data?.context || {};
          if (!targetBadge && ctx?.target_level) setTarget(ctx.target_level);
          if (!countryBadge && ctx?.country) setCountry(ctx.country);
        } else {
          const data = await prefillResume();
          if (canceled) return;

          const merged = mergeFromApiSections(initialSections, data?.sections);
          setSections(merged);

          // ⬅️ اولین بار baseline از روی prefill پر می‌شود
          baselineRef.current = merged;

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
      const cleaned = cleanOneSectionForSave(sectionKey, one);
      const payload: SaveResumePayload = {
        templateId: selectedTemplateId ?? null,
        title: "My Resume",
        sections: { [sectionKey]: cleaned } as any, // ← فقط همین سکشن
      };
      const ensuredId = await ensureResumeIdUtil(
        selectedTemplateId,
        resumeId,
        setResumeId
      );
      const res = await saveResume(payload, ensuredId ?? null);
      const savedId =
        (res as any)?.id || (res as any)?.new_resume_id || ensuredId || null;
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
    const normalized = normalizeSectionsForSave(raw, initialSections);
    return {
      templateId: selectedTemplateId ?? null,
      title: "My Resume",
      sections: normalized as any,
    };
  }

  async function handleSaveAndCreate() {
    try {
      const ensuredId = await ensureResumeIdUtil(
        selectedTemplateId,
        resumeId,
        setResumeId
      );
      const res = await saveResume(buildPayload(), ensuredId ?? null);
      const savedId =
        (res as any)?.id || (res as any)?.new_resume_id || ensuredId || null;
      if (savedId) setResumeId(savedId);
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
    try {
      const ensuredId = await ensureResumeIdUtil(
        selectedTemplateId,
        resumeId,
        setResumeId
      );
      const apiFormat = exportFormat === "doc" ? "docx" : exportFormat;
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
          resumeId: (ensuredId ?? resumeId)!,
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

  async function openPreview() {
    try {
      const ensuredId = await ensureResumeIdUtil(
        selectedTemplateId,
        resumeId,
        setResumeId
      );
      const t = selectedTemplateId ?? undefined;
      navigate(
        `/dashboard/resume/preview/${ensuredId || resumeId}${
          t ? `?templateId=${t}` : ""
        }`
      );
    } catch {
      toast({
        title: "Preview error",
        description: "Could not open preview.",
        variant: "destructive",
      });
    }
  }

  /* ---------- Small UI helpers (Input-row) ---------- */
  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="col-span-8">{children}</div>
    </div>
  );

  const LineInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    type?: string;
  }) => (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 text-[13px] md:text-sm bg-white text-gray-900 border-gray-300
      focus-visible:ring-1 focus-visible:ring-gray-400
      dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus-visible:ring-gray-600"
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

  /* ---------- Renderers (INLINE editors) ---------- */

  // Personal
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
      model.email ? `Email: ${model.email}` : "",
      model.phone ? `Phone: ${model.phone}` : "",
      model.linkedin ? `LinkedIn: ${model.linkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const wordCount = previewText.split(/\s+/).filter(Boolean).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="md:w-full md:h-56 p-2 border rounded-md">
          <div className="space-y-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Full Name:
              </label>
              <input
                value={model.fullName}
                onChange={(e) => set({ fullName: e.target.value })}
                placeholder="Your full name"
                className="w-full bg-transparent border-0  
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
              />
            </div>
            <div className="flex justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Headline / Title:
                </label>
                <input
                  value={model.headline}
                  onChange={(e) => set({ headline: e.target.value })}
                  placeholder="e.g., Computer Science PhD Candidate"
                  className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  value={model.email}
                  onChange={(e) => set({ email: e.target.value })}
                  placeholder="e.g., you@example.com"
                  className="w-full bg-transparent border-0  
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Phone:
                </label>
                <input
                  value={model.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  LinkedIn:
                </label>
                <input
                  value={model.linkedin}
                  onChange={(e) => set({ linkedin: e.target.value })}
                  placeholder="e.g., linkedin.com/in/username"
                  className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
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
            <span className="text-[12px] md:text-xs text-gray-500 dark:text-gray-400">
              Word ~ {wordCount}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Reusable ItemList (Research Interests / Hobbies / Publications)
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:w-ful md:h-56 p-2 border rounded-md overflow-y-auto">
          <div className="space-y-4">
            {model.items.map((t, i) => {
              const id = `${label.toLowerCase()}-${i}`;
              const placeholder =
                label === "Publication"
                  ? "e.g., Smith, J. (2024). Title… Journal, 12(3), 45–60."
                  : label === "Interest"
                  ? "e.g., Machine Learning for Healthcare"
                  : "e.g., Competitive Programming";

              return (
                <div key={i} className="w-full">
                  <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-500 mb-1"
                  >
                    #{i + 1} {label}
                  </label>

                  <div className="flex gap-2 w-full">
                    <input
                      id={id}
                      value={t}
                      onChange={(e) => edit(i, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent border-0 
                       focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => del(i)}
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="h-8 px-2.5 text-xs"
              onClick={add}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>
        </div>
        <div>
          <div className="mb-2">
            <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
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
            <span className="text-[12px] md:text-xs text-gray-500 dark:text-gray-400">
              Word ~ {words}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Experience (Blocks)
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
          <div key={bi} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-ful md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Role / Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Role / Position
                  </label>
                  <input
                    value={b.role}
                    onChange={(e) => editBlock(bi, { role: e.target.value })}
                    placeholder="e.g., Research Assistant"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Organization / University */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Organization / University
                  </label>
                  <input
                    value={b.organization}
                    onChange={(e) =>
                      editBlock(bi, { organization: e.target.value })
                    }
                    placeholder="e.g., Tech University"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Location
                  </label>
                  <input
                    value={b.location ?? ""}
                    onChange={(e) =>
                      editBlock(bi, { location: e.target.value })
                    }
                    placeholder="e.g., Boston, MA"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Start / End (LineInput باقی بماند) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Start
                    </label>
                    <LineInput
                      value={b.startDate ?? ""}
                      onChange={(v) => editBlock(bi, { startDate: v })}
                      placeholder="e.g., Sep 2021"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      End
                    </label>
                    <LineInput
                      value={b.endDate ?? ""}
                      onChange={(v) => editBlock(bi, { endDate: v })}
                      placeholder="e.g., Present"
                    />
                  </div>
                </div>

                {/* Bullets */}
                {b.bullets.map((t, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Bullet #{idx + 1}
                    </label>
                    <div className="flex gap-2 w-full">
                      <input
                        value={t}
                        onChange={(e) => editBullet(bi, idx, e.target.value)}
                        placeholder="e.g., Improved X by Y%"
                        className="w-full bg-transparent border-0 
                     focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => delBullet(bi, idx)}
                        title="Delete bullet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(bi)}
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {wordCount}
                </div>
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

  // Education (Blocks)
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
    const eduPreview = edu.blocks
      .map(
        (b) =>
          `${b.title}\n${b.start ?? ""} - ${b.end ?? ""}\n${b.university}\n${
            b.description ?? ""
          }`
      )
      .join("\n\n");
    const eduWords = eduPreview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {edu.blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-ful md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Degree / Program title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Degree / Program title
                  </label>
                  <input
                    value={b.title}
                    onChange={(e) => editBlock(i, { title: e.target.value })}
                    placeholder="e.g., PhD in Computer Science"
                    className="w-full bg-transparent border-0  
                       focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    University
                  </label>
                  <input
                    value={b.university}
                    onChange={(e) =>
                      editBlock(i, { university: e.target.value })
                    }
                    placeholder="e.g., MIT"
                    className="w-full bg-transparent border-0 
                       focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Dissertation / Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Dissertation / Description
                  </label>
                  <input
                    value={b.description ?? ""}
                    onChange={(e) =>
                      editBlock(i, { description: e.target.value })
                    }
                    placeholder="e.g., “AI Algorithms for …”"
                    className="w-full bg-transparent border-0 
                       focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Start / End years */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Start year
                    </label>
                    <LineInput
                      value={b.start ?? ""}
                      onChange={(v) => editBlock(i, { start: v })}
                      placeholder="e.g., 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      End year
                    </label>
                    <LineInput
                      value={b.end ?? ""}
                      onChange={(v) => editBlock(i, { end: v })}
                      placeholder="e.g., 2024"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(i)}
                    title="Delete education block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Preview (راست) */}
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {eduWords}
                </div>
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

  // Certifications & Skills
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
    const certPreview = model.blocks
      .map((b) =>
        [b.header, ...(b.skills || []).map((s) => `• ${s}`)].join("\n")
      )
      .join("\n\n");
    const certWords = certPreview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-full  md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Certification header */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Certification header
                  </label>
                  <input
                    value={b.header}
                    onChange={(e) => editBlock(i, { header: e.target.value })}
                    placeholder="e.g., CISSP (ISC) — Apr 2023"
                    className="w-full bg-transparent border-0 
                       focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Skills */}
                {b.skills.map((t, k) => (
                  <div key={k} className="w-full">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Skill #{k + 1}
                    </label>
                    <div className="flex gap-2 w-full">
                      <input
                        value={t}
                        onChange={(e) => editItem(i, k, e.target.value)}
                        placeholder="e.g., Python, TensorFlow, C++"
                        className="w-full bg-transparent border-0 
                           focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => delItem(i, k)}
                        title="Delete skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(i)}
                    title="Delete certification block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Preview (راست) */}
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                  Preview
                </span>
              </div>
              <SectionPreviewShell>
                <div className="font-semibold">{b.header}</div>
                {b.skills.map((t, k) => (
                  <div key={k}>• {t}</div>
                ))}
              </SectionPreviewShell>
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {certWords}
                </div>
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
    const awardsPreview = model.blocks
      .map((b) => `${b.title}\n${b.orgAndDate}`)
      .join("\n\n");
    const awardsWords = awardsPreview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-full  md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Award title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Award title
                  </label>
                  <input
                    value={b.title}
                    onChange={(e) => editBlock(i, { title: e.target.value })}
                    placeholder="e.g., Outstanding Thesis Award"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Organization , Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Organization , Date
                  </label>
                  <input
                    value={b.orgAndDate}
                    onChange={(e) =>
                      editBlock(i, { orgAndDate: e.target.value })
                    }
                    placeholder="e.g., Tech University, May 2024"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(i)}
                    title="Delete award block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                  Preview
                </span>
              </div>
              <SectionPreviewShell>
                <div className="font-semibold">{b.title}</div>
                <div>{b.orgAndDate}</div>
              </SectionPreviewShell>
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {awardsWords}
                </div>
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
    const memPreview = model.blocks
      .map((b) => `${b.organization}\n${b.date}`)
      .join("\n\n");
    const memWords = memPreview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-full md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Organization */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Organization
                  </label>
                  <input
                    value={b.organization}
                    onChange={(e) =>
                      editBlock(i, { organization: e.target.value })
                    }
                    placeholder="e.g., IEEE"
                    className="w-full bg-transparent border-0
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Date (LineInput باقی بماند) */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Date
                  </label>
                  <input
                    value={b.date}
                    onChange={(e) => editBlock(i, { date: e.target.value })}
                    placeholder="e.g., Sep 2022 – Present"
                    className="w-full bg-transparent border-0  
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(i)}
                    title="Delete membership block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                  Preview
                </span>
              </div>
              <SectionPreviewShell>
                <div className="font-semibold">{b.organization}</div>
                <div>{b.date}</div>
              </SectionPreviewShell>
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {memWords}
                </div>
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
    const refPreview = model.blocks
      .map((b) => `${b.nameTitle}\n${b.place}\n${b.contact}`)
      .join("\n\n");
    const refWords = refPreview.split(/\s+/).filter(Boolean).length;

    return (
      <div className="space-y-6">
        {model.blocks.map((b, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:w-fuul md:h-56 p-2 border rounded-md overflow-y-auto">
              <div className="space-y-4">
                {/* Name – Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Name – Title:
                  </label>
                  <input
                    value={b.nameTitle}
                    onChange={(e) =>
                      editBlock(i, { nameTitle: e.target.value })
                    }
                    placeholder="e.g., Dr. Sarah Thompson — Associate Professor"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Place / Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Place / Department:
                  </label>
                  <input
                    value={b.place}
                    onChange={(e) => editBlock(i, { place: e.target.value })}
                    placeholder="e.g., Dept. of CS, MIT"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                {/* Tel – Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tel – Email:
                  </label>
                  <input
                    value={b.contact}
                    onChange={(e) => editBlock(i, { contact: e.target.value })}
                    placeholder="e.g., +1 (617) 253-1234 — sarah@mit.edu"
                    className="w-full bg-transparent border-0 
                 focus:ring-0 focus:outline-none rounded-none px-0 py-2 text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => delBlock(i)}
                    title="Delete reference block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="text-[12px] md:text-sm font-medium text-gray-500 dark:text-gray-400">
                  Preview
                </span>
              </div>
              <SectionPreviewShell>
                <div className="font-semibold">{b.nameTitle}</div>
                <div>{b.place}</div>
                <div>{b.contact}</div>
              </SectionPreviewShell>
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
                <div className="text-right text-[12px] text-gray-500 dark:text-gray-400">
                  Word ~ {refWords}
                </div>
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

  /* ---------- UI ---------- */
  return (
    <div
      className="rounded-xl border flex flex-col h-full min-h-0 overflow-hidden bg-white text-gray-900 border-gray-200
             dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
    >
      {/* Header */}
      <div className="p-4 border-b shrink-0 bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Target: {target ?? "—"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Country: {country ?? "—"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              Words ~ {totalWords}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>

            {/* همیشه فعال */}
            <Button
              size="sm"
              variant="outline"
              onClick={openPreview}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              Preview
            </Button>

            <Button
              size="sm"
              onClick={() => setExportOpen(true)}
              className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>

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
              className="p-4 rounded-xl border bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700"
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

                  {/* Summary و سایر متن‌های ساده (Summary باید Textarea بماند) */}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="min-h-28 md:min-h-32 text-[13px] md:text-sm bg-white text-gray-900 border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:focus-visible:ring-gray-600"
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
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
