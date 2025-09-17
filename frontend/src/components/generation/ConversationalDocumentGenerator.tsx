import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import {
  Loader2,
  FileText,
  BookOpen,
  Download,
  Send,
  Save,
  ArrowUp,
  XCircle,
} from "lucide-react";
import {
  DocumentType,
  useGenerationProcess,
} from "../../utils/GenerationUtils";

interface ConversationalDocumentGeneratorProps {
  documentType: DocumentType;
  onClose: () => void;
  isDarkMode: boolean;
}

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-700 transition-all duration-300"
    >
      {text}
    </motion.button>
  );
};

const ConversationalDocumentGenerator: React.FC<
  ConversationalDocumentGeneratorProps
> = ({ documentType, onClose, isDarkMode }) => {
  const {
    steps,
    currentStep,
    currentStepIndex,
    generatedDocument,
    isGenerating,
    updateField,
    generateDocument,
    nextStep,
  } = useGenerationProcess(documentType);

  const [userInput, setUserInput] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      type: "ai" | "user" | "document";
      content: string;
      question?: {
        text: string;
        fieldId: string;
      };
    }>
  >([]);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate initial document on first render
  useEffect(() => {
    const initializeGenerator = async () => {
      await generateDocument();

      if (documentType === "sop") {
        setSuggestions([
          "I want to focus on AI research",
          "I'm interested in sustainable energy",
          "I have experience in machine learning",
          "I'd like to customize my introduction",
        ]);
      } else {
        setSuggestions([
          "Add my research experience",
          "Include my publications",
          "Add conference presentations",
          "Include my skills and tools",
        ]);
      }

      // Add initial document to conversation
      setConversationHistory([
        {
          type: "ai",
          content: `I've created a basic ${
            documentType === "sop" ? "Statement of Purpose" : "Academic CV"
          } for you. Would you like to improve specific sections?`,
        },
        {
          type: "document",
          content: generatedDocument,
        },
        {
          type: "ai",
          content:
            documentType === "sop"
              ? "Would you like to tell me about your academic background or research interests?"
              : "Would you like to add any research interests or educational background?",
          question: {
            text:
              documentType === "sop"
                ? "What are your main research interests or academic background?"
                : "What research areas are you interested in?",
            fieldId:
              documentType === "sop"
                ? "researchInterests"
                : "researchInterests",
          },
        },
      ]);
    };

    initializeGenerator();
  }, []);

  // Scroll to bottom of conversation whenever it updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  const handleSendMessage = async () => {
    if (!userInput.trim() && !currentStep) return;

    // Add user message to conversation
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "user",
        content: userInput,
      },
    ]);

    // Find the latest question from AI
    const latestQuestion = [...conversationHistory]
      .reverse()
      .find((msg) => msg.type === "ai" && msg.question);

    if (latestQuestion?.question) {
      // Update the field with user's response
      updateField(latestQuestion.question.fieldId, userInput);
    }

    // Clear input
    setUserInput("");

    // Generate new document
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "ai",
        content: "Let me update your document...",
      },
    ]);

    await generateDocument();

    // Decide next question based on document type and current step
    let nextQuestion = "";
    let nextFieldId = "";

    if (documentType === "sop") {
      // Cycle through common SOP topics
      const sopQuestions = [
        {
          text: "Can you share any challenges you've faced that have shaped your academic journey?",
          field: "challenges",
        },
        {
          text: "What motivated you to pursue this specific field or program?",
          field: "fieldMotivation",
        },
        {
          text: "What are your short-term and long-term goals in this field?",
          field: "goals",
        },
        {
          text: "How does this program align with your career aspirations?",
          field: "programFit",
        },
        {
          text: "Is there anything unique about your background that you'd like to highlight?",
          field: "hook",
        },
      ];

      const questionIndex = currentStepIndex % sopQuestions.length;
      nextQuestion = sopQuestions[questionIndex].text;
      nextFieldId = sopQuestions[questionIndex].field;

      // Generate new suggestions based on the next question
      setSuggestions([
        "I want to emphasize my research experience",
        "I overcame significant academic challenges",
        "I'm passionate about making an impact in this field",
        "My goal is to become a leading researcher",
      ]);
    } else {
      // Cycle through common CV topics
      const cvQuestions = [
        {
          text: "Would you like to add any educational background?",
          field: "education",
        },
        {
          text: "Do you have any publications you'd like to include?",
          field: "publications",
        },
        {
          text: "What work or teaching experience would you like to highlight?",
          field: "experience",
        },
        {
          text: "What technical skills or tools are you proficient in?",
          field: "skills",
        },
        {
          text: "Have you received any awards or honors you'd like to mention?",
          field: "awards",
        },
      ];

      const questionIndex = currentStepIndex % cvQuestions.length;
      nextQuestion = cvQuestions[questionIndex].text;
      nextFieldId = cvQuestions[questionIndex].field;

      // Generate new suggestions based on the next question
      setSuggestions([
        "I have experience teaching undergraduate courses",
        "I've published in top journals in my field",
        "I'm proficient in data analysis and machine learning",
        "I've presented at several international conferences",
      ]);
    }

    // Move to next step
    nextStep();

    // Add updated document and next question to conversation
    setConversationHistory((prev) => [
      ...prev,
      {
        type: "document",
        content: generatedDocument,
      },
      {
        type: "ai",
        content: "I've updated your document. " + nextQuestion,
        question: {
          text: nextQuestion,
          fieldId: nextFieldId,
        },
      },
    ]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
    // Don't immediately send to allow user to edit if needed
  };

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    console.log("Exporting as PDF...");
  };

  const handleExportWord = () => {
    // In a real app, this would generate and download a Word document
    console.log("Exporting as Word document...");
  };

  const handleSaveDocument = () => {
    // In a real app, this would save the document to the user's account
    console.log("Saving document...");
  };

  const renderConversation = () => {
    return conversationHistory.map((message, index) => {
      if (message.type === "document") {
        // Render document preview
        return (
          <div
            key={`document-${index}`}
            className={`my-4 p-4 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } mx-auto w-full max-w-3xl`}
          >
            <div className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">
              Document Preview
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {renderDocumentPreview(message.content)}
            </div>
          </div>
        );
      } else if (message.type === "ai") {
        // Render AI message
        return (
          <motion.div
            key={`ai-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 my-4 ${message.question ? "mb-8" : ""}`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white flex-shrink-0">
              AI
            </div>
            <div
              className={`py-2 px-4 rounded-2xl rounded-tl-none max-w-3xl ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {message.content}
              </p>
            </div>
          </motion.div>
        );
      } else {
        // Render user message
        return (
          <motion.div
            key={`user-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 my-4 justify-end"
          >
            <div
              className={`py-2 px-4 rounded-2xl rounded-tr-none max-w-3xl ${
                isDarkMode ? "bg-teal-900/50" : "bg-teal-100"
              }`}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-teal-100" : "text-teal-900"
                }`}
              >
                {message.content}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white flex-shrink-0">
              You
            </div>
          </motion.div>
        );
      }
    });
  };

  const renderDocumentPreview = (document: string) => {
    if (!document) return null;

    // Convert the markdown-like document into structured JSX
    const sections = document.split("#").filter(Boolean);

    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const [title, ...content] = section.split("\n").filter(Boolean);

          return (
            <div
              key={idx}
              className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            >
              <h3 className="text-lg font-semibold mb-3">{title.trim()}</h3>
              {content.map((line, lineIdx) => {
                const [label, value] = line
                  .split(":")
                  .map((part) => part.trim());
                if (!value) return null;

                return (
                  <div key={lineIdx} className="mb-2 last:mb-0">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {label}:{" "}
                    </span>
                    <span className="text-sm">{value}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex items-center justify-between bg-gradient-to-r ${
            documentType === "sop"
              ? "from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30"
              : "from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {documentType === "sop" ? (
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            ) : (
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
            <h2 className="text-lg font-bold">
              {documentType === "sop"
                ? "Statement of Purpose Assistant"
                : "Academic CV Assistant"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        {/* Conversation area with scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {renderConversation()}
          <div ref={messagesEndRef} />
        </div>

        {/* Export buttons */}
        <div
          className={`p-3 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex justify-end gap-2`}
        >
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportWord}>
            <FileText className="mr-2 h-4 w-4" />
            Word
          </Button>
          <Button onClick={handleSaveDocument}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>

        {/* Suggestion chips */}
        <div
          className={`px-4 py-3 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex flex-wrap gap-2`}
        >
          {suggestions.map((suggestion, index) => (
            <SuggestionChip
              key={index}
              text={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
            />
          ))}
        </div>

        {/* Input area */}
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } flex items-center gap-3`}
        >
          <Input
            placeholder="Type your response..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className={`flex-1 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-300"
            }`}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isGenerating || !userInput.trim()}
            className={`${
              documentType === "sop"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            } rounded-full h-10 w-10 p-0 flex items-center justify-center`}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConversationalDocumentGenerator;
