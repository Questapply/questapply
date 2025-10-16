import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { X, Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export type FDOption =
  | string
  | { value: string; label: string; icon?: React.ReactNode };

type Props = {
  label: string;
  icon: React.ReactNode;
  options: FDOption[];

  // Single-select
  selectedValue?: string;
  selectedLabel?: string;
  onSelect?: (value: string) => void;

  // Multi-select
  multiple?: boolean;
  selectedValues?: string[];
  onChange?: (value: string[] | string) => void;
  showCount?: boolean;

  // UI / features
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  isLoading?: boolean;
  onOpen?: () => void;
  onSearch?: (searchText: string) => void;
  debugLabel?: string;

  // Size / layout
  containerClassName?: string;
  pillClassName?: string;
  fixedWidthClass?: string;
  maxLabelChars?: number;

  // NEW: کنترل نمایش گزینه “None”
  showNone?: boolean; // default: false => None نمایش داده نمی‌شود
};

const clamp = (s?: string, n = 20) =>
  (s?.trim()?.length || 0) > n ? `${s!.trim().slice(0, n)}…` : s || "";

function normalizeOptions(options: FDOption[]) {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
}

const basePill =
  "flex items-center gap-1 px-3 rounded-full !py-1.5 text-[13px] md:text-sm font-medium transition-colors border";
const idlePill =
  "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
const activePill =
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";
const disabledPill =
  "!bg-gray-100 !text-gray-400 !border-gray-200 dark:!bg-gray-900/30 dark:!text-gray-500 dark:!border-gray-800 opacity-80 cursor-not-allowed";

const FilterDropdown: React.FC<Props> = ({
  label,
  icon,
  options,
  // single
  selectedValue = "",
  selectedLabel = "",
  onSelect,
  // multi
  multiple = false,
  selectedValues = [],
  onChange,
  showCount = false,
  // ui
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
  isLoading = false,
  onOpen,
  onSearch,
  debugLabel,
  containerClassName,
  pillClassName,
  fixedWidthClass,
  maxLabelChars = 20,
  // NEW
  showNone = false,
}) => {
  const isMulti = !!multiple;
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const normalizedOptions = useMemo(
    () =>
      normalizeOptions(options).map((o) => ({
        value: String(o.value),
        label: o.label,
        icon: o.icon,
      })),
    [options]
  );

  const noOptions = !isLoading && (options?.length ?? 0) === 0;

  const selectionCount = isMulti
    ? selectedValues?.length ?? 0
    : selectedValue
    ? 1
    : 0;

  const singleLabel = useMemo(() => {
    if (selectedLabel) return selectedLabel;
    const found = normalizedOptions.find(
      (o) => o.value === String(selectedValue)
    );
    return found?.label ?? label;
  }, [normalizedOptions, selectedLabel, selectedValue, label]);

  const firstSelectedLabel = useMemo(() => {
    if (!isMulti) return "";
    const firstVal = (selectedValues || [])[0];
    if (firstVal == null) return "";
    const firstOpt = normalizedOptions.find(
      (o) => String(o.value) === String(firstVal)
    );
    return firstOpt?.label || "";
  }, [isMulti, selectedValues, normalizedOptions]);

  const buttonLabel = useMemo(() => {
    const raw = isMulti
      ? selectionCount > 0
        ? firstSelectedLabel || label
        : label
      : singleLabel;
    return clamp(raw, maxLabelChars);
  }, [
    isMulti,
    selectionCount,
    label,
    firstSelectedLabel,
    singleLabel,
    maxLabelChars,
  ]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchText]);

  useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(() => onSearch(searchText), 350);
    return () => clearTimeout(id);
  }, [searchText, onSearch]);

  const handleOpen = (open: boolean) => {
    if (disabled) return;
    setIsOpen(open);
    if (open) onOpen?.();
  };

  const toggleMulti = (val: string) => {
    if (!multiple) return;
    const v = String(val);
    const arr = (selectedValues || []).map(String);
    const idx = arr.indexOf(v);
    const next =
      idx >= 0 ? [...arr.slice(0, idx), ...arr.slice(idx + 1)] : [...arr, v];
    onChange?.(next);
  };

  const clearSelection = () => {
    if (!multiple) onSelect?.("");
    else onChange?.([]);
  };

  return (
    <div className={cn("inline-block", containerClassName)}>
      <DropdownMenu open={isOpen && !disabled} onOpenChange={handleOpen}>
        <div
          className={cn(
            basePill,
            disabled || noOptions
              ? disabledPill
              : selectionCount > 0
              ? activePill
              : idlePill,
            "relative", // 👈 مهم
            pillClassName
          )}
        >
          {/* فقط خودِ تریگر */}
          <DropdownMenuTrigger asChild disabled={disabled}>
            <motion.button
              type="button"
              whileHover={disabled ? {} : { y: -3 }}
              className={cn(
                "inline-grid grid-cols-[auto,1fr,auto] items-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded-full",
                "h-6 md:h-fit !py-0 gap-x-1.5",
                buttonClassName
              )}
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span
                className="truncate text-left min-w-0 max-w-[160px] sm:max-w-[140px] md:max-w-[140px]"
                title={buttonLabel}
              >
                {buttonLabel}
              </span>
              {/*
  محاسبات فشرده‌سازی فاصله‌ها
*/}
              {(() => {
                const hasBadge = showCount && isMulti && selectionCount > 0;
                const hasClear = selectionCount > 0;
                const isSingle = !isMulti;

                // حداقل فضا: سینگل کمترین، مولتی کمی بیشتر، بدون هیچ‌چیز صفر
                const rightMinWClass = hasBadge
                  ? "min-w-[40px]" // وقتی badge داریم (فقط در مولتی)
                  : hasClear
                  ? isSingle
                    ? "min-w-[24px]"
                    : "min-w-[32px]"
                  : "min-w-0";

                const chevronMargin = hasBadge || hasClear ? "ml-1" : "ml-0.5";

                return (
                  <span
                    className={cn(
                      "shrink-0 flex items-center justify-end gap-1",
                      rightMinWClass
                    )}
                  >
                    {hasBadge && (
                      <span
                        className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border-2
          bg-sky-200 text-sky-900 border-sky-200
          dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40"
                      >
                        {selectionCount}
                      </span>
                    )}

                    <ChevronsUpDown
                      className={cn("h-3.5 w-3.5 shrink-0", chevronMargin)}
                    />
                  </span>
                );
              })()}
            </motion.button>
          </DropdownMenuTrigger>

          {/* دکمهٔ پاک‌کردن — جدا از Trigger */}
          {selectionCount > 0 && (
            <button
              type="button"
              aria-label="Clear selection"
              title="Clear"
              className={cn("p-0 m-0 leading-none")}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation(); // اصلاً به Trigger نرسد
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearSelection(); // مقدار را خالی کن
                // اگر دوست داری منو هم بسته بماند:
                setIsOpen(false);
              }}
            >
              <X className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-pointer" />
            </button>
          )}
        </div>

        <DropdownMenuContent
          align="start"
          className={cn("min-w-[240px] p-2", menuClassName)}
        >
          {/* Search */}
          {searchable && (
            <div className="flex items-center gap-2 px-2 py-1.5 border rounded-lg mb-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <Search className="h-4 w-4 opacity-70" />
              <input
                className="w-full bg-transparent text-sm outline-none"
                placeholder={searchPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          )}

          {/* None / Clear — فقط اگر اجازه داده شده */}
          {showNone && (
            <>
              <DropdownMenuItem
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  (isMulti ? selectionCount === 0 : !selectedValue) &&
                    "bg-gray-100 dark:bg-gray-700 font-medium"
                )}
                onClick={() => {
                  clearSelection();
                  setIsOpen(false);
                }}
              >
                <span>None</span>
                {(isMulti ? selectionCount === 0 : !selectedValue) && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Options */}
          <div className="max-h-64 overflow-auto">
            {isLoading && (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No options</div>
            )}
            {!isLoading &&
              filtered.map((opt, idx) => {
                const value = opt.value;
                const isSelected = isMulti
                  ? (selectedValues || []).map(String).includes(String(value))
                  : String(selectedValue) === String(value);
                return (
                  <DropdownMenuItem
                    key={`${value}-${idx}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                      isSelected && "bg-gray-100 dark:bg-gray-700 font-medium"
                    )}
                    onSelect={(e) => {
                      if (isMulti) e.preventDefault(); // نذار بسته شه
                    }}
                    onClick={() => {
                      if (isMulti) {
                        toggleMulti(value);
                      } else {
                        onSelect?.(value);
                        setIsOpen(false);
                      }
                    }}
                  >
                    {opt.icon && <span className="text-sm">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                );
              })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterDropdown;
