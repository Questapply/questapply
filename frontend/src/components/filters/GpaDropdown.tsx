// src/components/filters/GpaDropdown.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "../../lib/utils";

type Props = {
  fixedWidthClass?: string; // مثل: "w-[150px] sm:w-[180px] md:w-[260px]"
  icon?: React.ReactNode;
  label?: string; // پیش‌فرض "GPA"
  value?: string | number | null; // مقدار فعلی (حداکثر GPA کاربر)
  onChange?: (gpa?: string) => void; // وقتی Apply یا Clear شد
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  buttonClassName?: string;
};
const GpaDropdown: React.FC<Props> = ({
  fixedWidthClass,
  icon = <span className="font-semibold">G</span>,
  label = "GPA",
  value,
  onChange,
  disabled,
  step = 0.1,
  min = 0,
  max = 4,
  buttonClassName,
}) => {
  const [open, setOpen] = useState(false);
  const initial = useMemo(() => {
    const n =
      typeof value === "string"
        ? parseFloat(value)
        : typeof value === "number"
        ? value
        : NaN;
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : NaN;
  }, [value, min, max]);

  const [draft, setDraft] = useState<number>(
    Number.isFinite(initial) ? initial : min
  );

  useEffect(() => {
    // همگام‌سازی وقتی prop تغییر می‌کند
    const n =
      typeof value === "string"
        ? parseFloat(value)
        : typeof value === "number"
        ? value
        : NaN;
    setDraft(Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min);
  }, [value, min, max]);

  const hasSelection = Number.isFinite(initial);

  const pretty = hasSelection ? `GPA (0 - ${initial.toFixed(1)})` : label;

  const handleApply = () => {
    onChange?.(draft.toFixed(1)); // مثل "3.4"
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.(undefined);
    setDraft(min);
    setOpen(false);
  };

  return (
    <div className={cn("inline-block align-top")}>
      <DropdownMenu open={open && !disabled} onOpenChange={setOpen}>
        <div
          className={cn(
            "flex items-center gap-1 px-3 rounded-full !py-1.5 text-[13px] md:text-sm font-medium transition-colors border w-full",
            hasSelection
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
              : "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          )}
        >
          <DropdownMenuTrigger asChild disabled={disabled}>
            <motion.button
              type="button"
              whileHover={disabled ? {} : { y: -3 }}
              className={cn(
                "flex items-center gap-2 w-full justify-between h-10 !py-0 px-3 text-inherit rounded-full",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40",
                "h-7 md:h-fit !py-0 px-3",
                buttonClassName
              )}
              title={pretty}
            >
              <span className="shrink-0">{icon}</span>
              <span className="flex-1 min-w-0 truncate">{pretty}</span>
              <ChevronsUpDown className="h-3.5 w-3.5 ml-1 shrink-0" />
            </motion.button>
          </DropdownMenuTrigger>

          {hasSelection && (
            <X
              className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-pointer shrink-0"
              onClick={handleClear}
            />
          )}
        </div>

        <DropdownMenuContent align="start" className="min-w-[280px] p-3">
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
            Select your GPA (maximum)
          </div>

          {/* اسلایدر دوبل ساده (حداقل ثابت 0، حداکثر قابل تغییر) */}
          <div className="px-1 py-2">
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground w-10 text-right">
                0.0
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={draft}
                onChange={(e) => setDraft(parseFloat(e.target.value))}
                className="flex-1"
              />
              <div className="text-xs text-muted-foreground w-10">
                {max.toFixed(1)}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                step={step}
                min={min}
                max={max}
                value={draft}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  if (Number.isFinite(n)) {
                    setDraft(Math.min(Math.max(n, min), max));
                  }
                }}
                className="w-24 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-transparent"
              />
              <span className="text-sm text-muted-foreground">max</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GpaDropdown;
