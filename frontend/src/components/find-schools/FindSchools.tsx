// FindSchools.tsx

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
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

// 👇 اضافه‌شده برای چت
import DualPaneLayout from "../chat/DualPaneLayout";
import ChatHistory, { ChatMessage } from "../chat/ChatHistory";
import ChatComposer from "../chat/ChatComposer";
import ResultsColumn from "../chat/ResultsColumn";
import type { SessionMeta } from "../chat/storage";

type FiltersState = {
  country?: string;
  state?: string[]; //
  school?: string;
  degreeLevel?: string;
  areaOfStudy?: string[];
  program?: string[];
  orderBy?: string;
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

  const isInitialMount = useRef(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ---------------------- چت: state و هندلرها (مینیمال و مستقل از نتایج) ----------------------
  const [sessionId, setSessionId] = useState<string>(() => makeSessionId());
  const [sessions, setSessions] = useState(() => listSessionsLocal(PAGE_ID));
  const [loadingSession, setLoadingSession] = useState(false);

  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleResultClick = useCallback((_resultData: any) => {
    // اینجا کاری انجام نمی‌دیم تا به نتایج دست نزنیم
  }, []);

  //handeler for chat
  // هر بار لیست سشن‌ها تغییر کرد (مثلاً با New chat)، رفرش کن
  const refreshSessions = useCallback(() => {
    setSessions(listSessionsLocal(PAGE_ID));
  }, []);
  const getUserProfile = useCallback((): UserProfile | null => {
    try {
      const raw = localStorage.getItem("user"); // اگر کلیدت چیز دیگه‌ایه همونو بذار
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
    const current = getFilterSnapshot();
    const next = mergeFilterPatch(getFilterSnapshot(), patch);

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

  // New chat
  const handleNewChat = () => {
    if (chatMessages.length > 0) {
      finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
    }
    setSessionId(makeSessionId()); // سشن جدید اما بدون meta
    setSessions(listSessionsLocal(PAGE_ID)); // رفرش لیست
    // (هوک useChatController با threadKey جدید، چت خالی را هیدرات می‌کند)
  };

  // انتخاب سشن از Dropdown
  const handleSelectSession = (id: string) => {
    if (id === sessionId) return;
    setLoadingSession(true);
    setSessionId(id);
    // یه وقفه کوتاه برای نمایش اسکلتینگ اگر هیدرات طول کشید
    setTimeout(() => setLoadingSession(false), 300);
  };

  useEffect(() => {
    const userMsgs = chatMessages.filter((m) => m.type === "user");
    if (userMsgs.length === 1) {
      const now = Date.now();
      // اگر meta وجود نداشت، همین‌جا بساز
      upsertSessionMetaLocal(PAGE_ID, {
        id: sessionId,
        title: previewTitle(userMsgs[0].content),
        createdAt: now,
        updatedAt: now,
        messageCount: chatMessages.length,
      });
      setSessions(listSessionsLocal(PAGE_ID)); // رفرش Dropdown
    } else if (userMsgs.length > 1) {
      // پیام‌های بعدی: فقط updatedAt / messageCount را به‌روز کن
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

  // نام سشن را بعد از اولین پیام کاربر ست کن (اگر هنوز New chat است)
  useEffect(() => {
    const userMsgs = chatMessages.filter((m) => m.type === "user");
    if (userMsgs.length === 1) {
      const preview = userMsgs[0].content.slice(0, 40);
      updateSessionTitleLocal(PAGE_ID, sessionId, preview || "New chat");
      refreshSessions();
    }
  }, [chatMessages, sessionId, refreshSessions]);

  // خروج از برنامه/صفحه → سشن را فاینالایز کن
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

  // ---------------------------------------------------------------------------------------------

  // userPreferences  availableCountries, availableAreasOfStudy,
  const allCountryOptions = useMemo<FilterOption[]>(() => {
    return (userPreferences?.availableCountries || []).map((country) => ({
      value: String(country.id),
      label: country.name,
    }));
  }, [userPreferences?.availableCountries]);

  const allAreaOfStudyOptions = useMemo<FilterOption[]>(() => {
    return (userPreferences?.availableAreasOfStudy || []).map((a) => ({
      value: String(a.id),
      label: a.name,
    }));
  }, [userPreferences?.availableAreasOfStudy]);

  const mappedDegreeLevelOptions = useMemo<FilterOption[]>(() => {
    const options = ["Bachelor", "Master", "PhD"];
    return options.map((option) => ({
      value: option,
      label: option,
    }));
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
  const selectedSchoolLabel = useMemo(
    () => getLabelByValue(availableSchoolsForDropdown, selectedFilters.school),
    [availableSchoolsForDropdown, selectedFilters.school]
  );
  const selectedDegreeLevelLabel = useMemo(
    () =>
      getLabelByValue(mappedDegreeLevelOptions, selectedFilters.degreeLevel),
    [mappedDegreeLevelOptions, selectedFilters.degreeLevel]
  );
  const selectedOrderByLabel = useMemo(
    () => getLabelByValue(mappedOrderBySchoolOptions, selectedFilters.orderBy),
    [mappedOrderBySchoolOptions, selectedFilters.orderBy]
  );
  const onCountrySelect = useCallback((id: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      country: String(id),
      state: [],
      school: undefined,
    }));
  }, []);

  const selectedAreaOfStudyLabel = useMemo(() => {
    const labels = getLabelsByValues(
      allAreaOfStudyOptions,
      selectedFilters.areaOfStudy
    );
    return labels[0] || "";
  }, [allAreaOfStudyOptions, selectedFilters.areaOfStudy]);

  const selectedProgramLabel = useMemo(() => {
    const labels = getLabelsByValues(
      availablePrograms,
      selectedFilters.program
    );
    return labels[0] || "";
  }, [availablePrograms, selectedFilters.program]);

  // --------- API helpers (State / Program) ---------
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
        `http://localhost:5000/api/states?country=${countryId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

  // Area → Program
  const fetchProgramsByAreasAndLevel = useCallback(
    async (areaIds: string[], degreeLevel: string) => {
      setAvailablePrograms([]);
      if (!areaIds?.length || !degreeLevel) {
        setLoadingPrograms(false);
        return;
      }
      setLoadingPrograms(true);
      try {
        const token = localStorage.getItem("token");
        const requests = areaIds.map((id) =>
          fetch(
            `http://localhost:5000/api/program-data/by-area?areaOfStudy=${id}&degreeLevel=${encodeURIComponent(
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
        params.append("limit", "200");
        if (countryId) params.append("country", String(countryId));
        if (stateId) params.append("state", String(stateId));
        const res = await fetch(
          `http://localhost:5000/api/schools?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
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
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/auth?mode=login");
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

        const apiFilters = mapFiltersToApiParams(filters);

        Object.entries(apiFilters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        if (currentSearchQuery.trim())
          queryParams.append("search", currentSearchQuery.trim());

        const response = await fetch(
          `http://localhost:5000/api/schools?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            navigate("/auth?mode=login");
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
        console.log("School Data:", data);
        const newSchools = data.schools || [];
        setSchools((prev) =>
          isLoadMore ? [...prev, ...newSchools] : newSchools
        );
        setHasMore(data.hasMore === true);
        setNoSchoolsFound(newSchools.length === 0 && pageNum === 1);

        // userPreferences default
        if (isInitialMount.current && data.userPreferences) {
          const effective = { ...data.userPreferences };
          if (selectedFilters.country) {
            effective.country = String(selectedFilters.country); // 👈 برای UI
          }
          setUserPreferences(effective);
          isInitialMount.current = false;
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
            initial.areaOfStudy = [String(data.userPreferences.areaOfStudy.id)];
          }
          if (data.userPreferences.program) {
            initial.program = [String(data.userPreferences.program)];
          }

          setSelectedFilters((prev) => ({ ...prev, ...initial }));

          if (initial.country) {
            fetchStates(initial.country);
            await fetchSchoolsForDropdown(initial.country, initial.state?.[0]);
          }
          if (initial.areaOfStudy?.length && initial.degreeLevel) {
            await fetchProgramsByAreasAndLevel(
              initial.areaOfStudy,
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
      //School dropdown
      fetchSchoolsForDropdown(
        selectedFilters.country,
        selectedFilters.state?.[0]
      );
    } else {
      setAvailableStates([]);
      setAvailableSchoolsForDropdown?.([]);
      setSelectedFilters((prev) => ({ ...prev, state: [], school: undefined }));
    }
  }, [selectedFilters.country]);

  useEffect(() => {
    const area = Array.isArray(selectedFilters.areaOfStudy)
      ? selectedFilters.areaOfStudy
      : selectedFilters.areaOfStudy
      ? [selectedFilters.areaOfStudy]
      : [];
    const level = selectedFilters.degreeLevel;
    if (area.length && level) {
      fetchProgramsByAreasAndLevel(area, level);
    } else {
      setAvailablePrograms([]);
      setSelectedFilters((prev) => {
        const next = { ...prev };
        delete next.program;
        return next;
      });
    }
  }, [selectedFilters.areaOfStudy, selectedFilters.degreeLevel]);

  // --------- Handlers ---------
  const handleFilterChange = useCallback(
    (filterName: keyof FiltersState, value: string) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev };
        if (value) (next as any)[filterName] = value;
        else delete (next as any)[filterName];

        if (filterName === "areaOfStudy" || filterName === "degreeLevel") {
          next.program = [];
        }
        if (filterName === "country") {
          next.state = [];
          next.school = undefined;
        }
        if (filterName === "state") {
          next.school = undefined;
        }
        return next;
      });
    },
    []
  );

  const handleMultiFilterChange = useCallback(
    (filterName: "state" | "areaOfStudy" | "program", values: string[]) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev, [filterName]: values };
        if (filterName === "areaOfStudy") next.program = [];
        return next;
      });
    },
    []
  );

  const applyFilters = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchSchoolsData(1, false, selectedFilters, searchQuery);
  }, [fetchSchoolsData, selectedFilters, searchQuery]);

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
      const isFav = !!favorites[schoolId];
      const action = isFav ? "remove" : "add";
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/favorites/schools", {
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
    [favorites, toast]
  );

  const handleCompare = useCallback((schoolId: number, checked: boolean) => {
    setSchoolsToCompare((prev) => {
      const set = new Set(prev);
      if (checked) set.add(schoolId);
      else set.delete(schoolId);
      return Array.from(set);
    });
  }, []);

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

  // ---------------------- UI: Chat JSX ----------------------
  const chatComponent = (
    <>
      {/* Chat Header */}
      {/* <div className="border-b px-4 py-3 rounded-t-lg border-border bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold">QuestApply Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Ask me anything about universities
            </p>
          </div>
        </div>
      </div> */}
      <ChatHeader
        sessions={sessions}
        currentSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onViewOlder={async () => {
          // TODO: از سرور (Redis) بیار، به sessions اضافه کن و refresh کن
          // const older = await fetchOlderSessionsFromServer(PAGE_ID, sessions.length, 20);
          // merge و setSessions(...)
        }}
      />

      {/* Chat History */}
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

      {/* Chat Composer */}
      <div className="flex-shrink-0">
        <ChatComposer
          onSendMessage={sendMessage}
          placeholder="Ask about universities, programs, or specific requirements..."
          isLoading={isChatBusy}
        />
      </div>
    </>
  );
  // ---------------------------------------------------------

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
          {schoolsToCompare.length > 0 && (
            <Button
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() =>
                navigate(
                  `/dashboard/compare/schools/${encodeURIComponent(
                    schoolsToCompare.join(",")
                  )}`
                )
              }
            >
              Compare Selected ({schoolsToCompare.length})
            </Button>
          )}
        </motion.div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            size={18}
          />
        </div>
      </form>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4s">
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
        <div className="flex flex-wrap gap-2">
          {/* Country (single) */}
          <FilterDropdown
            label="Country"
            icon={<span>{filterIcons.country}</span>}
            options={allCountryOptions}
            onSelect={onCountrySelect}
            selectedValue={selectedFilters.country || ""}
            selectedLabel={selectedCountryLabel}
            buttonClassName="!py-1.5"
          />

          {/* State (multi) — بonSelect (toggle) */}
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
            buttonClassName="!py-1.5"
            disabled={
              loadingStates ||
              !selectedFilters.country ||
              availableStates.length === 0
            }
          />

          {/* School (single) */}
          <FilterDropdown
            label="School"
            icon={<span>{filterIcons.schools}</span>}
            options={availableSchoolsForDropdown}
            onSelect={(value) => handleFilterChange("school", value)}
            selectedValue={selectedFilters.school || ""}
            selectedLabel={selectedSchoolLabel}
            buttonClassName="!py-1.5"
            disabled={
              loadingSchoolsForDropdown ||
              !selectedFilters.country ||
              availableSchoolsForDropdown.length === 0
            }
          />

          {/* Degree Level (single) */}
          <FilterDropdown
            label="Degree Level"
            icon={<span>{filterIcons.degreeLevel}</span>}
            options={mappedDegreeLevelOptions}
            onSelect={(value) => handleFilterChange("degreeLevel", value)}
            selectedValue={selectedFilters.degreeLevel || ""}
            selectedLabel={selectedDegreeLevelLabel}
            buttonClassName="!py-1.5"
          />

          {/* Area of Study (multi) — userPreferences */}
          <FilterDropdown
            label="Area of Study"
            icon={<span>{filterIcons.areaOfStudy}</span>}
            options={allAreaOfStudyOptions}
            multiple
            showCount
            selectedValues={selectedFilters.areaOfStudy || []}
            onChange={(vals) =>
              handleMultiFilterChange("areaOfStudy", vals as string[])
            }
            buttonClassName="!py-1.5"
          />

          {/* Program (multi) — userPreferences */}
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
            buttonClassName="!py-1.5"
            disabled={
              loadingPrograms ||
              !(
                selectedFilters.areaOfStudy &&
                selectedFilters.areaOfStudy.length > 0
              ) ||
              !selectedFilters.degreeLevel ||
              availablePrograms.length === 0
            }
          />

          {/* Order By (single) */}
          <FilterDropdown
            label="Order By"
            icon={<span>{filterIcons.orderBy}</span>}
            options={mappedOrderBySchoolOptions}
            onSelect={(value) => handleFilterChange("orderBy", value)}
            selectedValue={selectedFilters.orderBy || "qs_rank"}
            selectedLabel={selectedOrderByLabel || "QS Ranking"}
            buttonClassName="!py-1.5"
          />

          {/* Apply */}
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

      {/* Dual Pane: چت (چپ) + نتایج (راست) */}
      <DualPaneLayout
        chat={chatComponent}
        results={[
          <ResultsColumn
            key="results-main"
            // اختیاری:
            // title="Results"
            padded
            emptyState={
              <div className="text-muted-foreground">No results to display</div>
            }
          >
            {/* ⬇️ همون JSX نتایج فعلی شما، بدون هیچ تغییری */}
            {noSchoolsFound && schools.length === 0 && (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Schools Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No schools match your current filter criteria. Try adjusting
                  your filters and press Apply.
                </p>
              </div>
            )}

            {!loading && (schools.length > 0 || noSchoolsFound) ? (
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
                      onClick={loadMore}
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
            ) : (
              loading &&
              schools.length === 0 &&
              !noSchoolsFound && (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              )
            )}
            {/* ⬆️ پایان همان JSX نتایج شما */}
          </ResultsColumn>,
        ]}
        layout={{
          separateBoxes: true,
          boxGap: "6",
          chatRatio: 0.35, // ≈ 1/3
          chatHeightMode: "vh",
          chatHeight: 90,
          stickyChat: false,
        }}
        resultsGrid={{
          minCardWidth: 380,
          gap: "6",
          fill: "auto-fit",
          densePacking: true,
          equalizeCardHeight: true,
          distributeCardWhitespace: true,
        }}
        // resultsGrid اختیاریه؛ اینجا نتایج به صورت لیست هست، می‌تونیم نذاریمش
      />
    </div>
  );
};

export default FindSchools;
