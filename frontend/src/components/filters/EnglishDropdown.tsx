import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { Slider } from "../ui/slider"; // shadcn/ui
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TESTS = {
  TOEFL: { min: 0, max: 120, step: 1 },
  IELTS: { min: 1, max: 9, step: 0.5 },
  Duolingo: { min: 10, max: 160, step: 1 },
  MELAB: { min: 10, max: 90, step: 1 },
  PTE: { min: 10, max: 90, step: 1 },
  Cael: { min: 10, max: 90, step: 1 },
} as const;

type Props = {
  fixedWidthClass?: string;
  maxLabelChars?: number;
  icon?: React.ReactNode;
  value?: { test?: keyof typeof TESTS; score?: number };
  onChange?: (v: { test?: keyof typeof TESTS; score?: number }) => void;
  disabled?: boolean;
  buttonClassName?: string;
};

const EnglishDropdown = ({
  fixedWidthClass,
  maxLabelChars = 20,
  icon,
  value,
  onChange,
  disabled,
  buttonClassName,
}: Props) => {
  const test = value?.test;
  const cfg = test ? TESTS[test] : undefined;
  const label = test
    ? `${test} ${value?.score != null ? `• ${value?.score}` : ""}`
    : "English";

  const clamp = (s: string) =>
    s.length > maxLabelChars ? s.slice(0, maxLabelChars) + "…" : s;

  return (
    <div className={cn("inline-block")}>
      <DropdownMenu>
        <div className="flex items-center gap-1 px-3 rounded-full !py-1.5 text-[13px] md:text-sm border bg-white dark:bg-gray-800 w-full">
          <DropdownMenuTrigger asChild disabled={disabled}>
            <motion.button
              type="button"
              whileHover={disabled ? {} : { y: -3 }}
              className={cn(
                "flex items-center gap-2 text-center  truncate text-inherit w-full",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded-full",
                "h-7 md:h-fit !py-0 px-3",
                buttonClassName
              )}
            >
              {icon}
              <span className="flex-1 min-w-0 truncate">{clamp(label)}</span>
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </motion.button>
          </DropdownMenuTrigger>
          {(test || value?.score != null) && (
            <X
              className="h-3.5 w-3.5 cursor-pointer opacity-70"
              onClick={() => onChange?.({ test: undefined, score: undefined })}
            />
          )}
        </div>

        <DropdownMenuContent align="start" className="min-w-[260px] p-2">
          {/* tests */}
          {(Object.keys(TESTS) as (keyof typeof TESTS)[]).map((t) => (
            <DropdownMenuItem
              key={t}
              onSelect={(e) => e.preventDefault()}
              onClick={() => onChange?.({ test: t, score: TESTS[t].max })}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                test === t && "bg-gray-100 dark:bg-gray-700 font-medium"
              )}
            >
              <span>{t}</span>
              {test === t && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}

          {/* score slider */}
          {cfg && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-xs mb-2 text-gray-500">
                  Score: {cfg.min} – {cfg.max}{" "}
                  {value?.score != null ? `• ${value.score}` : ""}
                </div>
                <Slider
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  value={[value?.score ?? cfg.max]}
                  onValueChange={(v) => onChange?.({ test, score: v[0] })}
                />
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default EnglishDropdown;
