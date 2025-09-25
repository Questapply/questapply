///////////////////////////////////////////
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  X,
  Plus,
  ListOrdered,
  School,
  BookOpen,
  DollarSign,
  Users,
  GraduationCap,
  Building,
  Search,
  Settings, // ✅ requested: keep Settings
} from "lucide-react";
import { Button } from "../../ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../ui/table";
import axios from "axios";
import { useToast } from "../../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";

/* ===================== CONFIG ===================== */
// Use relative base in prod; if you prefer, replace with env-based value
const API_URL = (import.meta as any)?.env?.VITE_API_URL?.toString?.() ?? "/api";

/* -------------------- Common Section Wrapper -------------------- */
interface ComparisonSectionProps {
  title: string;
  icon: React.ReactNode;
  schools: any[];
  renderContent: () => React.ReactNode;
  headerRight?: React.ReactNode;
}

const ComparisonSection = ({
  title,
  icon,
  schools,
  renderContent,
  headerRight,
}: ComparisonSectionProps) => {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
        {headerRight ? (
          <div className="ml-4 flex items-center gap-3">
            {headerRight}
            <Settings className="h-4 w-4 text-gray-500" />
          </div>
        ) : (
          <Settings className="h-4 w-4 text-gray-500" />
        )}
      </div>
      <div className="overflow-x-auto">{renderContent()}</div>
    </motion.div>
  );
};

/* -------------------- Legend for Program Chips -------------------- */
const ProgramLegend = () => (
  <div className="flex items-center gap-3">
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
      <span className="inline-block w-4 h-4 rounded bg-amber-300"></span>{" "}
      Bachelor
    </span>
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
      <span className="inline-block w-4 h-4 rounded bg-blue-400"></span> Master
    </span>
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
      <span className="inline-block w-4 h-4 rounded bg-emerald-300"></span>{" "}
      Ph.D.
    </span>
  </div>
);

/* -------------------- Degree Chip (button-style; always clickable if data exists) -------------------- */
const degreeStyles: Record<string, string> = {
  bachelor:
    "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-200/20 dark:text-amber-300 dark:border-amber-400/40",
  master:
    "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-200/20 dark:text-blue-300 dark:border-blue-400/40",
  phd: "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-200/20 dark:text-emerald-300 dark:border-emerald-400/40",
};

const hasProgramParam = (url?: string | null) => {
  const { program } = parseProgramParams(url);
  return !!program;
};

type ProgramClickArgs = {
  explicitRelId?: number | null;
  explicitId?: number | string | null;
  url?: string | null;
  variant: "bachelor" | "master" | "phd";
  schoolId: number;
};

function normLevel(v?: string) {
  const x = String(v || "").toLowerCase();
  if (x.startsWith("ph")) return "Ph.D.";
  if (x.startsWith("mast")) return "Master";
  return "Bachelor";
}

