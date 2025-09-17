import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import {
  Check,
  X,
  Save,
  Download,
  Wand,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const resumeSections = [
  {
    id: "summary",
    name: "Professional Summary",
    content:
      "Experienced neuroscience researcher with 8 years of experience in cognitive science and neural imaging techniques. Specializing in memory formation and retention patterns across diverse demographic groups.",
  },
  {
    id: "research",
    name: "Research Interests",
    content:
      "Cognitive neuroscience, memory formation processes, neural plasticity, and AI applications in predictive brain function modeling.",
  },
  {
    id: "experience",
    name: "Professional Experience",
    content:
      "Senior Researcher, Neural Dynamics Lab (2020-Present)\n- Led research team investigating memory formation patterns\n- Authored 12 peer-reviewed publications\n\nResearch Associate, Cognitive Science Institute (2017-2020)\n- Conducted neuroimaging studies of memory retention\n- Developed new protocols for fMRI data analysis",
  },
  {
    id: "education",
    name: "Education",
    content:
      "Ph.D. in Neuroscience, University of California, Berkeley (2017)\nM.S. in Cognitive Psychology, Stanford University (2014)\nB.S. in Biology, Massachusetts Institute of Technology (2012)",
  },
  {
    id: "publications",
    name: "Publications",
    content:
      'Johnson, S. et al. (2023). "Neural correlates of memory retention across age groups." Journal of Cognitive Neuroscience, 35(4), 512-528.\n\nJohnson, S. & Smith, R. (2022). "AI-assisted prediction models for cognitive decline." Neuroscience and Biobehavioral Reviews, 128, 112-125.',
  },
  {
    id: "skills",
    name: "Skills & Certifications",
    content:
      "Technical Skills: fMRI, EEG, Python for neuroscience data analysis, MATLAB\nCertifications: Advanced Neuroimaging Techniques (2019), Research Ethics Certification (2018)",
  },
];

const AiImprovement = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [enhancedContent, setEnhancedContent] = useState<{
    [key: string]: string;
  }>({});
  const [editContent, setEditContent] = useState<{ [key: string]: string }>({});
  const [acceptedSections, setAcceptedSections] = useState<string[]>([]);

  const handleExpandSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);

    if (!enhancedContent[sectionId]) {
      // Simulate AI generating improved content
      setTimeout(() => {
        const section = resumeSections.find((s) => s.id === sectionId);
        if (section) {
          const enhanced = generateEnhancedContent(section.content);
          setEnhancedContent((prev) => ({ ...prev, [sectionId]: enhanced }));
          setEditContent((prev) => ({ ...prev, [sectionId]: enhanced }));
        }
      }, 500);
    }
  };

  const handleAcceptChanges = (sectionId: string) => {
    setAcceptedSections((prev) => [...prev, sectionId]);
  };

  const handleRejectChanges = (sectionId: string) => {
    setExpandedSection(null);
  };

  const handleEditChange = (sectionId: string, newContent: string) => {
    setEditContent((prev) => ({ ...prev, [sectionId]: newContent }));
  };

  // Simple AI content enhancer (placeholder)
  const generateEnhancedContent = (originalContent: string): string => {
    // This is a simplified example - in a real app, this would call an AI service
    const improvements = {
      experience:
        "Senior Researcher, Neural Dynamics Lab (2020-Present)\n- Led interdisciplinary research team investigating memory formation patterns across diverse age groups\n- Authored 12 peer-reviewed publications in high-impact journals (avg. impact factor 8.3)\n- Secured $1.2M in grant funding for longitudinal memory study\n\nResearch Associate, Cognitive Science Institute (2017-2020)\n- Conducted groundbreaking neuroimaging studies of memory retention, cited in 45+ subsequent papers\n- Developed novel protocols for fMRI data analysis, improving accuracy by 27%\n- Mentored 8 graduate students, with 5 continuing to doctoral programs",
      summary:
        "Award-winning neuroscience researcher with 8+ years of specialized experience in cognitive science and advanced neural imaging techniques. Recognized expert in memory formation and retention patterns across diverse demographic groups with proven track record of securing competitive grants and publishing in high-impact journals.",
      research:
        "• Cognitive neuroscience with focus on memory encoding and recall mechanisms\n• Neural plasticity in adult learning environments\n• AI and machine learning applications in predictive brain function modeling\n• Intersection of genetics and memory retention capacity\n• Innovative neuroimaging techniques for non-invasive brain function analysis",
    };

    for (const [key, value] of Object.entries(improvements)) {
      if (originalContent.includes(key)) {
        return value;
      }
    }

    // Add some generic improvements if no specific match
    return originalContent
      .replace("led", "spearheaded")
      .replace("conducted", "executed")
      .replace("developed", "pioneered")
      .replace("authored", "published");
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          AI Resume Enhancement
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Our AI will analyze your resume and suggest improvements to make it
          more impactful and professional.
        </p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <motion.div
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {resumeSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
                acceptedSections.includes(section.id)
                  ? "border-green-500 dark:border-green-500"
                  : ""
              }`}
            >
              <div
                className={`p-4 flex justify-between items-center cursor-pointer ${
                  expandedSection === section.id
                    ? "bg-purple-50 dark:bg-purple-900/20"
                    : ""
                } hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
                onClick={() => handleExpandSection(section.id)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      acceptedSections.includes(section.id)
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    }`}
                  >
                    {acceptedSections.includes(section.id) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Wand className="h-4 w-4" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {section.name}
                  </h3>
                </div>
                {expandedSection === section.id ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>

              {expandedSection === section.id && (
                <motion.div
                  className="p-4 border-t border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Original Content
                    </h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                      <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line">
                        {section.content}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        AI Enhanced Version
                      </h4>
                      <div className="animate-pulse text-purple-500 dark:text-purple-400 text-xs">
                        {!enhancedContent[section.id] &&
                          "Generating improvements..."}
                      </div>
                    </div>

                    {enhancedContent[section.id] ? (
                      <Textarea
                        value={editContent[section.id] || ""}
                        onChange={(e) =>
                          handleEditChange(section.id, e.target.value)
                        }
                        className="min-h-[120px] font-mono text-sm"
                      />
                    ) : (
                      <div className="h-[120px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => handleRejectChanges(section.id)}
                      className="border-red-200 hover:border-red-300 dark:border-red-900 dark:hover:border-red-800 text-red-600 dark:text-red-400"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAcceptChanges(section.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={!enhancedContent[section.id]}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept Changes
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 flex justify-end space-x-4">
          <Button
            variant="outline"
            className="border-gray-200 dark:border-gray-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiImprovement;
