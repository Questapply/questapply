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
  english?: string; // فقط مقدار اولیه‌اش از userPreferences می‌نشیند (بی‌تغییر در منطق)
  gpa?: string;
  gre?: string;
  deadline?: string;
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
      if (value.length) out[key] = value.map(String).join(",");
      return;
    }
    const s = String(value).trim();
    if (!s) return;
    out[key] = s;
  });
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
      const res = await fetch(`${API_BASE}/states?country=${countryId}`, {
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
        `${API_BASE}/schools?country=${countryId}&page=1&limit=50`,
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

    const res = await fetch(`${API_BASE}/favorites`, {
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
          next.program = [];
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
      gpa: selectedFilters.gpa,
      gre: selectedFilters.gre,
      deadline: selectedFilters.deadline,
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

          <div className="flex flex-wrap gap-2">
            {/* Country (single) */}
            <FilterDropdown
              label="Country"
              icon={<span>{filterIcons.country}</span>}
              options={countryOptions}
              onSelect={(v) => handleFilterChange("country", v)}
              selectedValue={selectedFilters.country || ""}
              buttonClassName="!py-1.5"
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
              buttonClassName="!py-1.5"
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
              buttonClassName="!py-1.5"
            />

            {/* Degree Level (single) */}
            <FilterDropdown
              label="Degree Level"
              icon={<span>{filterIcons.degreeLevel}</span>}
              options={degreeLevelOptions}
              onSelect={(v) => handleFilterChange("degreeLevel", v)}
              selectedValue={selectedFilters.degreeLevel || ""}
              buttonClassName="!py-1.5"
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
              buttonClassName="!py-1.5"
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
              buttonClassName="!py-1.5"
            />

            {/* Order By (single) */}
            <FilterDropdown
              label="Order By"
              icon={<span>{filterIcons.orderBy}</span>}
              options={orderByProgramOptions}
              onSelect={(v) => handleFilterChange("orderBy", v)}
              selectedValue={selectedFilters.orderBy || "qs_rank"}
              buttonClassName="!py-1.5"
            />

            {/* ===== باقی فیلترها: منطق قبلی؛ فقط English مقدار اولیه از userPreferences ===== */}
            <FilterDropdown
              label="Deadline"
              icon={<span>{filterIcons.deadline}</span>}
              options={[
                { value: "deadline_fall", label: "Fall" },
                { value: "deadline_winter", label: "Winter" },
                { value: "deadline_spring", label: "Spring" },
                { value: "deadline_summer", label: "Summer" },
              ]}
              onSelect={(value) => {
                setSelectedFilters((p) => ({ ...p, deadline: value || "" }));
              }}
              selectedValue={selectedFilters.deadline || ""}
              buttonClassName="!py-1.5"
            />

            <FilterDropdown
              label="English"
              icon={<span>{filterIcons.english}</span>}
              options={englishTestOptions}
              onSelect={(value) => {
                setSelectedFilters((p) => ({ ...p, english: value || "" }));
              }}
              selectedValue={selectedFilters.english || ""}
              buttonClassName="!py-1.5"
            />

            <FilterDropdown
              label="GPA"
              icon={<span>{filterIcons.gpa}</span>}
              options={gpaOptions.map((v) => ({ value: v, label: v }))}
              onSelect={(value) => {
                setSelectedFilters((p) => ({ ...p, gpa: value || "" }));
              }}
              selectedValue={selectedFilters.gpa || ""}
              buttonClassName="!py-1.5"
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
              buttonClassName="!py-1.5"
            />
            {/* Apply (اعمال ۷ فیلتر) */}
            <div className="flex items-center">
              <Button
                type="button"
                onClick={applyFilters}
                disabled={!isApplyEnabled || isChatBusy}
                className={`ml-2 ${
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
                  <AnimatedCard
                    key={program.id}
                    delay={0.2 + index * 0.1}
                    className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 w-full"
                  >
                    <CardContent className="p-3 md:p-5 min-w-0">
                      <div className="flex flex-col space-y-5 md:space-y-6 min-w-0">
                        <div className="flex justify-between gap-3 min-w-0">
                          <div className="flex items-start gap-3 md:gap-4 min-w-0">
                            <motion.div
                              whileHover={{ rotate: 5 }}
                              transition={{ duration: 0.2 }}
                              className="shrink-0"
                            >
                              <img
                                src={program.schoolLogo}
                                alt={`${program.school} logo`}
                                className="w-12 h-12 md:w-16 md:h-16 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
                              />
                            </motion.div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white text-nowrap">
                                  {program.name}
                                </h3>
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300  rounded-full  font-medium text-[11px] md:text-xs px-2 py-1">
                                  {program.degreeType}
                                </span>
                                <span
                                  className={cn(
                                    " rounded-full  font-medium text-[11px] md:text-xs px-2 py-1",
                                    program.fit === "High Fit"
                                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                  )}
                                >
                                  {program.fit}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs md:text-sm ">
                                <span>{program.degree}</span>
                                <span className="text-xs mx-1">•</span>
                                <span className="truncate">
                                  {program.school}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              aria-pressed={programsToCompare.includes(
                                program.id
                              )}
                              className={`flex items-center gap-1 ${
                                programsToCompare.includes(program.id)
                                  ? "bg-green-900/20 text-green-400 border-green-800 hover:bg-green-800/30 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-800/30 h-9 md:h-10 px-3 text-xs md:text-sm"
                                  : "bg-blue-900/20 text-blue-400 border-blue-800 hover:bg-blue-800/30 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-800/30 h-9 md:h-10 px-3 text-xs md:text-sm"
                              }`}
                              onClick={() =>
                                setProgramsToCompare((prev) =>
                                  prev.includes(program.id)
                                    ? prev.filter((x) => x !== program.id)
                                    : [...prev, program.id]
                                )
                              }
                            >
                              {programsToCompare.includes(program.id) ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <GitCompare className="h-4 w-4" />
                                  Compare
                                </>
                              )}
                            </Button>
                            <button
                              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors h-9 w-9 md:h-10 md:w-10 rounded-md border flex items-center justify-center"
                              onClick={() => toggleFavorite(program.id)}
                              aria-label={
                                favorites[program.id]
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              {favorites[program.id] ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6 fill-red-500"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-6 w-6"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 min-w-0">
                            <h4 className=" font-medium text-gray-700 dark:text-gray-300  text-sm md:text-base  mb-2 md:mb-3">
                              Program Features
                            </h4>
                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                  🏆
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    QS Ranking
                                  </div>
                                  <div className="font-normal md:font-medium">
                                    # {program.qsRanking}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                  ⏱️
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Duration
                                  </div>
                                  <div className="font-normal md:font-medium">
                                    {program.duration}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                  🏫
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Campus
                                  </div>
                                  <div className="font-normal md:font-medium">
                                    {program.campus}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                                  🗣️
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Language
                                  </div>
                                  <div className="font-normal md:font-medium">
                                    {program.language}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg md:p-3 p-4 min-w-0">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 md:mb-3">
                              Application Deadline
                            </h4>
                            {program.deadline && program.deadline.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                                {program.deadline.map((dl, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-6 w-6 text-purple-500"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    <div className="text-sm font-normal text-gray-800 dark:text-gray-200 text-center">
                                      {dl.season}, {dl.date}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg shadow-sm">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-8 w-8 text-purple-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                                  No deadline
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Application Deadline
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 md:p-4 min-w-0">
                            <h4 className=" font-medium text-gray-700 dark:text-gray-300 text-sm md:text-base mb-2 md:mb-3">
                              Requirements (Min)
                            </h4>
                            <div className="flex justify-center gap-2 md:gap-4">
                              <StatCircle
                                value={
                                  (program as any)?.requirements?.[
                                    selectedFilters.english
                                      ? selectedFilters.english.toLowerCase()
                                      : "toefl"
                                  ]?.min
                                }
                                label={
                                  selectedFilters.english
                                    ? selectedFilters.english.toUpperCase()
                                    : "TOEFL"
                                }
                                color="blue"
                                isPercentage={false}
                                size="lg"
                                strokeWidth={4}
                                className="shrink-0"
                              />
                              <StatCircle
                                value={(program as any)?.requirements?.gpa?.min}
                                label="GPA"
                                color="green"
                                isPercentage={false}
                                size="lg"
                                strokeWidth={4}
                                className="shrink-0"
                              />

                              {/* GRE Status */}
                              {(() => {
                                const greRaw =
                                  (program as any)?.requirements?.gre?.status ??
                                  (program as any)?.requirements?.gre;

                                const gre = normalizeGreStatus(greRaw);
                                const style = getGREStatusStyle(gre);

                                return (
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`rounded-full w-20 h-20 flex items-center justify-center border-4 shadow-sm ${style.border} ${style.bg}`}
                                    >
                                      <span
                                        className={`text-xl font-bold ${style.text}`}
                                      >
                                        {style.icon}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                      GRE
                                    </span>
                                    <span
                                      className={`text-xs ${style.text} font-medium`}
                                    >
                                      {gre}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end mt-2 gap-2 md:gap-3">
                          <Button
                            variant="outline"
                            className="text-purple-600 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full sm:w-auto h-9 md:h-10 px-3 text-xs md:text-sm"
                            onClick={() => handleProgramInformation(program.id)}
                          >
                            Program Information
                          </Button>
                          <Button
                            variant="ghost"
                            className={`${
                              programList.includes(String(program.id))
                                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/30 w-full sm:w-auto h-9 md:h-10 px-3 text-xs md:text-sm"
                                : "bg-green-600 hover:bg-green-700 shadow-green-500/20 hover:shadow-green-500/30 w-full sm:w-auto h-9 md:h-10 px-3 text-xs md:text-sm"
                            }shadow-md hover:shadow-lg transition-all`}
                            onClick={() =>
                              toggleProgramInList(program.id, program.name)
                            }
                          >
                            {programList.includes(String(program.id))
                              ? "Remove from List"
                              : "Add to List"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </AnimatedCard>
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
