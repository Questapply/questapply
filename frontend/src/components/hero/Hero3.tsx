import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  University,
  GraduationCap,
  Landmark,
} from "lucide-react"; // Assuming these are from lucide-react
import { Button } from "../ui/button"; // Assuming your button component
import { Card } from "../ui/card"; // Assuming your card component
import { ScrollArea } from "../ui/scroll-area"; // Assuming your scroll-area component
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"; // Assuming your avatar components
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
// Define interfaces if they are not globally defined or imported
interface School {
  id: number;
  name: string;
  ranking: string;
  location: string;
  icon: JSX.Element;
}

interface Professor {
  id: number;
  name: string;
  university: string;
  expertise: string;
  initial: string;
  imgUrl: string;
}

// Mock data (assuming these are defined elsewhere or need to be moved here)
const SOP_TEMPLATE =
  "As a passionate and dedicated aspiring researcher, I am writing to express my profound interest in pursuing a Ph.D. in Computer Science at your esteemed university. My academic journey and research experiences have ignited a strong desire to contribute to the cutting edge of artificial intelligence and machine learning, areas in which your department excels.";

const Hero3 = ({ isDarkMode }: { isDarkMode: boolean }) => {
  // --- useState hooks ---
  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string; type?: string; data?: any }[]
  >([
    {
      role: "assistant",
      content:
        "Hello! I'm QuestApply AI. How can I help with your study abroad journey?",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [autoTypingMessage, setAutoTypingMessage] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const { isAuthenticated, isLoading, profileCompleted } = useAuth();
  const navigate = useNavigate();
  // --- useRef hooks ---
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef_radix = useRef<HTMLDivElement>(null);

  // --- useMemo hooks ---
  const schoolsData: School[] = useMemo(
    () => [
      {
        id: 1,
        name: "Massachusetts Institute of Technology (MIT)",
        ranking: "#1",
        location: "Cambridge, MA",
        icon: <University className="w-8 h-8 text-blue-300" />,
      },
      {
        id: 2,
        name: "Stanford University",
        ranking: "#2",
        location: "Stanford, CA",
        icon: <GraduationCap className="w-8 h-8 text-purple-300" />,
      },
      {
        id: 3,
        name: "Carnegie Mellon University",
        ranking: "#3",
        location: "Pittsburgh, PA",
        icon: <Landmark className="w-8 h-8 text-teal-300" />,
      },
      {
        id: 4,
        name: "University of California, Berkeley",
        ranking: "#4",
        location: "Berkeley, CA",
        icon: <University className="w-8 h-8 text-blue-300" />,
      },
      {
        id: 5,
        name: "Cornell University",
        ranking: "#5",
        location: "Ithaca, NY",
        icon: <Landmark className="w-8 h-8 text-teal-300" />,
      },
    ],
    []
  );

  const professorsData: Professor[] = useMemo(
    () => [
      {
        id: 1,
        name: "Dr. Andrew Ng",
        university: "Stanford University",
        expertise: "Machine Learning",
        initial: "AN",
        imgUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      },
      {
        id: 2,
        name: "Dr. Fei-Fei Li",
        university: "Stanford University",
        expertise: "Computer Vision",
        initial: "FL",
        imgUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      },
      {
        id: 3,
        name: "Dr. Yoshua Bengio",
        university: "University of Montreal",
        expertise: "Deep Learning",
        initial: "YB",
        imgUrl: "https://randomuser.me/api/portraits/men/46.jpg",
      },
      {
        id: 4,
        name: "Dr. Sebastian Thrun",
        university: "Stanford University",
        expertise: "Robotics & AI",
        initial: "ST",
        imgUrl: "https://randomuser.me/api/portraits/men/22.jpg",
      },
      {
        id: 5,
        name: "Dr. Geoffrey Hinton",
        university: "University of Toronto",
        expertise: "Neural Networks",
        initial: "GH",
        imgUrl: "https://randomuser.me/api/portraits/men/86.jpg",
      },
    ],
    []
  );

  const scenarioMessages = useMemo(
    () => [
      "My bachelor is in CS, GPA is 3.7, TOEFL 100, GRE 320. What are the TOP 10 schools in the US for PhD CS?",
      "Best professors in AI?",
      "Generate CV for Computer Science PhD",
      "Generate SOP for Computer Science PhD",
    ],
    []
  );

  // --- useEffect hooks ---
  const scrollToBottom = () => {
    const viewport = scrollAreaRef_radix.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
    if (viewport) {
      // rAF تا بعد از commit DOM
      requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
      });
    }
  };

  // Auto-scroll to bottom of chat when messages change
  useLayoutEffect(() => {
    scrollToBottom();
  }, [chatMessages, currentScenario, isAutoTyping, currentCharIndex, isTyping]);

  // Auto-typing simulation for Hero 3 (Trigger for scenarios)
  useEffect(() => {
    if (!isAutoTyping && !isTyping) {
      if (currentScenario < scenarioMessages.length) {
        const startTyping = setTimeout(() => {
          setAutoTypingMessage(scenarioMessages[currentScenario]);
          setCurrentCharIndex(0);
          setIsAutoTyping(true);
        }, 2000);

        return () => clearTimeout(startTyping);
      } else if (currentScenario === scenarioMessages.length) {
        // اسکرول داخلی ScrollArea را ذخیره کن (نه window)
        const viewport = scrollAreaRef_radix.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLDivElement | null;
        const prevScrollTop = viewport?.scrollTop ?? 0;

        const resetTimer = setTimeout(() => {
          setChatMessages([
            {
              role: "assistant",
              content:
                "Hello! I'm QuestApply AI. How can I help with your study abroad journey?",
            },
          ]);
          setCurrentScenario(0);

          // فقط اسکرول داخل ScrollArea خودت را برگردان
          requestAnimationFrame(() => {
            if (viewport) viewport.scrollTop = prevScrollTop;
          });
        }, 8000);

        autoResetTimerRef.current = resetTimer;
        return () => clearTimeout(resetTimer);
      }
    }
  }, [currentScenario, isAutoTyping, isTyping, scenarioMessages]);

  // Character-by-character typing effect for user question & AI response handling
  useEffect(() => {
    if (isAutoTyping && currentCharIndex < autoTypingMessage.length) {
      const typingTimer = setTimeout(() => {
        setCurrentCharIndex((prev) => prev + 1);
      }, 80);

      return () => clearTimeout(typingTimer);
    } else if (isAutoTyping && currentCharIndex >= autoTypingMessage.length) {
      const sendTimer = setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { role: "user", content: autoTypingMessage },
        ]);
        setIsAutoTyping(false);
        setIsTyping(true);

        setTimeout(() => {
          let response = "";
          let responseType: string | undefined;
          let responseData: any;

          if (currentScenario === 0) {
            response =
              "Based on your profile, here are the top schools for PhD in Computer Science in the US:";
            responseType = "schools";
            responseData = schoolsData;
          } else if (currentScenario === 1) {
            response = "Here are some of the best professors in AI:";
            responseType = "professors";
            responseData = professorsData;
          } else if (currentScenario === 2) {
            response = "Here's your CV for Computer Science PhD applications:";
            responseType = "cv";
          } else if (currentScenario === 3) {
            response =
              "Here's your Statement of Purpose for Computer Science PhD applications:";
            responseType = "sop";
            responseData = SOP_TEMPLATE;
          }

          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: response,
              type: responseType,
              data: responseData,
            },
          ]);
          setIsTyping(false);

          if (currentScenario < scenarioMessages.length) {
            setCurrentScenario((prev) => prev + 1);
          }
        }, 2500);
      }, 800);

      return () => clearTimeout(sendTimer);
    }
  }, [
    isAutoTyping,
    currentCharIndex,
    autoTypingMessage,
    currentScenario,
    setChatMessages,
    setIsAutoTyping,
    setIsTyping,
    schoolsData,
    professorsData,
    scenarioMessages,
  ]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);

  // Add the handle onClick event
  const handleBeginJourneyClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (profileCompleted) {
        // user logged in and their profile is complete.
        navigate("/dashboard");
      } else {
        // user profile is not complete.
        navigate("/profile");
      }
    } else {
      // The user is not logged in
      navigate("/auth?mode=signup");
    }
  };

  // --- Hero 3 quick prompt buttons (unchanged, as they are static) ---
  const hero3Prompts = [
    "How to find schools?",
    "Best programs for CS?",
    "Best professors in AI?",
    "Generate CV",
    "Generate SOP",
    "How to write a LOR?",
  ];

  return (
    <div className="flex flex-col w-full h-full space-y-16 overflow-x-hidden">
      {/* Hero Header with updated text and styling */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-cyan-300">
          AI <span className="text-white">Transforms Education</span>
        </h1>
        <p className="mt-6 text-lg text-white/90 max-w-3xl mx-auto">
          The first AI platform that identifies your unique talents and connects
          you to top universities with incredible speed and accuracy.
        </p>
        <Button
          onClick={handleBeginJourneyClick}
          disabled={isLoading}
          className="mt-10 px-10 py-2.5 h-auto text-lg rounded-md bg-cyan-500 hover:bg-cyan-600 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-white shadow-lg"
          size="lg"
        >
          Begin Your Journey
        </Button>
      </motion.div>
      {/* Chat Interface with fixed container height */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden max-h-[600px] mt-6"
        style={{ height: 600 }} // Fixed height to prevent jumping
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            QuestApply AI Assistant
          </span>
        </div>

        {/* Chat Messages - using ScrollArea for custom scrollbar */}
        <ScrollArea
          ref={scrollAreaRef_radix}
          className="flex-grow p-4 h-[500px]  scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
        >
          <div className="space-y-4">
            {chatMessages.map((message, index) => (
              <div key={index}>
                <div
                  className={`${
                    message.role === "user"
                      ? "bg-blue-100 dark:bg-blue-900/30 ml-12"
                      : "bg-gray-100 dark:bg-gray-700/50 mr-12"
                  } p-4 rounded-lg`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        AI
                      </div>
                      <span className="font-medium text-purple-700 dark:text-purple-400">
                        QuestApply AI
                      </span>
                    </div>
                  )}

                  <p
                    className={`${
                      message.role === "user"
                        ? "text-blue-800 dark:text-blue-200"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {message.content}
                  </p>

                  {/* School Cards */}
                  {message.type === "schools" && message.data && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {message.data.map((school: School) => (
                        <Card
                          key={school.id}
                          className="p-3 bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                              {school.icon}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {school.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                  {school.ranking}
                                </span>
                                <span>•</span>
                                <span>{school.location}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Professor Cards */}
                  {message.type === "professors" && message.data && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {message.data.map((professor: Professor) => (
                        <Card
                          key={professor.id}
                          className="p-3 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-blue-300 dark:border-blue-600">
                              <AvatarImage
                                src={professor.imgUrl}
                                alt={professor.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-blue-500 text-white">
                                {professor.initial}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {professor.name}
                              </h4>
                              <div className="flex flex-col text-sm">
                                <span className="text-blue-600 dark:text-blue-400">
                                  {professor.university}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {professor.expertise}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* CV Template */}
                  {message.type === "cv" && (
                    <div className="mt-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="h-5 w-5 text-blue-500" />
                        <h4 className="font-medium text-blue-600 dark:text-blue-400">
                          Curriculum Vitae
                        </h4>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          A comprehensive, well-structured CV tailored for your
                          Computer Science PhD application has been created,
                          highlighting your academic achievements, research
                          experience, technical skills, and relevant projects.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SOP Template */}
                  {message.type === "sop" && message.data && (
                    <div className="mt-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        <h4 className="font-medium text-purple-600 dark:text-purple-400">
                          Statement of Purpose
                        </h4>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          {message.data}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Auto-typing indicator for user questions */}
            {isAutoTyping && (
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg ml-12">
                <p className="text-blue-800 dark:text-blue-200">
                  {autoTypingMessage.substring(0, currentCharIndex)}
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    |
                  </motion.span>
                </p>
              </div>
            )}

            {/* AI typing indicator */}
            {isTyping && (
              <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mr-12">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <span className="font-medium text-purple-700 dark:text-purple-400">
                    QuestApply AI
                  </span>
                </div>
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"></div>
                  <div
                    className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
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

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-grow px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ask QuestApply AI..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="h-12 w-12 bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600 transition-colors duration-300 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero3;
