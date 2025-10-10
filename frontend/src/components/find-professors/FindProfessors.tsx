// import { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { createPortal } from "react-dom";
// import { useToast } from "../../hooks/use-toast";
// import { motion } from "framer-motion";
// import { Button } from "../ui/button";
// import { CardContent } from "../ui/card";
// import AnimatedCard from "../ui/animated-card";
// import { useNavigate } from "react-router-dom";
// import {
//   Mail,
//   MapPin,
//   Globe,
//   Heart,
//   Send,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { cn } from "../../lib/utils";
// import ProfessorContactDialog from "./ProfessorContactDialog";
// import { Skeleton } from "../ui/skeleton";
// import {
//   UserPreferences,
//   FilterOption,
//   DialogProfessor,
//   AvailableCountry,
//   AvailableAreaOfStudy,
//   AvailableProgram,
// } from "../../types";
// import FilterDropdown from "../filters/FilterDropdown";

// import {
//   countryOptions,
//   areaOfStudyOptions,
//   programOptions,
//   professorTitleOptions,
//   filterIcons,
// } from "../filters/FilterData";
// // CHAT
// import ChatHeader from "../chat/ChatHeader";
// import ChatHistory from "../chat/ChatHistory";
// import ChatComposer from "../chat/ChatComposer";
// import { useChatController } from "../chat/useChatController";
// import DualPaneLayout from "../chat/DualPaneLayout";

// // SESSIONS
// import {
//   makeSessionId,
//   listSessionsLocal,
//   upsertSessionMetaLocal,
//   finalizeSessionLocal,
//   updateSessionTitleLocal,
//   type SessionMeta,
// } from "../chat/storage";

// // OPTIONAL: مرج پچ فیلتر
// import { mergeFilterPatch } from "../chat/mergeFilters";

// // LAYOUT

// import ResultsColumn from "../chat/ResultsColumn";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// /* -------------------------------- Types -------------------------------- */
// type FilterSnapshot = {
//   country?: string;
//   state?: string;
//   school?: string;
//   degreeLevel?: string;
//   areaOfStudy?: string;
//   program?: string;
//   researchInterest?: string; // CSV
//   title?: string;
// };

// type FilterPatch = Partial<FilterSnapshot>; // اگر در فایل type داری، از همون استفاده کن

// const arrToCsv = (a?: string[]) =>
//   Array.isArray(a) && a.length ? a.join(",") : "";

// const csvToArr = (s?: string) =>
//   s
//     ? s
//         .split(",")
//         .map((x) => x.trim())
//         .filter(Boolean)
//     : [];

// type Professor = {
//   ID: number;
//   name: string;
//   title: string;
//   email: string;
//   program_id: number;
//   school_id: number;
//   research_area: string;
//   link: string;
//   department_id: number | null;
//   google_scholar: string | null;
//   website: string | null;
//   linkedin: string | null;
//   image: string | null;
//   status: string;
//   creator_id: number;
//   date: string;
//   program_name: string;
//   area_of_study_name: string;
//   country_name: string;
//   school_name: string;
//   state: string;
//   country: string;
//   programs?: ProgramItem[];
// };

// type ProgramItem = {
//   id: number | string;
//   name: string;
//   level?: "Bachelor" | "Master" | "PhD" | string | null;
//   level_label?: string;
//   type?: string | null;
//   status?: string;
// };

// type CategoryPrograms = {
//   groups: {
//     Bachelor: ProgramItem[];
//     Master: ProgramItem[];
//     PhD: ProgramItem[];
//   };
//   flat: ProgramItem[];
//   all: ProgramItem[];
// };

// const defaultCategoryPrograms: CategoryPrograms = {
//   groups: { Bachelor: [], Master: [], PhD: [] },
//   flat: [],
//   all: [],
// };

// /* ---------------- Filter state (align with FindSchools) ---------------- */

// type FiltersState = {
//   country?: string;
//   state?: string[]; // multi
//   school?: string[];
//   degreeLevel?: string;
//   areaOfStudy?: string[]; // multi
//   program?: string[]; // multi
//   researchInterest?: string[]; // multi
//   title?: string;
//   page?: number;
//   limit?: number;
// };
// // ====== ثابت صفحه
// const PAGE_ID = "find-professors";
// const FILTER_WIDTH = "w-[150px] sm:w-[180px] md:w-[260px]";
// const FILTER_BTN = "truncate";

// // پیش‌نمایش عنوان سشن از اولین پیام کاربر
// function previewTitle(text: string, max = 40) {
//   const clean = (text || "").replace(/\s+/g, " ").trim();
//   return clean.length > max
//     ? clean.slice(0, max) + "…"
//     : clean || "Untitled chat";
// }

// /* ------------------------------ Component ------------------------------ */

// const FindProfessors = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const [professors, setProfessors] = useState<Professor[]>([]);
//   const [userPreferences, setUserPreferences] =
//     useState<UserPreferences | null>(null);

//   const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});

//   const [favorites, setFavorites] = useState<Record<number, boolean>>({});

//   const [selectedProfessor, setSelectedProfessor] =
//     useState<DialogProfessor | null>(null);
//   const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
//   const [emailDialogOpen, setEmailDialogOpen] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(0);

//   const [availablePrograms, setAvailablePrograms] = useState<FilterOption[]>(
//     []
//   );
//   const [availableResearchInterests, setAvailableResearchInterests] = useState<
//     string[]
//   >([]);

//   // State & School dropdowns
//   const [availableStates, setAvailableStates] = useState<FilterOption[]>([]);
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [availableSchoolsForDropdown, setAvailableSchoolsForDropdown] =
//     useState<FilterOption[]>([]);
//   const [loadingSchoolsForDropdown, setLoadingSchoolsForDropdown] =
//     useState(false);

//   const [categoryPrograms, setCategoryPrograms] = useState<CategoryPrograms>(
//     defaultCategoryPrograms
//   );
//   const [expandedResearch, setExpandedResearch] = useState<
//     Record<number, boolean>
//   >({});

//   const [programList, setProgramList] = useState<string[]>([]);
//   const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

//   const [programsModalFor, setProgramsModalFor] = useState<number | null>(null);
//   const modalContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});

//   const [loadingPrograms, setLoadingPrograms] = useState(false);
//   const initialFetchCompleted = useRef(false);
//   const initialUserPrefFiltersApplied = useRef(false);
//   // ====== سشن‌های چت (History)
//   const [sessionId, setSessionId] = useState<string>(() => makeSessionId()); // سشن را زود نساز
//   const [sessions, setSessions] = useState<SessionMeta[]>(() =>
//     listSessionsLocal(PAGE_ID)
//   );
//   const [loadingSession, setLoadingSession] = useState(false);
//   /* --------------------------- Server ProgramList --------------------------- */

//   const fetchProgramList = useCallback(async () => {
//     const token = localStorage.getItem("token");
//     if (!token) return;
//     try {
//       const res = await fetch(`${API_URL}/program-data/program-list`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (!res.ok) return;
//       const data = await res.json();
//       const arr = Array.isArray(data.programList)
//         ? data.programList.map((x: any) => String(x))
//         : [];
//       setProgramList(arr);
//     } catch {
//       // ignore
//     }
//   }, []);

//   useEffect(() => {
//     fetchProgramList();
//   }, [fetchProgramList]);

//   const toggleProgramInList = useCallback(
//     async (p: ProgramItem) => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/auth?mode=login");
//         return;
//       }
//       const pid = String(p.id);
//       const isSelected = programList.includes(pid);
//       const action = isSelected ? "remove" : "add";
//       setUpdatingIds((prev) => new Set(prev).add(pid));
//       try {
//         const res = await fetch(`${API_URL}/program-data/program-list`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ programId: pid, action }),
//         });
//         if (!res.ok) throw new Error("Failed to update program list");
//         const data = await res.json();
//         const next = Array.isArray(data.programList)
//           ? data.programList.map((x: any) => String(x)).filter(Boolean)
//           : [];
//         setProgramList(next);
//         toast({
//           title: isSelected ? "Removed" : "Added",
//           description: `${p.name} ${
//             isSelected ? "removed from" : "added to"
//           } My Programs`,
//         });
//       } catch {
//         toast({
//           title: "Error",
//           description: "Could not update your program list.",
//           variant: "destructive",
//         });
//       } finally {
//         setUpdatingIds((prev) => {
//           const s = new Set(prev);
//           s.delete(pid);
//           return s;
//         });
//       }
//     },
//     [navigate, programList, toast]
//   );

//   /* ----------------------------- Memo’d opts ---------------------------- */
//   const allCountryOptions = useMemo<FilterOption[]>(() => {
//     return (userPreferences?.availableCountries || []).map((c) => ({
//       value: String(c.country),
//       label: c.name,
//     }));
//   }, [userPreferences?.availableCountries]);

//   // برای سازگاری، همچنان fallback داریم (در صورت نبود داده‌ی سرور)
//   const allAreaOfStudyOptions = useMemo<FilterOption[]>(() => {
//     const fromPrefs = (userPreferences?.availableAreasOfStudy || []).map(
//       (a: AvailableAreaOfStudy) => ({
//         value: String(a.id),
//         label: a.name,
//       })
//     );
//     const mapped = areaOfStudyOptions.map((area, idx) => ({
//       value: String(idx + 1),
//       label: area,
//     }));
//     return fromPrefs.concat(
//       mapped.filter((o) => !fromPrefs.some((p) => p.value === o.value))
//     );
//   }, [userPreferences?.availableAreasOfStudy]);

//   const allProgramOptionsFallback = useMemo<FilterOption[]>(() => {
//     const fromPrefs = (userPreferences?.availablePrograms || []).map(
//       (p: AvailableProgram) => ({
//         value: String(p.id),
//         label: p.name,
//       })
//     );
//     const mapped = programOptions.map((program, idx) => ({
//       value: String(idx + 1),
//       label: program,
//     }));
//     return fromPrefs.concat(
//       mapped.filter((o) => !fromPrefs.some((p) => p.value === o.value))
//     );
//   }, [userPreferences?.availablePrograms]);

//   const mappedResearchInterestOptions = useMemo<FilterOption[]>(() => {
//     return availableResearchInterests.map((v) => ({ value: v, label: v }));
//   }, [availableResearchInterests]);

//   const mappedProfessorTitleOptions = useMemo<FilterOption[]>(() => {
//     return professorTitleOptions.map((v) => ({ value: v, label: v }));
//   }, []);

//   const getLabelFromIdOrValue = useCallback(
//     (val: string | number, options: FilterOption[]) => {
//       if (!val) return "";
//       const s = String(val);
//       return options.find((o) => o.value === s)?.label || "";
//     },
//     []
//   );

//   const selectedCountryLabel = useMemo(
//     () =>
//       getLabelFromIdOrValue(
//         (selectedFilters.country as string) || "",
//         allCountryOptions
//       ),
//     [selectedFilters.country, allCountryOptions, getLabelFromIdOrValue]
//   );

//   const selectedProfessorTitleLabel = useMemo(
//     () =>
//       getLabelFromIdOrValue(
//         (selectedFilters.title as string) || "",
//         mappedProfessorTitleOptions
//       ),
//     [selectedFilters.title, mappedProfessorTitleOptions, getLabelFromIdOrValue]
//   );

//   /* --------------------------- Fetch helpers --------------------------- */

//   // چند Area + DegreeLevel (مثل FindSchools)
//   const fetchProgramsByAreas = useCallback(async (areaIds: string[]) => {
//     setAvailablePrograms([]);
//     if (!areaIds?.length) return [];
//     setLoadingPrograms(true);
//     try {
//       const token = localStorage.getItem("token");
//       const requests = areaIds.map((id) =>
//         fetch(`${API_URL}/program-data/by-area?areaOfStudy=${id}`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }).then((r) => (r.ok ? r.json() : { programs: [] }))
//       );
//       const results = await Promise.all(requests);
//       const merged = results.flatMap((res: any) => res.programs || []);
//       const uniqueMap = new Map<
//         string,
//         { id: string | number; name: string }
//       >();
//       merged.forEach((p: any) => uniqueMap.set(String(p.id), p));
//       const uniquePrograms: FilterOption[] = Array.from(uniqueMap.values())
//         .map((p) => ({ value: String(p.id), label: p.name }))
//         .sort((a, b) => a.label.localeCompare(b.label));
//       setAvailablePrograms(uniquePrograms);
//       return uniquePrograms;
//     } catch {
//       setAvailablePrograms([]);
//       return [];
//     } finally {
//       setLoadingPrograms(false);
//     }
//   }, []);

