import { motion } from "framer-motion";
import { CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import AnimatedCard from "../ui/animated-card";
import { filterIcons } from "../filters/FilterData";
import { ChevronsUpDown } from "lucide-react";
import { staticPrograms } from "../roadmap/roadmapData";
import StatCircle from "../ui/stat-circle";
interface program {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  fit: string;
  duration: string;
  format: string;
  language: string;
  campus: string;
  qsRanking: string;
  deadline: Array<{ season: string; date: string }>;
  requirements: {
    toefl: { min: number; avg?: number };
    gpa: { min: number; avg?: number };
    gre: {
      status: string;
      total?: { avg: number };
      verbal?: { avg: number };
      quantitative?: { avg: number };
      writing?: { avg: number };
    };
    ielts: number | null;
    duolingo: string | null;
    melab: number | null;
    pte: string | null;
    cael: number | null;
    greSubject: string | null;
    lsat: string | null;
    gmat: string | null;
  };
  favorite: boolean;
  tuition: string | null;
  livingCost: string | null;
  country: string;
  state: string;
}
const filterButtonsProgram = [
  {
    id: 1,
    label: "United States of America",
    placeholder: "United States of America",
    icon: filterIcons.country,
  },
  { id: 2, label: null, placeholder: "State", icon: filterIcons.state },
  {
    id: 3,
    label: null,
    placeholder: "School",
    icon: filterIcons.schools,
  },
  {
    id: 4,
    label: "Ph.D",
    placeholder: "Ph.D",
    icon: filterIcons.degreeLevel,
  },
  {
    id: 5,
    label: "Engineering & Technology",
    placeholder: "Engineering & Technology",
    icon: filterIcons.areaOfStudy,
  },
  {
    id: 6,
    label: "Computer Science and Engineering, IT& Information",
    placeholder: "Computer Science and Engineering, IT& Information",
    icon: filterIcons.programs,
  },
  {
    id: 7,
    label: null,
    placeholder: "Deadlin",
    icon: filterIcons.deadline,
  },
  {
    id: 8,
    label: "TOEFL",
    placeholder: "TOEFL",
    icon: filterIcons.degreeLevel,
  },
  {
    id: 9,
    label: null,
    placeholder: "GPA",
    icon: filterIcons.degreeLevel,
  },
  {
    id: 10,
    label: null,
    placeholder: "GRA",
    icon: filterIcons.degreeLevel,
  },
  { id: 11, label: null, placeholder: "Order By", icon: filterIcons.gre },
];
function StaticProgramList() {
  const getGREStatusStyle = (status: string | null) => {
    const normalizedStatus = status ? status.toLowerCase().trim() : "";
    switch (normalizedStatus) {
      case "not accepted":
        return {
          border: "border-red-300 dark:border-red-800",
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950",
          icon: "🚫",
          label: "Not Accepted",
        };
      case "not required":
        return {
          border: "border-blue-300 dark:border-blue-800",
          text: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950",
          icon: "i",
          label: "Not Required",
        };
      case "required":
        return {
          border: "border-green-300 dark:border-green-800",
          text: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-950",
          icon: "✓",
          label: "Required",
        };
      case "optional":
        return {
          border: "border-gray-300 dark:border-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-950",
          icon: "~",
          label: "Optional",
        };
      case "not required but strongly recommended":
        return {
          border: "border-purple-300 dark:border-purple-800",
          text: "text-purple-600 dark:text-purple-400",
          bg: "bg-purple-50 dark:bg-purple-950",
          icon: "👍",
          label: "NRBSR",
        };
      case "contigent":
        return {
          border: "border-orange-300 dark:border-orange-800",
          text: "text-orange-600 dark:text-orange-400",
          bg: "bg-orange-50 dark:bg-orange-950",
          icon: "⚠️",
          label: "Contingent",
        };
      case "n/a":
      default:
        return {
          border: "border-gray-300 dark:border-gray-700",
          text: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900",
          icon: "?",
          label: "N/A",
        };
    }
  };
  // Colors based on theme
  const colorMap = {
    purple:
      "border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400",
    blue: "border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400",
    green:
      "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400",
    red: "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400",
    yellow:
      "border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400",
    gray: "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400",
  };

  // Size classes
  const sizeMap = {
    sm: "h-16 w-16 text-base",
    md: "h-20 w-20 text-lg",
    lg: "h-24 w-24 text-xl",
  };
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Programs
        </motion.h1>
        <motion.div
          className="text-sm text-gray-600 dark:text-gray-400"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Start your application on this page
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div
        className="mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
          >
            <path
              d="M3 4.5h18M7 12h10M11 19.5h2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            Filters
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filterButtonsProgram.map((button) => (
            <motion.button
              whileHover={{ y: -3 }}
              className={cn(
                "flex items-center gap-2 px-4  rounded-full text-xs border !py-1.5 ",

                "bg-sky-300 dark:bg-gray-800 border-gray-400 font-semibold dark:border-gray-700 text-gray-700 dark:text-gray-300",
                "hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-sm",
                "transition-all duration-300 ease-in-out focus:outline-none",

                button.label
                  ? "bg-purple-400 dark:bg-purple-900/30 text-violet-700 dark:text-gray-50 border-gray-400 dark:border-purple-700 "
                  : "",

                "opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-700 hover:shadow-none"
              )}
            >
              <span>{button.icon}</span>
              <span className="truncate max-w-[100px]">
                {button.label ? button.label : button.placeholder}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 ml-1" />X
            </motion.button>
          ))}
        </div>
        <div className="space-y-6">
          {staticPrograms.map((program, index) => (
            <AnimatedCard
              key={program.id}
              delay={0.2 + index * 0.1}
              className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
            >
              <CardContent className="p-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex justify-between">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={program.schoolLogo}
                          alt={`${program.school} logo`}
                          className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
                        />
                      </motion.div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {program.name}
                          </h3>
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                            {program.degreeType}
                          </span>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium",
                              program.fit === "High Fit"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            )}
                          >
                            {program.fit}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <span>{program.degree}</span>
                          <span className="text-xs mx-1">•</span>
                          <span>{program.school}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      >
                        Compare
                      </Button>
                      <motion.button
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {program.favorite === true ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 fill-red-500"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Program Features
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-8 h-8 bg-yellow-100/70 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400"
                            whileHover={{ rotate: 20 }}
                          >
                            🏆
                          </motion.div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              QS Ranking
                            </div>
                            <div className="font-medium">
                              # {program.qsRanking}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400"
                            whileHover={{ rotate: 20 }}
                          >
                            ⏱️
                          </motion.div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Duration
                            </div>
                            <div className="font-medium">
                              {program.duration}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-8 h-8 bg-red-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400"
                            whileHover={{ rotate: 20 }}
                          >
                            🏫
                          </motion.div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Campus
                            </div>
                            <div className="font-medium">{program.campus}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="w-8 h-8 bg-blue-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400"
                            whileHover={{ rotate: 20 }}
                          >
                            🗣️
                          </motion.div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Language
                            </div>
                            <div className="font-medium">
                              {program.language}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Application Deadline
                      </h4>
                      {program.deadline && program.deadline.length > 0 ? (
                        <div className="flex flex-nowrap justify-center gap-1">
                          {program.deadline.map((dl, index) => (
                            <motion.div
                              key={index}
                              className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-purple-200 to-indigo-200 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                              whileHover={{
                                scale: 1.05,
                                boxShadow:
                                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-purple-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="text-sm font-normal text-gray-800 dark:text-gray-200 text-center">
                                {dl.season}, {dl.date}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-purple-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                            No deadline
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Application Deadline
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Requirements (Min)
                      </h4>
                      <div className="flex justify-around">
                        <div className={cn("flex flex-col items-center")}>
                          <motion.div
                            className={cn(
                              "rounded-full flex items-center justify-center border-4 bg-white dark:bg-gray-800 shadow-sm border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 h-16 w-16 text-base md:h-20 md:w-20 md:text-lg"
                            )}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.1,
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className={cn("font-bold")}>
                              {program.requirements.toefl.min}
                            </span>
                          </motion.div>
                          <span
                            className={cn(
                              "text-xs text-gray-500 dark:text-gray-400 mt-2"
                            )}
                          >
                            TOEFL
                          </span>
                        </div>

                        <div className={cn("flex flex-col items-center")}>
                          <motion.div
                            className={cn(
                              "rounded-full flex items-center justify-center border-4 bg-white dark:bg-gray-800 shadow-sm border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 h-16 w-16 text-base md:h-20 md:w-20 md:text-lg"
                            )}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.1,
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className={cn("font-bold")}>
                              {program.requirements.gpa.min}
                            </span>
                          </motion.div>
                          <span
                            className={cn(
                              "text-xs text-gray-500 dark:text-gray-400 mt-2"
                            )}
                          >
                            GPA
                          </span>
                        </div>

                        <div className="flex flex-col items-center">
                          <motion.div
                            className={`rounded-full h-[70px] w-[70px] flex items-center justify-center border-4 shadow-sm ${
                              getGREStatusStyle(program.requirements.gre.status)
                                .border
                            } ${
                              getGREStatusStyle(program.requirements.gre.status)
                                .bg
                            }`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.3,
                            }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <span
                              className={`text-xl font-bold ${
                                getGREStatusStyle(
                                  program.requirements.gre.status
                                ).text
                              }`}
                            >
                              {
                                getGREStatusStyle(
                                  program.requirements.gre.status
                                ).icon
                              }
                            </span>
                          </motion.div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            GRE
                          </span>

                          <span
                            className={`text-xs ${
                              getGREStatusStyle(program.requirements.gre.status)
                                .text
                            } font-medium`}
                          >
                            {
                              getGREStatusStyle(program.requirements.gre.status)
                                .label
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        variant="outline"
                        className="text-purple-600 border-purple-300 bg-purple-100 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        Program Information
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        className={`${
                          program.favorite === true
                            ? "bg-red-500 hover:bg-red-600 shadow-red-500/20 hover:shadow-red-500/30 "
                            : "bg-green-500 hover:bg-green-600 shadow-green-500/20 hover:shadow-green-500/30 "
                        }shadow-md hover:shadow-lg transition-all`}
                      >
                        {program.favorite !== true
                          ? "Remove from List"
                          : "Add to List"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default StaticProgramList;
