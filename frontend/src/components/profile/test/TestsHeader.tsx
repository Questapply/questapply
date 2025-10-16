import React from "react";
import { motion } from "framer-motion";
import { TestTube } from "lucide-react";

interface TestsHeaderProps {
  variants: any;
}

const TestsHeader: React.FC<TestsHeaderProps> = ({ variants }) => {
  const iconAnimation = {
    hidden: { scale: 0.8, opacity: 0, rotate: 15 },
    show: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div variants={variants} className="text-center">
      <div className="flex justify-center mb-4">
        <motion.div
          variants={iconAnimation}
          className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
        >
          <TestTube className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </motion.div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Standardized Test Scores
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        Many graduate programs require standardized test scores. Let us know
        which tests you've taken.
      </p>
    </motion.div>
  );
};

export default TestsHeader;
