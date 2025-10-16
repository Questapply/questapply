import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { BookOpen, Image, FileSearch, Bot, FileText } from "lucide-react";

import ResumeGuidance from "./ResumeGuidance";
import ResumeTemplates from "./ResumeTemplates";
import AiImprovement from "./AiImprovement";
import AtsAnalysis from "./AtsAnalysis";

// ⬇️ جدید: بچه‌ها
import ChatPanel from "./ChatPanel";
import ResumeEditor from "./ResumeEditor";
import MyResumes from "./MyResumes";

const resumeTabs = [
  { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
  {
    id: "template",
    name: "Choose Template",
    icon: <Image className="w-4 h-4" />,
  },
  { id: "create", name: "Create Resume", icon: <Bot className="w-4 h-4" /> },

  {
    id: "aiImprovement",
    name: "AI Improvement",
    icon: <FileSearch className="w-4 h-4" />,
  },
  {
    id: "atsAnalysis",
    name: "ATS Analysis",
    icon: <FileSearch className="w-4 h-4" />,
  },
];

// Initial seed sections with placeholder content (برای placeholder و استارت)
const initialSections = {
  summary: {
    title: "Summary",
    content:
      "Passionate Computer Science PhD candidate with 5+ years of research experience in machine learning and artificial intelligence. Published 8 peer-reviewed papers and contributed to open-source ML frameworks.",
  },
  personal: {
    title: "Personal Informations",
    content:
      "John Doe\nComputer Science PhD Candidate\nPhone: +1 (555) 123-4567\nEmail: john.doe@university.edu\nLinkedIn: linkedin.com/in/johndoe",
  },
  interests: {
    title: "Research Interests",
    content:
      "• Machine Learning and Deep Neural Networks\n• Natural Language Processing\n• Computer Vision and Image Recognition\n• Distributed Systems and Cloud Computing",
  },
  education: {
    title: "Education",
    content:
      "PhD in Computer Science (Expected 2025)\nStanford University, CA\nGPA: 3.85/4.0\n\nM.S. in Computer Science (2021)\nMIT, MA\nGPA: 3.9/4.0",
  },
  experience: {
    title: "Professional History / Experience",
    content:
      "Research Assistant | Stanford AI Lab (2022-Present)\n• Led development of novel neural architecture achieving 15% performance improvement\n• Mentored 3 undergraduate researchers\n\nSoftware Engineering Intern | Google (Summer 2021)\n• Implemented machine learning pipeline processing 1M+ daily queries",
  },
  publications: {
    title: "Publications",
    content:
      '1. Doe, J., et al. (2024). "Advanced Neural Networks for NLP." ICML 2024.\n2. Doe, J., Smith, A. (2023). "Efficient Training Methods." NeurIPS 2023.\n3. Doe, J. (2023). "Computer Vision Applications." CVPR 2023.',
  },
  skills: {
    title: "Certifications and Skills",
    content:
      "Programming Languages: Python, C++, Java, JavaScript\nFrameworks: TensorFlow, PyTorch, React, Node.js\nTools: Git, Docker, Kubernetes, AWS\nCertifications: AWS Certified Developer (2023)",
  },
  awards: {
    title: "Honors and Awards",
    content:
      "• Best Paper Award - ICML 2024\n• Stanford Graduate Fellowship (2022-2025)\n• Dean's List - MIT (2020, 2021)\n• Outstanding Graduate Student Award (2021)",
  },
  memberships: {
    title: "Memberships",
    content:
      "• Association for Computing Machinery (ACM)\n• IEEE Computer Society\n• Stanford AI Research Group\n• Open Source Contributors Network",
  },
  hobbies: {
    title: "Interest and Hobbies",
    content:
      "• Marathon running (completed 3 marathons)\n• Photography and digital art\n• Chess (rated 1800+ on Chess.com)\n• Volunteer coding instructor for underserved communities",
  },
  refs: {
    title: "References",
    content:
      "Available upon request.\n\nDr. Sarah Johnson\nProfessor of Computer Science\nStanford University\nsarah.johnson@stanford.edu",
  },
};

interface ResumeBuilderTabProps {
  selectedTemplate: { id: number; name: string } | null;
}

// ⬇️ تب Create، الان فقط Parent دو بچه است
const ResumeBuilderTab = ({ selectedTemplate }: ResumeBuilderTabProps) => {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // دیتای سکشن‌ها در والد نگه داشته می‌شود و به ResumeEditor پاس می‌خورد
  const [sections, setSections] = useState(initialSections);

  const [searchParams] = useSearchParams();

  // سنک انتخاب تمپلیت بین props و URL (?templateId=)
  useEffect(() => {
    if (typeof selectedTemplate?.id === "number") {
      if (selectedTemplateId !== selectedTemplate.id)
        setSelectedTemplateId(selectedTemplate.id);
      return;
    }
    const t = searchParams.get("templateId");
    const n = t ? Number(t) : NaN;
    if (
      selectedTemplateId == null &&
      !Number.isNaN(n) &&
      selectedTemplateId !== n
    ) {
      setSelectedTemplateId(n);
    }
  }, [selectedTemplate?.id, searchParams, selectedTemplateId]);

  return (
    <div className="dir-ltr min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sticky Header بالای صفحه (برجای می‌ماند) */}
      <div className="sticky top-0 z-50 px-6 py-4 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-gray-100 text-gray-900 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              QuestApply • AI Demo
            </Badge>
            <h1 className="text-xl font-semibold">Create Resume</h1>
          </div>
        </div>
      </div>

      {/* Main Content: سه ستون (۱/۳ چت + ۲/۳ ادیتور) */}
      <div className="max-w-full mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:h-[calc(100vh-120px)] md:overflow-hidden ">
          {/* LEFT - Chat (1/3) */}
          <div className="lg:col-span-1">
            <ChatPanel />
          </div>

          {/* RIGHT - Editor (2/3) */}
          <div className="lg:col-span-2 h-full min-h-0">
            <ResumeEditor
              sections={sections}
              setSections={setSections}
              initialSections={initialSections}
              selectedTemplateId={selectedTemplateId}
              resumeId={resumeId}
              setResumeId={setResumeId}
              // اگر بعداً context از API لود کردی، این‌ها رو پاس بده:
              // targetBadge={target}
              // countryBadge={country}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateResume = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "guidance";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const tabFromParams = searchParams.get("tab");
    if (tabFromParams && resumeTabs.some((tab) => tab.id === tabFromParams)) {
      setActiveTab(tabFromParams);
    }
  }, [searchParams]);

  return (
    <div className="animate-fade-in">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams(
            (prev) => {
              const p = new URLSearchParams(prev);
              p.set("tab", val);
              return p;
            },
            { replace: true }
          );
        }}
        className="w-full"
      >
        <div className="relative border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
          <TabsList className="w-full h-auto px-2 py-1 bg-transparent flex justify-around">
            {resumeTabs.map((tab) => (
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
                    layoutId="activeTab"
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

        {/* Tab Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <TabsContent value="guidance" className="m-0">
            <ResumeGuidance />
          </TabsContent>

          <TabsContent value="template" className="m-0">
            <ResumeTemplates
              onTemplateSelect={(id, name) => setSelectedTemplate({ id, name })}
            />
          </TabsContent>

          <TabsContent value="create" className="m-0">
            <ResumeBuilderTab selectedTemplate={selectedTemplate} />
          </TabsContent>

          <TabsContent value="aiImprovement" className="m-0">
            <AiImprovement />
          </TabsContent>

          <TabsContent value="atsAnalysis" className="m-0">
            <AtsAnalysis />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default CreateResume;
