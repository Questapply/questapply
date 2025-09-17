import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  X,
  Plus,
  ListOrdered,
  Calendar,
  DollarSign,
  GraduationCap,
  TrendingUp,
  Search as SearchIcon,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { useToast } from "../../ui/use-toast";

/** ================== Types (front-end contract; do NOT change the API shape) ================== */
export interface CompareProgramsProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  programIds: string[];
}

interface CompareProgramsResponse {
  programs: ProgramCompareItem[];
}

interface ProgramSearchResult {
  id: number;
  name: string;
  degree?: string;
  school?: string;
  logo?: string | null;
}

interface ProgramCompareItem {
  // Header
  id: number; // relationship id (rel_id)
  programId: number;
  schoolId: number;
  name: string;
  degree: string; // e.g. "Bachelor" | "Master" | "Ph.D."
  school: string;
  schoolLogo?: string | null;
  country?: string | null;
  state?: string | null;

  // Rankings
  rankings?: {
    qs?: number | null;
    usnews?: number | null;
    shanghai?: number | null;
    times?: number | null;
  };

  // Minimum requirements (mins)
  mins?: {
    gpa?: number | null;
    toefl?: number | null;
    ielts?: number | null;
    duolingo?: number | null;
    melab?: number | null;
    pte?: number | null;
    cael?: number | null;
    gre?: {
      status?: "required" | "optional" | "not_required" | string | null;
      total?: number | null;
      verbal?: number | null;
      quant?: number | null;
      writing?: number | null;
    } | null;
    gmat?: {
      status?: "required" | "optional" | "not_required" | string | null;
      total?: number | null;
      verbal?: number | null;
      quant?: number | null;
      writing?: number | null;
    } | null;
    lsat?: {
      status?: "required" | "optional" | "not_required" | string | null;
      total?: number | null;
      verbal?: number | null;
      quant?: number | null;
      writing?: number | null;
    } | null;
  };

  // Deadlines (YYYY-MM-DD or MM-DD)
  deadlines: {
    spring?: string | null;
    summer?: string | null;
    fall?: string | null;
    winter?: string | null;
  };

  // Admission Chance (placeholder only; keep as-is)
  admissionChance?: {
    label?: string | null; // e.g. "Strong Match"
    score?: number | null; // 0..100
  };

  // Averages
  avgs?: {
    gpa?: number | null;
    gre?: number | null;
    gmat?: number | null;
    lsat?: number | null;
  };

  // Fees
  applicationFee?: {
    intl?: number | null;
    domestic?: number | null;
    currency?: string | null; // e.g. "USD"
  };

  // Costs
  residentsCost?: {
    tuition?: number | null;
    fee?: number | null;
    healthInsurance?: number | null;
    livingCost?: number | null;
    currency?: string | null;
  };
  internationalCost?: {
    tuition?: number | null;
    fee?: number | null;
    healthInsurance?: number | null;
    livingCost?: number | null;
    currency?: string | null;
  };
}

/** ================== Utilities (purely presentational; do not change values) ================== */
const dash = "—"; // en-dash for empty
const NA = "Not Applicable";
const fmtMoney = (n?: number | null, currency?: string | null) =>
  typeof n === "number" && isFinite(n)
    ? `${currency || "$"} ${n.toLocaleString()}`
    : dash;

const fmtRank = (n?: number | null) =>
  typeof n === "number" && isFinite(n) ? `#${n}` : dash;

const fmtNum = (n?: number | null) =>
  typeof n === "number" && isFinite(n) ? `${n}` : dash;

const fmtNumNA = (n?: number | null) =>
  typeof n === "number" && isFinite(n) ? `${n}` : NA;

