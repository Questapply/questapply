///////////////////////////////////////////////////////////
// FindPrograms.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import AnimatedCard from "../ui/animated-card";
import StatCircle from "../ui/stat-circle";
import { CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import FilterDropdown from "../filters/FilterDropdown";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton";
import { Check, X, HelpCircle, GitCompare, AlertCircle } from "lucide-react";
import { useChatController } from "../chat/useChatController";
import { mergeFilterPatch } from "../chat/mergeFilters";
import type { FilterSnapshot, FilterPatch } from "../chat/actions";
import ResultsColumn from "../chat/ResultsColumn";
import ProgramResultCard from "@/components/find-programs/ProgramResultCard";

import {
  degreeLevelOptions,
  englishTestOptions,
  orderByProgramOptions,
  filterIcons,
} from "../filters/FilterData";
import { useToast } from "../ui/use-toast";
// CHAT
import ChatHistory from "../chat/ChatHistory";
import ChatComposer from "../chat/ChatComposer";
import DualPaneLayout from "../chat/DualPaneLayout";
import ChatHeader from "../chat/ChatHeader";
// STORAGE (sessions)
import {
  makeSessionId,
  listSessionsLocal,
  upsertSessionMetaLocal,
  finalizeSessionLocal,
  updateSessionTitleLocal,
  type SessionMeta,
} from "../chat/storage";
import DeadlineDropdown from "../filters/DeadlineDropdown";
import EnglishDropdown from "../filters/EnglishDropdown";
import GpaDropdown from "../filters/GpaDropdown";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_BASE = `${API_URL}/program-data`;

// ---------------- Types ----------------
type Program = {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  fit: string;
  duration: string;
  format: string | null;
  language: string;
  campus: string;
  qsRanking: string;
  deadline: Array<{ season: string; date: string }>;
  requirements: {
    toefl: { min: number; avg?: number };
    gpa: { min: number; avg?: number };
    gre: {
      status: string;
      total?: { avg: number };
      verbal?: { avg: number };
      quantitative?: { avg: number };
      writing?: { avg: number };
    };
  };
  favorite: boolean;
  country: string;
  state: string;
};

type UserPreference = {
  country: { id: string | number; name: string } | string | null;
  level: string | null;
  program: string | number | null;
  areaOfStudy: { id: string | number; name: string } | null;
  englishTest: string | null;
  englishScore?: string | null;
  gpa?: string | null;
  availableCountries?: Array<{ country: string | number; name: string }>;
  availableAreasOfStudy?: Array<{ id: string | number; name: string }>;
  availablePrograms?: Array<{ id: string | number; name: string }>;
};

type FiltersState = {
  country?: string;
  state?: string[]; // multi
  school?: string;
  degreeLevel?: string;
  areaOfStudy?: string[]; // multi
  program?: string[]; // multi
  orderBy?: string;
  // سایر فیلترها هم هستند، ولی این ۷ مورد با Apply اعمال می‌شن
  english?: string;
  englishScore?: string;
  gpa?: string;
  gre?: string;
  deadline?: string;
  deadlineMonths?: string[]; // ماه‌ها: ["September","October"]
};

type Option = { value: string; label: string };
type GreStatus = "Not Accepted" | "Required" | "Optional" | "Not Required";

// ---------------- Helpers ----------------
const gpaOptions = Array.from({ length: 41 }, (_, i) => (i / 10).toFixed(1));

// آرایه‌ها → CSV (مثل FindSchool)
const mapFiltersToApiParams = (
  filters: FiltersState
): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      if (value.length) {
        const apiKey = key === "deadlineMonths" ? "deadline_months" : key;
        out[apiKey] = value.map(String).join(",");
      }
      return;
    }
    const s = String(value).trim();
    if (!s) return;
    out[key] = s;
  });
  if (!filters.english) {
    delete out.englishScore;
  }
  if (!out.orderBy) out.orderBy = "qs_rank";
  return out;
};