//   const fetchStates = useCallback(async (countryId?: string) => {
//     setAvailableStates([]);
//     if (!countryId) {
//       setLoadingStates(false);
//       return;
//     }
//     setLoadingStates(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_URL}/states?country=${countryId}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       if (!res.ok) {
//         setAvailableStates([]);
//         setLoadingStates(false);
//         return;
//       }
//       const data = await res.json();
//       const states = (data.states || []).map((s: any) => ({
//         value: String(s.id),
//         label: s.name,
//       }));
//       setAvailableStates(states);
//       setLoadingStates(false);
//     } catch {
//       setAvailableStates([]);
//       setLoadingStates(false);
//     }
//   }, []);

//   // const fetchSchoolsForDropdown = useCallback(
//   //   async (countryId?: string, stateIdCsv?: string) => {
//   //     setAvailableSchoolsForDropdown([]);
//   //     if (!countryId) {
//   //       setLoadingSchoolsForDropdown(false);
//   //       return;
//   //     }
//   //     setLoadingSchoolsForDropdown(true);
//   //     try {
//   //       const token = localStorage.getItem("token");
//   //       const params = new URLSearchParams();
//   //       params.append("limit", "200");
//   //       if (countryId) params.append("country", String(countryId));
//   //       if (stateIdCsv) params.append("state", String(stateIdCsv));
//   //       const res = await fetch(`${API_URL}/schools?${params.toString()}`, {
//   //         method: "GET",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       });
//   //       if (!res.ok) {
//   //         setAvailableSchoolsForDropdown([]);
//   //         setLoadingSchoolsForDropdown(false);
//   //         return;
//   //       }
//   //       const data = await res.json();
//   //       const newSchools = data.schools || [];
//   //       setAvailableSchoolsForDropdown(
//   //         newSchools.map((s: any) => ({ value: String(s.id), label: s.name }))
//   //       );
//   //       setLoadingSchoolsForDropdown(false);
//   //     } catch {
//   //       setAvailableSchoolsForDropdown([]);
//   //       setLoadingSchoolsForDropdown(false);
//   //     }
//   //   },
//   //   []
//   // );

//   const fetchSchoolsForDropdown = useCallback(
//     async (countryId?: string, stateIdCsv?: string) => {
//       setAvailableSchoolsForDropdown([]);
//       if (!countryId) {
//         setLoadingSchoolsForDropdown(false);
//         return;
//       }
//       setLoadingSchoolsForDropdown(true);
//       try {
//         const token = localStorage.getItem("token");
//         const params = new URLSearchParams();
//         params.append("limit", "200");
//         if (countryId) params.append("country", String(countryId));
//         if (stateIdCsv) params.append("state", String(stateIdCsv));

//         const res = await fetch(`${API_URL}/schools?${params.toString()}`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });
//         if (!res.ok) {
//           setAvailableSchoolsForDropdown([]);
//           setLoadingSchoolsForDropdown(false);
//           return;
//         }
//         const data = await res.json();

//         // 1) مپ ایمن: id و name را از هر فیلدی که موجود است بردار
//         const mapped: FilterOption[] = (data.schools || []).map((s: any) => ({
//           value: String(s.id ?? s.ID ?? s.school_id),
//           label: s.name ?? s.school_name ?? s.title,
//         }));

//         // 2) آپشن‌ها را ست کن
//         setAvailableSchoolsForDropdown(mapped);

//         // 3) همسان‌سازی انتخاب‌های فعلی با لیست جدید (فقط موارد نامعتبر حذف می‌شوند)
//         setSelectedFilters((prev) => {
//           const current = Array.isArray(prev.school)
//             ? (prev.school as string[]).map(String)
//             : [];
//           if (current.length === 0) return prev;

//           const valid = new Set(mapped.map((o) => String(o.value)));
//           const kept = current.filter((id) => valid.has(String(id)));

//           // اگر هیچ تغییری نبود، همان prev را برگردان تا رندر اضافی نشود
//           if (kept.length === current.length) return prev;

//           // اگر همه حذف شدند می‌توانی [] بگذاری یا کل کلید را حذف کنی؛
//           // من [] می‌گذارم تا کنترل ساده‌تر باشد.
//           return { ...prev, school: kept };
//         });

//         setLoadingSchoolsForDropdown(false);
//       } catch {
//         setAvailableSchoolsForDropdown([]);
//         setLoadingSchoolsForDropdown(false);
//       }
//     },
//     []
//   );

//   const fetchProfessors = useCallback(
//     async (
//       page: number,
//       filters: FiltersState,

//       opts: { append?: boolean } = {}
//     ) => {
//       const { append = false } = opts;
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/auth?mode=login");
//         return;
//       }

//       if (append) setLoadingMore(true);
//       else setLoading(true);

//       try {
//         const cleanFilters = Object.entries(filters).reduce(
//           (acc, [key, value]) => {
//             if (
//               value === undefined ||
//               value === "" ||
//               key === "page" ||
//               key === "limit"
//             )
//               return acc;
//             if (Array.isArray(value)) {
//               const csv = (value as string[]).filter(Boolean).join(",");
//               if (csv) acc[key] = csv;
//             } else if (
//               key === "degreeLevel" &&
//               String(value).toLowerCase().includes("ph")
//             ) {
//               acc[key] = "PhD";
//             } else {
//               acc[key] = String(value);
//             }
//             return acc;
//           },
//           {} as Record<string, string>
//         );

//         const queryParams = new URLSearchParams({
//           page: String(page),
//           limit: String(filters.limit ?? 10),
//           light: page > 1 ? "1" : "0",
//           ...cleanFilters,
//         });

//         const response = await fetch(
//           `${API_URL}/professor-data/find?${queryParams}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to fetch professors");

//         const data = await response.json();
//         console.log("Professors data:", data);
//         /* --- Bootstrap like FindSchools: apply initial filters BEFORE showing any results --- */
//         if (!initialUserPrefFiltersApplied.current && data.userPreferences) {
//           setUserPreferences(data.userPreferences);

//           const parseCSV = (s: string | null): string[] =>
//             s
//               ? s
//                   .split(",")
//                   .map((x) => x.trim())
//                   .filter(Boolean)
//               : [];

//           const initial: FiltersState = { page: 1, limit: 10 };

//           if (data.userPreferences.country)
//             initial.country = String(data.userPreferences.country);

//           if (data.userPreferences.level) {
//             let levelValue = data.userPreferences.level;
//             if (levelValue === "Ph.D.") levelValue = "PhD";
//             initial.degreeLevel = levelValue;
//           }

//           if (data.userPreferences.areaOfStudy?.id)
//             initial.areaOfStudy = [String(data.userPreferences.areaOfStudy.id)];

//           if (data.userPreferences.program)
//             initial.program = [String(data.userPreferences.program)];

//           // URL params override/extend
//           const urlParams = new URLSearchParams(window.location.search);
//           const urlCountry = urlParams.get("country");
//           const urlAreaOfStudy = parseCSV(urlParams.get("areaOfStudy"));
//           const urlProgram = parseCSV(urlParams.get("program"));
//           const urlDegreeLevel = urlParams.get("degreeLevel");
//           const urlResearchInterest = parseCSV(
//             urlParams.get("researchInterest")
//           );
//           const urlTitle = urlParams.get("title");
//           const urlState = parseCSV(urlParams.get("state"));
//           const urlSchool = parseCSV(urlParams.get("school"));

//           if (urlCountry) initial.country = urlCountry;
//           if (urlAreaOfStudy.length) initial.areaOfStudy = urlAreaOfStudy;
//           if (urlProgram.length) initial.program = urlProgram;
//           if (urlDegreeLevel) initial.degreeLevel = urlDegreeLevel;
//           if (urlSchool.length) initial.school = urlSchool;
//           if (urlState.length) initial.state = urlState;
//           if (urlResearchInterest.length)
//             initial.researchInterest = urlResearchInterest;
//           if (urlTitle) initial.title = urlTitle;

//           // set filters into UI
//           setSelectedFilters(initial);
//           setCurrentPage(initial.page as number);

//           // preload dependent dropdowns (so Program dropdown fills before first render)
//           if (initial.country) {
//             const stateCsv = initial.state?.join(",");
//             await fetchStates(initial.country);
//             await fetchSchoolsForDropdown(initial.country, stateCsv);
//           }
//           if ((initial.areaOfStudy?.length ?? 0) > 0) {
//             await fetchProgramsByAreas(initial.areaOfStudy!);
//           }

//           initialUserPrefFiltersApplied.current = true;

//           // Now fetch with the initial filters and RETURN (avoid showing unfiltered results)
//           await fetchProfessors(1, initial, { append: false });
//           return;
//         }

//         // Normal path (already initialized)
//         const newList: Professor[] = Array.isArray(data.professors)
//           ? data.professors
//           : [];

//         setAvailableResearchInterests(
//           Array.isArray(data.researchInterests) ? data.researchInterests : []
//         );
//         setTotalPages(Number(data.totalPages || 0));
//         setCategoryPrograms(data.categoryPrograms || defaultCategoryPrograms);

//         if (append) {
//           setProfessors((prev) => {
//             const seen = new Set(prev.map((p) => p.ID));
//             const merged = [...prev];
//             for (const p of newList) if (!seen.has(p.ID)) merged.push(p);
//             return merged;
//           });
//           setFavorites((prev) => ({
//             ...prev,
//             ...newList.reduce(
//               (acc: Record<number, boolean>, prof: Professor) => {
//                 if (prev[prof.ID] === undefined) acc[prof.ID] = false;
//                 return acc;
//               },
//               {}
//             ),
//           }));
//         } else {
//           setProfessors(newList);
//           const initialFavorites = newList.reduce(
//             (acc: Record<number, boolean>, prof: Professor) => {
//               acc[prof.ID] = false;
//               return acc;
//             },
//             {}
//           );
//           setFavorites(initialFavorites);
//         }
//       } catch (error) {
//         console.error("Error fetching professors:", error);
//         toast({
//           title: "Error",
//           description: "Failed to load professors. Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [
//       navigate,
//       toast,
//       fetchProgramsByAreas,
//       fetchStates,
//       fetchSchoolsForDropdown,
//     ]
//   );

//   /* ------------------------------- Effects ------------------------------ */

//   useEffect(() => {
//     if (!initialFetchCompleted.current) {
//       fetchProfessors(1, selectedFilters);
//       initialFetchCompleted.current = true;
//     }
//   }, [fetchProfessors, selectedFilters]);

//   // آبشاری: country → states, schools
//   useEffect(() => {
//     const country = selectedFilters.country;
//     if (country) {
//       fetchStates(country);
//       const stateCsv = Array.isArray(selectedFilters.state)
//         ? (selectedFilters.state as string[]).join(",")
//         : undefined;
//       fetchSchoolsForDropdown(country, stateCsv);
//     } else {
//       setAvailableStates([]);
//       setAvailableSchoolsForDropdown([]);
//       setSelectedFilters((prev) => {
//         const next = { ...prev };
//         delete next.state;
//         delete next.school;
//         return next;
//       });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedFilters.country]);

//   // تغییر state → schools
//   useEffect(() => {
//     const country = selectedFilters.country;
//     if (!country) return;
//     const stateCsv = Array.isArray(selectedFilters.state)
//       ? (selectedFilters.state as string[]).join(",")
//       : undefined;
//     fetchSchoolsForDropdown(country, stateCsv);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedFilters.state]);

//   // Area + DegreeLevel → فچ Programهای وابسته (multi)
//   useEffect(() => {
//     const areas = Array.isArray(selectedFilters.areaOfStudy)
//       ? (selectedFilters.areaOfStudy as string[])
//       : [];

//     if (areas.length) {
//       fetchProgramsByAreas(areas);
//     } else {
//       setAvailablePrograms([]);
//       setSelectedFilters((prev) => {
//         const next = { ...prev };
//         delete next.program;
//         return next;
//       });
//     }
//   }, [selectedFilters.areaOfStudy, fetchProgramsByAreas]);

