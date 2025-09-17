
import React from "react";
import { cn } from "@/lib/utils";

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "colored";
  color?: string;
}

const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ className, size = "md", variant = "default", color, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md px-2 py-1 text-sm font-medium",
          size === "sm" && "px-1.5 py-0.5 text-xs",
          size === "lg" && "px-3 py-1.5 text-base",
          variant === "default" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          variant === "colored" && color && `${color}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Tag.displayName = "Tag";

export { Tag };
