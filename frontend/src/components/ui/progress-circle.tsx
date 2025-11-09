import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  color?: "purple" | "blue" | "green" | "red" | "yellow" | "gray";
  showValue?: boolean;
  label?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = "md",
  strokeWidth = 3,
  color = "purple",
  showValue = true,
  label,
  className,
  valueClassName,
  labelClassName,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the progress
    setProgress(0);
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  // Size configs
  const sizeMap = {
    sm: {
      width: 50,
      height: 50,
      textSize: "text-xs",
      labelSize: "text-xs",
    },
    md: {
      width: 72,
      height: 72,
      textSize: "text-xl",
      labelSize: "text-xs",
    },
    lg: {
      width: 100,
      height: 100,
      textSize: "text-2xl",
      labelSize: "text-sm",
    },
  };

  // Color configs
  const colorMap = {
    purple: {
      stroke: "stroke-purple-500",
      bg: "stroke-purple-900/30",
      text: "text-purple-400",
    },
    blue: {
      stroke: "stroke-blue-500",
      bg: "stroke-blue-900/30",
      text: "text-blue-400",
    },
    green: {
      stroke: "stroke-green-500",
      bg: "stroke-green-900/30",
      text: "text-green-400",
    },
    red: {
      stroke: "stroke-red-500",
      bg: "stroke-red-900/30",
      text: "text-red-400",
    },
    yellow: {
      stroke: "stroke-yellow-500",
      bg: "stroke-yellow-900/30",
      text: "text-yellow-400",
    },
    gray: {
      stroke: "stroke-gray-500",
      bg: "stroke-gray-900/30",
      text: "text-gray-400",
    },
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color];

  const radius = (selectedSize.width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="relative"
        style={{ width: selectedSize.width, height: selectedSize.height }}
      >
        <svg
          width={selectedSize.width}
          height={selectedSize.height}
          viewBox={`0 0 ${selectedSize.width} ${selectedSize.height}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={selectedSize.width / 2}
            cy={selectedSize.height / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            className={selectedColor.bg}
          />

          {/* Progress circle */}
          <motion.circle
            cx={selectedSize.width / 2}
            cy={selectedSize.height / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className={selectedColor.stroke}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>

        {/* Text in the center of the circle */}
        {showValue && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span
              className={cn(
                "font-semibold text-xs",
                selectedColor.text,
                valueClassName
              )}
            >
              {progress}%
            </span>
          </motion.div>
        )}
      </div>

      {label && (
        <span
          className={cn(
            "mt-1",
            selectedSize.labelSize,
            "text-gray-500",
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default ProgressCircle;
