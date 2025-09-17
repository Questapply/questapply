import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Filter } from "lucide-react";
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

type Season = "fall" | "spring" | "winter" | "summer";
type UserMetaKV = { meta_key: string; meta_value: string };
//uset meta type
export interface UserMetas {
  countryCode: number; // 24=US, 25=CA, ...
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

// Define the type for the application data based on backend response and frontend needs
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
  fit: string; // Based on backend calculation output
  ranking: number;
  qsRanking: string;
  deadline: string; // Backend formats deadline as a string
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
  favorite: boolean; // Added in frontend logic
  country: string;
  state: string;
  // Add frontend-specific fields not directly from backend details API
  status: "not_started" | "in_progress" | "completed" | "applied"; // Example statuses
  actions: string[]; // Example actions
  documents: {
    name: string;
    status: "not_started" | "in_progress" | "completed" | "applied" | "pending";
  }[]; // Added for frontend-specific documents

  programUrl?: string;
  schoolUrl?: string;
  schoolCountryCode?: number; // 24 US, 25 CA, etc.

  deadlines?: {
    intl?: Partial<Record<Season, string>>; // 'YYYY-MM-DD' or undefined
    domestic?: Partial<Record<Season, string>>;
  };
  eligibility?: EligibilityResult;

  admissionChance?: number; // 0..100
  alreadyApplied?: boolean; // for "Apply Yourself" button state
  submitted?: boolean; // for "Submit with Us" vs "View Application"
}

// Fix for CreateLOR.tsx error by introducing missing variant type export
export type ToastVariant = "default" | "destructive";

// === Eligibility types & helpers (paste after imports/other types) ===
type EligibilityStatus = "pass" | "fail" | "unknown";

export interface EligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
  usedTest?: string;
  user?: { gpa?: number; gre?: number; english?: number };
  mins?: { gpa?: number; gre?: number; english?: number };
}

// Normalization of the user language test name
const normalizeTest = (t?: string) => (t || "").trim().toUpperCase();

// Getting the user's language score based on the selected test.
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

// Minimum program language based on the selected test
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

