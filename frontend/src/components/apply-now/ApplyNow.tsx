import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Filter, Send } from "lucide-react";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton";
import { statuses } from "./statuses";
type StatusValue = (typeof statuses)[number]["value"];
import type { UserMeta as RowUserMeta } from "./ApplicationRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useToast } from "../../hooks/use-toast";
import ApplicationFilters from "./ApplicationFilters";
import ApplicationRow from "./ApplicationRow";
import ApplyYourselfDialog from "./ApplyYourselfDialog";
import SubmitWithUsDialog from "./SubmitWithUsDialog";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ✅ اضافه‌شده فقط برای پنل چت (منطق اصلی دست نخورده) */
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import ConfirmRemoveDialog from "./ConfirmRemoveDialog";
import ChatPanel from "./ChatPanel";

/* --- انواع و توابع اصلیِ خودت بدون تغییر --- */
type Season = "fall" | "spring" | "winter" | "summer";
type UserMetaKV = { meta_key: string; meta_value: string };

export interface UserMetas {
  countryCode: number;
  application_gpa?: number;
  application_gre_total?: number;
  application_english_test?:
    | "TOEFL"
    | "IELTS"
    | "Duolingo"
    | "MELAB"
    | "PTE"
    | "Cael";
  english_scores?: {
    toefl?: number;
    ielts?: number;
    duolingo?: number;
    melab?: number;
    pte?: number;
    cael?: number;
  };

  ayt_type: "free" | "pro";
  user_point: number;
  application_status_map?: Record<number, StatusValue>;
  already_applied_ids?: number[];
  submitted_ids?: number[];
}

export interface ProgramDetail {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  duration: string;
  format: string | null;
  language: string;
  campus: string;
  fit: string;
  ranking: number;
  qsRanking: string;
  deadline: string;
  requirements: {
    toefl: { min: number; avg: number };
    ielts: { min: number; avg: number };
    duolingo: { min: number; avg: number };
    pte: { min: number; avg: number };
    gre: {
      status: string;
      total: { avg: number };
      verbal: { avg: number };
      quantitative: { avg: number };
      writing: { avg: number };
      min?: number;
      avg?: number;
    };
    gpa: { min: number; avg: number };
  };
  costs: {
    residents: {
      tuition: number;
      fees: number;
      healthInsurance: number;
      livingCost: number;
    };
    international: {
      tuition: number;
      fees: number;
      healthInsurance: number;
      livingCost: number;
    };
  };
  applicationFees: { international: number; us: number };
  otherRequirements: {
    transcript: boolean;
    resumeCV: boolean;
    applicationForm: boolean;
    statementOfPurpose: boolean;
    recommendationLetters: number;
  };
  admissionRate: number;
  contact: {
    tel: string;
    email: string;
    website: string;
    address: string;
  };
  similarPrograms: { id: number; name: string; school: string }[];
  description: string;
  courseStructure: string;
  facultyHighlights: {
    name: string;
    title: string;
    photoUrl: string;
    research: string;
  }[];
  careerOutcomes: { title: string; percentage: number }[];
  overview: string;
  favorite: boolean;
  country: string;
  state: string;
  status: "not_started" | "in_progress" | "completed" | "applied";
  actions: string[];
  documents: {
    name: string;
    status: "not_started" | "in_progress" | "completed" | "applied" | "pending";
  }[];
  programUrl?: string;
  schoolUrl?: string;
  schoolCountryCode?: number;
  deadlines?: {
    intl?: Partial<Record<Season, string>>;
    domestic?: Partial<Record<Season, string>>;
  };
  eligibility?: EligibilityResult;
  admissionChance?: number;
  alreadyApplied?: boolean;
  submitted?: boolean;
}

export type ToastVariant = "default" | "destructive";

type EligibilityStatus = "pass" | "fail" | "unknown";

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
  usedTest?: string;
  user?: { gpa?: number; gre?: number; english?: number };
  mins?: { gpa?: number; gre?: number; english?: number };
}

const normalizeTest = (t?: string) => (t || "").trim().toUpperCase();

