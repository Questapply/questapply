// src/components/programs/ProgramResultCard.tsx
import { motion } from "framer-motion";
import AnimatedCard from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import StatCircle from "@/components/ui/stat-circle";
import { cn } from "@/lib/utils";
import { Check, GitCompare } from "lucide-react";

export type Program = {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  fit: string;
  duration: string;
  format: string | null;
  language: string;
  campus: string;
  qsRanking: string;
  deadline: Array<{ season: string; date: string }>;
  requirements: {
    toefl: { min: number; avg?: number };
    gpa: { min: number; avg?: number };
    gre: any; // status | object
  };
};

type GreStatus = "Not Accepted" | "Required" | "Optional" | "Not Required";

const normalizeGreStatus = (raw?: any): GreStatus => {
  if (!raw) return "Not Required";
  const s = String(raw?.status ?? raw ?? "")
    .trim()
    .toLowerCase();
  if (["not accepted", "not_accepted", "notaccepted", "no"].includes(s))
    return "Not Accepted";
  if (s === "required") return "Required";
  if (
    [
      "optional",
      "not required",
      "not_required",
      "nrbsr",
      "not required but strongly recommended",
      "not required but strongly recommended (nrbsr)",
      "contingent",
      "contigent",
    ].includes(s)
  )
    return "Not Required";
  return "Not Required";
};

const greStyle = (st: GreStatus) =>
  st === "Not Accepted"
    ? {
        border: "border-red-300 dark:border-red-800",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950",
        icon: "✕",
      }
    : st === "Required"
    ? {
        border: "border-green-300 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950",
        icon: "✓",
      }
    : st === "Optional"
    ? {
        border: "border-yellow-300 dark:border-yellow-800",
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950",
        icon: "!",
      }
    : {
        border: "border-gray-300 dark:border-gray-700",
        text: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-900",
        icon: "?",
      };

export default function ProgramResultCard({
  program,
  index = 0,
  // وضعیت‌ها
  isCompared,
  isFavorite,
  isInList,
  // هندلرها
  onToggleCompare,
  onToggleFavorite,
  onProgramInfo,
  onToggleList,
  // تنظیمات
  selectedEnglish, // مثل FindPrograms: "TOEFL" | "IELTS" | ...
}: {
  program: Program;
  index?: number;
  isCompared: boolean;
  isFavorite: boolean;
  isInList: boolean;
  onToggleCompare: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onProgramInfo: (id: number) => void;
  onToggleList: (id: number, name: string) => void;
  selectedEnglish?: string;
}) {
  const englishKey =
    selectedEnglish?.toLowerCase() ||
    ("toefl" as keyof Program["requirements"]);

  const gre = normalizeGreStatus(program?.requirements?.gre);
  const style = greStyle(gre);

  return (
    <AnimatedCard
      delay={0.2 + index * 0.1}
      className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 w-full"
    >
      <CardContent className="p-3 md:p-5 min-w-0">
        <div className="flex flex-col space-y-5 md:space-y-6 min-w-0">
          {/* Header */}
          <div className="flex justify-between gap-3 min-w-0">
            <div className="flex items-start gap-3 md:gap-4 min-w-0">
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <img
                  src={program.schoolLogo}
                  alt={`${program.school} logo`}
                  className="w-12 h-12 md:w-16 md:h-16 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
                />
              </motion.div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white text-nowrap">
                    {program.name}
                  </h3>
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-medium text-[11px] md:text-xs px-2 py-1">
                    {program.degreeType}
                  </span>
                  <span
                    className={cn(
                      "rounded-full font-medium text-[11px] md:text-xs px-2 py-1",
                      program.fit === "High Fit"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    )}
                  >
                    {program.fit}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs md:text-sm ">
                  <span>{program.degree}</span>
                  <span className="text-xs mx-1">•</span>
                  <span className="truncate">{program.school}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                aria-pressed={isCompared}
                className={`flex items-center gap-1 ${
                  isCompared
                    ? "bg-green-900/20 text-green-400 border-green-800 hover:bg-green-800/30 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-800/30 h-9 md:h-10 px-3 text-xs md:text-sm"
                    : "bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-800/30 h-9 md:h-10 px-3 text-xs md:text-sm"
                }`}
                onClick={() => onToggleCompare(program.id)}
              >
                {isCompared ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added
                  </>
                ) : (
                  <>
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </>
                )}
              </Button>

              <button
                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors h-9 w-9 md:h-10 md:w-10 rounded-md border flex items-center justify-center"
                onClick={() => onToggleFavorite(program.id)}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                {isFavorite ? (
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
              </button>
            </div>
          </div>

          {/* 3 ستون محتوایی */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {/* Features */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 min-w-0">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 md:mb-3">
                Program Features
              </h4>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      QS Ranking
                    </div>
                    <div className="font-normal md:font-medium">
                      # {program.qsRanking}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    ⏱️
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Duration
                    </div>
                    <div className="font-normal md:font-medium">
                      {program.duration}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    🏫
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Campus
                    </div>
                    <div className="font-normal md:font-medium">
                      {program.campus}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                    🗣️
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Language
                    </div>
                    <div className="font-normal md:font-medium">
                      {program.language}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg md:p-3 p-4 min-w-0">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 md:mb-3">
                Application Deadline
              </h4>
              {program.deadline?.length ? (
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                  {program.deadline.map((dl, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm"
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
                    </div>
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

            {/* Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 min-w-0">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 md:mb-3">
                Requirements (Min)
              </h4>
              <div className="flex justify-center gap-2 md:gap-4">
                <StatCircle
                  value={(program as any)?.requirements?.[englishKey]?.min}
                  label={
                    selectedEnglish ? selectedEnglish.toUpperCase() : "TOEFL"
                  }
                  color="blue"
                  isPercentage={false}
                  size="lg"
                  strokeWidth={4}
                  className="shrink-0"
                />
                <StatCircle
                  value={(program as any)?.requirements?.gpa?.min}
                  label="GPA"
                  color="green"
                  isPercentage={false}
                  size="lg"
                  emptyText="No"
                  strokeWidth={4}
                  className="shrink-0"
                />
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full w-20 h-20 flex items-center justify-center border-4 shadow-sm ${style.border} ${style.bg}`}
                  >
                    <span className={`text-xl font-bold ${style.text}`}>
                      {style.icon}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    GRE
                  </span>
                  <span className={`text-xs ${style.text} font-medium`}>
                    {gre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex flex-col sm:flex-row justify-end mt-2 gap-2 md:gap-3">
            <Button
              variant="outline"
              className="text-purple-600 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full sm:w-auto h-9 md:h-10 px-3 text-xs md:text-sm"
              onClick={() => onProgramInfo(program.id)}
            >
              Program Information
            </Button>
            <Button
              variant="ghost"
              className={`${
                isInList
                  ? "bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/30"
                  : "bg-green-600 hover:bg-green-700 shadow-green-500/20 hover:shadow-green-500/30"
              } w-full sm:w-auto h-9 md:h-10 px-3 text-xs md:text-sm shadow-md hover:shadow-lg transition-all`}
              onClick={() => onToggleList(program.id, program.name)}
            >
              {isInList ? "Remove from List" : "Add to List"}
            </Button>
          </div>
        </div>
      </CardContent>
    </AnimatedCard>
  );
}
