
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  onClick,
  style
}) => {
  return (
    <motion.div
      className={cn(
        "rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: delay
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