//   /* ----------------------------- UI handlers ---------------------------- */

//   // فیلترهای تکی
//   const handleFilterSelect = (
//     filterName: keyof FiltersState,
//     value: string | number
//   ) => {
//     setSelectedFilters((prev) => {
//       const next: FiltersState = { ...prev };
//       // پاک‌سازی‌های وابسته
//       if (filterName === "areaOfStudy" || filterName === "degreeLevel") {
//         delete next.program;
//       }
//       if (filterName === "country") {
//         delete next.state;
//         delete next.school;
//       }
//       if (filterName === "state") {
//         delete next.school;
//       }
//       (next as any)[filterName] = value;
//       next.page = 1;
//       return next;
//     });
//   };

//   // فیلترهای چندتایی
//   const handleMultiFilterChange = useCallback(
//     (
//       filterName:
//         | "state"
//         | "researchInterest"
//         | "areaOfStudy"
//         | "program"
//         | "school",
//       values: string[]
//     ) => {
//       setSelectedFilters((prev) => {
//         const next: FiltersState = { ...prev, [filterName]: values, page: 1 };
//         if (filterName === "state") delete next.school;
//         if (filterName === "areaOfStudy") delete next.program;
//         return next;
//       });
//     },
//     []
//   );

//   // دکمه Apply (مثل FindSchools)
//   const isApplyEnabled = useMemo(() => {
//     return Boolean(
//       selectedFilters.country &&
//         Array.isArray(selectedFilters.areaOfStudy) &&
//         selectedFilters.areaOfStudy.length > 0
//     );
//   }, [selectedFilters.country, selectedFilters.areaOfStudy]);

//   const applyFilters = useCallback(() => {
//     setCurrentPage(1);
//     fetchProfessors(1, selectedFilters, { append: false });
//   }, [fetchProfessors, selectedFilters]);

//   const processResearchAreas = (researchArea: string): string[] => {
//     if (!researchArea) return [];
//     const interests: string[] = [];
//     const regex = /s:\d+:"(.*?)";/g;
//     let match;
//     while ((match = regex.exec(researchArea)) !== null) {
//       interests.push(match[1].trim());
//     }
//     return interests;
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1, delayChildren: 0.2 },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1 },
//   };

//   const handleEmailClick = (professor: Professor) => {
//     const dialogProfessor: DialogProfessor = {
//       id: professor.ID,
//       name: professor.name,
//       title: professor.title,
//       email: professor.email,
//       research: processResearchAreas(professor.research_area),
//     };
//     setSelectedProfessor(dialogProfessor);
//     setEmailDialogOpen(true);
//   };

//   const handleReminderClick = (professor: Professor) => {
//     const dialogProfessor: DialogProfessor = {
//       id: professor.ID,
//       name: professor.name,
//       title: professor.title,
//       email: professor.email,
//       research: processResearchAreas(professor.research_area),
//     };
//     setSelectedProfessor(dialogProfessor);
//     setReminderDialogOpen(true);
//   };

//   const getFilterSnapshot = useCallback(() => {
//     // هرچه الان روی صفحه اعمال شده است (IDها) را بفرست
//     return { ...selectedFilters };
//   }, [selectedFilters]);

//   const applyFilterPatchAndFetch = useCallback(
//     async (patch: any) => {
//       // پچ را با فیلترهای فعلی مرج کن (وابستگی‌ها را پاک کن)
//       setSelectedFilters((prev) => mergeFilterPatch(prev, patch));
//       // ریست نتایج و fetch
//       setCurrentPage(1);

//       await fetchProfessors(1, selectedFilters, { append: false });
//     },
//     [fetchProfessors, selectedFilters]
//   );

//   // ====== هوک چت
//   const {
//     messages: chatMessages,
//     isChatBusy,
//     pendingProposal,
//     sendMessage,
//     sendQuickReply,
//     confirmPendingProposal,
//     clearPendingProposal,
//   } = useChatController({
//     pageId: PAGE_ID,
//     threadKey: `${PAGE_ID}:${sessionId}`,
//     getFilterSnapshot,
//     applyFilterPatchAndFetch,
//   });

//   // ====== عنوان سشن از اولین پیام کاربر
//   useEffect(() => {
//     const userMsgs = chatMessages.filter((m) => m.type === "user");
//     if (userMsgs.length === 1) {
//       const now = Date.now();
//       upsertSessionMetaLocal(PAGE_ID, {
//         id: sessionId,
//         title: previewTitle(userMsgs[0].content),
//         createdAt: now,
//         updatedAt: now,
//         messageCount: chatMessages.length,
//       });
//       setSessions(listSessionsLocal(PAGE_ID));
//     } else if (userMsgs.length > 1) {
//       const list = listSessionsLocal(PAGE_ID);
//       const existing = list.find((s) => s.id === sessionId);
//       if (existing) {
//         upsertSessionMetaLocal(PAGE_ID, {
//           ...existing,
//           updatedAt: Date.now(),
//           messageCount: chatMessages.length,
//         });
//         setSessions(listSessionsLocal(PAGE_ID));
//       }
//     }
//   }, [chatMessages, sessionId]);

//   // ====== finalize روی خروج از برنامه
//   useEffect(() => {
//     const onBye = () => {
//       if (chatMessages.length > 0) {
//         finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
//       }
//     };
//     window.addEventListener("beforeunload", onBye);
//     return () => {
//       onBye();
//       window.removeEventListener("beforeunload", onBye);
//     };
//   }, [sessionId, chatMessages.length]);

//   // ====== New chat / Select session
//   const handleNewChat = () => {
//     if (chatMessages.length > 0) {
//       finalizeSessionLocal(PAGE_ID, sessionId, chatMessages.length);
//     }
//     setSessionId(makeSessionId()); // سشن جدید بدون meta
//     setSessions(listSessionsLocal(PAGE_ID));
//   };

//   const handleSelectSession = (id: string) => {
//     if (id === sessionId) return;
//     setLoadingSession(true);
//     setSessionId(id);
//     setTimeout(() => setLoadingSession(false), 300);
//   };

//   /* ----------------------------- Programs Modal ----------------------------- */
//   // وقتی نتایج عوض می‌شوند یا صفحه عوض می‌شود، اگر مودال باز است ببندش
//   useEffect(() => {
//     if (programsModalFor != null) setProgramsModalFor(null);
//   }, [professors, currentPage]);

//   // اگر کاربر کشور/استان/مدرسه را عوض کند هم ببند
//   useEffect(() => {
//     if (programsModalFor != null) setProgramsModalFor(null);
//   }, [selectedFilters.country, selectedFilters.state, selectedFilters.school]);

//   function ProgramsModal({
//     open,
//     onClose,
//     programs,
//     programList,
//     updatingIds,
//     toggleProgramInList,
//     normalizeLevel,
//     levelLabel,
//   }: {
//     open: boolean;
//     onClose: () => void;
//     programs: ProgramItem[];
//     programList: string[];
//     updatingIds: Set<string>;
//     toggleProgramInList: (p: ProgramItem) => void;
//     normalizeLevel: (lv: any) => "Bachelor" | "Master" | "PhD" | null;
//     levelLabel: (c: "Bachelor" | "Master" | "PhD") => string;
//   }) {
//     // ESC و لاک اسکرول؛ پاکسازی تضمینی
//     useEffect(() => {
//       if (!open) return;
//       const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
//       window.addEventListener("keydown", onKey);
//       const prev = document.body.style.overflow;
//       document.body.style.overflow = "hidden";
//       return () => {
//         window.removeEventListener("keydown", onKey);
//         document.body.style.overflow = prev;
//       };
//     }, [open, onClose]);

//     if (!open) return null;

//     const content = (
//       <div
//         className="fixed inset-0 z-[1000] qa-programs-modal"
//         aria-modal="true"
//         role="dialog"
//         onClick={onClose}
//       >
//         {/* Backdrop */}
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />

//         {/* Panel */}
//         <div
//           className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
//                    w-auto max-w-2xl max-h-[80vh] rounded-xl bg-white dark:bg-gray-900
//                    shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//             <h5 className="text-sm font-semibold">All Programs</h5>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//               aria-label="Close"
//             >
//               Close
//             </button>
//           </div>

//           <div className="p-3 overflow-y-auto">
//             <div className="space-y-2">
//               {programs.map((prog, i) => {
//                 const pid = String(prog?.id ?? "");
//                 const selected = pid && programList.includes(pid);
//                 const isBusy = pid && updatingIds.has(pid);
//                 const canon = normalizeLevel(prog?.level);

//                 return (
//                   <motion.button
//                     key={`${pid || "noid"}-${canon ?? "NA"}-${i}`}
//                     type="button"
//                     onClick={() => pid && toggleProgramInList(prog)}
//                     disabled={!pid || !!isBusy}
//                     className={cn(
//                       "w-full text-left flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 disabled:opacity-60",
//                       selected
//                         ? "border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-900/10"
//                         : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10",
//                       "hover:brightness-105"
//                     )}
//                     initial={{ opacity: 0, y: 8 }}
//                     animate={{ opacity: 1, y: 0 }}
//                   >
//                     {selected ? (
//                       <XCircle className="w-5 h-5" />
//                     ) : (
//                       <CheckCircle className="w-5 h-5" />
//                     )}
//                     <span
//                       className={cn(
//                         "text-sm font-medium",
//                         selected
//                           ? "text-red-800 dark:text-red-300"
//                           : "text-green-800 dark:text-green-300"
//                       )}
//                     >
//                       {prog.name}
//                       {canon && (
//                         <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
//                           {levelLabel(canon)}
//                         </span>
//                       )}
//                     </span>
//                   </motion.button>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     );

//     return createPortal(content, document.body);
//   }

//   /* --------------------------- Level helpers --------------------------- */

//   const normalizeLevel = (lv: any): "Bachelor" | "Master" | "PhD" | null => {
//     const t = String(lv ?? "")
//       .toLowerCase()
//       .trim();
//     if (
//       /\bph\.?\s*d\.?\b/.test(t) ||
//       t.includes("doctor of philosophy") ||
//       /\bdphil\b/.test(t)
//     )
//       return "PhD";
//     if (
//       t.includes("master") ||
//       /\bm\.?s\.?c?(\b|$)/.test(t) ||
//       /\bmeng\b/.test(t) ||
//       /\bmtech\b/.test(t) ||
//       /\bma\b/.test(t)
//     )
//       return "Master";
//     if (
//       t.includes("bachelor") ||
//       /\bb\.?s\.?c?(\b|$)/.test(t) ||
//       /\bbeng\b/.test(t) ||
//       /\bbtech\b/.test(t) ||
//       /\bba\b/.test(t)
//     )
//       return "Bachelor";
//     return null;
//   };

//   const levelLabel = (canon: "Bachelor" | "Master" | "PhD") =>
//     canon === "Bachelor"
//       ? "— Bachelor (BSc)"
//       : canon === "Master"
//       ? "— Master (M.S.)"
//       : "— Ph.D. (Doctor of Philosophy)";

//   /* -------------------------------- Render ------------------------------ */

//   if (loading && professors.length === 0) {
//     return (
//       <div className="p-6">
//         <div className="space-y-6">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <div
//               key={i}
//               className="p-6 border rounded-lg bg-white dark:bg-gray-900 flex gap-6 animate-pulse"
//             >
//               <Skeleton className="w-24 h-24 rounded-full" />
//               <div className="flex-1 space-y-4">
//                 <Skeleton className="h-6 w-1/3" />
//                 <Skeleton className="h-4 w-1/2" />
//                 <Skeleton className="h-4 w-1/4" />
//                 <Skeleton className="h-4 w-full" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }
//   // ====== ۱/۳: چت
//   const chatComponent = (
//     <>
//       <ChatHeader
//         sessions={sessions}
//         currentSessionId={sessionId}
//         onNewChat={handleNewChat}
//         onSelectSession={handleSelectSession}
//       />

//       <div className="flex-1 overflow-hidden">
//         <ChatHistory
//           messages={chatMessages}
//           onQuickReply={sendQuickReply}
//           showTyping={isChatBusy}
//           loadingSession={loadingSession}
//           welcomeMessage="Hello! Ask anything you want about the Professors.🙂"
//         />
//       </div>