function DegreeButton({
  label,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  variant: "bachelor" | "master" | "phd";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-9 h-7 rounded-md border text-xs font-semibold transition outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
        degreeStyles[variant]
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:brightness-110"
      }`}
      title={label}
      aria-label={label}
    >
      {label}
    </button>
  );
}

/* -------------------- Helpers -------------------- */
// Parse params from old URLs like https://questapply.com/find-program/?level=Ph.D.&program=bioengineering&school=277
const parseProgramParams = (url?: string | null) => {
  if (!url)
    return {
      program: null as string | null,
      school: null as string | null,
      level: null as string | null,
    };
  try {
    const u = new URL(url, window.location.origin);
    const program = u.searchParams.get("program");
    const school = u.searchParams.get("school");
    const level = u.searchParams.get("level");
    return { program, school, level };
  } catch {
    // Fallbacks for relative strings
    const programMatch = url.match(/[?&]program=([^&]+)/i);
    const schoolMatch = url.match(/[?&]school=([^&]+)/i);
    const levelMatch = url.match(/[?&]level=([^&]+)/i);
    return {
      program: programMatch ? decodeURIComponent(programMatch[1]) : null,
      school: schoolMatch ? decodeURIComponent(schoolMatch[1]) : null,
      level: levelMatch ? decodeURIComponent(levelMatch[1]) : null,
    };
  }
};

// Resolve program id from slug + school + level (backend endpoint needed)
const resolveProgramId = async ({
  program, // slug
  school,
  level,
}: {
  program: string;
  school?: string | number | null;
  level?: string | null;
}): Promise<string | null> => {
  try {
    const res = await axios.get(`${API_URL}/program-data/resolve`, {
      params: { program, school, level: level ?? undefined },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      withCredentials: true,
    });
    const id = res?.data?.id ?? res?.data?.programId ?? null;
    return id ? String(id) : null;
  } catch (e) {
    console.error("resolveProgramId error", e);
    return null;
  }
};

/* ============================ Main Component ============================ */
const CompareSchools = () => {
  const { schoolIds } = useParams<{ schoolIds: string }>();
  const [selectedSchools, setSelectedSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // pagination for programs (10-by-10 per school)
  const [visiblePrograms, setVisiblePrograms] = useState<
    Record<number, number>
  >({});
  const INITIAL_PROGRAMS_LIMIT = 10;

  const getVisibleCount = (schoolId: number, total: number) =>
    visiblePrograms[schoolId] ?? Math.min(INITIAL_PROGRAMS_LIMIT, total);

  const showMorePrograms = (schoolId: number, total: number) =>
    setVisiblePrograms((prev) => {
      const next = (prev[schoolId] ?? INITIAL_PROGRAMS_LIMIT) + 10;
      return { ...prev, [schoolId]: Math.min(next, total) };
    });

  useEffect(() => {
    if (schoolIds) {
      const ids = schoolIds.split(",").map((id) => parseInt(id, 10));
      fetchSchoolData(ids);
    }
  }, [schoolIds]);

  const fetchSchoolData = async (ids: number[]) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/compare-schools/${ids.join(",")}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.data && Array.isArray(response.data)) {
        const processedSchools = processSchoolData(response.data);
        console.log("compare-schools :", processedSchools);
        setSelectedSchools(processedSchools);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Error fetching schools data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch school data from API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSchool = (id: number) => {
    const updatedSchools = selectedSchools.filter((school) => school.id !== id);
    if (updatedSchools.length === 0) {
      navigate("/dashboard");
      return;
    }
    const newSchoolIds = updatedSchools.map((school) => school.id).join(",");
    navigate(`/compare-schools/${newSchoolIds}`);
  };

  const addNewSchool = () => setShowAddSchoolModal(true);

  const searchSchools = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/schools/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          withCredentials: true,
        }
      );
      if (Array.isArray(response.data)) {
        setSearchResults(response.data);
      } else if (
        response.data.schools &&
        Array.isArray(response.data.schools)
      ) {
        setSearchResults(response.data.schools);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching schools:", error);
      toast({
        title: "Search Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const renderYesNo = (value: boolean) => {
    return value ? (
      <span className="flex items-center justify-start">
        <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
          ✓
        </span>
      </span>
    ) : (
      <span className="flex items-center justify-start">
        <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
          ✕
        </span>
      </span>
    );
  };

  const processSchoolData = (schools: any[]) => {
    return schools.map((school) => ({
      id: school.id,
      name: school.name,
      logo: school.logo || "",
      type: school.type || "Unknown",
      location: school.location || "Unknown",
      country: school.country || "Unknown",
      description: school.description || "",
      qsRank: school.ranking?.qs ?? "N/A",
      usNewsRank: school.ranking?.usNews ?? "N/A",
      shanghaiRank: school.ranking?.shanghai ?? "N/A",
      theRank: school.ranking?.the ?? "N/A",
      forbesRank: school.ranking?.forbes ?? "N/A",

      testScores: {
        toefl: !!school.testRequirements?.toefl,
        ielts: !!school.testRequirements?.ielts,
        duolingo: !!school.testRequirements?.duolingo,
        melab: !!school.testRequirements?.melab,
        pte: !!school.testRequirements?.pte,
        sop: !!school.testRequirements?.sop,
        transcript:
          school.testRequirements?.transcript !== undefined
            ? !!school.testRequirements.transcript
            : true,
        resumeCV: !!school.testRequirements?.resumeCV,
        recommendations: !!school.testRequirements?.recommendations,
        applicationForm:
          school.testRequirements?.applicationForm !== undefined
            ? !!school.testRequirements.applicationForm
            : true,
        applicationFee:
          school.testRequirements?.applicationFee !== undefined
            ? !!school.testRequirements.applicationFee
            : true,
      },

      admissions: {
        men: {
          numberApplied: school.admissions?.men?.numberApplied ?? "N/A",
          numberAdmitted: school.admissions?.men?.numberAdmitted ?? "N/A",
          enrolledFullTime: school.admissions?.men?.enrolledFullTime ?? "N/A",
          enrolledPartTime: school.admissions?.men?.enrolledPartTime ?? "N/A",
        },
        women: {
          numberApplied: school.admissions?.women?.numberApplied ?? "N/A",
          numberAdmitted: school.admissions?.women?.numberAdmitted ?? "N/A",
          enrolledFullTime: school.admissions?.women?.enrolledFullTime ?? "N/A",
          enrolledPartTime: school.admissions?.women?.enrolledPartTime ?? "N/A",
        },
        acceptanceRate:
          school.admissions?.acceptanceRate ?? school.acceptance ?? "N/A",
        graduationRate:
          school.admissions?.graduationRate ?? school.graduation ?? "N/A",
        numberEnrolled: school.admissions?.numberEnrolled,
        enrolledRate: school.admissions?.enrolledRate,
      },

      cost: (() => {
        const c = school.cost || {};
        const num = (v: any) =>
          typeof v === "number" ? `$${v.toLocaleString()}` : "N/A";
        return {
          tuitionInState: c.undergradInState
            ? num(c.undergradInState)
            : num(c.gradInState),
          tuitionOutState: c.undergradOutState
            ? num(c.undergradOutState)
            : num(c.gradOutState),
          roomAndBoard: num(c.roomAndBoard),
          booksAndSupplies: num(c.booksAndSupplies),
          otherExpenses: num(c.otherExpenses),
          inState: num(c.totalInState ?? c.inState),
          outState: num(c.totalOutState ?? c.outState),
          _raw: c,
        };
      })(),

      scene: {
        total: school.students?.total
          ? school.students.total.toLocaleString()
          : "N/A",
        women: school.students?.women
          ? school.students.women.toLocaleString()
          : "N/A",
        menTrans: school.students?.men
          ? school.students.men.toLocaleString()
          : "N/A",
      },

      diversity: {
        asian: school.race_asian_and_pacific_islander ?? "N/A",
        black: school.race_black ?? "N/A",
        hispanic: school.race_hispanic ?? "N/A",
        nativeAmerican: school.race_native_american ?? "N/A",
        white: school.race_white ?? "N/A",
        other: school.race_other ?? "N/A",
      },

      programs: school.programs || [],
      programsMatrix: school.programsMatrix || [],
    }));
  };

  /* ---------- Program click handler: navigates to ProgramDetails with ID ---------- */

  const onProgramClick = async ({
    explicitRelId,
    explicitId,
    url,
    variant,
    schoolId,
  }: ProgramClickArgs) => {
    const level = normLevel(variant);

    if (explicitRelId) {
      navigate(`/program/${encodeURIComponent(String(explicitRelId))}`);
      return;
    }

    if (explicitId) {
      navigate(
        `/program/${encodeURIComponent(
          String(explicitId)
        )}?school=${schoolId}&level=${encodeURIComponent(level)}`
      );
      return;
    }

    if (url) {
      const { program, school, level: lvlFromUrl } = parseProgramParams(url);
      const s = school ?? schoolId;
      const lvl = normLevel(lvlFromUrl || level);

      if (program && /^\d+$/.test(String(program))) {
        navigate(
          `/program/${program}?school=${s}&level=${encodeURIComponent(lvl)}`
        );
        return;
      }

      const { data } = await axios.get(`${API_URL}/program-data/resolve`, {
        params: { program, school: s, level: lvl },
      });

      if (data?.id) {
        navigate(
          `/program/${data.id}?school=${s}&level=${encodeURIComponent(lvl)}`
        );
        return;
      }

      toast({
        title: "Program not found",
        description: "Try another degree or discipline.",
      });
      return;
    }
    toast({
      title: "Missing program info",
      description: "No ID or URL for this program.",
    });
  };

  //help function for read pramter URL
  function parseProgramParams(u?: string) {
    try {
      const url = new URL(String(u), window.location.origin);
      const program = url.searchParams.get("program");
      const school = url.searchParams.get("school");
      const level = url.searchParams.get("level");
      return {
        program,
        school: school ? Number(school) : null,
        level,
      };
    } catch {
      return { program: null, school: null, level: null };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Compare Schools
        </motion.h1>

        {loading ? (
          <div className="flex flex-col items-center justify-start p-12">
            <div className="h-12 w-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-gray-200 animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading school data...
            </p>
          </div>
        ) : (
          <>
            {/* Selected cards + Add */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {selectedSchools.map((school, index) => (
                  <motion.div
                    key={`school-card-${school?.id || index}`}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => removeSchool(school?.id || 0)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <X size={18} />
                    </button>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden mb-3">
                        <img
                          src={school?.logo || ""}
                          alt={`${school?.name || "School"} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-center">
                        {school?.name || "Unknown School"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {school?.location || "Unknown Location"}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {selectedSchools.length < 3 && (
                  <motion.div
                    className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={addNewSchool}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-16 h-16 flex items-center justify-center mb-3">
                      <Plus size={30} className="text-green-500" />
                    </div>
                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-center">
                      Add School
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Click to add another school
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {/* Rankings */}
              <ComparisonSection
                title="Rankings"
                icon={<ListOrdered className="h-5 w-5 text-purple-500 mr-2" />}
                schools={selectedSchools}
                renderContent={() => (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                        <TableHead className="w-[250px]">Ranking</TableHead>
                        {selectedSchools.map((school, idx) => (
                          <TableHead
                            key={`header-rank-${
                              school?.id || "unknown"
                            }-${idx}`}
                          >
                            {school?.name || "Unknown School"}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          QS Ranking
                        </TableCell>
                        {selectedSchools.map((school, idx) => (
                          <TableCell
                            key={`qs-${school?.id || idx}-${idx}`}
                            className="font-medium"
                          >
                            {school?.qsRank ? `#${school.qsRank}` : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableCell className="font-medium">
                          US News Ranking
                        </TableCell>
                        {selectedSchools.map((school, idx) => (
                          <TableCell
                            key={`usNews-${school?.id || idx}-${idx}`}
                            className="font-medium"
                          >
                            {school?.usNewsRank
                              ? `#${school.usNewsRank}`
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Forbes Ranking
                        </TableCell>
                        {selectedSchools.map((school, idx) => (
                          <TableCell
                            key={`forbes-${school?.id || idx}-${idx}`}
                            className="font-medium"
                          >
                            {school?.forbesRank
                              ? `#${school.forbesRank}`
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                        <TableCell className="font-medium">
                          Shanghai Ranking
                        </TableCell>
                        {selectedSchools.map((school, idx) => (
                          <TableCell
                            key={`shanghai-${school?.id || idx}-${idx}`}
                            className="font-medium"
                          >
                            {school?.shanghaiRank
                              ? `#${school.shanghaiRank}`
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          THE Ranking
                        </TableCell>
                        {selectedSchools.map((school, idx) => (
                          <TableCell
                            key={`the-${school?.id || idx}-${idx}`}
                            className="font-medium"
                          >
                            {school?.theRank ? `#${school.theRank}` : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              />

              {/* Test Requirements */}
              <ComparisonSection
                title="Test Requirements"
                icon={<BookOpen className="h-5 w-5 text-green-500 mr-2" />}
                schools={selectedSchools}
                renderContent={() => (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                        <TableHead className="w-[250px]">Test</TableHead>
                        {selectedSchools.map((school, idx) => (
                          <TableHead
                            key={`header-test-${
                              school?.id || "unknown"
                            }-${idx}`}
                          >
                            {school?.name || "Unknown School"}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        "TOEFL",
                        "IELTS",
                        "Duolingo",
                        "MELAB",
                        "PTE",
                        "Statement of Purpose",
                        "Transcript",
                        "Resume/CV",
                        "Recommendations",
                        "Application Form",
                        "Application Fee",
                      ].map((test, index) => {
                        let testKey = test.toLowerCase();
                        if (testKey === "statement of purpose") testKey = "sop";
                        if (testKey === "resume/cv") testKey = "resumeCV";
                        if (testKey === "application form")
                          testKey = "applicationForm";
                        if (testKey === "application fee")
                          testKey = "applicationFee";
                        return (
                          <TableRow
                            key={`test-row-${testKey}-${index}`}
                            className={
                              index % 2 === 1
                                ? "bg-gray-50 dark:bg-gray-800/50"
                                : ""
                            }
                          >
                            <TableCell className="font-medium">
                              {test}
                            </TableCell>
                            {selectedSchools.map((school, schoolIdx) => (
                              <TableCell
                                key={`test-cell-${testKey}-${
                                  school?.id || schoolIdx
                                }-${schoolIdx}`}
                              >
                                {school?.testScores &&
                                testKey in school.testScores
                                  ? renderYesNo(
                                      school.testScores[
                                        testKey as keyof typeof school.testScores
                                      ] as unknown as boolean
                                    )
                                  : "N/A"}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              />

              {/* Admissions */}
              <ComparisonSection
                title="Admissions"
                icon={<GraduationCap className="h-5 w-5 text-blue-500 mr-2" />}
                schools={selectedSchools}
                renderContent={() => (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                        <TableHead className="w-[250px]">Factor</TableHead>
                        {selectedSchools.map((school, idx) => (
                          <TableHead
                            key={`header-adm-${school?.id || "unknown"}-${idx}`}
                          >
                            {school?.name || "Unknown School"}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          className="font-bold"
                          colSpan={selectedSchools.length + 1}
                        >
                          Men
                        </TableCell>
                      </TableRow>
                      {[
                        { label: "Number Applied", key: "numberApplied" },
                        { label: "Number Admitted", key: "numberAdmitted" },
                        {
                          label: "Enrolled Full Time",
                          key: "enrolledFullTime",
                        },
                        {
                          label: "Enrolled Part Time",
                          key: "enrolledPartTime",
                        },
                      ].map((item, index) => (
                        <TableRow
                          key={`adm-men-row-${item.key}-${index}`}
                          className={
                            index % 2 === 1
                              ? "bg-gray-50 dark:bg-gray-800/50"
                              : ""
                          }
                        >
                          <TableCell className="font-medium pl-8">
                            {item.label}
                          </TableCell>
                          {selectedSchools.map((school, schoolIdx) => (
                            <TableCell
                              key={`adm-men-cell-${item.key}-${
                                school?.id || schoolIdx
                              }-${schoolIdx}`}
                              className="font-medium"
                            >
                              {school?.admissions?.men &&
                              school?.admissions?.men[
                                item.key as keyof typeof school.admissions.men
                              ]
                                ? (school.admissions.men[
                                    item.key as keyof typeof school.admissions.men
                                  ] as any)
                                : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          className="font-bold"
                          colSpan={selectedSchools.length + 1}
                        >
                          Women
                        </TableCell>
                      </TableRow>
                      {[
                        { label: "Number Applied", key: "numberApplied" },
                        { label: "Number Admitted", key: "numberAdmitted" },
                        {
                          label: "Enrolled Full Time",
                          key: "enrolledFullTime",
                        },
                        {
                          label: "Enrolled Part Time",
                          key: "enrolledPartTime",
                        },
                      ].map((item, index) => (
                        <TableRow
                          key={`adm-women-row-${item.key}-${index}`}
                          className={
                            index % 2 === 1
                              ? "bg-gray-50 dark:bg-gray-800/50"
                              : ""
                          }
                        >
                          <TableCell className="font-medium pl-8">
                            {item.label}
                          </TableCell>
                          {selectedSchools.map((school, schoolIdx) => (
                            <TableCell
                              key={`adm-women-cell-${item.key}-${
                                school?.id || schoolIdx
                              }-${schoolIdx}`}
                              className="font-medium"
                            >
                              {school?.admissions?.women &&
                              school?.admissions?.women[
                                item.key as keyof typeof school.admissions.women
                              ]
                                ? (school.admissions.women[
                                    item.key as keyof typeof school.admissions.women
                                  ] as any)
                                : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-100 dark:bg-gray-800/80">
                        <TableCell className="font-bold">
                          Acceptance Rate
                        </TableCell>
                        {selectedSchools.map((school, schoolIdx) => (
                          <TableCell
                            key={`adm-acceptanceRate-${
                              school?.id || schoolIdx
                            }-${schoolIdx}`}
                            className="font-medium"
                          >
                            {school?.admissions?.acceptanceRate
                              ? `${school.admissions.acceptanceRate}%`
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="bg-gray-100 dark:bg-gray-800/80">
                        <TableCell className="font-bold">
                          Graduation Rate
                        </TableCell>
                        {selectedSchools.map((school, schoolIdx) => (
                          <TableCell
                            key={`adm-graduationRate-${
                              school?.id || schoolIdx
                            }-${schoolIdx}`}
                            className="font-medium"
                          >
                            {school?.admissions?.graduationRate
                              ? `${school.admissions.graduationRate}%`
                              : "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              />

              {/* Cost */}
              <ComparisonSection
                title="Cost"
                icon={<DollarSign className="h-5 w-5 text-emerald-500 mr-2" />}
                schools={selectedSchools}
                renderContent={() => (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                        <TableHead className="w-[250px]">Expense</TableHead>
                        {selectedSchools.map((school, idx) => (
                          <TableHead
                            key={`header-cost-${
                              school?.id || "unknown"
                            }-${idx}`}
                          >
                            {school?.name || "Unknown School"}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { label: "Tuition (In State)", key: "tuitionInState" },
                        {
                          label: "Tuition (Out of State)",
                          key: "tuitionOutState",
                        },
                        { label: "Room and Board", key: "roomAndBoard" },
                        {
                          label: "Books and Supplies",
                          key: "booksAndSupplies",
                        },
                        { label: "Other Expenses", key: "otherExpenses" },
                        {
                          label: "Total (In State)",
                          key: "inState",
                          highlight: true,
                        },
                        {
                          label: "Total (Out of State)",
                          key: "outState",
                          highlight: true,
                        },
                      ].map((item, index) => (
                        <TableRow
                          key={`cost-row-${item.key}-${index}`}
                          className={`${
                            index % 2 === 1
                              ? "bg-gray-50 dark:bg-gray-800/50"
                              : ""
                          } ${
                            item.highlight
                              ? "border-top-2 border-gray-300 dark:border-gray-600"
                              : ""
                          }`}
                        >
                          <TableCell
                            className={`font-medium ${
                              item.highlight ? "font-semibold" : ""
                            }`}
                          >
                            {item.label}
                          </TableCell>
                          {selectedSchools.map((school, schoolIdx) => (
                            <TableCell
                              key={`cost-cell-${item.key}-${
                                school?.id || schoolIdx
                              }-${schoolIdx}`}
                              className={`font-medium ${
                                item.highlight
                                  ? "font-semibold text-purple-700 dark:text-purple-400"
                                  : ""
                              }`}
                            >
                              {school?.cost && school?.cost[item.key]
                                ? school.cost[item.key]
                                : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              />

              {/* Campus Demographics */}
              <ComparisonSection
                title="Campus Demographics"
                icon={<Users className="h-5 w-5 text-orange-500 mr-2" />}
                schools={selectedSchools}
                renderContent={() => (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                        <TableHead className="w-[250px]">Demographic</TableHead>
                        {selectedSchools.map((school, idx) => (
                          <TableHead
                            key={`header-scene-${
                              school?.id || "unknown"
                            }-${idx}`}
                          >
                            {school?.name || "Unknown School"}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { label: "Total Students", key: "total" },
                        { label: "Women", key: "women" },
                        { label: "Men", key: "menTrans" },
                      ].map((item, index) => (
                        <TableRow
                          key={`demo-row-${item.key}-${index}`}
                          className={
                            index % 2 === 1
                              ? "bg-gray-50 dark:bg-gray-800/50"
                              : ""
                          }
                        >
                          <TableCell className="font-medium">
                            {item.label}
                          </TableCell>
                          {selectedSchools.map((school, schoolIdx) => (
                            <TableCell
                              key={`demo-cell-${item.key}-${
                                school?.id || schoolIdx
                              }-${schoolIdx}`}
                              className="font-medium"
                            >
                              {school?.scene && school?.scene[item.key]
                                ? school.scene[item.key]
                                : "N/A"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              />

              {/* Available Programs */}
              <ComparisonSection
                title="Available Programs"
                icon={<School className="h-5 w-5 text-green-500 mr-2" />}
                headerRight={<ProgramLegend />}
                schools={selectedSchools}
                renderContent={() => (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedSchools.map((school, sIdx) => {
                      const total = Array.isArray(school?.programsMatrix)
                        ? school.programsMatrix.length
                        : 0;
                      const visible = getVisibleCount(school.id, total);
                      const hasMore = visible < total;

                      return (
                        <div
                          key={`programs-${school?.id || "unknown"}-${sIdx}`}
                          className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800"
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {school?.name || "Unknown School"}
                          </h3>

                          {total > 0 ? (
                            <>
                              <div className="space-y-2">
                                {school.programsMatrix
                                  .slice(0, visible)
                                  .map((p: any, idx: number) => {
                                    // آیا کلید/شناسه‌ای برای کلیک داریم؟ (ID یا حداقل program= در URL)
                                    const bHasKey =
                                      !!p?.bachelorId ||
                                      hasProgramParam(p?.bachelorUrl);
                                    const mHasKey =
                                      !!p?.masterId ||
                                      hasProgramParam(p?.masterUrl);
                                    const dHasKey =
                                      !!p?.phdId || hasProgramParam(p?.phdUrl);

                                    return (
                                      <div
                                        key={`prog-row-${
                                          school?.id || sIdx
                                        }-${idx}-${(p?.discipline || idx)
                                          .toString()
                                          .replace(/\s+/g, "-")
                                          .toLowerCase()}`}
                                        className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700"
                                      >
                                        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                                          {p.discipline}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <DegreeButton
                                            label="B"
                                            variant="bachelor"
                                            disabled={!p.bachelor || !bHasKey}
                                            onClick={() =>
                                              onProgramClick({
                                                explicitRelId:
                                                  p?.bachelorRelId ?? null,
                                                explicitId:
                                                  p?.bachelorId ?? null,
                                                url: p?.bachelorUrl ?? null,
                                                variant: "bachelor",
                                                schoolId: school.id,
                                              })
                                            }
                                          />
                                          <DegreeButton
                                            label="M"
                                            variant="master"
                                            disabled={!p.master || !mHasKey}
                                            onClick={() =>
                                              onProgramClick({
                                                explicitRelId:
                                                  p?.masterRelId ?? null,
                                                explicitId: p?.masterId ?? null,
                                                url: p?.masterUrl ?? null,
                                                variant: "master",
                                                schoolId: school.id,
                                              })
                                            }
                                          />
                                          <DegreeButton
                                            label="PhD"
                                            variant="phd"
                                            disabled={!p.phd || !dHasKey}
                                            onClick={() =>
                                              onProgramClick({
                                                explicitRelId:
                                                  p?.phdRelId ?? null,
                                                explicitId: p?.phdId ?? null,
                                                url: p?.phdUrl ?? null,
                                                variant: "phd",
                                                schoolId: school.id,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Showing {Math.min(visible, total)} of {total}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    showMorePrograms(school.id, total)
                                  }
                                  disabled={!hasMore}
                                  className={
                                    !hasMore ? "opacity-60 cursor-default" : ""
                                  }
                                >
                                  {hasMore ? "Show more" : "ALL programs"}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md text-sm border border-gray-200 dark:border-gray-700 text-gray-500">
                              No programs available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="mt-8 flex justify-start">
              <Button
                onClick={() =>
                  navigate("/dashboard?section=find-schools", {
                    state: { activeSection: "find-schools" },
                    replace: true,
                  })
                }
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Return to Schools
              </Button>
            </div>
          </>
        )}

        {/* Add School Modal */}
        <Dialog open={showAddSchoolModal} onOpenChange={setShowAddSchoolModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add School To Comparison</DialogTitle>
              <DialogDescription>
                Search for schools by name or location to add to your
                comparison.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="relative">
                <Input
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      searchSchools(searchQuery);
                    }
                  }}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => searchSchools(searchQuery)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="h-6 w-6 rounded-full border-2 border-t-blue-500 border-blue-200 animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery.trim()
                      ? "No results found"
                      : "Type to search for schools"}
                  </div>
                ) : (
                  <div className="divide-y">
                    {searchResults.map((school) => (
                      <div
                        key={`search-result-${school.id}`}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                        onClick={() => {
                          const inList = selectedSchools.some(
                            (s) => s.id === school.id
                          );
                          if (inList) {
                            toast({
                              title: "School already in comparison",
                              description: `${school.name} is already in your comparison list`,
                              variant: "default",
                            });
                          } else {
                            const newSchoolsList = [...selectedSchools, school];
                            const newSchoolIds = newSchoolsList
                              .map((s) => s.id)
                              .join(",");
                            setShowAddSchoolModal(false);
                            navigate(`/compare-schools/${newSchoolIds}`);
                          }
                        }}
                      >
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <School className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {school.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddSchoolModal(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompareSchools;
