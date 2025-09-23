import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  FileText,
  Calendar,
  Send,
  RotateCcw,
  Download,
  Save as SaveIcon,
  Sparkles,
  Scissors,
  Expand,
  Eye,
  X,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";
import LORMethodModal from "./LORMethodModal";
import RecommenderRequestForm from "./RecommenderRequestForm";

import {
  saveLorSections,
  exportLor,
  getSelectedTemplateId,
} from "../../api/lorApi";

/* ================= Types ================= */
type Tone = "formal" | "friendly" | "story";
type MessageSender = "user" | "ai";
interface Message {
  sender: MessageSender;
  content: string;
}

type SectionKey =
  | "greeting-recipient"
  | "candidate"
  | "recommender"
  | "general-assessment"
  | "comparison-with-peers"
  | "skills-and-traits"
  | "discussing-school"
  | "final-endorsement"
  | "date";

interface Section {
  title: string;
  hint: string;
  content: string;
}
type SectionsMap = Record<SectionKey, Section>;
type Props = {
  onSaved?: () => void;
  // ... سایر پراپ‌ها
};

interface Snapshot {
  id: string;
  timestamp: Date;
  sections: SectionsMap;
}

/* =============== Initial =============== */
const initialSections: SectionsMap = {
  "greeting-recipient": {
    title: "Greeting & Recipient",
    hint: "Recipient + opening (40–80 words)",
    content:
      "Dear [Admissions Committee], I am pleased to recommend [Candidate Name] for consideration at [Institution / Program].",
  },
  candidate: {
    title: "Candidate",
    hint: "Who/relationship basics (60–100 words)",
    content:
      "I have known [Candidate Name] for [time period] as [relationship], during which they consistently demonstrated curiosity, discipline, and integrity.",
  },
  recommender: {
    title: "Recommender",
    hint: "Your name, title, affiliation, contact (40–80 words)",
    content:
      "Sincerely,\n[Your Full Name]\n[Title], [Department / Organization]\n[Email] • [Phone]",
  },
  "general-assessment": {
    title: "General Assessment",
    hint: "Context + impression (100–150 words)",
    content:
      "[Candidate Name] approaches complex assignments with a thoughtful, methodical process and takes initiative when challenges arise.",
  },
  "comparison-with-peers": {
    title: "Comparison with Peers",
    hint: "Ranking/percentile + basis (60–100 words)",
    content:
      "Compared to cohorts I have supervised in the past five years, [Candidate Name] is within the top 5–10% for analytical rigor and reliability.",
  },
  "skills-and-traits": {
    title: "Skills & Traits",
    hint: "3–5 traits + examples (120–160 words)",
    content:
      "[Candidate Name] stands out for ownership, collaboration, and clear communication. They coordinated a 4-person team to deliver a capstone project two weeks early while maintaining quality.",
  },
  "discussing-school": {
    title: "Program / School Fit",
    hint: "Tailor to program (80–120 words)",
    content:
      "[Candidate Name] aligns well with your program’s emphasis on rigor and cross-disciplinary collaboration.",
  },
  "final-endorsement": {
    title: "Final Endorsement",
    hint: "Strength + closing (50–90 words)",
    content:
      "In conclusion, I strongly recommend [Candidate Name] for your program. I am confident they will contribute meaningfully to your scholarly community.",
  },
  date: {
    title: "Date",
    hint: "Submission date",
    content: "",
  },
};

