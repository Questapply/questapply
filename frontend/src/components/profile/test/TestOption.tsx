
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TestTube } from "lucide-react";

interface TestOptionProps {
  testId: string;
  testName: string;
  isSelected: boolean;
  onToggle: (testId: string) => void;
}

const TestOption: React.FC<TestOptionProps> = ({
  testId,
  testName,
  isSelected,
  onToggle,
}) => {
  return (
    <div
      onClick={() => onToggle(testId)}
      className={`flex items-center justify-between p-4 cursor-pointer rounded-lg transition-colors duration-200 border ${
        isSelected
          ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className="text-amber-500 dark:text-amber-400">
          <TestTube className="h-5 w-5" />
        </span>
        <span
          className={`text-base font-medium ${
            isSelected
              ? "text-purple-700 dark:text-purple-300"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {testName} Exam
        </span>
      </div>
    </div>
  );
};

export default TestOption;
