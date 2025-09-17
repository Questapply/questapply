import React from "react";
import { motion } from "framer-motion";
import {
  Flag,
  School,
  Globe,
  Languages,
  TestTube,
  Check,
  Circle,
  Target,
  DollarSign,
  List,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Step, ProfileStep } from "./ProfileTypes";

interface StepNavigationProps {
  steps: Step[];
  currentStep: ProfileStep;
  progress: number;
  enableClicks?: boolean;
  onStepClick?: (id: ProfileStep) => void;
  completedMap?: Record<string, boolean>;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  steps,
  currentStep,
  progress, // (فعلاً استفاده نمی‌شود)
  enableClicks = false,
  onStepClick,
  completedMap = {},
}) => {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Flag":
        return <Flag className="h-5 w-5" />;
      case "School":
        return <School className="h-5 w-5" />;
      case "Globe":
        return <Globe className="h-5 w-5" />;
      case "Languages":
        return <Languages className="h-5 w-5" />;
      case "TestTube":
        return <TestTube className="h-5 w-5" />;
      case "Target":
        return <Target className="h-5 w-5" />;
      case "DollarSign":
        return <DollarSign className="h-5 w-5" />;
      case "List":
        return <List className="h-5 w-5" />;
      case "Check":
        return <Check className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const formatTitle = (title: string) => {
    const words = title.split(" ");
    if (words.length <= 2) return { line1: title, line2: "" };

    switch (title) {
      case "Citizenship & Residency":
        return { line1: "Citizenship &", line2: "Residency" };
      case "Study Abroad Goals":
        return { line1: "Study Abroad", line2: "Goals" };
      case "Language Proficiency":
        return { line1: "Language", line2: "Proficiency" };
      case "Standardized Tests":
        return { line1: "Standardized", line2: "Tests" };
      case "Application Priorities":
        return { line1: "Application", line2: "Priorities" };
      case "Financial Status":
        return { line1: "Financial", line2: "Status" };
      case "Number of Programs":
        return { line1: "Number of", line2: "Programs" };
      default:
        const midPoint = Math.ceil(words.length / 2);
        return {
          line1: words.slice(0, midPoint).join(" "),
          line2: words.slice(midPoint).join(" "),
        };
    }
  };

  return (
    <div className="hidden md:flex justify-between mb-8">
      {steps.map((step, index) => {
        const isPrevious = currentIdx > index;
        const isCurrent = step.id === currentStep;
        const { line1, line2 } = formatTitle(step.title);
        const done = !!completedMap[step.id];
        const clickable = enableClicks;

        return (
          <div
            key={step.id}
            className="flex flex-col items-center max-w-[130px] min-w-[120px]"
          >
            {/* Button wrapper برای کلیک‌پذیری و دسترسی‌پذیری */}
            <button
              type="button"
              disabled={!clickable}
              onClick={() =>
                clickable && onStepClick && onStepClick(step.id as ProfileStep)
              }
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={!clickable}
              title={step.title}
              className={cn(
                "group focus:outline-none",
                clickable ? "cursor-pointer" : "cursor-not-allowed opacity-90"
              )}
              tabIndex={clickable ? 0 : -1}
            >
              {/* Step Icon */}
              <motion.div
                className={cn(
                  "relative h-10 w-10 rounded-full flex items-center justify-center mb-2 transition-colors duration-200",
                  isCurrent
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                    : isPrevious || done
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
                  clickable && "group-hover:ring-2 group-hover:ring-indigo-400"
                )}
                animate={{ scale: isCurrent ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 0.5,
                  repeat: isCurrent ? Infinity : 0,
                  repeatType: "reverse",
                }}
              >
                {getIcon(step.icon)}

                {/* تیک کوچک وقتی مرحله complete است (و فعلاً current نیست) */}
                {done && !isCurrent && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow">
                    <span className="h-3 w-3 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] leading-none">
                      ✓
                    </span>
                  </span>
                )}
              </motion.div>

              {/* Step Title - Two Lines */}
              <div className="text-center whitespace-nowrap">
                <span
                  className={cn(
                    "block text-xs font-medium leading-tight",
                    isCurrent
                      ? "text-purple-600 dark:text-purple-400"
                      : isPrevious || done
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {line1}
                </span>
                {line2 && (
                  <span
                    className={cn(
                      "block text-xs font-medium leading-tight",
                      isCurrent
                        ? "text-purple-600 dark:text-purple-400"
                        : isPrevious || done
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {line2}
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default StepNavigation;
