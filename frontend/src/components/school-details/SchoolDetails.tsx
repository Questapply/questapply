import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SchoolCardSkeleton from "../loading-skeleton/LoadingSkeleton";
import { School as SchoolType } from "../entities/school/SchoolsData";
import {
  School,
  Book,
  ListOrdered,
  MapPin,
  Star,
  Info,
  GitCompare,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import SchoolIntroVideo from "./SchoolIntroVideo";
import ProgramCategories from "./ProgramCategories";
import RequirementsTable from "./RequirementsTable";
import StudentDemographics from "./StudentDemographics";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

type Item = { title: string; programId: number };

type FilterDropdownProps = {
  items?: Item[];
  onSelect: (programId: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialValue?: number | null;
};
//  Dropdown
function FilterDropdown({
  items = [],
  onSelect,
  placeholder = "View All Programs",
  className = "",
  disabled = false,
  initialValue = null,
}: FilterDropdownProps) {
  const safeItems = React.useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  );
  const hasItems = safeItems.length > 0;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(initialValue);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selectedItem = useMemo(
    () => safeItems.find((i) => i.programId === selectedId) || null,
    [safeItems, selectedId]
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle(openState?: boolean) {
    if (disabled || !hasItems) return;
    setOpen((prev) => (typeof openState === "boolean" ? openState : !prev));
  }

  function selectAt(index: number) {
    const item = safeItems[index];
    if (!item) return;
    setSelectedId(item.programId);
    onSelect(item.programId);
    setOpen(false);
    setActiveIndex(null);
    buttonRef.current?.focus();
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled || !hasItems) return;
    switch (e.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        setOpen(true);
        setActiveIndex((idx) => (idx === null ? 0 : idx));
        // فوکوس روی لیست
        requestAnimationFrame(() => {
          listRef.current?.focus();
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setOpen(true);
        setActiveIndex((idx) =>
          idx === null ? Math.max(0, safeItems.length - 1) : idx
        );
        requestAnimationFrame(() => {
          listRef.current?.focus();
        });
        break;
      default:
        break;
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (safeItems.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) =>
          i === null ? 0 : Math.min(i + 1, safeItems.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) =>
          i === null ? safeItems.length - 1 : Math.max(i - 1, 0)
        );
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(safeItems.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (activeIndex !== null) selectAt(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setActiveIndex(null);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        setActiveIndex(null);
        break;
      default:
        break;
    }
  }

  const buttonText = selectedItem ? selectedItem.title : placeholder;
  const isPlaceholder = !selectedItem;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Button (همیشه w-full؛ متن placeholder دقیقاً وسط وقتی چیزی انتخاب نشده) */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || !hasItems}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => toggle()}
        onKeyDown={onButtonKeyDown}
        className={[
          "w-full rounded-md px-3 py-2 transition text-base",
          "border bg-white text-gray-900",
          "dark:bg-gray-900/50 dark:text-gray-100",
          "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
          "dark:border-neutral-700 dark:focus:ring-blue-500",
          disabled || !hasItems
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer",
          isPlaceholder ? "text-center" : "text-left",
          "pr-9", // فضا برای آیکون
        ].join(" ")}
      >
        <span
          className={isPlaceholder ? "text-gray-500 dark:text-gray-400" : ""}
        >
          {buttonText}
        </span>

        {/* Chevron */}
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center"
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          </svg>
        </span>
      </button>

      {/* Listbox (exact width = w-full) */}
      {open && hasItems && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className={[
            "absolute z-50 bottom-full mt-1 w-full rounded-md border shadow-lg outline-none",
            // بک‌گراند هماهنگ با کارت
            "bg-white dark:bg-gray-900",
            "border-gray-200 dark:border-neutral-700",
            // فونت آیتم‌ها بزرگ‌تر
            "text-base",
            // قابل اسکرول
            "max-h-64 overflow-auto",
          ].join(" ")}
        >
          {safeItems.map((it, idx) => {
            const isActive = idx === activeIndex;
            const isSelected = it.programId === selectedId;
            return (
              <div
                key={it.programId}
                role="option"
                aria-selected={isSelected}
                id={`fd-opt-${it.programId}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => {
                  // جلوگیری از blur قبل از انتخاب
                  e.preventDefault();
                }}
                onClick={() => selectAt(idx)}
                className={[
                  "px-3 py-2 cursor-pointer",
                  "text-gray-900 dark:text-gray-100",
                  isActive ? "bg-gray-100 dark:bg-gray-800" : "bg-transparent",
                  isSelected ? "font-medium" : "font-normal",
                ].join(" ")}
              >
                {it.title}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

//  LevelCard
const LevelCard = ({
  level,
  total,
  top3,
  schoolId,
  levelPrograms,
}: {
  level: "Master" | "Ph.D." | "Bachelor";
  total: number;
  top3: Array<{ title: string; url?: string; programId: number }>;
  schoolId: number | string;
  levelPrograms: Array<{ title: string; programId: number }>;
}) => {
  const color =
    level === "Master"
      ? "text-blue-300"
      : level === "Ph.D."
      ? "text-emerald-300"
      : "text-amber-300";

  const navigate = useNavigate();

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-5">
      <div className={`text-sm ${color}`}>{level}</div>
      <div className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
        {total.toLocaleString()} <span className="font-semibold">Programs</span>
      </div>

      <div className="mt-4 space-y-2">
        {(top3 ?? []).length ? (
          top3.map((it, idx) => (
            <div
              key={`${level}-top-${idx}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-300 truncate">{it.title}</span>
              <button
                type="button"
                onClick={() => navigate(`/program/${it.programId}`)}
                className="px-2 py-0.5 rounded-md border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-sm">No programs available</div>
        )}
      </div>

      <FilterDropdown
        items={levelPrograms ?? []}
        placeholder="View All Programs"
        onSelect={(pid) => navigate(`/program/${pid}`)}
      />
    </div>
  );
};

const Stat = ({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) => (
  <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-xl font-bold text-gray-900 dark:text-white">
      {value ?? "—"}
    </div>
  </div>
);
type LevelName = "Master" | "Ph.D." | "Bachelor";

type ProgramListItem = {
  title: string;
  programId: number;
  level: LevelName;
  url?: string;
};

type ByLevelEntry = {
  total: number;
  top3: Array<{ title: string; programId: number; url?: string }>;
};

type ByLevel = Record<LevelName, ByLevelEntry>;
type Deadlines = {
  fall: string | null;
  winter: string | null;
  spring: string | null;
  summer: string | null;
};

interface schoolDetaile {
  isDarkMode: boolean;

  onToggleTheme: () => void;
}
type SchoolDetailsProps = {
  schoolId: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  // هر چی قبلاً داشتی اینجا بیار
};
//School Details
const SchoolDetails = ({
  isDarkMode = document.documentElement.classList.contains("dark"),
  schoolId,
  onToggleTheme,
}: SchoolDetailsProps) => {
  // const { schoolId } = useParams<{ schoolId: string }>();
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [progData, setProgData] = useState<{
    byLevel: ByLevel;
    programList: ProgramListItem[];
    deadlines?: Deadlines;
  } | null>(null);
  const [progLoading, setProgLoading] = useState(false);
  const [progError, setProgError] = useState<string | null>(null);
  const { toast } = useToast();

  const navigate = useNavigate();
  const programsByLevel = useMemo(() => {
    const buckets: Record<
      LevelName,
      Array<{ title: string; programId: number }>
    > = {
      Master: [],
      "Ph.D.": [],
      Bachelor: [],
    };
    for (const p of progData?.programList ?? []) {
      const lvl = p.level as LevelName;
      if (buckets[lvl]) {
        buckets[lvl].push({ title: p.title, programId: p.programId });
      }
    }
    return buckets;
  }, [progData?.programList]);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token, redirecting to login");
          navigate("/auth?mode=login");
          return;
        }
        const response = await fetch(
          `${API_URL}/school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.log("API error:", response.status, response.statusText);
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            navigate("/auth?mode=login");
            return;
          }
          throw new Error(`Failed to fetch school: ${response.status}`);
        }

        const data = await response.json();
        console.log("School detailes:", data);
        console.log("Fetched school data:", data);
        setSchool({ ...data, favorite: false });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching school:", error);
        setError(error.message || "Failed to load school details");
        setLoading(false);
      }
    };

    fetchSchool();
  }, [schoolId, navigate]);

  useEffect(() => {
    if (!school?.id && !schoolId) return;
    const sid = school?.id ?? schoolId;
    const token = localStorage.getItem("token");

    setProgLoading(true);
    setProgError(null);

    fetch(
      `${API_URL}/program-data/program-list?schoolId=${sid}&limit=1000`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        if (!data?.byLevel) throw new Error("Invalid shape");
        const { byLevel, programList, deadlines } = data as {
          byLevel: ByLevel;
          programList: ProgramListItem[];
          deadlines?: Deadlines;
        };
        setProgData({
          byLevel,
          programList,

          deadlines,
        });
      })
      .catch((err) => setProgError(err.message || "Failed to load programs"))
      .finally(() => setProgLoading(false));
  }, [school?.id, schoolId]);

  const deadlines: Deadlines = progData?.deadlines ?? {
    fall: null,
    winter: null,
    spring: null,
    summer: null,
  };

  function formatDeadlineLabel(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(+d)
      ? String(iso)
      : d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  const handleCompare = () => {
    if (school) {
      navigate(`/compare-schools/${school.id}`);
    }
  };

  const toggleFavorite = async () => {
    if (!school) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      // Determine action based on current favorite status
      const action = isFavorite ? "remove" : "add";

      // First update UI optimistically
      setIsFavorite(!isFavorite);

      // Then send request to server
      const response = await fetch(
        `${API_URL}/favorites/schools`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schoolId: school.id, action }),
        }
      );

      if (!response.ok) {
        // If the request failed, revert the UI change
        setIsFavorite(isFavorite);
        throw new Error("Failed to update favorites");
      }

      // Show success toast
      toast({
        title:
          action === "add" ? "Added to Favorites" : "Removed from Favorites",
        description:
          action === "add"
            ? `${school.name} has been added to your favorites.`
            : `${school.name} has been removed from your favorites.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <SchoolCardSkeleton count={1} />;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            School not found
          </h2>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };
  //=== This realted to financials ===
  const {
    roomAndBoard,
    booksAndSupplies,
    otherExpenses,
    undergradInState,
    gradInState,
    undergradOutState,
    gradOutState,
  } = (school as SchoolType).cost;

  // === Financials (derived) ===
  const otherCommon = roomAndBoard + booksAndSupplies + otherExpenses;

  // In-State
  const inUgTuition = undergradInState;
  const inGTuition = gradInState;
  const inUgTotal = inUgTuition + otherCommon;
  const inGTotal = inGTuition + otherCommon;

  // Out-of-State
  const outUgTuition = undergradOutState;
  const outGTuition = gradOutState;
  const outUgTotal = outUgTuition + otherCommon;
  const outGTotal = outGTuition + otherCommon;

  // === Admissions (derived values) ===

  const tr = (school as any).testRequirements ?? {};

  const admissions = (school as any).admissions ?? {};
  const men = admissions.men ?? {};
  const women = admissions.women ?? {};

  // Raw numbers
  const menApplied = Number(men.numberApplied ?? 0);
  const menAdmitted = Number(men.numberAdmitted ?? 0);
  const menFT = Number(men.enrolledFullTime ?? 0);
  const menPT = Number(men.enrolledPartTime ?? 0);

  const womenApplied = Number(women.numberApplied ?? 0);
  const womenAdmitted = Number(women.numberAdmitted ?? 0);
  const womenFT = Number(women.enrolledFullTime ?? 0);
  const womenPT = Number(women.enrolledPartTime ?? 0);

  /// Totals for counts
  const appliedMen = menApplied;
  const appliedWomen = womenApplied;
  const appliedTotal = appliedMen + appliedWomen;

  const admittedMen = menAdmitted;
  const admittedWomen = womenAdmitted;
  const admittedTotal = admittedMen + admittedWomen;

  const enrolledMen = menFT + menPT;
  const enrolledWomen = womenFT + womenPT;
  const enrolledTotal = enrolledMen + enrolledWomen;

  // Rates (%) with one decimal place
  function pct(num: number, den: number) {
    if (!den) return null;
    const v = (num / den) * 100;
    return Math.round(v * 10) / 10; // 1 decimal
  }
  const acceptanceMen = pct(menAdmitted, menApplied);
  const acceptanceWomen = pct(womenAdmitted, womenApplied);
  const acceptanceTotal =
    typeof admissions.acceptanceRate === "number"
      ? admissions.acceptanceRate
      : pct(admittedTotal, appliedTotal);

  const enrolledMenRate = pct(menFT + menPT, menAdmitted);
  const enrolledWomenRate = pct(womenFT + womenPT, womenAdmitted);
  const enrolledTotalRate =
    typeof admissions.enrolledRate === "number"
      ? admissions.enrolledRate
      : pct(enrolledTotal, admittedTotal);

  // Percentage/number display
  function formatPercent(v: number | null | undefined) {
    return v == null || Number.isNaN(v) ? "—" : `${v}%`;
  }

  // Formatters
  function formatNumber(n: number | null | undefined) {
    const v = Number(n ?? 0);
    return isFinite(v) ? new Intl.NumberFormat("en-US").format(v) : "0";
  }

  // English Requirements + Required Documents
  const englishItems: Array<{ key: keyof typeof tr; label: string }> = [
    { key: "toefl", label: "TOEFL" },
    { key: "ielts", label: "IELTS" },
    { key: "duolingo", label: "Duolingo" },
    { key: "melab", label: "MELAB" },
    { key: "pte", label: "PTE" },
  ];

  const documentItems: Array<{ key: keyof typeof tr; label: string }> = [
    { key: "sop", label: "SOP" },
    { key: "transcript", label: "Transcript" },
    { key: "resumeCV", label: "Resume/CV" },
    { key: "recommendations", label: "Recommendations" },
    { key: "applicationForm", label: "Application Form" },
    // اگر خواستی: { key: "applicationFee", label: "Application Fee" },
  ];

  // Deadlines  «—»
  type Season = "fall" | "winter" | "spring" | "summer";
  const seasonLabels: Record<Season, string> = {
    fall: "Fall",
    winter: "Winter",
    spring: "Spring",
    summer: "Summer",
  };
  const seasonOrder: Season[] = ["fall", "winter", "spring", "summer"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Link to={"/dashboard/find-schools"}>
              <Button
                variant="outline"
                className="mr-3 border-gray-300 dark:border-gray-700"
              >
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {school.name}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex space-x-3 mt-4 md:mt-0"
          >
            <div className="flex items-center space-x-2">
              <Sun
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-yellow-500"
                }`}
              />
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleTheme}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon
                className={`w-5 h-5 ${
                  isDarkMode ? "text-blue-400" : "text-gray-400"
                }`}
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={toggleFavorite}
            >
              <Star
                className={`h-4 w-4 ${
                  isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Button>
            <Button
              onClick={handleCompare}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <GitCompare className="h-4 w-4" />
              Compare
            </Button>
          </motion.div>
        </div>

        {/* School Header */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={school.logo || "/placeholder.svg"}
                  alt={`${school.name} logo`}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {school.name}
                  </h2>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{school.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                    <span className="font-medium">
                      QS: #{school.ranking.qs}
                    </span>
                  </div>
                  <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    <span className="font-medium">
                      US News: #{school.ranking.usNews}
                    </span>
                  </div>
                  <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                    <span className="font-medium">
                      Shanghai: #{school.ranking.shanghai}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Acceptance Rate
                  </div>
                  <div className="mt-1">
                    <Progress value={school.acceptance} className="h-2" />
                    <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {school.acceptance}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Graduation Rate
                  </div>
                  <div className="mt-1">
                    <Progress value={school.graduation} className="h-2" />
                    <div className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {school.graduation}%
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Cost (In-State / Out-of-State)
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(school.cost.inState)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(school.cost.outState)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="programs"
                className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30"
              >
                Programs
              </TabsTrigger>
              <TabsTrigger
                value="rankings"
                className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30"
              >
                Rankings
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900/30"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="admissions"
                className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/30"
              >
                Admissions
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30"
              >
                Students
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              {/* Add School Intro Video */}
              <SchoolIntroVideo schoolName={school.name} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <Info className="h-5 w-5 text-purple-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      School Overview
                    </h2>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 dark:text-gray-300">
                      {school.description ||
                        `${school.name} is a prestigious institution located in ${school.location}.`}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Founded
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200">
                          {school.founded || "1636"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Type
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200">
                          {school.type || "Private Research University"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Address
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200">
                          {school.address || school.location}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Contact
                        </h4>
                        <p className="text-gray-800 dark:text-gray-200">
                          {school.phone || "Not Available"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <School className="h-5 w-5 text-blue-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Key Statistics
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Acceptance Rate
                        </h4>
                        <div className="mt-2 flex items-center">
                          <div className="flex-grow">
                            <Progress
                              value={school.acceptance}
                              className="h-3"
                            />
                          </div>
                          <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">
                            {school.acceptance}%
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
                          <ArrowDown className="h-3 w-3 mr-1 text-green-500" />
                          <span>More selective</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Graduation Rate
                        </h4>
                        <div className="mt-2 flex items-center">
                          <div className="flex-grow">
                            <Progress
                              value={school.graduation}
                              className="h-3"
                            />
                          </div>
                          <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">
                            {school.graduation}%
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
                          <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                          <span>Higher than average</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Student Population
                        </h4>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          {school.studentDemographics?.total.toLocaleString() ||
                            "21,000+"}
                        </p>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Undergraduate:{" "}
                            {school.studentDemographics?.level?.undergraduate.toLocaleString() ||
                              "6,700"}
                          </span>
                          <span className="mx-1">|</span>
                          <span>
                            Graduate:{" "}
                            {school.studentDemographics?.level?.graduate.toLocaleString() ||
                              "14,300"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Campus Size
                        </h4>
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                          5,076 acres
                        </p>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Urban campus setting</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            {/* <TabsContent value="programs">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Book className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Academic Programs
                  </h2>
                </div>

                {progLoading ? (
                  <div className="p-6 text-sm text-gray-500">
                    Loading programs…
                  </div>
                ) : progError ? (
                  <div className="p-6 text-sm text-red-400">
                    Failed to load programs: {progError}
                  </div>
                ) : progData ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LevelCard
                      level="Master"
                      total={progData.byLevel.Master?.total || 0}
                      top3={progData.byLevel.Master?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={programsByLevel.Master.map((p) => ({
                        title: p.title,
                        programId: p.programId,
                      }))}
                    />
                    <LevelCard
                      level="Ph.D."
                      total={progData.byLevel["Ph.D."]?.total || 0}
                      top3={progData.byLevel["Ph.D."]?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={programsByLevel["Ph.D."].map((p) => ({
                        title: p.title,
                        programId: p.programId,
                      }))}
                    />
                    <LevelCard
                      level="Bachelor"
                      total={progData.byLevel.Bachelor?.total || 0}
                      top3={progData.byLevel.Bachelor?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={programsByLevel.Bachelor.map((p) => ({
                        title: p.title,
                        programId: p.programId,
                      }))}
                    />
                  </div>
                ) : (
                  <div className="p-6 text-sm text-gray-500">
                    No program data.
                  </div>
                )}
              </div>
            </TabsContent> */}

            {/* new TabsContent program */}
            <TabsContent value="programs">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Book className="h-5 w-5 text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Academic Programs
                  </h2>
                </div>

                {progLoading ? (
                  <div className="p-6 text-sm text-gray-500">
                    Loading programs…
                  </div>
                ) : progError ? (
                  <div className="p-6 text-sm text-red-400">
                    Failed to load programs: {progError}
                  </div>
                ) : progData ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LevelCard
                      level="Master"
                      total={progData.byLevel.Master?.total || 0}
                      top3={progData.byLevel.Master?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={(programsByLevel.Master ?? []).map(
                        (p) => ({ title: p.title, programId: p.programId })
                      )}
                    />
                    <LevelCard
                      level="Ph.D."
                      total={progData.byLevel["Ph.D."]?.total || 0}
                      top3={progData.byLevel["Ph.D."]?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={(programsByLevel["Ph.D."] ?? []).map(
                        (p) => ({ title: p.title, programId: p.programId })
                      )}
                    />
                    <LevelCard
                      level="Bachelor"
                      total={progData.byLevel.Bachelor?.total || 0}
                      top3={progData.byLevel.Bachelor?.top3 || []}
                      schoolId={school?.id ?? schoolId}
                      levelPrograms={(programsByLevel.Bachelor ?? []).map(
                        (p) => ({ title: p.title, programId: p.programId })
                      )}
                    />
                  </div>
                ) : (
                  <div className="p-6 text-sm text-gray-500">
                    No program data.
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="rankings">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <ListOrdered className="h-5 w-5 text-green-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Rankings Details
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Global Rankings
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center rounded-md text-yellow-700 dark:text-yellow-300 font-semibold">
                                QS
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  QS World Rankings
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  2023
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              #{school.ranking.qs}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 flex items-center justify-center rounded-md text-green-700 dark:text-green-300 font-semibold">
                                SH
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  Shanghai Rankings
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  2023
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              #{school.ranking.shanghai}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center rounded-md text-purple-700 dark:text-purple-300 font-semibold">
                                THE
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  Times Higher Education
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  2023
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              #{school.ranking.the}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                        National Rankings
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 flex items-center justify-center rounded-md text-red-700 dark:text-red-300 font-semibold">
                                US
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  US News Rankings
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  2023
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              #{school.ranking.usNews}
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-md text-blue-700 dark:text-blue-300 font-semibold">
                                FB
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">
                                  Forbes Rankings
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  2023
                                </p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              #{school.ranking.forbes || 15}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="financials">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <Info className="h-5 w-5 text-orange-500 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Financial Information
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Tuition and Fees
                      </h3>
                      <div className="space-y-4">
                        {/* Tuition and Fees — LEFT COLUMN content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* In-State */}
                          <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white  dark:bg-gray-900/50 shadow-sm">
                            <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                In-State
                              </h4>
                            </header>

                            <div className="p-4 space-y-3">
                              {/* Undergrade */}
                              <div className="rounded-lg bg-gray-50 bg-gray-900/60 p-3 border border-gray-200 dark:border-neutral-800">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Undergrade · Totals
                                  </span>
                                  <span className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(inUgTotal)}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Tuition
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(inUgTuition)}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Other Cost
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(otherCommon)}
                                  </div>
                                </div>
                              </div>

                              {/* Graduate */}
                              <div className="rounded-lg bg-gray-50 bg-gray-900/60 p-3 border border-gray-200 dark:border-neutral-800">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Graduate · Totals
                                  </span>
                                  <span className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(inGTotal)}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Tuition
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(inGTuition)}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Other Cost
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(otherCommon)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>

                          {/* Out-of-State */}
                          <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/50 shadow-sm">
                            <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                Out-of-State
                              </h4>
                            </header>

                            <div className="p-4 space-y-3">
                              {/* Undergrade */}
                              <div className="rounded-lg bg-gray-50 bg-gray-900/50 p-3 border border-gray-200 dark:border-neutral-800">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Undergrade · Totals
                                  </span>
                                  <span className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(outUgTotal)}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Tuition
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(outUgTuition)}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Other Cost
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(otherCommon)}
                                  </div>
                                </div>
                              </div>

                              {/* Graduate */}
                              <div className="rounded-lg bg-gray-50 bg-gray-900/60 p-3 border border-gray-200 dark:border-neutral-800">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Graduate · Totals
                                  </span>
                                  <span className="text-lg md:text-xl font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(outGTotal)}
                                  </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Tuition
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(outGTuition)}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-300">
                                    Other Cost
                                  </div>
                                  <div className="text-right text-gray-900 dark:text-gray-100">
                                    {formatCurrency(otherCommon)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                        Financial Aid
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Students Receiving Aid
                          </h4>
                          <div className="flex items-center">
                            <div className="flex-grow">
                              <Progress value={70} className="h-3" />
                            </div>
                            <span className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-200">
                              70%
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Approximately 70% of students receive some form of
                            financial aid
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Average Financial Aid Package
                          </h4>
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(45000)}
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            For students with demonstrated need
                          </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900 p-4 rounded-lg">
                          <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                            Financial Aid Calculator
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Use our financial aid calculator to estimate your
                            cost of attendance and potential aid package.
                          </p>
                          <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white">
                            Calculate Your Aid
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="admissions">
              <div className="px-6 rounded-2xl  py-4 bg-gray-50 dark:bg-gray-700/50  border-gray-200 dark:border-gray-700 flex items-center">
                <School className="h-5 w-5 text-indigo-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Admissions
                </h2>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                  {/* LEFT — Admission Requirements (col-span-2) */}
                  <div className="lg:col-span-2 ">
                    <div className="rounded-xl  border-gray-200  bg-white dark:bg-gray-800  overflow-hidden">
                      <div className="col-span-1 md:col-span-2 bg-gray-200 dark:bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-4">
                          Admission Requirements
                        </h3>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Application Deadlines */}
                        <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-gray-900/60">
                          <header className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              Application Deadlines
                            </h4>
                          </header>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {seasonOrder.map((s) => {
                              const val = deadlines[s];
                              return (
                                <div
                                  key={s}
                                  className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 px-3 py-2 border border-gray-200 dark:border-neutral-800"
                                >
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {seasonLabels[s]}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatDeadlineLabel(val)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </section>

                        {/* English Requirements (moved here; استایل ثابت) */}
                        <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-gray-900/60">
                          <header className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              English Requirements
                            </h4>
                          </header>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {englishItems.map(({ key, label }) => {
                              const isTrue = Boolean(tr?.[key]);
                              return (
                                <div
                                  key={String(key)}
                                  className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 px-3 py-2 border border-gray-200 dark:border-neutral-800"
                                >
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {label}
                                  </span>
                                  <span
                                    className={
                                      "text-xs font-medium px-2 py-1 rounded-full " +
                                      (isTrue
                                        ? "bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-700/50 dark:text-red-300")
                                    }
                                  >
                                    {isTrue ? "Required" : "Not required"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </section>

                        {/* Required Documents — English Requirements */}
                        <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-gray-900/60">
                          <header className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              Required Documents
                            </h4>
                          </header>
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {documentItems.map(({ key, label }) => {
                              const isTrue = Boolean(tr?.[key]);
                              return (
                                <div
                                  key={String(key)}
                                  className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 px-3 py-2 border border-gray-200 dark:border-neutral-800"
                                >
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {label}
                                  </span>
                                  <span
                                    className={
                                      "text-xs font-medium px-2 py-1 rounded-full " +
                                      (isTrue
                                        ? "bg-green-100 text-green-700 dark:bg-green-700/50 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-700/50 dark:text-red-300")
                                    }
                                  >
                                    {isTrue ? "Required" : "Not required"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Admissions Statistics */}
                  <div className="bg-gray-50 dark:bg-gray-800  p-6 rounded-lg">
                    <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-16">
                      Admissions Statistics
                    </h3>
                    <div className="space-y-4">
                      {/* 3 stacked cards: Number Applied / Admitted / Enrolled */}
                      {/* Number Applied */}
                      <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/60 shadow-sm">
                        <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Number Applied
                          </h4>
                        </header>
                        <div className="p-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Men
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(appliedMen)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Women
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(appliedWomen)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {formatNumber(appliedTotal)}
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* Number Admitted */}

                      <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/60 shadow-sm">
                        <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Number Admitted
                          </h4>
                        </header>
                        <div className="p-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Men
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(admittedMen)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Women
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(admittedWomen)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {formatNumber(admittedTotal)}
                            </span>
                          </div>
                        </div>
                      </section>
                      {/* Number Enrolled */}

                      <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/60 shadow-sm">
                        <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Number Enrolled
                          </h4>
                        </header>
                        <div className="p-4 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Men
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(enrolledMen)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Women
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {formatNumber(enrolledWomen)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              {formatNumber(enrolledTotal)}
                            </span>
                          </div>
                        </div>
                      </section>

                      {/* Acceptance Rate & Enrolled Rate — side-by-side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Acceptance Rate */}
                        <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/60 shadow-sm">
                          <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              Acceptance Rate
                            </h4>
                          </header>
                          <div className="p-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Men
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatPercent(acceptanceMen)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Women
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatPercent(acceptanceWomen)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2">
                              <span className="font-medium text-gray-700 dark:text-gray-200">
                                Total
                              </span>
                              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {formatPercent(acceptanceTotal)}
                              </span>
                            </div>
                          </div>
                        </section>

                        {/* Enrolled Rate */}
                        <section className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-900/60 shadow-sm">
                          <header className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                              Enrolled Rate
                            </h4>
                          </header>
                          <div className="p-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Men
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatPercent(enrolledMenRate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-300">
                                Women
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatPercent(enrolledWomenRate)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2">
                              <span className="font-medium text-gray-700 dark:text-gray-200">
                                Total
                              </span>
                              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {formatPercent(enrolledTotalRate)}
                              </span>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="students">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3zm0 7.5l9 4.5-9 4.5-9-4.5 9-4.5z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Students
                  </h2>
                </div>

                <div className="p-6 space-y-8">
                  {school.students ? (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <Stat label="Total" value={school.students.total} />
                      <Stat label="Men" value={school.students.men} />
                      <Stat label="Women" value={school.students.women} />
                      <Stat
                        label="Full-time"
                        value={school.students.fullTime}
                      />
                      <Stat
                        label="Part-time"
                        value={school.students.partTime}
                      />
                      <Stat
                        label="Undergrad"
                        value={school.students.undergrad}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No student data.
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      {
                        label: "Asian & Pacific Islander",
                        val: school.race_asian_and_pacific_islander,
                      },
                      { label: "Black", val: school.race_black },
                      { label: "Hispanic", val: school.race_hispanic },
                      {
                        label: "Native American",
                        val: school.race_native_american,
                      },
                      { label: "White", val: school.race_white },
                      { label: "Other", val: school.race_other },
                    ].map(({ label, val }) => {
                      const n = Number(val ?? 0);
                      const pct = isFinite(n)
                        ? Math.max(0, Math.min(100, n))
                        : 0;
                      return (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{label}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded">
                            <div
                              className="h-full bg-blue-500 dark:bg-blue-400 rounded"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolDetails;
