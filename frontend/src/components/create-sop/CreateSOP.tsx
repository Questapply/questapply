import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { motion } from "framer-motion";
import MySOP from "./MySOP";
import {
  BookOpen,
  FileText,
  Bot,
  Wand,
  University,
  Trophy,
  FileSearch,
  Clipboard,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  Scissors,
  Expand,
  Target,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import ProgressCircle from "../ui/progress-circle";
import { Badge } from "../ui/badge";
import SampleSopGallery from "@/components/create-sop/SampleSopGallery";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
/* =========================================================
   TABS (kept as in original — label remains "My SOP")
   ========================================================= */
const sopTabs = [
  { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
  { id: "samples", name: "Samples", icon: <Clipboard className="w-4 h-4" /> },
  { id: "createSOP", name: "My SOP", icon: <FileText className="w-4 h-4" /> },
  {
    id: "aiImprovement",
    name: "AI Improvement",
    icon: <Wand className="w-4 h-4" />,
  },
  {
    id: "universityMatch",
    name: "Match with University",
    icon: <University className="w-4 h-4" />,
  },
  {
    id: "successStories",
    name: "Success Stories",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    id: "aiHumanizer",
    name: "AI Humanizer",
    icon: <Bot className="w-4 h-4" />,
  },
];

/* =========================================================
   Guidance steps (used by Guidance tab from original code)
   ========================================================= */
const sopSteps = [
  {
    id: 1,
    title: "Country / Program / Level / University",
    icon: "🎓",
    description:
      "What country are you applying to, and what specific program and level of study are you pursuing at the university?",
  },
  {
    id: 2,
    title: "Hook",
    icon: "🔍",
    description:
      "Create a compelling opening that grabs the reader's attention and introduces your academic passion.",
  },
  {
    id: 3,
    title: "Journey",
    icon: "🚀",
    description:
      "Describe your academic and professional journey that led you to this specific field of interest.",
  },
  {
    id: 4,
    title: "Motivation",
    icon: "⭐",
    description:
      "Explain what motivates you to pursue this specific program and institution.",
  },
  {
    id: 5,
    title: "Goals",
    icon: "🎯",
    description:
      "Outline your short-term and long-term goals after completing this program.",
  },
];

/* =========================================================
   CreateSOPBuilder (NEW) — from your second code
   Only used inside TabsContent value="createSOP" (My SOP)
   ========================================================= */

const initialSections = {
  hook: {
    title: "Hook",
    hint: "80–120 words, problem/motivation",
    content:
      "In a world increasingly driven by data and artificial intelligence, I find myself captivated by the intersection of technology and human understanding. My journey into computer science began with a simple question: how can we build systems that not only process information but truly comprehend and assist human decision-making? This fundamental curiosity has shaped my academic pursuits and research interests, leading me to seek advanced study in machine learning and natural language processing.",
  },
  segue: {
    title: "Segue",
    hint: "bridge to academic background",
    content:
      "This passion for bridging technology and human cognition naturally led me to pursue rigorous academic training in computer science, where I could explore both the theoretical foundations and practical applications of intelligent systems.",
  },
  achievements: {
    title: "Academic Achievements",
    hint: "3–5 impactful items with numbers",
    content:
      "During my undergraduate studies, I maintained a 3.8 GPA while conducting research that resulted in 2 peer-reviewed publications in top-tier conferences. I led a team of 5 students in developing an innovative natural language processing system that achieved 94% accuracy in sentiment analysis, outperforming existing models by 12%. Additionally, I was awarded the Dean's List recognition for 6 consecutive semesters and received the Outstanding Computer Science Student Award in my senior year.",
  },
  extracurricular: {
    title: "Extracurricular Activities",
    hint: "volunteering/teaching/etc.",
    content:
      "Beyond academics, I dedicated 200+ hours to teaching programming to underrepresented youth through the Code for All initiative. I also served as president of the AI Ethics Society, organizing symposiums that attracted over 300 participants from industry and academia. My volunteer work includes mentoring 15 high school students in STEM fields and contributing to open-source machine learning libraries used by over 10,000 developers worldwide.",
  },
  publications: {
    title: "Publications",
    hint: "concise if any",
    content:
      "Smith, J., & Doe, A. (2023). 'Advancing Natural Language Understanding Through Contextual Embeddings.' Proceedings of the International Conference on Machine Learning, 45(2), 123-135.\n\nDoe, A., Johnson, K., & Smith, J. (2023). 'Ethical Considerations in Large Language Model Deployment.' Journal of AI Ethics, 8(3), 67-89.",
  },
  problems: {
    title: "Problems in Background",
    hint: "challenges/lessons learned",
    content:
      "One significant challenge I encountered was during my research internship when our initial approach to bias detection in language models consistently failed to meet accuracy benchmarks. Rather than abandoning the project, I spent months studying fairness metrics and collaborated with social scientists to understand the nuanced nature of algorithmic bias. This experience taught me the importance of interdisciplinary collaboration and resilient problem-solving, ultimately leading to a breakthrough that became the foundation for my thesis work.",
  },
  whySchool: {
    title: "Why This School?",
    hint: "labs/professors/fit",
    content:
      "Stanford's AI Lab, particularly Dr. Sarah Chen's work on interpretable machine learning, aligns perfectly with my research interests in developing transparent AI systems. The Human-Centered AI Institute's interdisciplinary approach, combining computer science with cognitive psychology and ethics, provides the exact environment I need to pursue my goal of creating AI that genuinely serves human needs. Additionally, the opportunity to collaborate with the Stanford NLP Group and access to cutting-edge computational resources would be invaluable for my research.",
  },
  goal: {
    title: "Your Goal/Conclusion",
    hint: "short-term/long-term goals",
    content:
      "In the short term, I aim to contribute to groundbreaking research in explainable AI while completing my PhD at Stanford. My long-term vision is to establish a research lab focused on developing AI systems that are not only powerful but also transparent, fair, and aligned with human values. I believe that through rigorous academic training and collaborative research, I can help shape the future of artificial intelligence to benefit society as a whole.",
  },
};

type MessageSender = "user" | "ai";
interface Message {
  sender: MessageSender;
  content: string;
}
interface Snapshot {
  id: string;
  timestamp: Date;
  sections: typeof initialSections;
}

const CreateSOPBuilder = () => {
  const [tone, setTone] = useState<"formal" | "friendly" | "story">("formal");
  const [sections, setSections] = useState(initialSections);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      content:
        "Welcome! I'm here to help you create an outstanding Statement of Purpose. You can ask me to improve specific sections, adjust the tone, or make any other changes you'd like.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalWords = Object.values(sections).reduce((total, section) => {
      return (
        total +
        (section.content
          ? section.content.split(" ").filter((w) => w.length > 0).length
          : 0)
      );
    }, 0);
    setWordCount(totalWords);
  }, [sections]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processMessage = (message: string): string => {
    const lower = message.toLowerCase();

    let target = "segue";
    if (lower.includes("hook")) target = "hook";
    else if (lower.includes("achievement") || lower.includes("academic"))
      target = "achievements";
    else if (lower.includes("publication")) target = "publications";
    else if (lower.includes("why") || lower.includes("school"))
      target = "whySchool";
    else if (lower.includes("goal") || lower.includes("conclusion"))
      target = "goal";
    else if (lower.includes("extracurricular")) target = "extracurricular";
    else if (lower.includes("problem") || lower.includes("challenge"))
      target = "problems";

    let mode = "improve";
    if (lower.includes("shorten")) mode = "shorten";
    else if (lower.includes("expand")) mode = "expand";
    else if (lower.includes("align")) mode = "align";

    applySectionChange(target, mode);
    return `✅ ${mode} applied on **${target}**.`;
  };

  const applySectionChange = (sectionKey: string, mode: string) => {
    setSections((prev) => {
      const section = (prev as any)[sectionKey];
      if (!section) return prev;

      let newContent = section.content;

      switch (mode) {
        case "shorten": {
          const words = newContent.split(" ");
          const targetLength = Math.max(18, Math.floor(words.length * 0.7));
          newContent =
            words.slice(0, targetLength).join(" ") +
            (words.length > targetLength ? "..." : "");
          break;
        }
        case "expand":
          if (sectionKey === "hook") {
            newContent +=
              " This early experience revealed the profound impact that well-designed technology can have on human potential.";
          } else if (sectionKey === "achievements") {
            newContent +=
              " These experiences have prepared me to tackle complex research challenges in graduate school.";
          } else {
            newContent +=
              " This foundation has shaped my research perspective and academic approach.";
          }
          break;
        case "align":
          if (sectionKey === "whySchool") {
            newContent +=
              " I am particularly excited about the opportunity to work with Professor Johnson's lab on neural network interpretability research.";
          }
          break;
        case "improve":
        default:
          if (tone === "friendly") {
            newContent = newContent
              .replace(/Furthermore,/g, "What's more,")
              .replace(/Additionally,/g, "I'm also excited that");
          } else if (tone === "story") {
            newContent =
              "Looking back, " +
              newContent.charAt(0).toLowerCase() +
              newContent.slice(1);
          }
          break;
      }

      return {
        ...prev,
        [sectionKey]: {
          ...section,
          content: newContent,
        },
      };
    });
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", content: inputValue }]);
    setTimeout(() => {
      const response = processMessage(inputValue);
      setMessages((prev) => [...prev, { sender: "ai", content: response }]);
    }, 600);
    setInputValue("");
  };

  const handleQuickAction = (action: string) => {
    let targetSection = "";
    let mode = "improve";

    if (action === "Improve Hook") {
      targetSection = "hook";
      mode = "improve";
    } else if (action === "Expand Why This School") {
      targetSection = "whySchool";
      mode = "expand";
    } else if (action === "Shorten Publications") {
      targetSection = "publications";
      mode = "shorten";
    }

    applySectionChange(targetSection, mode);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: `✅ ${mode} applied on **${targetSection}**.` },
    ]);
  };

  const saveSnapshot = () => {
    const snapshot: Snapshot = {
      id: `SOP-${String(snapshots.length + 1).padStart(3, "0")}`,
      timestamp: new Date(),
      sections: { ...sections },
    };
    setSnapshots((prev) => [...prev, snapshot]);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: `📸 Snapshot saved as ${snapshot.id}` },
    ]);
  };

  const resetSections = () => {
    setSections(initialSections);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: "🔄 Draft reset." },
    ]);
  };

  const exportTxt = () => {
    let content = "# Statement of Purpose Draft\n\n";
    Object.entries(sections).forEach(([_, section]) => {
      content += `## ${section.title}\n\n${section.content}\n\n`;
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sop_draft.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSectionContent = (sectionKey: string, newContent: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof typeof prev],
        content: newContent,
      },
    }));
  };

  const getSectionWordCount = (content: string) =>
    content ? content.split(" ").filter((w) => w.length > 0).length : 0;

  return (
    <div
      className="min-h-screen"
      style={
        {
          "--sop-bg": "#0b1020",
          "--sop-panel": "#111827",
          "--sop-card": "#0e1526",
          "--sop-border": "#25324a",
          "--sop-chip": "#0b213a",
          "--sop-text": "#e5e7eb",
          "--sop-sub": "#9ca3af",
          "--sop-brand": "#7c3aed",
          "--sop-ok": "#22c55e",
          "--sop-warn": "#f59e0b",
        } as React.CSSProperties
      }
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: "var(--sop-panel)",
          borderColor: "var(--sop-border)",
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1"
              style={{
                backgroundColor: "var(--sop-chip)",
                color: "var(--sop-text)",
              }}
            >
              QuestApply • AI Demo
            </Badge>
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--sop-text)" }}
            >
              Create SOP
            </h1>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div
        className="max-w-7xl mx-auto p-6"
        style={{ backgroundColor: "var(--sop-bg)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-120px)]">
          {/* LEFT - Chat Panel */}
          <div
            className="lg:col-span-1 rounded-xl border flex flex-col h-full"
            style={{
              backgroundColor: "var(--sop-panel)",
              borderColor: "var(--sop-border)",
            }}
          >
            {/* Chat Header */}
            <div
              className="p-4 border-b"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <Select
                  value={tone}
                  onValueChange={(v: "formal" | "friendly" | "story") =>
                    setTone(v)
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    style={{
                      backgroundColor: "var(--sop-card)",
                      borderColor: "var(--sop-border)",
                      color: "var(--sop-text)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Tone: Formal</SelectItem>
                    <SelectItem value="friendly">Tone: Friendly</SelectItem>
                    <SelectItem value="story">Tone: Narrative</SelectItem>
                  </SelectContent>
                </Select>

                <Badge
                  className="text-xs whitespace-nowrap px-2 py-1"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    color: "var(--sop-text)",
                  }}
                >
                  Draft v1 • Skeleton
                </Badge>
              </div>

              <Button
                onClick={saveSnapshot}
                variant="outline"
                size="sm"
                className="w-full"
                style={{
                  borderColor: "var(--sop-border)",
                  color: "var(--sop-text)",
                }}
              >
                Save Snapshot
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                    }`}
                    style={{
                      backgroundColor:
                        m.sender === "user"
                          ? "var(--sop-brand)"
                          : "var(--sop-card)",
                      color: "var(--sop-text)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div
              className="p-4 border-t space-y-2"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div
                className="text-xs font-medium mb-2"
                style={{ color: "var(--sop-sub)" }}
              >
                Quick Actions:
              </div>
              {[
                "Improve Hook",
                "Expand Why This School",
                "Shorten Publications",
              ].map((action) => (
                <Button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  style={{
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-sub)",
                  }}
                >
                  {action}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div
              className="p-4 border-t"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="e.g., Improve Academic Achievements with metrics"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "var(--sop-card)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="px-3"
                  style={{ backgroundColor: "var(--sop-brand)" }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT - Document Panel */}
          <div
            className="lg:col-span-2 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "var(--sop-panel)",
              borderColor: "var(--sop-border)",
            }}
          >
            {/* Toolbar */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                >
                  Target: CS Ph.D. • Stanford
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                >
                  Words ~ {wordCount}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={resetSections}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  style={{
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-sub)",
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
                <Button
                  onClick={exportTxt}
                  size="sm"
                  className="gap-1"
                  style={{ backgroundColor: "var(--sop-brand)" }}
                >
                  <Download className="w-3 h-3" />
                  Export .txt
                </Button>
              </div>
            </div>

            {/* Sections */}
            <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4">
              {Object.entries(sections).map(([key, section]) => (
                <div
                  key={key}
                  className="border rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--sop-card)",
                    borderColor: "var(--sop-border)",
                  }}
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-medium"
                        style={{ color: "var(--sop-text)" }}
                      >
                        {section.title}
                      </h3>
                      <span
                        className="text-xs"
                        style={{ color: "var(--sop-sub)" }}
                      >
                        {section.hint}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: "var(--sop-chip)",
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-text)",
                        }}
                      >
                        {key}
                      </Badge>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        onClick={() => applySectionChange(key, "improve")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Improve
                      </Button>
                      <Button
                        onClick={() => applySectionChange(key, "shorten")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Scissors className="w-3 h-3" />
                        Shorten
                      </Button>
                      <Button
                        onClick={() => applySectionChange(key, "expand")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Expand className="w-3 h-3" />
                        Expand
                      </Button>
                      {key === "whySchool" && (
                        <Button
                          onClick={() => applySectionChange(key, "align")}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          style={{
                            borderColor: "var(--sop-border)",
                            color: "var(--sop-sub)",
                          }}
                        >
                          <Target className="w-3 h-3" />
                          Align to School
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSectionContent(key, e.target.value)
                        }
                        className="min-h[120px] min-h-[120px] resize-none text-sm"
                        style={{
                          backgroundColor: "var(--sop-bg)",
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-text)",
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div
                        className="min-h-[120px] p-3 rounded-lg border-2 border-dashed text-sm"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <div
                          className="text-xs font-medium mb-2"
                          style={{ color: "var(--sop-sub)" }}
                        >
                          Preview:
                        </div>
                        {section.content}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          style={{
                            borderColor: "var(--sop-border)",
                            color: "var(--sop-sub)",
                          }}
                        >
                          Save
                        </Button>
                        <span
                          className="text-xs"
                          style={{ color: "var(--sop-sub)" }}
                        >
                          Word ~ {getSectionWordCount(section.content)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Main CreateSOP (keeps all other tabs unchanged)
   Only the My SOP tab renders <CreateSOPBuilder />
   ========================================================= */

interface SOPSample {
  id: number;
  file: string;
  program_id?: number;
  level?: string;
  date?: string;
  name?: string;
  description?: string;
  point?: boolean;
}

const CreateSOP = () => {
  const [fetchedTemplates, setFetchedTemplates] = useState<SOPSample[]>([]);
  const [activeTab, setActiveTab] = useState("guidance");
  const [selectedDegree, setSelectedDegree] = useState("All");
  const [selectedField, setSelectedField] = useState("All");
  const [filteredSamples, setFilteredSamples] = useState<SOPSample[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoadingApi(false);
      return;
    }
    setIsLoadingApi(true);
    try {
      const response = await fetch(`${API_URL}/sop/sample`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data: SOPSample[] = await response.json();
      const processedData = data.map((t) => ({
        ...t,
        name: t.name || `SOP Sample ${t.id}`,
        description: t.description || "A professional SOP Sample.",
        popular: t.point || 0,
      }));
      setFetchedTemplates(processedData);
      setApiError(null);
      setFilteredSamples(processedData);
    } catch (err: any) {
      setApiError(
        err?.message || "An unknown error occurred while fetching templates."
      );
      setFetchedTemplates([]);
      setFilteredSamples([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filterSamples = (degree: string, field: string) => {
    let filtered = fetchedTemplates;
    if (degree !== "All") filtered = filtered.filter((s) => s.level === degree);
    if (field !== "All") filtered = filtered.filter((s) => s.level === field);
    setFilteredSamples(filtered);
  };

  return (
    <div className="animate-fade-in">
      <Tabs
        defaultValue="guidance"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="relative border-b border-gray-200 dark:border-gray-700">
          <TabsList className="w-full h-auto px-2 py-1 bg-transparent overflow-x-auto flex justify-start">
            {sopTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                `}
              >
                {tab.icon}
                {tab.name}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
                    layoutId="activeTabSOP"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* My SOP (REPLACED) */}
        <TabsContent value="createSOP" className="m-0">
          <MySOP />
        </TabsContent>

        {/* Guidance Tab (unchanged) */}
        <TabsContent value="guidance" className="m-0">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-4">
                  How to Write an Effective Statement of Purpose
                </h2>
                <p className="text-lg">
                  A compelling Statement of Purpose (SOP) is your opportunity to
                  showcase your academic achievements, research interests, and
                  career goals to admission committees. Follow the structure
                  below to create a powerful SOP that stands out.
                </p>
              </div>

              <div className="mt-8 space-y-12">
                {sopSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="absolute left-0 top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      {step.id}
                    </div>

                    <div className="ml-16">
                      <div className="flex mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <div className="pl-20">
                        <p className="text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < sopSteps.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700 h-16" />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg"
                  onClick={() => setActiveTab("createSOP")}
                >
                  Create My Statement of Purpose
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Samples Tab (unchanged, keeps API + filters) */}
        <TabsContent value="samples" className="m-0">
          <SampleSopGallery />
        </TabsContent>

        {/* AI Improvement (unchanged) */}
        <TabsContent value="aiImprovement" className="m-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered SOP Improvement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our AI will analyze your Statement of Purpose and suggest
              improvements for clarity, structure, and impact.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Your Original SOP
                </h3>
                <Textarea
                  className="min-h-[400px] font-serif text-base"
                  placeholder="Paste your SOP here..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  AI Improved Version
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[400px] font-serif text-base bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-gray-500 dark:text-gray-400">
                    AI suggestions will appear here after you submit your SOP...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-4">
              <Button variant="outline" size="lg" className="px-6">
                Preview Changes
              </Button>
              <Button
                size="lg"
                className="px-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                <Wand className="h-5 w-5 mr-2" />
                Improve My SOP
              </Button>
            </div>

            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                AI Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={85} size="md" color="blue" />
                  <h4 className="text-lg font-medium mt-4">Clarity Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Your SOP is clear and well-structured
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={68} size="md" color="purple" />
                  <h4 className="text-lg font-medium mt-4">Uniqueness Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Adds some unique elements but could be more distinctive
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={92} size="md" color="green" />
                  <h4 className="text-lg font-medium mt-4">Relevance Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Excellent alignment with program requirements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* University Match (unchanged placeholder) */}
        <TabsContent value="universityMatch" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                University Match Coming Soon
              </h2>
              <p className="text-gray-600">
                Match your SOP with specific university requirements.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Success Stories (unchanged placeholder) */}
        <TabsContent value="successStories" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Success Stories Coming Soon
              </h2>
              <p className="text-gray-600">
                Read about successful applications and their SOPs.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* AI Humanizer (unchanged placeholder) */}
        <TabsContent value="aiHumanizer" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                AI Humanizer Coming Soon
              </h2>
              <p className="text-gray-600">
                Make your AI-generated content sound more human.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateSOP;