//helper GRE
const normalizeGreStatus = (raw?: string): GreStatus => {
  if (!raw) return "Not Required"; // اگر خالی بود به Not Required نگاشت می‌کنیم
  const s = String(raw).trim().toLowerCase();

  if (
    s === "not accepted" ||
    s === "not_accepted" ||
    s === "notaccepted" ||
    s === "no"
  )
    return "Not Accepted";

  if (s === "required") return "Required";

  // همهٔ معادل‌های «اجباری نیست» (Optional/Not Required/NRBSR/Contingent)
  if (
    s === "optional" ||
    s === "not required" ||
    s === "not_required" ||
    s === "nrbsr" ||
    s === "not required but strongly recommended" ||
    s === "not required but strongly recommended (nrbsr)" ||
    s === "contingent" ||
    s === "contigent"
  )
    return "Not Required";

  return "Not Required";
};

const getGREStatusStyle = (status: GreStatus) => {
  switch (status) {
    case "Not Accepted":
      return {
        border: "border-red-300 dark:border-red-800",
        text: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950",
        icon: "✕",
      };
    case "Optional":
      return {
        border: "border-yellow-300 dark:border-yellow-800",
        text: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-50 dark:bg-yellow-950",
        icon: "!",
      };
    case "Required":
      return {
        border: "border-green-300 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950",
        icon: "✓",
      };
    default:
      return {
        border: "border-gray-300 dark:border-gray-700",
        text: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-900",
        icon: "?",
      };
  }
};

const PAGE_ID = "find-programs";
const FILTER_WIDTH = "w-[150px] sm:w-[180px] md:w-[260px]";
const FILTER_BTN = "truncate";