/* =============== Component =============== */
const MyLORs: React.FC<Props> = ({ onSaved }) => {
  // flow
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [recommendationMethod, setRecommendationMethod] = useState<
    "self" | "other" | null
  >(null);
  const [showRecommenderForm, setShowRecommenderForm] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // sections
  const [sections, setSections] = useState<SectionsMap>({ ...initialSections });

  // chat (left)
  const [tone, setTone] = useState<Tone>("formal");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      content:
        "I can Improve / Expand / Shorten any section. Try: ‘Expand skills’.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // meta
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const dateRef = useRef<HTMLInputElement>(null);
  const livePreviewRef = useRef<HTMLDivElement>(null);

  // export modal
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "docx">(
    "txt"
  );
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const total = (Object.entries(sections) as [SectionKey, Section][]).reduce(
      (sum, [k, s]) => {
        const text = k === "date" ? dateRef.current?.value ?? "" : s.content;
        return sum + (text ? text.split(/\s+/).filter(Boolean).length : 0);
      },
      0
    );
    setWordCount(total);
  }, [sections]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const savedLORs = [
    { id: 1, name: "Jane Smith", institution: "MIT", date: "May 10, 2025" },
    { id: 2, name: "John Doe", institution: "Stanford", date: "May 5, 2025" },
  ];

  /* =============== helpers =============== */
  const updateSectionContent = (key: SectionKey, value: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], content: value },
    }));
  };

  const applySectionChange = (
    key: SectionKey,
    mode: "improve" | "shorten" | "expand"
  ) => {
    if (key === "date") return;
    setSections((prev) => {
      const s = prev[key];
      if (!s) return prev;
      let newContent = s.content || "";
      switch (mode) {
        case "shorten": {
          const words = newContent.split(/\s+/);
          const target = Math.max(18, Math.floor(words.length * 0.7));
          newContent =
            words.slice(0, target).join(" ") +
            (words.length > target ? "..." : "");
          break;
        }
        case "expand": {
          if (key === "skills-and-traits") {
            newContent +=
              " For example, they led a 4-person team to ship a capstone project two weeks early while maintaining high quality.";
          } else if (key === "comparison-with-peers") {
            newContent +=
              " Across multiple cohorts, I would place them within the top 5% of students I have mentored.";
          } else if (key === "final-endorsement") {
            newContent +=
              " I recommend them without reservation and would be pleased to provide any further information.";
          } else if (key === "discussing-school") {
            newContent +=
              " Their background shows strong alignment with rigorous research training and collaboration.";
          } else {
            newContent += " This additional context further clarifies my view.";
          }
          break;
        }
        case "improve":
        default: {
          if (tone === "friendly") {
            newContent = newContent
              .replace(/\bAdditionally,/g, "Plus,")
              .replace(/\bFurthermore,/g, "What's more,");
          } else if (tone === "story") {
            newContent =
              (newContent
                ? "From my vantage point, "
                : "From my vantage point, ") + newContent;
          }
        }
      }
      return { ...prev, [key]: { ...s, content: newContent } };
    });
  };

  const processMessage = (text: string) => {
    const lower = text.toLowerCase();
    let target: SectionKey = "skills-and-traits";
    if (lower.includes("general")) target = "general-assessment";
    else if (lower.includes("peer") || lower.includes("compare"))
      target = "comparison-with-peers";
    else if (lower.includes("fit") || lower.includes("program"))
      target = "discussing-school";
    else if (lower.includes("endorsement") || lower.includes("conclusion"))
      target = "final-endorsement";
    else if (lower.includes("recipient") || lower.includes("greeting"))
      target = "greeting-recipient";
    else if (lower.includes("candidate")) target = "candidate";
    else if (lower.includes("recommender")) target = "recommender";

    let mode: "improve" | "shorten" | "expand" = "improve";
    if (lower.includes("shorten")) mode = "shorten";
    else if (lower.includes("expand")) mode = "expand";

    applySectionChange(target, mode);
    return `✅ ${mode} applied on **${target}**.`;
  };

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { sender: "user", content: text }]);
    setTimeout(() => {
      const response = processMessage(text);
      setMessages((prev) => [...prev, { sender: "ai", content: response }]);
    }, 400);
    setInputValue("");
  };

  const saveSnapshot = () => {
    const snap: Snapshot = {
      id: `LOR-${String(snapshots.length + 1).padStart(3, "0")}`,
      timestamp: new Date(),
      sections: { ...sections },
    };
    setSnapshots((p) => [...p, snap]);
    toast({ title: "Snapshot saved", description: `${snap.id} created.` });
  };

  const resetDraft = () => {
    setSections({ ...initialSections });
    if (dateRef.current) dateRef.current.value = "";
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: "🔄 Draft reset." },
    ]);
  };

  const scrollToPreview = () => {
    livePreviewRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- SAVE (per-section / all) ---------- */

  type SaveSection = { title: string; content: string };

  function normalizedForSave(k?: SectionKey): Record<string, SaveSection> {
    const obj: Record<string, SaveSection> = {};
    if (!k) {
      (Object.entries(sections) as [SectionKey, Section][]).forEach(
        ([key, s]) => {
          obj[key] = {
            title: String(s.title ?? "").trim() || key,
            content:
              key === "date"
                ? dateRef.current?.value || ""
                : String(s.content ?? ""),
          };
        }
      );
    } else {
      const s = sections[k];
      obj[k] = {
        title: String(s.title ?? "").trim() || k,
        content:
          k === "date" ? dateRef.current?.value || "" : String(s.content ?? ""),
      };
    }
    return obj;
  }

  const saveOne = async (key: SectionKey, section: Section) => {
    try {
      await saveLorSections({
        [key]: { title: section.title, content: section.content },
      });
      toast({ title: "Saved", description: `${section.title} saved.` });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Error",
        variant: "destructive",
      });
    }
  };

  function toStructuredAndPlain(
    sections: Record<string, { title: string; content: string }>
  ) {
    const order = [
      "greeting-recipient",
      "candidate",
      "recommender",
      "general-assessment",
      "comparison-with-peers",
      "skills-and-traits",
      "discussing-school",
      "final-endorsement",
      "date",
    ];
    const keys = Object.keys(sections).sort((a, b) => {
      const ia = order.indexOf(a),
        ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    const structured = keys.map((k) => ({
      title: sections[k]?.title || k,
      content: sections[k]?.content || "",
    }));
    const plain = structured
      .map((s) => `${s.title.toUpperCase()}\n${(s.content || "").trim()}\n`)
      .join("\n");
    return { structured, plain };
  }

  const saveAll = async () => {
    try {
      const allSectionsObj = normalizedForSave(); // { [key]: {title, content(with date)} }

      await saveLorSections(allSectionsObj);

      const { structured, plain } = toStructuredAndPlain(allSectionsObj);
      const templateId = getSelectedTemplateId();

      try {
        await (exportLor as any)(
          "pdf",
          structured,
          plain,
          { title: "LOR", template_id: templateId ?? undefined, return: "json" } // JSON-mode
        );
      } catch {
        await exportLor("pdf", structured, plain, {
          title: "LOR",
          template_id: templateId ?? undefined,
        } as any);
      }

      onSaved?.();

      toast({
        title: "Saved",
        description: "LOR saved and created. Check My Documents.",
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message || "Error",
        variant: "destructive",
      });
    }
  };

  /* ---------- EXPORT (modal + download) ---------- */
  const openExport = () => setShowExport(true);
  const closeExport = () => setShowExport(false);

  const doExport = async () => {
    try {
      if (!exportFormat) {
        toast({
          title: "Select format",
          description: "Please choose a format to export.",
        });
        return;
      }

      setDownloading(true);

      // ترتیب سکشن‌ها (مثل تب‌های PHP)
      const order: SectionKey[] = [
        "greeting-recipient",
        "candidate",
        "recommender",
        "general-assessment",
        "comparison-with-peers",
        "skills-and-traits",
        "discussing-school",
        "final-endorsement",
        "date",
      ];

      // ساخت payload سکشن‌ها (date از input)
      const sectionsPayload: Record<
        string,
        { title: string; content: string }
      > = {};
      const dateVal = (dateRef.current?.value || "").trim();

      order.forEach((k) => {
        const s = sections[k];
        sectionsPayload[k] = {
          title: s.title,
          content: k === "date" ? dateVal : s.content || "",
        };
      });

      // قالب انتخاب‌شده از Sample
      const templateId = getSelectedTemplateId();

      // عنوان فایل خروجی
      const safeTitle = sections["candidate"]?.content?.match(
        /\[?([A-Za-z][A-Za-z\s'-]{1,80})\]?/
      )
        ? `LOR-${RegExp.$1.replace(/\s+/g, "_")}`
        : "LOR";

      // فراخوانی API صادرات (دانلود مستقیم)
      const { blob, filename } = await exportLor(
        exportFormat, // "pdf" | "docx" | "txt"
        sectionsPayload, // sections
        undefined, // content (اختیاری، نداریم)
        { template_id: templateId ?? undefined, title: safeTitle }
      );

      // دانلود فایل
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${safeTitle}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      closeExport?.();
      toast({
        title: "Exported",
        description: `Downloaded ${filename || `${safeTitle}.${exportFormat}`}`,
      });
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message || "Request error",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  /* =============== UI (list vs builder) =============== */
  if (showRecommenderForm) {
    return (
      <RecommenderRequestForm
        onBack={() => {
          setShowRecommenderForm(false);
          setShowMethodModal(true);
        }}
        onComplete={() => {
          setShowRecommenderForm(false);
          setIsCreatingNew(true);
        }}
      />
    );
  }

  if (!isCreatingNew) {
    return (
      <div className="animate-fade-in">
        <LORMethodModal
          isOpen={showMethodModal}
          onClose={() => setShowMethodModal(false)}
          onSelect={(m) => {
            setRecommendationMethod(m);
            setShowMethodModal(false);
            if (m === "other") setShowRecommenderForm(true);
            else setIsCreatingNew(true);
          }}
        />
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Saved LORs</h2>
          <Button
            onClick={() => setShowMethodModal(true)}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
          >
            Create New Letter
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedLORs.map((lor) => (
            <div
              key={lor.id}
              className="border rounded-lg p-4 hover:shadow-md transition-all dark:border-gray-700"
            >
              <div>
                <h3 className="font-medium">
                  {lor.name} - {lor.institution}
                </h3>
                <p className="text-sm text-gray-500">Created on {lor.date}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // === Builder (2/3) ===
  return (
    <div className="dir-ltr min-h-screen">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:h-[calc(100vh-70px)] lg:overflow-hidden">
          {/* LEFT – Chat (1/3) */}
          <div
            className="lg:col-span-1 rounded-xl border bg-white/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 flex flex-col
                        lg:h-full lg:min-h-0 lg:overflow-hidden"
          >
            {/* هدر چت (فقط مخصوص ستون چپ) */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  {(["formal", "friendly", "story"] as Tone[]).map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={tone === t ? "default" : "outline"}
                      className={
                        tone === t
                          ? "bg-teal-600 hover:bg-teal-600 text-white"
                          : "border-gray-300"
                      }
                      onClick={() => setTone(t)}
                    >
                      {t === "formal"
                        ? "Formal"
                        : t === "friendly"
                        ? "Friendly"
                        : "Narrative"}
                    </Button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="text-xs"
                  style={{ background: "#7c3aed", color: "white" }}
                  onClick={saveSnapshot}
                >
                  Save Snapshot
                </Button>
              </div>
            </div>

            {/* پیام‌ها – دسکتاپ اسکرول داخلی؛ موبایل طبیبعی */}
            <div className="flex-1 p-4 space-y-3 lg:min-h-0 lg:overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      m.sender === "user"
                        ? "rounded-br-none bg-teal-600 text-white"
                        : "rounded-bl-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* اکشن‌های سریع + ورودی چت */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Quick Actions:
                </div>
                {[
                  {
                    label: "Improve Skills & Traits",
                    key: "skills-and-traits" as SectionKey,
                    mode: "improve" as const,
                  },
                  {
                    label: "Expand Program Fit",
                    key: "discussing-school" as SectionKey,
                    mode: "expand" as const,
                  },
                  {
                    label: "Shorten Final Endorsement",
                    key: "final-endorsement" as SectionKey,
                    mode: "shorten" as const,
                  },
                ].map((a) => (
                  <Button
                    key={a.label}
                    variant="outline"
                    size="sm"
                    className="  text-xs gap-2 m-1"
                    onClick={() => {
                      applySectionChange(a.key, a.mode);
                      setMessages((prev) => [
                        ...prev,
                        {
                          sender: "ai",
                          content: `✅ ${a.mode} applied on **${a.key}**.`,
                        },
                      ]);
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="e.g., Expand skills or Shorten final endorsement"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white/80 dark:bg-gray-900/50 border-gray-300"
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="px-3 bg-teal-600 hover:bg-teal-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT – Sections (2/3) */}
          <div
            className="lg:col-span-2 rounded-xl border bg-white/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 flex flex-col
                        lg:h-full lg:min-h-0 lg:overflow-hidden"
          >
            {/* هدر ابزارها ـــ فقط روی ستون راست (2/3) */}
            <div
              className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800
                          bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            >
              <div className="px-4 py-3 sm:px-4 sm:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-[11px] px-2 py-1">
                    Target: Computer Science (PhD)
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] px-2 py-1">
                    Country: USA
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] px-2 py-1">
                    Words ~ {wordCount}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={resetDraft}
                    title="Reset"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={scrollToPreview}
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                    onClick={openExport}
                    title="Export"
                  >
                    <Download className="w-3 h-3" /> Export
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-600 dark:bg-green-500 text-white"
                    onClick={saveAll}
                    title="Save & Create"
                  >
                    <SaveIcon className="w-3 h-3" /> Save &amp; Create
                  </Button>
                </div>
              </div>
            </div>

            {/* بدنهٔ ستون راست: دسکتاپ اسکرول داخلی؛ موبایل عادی */}
            <div className="px-4 py-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto space-y-4">
              {(Object.entries(sections) as [SectionKey, Section][])
                .sort(([aKey], [bKey]) => {
                  const order = [
                    "greeting-recipient",
                    "candidate",
                    "recommender",
                    "general-assessment",
                    "comparison-with-peers",
                    "skills-and-traits",
                    "discussing-school",
                    "final-endorsement",
                    "date",
                  ] as const;

                  const ia = order.indexOf(aKey as any);
                  const ib = order.indexOf(bKey as any);

                  if (ia === -1 && ib === -1)
                    return (aKey as string).localeCompare(bKey as string);
                  if (ia === -1) return 1;
                  if (ib === -1) return -1;
                  return ia - ib;
                })
                .map(([key, section]) => (
                  <div
                    key={key}
                    className="border rounded-xl p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  >
                    {/* هدر هر سکشن */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="flex items-center flex-wrap gap-2 md:gap-3">
                        <h3 className="font-medium">{section.title}</h3>
                        <span className="text-xs text-gray-500">
                          {section.hint}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      </div>

                      {key !== "date" && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          <Button
                            onClick={() => applySectionChange(key, "improve")}
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Improve
                          </Button>
                          <Button
                            onClick={() => applySectionChange(key, "shorten")}
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                          >
                            <Scissors className="w-3 h-3" /> Shorten
                          </Button>
                          <Button
                            onClick={() => applySectionChange(key, "expand")}
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                          >
                            <Expand className="w-3 h-3" /> Expand
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* فرم/پیش‌نمایش هر سکشن */}
                    {key === "date" ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="relative">
                          <label
                            htmlFor="rec-date"
                            className="block text-xs font-medium mb-1"
                          >
                            Date
                          </label>
                          <Input id="rec-date" type="date" ref={dateRef} />
                          <Calendar className="absolute right-3 top-9 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                        <div className="space-y-2">
                          <div className="min-h-[120px] p-3 rounded-lg border-2 border-dashed text-sm text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                            <div className="text-xs font-medium mb-2 text-gray-500">
                              Preview:
                            </div>
                            <div>Date: {dateRef.current?.value || "—"}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              className="text-xs bg-emerald-600 dark:bg-green-500 text-white"
                              onClick={() => saveOne(key, section)}
                            >
                              <SaveIcon className="w-3 h-3 mr-2" /> Save
                            </Button>
                            <span className="text-xs text-gray-500">
                              Word ~ {dateRef.current?.value ? 1 : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Textarea
                            value={section.content}
                            onChange={(e) =>
                              updateSectionContent(key, e.target.value)
                            }
                            className="min-h-[120px] resize-none text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="min-h-[120px] p-3 rounded-lg border-2 border-dashed text-sm text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                            <div className="text-xs font-medium mb-2 text-gray-500">
                              Preview:
                            </div>
                            <div className="whitespace-pre-line">
                              {section.content}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Button
                              size="sm"
                              className="text-xs bg-emerald-600 dark:bg-green-500 text-white"
                              onClick={() => saveOne(key, section)}
                            >
                              <SaveIcon className="w-3 h-3 mr-2" /> Save
                            </Button>
                            <span className="text-xs text-gray-500">
                              Word ~{" "}
                              {
                                section.content.split(/\s+/).filter(Boolean)
                                  .length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              {/* Live Preview */}
              <div
                ref={livePreviewRef}
                className="border rounded-xl p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Live Preview</h4>
                  <span className="text-xs text-gray-500">Auto-updates</span>
                </div>
                <div className="text-sm space-y-3 text-gray-800 dark:text-gray-200">
                  {dateRef.current?.value && (
                    <div className="text-gray-600">
                      Date: {dateRef.current.value}
                    </div>
                  )}
                  {(Object.entries(sections) as [SectionKey, Section][])
                    .filter(([k]) => k !== "date")
                    .map(([_, s]) => (
                      <div key={s.title}>
                        <div className="font-medium">{s.title}</div>
                        <div className="whitespace-pre-line">{s.content}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal (بدون تغییر منطقی) */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[420px] rounded-lg bg-[#0b1220] text-white p-5 shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Export LOR</h3>
              <button
                onClick={closeExport}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="lor-export"
                  checked={exportFormat === "txt"}
                  onChange={() => setExportFormat("txt")}
                />
                <span>Text (.txt)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="lor-export"
                  checked={exportFormat === "pdf"}
                  onChange={() => setExportFormat("pdf")}
                />
                <span>PDF (.pdf)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="lor-export"
                  checked={exportFormat === "docx"}
                  onChange={() => setExportFormat("docx")}
                />
                <span>Word (.docx)</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeExport}>
                Cancel
              </Button>
              <Button
                onClick={doExport}
                disabled={downloading}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
              >
                {downloading ? "Downloading..." : "Download"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLORs;
