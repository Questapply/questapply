// DeadlineDropdown.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronsUpDown, Check, X, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

const SEASONS = [
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
];

const ALL_MONTHS = [
  { n: 1, label: "January" },
  { n: 2, label: "February" },
  { n: 3, label: "March" },
  { n: 4, label: "April" },
  { n: 5, label: "May" },
  { n: 6, label: "June" },
  { n: 7, label: "July" },
  { n: 8, label: "August" },
  { n: 9, label: "September" },
  { n: 10, label: "October" },
  { n: 11, label: "November" },
  { n: 12, label: "December" },
];

const basePill =
  "flex items-center gap-1 px-3 rounded-full !py-1.5 text-[13px] md:text-sm font-medium transition-colors border";
const idlePill =
  "bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700";
const activePill =
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700";

type Props = {
  fixedWidthClass?: string; // مثل بقیه فیلترها: "w-[150px] sm:w-[180px] md:w-[260px]"
  maxLabelChars?: number; // پیش‌فرض 20
  icon?: React.ReactNode;
  label?: string;
  value?: { season?: string; months?: string[] }; // مقدار فعلی از بیرون
  onChange?: (v: { season?: string; months?: string[] }) => void;
  disabled?: boolean;
  apiBase: string;
  authToken?: string;
  otherParams?: Record<string, string | string[] | undefined>;
  buttonClassName?: string;
};

const clamp = (s?: string, n = 20) =>
  (s?.trim()?.length || 0) > n ? `${s!.trim().slice(0, n)}…` : s || "";

const DeadlineDropdown: React.FC<Props> = ({
  fixedWidthClass,
  maxLabelChars = 20,
  icon = <Calendar className="h-4 w-4" />,
  label = "Deadline",
  value,
  onChange,
  disabled,
  apiBase,
  authToken,
  otherParams,
  buttonClassName,
}) => {
  const [availableMonths, setAvailableMonths] = useState<number[] | null>(null);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [open, setOpen] = useState(false);
  const season = value?.season || "";
  const months = value?.months || [];

  const buttonText = useMemo(() => {
    if (!season) return label;
    return SEASONS.find((s) => s.value === season)?.label || label;
  }, [season, label]);

  const selectionCount = (season ? 1 : 0) + (months.length ? 1 : 0);
  const monthsCount = months.length;
  useEffect(() => {
    if (!season) {
      setAvailableMonths(null);
      return;
    }
    setLoadingMonths(true);

    const qp = new URLSearchParams({ deadline: season }); // fall|spring|winter|summer
    // سایر فیلترها را هم اضافه کن
    Object.entries(otherParams || {}).forEach(([k, v]) => {
      if (v == null) return;
      if (Array.isArray(v)) {
        if (v.length) qp.append(k, v.join(","));
      } else if (String(v).trim()) qp.append(k, String(v));
    });

    fetch(`${apiBase}/deadline-months?${qp.toString()}`, {
      method: "GET",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((d) => setAvailableMonths(Array.isArray(d.months) ? d.months : []))
      .catch(() => setAvailableMonths([]))
      .finally(() => setLoadingMonths(false));
  }, [season, JSON.stringify(otherParams)]);

  const selectSeason = (s?: string) => {
    const normalized = s ? s.toLowerCase() : "";
    onChange?.({ season: normalized, months: [] }); // تغییر فصل → ماه‌ها ریست
  };

  const toggleMonth = (label: string) => {
    const set = new Set(months);
    set.has(label) ? set.delete(label) : set.add(label);
    onChange?.({ season, months: Array.from(set) });
  };

  const title = season
    ? months.length
      ? `${season[0].toUpperCase() + season.slice(1)} • ${months.length} mo`
      : `${season[0].toUpperCase() + season.slice(1)}`
    : "Deadline";

  const monthEnabled = (n: number) =>
    !availableMonths || availableMonths.includes(n);

  const clear = () => onChange?.({ season: undefined, months: [] });

  return (
    <div className={cn("inline-block align-top")}>
      <DropdownMenu open={open && !disabled} onOpenChange={setOpen}>
        <div
          className={cn(
            basePill,
            selectionCount ? activePill : idlePill,
            "w-full"
          )}
        >
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
              title={
                season
                  ? `${buttonText}${
                      monthsCount ? " • " + months.join(", ") : ""
                    }` // بعنوان Tooltip کامل
                  : label
              }
            >
              <span className="shrink-0">{icon}</span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">
                  {clamp(buttonText, maxLabelChars)}
                </span>

                {monthsCount > 0 && (
                  <span
                    className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full border-2
                      bg-sky-200 text-sky-900 border-sky-200
                      dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/40"
                  >
                    {monthsCount}
                  </span>
                )}
              </span>

              <ChevronsUpDown className="h-3.5 w-3.5 ml-1 shrink-0" />
            </motion.button>
          </DropdownMenuTrigger>

          {(season || months.length) && (
            <X
              className="h-3.5 w-3.5 text-gray-500 hover:text-gray-300 cursor-pointer shrink-0"
              onClick={clear}
            />
          )}
        </div>

        <DropdownMenuContent align="start" className="min-w-[260px] p-2">
          {/* فصل‌ها */}
          <div className="px-1 py-1">
            {SEASONS.map((s) => {
              const active = season === s.value;
              return (
                <DropdownMenuItem
                  key={s.value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    active && "bg-gray-100 dark:bg-gray-700 font-medium"
                  )}
                  onClick={() => selectSeason(active ? undefined : s.value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <span>{s.label}</span>
                  {active && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          {/* ماه‌ها: فقط وقتی فصل انتخاب شده باشد */}
          {season && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2">
                <div className="text-xs mb-2 text-gray-500">Select Month</div>
                <div className="max-h-48 overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
                  {loadingMonths ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Loading months…
                    </div>
                  ) : (
                    ALL_MONTHS.map(({ n, label }) => {
                      const enabled = monthEnabled(n);
                      const active = months.includes(label);
                      return (
                        <div
                          key={n}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm",
                            enabled
                              ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              : "opacity-50 cursor-not-allowed",
                            active && "bg-gray-100 dark:bg-gray-700 font-medium"
                          )}
                          onClick={() => enabled && toggleMonth(label)}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={active}
                            disabled={!enabled}
                          />
                          <span className="truncate">{label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DeadlineDropdown;