const yesNoMap: Record<string, string> = {
  required: "Required",
  optional: "Optional",
  not_required: "Not required",
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fmtDeadlineMD = (raw?: string | null): string => {
  if (!raw) return dash;
  const parts = raw.split("-").map((p) => parseInt(p, 10));
  let m: number | undefined;
  let d: number | undefined;
  if (parts.length === 3) {
    m = parts[1];
    d = parts[2];
  } else if (parts.length === 2) {
    m = parts[0];
    d = parts[1];
  }
  if (!m || !d || m < 1 || m > 12 || d < 1 || d > 31) return dash;
  return `${monthNames[m - 1]} ${d.toString().padStart(2, "0")}`;
};

// ---------- Admission Chance helpers ----------
type UserScores = {
  gpa?: number | null;

  toefl?: number | null;
  ielts?: number | null;
  duolingo?: number | null;
  melab?: number | null;
  pte?: number | null;
  cael?: number | null;

  greTotal?: number | null;
  gmatTotal?: number | null;
  lsatTotal?: number | null;
};

const getUserScores = (): UserScores => {
  const readN = (k: string) => {
    const v = localStorage.getItem(k);
    const n = v != null ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  };
  return {
    gpa: readN("user_gpa"),
    toefl: readN("user_toefl"),
    ielts: readN("user_ielts"),
    duolingo: readN("user_duolingo"),
    melab: readN("user_melab"),
    pte: readN("user_pte"),
    cael: readN("user_cael"),
    greTotal: readN("user_gre_total"),
    gmatTotal: readN("user_gmat_total"),
    lsatTotal: readN("user_lsat_total"),
  };
};

const passed = (val?: number | null, min?: number | null) =>
  typeof min === "number" && isFinite(min)
    ? typeof val === "number" && isFinite(val) && val >= min
    : true;

const isCloseToAvg = (
  val?: number | null,
  avg?: number | null,
  ratio = 0.1
) => {
  if (
    !(typeof val === "number" && isFinite(val)) ||
    !(typeof avg === "number" && isFinite(avg))
  )
    return false;
  if (val >= avg) return false;
  return val >= avg * (1 - ratio);
};

const pickLanguagePair = (user: UserScores, p: ProgramCompareItem) => {
  const pairs: Array<{ userVal?: number | null; minVal?: number | null }> = [
    { userVal: user.toefl, minVal: p.mins?.toefl },
    { userVal: user.ielts, minVal: p.mins?.ielts },
    { userVal: user.duolingo, minVal: p.mins?.duolingo },
    { userVal: user.melab, minVal: p.mins?.melab },
    { userVal: user.pte, minVal: p.mins?.pte },
    { userVal: user.cael, minVal: p.mins?.cael },
  ];

  const exact = pairs.find(
    (x) =>
      typeof x.userVal === "number" &&
      isFinite(x.userVal!) &&
      typeof x.minVal === "number" &&
      isFinite(x.minVal!)
  );
  if (exact) return exact;

  const anyUser = pairs.find(
    (x) => typeof x.userVal === "number" && isFinite(x.userVal!)
  );
  return anyUser || { userVal: null, minVal: null };
};

const pickPrimaryTest = (user: UserScores, p: ProgramCompareItem) => {
  const order: Array<
    [
      "gre" | "gmat" | "lsat",
      number | null | undefined,
      number | null | undefined,
      "required" | "optional" | "not_required" | string | null
    ]
  > = [
    ["gre", user.greTotal, p.mins?.gre?.total, p.mins?.gre?.status ?? null],
    ["gmat", user.gmatTotal, p.mins?.gmat?.total, p.mins?.gmat?.status ?? null],
    ["lsat", user.lsatTotal, p.mins?.lsat?.total, p.mins?.lsat?.status ?? null],
  ];
  const required = order.find(([kind, u, min, st]) => st === "required");
  if (required) return required;

  const withMin = order.find(
    ([kind, u, min]) =>
      typeof u === "number" &&
      isFinite(u!) &&
      typeof min === "number" &&
      isFinite(min!)
  );
  if (withMin) return withMin;

  const withUser = order.find(
    ([kind, u]) => typeof u === "number" && isFinite(u!)
  );
  return withUser || order[0];
};

type ChanceResult = {
  label: "Strong Match" | "Moderate Match" | "Weak Match";
  color: "green" | "orange" | "red";
};

const computeAdmissionChance = (
  p: ProgramCompareItem,
  user: UserScores
): ChanceResult => {
  const lang = pickLanguagePair(user, p);
  if (!passed(lang.userVal, lang.minVal)) {
    return { label: "Weak Match", color: "red" };
  }

  if (typeof p.mins?.gpa === "number" && isFinite(p.mins.gpa)) {
    if (!(typeof user.gpa === "number" && isFinite(user.gpa))) {
    } else if (user.gpa < p.mins.gpa) {
      return { label: "Weak Match", color: "red" };
    }
  }

  // 3) if (GRE/GMAT/LSAT) is required
  const [kind, userScore, minScore, status] = pickPrimaryTest(user, p);
  if (status === "required") {
    if (!(typeof userScore === "number" && isFinite(userScore))) {
      // required
      return { label: "Weak Match", color: "red" };
    }
    if (!passed(userScore, minScore)) {
      return { label: "Weak Match", color: "red" };
    }
  }

  const checks: Array<{ val?: number | null; avg?: number | null }> = [
    { val: user.gpa, avg: p.avgs?.gpa }, // GPA

    {
      val: userScore,
      avg:
        kind === "gre"
          ? p.avgs?.gre
          : kind === "gmat"
          ? p.avgs?.gmat
          : kind === "lsat"
          ? p.avgs?.lsat
          : undefined,
    },
  ];

  let anyBelowAvg = false;
  let anyFarBelowAvg = false;

  for (const c of checks) {
    if (
      !(typeof c.val === "number" && isFinite(c.val)) ||
      !(typeof c.avg === "number" && isFinite(c.avg))
    ) {
      continue;
    }
    if (c.val < c.avg) {
      anyBelowAvg = true;
      if (!isCloseToAvg(c.val, c.avg, 0.1)) {
        anyFarBelowAvg = true;
      }
    }
  }

  if (!anyBelowAvg) {
    return { label: "Strong Match", color: "green" };
  }
  if (anyBelowAvg && !anyFarBelowAvg) {
    return { label: "Moderate Match", color: "orange" };
  }
  return { label: "Weak Match", color: "red" };
};

/** ================== Reusable UI blocks (visual only) ================== */
function SectionTable({
  title,
  rows,
  programs,
}: {
  title: string; // used as the first column header; will be blank when wrapped by ComparisonSection
  rows: Array<{ label: string; get: (p: ProgramCompareItem) => string }>;
  programs: ProgramCompareItem[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-auto shadow-sm">
      <table className="min-w-[800px] w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-800/60">
          <tr>
            <th className="p-3 text-left font-semibold">{title}</th>
            {programs.map((p) => (
              <th key={p.id} className="p-3 text-left font-medium">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.map((r) => (
            <tr key={r.label} className="align-top">
              <td className="p-3 font-medium text-neutral-700 dark:text-neutral-300">
                {r.label}
              </td>
              {programs.map((p) => (
                <td key={p.id + r.label} className="p-3">
                  {r.get(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ComparisonSectionProps {
  title: string;
  icon: JSX.Element;
  headerRight?: JSX.Element;
  children: JSX.Element;
}

const ComparisonSection = ({
  title,
  icon,
  headerRight,
  children,
}: ComparisonSectionProps) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
        {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

/** ================== Page ================== */
function ComparePrograms({
  isDarkMode,
  onToggleTheme,
  programIds,
}: CompareProgramsProps) {
  // const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const ids: number[] = useMemo(
    () => programIds.map((s) => Number(s)).filter((n) => Number.isFinite(n)),
    [programIds]
  );

  const [programs, setPrograms] = useState<ProgramCompareItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>("");

  // Add/Search modal state (visual only; API remains unchanged)
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProgramSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchUnavailable, setSearchUnavailable] = useState(false);

  const userScores = useMemo(() => getUserScores(), []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }
    if (!ids.length) {
      setPrograms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorText("");

    const url = `/api/program-data/compare?ids=${encodeURIComponent(
      ids.join(",")
    )}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          const ct = r.headers.get("content-type") || "";
          if (ct.includes("text/html")) {
            throw new Error(
              "Compare endpoint is missing. Please implement /api/program-data/compare."
            );
          }
          const t = await r.text();
          throw new Error(t || `HTTP ${r.status}`);
        }
        return (await r.json()) as CompareProgramsResponse;
      })
      .then((data) => {
        console.log("Program compare data:", data);
        setPrograms(Array.isArray(data?.programs) ? data.programs : []);
      })
      .catch((err: unknown) => {
        setErrorText(
          err instanceof Error ? err.message : "Failed to load comparison."
        );
      })
      .finally(() => setLoading(false));
  }, [ids, navigate]);

  const removeProgram = (id: number) => {
    const next = ids.filter((x) => x !== id);
    navigate(`/compare-program/${next.join(",")}`);
  };

  const openAddProgram = () => setShowAddProgramModal(true);

  const addProgramById = (id: number) => {
    if (!id || !Number.isFinite(id)) return;
    const nextSet = Array.from(new Set([...ids, id]));
    navigate(`/compare-program/${nextSet.join(",")}`);
    setShowAddProgramModal(false);
  };

  // Flexible search: if /api/program-data/search doesn't exist, we degrade gracefully
  const searchPrograms = async (query: string) => {
    setSearchUnavailable(false);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const resp = await fetch(
        `/api/program-data/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!resp.ok) {
        // Treat 404 as "search not available" without breaking anything
        if (resp.status === 404) {
          setSearchUnavailable(true);
          setSearchResults([]);
          return;
        }
        const t = await resp.text();
        throw new Error(t || `HTTP ${resp.status}`);
      }
      const json = await resp.json();
      const list: any[] = Array.isArray(json?.programs)
        ? json.programs
        : Array.isArray(json)
        ? json
        : [];
      const mapped: ProgramSearchResult[] = list
        .map((r) => ({
          id: Number(r?.id ?? r?.programId ?? r?.relId),
          name: String(r?.name ?? r?.program_name ?? "Program"),
          degree: r?.degree ?? r?.level ?? "",
          school: r?.school ?? r?.school_name ?? "",
          logo: r?.schoolLogo ?? r?.logo ?? r?.school_logo ?? null,
        }))
        .filter((r) => Number.isFinite(r.id));
      setSearchResults(mapped);
    } catch (e) {
      console.error(e);
      toast({
        title: "Search error",
        description: "Failed to search programs.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="bg-white dark:bg-gray-900 dark:text-neutral-100 transition-colors">
        {/* Top bar */}
        <div className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">Compare Programs</h1>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {ids.length ? `${ids.length} selected` : "No selection"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={openAddProgram}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Add Program
              </Button>
              <div className="flex items-center gap-2">
                <Sun className={`h-4 w-4 ${isDarkMode ? "opacity-40" : ""}`} />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onToggleTheme}
                  aria-label="Toggle theme"
                />
                <Moon
                  className={`h-4 w-4 ${!isDarkMode ? "opacity-40" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-start p-12">
              <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-gray-200 animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading program data...
              </p>
            </div>
          )}

          {!loading && errorText && (
            <div className="py-6 text-sm text-red-600 dark:text-red-400">
              {errorText}
            </div>
          )}

          {!loading && !errorText && !programs.length && (
            <div className="py-6 text-sm flex items-center gap-3">
              <span>Nothing to compare. Please add programs first.</span>
              <Button size="sm" onClick={openAddProgram} className="gap-2">
                <Plus className="h-4 w-4" /> Add Program
              </Button>
            </div>
          )}

          {!loading && !errorText && programs.length > 0 && (
            <>
              {/* Selected cards + Add */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {programs.map((p, index) => (
                    <motion.div
                      key={`program-card-${p?.id || index}`}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <button
                        onClick={() => removeProgram(p?.id || 0)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                        aria-label="Remove program"
                      >
                        <X size={18} />
                      </button>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden mb-3">
                          {p?.schoolLogo ? (
                            <img
                              src={p.schoolLogo}
                              alt={`${p?.school || "School"} logo`}
                              className="w-full h-full object-contain"
                            />
                          ) : null}
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-center">
                          {p?.name || "Unknown Program"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {(p?.school || "Unknown School") +
                            (p?.state || p?.country
                              ? ` • ${[p?.state, p?.country]
                                  .filter(Boolean)
                                  .join(", ")}`
                              : "")}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {programs.length < 3 && (
                    <motion.div
                      className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      onClick={openAddProgram}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-3">
                        <Plus size={30} className="text-green-500" />
                      </div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-center">
                        Add Program
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Click to add another program
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
              {/* Header matrix (logos + names) */}

              {/* Rankings */}
              <ComparisonSection
                title="Rankings"
                icon={<ListOrdered className="h-5 w-5 text-indigo-500" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "QS Ranking",
                      get: (p) => fmtRank(p.rankings?.qs),
                    },
                    {
                      label: "US News",
                      get: (p) => fmtRank(p.rankings?.usnews),
                    },
                    {
                      label: "Shanghai",
                      get: (p) => fmtRank(p.rankings?.shanghai),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Minimums */}
              <ComparisonSection
                title="MINs"
                icon={<GraduationCap className="h-5 w-5 text-amber-500" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "GPA ",
                      get: (p) => fmtNum(p.mins?.gpa ?? null),
                    },
                    {
                      label: "TOEFL ",
                      get: (p) => fmtNum(p.mins?.toefl ?? null),
                    },
                    {
                      label: "IELTS ",
                      get: (p) => fmtNum(p.mins?.ielts ?? null),
                    },
                    {
                      label: "Duolingo ",
                      get: (p) => fmtNum(p.mins?.duolingo ?? null),
                    },
                    {
                      label: "MELAB ",
                      get: (p) => fmtNum(p.mins?.melab ?? null),
                    },
                    {
                      label: "PTE ",
                      get: (p) => fmtNum(p.mins?.pte ?? null),
                    },
                    {
                      label: "Cael ",
                      get: (p) => fmtNum(p.mins?.cael ?? null),
                    },

                    {
                      label: "GRE Total ",
                      get: (p) => fmtNum(p.mins?.gre?.total ?? null),
                    },
                    {
                      label: "GRE Verbal ",
                      get: (p) => fmtNum(p.mins?.gre?.verbal ?? null),
                    },
                    {
                      label: "GRE Quantitative ",
                      get: (p) => fmtNum(p.mins?.gre?.quant ?? null),
                    },
                    {
                      label: "GRE Writing ",
                      get: (p) => fmtNum(p.mins?.gre?.writing ?? null),
                    },

                    {
                      label: "GMAT Total ",
                      get: (p) => fmtNum(p.mins?.gmat?.total ?? null),
                    },
                    {
                      label: "GMAT Verbal",
                      get: (p) => fmtNum(p.mins?.gmat?.verbal ?? null),
                    },
                    {
                      label: "GMAT Quantitative",
                      get: (p) => fmtNum(p.mins?.gmat?.quant ?? null),
                    },
                    {
                      label: "GMAT Writing",
                      get: (p) => fmtNum(p.mins?.gmat?.writing ?? null),
                    },

                    {
                      label: "LSAT total (min)",
                      get: (p) => fmtNumNA(p.mins?.lsat?.total),
                    },
                    {
                      label: "LSAT verbal (min)",
                      get: (p) => fmtNumNA(p.mins?.lsat?.verbal),
                    },
                    {
                      label: "LSAT quantitative (min)",
                      get: (p) => fmtNumNA(p.mins?.lsat?.quant),
                    },
                    {
                      label: "LSAT writing (min)",
                      get: (p) => fmtNumNA(p.mins?.lsat?.writing),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Deadlines */}
              <ComparisonSection
                title="Deadlines"
                icon={<Calendar className="h-5 w-5 text-emerald-500" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "Spring",
                      get: (p) => fmtDeadlineMD(p.deadlines?.spring),
                    },
                    {
                      label: "Summer",
                      get: (p) => fmtDeadlineMD(p.deadlines?.summer),
                    },
                    {
                      label: "Fall",
                      get: (p) => fmtDeadlineMD(p.deadlines?.fall),
                    },
                    {
                      label: "Winter",
                      get: (p) => fmtDeadlineMD(p.deadlines?.winter),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Admission Chance (placeholder) */}
              <ComparisonSection
                title="Admission Chance"
                icon={<TrendingUp className="h-5 w-5 text-fuchsia-500" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "Match",
                      get: (p) => computeAdmissionChance(p, userScores).label,
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Averages */}
              <ComparisonSection
                title="Avgs"
                icon={<GraduationCap className="h-5 w-5 text-blue-500" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    { label: "GPA", get: (p) => fmtNum(p.avgs?.gpa) },
                    { label: "GRE", get: (p) => fmtNum(p.avgs?.gre) },
                    { label: "GMAT", get: (p) => fmtNum(p.avgs?.gmat) },
                    { label: "LSAT", get: (p) => fmtNum(p.avgs?.lsat) },
                  ]}
                />
              </ComparisonSection>

              {/* Application Fee */}
              <ComparisonSection
                title="Application Fee"
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "Fee (INTL)",
                      get: (p) =>
                        fmtMoney(
                          p.applicationFee?.intl,
                          p.applicationFee?.currency
                        ),
                    },
                    {
                      label: "Fee (Domestic)",
                      get: (p) =>
                        fmtMoney(
                          p.applicationFee?.domestic,
                          p.applicationFee?.currency
                        ),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Residents Cost */}
              <ComparisonSection
                title="Residents Cost"
                icon={<DollarSign className="h-5 w-5 text-rose-600" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "Tuition",
                      get: (p) =>
                        fmtMoney(
                          p.residentsCost?.tuition,
                          p.residentsCost?.currency
                        ),
                    },
                    {
                      label: "Fees",
                      get: (p) =>
                        fmtMoney(
                          p.residentsCost?.fee,
                          p.residentsCost?.currency
                        ),
                    },
                    {
                      label: "Health Insurance",
                      get: (p) =>
                        fmtMoney(
                          p.residentsCost?.healthInsurance,
                          p.residentsCost?.currency
                        ),
                    },
                    {
                      label: "Living Cost",
                      get: (p) =>
                        fmtMoney(
                          p.residentsCost?.livingCost,
                          p.residentsCost?.currency
                        ),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* International Cost */}
              <ComparisonSection
                title="International Cost"
                icon={<DollarSign className="h-5 w-5 text-teal-600" />}
              >
                <SectionTable
                  title=""
                  programs={programs}
                  rows={[
                    {
                      label: "Tuition",
                      get: (p) =>
                        fmtMoney(
                          p.internationalCost?.tuition,
                          p.internationalCost?.currency
                        ),
                    },
                    {
                      label: "Fees",
                      get: (p) =>
                        fmtMoney(
                          p.internationalCost?.fee,
                          p.internationalCost?.currency
                        ),
                    },
                    {
                      label: "Health Insurance",
                      get: (p) =>
                        fmtMoney(
                          p.internationalCost?.healthInsurance,
                          p.internationalCost?.currency
                        ),
                    },
                    {
                      label: "Living Cost",
                      get: (p) =>
                        fmtMoney(
                          p.internationalCost?.livingCost,
                          p.internationalCost?.currency
                        ),
                    },
                  ]}
                />
              </ComparisonSection>

              {/* Footer actions */}
              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate("/dashboard/find-programs", {
                      state: { activeSection: "find-programs" },
                      replace: true,
                    })
                  }
                >
                  Back
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Program Modal */}
      <Dialog open={showAddProgramModal} onOpenChange={setShowAddProgramModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Program To Compare</DialogTitle>
            <DialogDescription>
              Search by program name, school, or enter an exact ID.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search programs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchPrograms(searchQuery);
              }}
            />
            <Button
              onClick={() => searchPrograms(searchQuery)}
              className="gap-2"
              disabled={searchLoading}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>

          {searchUnavailable && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Search endpoint unavailable. You can still add by ID below.
            </div>
          )}

          <div className="max-h-64 overflow-auto mt-3 space-y-2">
            {searchResults.length === 0 && !searchLoading ? (
              <div className="text-sm text-neutral-500">No results</div>
            ) : (
              searchResults.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    {r.logo ? (
                      <img
                        src={r.logo}
                        alt="logo"
                        className="w-6 h-6 object-contain rounded"
                      />
                    ) : null}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{r.name}</span>
                      <span className="text-xs text-neutral-500">
                        {r.school}
                        {r.degree ? ` • ${r.degree}` : ""}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addProgramById(r.id)}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add by ID */}
          <div className="mt-4">
            <label className="text-xs text-neutral-500">
              Add by program relationship ID
            </label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                placeholder="e.g. 12345"
                inputMode="numeric"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const v = parseInt(
                      (e.target as HTMLInputElement).value,
                      10
                    );
                    if (Number.isFinite(v)) addProgramById(v);
                  }
                }}
              />
              <Button
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>(
                    "input[placeholder='e.g. 12345']"
                  );
                  const v = el ? parseInt(el.value, 10) : NaN;
                  if (Number.isFinite(v)) addProgramById(v);
                }}
              >
                Add ID
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddProgramModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ComparePrograms;
