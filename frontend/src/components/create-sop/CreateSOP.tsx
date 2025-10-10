import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { motion } from "framer-motion";
import { BookOpen, FileText, Bot, Wand, Clipboard } from "lucide-react";
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

// NEW: تفکیک‌شده‌ها را به جای MySOP ایمپورت کن
import SOPEditor from "./SOPEditor";
import SopChatPanel from "./SopChatPanel";

import SampleSopGallery from "./SampleSopGallery";

const API_URL = (
  import.meta.env.VITE_API_URL?.toString() || "http://localhost:5000/api"
).replace(/\/+$/, "");

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
    id: "aiHumanizer",
    name: "AI Humanizer",
    icon: <Bot className="w-4 h-4" />,
  },
];

/* =========================================================
   Guidance steps (unchanged)
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
   Types for Samples tab (unchanged)
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

/* =========================================================
   Main CreateSOP (keeps all other tabs unchanged)
   Only the My SOP tab renders Chat + Editor (split)
   ========================================================= */
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
      if (!response.ok) {
        const t = await response.text().catch(() => "");
        throw new Error(
          `GET /sop/sample → ${response.status} ${t.slice(0, 120)}`
        );
      }
      const ct = response.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const t = await response.text().catch(() => "");
        throw new Error(`Expected JSON, got ${ct}: ${t.slice(0, 120)}`);
      }

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
          <TabsList className="w-full h-auto px-2 py-1 bg-transparent overflow-x-auto flex justify-around">
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

        {/* My SOP — حالا 1/3 چت + 2/3 ادیتور */}
        <TabsContent value="createSOP" className="m-0 h-full">
          <div className="max-w-full mx-auto p-6 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:h-[calc(100vh-120px)] md:overflow-hidden">
              <div className="lg:col-span-1 min-h-0 flex flex-col">
                <SopChatPanel />
              </div>
              <div className="lg:col-span-2 min-h-0 flex flex-col">
                <SOPEditor />
              </div>
            </div>
          </div>
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

        {/* Samples Tab (unchanged; همچنان از API می‌خواند) */}
        <TabsContent value="samples" className="m-0">
          <SampleSopGallery />
        </TabsContent>

        {/* AI Improvement (placeholder — همان قبلی) */}
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
