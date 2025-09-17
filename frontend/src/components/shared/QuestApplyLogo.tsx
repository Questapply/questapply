
import React from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestApplyLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const QuestApplyLogo: React.FC<QuestApplyLogoProps> = ({
  variant = "full",
  size = "md",
  className,
}) => {
  // Size mappings
  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  // Container sizes
  const containerSizes = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  };

  return (
    <div 
      className={cn(
        "flex items-center", 
        containerSizes[size],
        className
      )}
    >
      {/* Icon part */}
      <div className="relative">
        <div className={cn(
          "rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center",
          iconSizes[size]
        )}>
          <BookOpen className={cn(
            "text-white",
            size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-4 w-4" : "h-5 w-5"
          )} />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full w-3 h-3 border-2 border-white dark:border-gray-900 flex items-center justify-center">
          <span className="text-[6px] font-bold text-white">Q</span>
        </div>
      </div>

      {/* Text part - only shown for full variant */}
      {variant === "full" && (
        <div className="ml-2.5 font-bold">
          <span className={cn(
            "bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
            textSizes[size]
          )}>
            Quest
          </span>
          <span className={cn(
            "bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent",
            textSizes[size]
          )}>
            Apply
          </span>
        </div>
      )}
    </div>
  );
};

export default QuestApplyLogo;
