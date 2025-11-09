// FindSchools.tsx  — updated for: single/multi rules, clear-all, no "None"

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import FilterDropdown from "./../filters/FilterDropdown";
import SchoolCard from "./SchoolCard";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton";
import FindSchoolsTourGuide from "./FindSchoolsTourGuide";
import { UserPreferences, FilterOption } from "../../types";
import { School } from "../entities/school/SchoolsData";
import type { UserProfile } from "@/components/chat/actions";
import ChatHeader from "../chat/ChatHeader";
import { useAuth } from "@/context/AuthContext";
import {
  makeSessionId,
  listSessionsLocal,
  upsertSessionMetaLocal,
  updateSessionTitleLocal,
  finalizeSessionLocal,
} from "../chat/storage";

import { orderBySchoolOptions, filterIcons } from "../filters/FilterData";
import { useChatController } from "../chat/useChatController";
import { mergeFilterPatch } from "../chat/mergeFilters";
import type { FilterSnapshot, FilterPatch } from "../chat/actions";
import { Skeleton } from "../ui/skeleton";

// 👇 چت
import DualPaneLayout from "../chat/DualPaneLayout";
import ChatHistory, { ChatMessage } from "../chat/ChatHistory";
import ChatComposer from "../chat/ChatComposer";
import ResultsColumn from "../chat/ResultsColumn";
import type { SessionMeta } from "../chat/storage";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ------------------------------------------------------------------
// 1) تغییر نوع State: فقط state و school چندانتخابی هستند.
//    سایر فیلدها تک‌انتخابی شدند.
// ------------------------------------------------------------------
type FiltersState = {
  country?: string;
  state?: string[]; // multi ✅
  school?: string[]; // ← قبلاً string بود؛ حالا multi ✅
  degreeLevel?: string; // single
  areaOfStudy?: string; // ← قبلاً string[]؛ حالا single ✅
  program?: string; // ← قبلاً string[]؛ حالا single ✅
  orderBy?: string; // single
};

// Helpers
const getLabelByValue = (opts: FilterOption[], val?: string) =>
  opts.find((o) => o.value === (val ?? ""))?.label || "";

const getLabelsByValues = (opts: FilterOption[], values?: string[]) => {
  if (!values?.length) return [];
  const set = new Set(values.map(String));
  return opts.filter((o) => set.has(o.value)).map((o) => o.label);
};

const mapOrderByToApi = (value: string) => {
  switch (value) {
    case "QS Ranking":
    case "qs_rank":
      return "qs_rank";
    case "US News Rank":
    case "us_news_rank":
      return "us_news_rank";
    case "Forbes Rank":
    case "forbes_rank":
      return "forbes_rank";
    case "Shanghai Rank":
    case "shanghai_rank":
      return "shanghai_rank";
    case "Times Higher Education Rank":
    case "the_rank":
      return "the_rank";
    case "Cost Out of State":
      return "tuition_high_to_low";
    case "Cost In State":
      return "tuition_low_to_high";
    case "name_a_to_z":
    case "name_z_to_a":
      return value;
    default:
      return value;
  }
};

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

    out[key] = key === "orderBy" ? mapOrderByToApi(s) : s;
  });

  if (!out.orderBy) out.orderBy = "qs_rank";
  return out;
};

const PAGE_ID = "find-schools";
const GUEST_FILTER_KEY = `${PAGE_ID}:guestFilterUsed`;
const FILTER_WIDTH = "w-[150px] sm:w-[160px] md:w-[180px]";
const FILTER_BTN = "truncate";
const useIsGuest = (isAuthenticated: boolean | undefined) => !isAuthenticated;

const buildHeaders = (isGuest: boolean) => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (!isGuest) {
    const token = localStorage.getItem("token");
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
};

const goLoginWithReturn = (navigate: any) => {
  const ret = encodeURIComponent(
    window.location.pathname + window.location.search
  );
  navigate(`/auth?mode=login&return=${ret}`);
};

const FindSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [schoolsToCompare, setSchoolsToCompare] = useState<number[]>([]);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);

  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});

  const [noSchoolsFound, setNoSchoolsFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [availableStates, setAvailableStates] = useState<FilterOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  const [availablePrograms, setAvailablePrograms] = useState<FilterOption[]>(
    []
  );
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  const [availableSchoolsForDropdown, setAvailableSchoolsForDropdown] =
    useState<FilterOption[]>([]);
  const [loadingSchoolsForDropdown, setLoadingSchoolsForDropdown] =
    useState(false);
  const [showGate, setShowGate] = useState(false);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);

  const isInitialMount = useRef(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const isGuest = useIsGuest(isAuthenticated);
  // ---------------------- چت: بدون تغییر در منطق ----------------------
  const [sessionId, setSessionId] = useState<string>(() => makeSessionId());
  const [sessions, setSessions] = useState(() => listSessionsLocal(PAGE_ID));
  const [loadingSession, setLoadingSession] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  // بالای فایل کنار سایر useStateها
  const [guestCountries, setGuestCountries] = useState<FilterOption[]>([]);
  const [guestAreas, setGuestAreas] = useState<FilterOption[]>([]);
  const [guestFilterUsed, setGuestFilterUsed] = useState<boolean>(
    () => localStorage.getItem(GUEST_FILTER_KEY) === "1"
  );

  const fetchGuestCountries = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/meta/countries?guest=1`);
      if (!res.ok) return setGuestCountries([]);
      const data = await res.json();
      const items: FilterOption[] = (data.countries || []).map((c: any) => ({
        value: String(c.id),
        label: c.name,
      }));
      setGuestCountries(items);
    } catch {
      setGuestCountries([]);
    }
  }, []);

  const fetchGuestAreas = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/program-data/program-categories?guest=1`,
        {
          headers: buildHeaders(true), // guest
        }
      );
      if (!res.ok) return setGuestAreas([]);

      const data = await res.json();
      // ریسپانس: { categories: [...] }
      const items: FilterOption[] = (data.categories || []).map((cat: any) => ({
        value: String(cat.id),
        label: cat.name,
      }));

      setGuestAreas(items);
    } catch {
      setGuestAreas([]);
    }
  }, []);

  useEffect(() => {
    if (isGuest) {
      fetchGuestCountries();
      fetchGuestAreas();
    }
  }, [isGuest, fetchGuestCountries, fetchGuestAreas]);

  const allCountryOptions = useMemo<FilterOption[]>(() => {
    const src = userPreferences?.availableCountries?.length
      ? userPreferences.availableCountries.map((c: any) => ({
          id: c.id,
          name: c.name,
        }))
      : guestCountries.map((c) => ({ id: Number(c.value), name: c.label }));

    return src.map((country) => ({
      value: String(country.id),
      label: country.name,
    }));
  }, [userPreferences?.availableCountries, guestCountries]);

  const allAreaOfStudyOptions = useMemo<FilterOption[]>(() => {
    const src = userPreferences?.availableAreasOfStudy?.length
      ? userPreferences.availableAreasOfStudy.map((a: any) => ({
          id: a.id,
          name: a.name,
        }))
      : guestAreas.map((a) => ({ id: Number(a.value), name: a.label }));

    return src.map((a) => ({ value: String(a.id), label: a.name }));
  }, [userPreferences?.availableAreasOfStudy, guestAreas]);

  //کاربر مهان
  useEffect(() => {
    console.log("MOUNT FindSchools, auth?", isAuthenticated);
  }, [isAuthenticated]);

  const handleResultClick = useCallback((_resultData: any) => {}, []);

  const refreshSessions = useCallback(() => {
    setSessions(listSessionsLocal(PAGE_ID));
  }, []);
  const getUserProfile = useCallback((): UserProfile | null => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const user = JSON.parse(raw);
      return {
        id: user?.id ?? user?.userId ?? user?.uid,
        name: user?.name ?? user?.fullName ?? user?.username,
        email: user?.email,
        locale: user?.locale ?? user?.language,
      };
    } catch {
      return null;
    }
  }, []);

  // snapshot جدید با نوع‌های جدید
  const getFilterSnapshot = (): FilterSnapshot => ({
    country: selectedFilters.country,
    state: selectedFilters.state,
    school: selectedFilters.school,
    degreeLevel: selectedFilters.degreeLevel,
    areaOfStudy: selectedFilters.areaOfStudy,
    program: selectedFilters.program,
    orderBy: selectedFilters.orderBy,
  });

  const applyFilterPatchAndFetch = async (patch: FilterPatch) => {
    const next = mergeFilterPatch(getFilterSnapshot(), patch);
    setSelectedFilters((prev) => ({
      ...prev,
      country: next.country,
      state: next.state as string[] | undefined,
      school: next.school as string[] | undefined,
      degreeLevel: next.degreeLevel,
      areaOfStudy: next.areaOfStudy as string | undefined,
      program: next.program as string | undefined,
      orderBy: next.orderBy,
    }));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    applyFilters();
  };

  const {
    messages: chatMessages,
    isChatBusy,
    pendingProposal,
    sendMessage,
    sendQuickReply,
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
    getUserProfile,
  });

  function previewTitle(text: string, max = 40) {
    const clean = (text || "").replace(/\s+/g, " ").trim();
    return clean.length > max
      ? clean.slice(0, max) + "…"
      : clean || "Untitled chat";
  }

  const handleNewChat = () => {
    if (chatMessages.length > 0) {
      finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
    }
    setSessionId(makeSessionId());
    setSessions(listSessionsLocal(PAGE_ID));
  };

  const handleSelectSession = (id: string) => {
    if (id === sessionId) return;
    setLoadingSession(true);
    setSessionId(id);
    setTimeout(() => setLoadingSession(false), 300);
  };

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
      upsertSessionMetaLocal(PAGE_ID, {
        id: sessionId,
        title:
          listSessionsLocal(PAGE_ID).find((s) => s.id === sessionId)?.title ||
          "Untitled chat",
        createdAt:
          listSessionsLocal(PAGE_ID).find((s) => s.id === sessionId)
            ?.createdAt || Date.now(),
        updatedAt: Date.now(),
        messageCount: chatMessages.length,
      });
      setSessions(listSessionsLocal(PAGE_ID));
    }
  }, [chatMessages, sessionId]);

  useEffect(() => {
    const userMsgs = chatMessages.filter((m) => m.type === "user");
    if (userMsgs.length === 1) {
      const preview = userMsgs[0].content.slice(0, 40);
      updateSessionTitleLocal(PAGE_ID, sessionId, preview || "New chat");
      refreshSessions();
    }
  }, [chatMessages, sessionId, refreshSessions]);

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

  useEffect(() => {
    if (!isGuest) return; // فقط برای مهمان
    const alreadyShown = localStorage.getItem("guest_gate_shown") === "1";

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !alreadyShown) {
          setShowGate(true);
        }
      },
      { root: null, threshold: 0.6 } // وقتی 60% دکمه در دید باشد
    );

    if (loadMoreRef.current) obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [isGuest]);

  // ------------------ گزینه‌ها ------------------
  // const allCountryOptions = useMemo<FilterOption[]>(() => {
  //   return (userPreferences?.availableCountries || []).map((country) => ({
  //     value: String(country.id),
  //     label: country.name,
  //   }));
  // }, [userPreferences?.availableCountries]);

  // const allAreaOfStudyOptions = useMemo<FilterOption[]>(() => {
  //   return (userPreferences?.availableAreasOfStudy || []).map((a) => ({
  //     value: String(a.id),
  //     label: a.name,
  //   }));
  // }, [userPreferences?.availableAreasOfStudy]);

  const mappedDegreeLevelOptions = useMemo<FilterOption[]>(() => {
    const options = ["Bachelor", "Master", "PhD"];
    return options.map((option) => ({ value: option, label: option }));
  }, []);

  const mappedOrderBySchoolOptions = useMemo<FilterOption[]>(() => {
    return orderBySchoolOptions.map((value) => ({
      value,
      label:
        value === "qs_rank"
          ? "QS Ranking"
          : value === "us_news_rank"
          ? "US News Rank"
          : value === "forbes_rank"
          ? "Forbes Rank"
          : value === "shanghai_rank"
          ? "Shanghai Rank"
          : value === "the_rank"
          ? "Times Higher Education Rank"
          : value === "name_a_to_z"
          ? "Name A-Z"
          : value === "name_z_to_a"
          ? "Name Z-A"
          : value === "tuition_low_to_high"
          ? "Cost In State"
          : value === "tuition_high_to_low"
          ? "Cost Out of State"
          : value,
    }));
  }, []);

  const selectedCountryLabel = useMemo(
    () => getLabelByValue(allCountryOptions, selectedFilters.country),
    [allCountryOptions, selectedFilters.country]
  );

  // School چندانتخابی → نمایش لیبل اول صرفاً برای دکمه
  const selectedSchoolLabel = useMemo(() => {
    const labels = getLabelsByValues(
      availableSchoolsForDropdown,
      selectedFilters.school
    );
    return labels[0] || "";
  }, [availableSchoolsForDropdown, selectedFilters.school]);

  const selectedDegreeLevelLabel = useMemo(
    () =>
      getLabelByValue(mappedDegreeLevelOptions, selectedFilters.degreeLevel),
    [mappedDegreeLevelOptions, selectedFilters.degreeLevel]
  );

  const selectedOrderByLabel = useMemo(
    () => getLabelByValue(mappedOrderBySchoolOptions, selectedFilters.orderBy),
    [mappedOrderBySchoolOptions, selectedFilters.orderBy]
  );

  const selectedAreaOfStudyLabel = useMemo(
    () => getLabelByValue(allAreaOfStudyOptions, selectedFilters.areaOfStudy),
    [allAreaOfStudyOptions, selectedFilters.areaOfStudy]
  );

  const selectedProgramLabel = useMemo(
    () => getLabelByValue(availablePrograms, selectedFilters.program),
    [availablePrograms, selectedFilters.program]
  );

  const onCountrySelect = useCallback((id: string) => {
    if (isGuest && guestFilterUsed) return;
    setSelectedFilters((prev) => ({
      ...prev,
      country: String(id || ""),
      state: [],
      school: [],
    }));
  }, []);

  // --------- API helpers ---------
  const fetchStates = useCallback(async (countryId: string) => {
    setAvailableStates([]);
    if (!countryId) {
      setLoadingStates(false);
      return;
    }
    setLoadingStates(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/states?country=${countryId}&guest=${isGuest ? "1" : "0"}`,
        {
          method: "GET",
          headers: buildHeaders(isGuest),
        }
      );
      if (!res.ok) {
        setAvailableStates([]);
        setLoadingStates(false);
        return;
      }
      const data = await res.json();
      const states = (data.states || []).map((s: any) => ({
        value: String(s.id),
        label: s.name,
      }));
      setAvailableStates(states);
      setLoadingStates(false);
    } catch {
      setAvailableStates([]);
      setLoadingStates(false);
    }
  }, []);

  const fetchProgramsByAreasAndLevel = useCallback(
    async (areaIdList: string[], degreeLevel: string) => {
      setAvailablePrograms([]);
      if (!areaIdList?.length || !degreeLevel) {
        setLoadingPrograms(false);
        return;
      }
      setLoadingPrograms(true);
      try {
        const token = localStorage.getItem("token");
        const requests = areaIdList.map((id) =>
          fetch(
            `${API_URL}/program-data/by-area?areaOfStudy=${id}&degreeLevel=${encodeURIComponent(
              degreeLevel
            )}&guest=${isGuest ? "1" : "0"}`,
            {
              method: "GET",
              headers: buildHeaders(isGuest),
            }
          ).then((r) => (r.ok ? r.json() : { programs: [] }))
        );
        const results = await Promise.all(requests);
        const merged = results.flatMap((res: any) => res.programs || []);
        const uniqueMap = new Map<
          string,
          { id: string | number; name: string }
        >();
        merged.forEach((p: any) => uniqueMap.set(String(p.id), p));
        const uniquePrograms: FilterOption[] = Array.from(uniqueMap.values())
          .map((p) => ({ value: String(p.id), label: p.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setAvailablePrograms(uniquePrograms);
        setLoadingPrograms(false);
      } catch {
        setAvailablePrograms([]);
        setLoadingPrograms(false);
      }
    },
    []
  );

  const fetchSchoolsForDropdown = useCallback(
    async (countryId?: string, stateId?: string) => {
      setAvailableSchoolsForDropdown([]);
      if (!countryId) {
        setLoadingSchoolsForDropdown(false);
        return;
      }
      setLoadingSchoolsForDropdown(true);
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        params.append("orderBy", "name_a_to_z");
        params.append("ignoreUserDefaults", "1");
        params.append("limit", "200");
        if (countryId) params.append("country", String(countryId));
        if (stateId) params.append("state", String(stateId));
        if (isGuest) params.append("guest", "1");
        const res = await fetch(`${API_URL}/schools?${params.toString()}`, {
          method: "GET",
          headers: buildHeaders(isGuest),
        });
        if (!res.ok) {
          setAvailableSchoolsForDropdown([]);
          setLoadingSchoolsForDropdown(false);
          return;
        }
        const data = await res.json();
        const newSchools = data.schools || [];
        setAvailableSchoolsForDropdown(
          newSchools.map((s: any) => ({ value: String(s.id), label: s.name }))
        );
        setLoadingSchoolsForDropdown(false);
      } catch {
        setAvailableSchoolsForDropdown([]);
        setLoadingSchoolsForDropdown(false);
      }
    },
    []
  );

  // --------- Fetch main list  ---------
  const fetchSchoolsData = useCallback(
    async (
      pageNum: number,
      isLoadMore: boolean,
      filters: FiltersState,
      currentSearchQuery: string
    ) => {
      try {
        if (isGuest && isLoadMore && pageNum > 1) {
          setShowGate(true);
          return;
        }
        if (isLoadMore) setLoadingMore(true);
        else {
          setLoading(true);
          setNoSchoolsFound(false);
        }

        const queryParams = new URLSearchParams();
        queryParams.append("page", String(pageNum));
        queryParams.append("limit", "10");

        if (isGuest) {
          queryParams.append("guest", "1");
          queryParams.append("ignoreUserDefaults", "1");
        }

        const apiFilters = mapFiltersToApiParams(filters);
        Object.entries(apiFilters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        if (currentSearchQuery.trim())
          queryParams.append("search", currentSearchQuery.trim());

        const response = await fetch(
          `${API_URL}/schools?${queryParams.toString()}`,
          {
            method: "GET",

            headers: buildHeaders(isGuest),
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            // navigate("/auth?mode=login");
            return;
          }
          if (response.status === 404) {
            setNoSchoolsFound(true);
            setSchools(isLoadMore ? [] : []);
            setHasMore(false);
            setLoading(false);
            setLoadingMore(false);
            return;
          }
          throw new Error("Failed to fetch schools");
        }

        const data = await response.json();
        const newSchools = data.schools || [];
        setSchools((prev) =>
          isLoadMore ? [...prev, ...newSchools] : newSchools
        );
        setHasMore(data.hasMore === true);
        setNoSchoolsFound(newSchools.length === 0 && pageNum === 1);

        if (!isGuest && isInitialMount.current && data.userPreferences) {
          const effective = { ...data.userPreferences };
          if (selectedFilters.country) {
            effective.country = String(selectedFilters.country);
          }
          setUserPreferences(effective);
          isInitialMount.current = false;

          // پیش‌فرض‌ها
          const initial: FiltersState = { orderBy: "qs_rank" };
          if (data.userPreferences.country) {
            initial.country = String(data.userPreferences.country);
          }
          if (data.userPreferences.level) {
            initial.degreeLevel =
              data.userPreferences.level === "Ph.D."
                ? "PhD"
                : data.userPreferences.level;
          }
          if (data.userPreferences.areaOfStudy?.id) {
            initial.areaOfStudy = String(data.userPreferences.areaOfStudy.id); // single ✅
          }
          if (data.userPreferences.program) {
            initial.program = String(data.userPreferences.program); // single ✅
          }

          setSelectedFilters((prev) => ({ ...prev, ...initial }));

          if (initial.country) {
            fetchStates(initial.country);
            await fetchSchoolsForDropdown(initial.country, undefined);
          }
          if (initial.areaOfStudy && initial.degreeLevel) {
            await fetchProgramsByAreasAndLevel(
              [initial.areaOfStudy],
              initial.degreeLevel
            );
          }

          isInitialMount.current = false;
        }

        setLoading(false);
        setLoadingMore(false);
      } catch {
        setLoading(false);
        setLoadingMore(false);
        toast({
          title: "Error fetching schools",
          description:
            "An error occurred while fetching school data. Please try again.",
          variant: "destructive",
        });
      }
    },
    [
      navigate,
      toast,
      fetchStates,
      fetchProgramsByAreasAndLevel,
      fetchSchoolsForDropdown,
      selectedFilters.country,
      isGuest,
    ]
  );

  // --------- Effects ---------
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchSchoolsData(1, false, {}, "");
  }, [fetchSchoolsData]);

  useEffect(() => {
    if (selectedFilters.country) {
      fetchStates(selectedFilters.country);
      // School dropdown: اگر state چندتاست، بر اساس اولین state لود می‌کنیم (مثل قبل)
      fetchSchoolsForDropdown(
        selectedFilters.country,
        selectedFilters.state?.[0]
      );
    } else {
      setAvailableStates([]);
      setAvailableSchoolsForDropdown?.([]);
      setSelectedFilters((prev) => ({ ...prev, state: [], school: [] }));
    }
  }, [selectedFilters.country]);

  // AreaOfStudy (single) + DegreeLevel (single) → Program options
  useEffect(() => {
    const area = selectedFilters.areaOfStudy
      ? [selectedFilters.areaOfStudy]
      : [];
    const level = selectedFilters.degreeLevel;
    if (area.length && level) {
      fetchProgramsByAreasAndLevel(area, level);
    } else {
      setAvailablePrograms([]);
      setSelectedFilters((prev) => ({ ...prev, program: undefined }));
    }
  }, [selectedFilters.areaOfStudy, selectedFilters.degreeLevel]);

  // --------- Handlers ---------
  const handleFilterChange = useCallback(
    (filterName: keyof FiltersState, value: string) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev };
        if (value) (next as any)[filterName] = value;
        else delete (next as any)[filterName];

        // پاکسازی آبشاری مثل قبل
        if (filterName === "areaOfStudy" || filterName === "degreeLevel") {
          next.program = undefined; // single
        }
        if (filterName === "country") {
          next.state = [];
          next.school = [];
        }
        if (filterName === "state") {
          next.school = [];
        }
        return next;
      });
    },
    []
  );

  // فقط برای state و school چندانتخابی
  const handleMultiFilterChange = useCallback(
    (filterName: "state" | "school", values: string[]) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev, [filterName]: values };
        if (filterName === "state") {
          next.school = []; // تغییر state ⇒ school ریست شود
        }
        return next;
      });
    },
    []
  );

  const applyFilters = useCallback(() => {
    if (isGuest) {
      const used = localStorage.getItem(GUEST_FILTER_KEY) === "1";
      if (used) {
        setShowGate(true);

        return;
      }
      // بار اول مهمان → مجاز
      localStorage.setItem(GUEST_FILTER_KEY, "1");
    }

    setPage(1);
    setHasMore(true);
    fetchSchoolsData(1, false, selectedFilters, searchQuery);
  }, [fetchSchoolsData, selectedFilters, searchQuery, isGuest, toast]);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPage(1);
      setHasMore(true);
      fetchSchoolsData(1, false, selectedFilters, searchQuery);
    },
    [fetchSchoolsData, selectedFilters, searchQuery]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSchoolsData(nextPage, true, selectedFilters, searchQuery);
  }, [
    hasMore,
    loadingMore,
    page,
    fetchSchoolsData,
    selectedFilters,
    searchQuery,
  ]);

  const toggleFavorite = useCallback(
    async (schoolId: number) => {
      if (isGuest) {
        toast({
          title: "Please sign in",
          description: "Save favorites to your account.",
        });
        return goLoginWithReturn(navigate);
      }
      const isFav = !!favorites[schoolId];
      const action = isFav ? "remove" : "add";
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/favorites/schools`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ schoolId, action }),
        });
        if (!res.ok) throw new Error("Failed to update favorites");
        setFavorites((prev) => ({ ...prev, [schoolId]: !isFav }));
        toast({
          title: isFav
            ? "This school  removed from your My Favorites."
            : "This school  added to your My Favorites.",
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
    [favorites, toast, isGuest]
  );

  const handleCompare = useCallback(
    (schoolId: number, checked: boolean) => {
      if (isGuest) {
        toast({
          title: "Sign in to compare",
          description: "Create a free account to compare schools.",
        });
        return goLoginWithReturn(navigate);
      }
      setSchoolsToCompare((prev) => {
        const set = new Set(prev);
        if (checked) set.add(schoolId);
        else set.delete(schoolId);
        const arr = Array.from(set);
        if (checked && arr.length === 1) {
          toast({
            title: "1 school selected",
            description: "Select one more to compare.",
          });
        } else if (checked && arr.length >= 2) {
          toast({
            title: "Ready to compare",
            description: "Tap the floating “Compare” button below.",
          });
        }
        return arr;
      });
    },
    [toast, isGuest]
  );

  // شرط فعال بودن دکمه Filter با نوع‌های جدید
  const isApplyEnabled = useMemo(() => {
    if (isGuest) return !isChatBusy;
    return Boolean(
      selectedFilters.country &&
        selectedFilters.degreeLevel &&
        selectedFilters.areaOfStudy // single
    );
  }, [
    isGuest,
    isChatBusy,
    selectedFilters.country,
    selectedFilters.degreeLevel,
    selectedFilters.areaOfStudy,
  ]);

  // ---------------------- UI: Chat JSX ----------------------
  const chatComponent = (
    <>
      <ChatHeader
        sessions={sessions}
        currentSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onViewOlder={async () => {}}
      />
      <div className="flex-1 overflow-hidden">
        <ChatHistory
          messages={chatMessages}
          onResultClick={handleResultClick}
          onQuickReply={sendQuickReply}
          showTyping={isChatBusy}
          loadingSession={loadingSession}
          welcomeMessage={"Hello! Ask me anything about universities."}
        />
      </div>
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
      <div className="flex-shrink-0">
        <ChatComposer
          onSendMessage={sendMessage}
          placeholder="Ask about universities, programs, or specific requirements..."
          isLoading={isChatBusy}
        />
      </div>
    </>
  );

  // --------- UI ---------
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Schools
        </motion.h1>

        <motion.div
          className="flex items-center gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {schoolsToCompare.length >= 2 && (
            <Button
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                if (isGuest) return goLoginWithReturn(navigate);
                navigate(
                  `/dashboard/compare/schools/${encodeURIComponent(
                    schoolsToCompare.join(",")
                  )}`
                );
              }}
            >
              Compare Selected ({schoolsToCompare.length})
            </Button>
          )}
        </motion.div>
      </div>

      {/* Filters */}
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
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Country — single */}
          <FilterDropdown
            label="Country"
            icon={<span>{filterIcons.country}</span>}
            options={allCountryOptions}
            onSelect={onCountrySelect}
            selectedValue={selectedFilters.country || ""}
            selectedLabel={selectedCountryLabel}
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount={false}
            disabled={isGuest && guestFilterUsed}
            showNone={false} // ← حذف "None"
          />

          {/* State — multi */}
          <FilterDropdown
            label="State"
            icon={<span>{filterIcons.state}</span>}
            options={availableStates}
            multiple
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
            maxLabelChars={17}
            showCount
            showNone={false}
          />

          {/* School — multi (جدید) */}
          <FilterDropdown
            label="School"
            icon={<span>{filterIcons.schools}</span>}
            options={availableSchoolsForDropdown}
            multiple
            selectedValues={selectedFilters.school || []}
            onChange={(vals) =>
              handleMultiFilterChange("school", vals as string[])
            }
            disabled={
              loadingSchoolsForDropdown ||
              !selectedFilters.country ||
              availableSchoolsForDropdown.length === 0
            }
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount
            showNone={false}
          />

          {/* Degree Level — single */}
          <FilterDropdown
            label="Degree Level"
            icon={<span>{filterIcons.degreeLevel}</span>}
            options={mappedDegreeLevelOptions}
            onSelect={(value) => handleFilterChange("degreeLevel", value)}
            selectedValue={selectedFilters.degreeLevel || ""}
            selectedLabel={selectedDegreeLevelLabel}
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount={false}
            showNone={false}
          />

          {/* Area of Study — single (قبلاً multi بود) */}
          <FilterDropdown
            label="Area of Study"
            icon={<span>{filterIcons.areaOfStudy}</span>}
            options={allAreaOfStudyOptions}
            onSelect={(value) => handleFilterChange("areaOfStudy", value)}
            selectedValue={selectedFilters.areaOfStudy || ""}
            selectedLabel={selectedAreaOfStudyLabel}
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount={false}
            showNone={false}
          />

          {/* Program — single (قبلاً multi بود) */}
          <FilterDropdown
            label="Program"
            icon={<span>{filterIcons.programs}</span>}
            options={availablePrograms}
            onSelect={(value) => handleFilterChange("program", value)}
            selectedValue={selectedFilters.program || ""}
            selectedLabel={selectedProgramLabel}
            disabled={
              loadingPrograms ||
              !selectedFilters.areaOfStudy ||
              !selectedFilters.degreeLevel ||
              availablePrograms.length === 0
            }
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount={false}
            showNone={false}
          />

          {/* Order By — single */}
          <FilterDropdown
            label="Order By"
            icon={<span>{filterIcons.orderBy}</span>}
            options={mappedOrderBySchoolOptions}
            onSelect={(value) => handleFilterChange("orderBy", value)}
            selectedValue={selectedFilters.orderBy || "qs_rank"}
            selectedLabel={selectedOrderByLabel || "QS Ranking"}
            fixedWidthClass={FILTER_WIDTH}
            buttonClassName={FILTER_BTN}
            maxLabelChars={17}
            showCount={false}
            showNone={false}
          />

          {/* Apply */}
          <div className="mt-3 flex justify-end ">
            {(() => {
              const isDisabled = loading || isChatBusy; // ❗ فقط این دو حالت

              return (
                <Button
                  type="button"
                  onClick={applyFilters}
                  disabled={isDisabled}
                  className={`ml-2 w-full ${
                    !isDisabled
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Filter
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Dual Pane */}
      <DualPaneLayout
        chat={chatComponent}
        results={[
          <ResultsColumn key="results-main" padded={false} className="p-0">
            {/* Loading skeleton مثل find-programs */}
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-6 border rounded-lg bg-white dark:bg-gray-900 flex gap-6"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-1/3 rounded" />
                      <Skeleton className="h-4 w-1/2 rounded" />
                      <Skeleton className="h-4 w-1/4 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Results */}
                {schools.length > 0 && (
                  <div className="space-y-6">
                    {schools.map((school, index) => (
                      <SchoolCard
                        key={school.id}
                        school={school}
                        index={index}
                        isFavorite={!!favorites[school.id]}
                        toggleFavorite={toggleFavorite}
                        onCompare={handleCompare}
                        isInCompareList={schoolsToCompare.includes(school.id)}
                      />
                    ))}

                    {hasMore && (
                      <div className="mt-8 flex justify-center">
                        <Button
                          ref={loadMoreRef}
                          onClick={() => {
                            if (isGuest) {
                              setShowGate(true);
                              return;
                            }
                            loadMore();
                          }}
                          disabled={loadingMore}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "Load More Schools"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* No results */}
                {schools.length === 0 && (
                  <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner mt-8">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      No schools found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your filters to find more schools.
                    </p>
                  </div>
                )}
              </>
            )}
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
          minCardWidth: 280,
          gap: "6",
          fill: "auto-fit",
          densePacking: true,
          equalizeCardHeight: true,
          distributeCardWhitespace: true,
        }}
      />

      {schoolsToCompare.length >= 2 && (
        <div className="fixed bottom-8 right-6 z-50">
          <Button
            onClick={() => {
              if (isGuest) return goLoginWithReturn(navigate);
              navigate(
                `/dashboard/compare/schools/${encodeURIComponent(
                  schoolsToCompare.join(",")
                )}`
              );
            }}
            className="rounded-lg px-5 py-3 text-white bg-blue-600 hover:bg-blue-700 shadow-lg ring-1 ring-blue-300/50 animate-[pulse_1.4s_ease-in-out_infinite] dark:bg-blue-600 dark:hover:bg-blue-400 dark:shadow-blue-500/30 dark:ring-2 dark:ring-blue-400/60"
          >
            Compare Selected ({schoolsToCompare.length})
          </Button>
        </div>
      )}
      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent className="max-w-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl border-b mb-2">
              Upgrade your access level
            </DialogTitle>
            <DialogDescription className="mt-2">
              To access all the free information, please sign up or log in.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center mt-6 gap-3">
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-full"
              onClick={() => navigate("/auth?mode=login")}
            >
              Quest Rewards
            </Button>
            <Button variant="ghost" onClick={() => setShowGate(false)}>
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindSchools;
