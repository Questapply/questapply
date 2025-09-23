///////////////////////////////////
//////////////////////////////////
import React, { useMemo, useRef, useState, useEffect } from "react";
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
import { Input } from "../ui/input";

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
};

function normalizeOptions(options: FDOption[]) {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );
}
const basePill =
  "flex items-center gap-1 px-3.5 rounded-full !py-1.5 text-[13px] md:text-sm font-medium transition-colors border";

const idlePill =
  "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";

const activePill =
  "bg-purple-50 text-purple-700 border-purple-200 \
   dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";

const disabledPill =
  "!bg-gray-100 !text-gray-400 !border-gray-200 \
   dark:!bg-gray-900/30 dark:!text-gray-500 dark:!border-gray-800 opacity-80 cursor-not-allowed";

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
  // تعداد انتخاب
  const selectionCount = isMulti
    ? selectedValues?.length ?? 0
    : selectedValue
    ? 1
    : 0;

  // برچسب روی دکمه
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
    if (isMulti) {
      return selectionCount > 0 ? firstSelectedLabel || label : label;
    }
    return singleLabel;
  }, [isMulti, selectionCount, label, firstSelectedLabel, singleLabel]);

  // فیلتر جستجو
  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        String(o.value).toLowerCase().includes(q) // مفید اگر بخوای با value هم جستجو کنی
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

  // اعمال تغییرات انتخاب
  const toggleMulti = (val: string) => {
    if (!multiple) return;
    const v = String(val);
    const arr = (selectedValues || []).map(String);
    const idx = arr.indexOf(v);
    let next: string[];
    if (idx >= 0) {
      next = [...arr.slice(0, idx), ...arr.slice(idx + 1)];
    } else {
      next = [...arr, v];
    }
    onChange?.(next);
  };

  const clearSelection = () => {
    if (!multiple) onSelect?.("");
    else onChange?.([]);
  };

  return (
    <div className={cn(className)}>
      <DropdownMenu open={isOpen && !disabled} onOpenChange={handleOpen}>
        <div
          className={cn(
            basePill,
            disabled || noOptions
              ? disabledPill
              : selectionCount > 0
              ? activePill
              : idlePill,
            className
          )}
        >
          <DropdownMenuTrigger asChild disabled={disabled}>
            <motion.button
              type="button"
              whileHover={disabled ? {} : { y: -3 }}
              className={cn(
                "flex items-center gap-2  truncate text-inherit",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 rounded-full",
                buttonClassName
              )}
            >
              {icon && <span className="shrink-0">{icon}</span>}
              <span
                className="truncate max-w-[120px] md:max-w-[160px]"
                title={buttonLabel}
              >
                {buttonLabel}
              </span>
              {showCount && isMulti && selectionCount > 0 && (
                <span
                  className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border-2
                 bg-sky-200 text-sky-900 border-sky-200
                 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40"
                >
                  {selectionCount}
                </span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 ml-1 shrink-0" />
            </motion.button>
          </DropdownMenuTrigger>

          {selectionCount > 0 && (
            <X
              className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-pointer shrink-0"
              onClick={clearSelection}
            />
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

          {/* None / Clear */}
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
