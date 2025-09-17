import { useState, useEffect } from "react";
import { ArrowUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterOption } from "../filters/FilterUtils";
import ConversationalDocumentGenerator from "../generation/ConversationalDocumentGenerator";
import { ScrollArea } from "../ui/scroll-area";
import { Download, FileText } from "lucide-react";
import { useTypingEffect } from "../../hooks/useTypingEffect";

interface ChatBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isDarkMode: boolean;
  filterOptions: FilterOption[] | null;
  activeSection?: string; // Add this to determine which section we're in
}

interface QuickQuestion {
  id: string;
  text: string;
}

const ChatBox = ({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  filterOptions,
  activeSection,
}: ChatBoxProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [activeGenerator, setActiveGenerator] = useState<"sop" | "cv" | null>(
    null
  );

  const welcomeMessage =
    "Hello! I'm here to help with your application. Let's start with Step 1: Find Schools. What would you like to search?";

  const { typingEffect, typingComplete } = useTypingEffect(welcomeMessage);
  const displayText =
    activeSection === "quest-apply-ai" ? typingEffect : welcomeMessage;
  const showTypingIndicator =
    activeSection === "quest-apply-ai" && !typingComplete;

  // Define suggested searches based on activeSection
  const getSuggestedSearches = () => {
    if (activeSection === "find-programs") {
      return [
        "Which top US CS PhD programs match my profile?",
        "What are the best Canadian CS PhD programs for my field?",
        "Which top UK CS PhD programs suit my academic goals?",
      ];
    } else if (activeSection === "find-professors") {
      return [
        "Which top Professors in AI?",
        "What are the top Professors in Machine Learning?",
        "Which top Professors in Deep Learning?",
      ];
    } else {
      return [
        "Which top universities in the US match my profile?",
        "What are the best universities in Canada for my field?",
        "Which top UK universities suit my academic goals?",
      ];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);
    // Handle search logic here
  };

  const closeGenerator = () => {
    setActiveGenerator(null);
  };

  const suggestedSearches = getSuggestedSearches();

  const hero3Prompts = [
    "How to find schools?",
    "Best programs for CS?",
    "Best professors in AI?",
    "Generate CV",
    "Generate SOP",
    "How to write a LOR?",
  ];

  const isQuestApplyAIActive = activeSection === "quest-apply-ai";

  return (
    <div className="relative">
      <div
        className={`w-full rounded-2xl border ${
          isFocused
            ? "border-teal-400 shadow-lg shadow-teal-100 dark:shadow-teal-900/20"
            : isDarkMode
            ? "border-gray-700"
            : "border-gray-200"
        } transition-all duration-300 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {isQuestApplyAIActive && (
          <div className="pt-6 px-6">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              What would you like to search?
            </h2>
          </div>
        )}

        {isQuestApplyAIActive && (
          <div
            className={`px-6 py-4 ${
              isDarkMode ? "bg-gray-700/30" : "bg-gray-50"
            } rounded-xl mx-4 mt-2 mb-4 min-h-40`}
          >
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p
                  className={`${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  } text-lg`}
                >
                  {displayText}
                  {showTypingIndicator && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        {isQuestApplyAIActive && (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2 justify-center">
              {hero3Prompts.map((prompt, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm ${
                    index === 4
                      ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                      : index === 3
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                      : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  } hover:shadow-md transition-all duration-200`}
                >
                  {index === 3 && (
                    <Download className="inline-block w-3.5 h-3.5 mr-1" />
                  )}
                  {index === 4 && (
                    <FileText className="inline-block w-3.5 h-3.5 mr-1" />
                  )}
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Search Input Area - Increased Height */}
          <div className="flex items-center px-4 py-6 h-20">
            {!isQuestApplyAIActive && (
              <Search
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
            )}
            <input
              type="text"
              className={`flex-grow ml-3 outline-none bg-transparent text-lg ${
                isDarkMode
                  ? "text-gray-200 placeholder-gray-500"
                  : "text-gray-800 placeholder-gray-400"
              }`}
              placeholder={
                isQuestApplyAIActive
                  ? "Ask QuestApply AI anything..."
                  : "Search for Schools.."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {isQuestApplyAIActive && (
              <div className="ml-2 px-3 py-1 text-sm bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full animate-pulse">
                QuestApply AI
              </div>
            )}
            <button
              type="submit"
              className="h-12 w-12 ml-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 transition-colors duration-300 rounded-full flex items-center justify-center"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      {isFocused && (
        <div
          className={`absolute inset-x-0 top-full mt-2 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } rounded-lg shadow-lg border p-4 z-10 animate-fade-in`}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Suggested searches
          </div>
          <div className="space-y-2">
            {suggestedSearches.map((text, index) => (
              <div
                key={index}
                className={`cursor-pointer p-2 ${
                  isDarkMode
                    ? "hover:bg-teal-900/20 text-gray-300"
                    : "hover:bg-teal-50 text-gray-700"
                } rounded-md transition-colors duration-200`}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {activeGenerator && (
          <ConversationalDocumentGenerator
            documentType={activeGenerator}
            onClose={closeGenerator}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Section cart under chat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 overflow-x-hidden"
      >
        <h2 className="text-2xl font-semibold mb-4">QuestApply AI Search</h2>
        <p className="text-lg">
          Ask anything about admissions, programs, or application processes. Our
          AI-powered assistant will help you find the information you need.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8">
          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 shadow-sm">
            <h3 className="text-lg font-medium mb-2">
              Find Schools & Programs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Explore top universities and programs tailored to your profile and
              interests
            </p>
          </div>

          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Application Documents</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get assistance with your resume, SOP, and recommendation letters
            </p>
          </div>

          <div className="p-4 md:p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-sm">
            <h3 className="text-lg font-medium mb-2">Application Timeline</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Stay on track with important deadlines and application steps
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatBox;