// ---------------- Component ----------------
const FindPrograms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // نتایج و وضعیت
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [noResults, setNoResults] = useState(false);
  // chat
  const [sessionId, setSessionId] = useState<string>(() => makeSessionId());
  const [sessions, setSessions] = useState<SessionMeta[]>(() =>
    listSessionsLocal(PAGE_ID)
  );
  const [loadingSession, setLoadingSession] = useState(false);
  // لیست علاقه‌مندی/لیست کاربر (بدون تغییر منطق اصلی)
  const [programList, setProgramList] = useState<string[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  // Preferences
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(
    null
  );

  // فیلترهای اعمال‌شده (۷ تا + بقیه)
  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});

  // منابع برای دراپ‌داون‌ها
  const [availableStates, setAvailableStates] = useState<Option[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const [availablePrograms, setAvailablePrograms] = useState<Option[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [availableSchools, setAvailableSchools] = useState<Option[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [programsToCompare, setProgramsToCompare] = useState<number[]>([]);

  // Country & AreaOfStudy options از userPreferences
  const countryOptions = useMemo<Option[]>(
    () =>
      (userPreferences?.availableCountries || []).map((c) => ({
        value: String(c.country),
        label: c.name,
      })),
    [userPreferences?.availableCountries]
  );

  const areaOptions = useMemo<Option[]>(
    () =>
      (userPreferences?.availableAreasOfStudy || []).map((a) => ({
        value: String(a.id),
        label: a.name,
      })),
    [userPreferences?.availableAreasOfStudy]
  );

  // ---------------- API Calls ----------------
  // States (مثل FindSchool)
  const fetchStates = useCallback(async (countryId: string) => {
    setAvailableStates([]);
    if (!countryId) {
      setLoadingStates(false);
      return;
    }
    setLoadingStates(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/states?country=${countryId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        setAvailableStates([]);
        setLoadingStates(false);
        return;
      }
      const data = await res.json();
      const states: Option[] = (data.states || []).map((s: any) => ({
        value: s.name, // ✅ id
        label: s.name,
      }));
      setAvailableStates(states);
      setLoadingStates(false);
    } catch {
      setAvailableStates([]);
      setLoadingStates(false);
    }
  }, []);

  // Schools dropdown برای کشور انتخابی
  const fetchSchoolsForDropdown = useCallback(async (countryId: string) => {
    setAvailableSchools([]);
    if (!countryId) {
      setLoadingSchools(false);
      return;
    }
    setLoadingSchools(true);
    try {
      const token = localStorage.getItem("token");
      // یک صفحه کافیست برای dropdown
      const res = await fetch(
        `${API_URL}/schools?country=${countryId}&page=1&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        setAvailableSchools([]);
        setLoadingSchools(false);
        return;
      }
      const data = await res.json();
      const schools: Option[] = (data.schools || []).map((s: any) => ({
        value: String(s.id), // برای /find باید id بره
        label: s.name,
      }));
      setAvailableSchools(schools);
      setLoadingSchools(false);
    } catch {
      setAvailableSchools([]);
      setLoadingSchools(false);
    }
  }, []);

  // Programs by areas (+ degree) برای dropdown
  const fetchProgramsByAreasAndLevel = useCallback(
    async (areas: string[], degreeLevel?: string) => {
      setAvailablePrograms([]);
      if (!areas?.length || !degreeLevel) {
        setLoadingPrograms(false);
        return;
      }
      setLoadingPrograms(true);
      try {
        const token = localStorage.getItem("token");
        const results = await Promise.all(
          areas.map((areaId) =>
            fetch(
              `${API_URL}/program-data/by-area?areaOfStudy=${areaId}&degreeLevel=${encodeURIComponent(
                degreeLevel
              )}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            ).then((r) => (r.ok ? r.json() : { programs: [] }))
          )
        );
        const merged = results.flatMap((r: any) => r.programs || []);
        const unique = new Map<string, any>();
        merged.forEach((p: any) => unique.set(String(p.id), p));
        setAvailablePrograms(
          Array.from(unique.values()).map((p: any) => ({
            value: String(p.id),
            label: p.name,
          }))
        );
        setLoadingPrograms(false);
      } catch {
        setAvailablePrograms([]);
        setLoadingPrograms(false);
      }
    },
    []
  );

  // Initial Favorites load from the API
  const loadProgramFavorites = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }

    const res = await fetch(`${API_URL}/favorites`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        navigate("/auth?mode=login");
      }
      return;
    }

    const data = await res.json();
    const ids: string[] = Array.isArray(data?.favorites) ? data.favorites : [];
    const map = ids.reduce((acc: Record<number, boolean>, id) => {
      const n = Number(id);
      if (!Number.isNaN(n)) acc[n] = true;
      return acc;
    }, {});
    setFavorites(map);
  }, [navigate]);

  // Fetch Programs from API
  const fetchPrograms = useCallback(
    async (
      pageNum: number = 1,
      isLoadMore: boolean = false,
      filtersOverride?: Record<string, string>
    ) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth?mode=login");
          return;
        }
        if (isLoadMore) setLoadingMore(true);
        else {
          setLoading(true);
          setNoResults(false);
        }

        const qp = new URLSearchParams();
        qp.append("page", String(pageNum));
        qp.append("limit", "10");

        const f = filtersOverride || mapFiltersToApiParams(selectedFilters);
        Object.entries(f).forEach(([k, v]) => {
          if (v) qp.append(k, v);
        });

        const res = await fetch(
          `${API_URL}/program-data/find?${qp.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            navigate("/auth?mode=login");
            return;
          }
          if (res.status === 404) {
            setNoResults(true);
            if (!isLoadMore) setPrograms([]);
            setHasMore(false);
            setLoading(false);
            setLoadingMore(false);
            return;
          }
          throw new Error(`Failed to fetch programs: ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data.programs)) {
          setPrograms((prev) =>
            isLoadMore ? [...prev, ...data.programs] : data.programs
          );
          setHasMore(Boolean(data.hasMore));
          setNoResults(data.programs.length === 0 && !isLoadMore);

          if (!isLoadMore) {
            const favs = data.programs.reduce(
              (acc: Record<number, boolean>, p: Program) => {
                acc[p.id] = p.favorite || false;
                return acc;
              },
              {}
            );
            setFavorites(favs);
          }
        } else {
          if (!isLoadMore) {
            setPrograms([]);
            setNoResults(true);
          }
          setHasMore(false);
        }

        if (data.userPreferences && !isLoadMore) {
          setUserPreferences(data.userPreferences);
        }

        setLoading(false);
        setLoadingMore(false);
      } catch {
        setLoading(false);
        setLoadingMore(false);
        toast({
          title: "Error",
          description: "Failed to load programs.",
          variant: "destructive",
        });
      }
    },
    [navigate, selectedFilters, toast]
  );

  // loadProgram  to list
  const fetchProgramList = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(`${API_URL}/program-data/program-list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    const ids = Array.isArray(data?.programList) ? data.programList : [];
    setProgramList(ids.map(String));
  }, []);

  useEffect(() => {
    loadProgramFavorites();
    fetchProgramList();
  }, [loadProgramFavorites, fetchProgramList]);

  // ---------------- Init: فقط یک API برای لود اولیه ----------------
  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }
      setLoading(true);
      setNoResults(false);

      try {
        const res = await fetch(
          `${API_URL}/program-data/find?page=1&limit=10`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          setNoResults(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        console.log("Program data:", data);

        setPrograms(Array.isArray(data.programs) ? data.programs : []);
        setHasMore(Boolean(data.hasMore));

        const up: UserPreference = data.userPreferences || {};
        setUserPreferences(up);

        const initSelected: FiltersState = {
          orderBy: "qs_rank",
        };

        if (up.country) {
          const cid =
            typeof up.country === "object"
              ? String((up.country as any).id ?? (up.country as any).country)
              : String(up.country);
          initSelected.country = cid;
        }
        if (up.level) {
          initSelected.degreeLevel =
            up.level === "Ph.D." ? "PhD" : String(up.level);
        }
        if (up.areaOfStudy?.id) {
          initSelected.areaOfStudy = [String(up.areaOfStudy.id)];
        }
        if (up.program) {
          initSelected.program = [String(up.program)];
        }

        if (up.englishTest) {
          initSelected.english = String(up.englishTest);
        }

        setSelectedFilters(initSelected);

        if (initSelected.country) {
          await fetchStates(initSelected.country);
          await fetchSchoolsForDropdown(initSelected.country);
        }
        if (initSelected.areaOfStudy?.length && initSelected.degreeLevel) {
          await fetchProgramsByAreasAndLevel(
            initSelected.areaOfStudy,
            initSelected.degreeLevel
          );
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to initialize page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [
    navigate,
    fetchProgramsByAreasAndLevel,
    fetchSchoolsForDropdown,
    fetchStates,
    toast,
  ]);

  // ---------------- تغییرات UI فیلترها (بدون fetch نتایج) ----------------

  const handleFilterChange = useCallback(
    (key: keyof FiltersState, value?: string) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev, [key]: value };
        if (key === "country") {
          next.state = [];
          next.school = undefined;

          if (value) {
            fetchStates(value);
            fetchSchoolsForDropdown(value);
          } else {
            setAvailableStates([]);
            setAvailableSchools([]);
          }
        }
        if (key === "degreeLevel") {
          const areas = Array.isArray(next.areaOfStudy) ? next.areaOfStudy : [];
          if (areas.length && value) {
            fetchProgramsByAreasAndLevel(areas, value);
          } else {
            setAvailablePrograms([]);
          }
        }
        return next;
      });
    },
    [fetchProgramsByAreasAndLevel, fetchSchoolsForDropdown, fetchStates]
  );

  const handleMultiFilterChange = useCallback(
    (key: keyof FiltersState, values: string[]) => {
      setSelectedFilters((prev) => {
        const next = { ...prev, [key]: values };
        if (key === "areaOfStudy") {
          const level = next.degreeLevel;
          if (values.length && level) {
            fetchProgramsByAreasAndLevel(values, level);
          } else {
            setAvailablePrograms([]);
            next.program = [];
          }
        }
        return next;
      });
    },
    [fetchProgramsByAreasAndLevel]
  );

  // ---------------- Apply (اعمال ۷ فیلتر مثل FindSchool) ----------------
  const isApplyEnabled = useMemo(() => {
    return Boolean(
      selectedFilters.country &&
        selectedFilters.degreeLevel &&
        Array.isArray(selectedFilters.areaOfStudy) &&
        selectedFilters.areaOfStudy.length > 0
    );
  }, [
    selectedFilters.country,
    selectedFilters.degreeLevel,
    selectedFilters.areaOfStudy,
  ]);

  const applyFilters = () => {
    setPage(1);
    setPrograms([]);
    const params = mapFiltersToApiParams({
      country: selectedFilters.country,
      state: selectedFilters.state,
      school: selectedFilters.school,
      degreeLevel: selectedFilters.degreeLevel,
      areaOfStudy: selectedFilters.areaOfStudy,
      program: selectedFilters.program,
      orderBy: selectedFilters.orderBy || "qs_rank",

      english: selectedFilters.english,
      englishScore: selectedFilters.englishScore,
      gpa: selectedFilters.gpa,
      gre: selectedFilters.gre,
      deadline: selectedFilters.deadline,
      deadlineMonths: selectedFilters.deadlineMonths,
    });
    fetchPrograms(1, false, params);
  };

  // ---------------- سایر هندلرها (بدون تغییر کارت‌ها) ----------------
  const handleProgramInformation = (programId: number) =>
    navigate(`/dashboard/programs/${programId}`, {
      state: {
        from: { path: "/dashboard", tab: "FindPrograms" },

        filters: selectedFilters,
        scrollY: window.scrollY,
      },
    });

  const toggleFavorite = useCallback(
    async (programId: number) => {
      const isFav = !!favorites[programId];
      const action = isFav ? "remove" : "add";
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/auth?mode=login");
          return;
        }
        const res = await fetch(`${API_URL}/program-data/favorites`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ programId, action }),
        });
        if (!res.ok) throw new Error("Failed to update favorites");

        setFavorites((prev) => ({ ...prev, [programId]: !isFav }));

        toast({
          title: isFav ? "Removed from favorites" : "Added to favorites",
          description: "",
        });
      } catch {
        toast({
          title: "Error",
          description: "Could not update favorites.",
          variant: "destructive",
        });
      }
    },
    [favorites, toast, navigate]
  );

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPrograms(nextPage, true);
  };

  const toggleProgramInList = async (
    programId: number,
    programName?: string
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }

    const isInList = programList.includes(String(programId));
    const action = isInList ? "remove" : "add";

    try {
      const res = await fetch(`${API_URL}/program-data/program-list`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programId, action }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && Array.isArray(data?.programList)) {
        setProgramList(data.programList.map(String));
        toast({
          title: action === "add" ? "Added to List" : "Removed from List",
          description: programName,
        });
      } else {
        toast({
          title: "Error",
          description: data?.message ?? "Failed to update list.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Network error",
        description: "Request failed.",
        variant: "destructive",
      });
    }
  };
  //n8n help function for program
  // Snapshot فعلی فیلترها + سرچ (برای ارسال به n8n)
  const getFilterSnapshot = (): FilterSnapshot => ({
    country: selectedFilters.country,
    state: selectedFilters.state,
    school: selectedFilters.school,
    degreeLevel: selectedFilters.degreeLevel,
    areaOfStudy: selectedFilters.areaOfStudy,
    program: selectedFilters.program,
    orderBy: selectedFilters.orderBy,
    // searchQuery, // اگر داری
  });

  // Patch روی فیلترها + fetch نتایج 2/3 (برنامه‌ها)
  const applyFilterPatchAndFetch = async (patch: FilterPatch) => {
    const next = mergeFilterPatch(getFilterSnapshot(), patch);

    // merge در state صفحه
    setSelectedFilters((prev) => ({
      ...prev,
      country: next.country,
      state: next.state,
      school: next.school,
      degreeLevel: next.degreeLevel,
      areaOfStudy: next.areaOfStudy,
      program: next.program,
      orderBy: next.orderBy,
    }));

    // fetch مجدد نتایج برنامه‌ها
    setPage(1);
    setHasMore(true);
    await fetchPrograms(1, false);
  };
  const {
    messages: chatMessages,
    isChatBusy,
    pendingProposal,
    sendQuickReply,
    sendMessage,
    confirmPendingProposal,
    clearPendingProposal,
    setMessages,
  } = useChatController({
    pageId: PAGE_ID,
    threadKey: `${PAGE_ID}:${sessionId}`,
    getFilterSnapshot,
    applyFilterPatchAndFetch,
    onToast: ({ title, description, variant }) =>
      toast({ title, description, variant: (variant as any) || "default" }),
    // مسیر فوری: اگر n8nUrl ندادی، خود هوک به cloud وصل می‌شود.
  });

  function previewTitle(text: string, max = 40) {
    const clean = (text || "").replace(/\s+/g, " ").trim();
    return clean.length > max
      ? clean.slice(0, max) + "…"
      : clean || "Untitled chat";
  }
  useEffect(() => {
    const handler = (e: any) => {
      const { programId, action, programList } = e.detail || {};
      // اگر خودت programList محلی داری:
      if (Array.isArray(programList)) {
        setProgramList(programList.map(String));
      } else if (programId && action) {
        setProgramList((prev) => {
          const set = new Set(prev.map(String));
          if (action === "remove") set.delete(String(programId));
          if (action === "add") set.add(String(programId));
          return Array.from(set);
        });
      }
    };
    window.addEventListener("program-list:update", handler as EventListener);
    return () =>
      window.removeEventListener(
        "program-list:update",
        handler as EventListener
      );
  }, []);

  useEffect(() => {
    const userMsgs = chatMessages.filter((m) => m.type === "user");
    if (userMsgs.length === 1) {
      const now = Date.now();
      upsertSessionMetaLocal(PAGE_ID, {
        id: sessionId,
        title: previewTitle(userMsgs[0].content),
        createdAt: now,
        updatedAt: now,
        messageCount: chatMessages.length,
      });
      setSessions(listSessionsLocal(PAGE_ID));
    } else if (userMsgs.length > 1) {
      // آپدیت شمارش/زمان
      const list = listSessionsLocal(PAGE_ID);
      const existing = list.find((s) => s.id === sessionId);
      if (existing) {
        upsertSessionMetaLocal(PAGE_ID, {
          ...existing,
          updatedAt: Date.now(),
          messageCount: chatMessages.length,
        });
        setSessions(listSessionsLocal(PAGE_ID));
      }
    }
  }, [chatMessages, sessionId]);

  useEffect(() => {
    const onBye = () => {
      if (chatMessages.length > 0) {
        finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
      }
    };
    window.addEventListener("beforeunload", onBye);
    return () => {
      onBye();
      window.removeEventListener("beforeunload", onBye);
    };
  }, [sessionId, chatMessages.length]);

  const handleNewChat = () => {
    if (chatMessages.length > 0) {
      finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
    }
    setSessionId(makeSessionId()); // سشن جدید؛ meta بعد از اولین پیام ساخته می‌شود
    setSessions(listSessionsLocal(PAGE_ID));
  };

  const handleSelectSession = (id: string) => {
    if (id === sessionId) return;
    setLoadingSession(true);
    setSessionId(id);
    setTimeout(() => setLoadingSession(false), 300); // اسکلتینگ کوتاه
  };
  //---------------------UI chat ----------------------
  const chatComponent = (
    <>
      {/* Header */}
      {/* <div className="border-b px-4 py-3 rounded-t-lg border-border bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold">QuestApply Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Ask me about programs
            </p>
          </div>
        </div>
      </div> */}
      <ChatHeader
        sessions={sessions}
        currentSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        // onViewOlder / loadingOlder اگر بعداً Redis وصل شد
      />

      {/* History */}
      <div className="flex-1 overflow-hidden">
        <ChatHistory
          messages={chatMessages}
          onResultClick={() => {}}
          onQuickReply={sendQuickReply}
          showTyping={isChatBusy}
          loadingSession={loadingSession}
          welcomeMessage="Hello! Ask anything you want about the programs.🙂"
        />
      </div>

      {/* دکمه Filter فقط وقتی n8n پیشنهاد فیلتر داده */}
      {pendingProposal && (
        <div className="px-3 pt-2">
          <Button
            onClick={confirmPendingProposal}
            disabled={isChatBusy}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {pendingProposal.label || "Filter"}
          </Button>
        </div>
      )}

      {/* Composer */}
      <div className="flex-shrink-0">
        <ChatComposer
          onSendMessage={sendMessage}
          placeholder="Ask about programs, requirements, costs..."
          isLoading={isChatBusy}
        />
      </div>
    </>
  );

  // ---------------- UI ----------------
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Programs
        </motion.h1>
        <motion.div
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {programsToCompare.length > 0 && (
            <Button
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                navigate(
                  `/dashboard/compare/programs/${encodeURIComponent(
                    programsToCompare.join(",")
                  )}`
                )
              }
            >
              Compare Selected ({programsToCompare.length})
            </Button>
          )}
          Start your application on this page
        </motion.div>
      </div>

      {/* ===== Filters ===== */}
      <motion.div
        className="mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-gray-500"
            >
              <path
                d="M3 4.5h18M7 12h10M11 19.5h2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="font-semibold text-gray-700 dark:text-gray-200">
              Filters
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            {/* Country (single) */}
            <FilterDropdown
              label="Country"
              icon={<span>{filterIcons.country}</span>}
              options={countryOptions}
              onSelect={(v) => handleFilterChange("country", v)}
              selectedValue={selectedFilters.country || ""}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* State (multi + counter) */}
            <FilterDropdown
              label="State"
              icon={<span>{filterIcons.state}</span>}
              options={availableStates}
              multiple
              showCount
              selectedValues={selectedFilters.state || []}
              onChange={(vals) =>
                handleMultiFilterChange("state", vals as string[])
              }
              disabled={
                loadingStates ||
                !selectedFilters.country ||
                availableStates.length === 0
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* School (single) */}
            <FilterDropdown
              label="School"
              icon={<span>{filterIcons.schools}</span>}
              options={availableSchools}
              onSelect={(v) => handleFilterChange("school", v)}
              selectedValue={selectedFilters.school || ""}
              disabled={
                loadingSchools ||
                !selectedFilters.country ||
                availableSchools.length === 0
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Degree Level (single) */}
            <FilterDropdown
              label="Degree Level"
              icon={<span>{filterIcons.degreeLevel}</span>}
              options={degreeLevelOptions}
              onSelect={(v) => handleFilterChange("degreeLevel", v)}
              selectedValue={selectedFilters.degreeLevel || ""}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Area of Study (multi + counter) */}
            <FilterDropdown
              label="Area of Study"
              icon={<span>{filterIcons.areaOfStudy}</span>}
              options={areaOptions}
              multiple
              showCount
              selectedValues={selectedFilters.areaOfStudy || []}
              onChange={(vals) =>
                handleMultiFilterChange("areaOfStudy", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Programs (multi + counter) */}
            <FilterDropdown
              label="Program"
              icon={<span>{filterIcons.programs}</span>}
              options={availablePrograms}
              multiple
              showCount
              selectedValues={selectedFilters.program || []}
              onChange={(vals) =>
                handleMultiFilterChange("program", vals as string[])
              }
              disabled={
                loadingPrograms ||
                !(
                  selectedFilters.areaOfStudy &&
                  selectedFilters.areaOfStudy.length > 0
                ) ||
                !selectedFilters.degreeLevel ||
                availablePrograms.length === 0
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Order By (single) */}
            <FilterDropdown
              label="Order By"
              icon={<span>{filterIcons.orderBy}</span>}
              options={orderByProgramOptions}
              onSelect={(v) => handleFilterChange("orderBy", v)}
              selectedValue={selectedFilters.orderBy || "qs_rank"}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* ===== باقی فیلترها: منطق قبلی؛ فقط English مقدار اولیه از userPreferences ===== */}

            <DeadlineDropdown
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
              value={{
                season: selectedFilters.deadline, // قبلاً string
                months: selectedFilters.deadlineMonths || [], // جدید
              }}
              onChange={({ season, months }) => {
                setSelectedFilters((p) => ({
                  ...p,
                  deadline: season || "", // اگر نخواستی خالی شود، همون قبلی را نگه دار
                  deadlineMonths: months || [],
                }));
              }}
              apiBase={`${API_URL}/program-data`}
              authToken={localStorage.getItem("token") || undefined}
              otherParams={{
                country: selectedFilters.country,
                degreeLevel: selectedFilters.degreeLevel,
                state: selectedFilters.state, // CSV auto
                school: selectedFilters.school,
                areaOfStudy: selectedFilters.areaOfStudy,
                program: selectedFilters.program,
                english: selectedFilters.english,
                gpa: selectedFilters.gpa,
                gre: selectedFilters.gre,
              }}
            />

            <EnglishDropdown
              icon={<span>{filterIcons.english}</span>}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              value={{
                test: selectedFilters.english as any,
                score: selectedFilters.englishScore
                  ? Number(selectedFilters.englishScore)
                  : undefined,
              }}
              onChange={(v) =>
                setSelectedFilters((p) => ({
                  ...p,
                  english: v.test,
                  englishScore: v.score?.toString(),
                }))
              }
            />

            <GpaDropdown
              label="GPA"
              icon={<span>{filterIcons.gpa}</span>}
              value={selectedFilters.gpa || ""} // مقدار فعلی
              onChange={(v) =>
                setSelectedFilters((p) => ({ ...p, gpa: v || "" }))
              } // به state بریز
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
            />

            <FilterDropdown
              label="GRE"
              icon={<span>{filterIcons.gre}</span>}
              options={[
                { value: "Required", label: "Required" },
                { value: "Optional", label: "Optional" },
                { value: "Not Required", label: "Not Required" },
                { value: "Not Accepted", label: "Not Accepted" },
                {
                  value: "Not Required but strongly recommended",
                  label: "Not Required but Strongly Recommended (NRBSR)",
                },
                { value: "Contigent", label: "Contingent" },
              ]}
              onSelect={(value) => {
                setSelectedFilters((p) => ({ ...p, gre: value || "" }));
              }}
              selectedValue={selectedFilters.gre || ""}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />
            {/* Apply (اعمال ۷ فیلتر) */}
            <div className="mt-3 flex justify-end ">
              <Button
                type="button"
                onClick={applyFilters}
                disabled={!isApplyEnabled || isChatBusy}
                className={`ml-2 w-full ${
                  isApplyEnabled && !isChatBusy
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                Filter
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== Results ===== */}

      {/* chat paylod */}
      <DualPaneLayout
        chat={chatComponent}
        results={[
          <ResultsColumn
            key="programs-results"
            padded={false}
            emptyState={
              <div className="text-muted-foreground">No results to display</div>
            }
          >
            {/* ⬇️ اینجا همون JSX فعلیِ نتایج برنامه‌ها رو بدون تغییر paste کن */}
            {/* مثال فرضی: */}
            {!loading && noResults && (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No programs found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters to find more programs.
                </p>
              </div>
            )}

            {!loading && !noResults && programs.length > 0 && (
              <div className="space-y-6">
                {programs.map((program, index) => (
                  <ProgramResultCard
                    key={program.id}
                    index={index}
                    program={program}
                    selectedEnglish={selectedFilters.english || "TOEFL"}
                    isCompared={programsToCompare.includes(program.id)}
                    isFavorite={!!favorites[program.id]}
                    isInList={programList.includes(String(program.id))}
                    onToggleCompare={(id) =>
                      setProgramsToCompare((prev) =>
                        prev.includes(id)
                          ? prev.filter((x) => x !== id)
                          : [...prev, id]
                      )
                    }
                    onToggleFavorite={(id) => toggleFavorite(id)}
                    onProgramInfo={(id) => handleProgramInformation(id)}
                    onToggleList={(id, name) => toggleProgramInList(id, name)}
                  />
                ))}

                {hasMore && programs.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {loadingMore ? "Loading..." : "Load More Programs"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ⬆️ پایان JSX نتایج شما */}
          </ResultsColumn>,
        ]}
        layout={{
          separateBoxes: true,
          boxGap: "6",
          chatRatio: 0.35,
          chatHeightMode: "vh",
          chatHeight: 90,
          stickyChat: false,
        }}
        resultsGrid={{
          minCardWidth: 280, // ← قبلاً 360 باعث اسکرول افقی می‌شد
          gap: "6",
          fill: "auto-fit",
          densePacking: true,
          equalizeCardHeight: true,
          distributeCardWhitespace: true,
        }}
      />

      {loading && programs.length === 0 && !noResults && <LoadingSkeleton />}
    </div>
  );
};

export default FindPrograms;