// Eligibility calculation
const computeEligibility = (
  detail: ProgramDetail,
  userMetas: any
): EligibilityResult => {
  const reasons: string[] = [];

  const greReq =
    (detail?.requirements?.gre?.status || "").toLowerCase() === "required";
  const greMin = Number(detail?.requirements?.gre?.min ?? NaN);
  const userGRE = Number(userMetas?.application_gre_total ?? NaN);

  //GRE
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

  // GPA + English
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

// نزدیک‌ترین تاریخ ددلاین را به timestamp برمی‌گرداند
function parseEarliestDeadline(deadline: unknown): number {
  if (!deadline) return Number.POSITIVE_INFINITY;

  // اگر آرایه [{season,date}] باشد
  if (Array.isArray(deadline)) {
    const times = (deadline as any[])
      .map((d) => Date.parse(d?.date || ""))
      .filter((n) => Number.isFinite(n));
    return times.length ? Math.min(...times) : Number.POSITIVE_INFINITY;
  }

  // اگر رشته مثل "Fall: 2025-11-01, Spring: 2026-02-01" باشد
  if (typeof deadline === "string") {
    const matches = deadline.match(/\d{4}-\d{2}-\d{2}/g);
    if (matches?.length) {
      const times = matches
        .map((s) => Date.parse(s))
        .filter((n) => Number.isFinite(n));
      return times.length ? Math.min(...times) : Number.POSITIVE_INFINITY;
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
  // Use the defined ProgramDetail type for the state
  const [userApplications, setUserApplications] = useState<ProgramDetail[]>([]);
  const [userMetas, setUserMetas] = useState<UserMetas | null>(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // ---- Core data shape ----
  const [programIds, setProgramIds] = useState<number[]>([]);
  const [programsById, setProgramsById] = useState<
    Record<number, ProgramDetail>
  >({});

  // ====== Sorting & Filtering state ======
  const [sortKey, setSortKey] = useState<SortKey>("qs_rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // ---- Fine-grained loading/error states ----
  const [loadingMetas, setLoadingMetas] = useState(false);
  const [errorMetas, setErrorMetas] = useState<string | null>(null);

  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorsById, setErrorsById] = useState<Record<number, string>>({});

  // ---- App-specific user logic (plan/limits & per-program status) ----
  const [applyLimit, setApplyLimit] = useState<number>(0); // computed from userMetas
  const [alreadyAppliedIds, setAlreadyAppliedIds] = useState<Set<number>>(
    new Set()
  );
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());

  const [applicationStatusMap, setApplicationStatusMap] = useState<
    Record<number, StatusValue>
  >({});

  const { toast } = useToast();

  // for <ApplicationRow />
  const userMetaPacked: RowUserMeta | null = useMemo(() => {
    return userMetas ? { meta_key: "all_meta", meta_value: userMetas } : null;
  }, [userMetas]);

  // new
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const run = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      // شروع لودینگ‌ها
      setLoading(true);
      setError(null);

      setLoadingMetas(true);
      setErrorMetas(null);

      setLoadingList(true);
      setErrorList(null);

      setLoadingDetails(true);
      setErrorsById({});

      try {
        // 1) User Metas
        const metasRes = await fetch(
          "http://localhost:5000/api/user/all-meta",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!metasRes.ok) {
          throw new Error(
            `all-meta: ${metasRes.status} ${metasRes.statusText}`
          );
        }
        const metas = await metasRes.json();
        if (signal.aborted) return;

        setUserMetas(metas ?? null);

        //Apply Yourself
        const aytType = (metas?.ayt_type as string) ?? "free";
        const userPoint = Number(metas?.user_point ?? 0);
        const limit = aytType === "free" && userPoint < 200 ? 4 : 100000;
        setApplyLimit(limit);

        setAlreadyAppliedIds(new Set<number>(metas?.already_applied_ids ?? []));
        setSubmittedIds(new Set<number>(metas?.submitted_ids ?? []));

        // اگر از سرور status map داری، ست کن (فعلاً به صورت رشته تایپ می‌کنیم تا تداخلی پیش نیاد)
        // if (metas?.application_status_map) {
        //   setApplicationStatusMap(
        //     metas.application_status_map as Record<number, string>
        //   );
        // }

        setLoadingMetas(false);

        // 2) Program ID list
        const listRes = await fetch(
          "http://localhost:5000/api/program-data/program-list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!listRes.ok) {
          throw new Error(
            `program-list: ${listRes.status} ${listRes.statusText}`
          );
        }
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

        // 3) Details for each id (concurrent)
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const r = await fetch(
                `http://localhost:5000/api/program-data/details/${id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
              const detail = (await r.json()) as ProgramDetail;
              console.log("program Detail:", detail);
              return { id, detail };
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setErrorsById((prev) => ({ ...prev, [id]: msg }));
              return { id, detail: null as ProgramDetail | null };
            }
          })
        );
        if (signal.aborted) return;

        // byId enrich UI
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

  // آرایه نهایی که فیلتر و سورت شده
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
      // deadline
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

  const handleSubmitWithUs = (applicationId: number) => {
    setActiveApplication(applicationId);
    navigate(`/psu/${applicationId} `);
  };

  const handleStatusChange = (
    applicationId: number,
    newStatus: StatusValue
  ) => {
    // In a real app, you would update the status in your data store
    // For now, just update the local state for demonstration
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
    <div className="p-6 animate-fade-in">
      <motion.h1
        className="text-2xl font-bold text-gray-900 dark:text-white mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Applications
      </motion.h1>

      {/* Filters */}
      <ApplicationFilters
        sortKey={sortKey}
        sortOrder={sortOrder}
        onApply={handleApplyFilters}
      />

      {/* Loading, Error, or Table */}
      {loading && <LoadingSkeleton type="skeleton" count={5} />}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full"
        >
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead className="font-medium w-1/3">Program</TableHead>
                <TableHead className="font-medium w-[100px] text-center">
                  Deadline
                </TableHead>
                <TableHead className="font-medium text-center w-[70px]">
                  Fees
                </TableHead>
                <TableHead className="font-medium w-[80px] text-center">
                  Eligibility
                </TableHead>
                <TableHead className="font-medium w-[120px] text-center">
                  Admission Fit
                </TableHead>
                <TableHead className="font-medium text-center w-[120px]">
                  Status
                </TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleApplications.length === 0 ? (
                <TableRow>
                  <td colSpan={7} className="text-center py-8">
                    No programs match your filters.
                  </td>
                </TableRow>
              ) : (
                visibleApplications.map(
                  (application: ProgramDetail, index: number) => (
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
                    />
                  )
                )
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Apply Yourself Dialog */}
      <ApplyYourselfDialog
        open={applyYourselfOpen}
        onOpenChange={setApplyYourselfOpen}
        activeApplication={activeApplication}
        applications={userApplications}
      />

      {/* Submit With Us Dialog */}
      <SubmitWithUsDialog
        open={submitWithUsOpen}
        onOpenChange={setSubmitWithUsOpen}
        activeApplication={activeApplication}
        applications={userApplications} // Pass fetched applications here
      />
    </div>
  );
};

export default ApplyNow;