const getUserEnglishScore = (
  userMetas: any,
  normTest: string
): number | undefined => {
  const scores = userMetas?.english_scores || {};
  switch (normTest) {
    case "TOEFL":
      return scores.toefl ?? scores.TOEFL;
    case "IELTS":
      return scores.ielts ?? scores.IELTS;
    case "DUOLINGO":
      return scores.duolingo ?? scores.Duolingo ?? scores.DUOLINGO;
    case "MELAB":
      return scores.melab ?? scores.MELAB;
    case "PTE":
      return scores.pte ?? scores.PTE;
    case "CAEL":
      return scores.cael ?? scores.Cael ?? scores.CAEL;
    default:
      return undefined;
  }
};

const getProgramEnglishMin = (
  req: ProgramDetail["requirements"],
  normTest: string
): number | undefined => {
  switch (normTest) {
    case "TOEFL":
      return req?.toefl?.min;
    case "IELTS":
      return req?.ielts?.min;
    case "DUOLINGO":
      return req?.duolingo?.min;
    case "MELAB":
      return (req as any)?.melab?.min;
    case "PTE":
      return req?.pte?.min;
    case "CAEL":
      return (req as any)?.cael?.min;
    default:
      return undefined;
  }
};

const computeEligibility = (
  detail: ProgramDetail,
  userMetas: any
): EligibilityResult => {
  const reasons: string[] = [];
  const greReq =
    (detail?.requirements?.gre?.status || "").toLowerCase() === "required";
  const greMin = Number(detail?.requirements?.gre?.min ?? NaN);
  const userGRE = Number(userMetas?.application_gre_total ?? NaN);

  if (greReq) {
    if (!Number.isFinite(userGRE)) {
      reasons.push("GRE missing");
      return {
        status: "fail",
        reasons,
        usedTest: undefined,
        user: { gre: undefined },
        mins: { gre: greMin },
      };
    }
    if (Number.isFinite(greMin) && userGRE < greMin) {
      reasons.push(`GRE below minimum (${userGRE} < ${greMin})`);
      return {
        status: "fail",
        reasons,
        usedTest: undefined,
        user: { gre: userGRE },
        mins: { gre: greMin },
      };
    }
  }

  const userGPA = Number(userMetas?.application_gpa ?? NaN);
  if (!Number.isFinite(userGPA)) {
    reasons.push("GPA missing");
    return { status: "unknown", reasons, user: { gpa: undefined } };
  }

  const gpaMin = Number(detail?.requirements?.gpa?.min ?? NaN);
  if (Number.isFinite(gpaMin) && userGPA < gpaMin) {
    reasons.push(`GPA below minimum (${userGPA} < ${gpaMin})`);
    return {
      status: "unknown",
      reasons,
      user: { gpa: userGPA },
      mins: { gpa: gpaMin },
    };
  }

  const normTest = normalizeTest(userMetas?.application_english_test);
  if (!normTest) {
    reasons.push("English test not selected");
    return {
      status: "unknown",
      reasons,
      usedTest: undefined,
      user: { gpa: userGPA },
    };
  }

  const userEnglish = getUserEnglishScore(userMetas, normTest);
  if (userEnglish === undefined) {
    reasons.push("English score missing");
    return {
      status: "unknown",
      reasons,
      usedTest: normTest,
      user: { gpa: userGPA, english: undefined },
    };
  }

  const englishMin = getProgramEnglishMin(detail.requirements, normTest);
  if (englishMin === undefined) {
    reasons.push(`Program minimum for ${normTest} not defined`);
    return {
      status: "unknown",
      reasons,
      usedTest: normTest,
      user: { gpa: userGPA, english: userEnglish },
    };
  }

  if (Number(userEnglish) >= Number(englishMin)) {
    return {
      status: "pass",
      reasons,
      usedTest: normTest,
      user: { gpa: userGPA, english: Number(userEnglish) },
      mins: { gpa: gpaMin, english: Number(englishMin) },
    };
  } else {
    reasons.push(`${normTest} below minimum (${userEnglish} < ${englishMin})`);
    return {
      status: "fail",
      reasons,
      usedTest: normTest,
      user: { gpa: userGPA, english: Number(userEnglish) },
      mins: { gpa: gpaMin, english: Number(englishMin) },
    };
  }
};

type SortKey = "deadline" | "qs_rank" | "MIN_GPA" | "extra_appication_fee";
type SortOrder = "asc" | "desc";

function parseEarliestDeadline(deadline: unknown): number {
  if (!deadline) return Number.POSITIVE_INFINITY;
  if (Array.isArray(deadline)) {
    const times = (deadline as any[])
      .map((d) => Date.parse(d?.date || ""))
      .filter(Number.isFinite);
    return times.length
      ? Math.min(...(times as number[]))
      : Number.POSITIVE_INFINITY;
  }
  if (typeof deadline === "string") {
    const matches = deadline.match(/\d{4}-\d{2}-\d{2}/g);
    if (matches?.length) {
      const times = matches.map((s) => Date.parse(s)).filter(Number.isFinite);
      return times.length
        ? Math.min(...(times as number[]))
        : Number.POSITIVE_INFINITY;
    }
  }
  return Number.POSITIVE_INFINITY;
}

const ApplyNow = () => {
  const navigate = useNavigate();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [expandedDetails, setExpandedDetails] = useState<number[]>([]);
  const [applyYourselfOpen, setApplyYourselfOpen] = useState(false);
  const [submitWithUsOpen, setSubmitWithUsOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState<number | null>(
    null
  );

  const [userApplications, setUserApplications] = useState<ProgramDetail[]>([]);
  const [userMetas, setUserMetas] = useState<UserMetas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [programIds, setProgramIds] = useState<number[]>([]);
  const [programsById, setProgramsById] = useState<
    Record<number, ProgramDetail>
  >({});

  const [sortKey, setSortKey] = useState<SortKey>("qs_rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [loadingMetas, setLoadingMetas] = useState(false);
  const [errorMetas, setErrorMetas] = useState<string | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorsById, setErrorsById] = useState<Record<number, string>>({});

  const [applyLimit, setApplyLimit] = useState<number>(0);
  const [alreadyAppliedIds, setAlreadyAppliedIds] = useState<Set<number>>(
    new Set()
  );
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());

  const [applicationStatusMap, setApplicationStatusMap] = useState<
    Record<number, StatusValue>
  >({});
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  const { toast } = useToast();

  const userMetaPacked: RowUserMeta | null = useMemo(() => {
    return userMetas ? { meta_key: "all_meta", meta_value: userMetas } : null;
  }, [userMetas]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      setLoading(true);
      setError(null);
      setLoadingMetas(true);
      setErrorMetas(null);
      setLoadingList(true);
      setErrorList(null);
      setLoadingDetails(true);
      setErrorsById({});

      try {
        const metasRes = await fetch(`${API_URL}/user/all-meta`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!metasRes.ok)
          throw new Error(
            `all-meta: ${metasRes.status} ${metasRes.statusText}`
          );
        const metas = await metasRes.json();
        if (signal.aborted) return;

        setUserMetas(metas ?? null);

        const aytType = (metas?.ayt_type as string) ?? "free";
        const userPoint = Number(metas?.user_point ?? 0);
        const limit = aytType === "free" && userPoint < 200 ? 4 : 100000;
        setApplyLimit(limit);

        setAlreadyAppliedIds(new Set<number>(metas?.already_applied_ids ?? []));
        setSubmittedIds(new Set<number>(metas?.submitted_ids ?? []));
        setLoadingMetas(false);

        const listRes = await fetch(`${API_URL}/program-data/program-list`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!listRes.ok)
          throw new Error(
            `program-list: ${listRes.status} ${listRes.statusText}`
          );
        const listJson = await listRes.json();
        const ids: number[] = listJson?.programList ?? [];
        if (signal.aborted) return;

        setProgramIds(ids);
        setLoadingList(false);

        if (!ids.length) {
          setProgramsById({});
          setUserApplications([]);
          setLoadingDetails(false);
          setLoading(false);
          return;
        }

        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(`${API_URL}/program-data/details/${id}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
              if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
              const detail = (await r.json()) as ProgramDetail;
              return { id, detail };
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setErrorsById((prev) => ({ ...prev, [id]: msg }));
              return { id, detail: null as ProgramDetail | null };
            }
          })
        );
        if (signal.aborted) return;

        const byId: Record<number, ProgramDetail> = {};
        for (const { id, detail } of results) {
          if (detail) {
            const eligibility = computeEligibility(detail, metas);
            byId[id] = {
              ...detail,
              favorite: true,
              status: "not_started",
              actions: ["Submit with Us", "Remove"],
              documents: [
                { name: "Resume/CV", status: "not_started" },
                { name: "Statement of Purpose", status: "not_started" },
                { name: "Transcripts", status: "not_started" },
                { name: "Letters of Recommendation", status: "not_started" },
                { name: "English Proficiency", status: "not_started" },
              ],
              eligibility,
            };
          }
        }

        setProgramsById(byId);
        setUserApplications(
          ids.map((id) => byId[id]).filter(Boolean) as ProgramDetail[]
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        if (!signal.aborted) {
          setLoadingDetails(false);
          setLoading(false);
        }
      }
    };

    run();
    return () => controller.abort();
  }, [navigate]);

  const visibleApplications = useMemo(() => {
    const arr = [...userApplications];
    const o = sortOrder === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "qs_rank") {
        const av = Number(a.qsRanking ?? Number.POSITIVE_INFINITY);
        const bv = Number(b.qsRanking ?? Number.POSITIVE_INFINITY);
        if (av === bv) return 0;
        return av > bv ? o : -o;
      }
      if (sortKey === "MIN_GPA") {
        const av = a.requirements?.gpa?.min ?? Number.POSITIVE_INFINITY;
        const bv = b.requirements?.gpa?.min ?? Number.POSITIVE_INFINITY;
        if (av === bv) return 0;
        return av > bv ? o : -o;
      }
      if (sortKey === "extra_appication_fee") {
        const av = a.applicationFees?.international ?? Number.POSITIVE_INFINITY;
        const bv = b.applicationFees?.international ?? Number.POSITIVE_INFINITY;
        if (av === bv) return 0;
        return av > bv ? o : -o;
      }
      const av = parseEarliestDeadline(a.deadline);
      const bv = parseEarliestDeadline(b.deadline);
      if (av === bv) return 0;
      return av > bv ? o : -o;
    });

    return arr;
  }, [userApplications, sortKey, sortOrder]);

  const handleApplyFilters = (payload: {
    sortKey: SortKey;
    sortOrder: SortOrder;
  }) => {
    setSortKey(payload.sortKey);
    setSortOrder(payload.sortOrder);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const [applyYourselfOpenState] = useState(false); // untouched API placeholders
  const toggleDetails = (applicationId: number) => {
    setExpandedDetails((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleApplyYourself = (applicationId: number) => {
    setActiveApplication(applicationId);
    setApplyYourselfOpen(true);
  };
  const askRemoveProgram = (applicationId: number) => {
    setRemoveTargetId(applicationId);
    setRemoveOpen(true);
  };
  const removeProgram = async () => {
    if (!removeTargetId) return;
    const id = removeTargetId;

    // برای رول‌بک در صورت خطا
    const prevProgramIds = [...programIds];
    const prevProgramsById = { ...programsById };
    const prevUserApps = [...userApplications];
    const prevExpanded = [...expandedDetails];

    try {
      setRemoving(true);

      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // ✅ همون endpoint رسمی شما
      const res = await fetch(`${API_URL}/program-data/program-list`, {
        method: "POST",
        headers,
        body: JSON.stringify({ programId: id, action: "remove" }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data?.programList)) {
        throw new Error(
          data?.message || `Remove failed: ${res.status} ${res.statusText}`
        );
      }

      // ✅ UI به‌روز (براساس پاسخ سرور)
      const newList = data.programList.map(String);
      setProgramIds((prev) => prev.filter((x) => x !== id));
      setProgramsById((prev) => {
        const { [id]: _omit, ...rest } = prev;
        return rest;
      });
      setUserApplications((prev) => prev.filter((p) => p.id !== id));
      setExpandedDetails((prev) => prev.filter((x) => x !== id));
      if (activeApplication === id) setActiveApplication(null);

      // 🔔 Broadcast برای همگام‌سازی دکمه‌های بیرون (ProgramResultCard و …)
      window.dispatchEvent(
        new CustomEvent("program-list:update", {
          detail: { programId: id, action: "remove", programList: newList },
        })
      );
      // ذخیره در localStorage هم کمک می‌کند اگر جایی گوش نمی‌دهد:
      localStorage.setItem("programList", JSON.stringify(newList));

      toast({
        title: "Program removed",
        description: programsById[id]?.name || "Removed from your list.",
      });
    } catch (e) {
      // رول‌بک
      setProgramIds(prevProgramIds);
      setProgramsById(prevProgramsById);
      setUserApplications(prevUserApps);
      setExpandedDetails(prevExpanded);

      toast({
        title: "Failed to remove",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
      setRemoveOpen(false);
      setRemoveTargetId(null);
    }
  };

  const handleSubmitWithUs = (applicationId: number) => {
    setActiveApplication(applicationId);
    navigate(`/dashboard/psu/${applicationId}`);
  };

  const handleStatusChange = (
    applicationId: number,
    newStatus: StatusValue
  ) => {
    setUserApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, status: newStatus as ProgramDetail["status"] }
          : app
      )
    );
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}`,
      variant: "default",
    });
  };

  return (
    <div
      className="p-3 animate-fade-in min-h-screen
                  bg-slate-50 dark:bg-slate-900"
    >
      <motion.h1
        className="text-2xl font-bold mb-6
                 text-slate-900 dark:text-slate-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Applications
      </motion.h1>

      {/* Filters — سراسری و تمام‌عرض (بدون تغییر منطق) */}
      <ApplicationFilters
        sortKey={sortKey}
        sortOrder={sortOrder}
        onApply={handleApplyFilters}
      />

      {/* گرید: ۱/۳ چت + ۲/۳ محتوای فعلی */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-3 lg:gap-4">
        {/* 1/3 — Chat (کاملاً مستقل) */}
        <aside className="lg:col-span-1 min-w-0">
          <ChatPanel />
        </aside>

        {/* 2/3 — محتوای فعلی */}
        <section className="lg:col-span-2 min-w-0">
          {loading && <LoadingSkeleton type="skeleton" count={5} />}
          {error && (
            <p className="text-red-500 dark:text-red-400">Error: {error}</p>
          )}

          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full rounded-xl border overflow-hidden
                       bg-white border-slate-200
                       dark:bg-slate-900 dark:border-slate-700"
            >
              <Table className="table-fixed md:w-full">
                <TableHeader>
                  <TableRow
                    className="hidden md:table-row
                                     bg-slate-100 dark:bg-slate-800/60"
                  >
                    <TableHead className="font-medium md:w-1/3">
                      Program
                    </TableHead>
                    <TableHead className="font-medium md:w-[100px] text-center">
                      Deadline
                    </TableHead>
                    <TableHead className="font-medium md:w-[70px] text-center">
                      Fees
                    </TableHead>
                    <TableHead className="font-medium md:w-[80px] text-center">
                      Eligibility
                    </TableHead>
                    <TableHead className="font-medium md:w-[120px] text-center">
                      Admission Fit
                    </TableHead>
                    <TableHead className="font-medium md:w-[120px] text-center">
                      Status
                    </TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleApplications.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={7}
                        className="text-center py-8
                                              text-slate-600 dark:text-slate-300"
                      >
                        No programs match your filters.
                      </td>
                    </TableRow>
                  ) : (
                    visibleApplications.map((application: ProgramDetail) => (
                      <ApplicationRow
                        key={application.id}
                        application={application}
                        userMeta={userMetaPacked}
                        documents={application.documents}
                        expandedDetails={expandedDetails}
                        toggleDetails={toggleDetails}
                        handleApplyYourself={() =>
                          handleApplyYourself(application.id)
                        }
                        handleSubmitWithUs={handleSubmitWithUs}
                        handleStatusChange={handleStatusChange}
                        onRemove={() => askRemoveProgram(application.id)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </section>
      </div>

      {/* Dialogs — بدون تغییر */}
      <ApplyYourselfDialog
        open={applyYourselfOpen}
        onOpenChange={setApplyYourselfOpen}
        activeApplication={activeApplication}
        applications={userApplications}
      />

      <SubmitWithUsDialog
        open={submitWithUsOpen}
        onOpenChange={setSubmitWithUsOpen}
        activeApplication={activeApplication}
        applications={userApplications}
      />

      <ConfirmRemoveDialog
        open={removeOpen}
        onOpenChange={(v) => {
          if (!v) setRemoveTargetId(null);
          setRemoveOpen(v);
        }}
        programName={
          removeTargetId ? programsById[removeTargetId]?.name : undefined
        }
        onConfirm={removeProgram}
        loading={removing}
      />
    </div>
  );
};

export default ApplyNow;