//       {pendingProposal && (
//         <div className="px-3 pt-2">
//           <Button
//             onClick={confirmPendingProposal}
//             disabled={isChatBusy}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             {pendingProposal.label || "Filter"}
//           </Button>
//         </div>
//       )}

//       <div className="flex-shrink-0">
//         <ChatComposer
//           onSendMessage={sendMessage}
//           placeholder="Ask about professors, departments, rankings…"
//           isLoading={isChatBusy}
//         />
//       </div>
//     </>
//   );
//   return (
//     <div className="p-6 animate-fade-in">
//       <div className="flex justify-between items-center mb-6">
//         <motion.h1
//           className="text-2xl font-bold text-gray-900 dark:text-white"
//           initial={{ x: -20, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           Find Professors
//         </motion.h1>
//         <motion.div
//           className="text-sm text-gray-500 dark:text-gray-400"
//           initial={{ x: 20, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           Professors are sorted by university ranking
//         </motion.div>
//       </div>

//       {/* Filters */}
//       <motion.div
//         className="mb-4"
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//       >
//         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-4 mb-6">
//           <div className="flex items-center gap-2 mb-4">
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               className="text-gray-500"
//             >
//               <path
//                 d="M3 4.5h18M7 12h10M11 19.5h2"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//             <h2 className="font-semibold text-gray-700 dark:text-gray-200">
//               Filters
//             </h2>
//           </div>

//           <div
//             className="grid
//     grid-cols-[repeat(2,max-content)]
//     md:grid-cols-[repeat(4,max-content)]
//     gap-2 md:gap-6 justify-center"
//           >
//             {/* Country (single) */}
//             <FilterDropdown
//               label="Country"
//               icon={<span>{filterIcons.country}</span>}
//               options={allCountryOptions}
//               onSelect={(value) => handleFilterSelect("country", value)}
//               selectedValue={String((selectedFilters.country as string) || "")}
//               selectedLabel={selectedCountryLabel}
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//             />

//             {/* State (multi) + شمارنده */}
//             <FilterDropdown
//               label="State"
//               icon={<span>{filterIcons.state}</span>}
//               options={availableStates}
//               multiple
//               showCount
//               selectedValues={
//                 Array.isArray(selectedFilters.state)
//                   ? (selectedFilters.state as string[])
//                   : []
//               }
//               onChange={(vals) =>
//                 handleMultiFilterChange("state", vals as string[])
//               }
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//               disabled={
//                 loadingStates ||
//                 !selectedFilters.country ||
//                 availableStates.length === 0
//               }
//             />

//             {/* School (single) */}
//             <FilterDropdown
//               label="School"
//               icon={<span>{filterIcons.schools}</span>}
//               options={availableSchoolsForDropdown}
//               multiple
//               showCount
//               selectedValues={
//                 Array.isArray(selectedFilters.school)
//                   ? (selectedFilters.school as string[])
//                   : []
//               }
//               onChange={
//                 (vals) => handleMultiFilterChange("school", vals as string[]) // ✅
//               }
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//               disabled={
//                 loadingSchoolsForDropdown ||
//                 !selectedFilters.country ||
//                 availableSchoolsForDropdown.length === 0
//               }
//             />

//             {/* Area of Study (multi) */}
//             <FilterDropdown
//               label="Area of Study"
//               icon={<span>{filterIcons.areaOfStudy}</span>}
//               options={allAreaOfStudyOptions}
//               multiple
//               showCount
//               selectedValues={
//                 Array.isArray(selectedFilters.areaOfStudy)
//                   ? (selectedFilters.areaOfStudy as string[])
//                   : []
//               }
//               onChange={(vals) =>
//                 handleMultiFilterChange("areaOfStudy", vals as string[])
//               }
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//             />

//             {/* Program (multi) وابسته به Area + DegreeLevel */}
//             <FilterDropdown
//               label="Program"
//               icon={<span>{filterIcons.programs}</span>}
//               options={
//                 availablePrograms.length
//                   ? availablePrograms
//                   : allProgramOptionsFallback
//               }
//               multiple
//               showCount
//               selectedValues={
//                 Array.isArray(selectedFilters.program)
//                   ? (selectedFilters.program as string[])
//                   : []
//               }
//               onChange={(vals) =>
//                 handleMultiFilterChange("program", vals as string[])
//               }
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//               disabled={
//                 loadingPrograms ||
//                 !(
//                   Array.isArray(selectedFilters.areaOfStudy) &&
//                   selectedFilters.areaOfStudy.length > 0
//                 ) ||
//                 availablePrograms.length === 0
//               }
//             />

//             {/* Research Interest (multi) + شمارنده */}
//             <FilterDropdown
//               label="Research Interest"
//               icon={<span>{filterIcons.researchInterest}</span>}
//               options={mappedResearchInterestOptions}
//               multiple
//               showCount
//               selectedValues={
//                 Array.isArray(selectedFilters.researchInterest)
//                   ? (selectedFilters.researchInterest as string[])
//                   : []
//               }
//               onChange={(vals) =>
//                 handleMultiFilterChange("researchInterest", vals as string[])
//               }
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//             />

//             {/* Professor Title (single) */}
//             <FilterDropdown
//               label="Professor Title"
//               icon={<span>{filterIcons.title}</span>}
//               options={mappedProfessorTitleOptions}
//               onSelect={(value) => handleFilterSelect("title", value)}
//               selectedValue={String((selectedFilters.title as string) || "")}
//               selectedLabel={selectedProfessorTitleLabel}
//               fixedWidthClass={FILTER_WIDTH}
//               buttonClassName={FILTER_BTN}
//               maxLabelChars={20}
//             />

//             {/* دکمه Filter */}
//             <div className="flex items-center">
//               <Button
//                 type="button"
//                 onClick={applyFilters}
//                 disabled={!isApplyEnabled || loading}
//                 className={`ml-2 w-full ${
//                   isApplyEnabled && !loading
//                     ? "bg-blue-600 hover:bg-blue-700 text-white"
//                     : "opacity-50 cursor-not-allowed"
//                 }`}
//               >
//                 Filter
//               </Button>
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* chat paylod */}
//       <DualPaneLayout
//         chat={chatComponent}
//         results={[
//           <ResultsColumn
//             key="programs-results"
//             padded
//             emptyState={
//               <div className="text-muted-foreground">No results to display</div>
//             }
//           >
//             {/* List */}
//             {!loading && (
//               <motion.div
//                 className="space-y-6"
//                 variants={containerVariants}
//                 initial={false}
//                 animate="visible"
//               >
//                 {Array.isArray(professors) &&
//                   professors.map((professor) => {
//                     const profPrograms: ProgramItem[] = Array.isArray(
//                       (professor as any).programs
//                     )
//                       ? (professor as any).programs
//                       : professor.program_name
//                       ? [
//                           {
//                             id: professor.program_id,
//                             name: professor.program_name,
//                             level: null,
//                           },
//                         ]
//                       : [];

//                     const initialPrograms = profPrograms.slice(0, 3);
//                     const fullList = profPrograms;
//                     const canShowMore =
//                       fullList.length > initialPrograms.length;
//                     return (
//                       <AnimatedCard
//                         key={professor.ID}
//                         delay={0.2}
//                         className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
//                       >
//                         <CardContent className="p-6">
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             {/* Profile */}
//                             <motion.div
//                               className="flex flex-col items-center md:items-start gap-4"
//                               variants={itemVariants}
//                             >
//                               <div className="flex items-start gap-4 w-full">
//                                 <div className="relative">
//                                   <motion.img
//                                     src={professor.image || "/placeholder.svg"}
//                                     alt={`${professor.name}'s avatar`}
//                                     className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900/30 shadow-md"
//                                     whileHover={{ scale: 1.05 }}
//                                     transition={{ duration: 0.2 }}
//                                   />
//                                   <motion.div
//                                     className="absolute -bottom-2 -right-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full px-3 py-1 text-xs font-medium shadow-sm border border-purple-200 dark:border-purple-800"
//                                     initial={{ scale: 0, opacity: 0 }}
//                                     animate={{ scale: 1, opacity: 1 }}
//                                     transition={{ delay: 0.5, type: "spring" }}
//                                   >
//                                     {professor.title}
//                                   </motion.div>
//                                 </div>

//                                 <div className="flex flex-col">
//                                   <div className="flex items-center gap-2">
//                                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                                       {professor.name}
//                                     </h3>
//                                     <button
//                                       onClick={() => {
//                                         setFavorites((prev) => {
//                                           const next = {
//                                             ...prev,
//                                             [professor.ID]: !prev[professor.ID],
//                                           };
//                                           toast({
//                                             title: next[professor.ID]
//                                               ? "Success"
//                                               : "Info",
//                                             description: next[professor.ID]
//                                               ? `${professor.name} added to My Professors`
//                                               : `${professor.name} removed from My Professors`,
//                                           });
//                                           return next;
//                                         });
//                                       }}
//                                       className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
//                                       aria-label={
//                                         favorites[professor.ID]
//                                           ? "Remove from favorites"
//                                           : "Add to favorites"
//                                       }
//                                     >
//                                       <Heart
//                                         className={cn(
//                                           "h-5 w-5 transition-colors duration-300",
//                                           favorites[professor.ID]
//                                             ? "text-red-500 fill-red-500"
//                                             : ""
//                                         )}
//                                       />
//                                     </button>
//                                   </div>

//                                   <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2 w-full min-h-[80px]">
//                                     <div className="flex flex-col">
//                                       <a
//                                         href="#"
//                                         className="text-purple-600 dark:text-purple-400 hover:underline text-md font-medium transition-colors"
//                                       >
//                                         {professor.school_name}
//                                       </a>
//                                       <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
//                                         <MapPin className="h-3 w-3 mr-1" />{" "}
//                                         {professor.state},{" "}
//                                         {professor.country_name}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* contact icons */}
//                               <div className="flex items-center gap-6 mt-2 justify-center w-full">
//                                 {professor.email && (
//                                   <a
//                                     href={`mailto:${professor.email}`}
//                                     className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
//                                   >
//                                     <Mail className="w-6 h-6" />
//                                   </a>
//                                 )}
//                                 {professor.google_scholar && (
//                                   <a
//                                     href={professor.google_scholar}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
//                                   >
//                                     <svg
//                                       xmlns="http://www.w3.org/2000/svg"
//                                       width="24"
//                                       height="24"
//                                       viewBox="0 0 24 24"
//                                       fill="currentColor"
//                                     >
//                                       <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 0 0 0-14z" />
//                                       <path d="M10 15h4v1h-4z" />
//                                       <path d="M10 18h4v1h-4z" />
//                                       <path d="M10 12h4v1h-4z" />
//                                     </svg>
//                                   </a>
//                                 )}
//                                 {professor.website && (
//                                   <a
//                                     href={professor.website}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
//                                   >
//                                     <Globe className="w-6 h-6" />
//                                   </a>
//                                 )}
//                               </div>

//                               <div className="flex flex-wrap gap-2 w-full mt-2">
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
//                                   onClick={() => handleEmailClick(professor)}
//                                 >
//                                   <Mail className="h-4 w-4 mr-1" />
//                                   Send Email
//                                 </Button>
//                                 <Button
//                                   variant="outline"
//                                   size="sm"
//                                   className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
//                                   onClick={() => handleReminderClick(professor)}
//                                 >
//                                   <Send className="h-4 w-4 mr-1" />
//                                   Remind
//                                 </Button>
//                               </div>
//                             </motion.div>

//                             {/* Research + Programs */}
//                             <motion.div
//                               className="md:col-span-2"
//                               variants={itemVariants}
//                             >
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full ">
//                                 {/* Research Interests */}
//                                 <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
//                                   <div className="flex justify-between items-center mb-2">
//                                     <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
//                                       Research Interest
//                                     </h4>
//                                   </div>

//                                   {(() => {
//                                     const all = processResearchAreas(
//                                       professor.research_area
//                                     );
//                                     const expanded =
//                                       !!expandedResearch[professor.ID];
//                                     const toShow = expanded
//                                       ? all
//                                       : all.slice(0, 3);
//                                     return (
//                                       <>
//                                         <ul className="space-y-3">
//                                           {toShow.map((interest, i) => (
//                                             <motion.li
//                                               key={i}
//                                               className="flex items-start gap-2 transition-all duration-300 hover:translate-x-1"
//                                               initial={{ x: -10, opacity: 0 }}
//                                               animate={{ x: 0, opacity: 1 }}
//                                               transition={{
//                                                 delay: 0.3 + i * 0.05,
//                                               }}
//                                             >
//                                               <span className="text-purple-500 dark:text-purple-400 mt-1">
//                                                 •
//                                               </span>
//                                               <span className="text-gray-700  dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
//                                                 {interest}
//                                               </span>
//                                             </motion.li>
//                                           ))}
//                                         </ul>

//                                         {all.length > 3 && (
//                                           <div className="mt-4 flex justify-end">
//                                             <motion.button
//                                               whileHover={{ scale: 1.03 }}
//                                               className="text-purple-600 dark:text-purple-400 text-sm hover:underline flex items-center gap-1"
//                                               onClick={() =>
//                                                 setExpandedResearch((prev) => ({
//                                                   ...prev,
//                                                   [professor.ID]:
//                                                     !prev[professor.ID],
//                                                 }))
//                                               }
//                                             >
//                                               <span>
//                                                 {expanded
//                                                   ? "Show Less"
//                                                   : "Show More"}
//                                               </span>
//                                               <svg
//                                                 xmlns="http://www.w3.org/2000/svg"
//                                                 className="h-4 w-4"
//                                                 fill="none"
//                                                 viewBox="0 0 24 24"
//                                                 stroke="currentColor"
//                                               >
//                                                 <path
//                                                   strokeLinecap="round"
//                                                   strokeLinejoin="round"
//                                                   strokeWidth={2}
//                                                   d={
//                                                     expanded
//                                                       ? "M5 15l7-7 7 7"
//                                                       : "M19 9l-7 7-7-7"
//                                                   }
//                                                 />
//                                               </svg>
//                                             </motion.button>
//                                           </div>
//                                         )}
//                                       </>
//                                     );
//                                   })()}
//                                 </div>

//                                 {/* Programs */}
//                                 <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
//                                   <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                                     Programs
//                                   </h4>

//                                   <div
//                                     className="relative"
//                                     ref={(el) =>
//                                       (modalContainerRefs.current[
//                                         professor.ID
//                                       ] = el)
//                                     }
//                                   >
//                                     {(() => {
//                                       const relPrograms: ProgramItem[] =
//                                         Array.isArray(professor.programs)
//                                           ? professor.programs
//                                           : [];
//                                       const initialPrograms = relPrograms.slice(
//                                         0,
//                                         3
//                                       );
//                                       const fullList = relPrograms;
//                                       const canShowMore =
//                                         fullList.length >
//                                         initialPrograms.length;

//                                       return (
//                                         <>
//                                           <div className="space-y-3">
//                                             {initialPrograms.map((prog, i) => {
//                                               const pid = prog?.id
//                                                 ? String(prog.id)
//                                                 : "";
//                                               const hasId = pid !== "";
//                                               const selected =
//                                                 hasId &&
//                                                 programList.includes(pid);
//                                               const isBusy =
//                                                 hasId && updatingIds.has(pid);

//                                               return (
//                                                 <motion.button
//                                                   key={`${pid || "noid"}-${
//                                                     prog.level ?? "NA"
//                                                   }-${i}`}
//                                                   type="button"
//                                                   onClick={() =>
//                                                     hasId &&
//                                                     toggleProgramInList(prog)
//                                                   }
//                                                   disabled={!hasId || isBusy}
//                                                   className={cn(
//                                                     "w-full text-left flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 disabled:opacity-60",
//                                                     selected
//                                                       ? "border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-900/10"
//                                                       : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10",
//                                                     "hover:brightness-105"
//                                                   )}
//                                                   initial={{ opacity: 0, y: 8 }}
//                                                   animate={{ opacity: 1, y: 0 }}
//                                                   transition={{
//                                                     delay: 0.2 + i * 0.04,
//                                                   }}
//                                                   title={
//                                                     hasId
//                                                       ? selected
//                                                         ? "Remove from My Programs"
//                                                         : "Add to My Programs"
//                                                       : "No program id"
//                                                   }
//                                                 >
//                                                   {selected ? (
//                                                     <XCircle className="w-5 h-5 text-red-500" />
//                                                   ) : (
//                                                     <CheckCircle className="w-5 h-5 text-green-500" />
//                                                   )}
//                                                   <span
//                                                     className={cn(
//                                                       "text-sm font-medium",
//                                                       selected
//                                                         ? "text-red-800 dark:text-red-300"
//                                                         : "text-green-800 dark:text-green-300"
//                                                     )}
//                                                   >
//                                                     {prog.name}
//                                                     {prog.level && (
//                                                       <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
//                                                         {prog.level ===
//                                                         "Bachelor"
//                                                           ? "— Bachelor (BSc)"
//                                                           : prog.level ===
//                                                             "Master"
//                                                           ? "— Master (M.S.)"
//                                                           : prog.level === "PhD"
//                                                           ? "— Ph.D. (Doctor of Philosophy)"
//                                                           : ""}
//                                                       </span>
//                                                     )}
//                                                   </span>
//                                                 </motion.button>
//                                               );
//                                             })}

//                                             {canShowMore && (
//                                               <motion.button
//                                                 className="text-purple-600 dark:text-purple-400 text-sm hover:underline flex items-center gap-1 mt-1"
//                                                 initial={{ opacity: 0 }}
//                                                 animate={{ opacity: 1 }}
//                                                 transition={{ delay: 0.4 }}
//                                                 whileHover={{ x: 2 }}
//                                                 onClick={() =>
//                                                   setProgramsModalFor(
//                                                     professor.ID
//                                                   )
//                                                 }
//                                               >
//                                                 <span>Show More</span>
//                                                 <svg
//                                                   xmlns="http://www.w3.org/2000/svg"
//                                                   className="h-4 w-4"
//                                                   fill="none"
//                                                   viewBox="0 0 24 24"
//                                                   stroke="currentColor"
//                                                 >
//                                                   <path
//                                                     strokeLinecap="round"
//                                                     strokeLinejoin="round"
//                                                     strokeWidth={2}
//                                                     d={"M19 9l-7 7-7-7"}
//                                                   />
//                                                 </svg>
//                                               </motion.button>
//                                             )}
//                                           </div>

//                                           <ProgramsModal
//                                             open={
//                                               programsModalFor === professor.ID
//                                             }
//                                             onClose={() =>
//                                               setProgramsModalFor(null)
//                                             }
//                                             programs={fullList}
//                                             programList={programList}
//                                             updatingIds={updatingIds}
//                                             toggleProgramInList={
//                                               toggleProgramInList
//                                             }
//                                             normalizeLevel={normalizeLevel}
//                                             levelLabel={levelLabel}
//                                           />
//                                         </>
//                                       );
//                                     })()}
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </div>
//                         </CardContent>
//                       </AnimatedCard>
//                     );
//                   })}
//               </motion.div>
//             )}

//             {/* No results */}
//             {!loading && professors.length === 0 && (
//               <motion.div
//                 className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner mt-8"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
//                   No professors found
//                 </h3>
//                 <p className="text-gray-500 dark:text-gray-400">
//                   Try adjusting your filters to find more professors.
//                 </p>
//               </motion.div>
//             )}

//             {/* Load More */}
//             {!loading && totalPages > 1 && currentPage < totalPages && (
//               <div className="flex justify-center mt-8">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     const newPage = currentPage + 1;
//                     setCurrentPage(newPage);
//                     fetchProfessors(newPage, selectedFilters, { append: true });
//                   }}
//                   disabled={loadingMore}
//                 >
//                   {loadingMore ? "Loading..." : "Load More"}
//                 </Button>
//               </div>
//             )}
//           </ResultsColumn>,
//         ]}
//         layout={{
//           separateBoxes: true,
//           boxGap: "6",
//           chatRatio: 0.35,
//           chatHeightMode: "vh",
//           chatHeight: 90,
//           stickyChat: false,
//         }}
//       />

//       {/* Email Composition Dialog */}
//       {selectedProfessor && (
//         <ProfessorContactDialog
//           open={emailDialogOpen}
//           onOpenChange={setEmailDialogOpen}
//           professor={selectedProfessor}
//           directEmailMode={true}
//         />
//       )}

//       {/* Reminder Dialog */}
//       {selectedProfessor && (
//         <ProfessorContactDialog
//           open={reminderDialogOpen}
//           onOpenChange={setReminderDialogOpen}
//           professor={selectedProfessor}
//           isReminder={true}
//         />
//       )}
//     </div>
//   );
// };

// export default FindProfessors;

////////////////////////////////////////
// FindProfessors.tsx
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useToast } from "../../hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import AnimatedCard from "../ui/animated-card";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Globe,
  Heart,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import ProfessorContactDialog from "./ProfessorContactDialog";
import { Skeleton } from "../ui/skeleton";
import {
  UserPreferences,
  FilterOption,
  DialogProfessor,
  AvailableAreaOfStudy,
  AvailableProgram,
} from "../../types";
import FilterDropdown from "../filters/FilterDropdown";
import {
  countryOptions,
  areaOfStudyOptions,
  programOptions,
  professorTitleOptions,
  filterIcons,
} from "../filters/FilterData";

// CHAT
import ChatHeader from "../chat/ChatHeader";
import ChatHistory from "../chat/ChatHistory";
import ChatComposer from "../chat/ChatComposer";
import { useChatController } from "../chat/useChatController";
import DualPaneLayout from "../chat/DualPaneLayout";

// SESSIONS
import {
  makeSessionId,
  listSessionsLocal,
  upsertSessionMetaLocal,
  finalizeSessionLocal,
  updateSessionTitleLocal,
  type SessionMeta,
} from "../chat/storage";

// OPTIONAL: مرج پچ فیلتر
import { mergeFilterPatch } from "../chat/mergeFilters";

// LAYOUT
import ResultsColumn from "../chat/ResultsColumn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* -------------------------------- Types -------------------------------- */
type FilterSnapshot = {
  country?: string;
  state?: string;
  school?: string;
  degreeLevel?: string;
  areaOfStudy?: string;
  program?: string;
  researchInterest?: string; // CSV
  title?: string;
};

type FilterPatch = Partial<FilterSnapshot>;

const arrToCsv = (a?: string[]) =>
  Array.isArray(a) && a.length ? a.join(",") : "";
const csvToArr = (s?: string) =>
  s
    ? s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

type Professor = {
  ID: number;
  name: string;
  title: string;
  email: string;
  program_id: number;
  school_id: number;
  research_area: string;
  link: string;
  department_id: number | null;
  google_scholar: string | null;
  website: string | null;
  linkedin: string | null;
  image: string | null;
  status: string;
  creator_id: number;
  date: string;
  program_name: string;
  area_of_study_name: string;
  country_name: string;
  school_name: string;
  state: string;
  country: string;
  programs?: ProgramItem[];
};

type ProgramItem = {
  id: number | string;
  name: string;
  level?: "Bachelor" | "Master" | "PhD" | string | null;
  level_label?: string;
  type?: string | null;
  status?: string;
};

type CategoryPrograms = {
  groups: {
    Bachelor: ProgramItem[];
    Master: ProgramItem[];
    PhD: ProgramItem[];
  };
  flat: ProgramItem[];
  all: ProgramItem[];
};

const defaultCategoryPrograms: CategoryPrograms = {
  groups: { Bachelor: [], Master: [], PhD: [] },
  flat: [],
  all: [],
};

/* ---------------- Filter state (align with FindSchools) ---------------- */
type FiltersState = {
  country?: string;
  state?: string[]; // multi
  school?: string[]; // multi
  degreeLevel?: string;
  areaOfStudy?: string[]; // multi
  program?: string[]; // multi
  researchInterest?: string[]; // multi
  title?: string;
  page?: number;
  limit?: number;
};

// ====== ثابت صفحه
const PAGE_ID = "find-professors";
const FILTER_WIDTH = "w-[150px] sm:w-[180px] md:w-[260px]";
const FILTER_BTN = "truncate";

// پیش‌نمایش عنوان سشن از اولین پیام کاربر
function previewTitle(text: string, max = 40) {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  return clean.length > max
    ? clean.slice(0, max) + "…"
    : clean || "Untitled chat";
}

const FindProfessors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);

  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({});
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});

  const [selectedProfessor, setSelectedProfessor] =
    useState<DialogProfessor | null>(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [availablePrograms, setAvailablePrograms] = useState<FilterOption[]>(
    []
  );
  const [availableResearchInterests, setAvailableResearchInterests] = useState<
    string[]
  >([]);

  // State & School dropdowns
  const [availableStates, setAvailableStates] = useState<FilterOption[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [availableSchoolsForDropdown, setAvailableSchoolsForDropdown] =
    useState<FilterOption[]>([]);
  const [loadingSchoolsForDropdown, setLoadingSchoolsForDropdown] =
    useState(false);

  const [categoryPrograms, setCategoryPrograms] = useState<CategoryPrograms>(
    defaultCategoryPrograms
  );
  const [expandedResearch, setExpandedResearch] = useState<
    Record<number, boolean>
  >({});

  const [programList, setProgramList] = useState<string[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const [programsModalFor, setProgramsModalFor] = useState<number | null>(null);
  const modalContainerRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const initialFetchCompleted = useRef(false);
  const initialUserPrefFiltersApplied = useRef(false);

  // ====== AbortControllers (تنها افزودۀ بی‌خطر)
  const findAbortRef = useRef<AbortController | null>(null);
  const statesAbortRef = useRef<AbortController | null>(null);
  const schoolsAbortRef = useRef<AbortController | null>(null);
  const programsAbortRef = useRef<AbortController | null>(null);
  const resetController = (
    ref: React.MutableRefObject<AbortController | null>
  ) => {
    if (ref.current) ref.current.abort();
    ref.current = new AbortController();
    return ref.current;
  };

  // ====== سشن‌های چت (History)
  const [sessionId, setSessionId] = useState<string>(() => makeSessionId());
  const [sessions, setSessions] = useState<SessionMeta[]>(() =>
    listSessionsLocal(PAGE_ID)
  );
  const [loadingSession, setLoadingSession] = useState(false);

  /* --------------------------- Server ProgramList --------------------------- */
  const fetchProgramList = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/program-data/program-list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      const arr = Array.isArray(data.programList)
        ? data.programList.map((x: any) => String(x))
        : [];
      setProgramList(arr);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProgramList();
  }, [fetchProgramList]);

  const toggleProgramInList = useCallback(
    async (p: ProgramItem) => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }
      const pid = String(p.id);
      const isSelected = programList.includes(pid);
      const action = isSelected ? "remove" : "add";
      setUpdatingIds((prev) => new Set(prev).add(pid));
      try {
        const res = await fetch(`${API_URL}/program-data/program-list`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ programId: pid, action }),
        });
        if (!res.ok) throw new Error("Failed to update program list");
        const data = await res.json();
        const next = Array.isArray(data.programList)
          ? data.programList.map((x: any) => String(x)).filter(Boolean)
          : [];
        setProgramList(next);
        toast({
          title: isSelected ? "Removed" : "Added",
          description: `${p.name} ${
            isSelected ? "removed from" : "added to"
          } My Programs`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Could not update your program list.",
          variant: "destructive",
        });
      } finally {
        setUpdatingIds((prev) => {
          const s = new Set(prev);
          s.delete(pid);
          return s;
        });
      }
    },
    [navigate, programList, toast]
  );

  /* ----------------------------- Memo’d opts ---------------------------- */
  const allCountryOptions = useMemo<FilterOption[]>(() => {
    return (userPreferences?.availableCountries || []).map((c) => ({
      value: String(c.country),
      label: c.name,
    }));
  }, [userPreferences?.availableCountries]);

  const allAreaOfStudyOptions = useMemo<FilterOption[]>(() => {
    const fromPrefs = (userPreferences?.availableAreasOfStudy || []).map(
      (a: AvailableAreaOfStudy) => ({
        value: String(a.id),
        label: a.name,
      })
    );
    const mapped = areaOfStudyOptions.map((area, idx) => ({
      value: String(idx + 1),
      label: area,
    }));
    return fromPrefs.concat(
      mapped.filter((o) => !fromPrefs.some((p) => p.value === o.value))
    );
  }, [userPreferences?.availableAreasOfStudy]);

  const allProgramOptionsFallback = useMemo<FilterOption[]>(() => {
    const fromPrefs = (userPreferences?.availablePrograms || []).map(
      (p: AvailableProgram) => ({
        value: String(p.id),
        label: p.name,
      })
    );
    const mapped = programOptions.map((program, idx) => ({
      value: String(idx + 1),
      label: program,
    }));
    return fromPrefs.concat(
      mapped.filter((o) => !fromPrefs.some((p) => p.value === o.value))
    );
  }, [userPreferences?.availablePrograms]);

  const mappedResearchInterestOptions = useMemo<FilterOption[]>(() => {
    return availableResearchInterests.map((v) => ({ value: v, label: v }));
  }, [availableResearchInterests]);

  const mappedProfessorTitleOptions = useMemo<FilterOption[]>(() => {
    return professorTitleOptions.map((v) => ({ value: v, label: v }));
  }, []);

  const getLabelFromIdOrValue = useCallback(
    (val: string | number, options: FilterOption[]) => {
      if (!val) return "";
      const s = String(val);
      return options.find((o) => o.value === s)?.label || "";
    },
    []
  );

  const selectedCountryLabel = useMemo(
    () =>
      getLabelFromIdOrValue(
        (selectedFilters.country as string) || "",
        allCountryOptions
      ),
    [selectedFilters.country, allCountryOptions, getLabelFromIdOrValue]
  );

  const selectedProfessorTitleLabel = useMemo(
    () =>
      getLabelFromIdOrValue(
        (selectedFilters.title as string) || "",
        mappedProfessorTitleOptions
      ),
    [selectedFilters.title, mappedProfessorTitleOptions, getLabelFromIdOrValue]
  );

  /* --------------------------- Fetch helpers --------------------------- */

  // چند Area + DegreeLevel (مثل FindSchools) — بدون تغییر منطق، فقط signal
  const fetchProgramsByAreas = useCallback(async (areaIds: string[]) => {
    setAvailablePrograms([]);
    if (!areaIds?.length) return [];
    setLoadingPrograms(true);
    const ctl = resetController(programsAbortRef);
    try {
      const token = localStorage.getItem("token");
      const requests = areaIds.map((id) =>
        fetch(`${API_URL}/program-data/by-area?areaOfStudy=${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: ctl.signal,
        }).then((r) => (r.ok ? r.json() : { programs: [] }))
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
      return uniquePrograms;
    } catch (e) {
      if ((e as any)?.name !== "AbortError") {
        setAvailablePrograms([]);
      }
      return [];
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  const fetchStates = useCallback(async (countryId?: string) => {
    setAvailableStates([]);
    if (!countryId) {
      setLoadingStates(false);
      return;
    }
    setLoadingStates(true);
    const ctl = resetController(statesAbortRef);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/states?country=${countryId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: ctl.signal,
      });
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
    } catch (e) {
      if ((e as any)?.name !== "AbortError") {
        setAvailableStates([]);
        setLoadingStates(false);
      }
    }
  }, []);

  const fetchSchoolsForDropdown = useCallback(
    async (countryId?: string, stateIdCsv?: string) => {
      setAvailableSchoolsForDropdown([]);
      if (!countryId) {
        setLoadingSchoolsForDropdown(false);
        return;
      }
      setLoadingSchoolsForDropdown(true);
      const ctl = resetController(schoolsAbortRef);
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams();
        params.append("limit", "200");
        if (countryId) params.append("country", String(countryId));
        if (stateIdCsv) params.append("state", String(stateIdCsv));

        const res = await fetch(`${API_URL}/schools?${params.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: ctl.signal,
        });
        if (!res.ok) {
          setAvailableSchoolsForDropdown([]);
          setLoadingSchoolsForDropdown(false);
          return;
        }
        const data = await res.json();

        const mapped: FilterOption[] = (data.schools || []).map((s: any) => ({
          value: String(s.id ?? s.ID ?? s.school_id),
          label: s.name ?? s.school_name ?? s.title,
        }));

        setAvailableSchoolsForDropdown(mapped);
        setSelectedFilters((prev) => {
          const current = Array.isArray(prev.school)
            ? (prev.school as string[]).map(String)
            : [];
          if (current.length === 0) return prev;
          const valid = new Set(mapped.map((o) => String(o.value)));
          const kept = current.filter((id) => valid.has(String(id)));
          if (kept.length === current.length) return prev;
          return { ...prev, school: kept };
        });

        setLoadingSchoolsForDropdown(false);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          setAvailableSchoolsForDropdown([]);
          setLoadingSchoolsForDropdown(false);
        }
      }
    },
    []
  );

  const fetchProfessors = useCallback(
    async (
      page: number,
      filters: FiltersState,
      opts: { append?: boolean } = {}
    ) => {
      const { append = false } = opts;
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const ctl = resetController(findAbortRef);

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const cleanFilters = Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (
              value === undefined ||
              value === "" ||
              key === "page" ||
              key === "limit"
            )
              return acc;
            if (Array.isArray(value)) {
              const csv = (value as string[]).filter(Boolean).join(",");
              if (csv) acc[key] = csv;
            } else if (
              key === "degreeLevel" &&
              String(value).toLowerCase().includes("ph")
            ) {
              acc[key] = "PhD";
            } else {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>
        );

        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(filters.limit ?? 10),
          light: page > 1 ? "1" : "0", // ⇐ دقیقاً مثل قبل
          ...cleanFilters,
        });

        const response = await fetch(
          `${API_URL}/professor-data/find?${queryParams}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: ctl.signal,
          }
        );

        if (!response.ok) throw new Error("Failed to fetch professors");

        const data = await response.json();

        /* --- بوت‌استرپ همانند نسخه‌ی اصلی تو: از userPreferences فیلتر اولیه ساخته می‌شود --- */
        if (!initialUserPrefFiltersApplied.current && data.userPreferences) {
          setUserPreferences(data.userPreferences);

          const parseCSV = (s: string | null): string[] =>
            s
              ? s
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              : [];

          const initial: FiltersState = { page: 1, limit: 10 };

          if (data.userPreferences.country)
            initial.country = String(data.userPreferences.country);

          if (data.userPreferences.level) {
            let levelValue = data.userPreferences.level;
            if (levelValue === "Ph.D.") levelValue = "PhD";
            initial.degreeLevel = levelValue;
          }

          if (data.userPreferences.areaOfStudy?.id)
            initial.areaOfStudy = [String(data.userPreferences.areaOfStudy.id)];

          if (data.userPreferences.program)
            initial.program = [String(data.userPreferences.program)];

          // URL params override/extend
          const urlParams = new URLSearchParams(window.location.search);
          const urlCountry = urlParams.get("country");
          const urlAreaOfStudy = parseCSV(urlParams.get("areaOfStudy"));
          const urlProgram = parseCSV(urlParams.get("program"));
          const urlDegreeLevel = urlParams.get("degreeLevel");
          const urlResearchInterest = parseCSV(
            urlParams.get("researchInterest")
          );
          const urlTitle = urlParams.get("title");
          const urlState = parseCSV(urlParams.get("state"));
          const urlSchool = parseCSV(urlParams.get("school"));

          if (urlCountry) initial.country = urlCountry;
          if (urlAreaOfStudy.length) initial.areaOfStudy = urlAreaOfStudy;
          if (urlProgram.length) initial.program = urlProgram;
          if (urlDegreeLevel) initial.degreeLevel = urlDegreeLevel;
          if (urlSchool.length) initial.school = urlSchool;
          if (urlState.length) initial.state = urlState;
          if (urlResearchInterest.length)
            initial.researchInterest = urlResearchInterest;
          if (urlTitle) initial.title = urlTitle;

          // set filters into UI
          setSelectedFilters(initial);
          setCurrentPage(initial.page as number);

          // preload dependent dropdowns
          if (initial.country) {
            const stateCsv = initial.state?.join(",");
            await fetchStates(initial.country);
            await fetchSchoolsForDropdown(initial.country, stateCsv);
          }
          if ((initial.areaOfStudy?.length ?? 0) > 0) {
            await fetchProgramsByAreas(initial.areaOfStudy!);
          }

          initialUserPrefFiltersApplied.current = true;

          // Now fetch with the initial filters and RETURN (avoid showing unfiltered results)
          await fetchProfessors(1, initial, { append: false });
          return;
        }

        // Normal path
        const newList: Professor[] = Array.isArray(data.professors)
          ? data.professors
          : [];

        setAvailableResearchInterests(
          Array.isArray(data.researchInterests) ? data.researchInterests : []
        );
        setTotalPages(Number(data.totalPages || 0));
        setCategoryPrograms(data.categoryPrograms || defaultCategoryPrograms);

        if (append) {
          setProfessors((prev) => {
            const seen = new Set(prev.map((p) => p.ID));
            const merged = [...prev];
            for (const p of newList) if (!seen.has(p.ID)) merged.push(p);
            return merged;
          });
          setFavorites((prev) => ({
            ...prev,
            ...newList.reduce(
              (acc: Record<number, boolean>, prof: Professor) => {
                if (prev[prof.ID] === undefined) acc[prof.ID] = false;
                return acc;
              },
              {}
            ),
          }));
        } else {
          setProfessors(newList);
          const initialFavorites = newList.reduce(
            (acc: Record<number, boolean>, prof: Professor) => {
              acc[prof.ID] = false;
              return acc;
            },
            {}
          );
          setFavorites(initialFavorites);
        }
      } catch (error) {
        if ((error as any)?.name === "AbortError") return;
        console.error("Error fetching professors:", error);
        toast({
          title: "Error",
          description: "Failed to load professors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [
      navigate,
      toast,
      fetchStates,
      fetchSchoolsForDropdown,
      fetchProgramsByAreas,
    ]
  );

  /* ------------------------------- Effects ------------------------------ */

  // بوت‌استرپ مثل قبل (یک بار) — همون منطق
  useEffect(() => {
    if (!initialFetchCompleted.current) {
      initialFetchCompleted.current = true;
      fetchProfessors(1, selectedFilters);
    }
  }, [fetchProfessors, selectedFilters]);

  // آبشاری: country → states, schools
  useEffect(() => {
    const country = selectedFilters.country;
    if (country) {
      fetchStates(country);
      const stateCsv = Array.isArray(selectedFilters.state)
        ? (selectedFilters.state as string[]).join(",")
        : undefined;
      fetchSchoolsForDropdown(country, stateCsv);
    } else {
      setAvailableStates([]);
      setAvailableSchoolsForDropdown([]);
      setSelectedFilters((prev) => {
        const next = { ...prev };
        delete next.state;
        delete next.school;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters.country]);

  // تغییر state → schools
  useEffect(() => {
    const country = selectedFilters.country;
    if (!country) return;
    const stateCsv = Array.isArray(selectedFilters.state)
      ? (selectedFilters.state as string[]).join(",")
      : undefined;
    fetchSchoolsForDropdown(country, stateCsv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters.state]);

  // Area + DegreeLevel → فچ Programهای وابسته (multi)
  useEffect(() => {
    const areas = Array.isArray(selectedFilters.areaOfStudy)
      ? (selectedFilters.areaOfStudy as string[])
      : [];
    if (areas.length) {
      fetchProgramsByAreas(areas);
    } else {
      setAvailablePrograms([]);
      setSelectedFilters((prev) => {
        const next = { ...prev };
        delete next.program;
        return next;
      });
    }
  }, [selectedFilters.areaOfStudy, fetchProgramsByAreas]);

  /* ----------------------------- UI handlers ---------------------------- */
  const handleFilterSelect = (
    filterName: keyof FiltersState,
    value: string | number
  ) => {
    setSelectedFilters((prev) => {
      const next: FiltersState = { ...prev };
      if (filterName === "areaOfStudy" || filterName === "degreeLevel") {
        delete next.program;
      }
      if (filterName === "country") {
        delete next.state;
        delete next.school;
      }
      if (filterName === "state") {
        delete next.school;
      }
      (next as any)[filterName] = value;
      next.page = 1;
      return next;
    });
  };

  const handleMultiFilterChange = useCallback(
    (
      filterName:
        | "state"
        | "researchInterest"
        | "areaOfStudy"
        | "program"
        | "school",
      values: string[]
    ) => {
      setSelectedFilters((prev) => {
        const next: FiltersState = { ...prev, [filterName]: values, page: 1 };
        if (filterName === "state") delete next.school;
        if (filterName === "areaOfStudy") delete next.program;
        return next;
      });
    },
    []
  );

  const isApplyEnabled = useMemo(() => {
    return Boolean(
      selectedFilters.country &&
        Array.isArray(selectedFilters.areaOfStudy) &&
        selectedFilters.areaOfStudy.length > 0
    );
  }, [selectedFilters.country, selectedFilters.areaOfStudy]);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchProfessors(1, selectedFilters, { append: false });
  }, [fetchProfessors, selectedFilters]);

  const processResearchAreas = (researchArea: string): string[] => {
    if (!researchArea) return [];
    const interests: string[] = [];
    const regex = /s:\d+:"(.*?)";/g;
    let match;
    while ((match = regex.exec(researchArea)) !== null) {
      interests.push(match[1].trim());
    }
    return interests;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const handleEmailClick = (professor: Professor) => {
    const dialogProfessor: DialogProfessor = {
      id: professor.ID,
      name: professor.name,
      title: professor.title,
      email: professor.email,
      research: processResearchAreas(professor.research_area),
    };
    setSelectedProfessor(dialogProfessor);
    setEmailDialogOpen(true);
  };

  const handleReminderClick = (professor: Professor) => {
    const dialogProfessor: DialogProfessor = {
      id: professor.ID,
      name: professor.name,
      title: professor.title,
      email: professor.email,
      research: processResearchAreas(professor.research_area),
    };
    setSelectedProfessor(dialogProfessor);
    setReminderDialogOpen(true);
  };

  // ====== هوک چت
  const getFilterSnapshot = useCallback(
    () => ({ ...selectedFilters }),
    [selectedFilters]
  );
  const applyFilterPatchAndFetch = useCallback(
    async (patch: any) => {
      setSelectedFilters((prev) => mergeFilterPatch(prev, patch));
      setCurrentPage(1);
      await fetchProfessors(1, selectedFilters, { append: false });
    },
    [fetchProfessors, selectedFilters]
  );

  const {
    messages: chatMessages,
    isChatBusy,
    pendingProposal,
    sendMessage,
    sendQuickReply,
    confirmPendingProposal,
    clearPendingProposal,
  } = useChatController({
    pageId: PAGE_ID,
    threadKey: `${PAGE_ID}:${sessionId}`,
    getFilterSnapshot,
    applyFilterPatchAndFetch,
  });

  // ====== عنوان سشن از اولین پیام کاربر
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

  // ====== finalize روی خروج از برنامه
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

  // ====== New chat / Select session
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

  // ====== Level helpers
  const normalizeLevel = (lv: any): "Bachelor" | "Master" | "PhD" | null => {
    const t = String(lv ?? "")
      .toLowerCase()
      .trim();
    if (
      /\bph\.?\s*d\.?\b/.test(t) ||
      t.includes("doctor of philosophy") ||
      /\bdphil\b/.test(t)
    )
      return "PhD";
    if (
      t.includes("master") ||
      /\bm\.?s\.?c?(\b|$)/.test(t) ||
      /\bmeng\b/.test(t) ||
      /\bmtech\b/.test(t) ||
      /\bma\b/.test(t)
    )
      return "Master";
    if (
      t.includes("bachelor") ||
      /\bb\.?s\.?c?(\b|$)/.test(t) ||
      /\bbeng\b/.test(t) ||
      /\bbtech\b/.test(t) ||
      /\bba\b/.test(t)
    )
      return "Bachelor";
    return null;
  };

  const levelLabel = (canon: "Bachelor" | "Master" | "PhD") =>
    canon === "Bachelor"
      ? "— Bachelor (BSc)"
      : canon === "Master"
      ? "— Master (M.S.)"
      : "— Ph.D. (Doctor of Philosophy)";

  /* -------------------------------- Render ------------------------------ */

  if (loading && professors.length === 0) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-6 border rounded-lg bg-white dark:bg-gray-900 flex gap-6 animate-pulse"
            >
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ====== ۱/۳: چت
  const chatComponent = (
    <>
      <ChatHeader
        sessions={sessions}
        currentSessionId={sessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
      />

      <div className="flex-1 overflow-hidden">
        <ChatHistory
          messages={chatMessages}
          onQuickReply={sendQuickReply}
          showTyping={isChatBusy}
          loadingSession={loadingSession}
          welcomeMessage="Hello! Ask anything you want about the Professors.🙂"
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
          placeholder="Ask about professors, departments, rankings…"
          isLoading={isChatBusy}
        />
      </div>
    </>
  );

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Professors
        </motion.h1>
        <motion.div
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Professors are sorted by university ranking
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        className="mb-4"
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
              options={allCountryOptions}
              onSelect={(value) => handleFilterSelect("country", value)}
              selectedValue={String((selectedFilters.country as string) || "")}
              selectedLabel={selectedCountryLabel}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* State (multi) + شمارنده */}
            <FilterDropdown
              label="State"
              icon={<span>{filterIcons.state}</span>}
              options={availableStates}
              multiple
              showCount
              selectedValues={
                Array.isArray(selectedFilters.state)
                  ? (selectedFilters.state as string[])
                  : []
              }
              onChange={(vals) =>
                handleMultiFilterChange("state", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
              disabled={
                loadingStates ||
                !selectedFilters.country ||
                availableStates.length === 0
              }
            />

            {/* School (multi) */}
            <FilterDropdown
              label="School"
              icon={<span>{filterIcons.schools}</span>}
              options={availableSchoolsForDropdown}
              multiple
              showCount
              selectedValues={
                Array.isArray(selectedFilters.school)
                  ? (selectedFilters.school as string[])
                  : []
              }
              onChange={(vals) =>
                handleMultiFilterChange("school", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
              disabled={
                loadingSchoolsForDropdown ||
                !selectedFilters.country ||
                availableSchoolsForDropdown.length === 0
              }
            />

            {/* Area of Study (multi) */}
            <FilterDropdown
              label="Area of Study"
              icon={<span>{filterIcons.areaOfStudy}</span>}
              options={allAreaOfStudyOptions}
              multiple
              showCount
              selectedValues={
                Array.isArray(selectedFilters.areaOfStudy)
                  ? (selectedFilters.areaOfStudy as string[])
                  : []
              }
              onChange={(vals) =>
                handleMultiFilterChange("areaOfStudy", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Program (multi) وابسته به Area + DegreeLevel */}
            <FilterDropdown
              label="Program"
              icon={<span>{filterIcons.programs}</span>}
              options={
                availablePrograms.length
                  ? availablePrograms
                  : allProgramOptionsFallback
              }
              multiple
              showCount
              selectedValues={
                Array.isArray(selectedFilters.program)
                  ? (selectedFilters.program as string[])
                  : []
              }
              onChange={(vals) =>
                handleMultiFilterChange("program", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
              disabled={
                loadingPrograms ||
                !(
                  Array.isArray(selectedFilters.areaOfStudy) &&
                  selectedFilters.areaOfStudy.length > 0
                ) ||
                availablePrograms.length === 0
              }
            />

            {/* Research Interest (multi) + شمارنده */}
            <FilterDropdown
              label="Research Interest"
              icon={<span>{filterIcons.researchInterest}</span>}
              options={mappedResearchInterestOptions}
              multiple
              showCount
              selectedValues={
                Array.isArray(selectedFilters.researchInterest)
                  ? (selectedFilters.researchInterest as string[])
                  : []
              }
              onChange={(vals) =>
                handleMultiFilterChange("researchInterest", vals as string[])
              }
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* Professor Title (single) */}
            <FilterDropdown
              label="Professor Title"
              icon={<span>{filterIcons.title}</span>}
              options={mappedProfessorTitleOptions}
              onSelect={(value) => handleFilterSelect("title", value)}
              selectedValue={String((selectedFilters.title as string) || "")}
              selectedLabel={selectedProfessorTitleLabel}
              fixedWidthClass={FILTER_WIDTH}
              buttonClassName={FILTER_BTN}
              maxLabelChars={20}
            />

            {/* دکمه Apply */}
            <div className="flex items-center">
              <Button
                type="button"
                onClick={applyFilters}
                disabled={!isApplyEnabled || loading}
                className={`ml-2 w-full ${
                  isApplyEnabled && !loading
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

      {/* chat paylod */}
      <DualPaneLayout
        chat={chatComponent}
        results={[
          <ResultsColumn
            key="programs-results"
            padded
            emptyState={
              <div className="text-muted-foreground">No results to display</div>
            }
          >
            {/* List */}
            {!loading && (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial={false}
                animate="visible"
              >
                {Array.isArray(professors) &&
                  professors.map((professor) => {
                    const profPrograms: ProgramItem[] = Array.isArray(
                      (professor as any).programs
                    )
                      ? (professor as any).programs
                      : professor.program_name
                      ? [
                          {
                            id: professor.program_id,
                            name: professor.program_name,
                            level: null,
                          },
                        ]
                      : [];

                    const initialPrograms = profPrograms.slice(0, 3);
                    const fullList = profPrograms;
                    const canShowMore =
                      fullList.length > initialPrograms.length;
                    return (
                      <AnimatedCard
                        key={professor.ID}
                        delay={0.2}
                        className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                      >
                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Profile */}
                            <motion.div
                              className="flex flex-col items-center md:items-start gap-4"
                              variants={itemVariants}
                            >
                              <div className="flex items-start gap-4 w-full">
                                <div className="relative">
                                  <motion.img
                                    src={professor.image || "/placeholder.svg"}
                                    alt={`${professor.name}'s avatar`}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900/30 shadow-md"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                    loading="lazy"
                                  />
                                  <motion.div
                                    className="absolute -bottom-2 -right-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full px-3 py-1 text-xs font-medium shadow-sm border border-purple-200 dark:border-purple-800"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                  >
                                    {professor.title}
                                  </motion.div>
                                </div>

                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                      {professor.name}
                                    </h3>
                                    <button
                                      onClick={() => {
                                        setFavorites((prev) => {
                                          const next = {
                                            ...prev,
                                            [professor.ID]: !prev[professor.ID],
                                          };
                                          toast({
                                            title: next[professor.ID]
                                              ? "Success"
                                              : "Info",
                                            description: next[professor.ID]
                                              ? `${professor.name} added to My Professors`
                                              : `${professor.name} removed from My Professors`,
                                          });
                                          return next;
                                        });
                                      }}
                                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                      aria-label={
                                        favorites[professor.ID]
                                          ? "Remove from favorites"
                                          : "Add to favorites"
                                      }
                                    >
                                      <Heart
                                        className={cn(
                                          "h-5 w-5 transition-colors duration-300",
                                          favorites[professor.ID]
                                            ? "text-red-500 fill-red-500"
                                            : ""
                                        )}
                                      />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2 w-full min-h-[80px]">
                                    <div className="flex flex-col">
                                      <a
                                        href="#"
                                        className="text-purple-600 dark:text-purple-400 hover:underline text-md font-medium transition-colors"
                                      >
                                        {professor.school_name}
                                      </a>
                                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <MapPin className="h-3 w-3 mr-1" />{" "}
                                        {professor.state},{" "}
                                        {professor.country_name}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* contact icons */}
                              <div className="flex items-center gap-6 mt-2 justify-center w-full">
                                {professor.email && (
                                  <a
                                    href={`mailto:${professor.email}`}
                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                  >
                                    <Mail className="w-6 h-6" />
                                  </a>
                                )}
                                {professor.google_scholar && (
                                  <a
                                    href={professor.google_scholar}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 0 0 0-14z" />
                                      <path d="M10 15h4v1h-4z" />
                                      <path d="M10 18h4v1h-4z" />
                                      <path d="M10 12h4v1h-4z" />
                                    </svg>
                                  </a>
                                )}
                                {professor.website && (
                                  <a
                                    href={professor.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                  >
                                    <Globe className="w-6 h-6" />
                                  </a>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 w-full mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleEmailClick(professor)}
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Send Email
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                                  onClick={() => handleReminderClick(professor)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Remind
                                </Button>
                              </div>
                            </motion.div>

                            {/* Research + Programs */}
                            <motion.div
                              className="md:col-span-2"
                              variants={itemVariants}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full ">
                                {/* Research Interests */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      Research Interest
                                    </h4>
                                  </div>

                                  {(() => {
                                    const all = processResearchAreas(
                                      professor.research_area
                                    );
                                    const expanded =
                                      !!expandedResearch[professor.ID];
                                    const toShow = expanded
                                      ? all
                                      : all.slice(0, 3);
                                    return (
                                      <>
                                        <ul className="space-y-3">
                                          {toShow.map((interest, i) => (
                                            <motion.li
                                              key={i}
                                              className="flex items-start gap-2 transition-all duration-300 hover:translate-x-1"
                                              initial={{ x: -10, opacity: 0 }}
                                              animate={{ x: 0, opacity: 1 }}
                                              transition={{
                                                delay: 0.3 + i * 0.05,
                                              }}
                                            >
                                              <span className="text-purple-500 dark:text-purple-400 mt-1">
                                                •
                                              </span>
                                              <span className="text-gray-700  dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                                {interest}
                                              </span>
                                            </motion.li>
                                          ))}
                                        </ul>

                                        {all.length > 3 && (
                                          <div className="mt-4 flex justify-end">
                                            <motion.button
                                              whileHover={{ scale: 1.03 }}
                                              className="text-purple-600 dark:text-purple-400 text-sm hover:underline flex items-center gap-1"
                                              onClick={() =>
                                                setExpandedResearch((prev) => ({
                                                  ...prev,
                                                  [professor.ID]:
                                                    !prev[professor.ID],
                                                }))
                                              }
                                            >
                                              <span>
                                                {expanded
                                                  ? "Show Less"
                                                  : "Show More"}
                                              </span>
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d={
                                                    expanded
                                                      ? "M5 15l7-7 7 7"
                                                      : "M19 9l-7 7-7-7"
                                                  }
                                                />
                                              </svg>
                                            </motion.button>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* Programs */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Programs
                                  </h4>

                                  <div
                                    className="relative"
                                    ref={(el) =>
                                      (modalContainerRefs.current[
                                        professor.ID
                                      ] = el)
                                    }
                                  >
                                    {(() => {
                                      const relPrograms: ProgramItem[] =
                                        Array.isArray(professor.programs)
                                          ? professor.programs
                                          : [];
                                      const initialPrograms = relPrograms.slice(
                                        0,
                                        3
                                      );
                                      const fullList = relPrograms;
                                      const canShowMore =
                                        fullList.length >
                                        initialPrograms.length;

                                      return (
                                        <>
                                          <div className="space-y-3">
                                            {initialPrograms.map((prog, i) => {
                                              const pid = prog?.id
                                                ? String(prog.id)
                                                : "";
                                              const hasId = pid !== "";
                                              const selected =
                                                hasId &&
                                                programList.includes(pid);
                                              const isBusy =
                                                hasId && updatingIds.has(pid);

                                              return (
                                                <motion.button
                                                  key={`${pid || "noid"}-${
                                                    prog.level ?? "NA"
                                                  }-${i}`}
                                                  type="button"
                                                  onClick={() =>
                                                    hasId &&
                                                    toggleProgramInList(prog)
                                                  }
                                                  disabled={!hasId || isBusy}
                                                  className={cn(
                                                    "w-full text-left flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 disabled:opacity-60",
                                                    selected
                                                      ? "border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-900/10"
                                                      : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10",
                                                    "hover:brightness-105"
                                                  )}
                                                  initial={{ opacity: 0, y: 8 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  transition={{
                                                    delay: 0.2 + i * 0.04,
                                                  }}
                                                  title={
                                                    hasId
                                                      ? selected
                                                        ? "Remove from My Programs"
                                                        : "Add to My Programs"
                                                      : "No program id"
                                                  }
                                                >
                                                  {selected ? (
                                                    <XCircle className="w-5 h-5 text-red-500" />
                                                  ) : (
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                  )}
                                                  <span
                                                    className={cn(
                                                      "text-sm font-medium",
                                                      selected
                                                        ? "text-red-800 dark:text-red-300"
                                                        : "text-green-800 dark:text-green-300"
                                                    )}
                                                  >
                                                    {prog.name}
                                                    {prog.level && (
                                                      <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                                                        {prog.level ===
                                                        "Bachelor"
                                                          ? "— Bachelor (BSc)"
                                                          : prog.level ===
                                                            "Master"
                                                          ? "— Master (M.S.)"
                                                          : prog.level === "PhD"
                                                          ? "— Ph.D. (Doctor of Philosophy)"
                                                          : ""}
                                                      </span>
                                                    )}
                                                  </span>
                                                </motion.button>
                                              );
                                            })}

                                            {canShowMore && (
                                              <motion.button
                                                className="text-purple-600 dark:text-purple-400 text-sm hover:underline flex items-center gap-1 mt-1"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                whileHover={{ x: 2 }}
                                                onClick={() =>
                                                  setProgramsModalFor(
                                                    professor.ID
                                                  )
                                                }
                                              >
                                                <span>Show More</span>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-4 w-4"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={"M19 9l-7 7-7-7"}
                                                  />
                                                </svg>
                                              </motion.button>
                                            )}
                                          </div>

                                          <ProgramsModal
                                            open={
                                              programsModalFor === professor.ID
                                            }
                                            onClose={() =>
                                              setProgramsModalFor(null)
                                            }
                                            programs={fullList}
                                            programList={programList}
                                            updatingIds={updatingIds}
                                            toggleProgramInList={
                                              toggleProgramInList
                                            }
                                            normalizeLevel={normalizeLevel}
                                            levelLabel={levelLabel}
                                          />
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </CardContent>
                      </AnimatedCard>
                    );
                  })}
              </motion.div>
            )}

            {/* No results */}
            {!loading && professors.length === 0 && (
              <motion.div
                className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  No professors found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters to find more professors.
                </p>
              </motion.div>
            )}

            {/* Load More */}
            {!loading && totalPages > 1 && currentPage < totalPages && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    fetchProfessors(newPage, selectedFilters, { append: true });
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
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
      />

      {/* Email Composition Dialog */}
      {selectedProfessor && (
        <ProfessorContactDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          professor={selectedProfessor}
          directEmailMode={true}
        />
      )}

      {/* Reminder Dialog */}
      {selectedProfessor && (
        <ProfessorContactDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          professor={selectedProfessor}
          isReminder={true}
        />
      )}
    </div>
  );
};

function ProgramsModal({
  open,
  onClose,
  programs,
  programList,
  updatingIds,
  toggleProgramInList,
  normalizeLevel,
  levelLabel,
}: {
  open: boolean;
  onClose: () => void;
  programs: ProgramItem[];
  programList: string[];
  updatingIds: Set<string>;
  toggleProgramInList: (p: ProgramItem) => void;
  normalizeLevel: (lv: any) => "Bachelor" | "Master" | "PhD" | null;
  levelLabel: (c: "Bachelor" | "Master" | "PhD") => string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className="fixed inset-0 z-[1000] qa-programs-modal"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
      <div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                   w-auto max-w-2xl max-h-[80vh] rounded-xl bg-white dark:bg-gray-900
                   shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-semibold">All Programs</h5>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="p-3 overflow-y-auto">
          <div className="space-y-2">
            {programs.map((prog, i) => {
              const pid = String(prog?.id ?? "");
              const selected = pid && programList.includes(pid);
              const isBusy = pid && updatingIds.has(pid);
              const canon = normalizeLevel(prog?.level);

              return (
                <motion.button
                  key={`${pid || "noid"}-${canon ?? "NA"}-${i}`}
                  type="button"
                  onClick={() => pid && toggleProgramInList(prog)}
                  disabled={!pid || !!isBusy}
                  className={cn(
                    "w-full text-left flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 disabled:opacity-60",
                    selected
                      ? "border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-900/10"
                      : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10",
                    "hover:brightness-105"
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {selected ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      selected
                        ? "text-red-800 dark:text-red-300"
                        : "text-green-800 dark:text-green-300"
                    )}
                  >
                    {prog.name}
                    {canon && (
                      <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                        {levelLabel(canon)}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default FindProfessors;
