
import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "bordered" | "glowing" | "dark" | "talent-section";
  className?: string;
  animate?: boolean;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({ children, className, variant = "default", animate = true, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "bordered":
          return "border border-purple-500/30 bg-gray-900/60 backdrop-blur-sm dark:bg-gray-900/60 light:bg-white/90 light:border-purple-300/20";
        case "glowing":
          return "border border-purple-400/20 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-md shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:from-purple-900/30 dark:to-indigo-900/30 light:from-purple-100/90 light:to-indigo-100/90 light:border-purple-200/40";
        case "dark":
          return "border border-gray-800 dark:bg-black/90 backdrop-blur-sm dark:text-white bg-white/90 text-gray-900 light:border-gray-200";
        case "talent-section":
          return "border border-purple-500/30 dark:bg-gray-800 backdrop-blur-sm bg-white/90 border-purple-300/20 max-w-[1152px] mx-auto";
        default:
          return "border border-purple-300/20 bg-white/90 backdrop-blur-sm dark:border-purple-500/30 dark:bg-gray-900/60";
      }
    };
    
    const cardContent = (
      <div
        ref={ref}
        className={cn(
          "rounded-xl shadow-sm transition-all duration-300",
          getVariantClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
    
    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="w-full"
        >
          {cardContent}
        </motion.div>
      );
    }
    
    return cardContent;
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard };
