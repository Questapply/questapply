import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Heart, School as SchoolIcon, Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { School } from "../entities/school/SchoolsData";
import ProgramResultCard, {
  Program as ProgType,
} from "@/components/find-programs/ProgramResultCard";
import SchoolCard from "@/components/find-schools/SchoolCard";
import NavigationButtons from "../layout/NavigationButtons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ---------------- Types ---------------- */
type FavProgram = {
  id: number;
  name: string;
  school: string;

  logo?: string;
  degree?: string;
  degreeType?: string;
  fit?: string;
  language?: string;
  campus?: string;
  qsRank?: number | string;

  // optional extras we may show
  duration?: string;
  tuition?: string;

  deadline?: Array<{ season: string; date: string }>;
  deadlineSeason?: string | null;

  toefl?: number | null;
  gpa?: number | null;
  greAccepted?: "Not Accepted" | "Required" | "Optional" | "Not Required";
};

const normalizeProgramForFavorites = (data: any): FavProgram => {
  const greRaw =
    data?.requirements?.gre?.status ??
    data?.requirements?.gre ??
    data?.gre ??
    "";
  const s = String(greRaw).trim().toLowerCase();
  let greAccepted: FavProgram["greAccepted"] = "Not Required";
  if (["not accepted", "not_accepted", "no"].includes(s))
    greAccepted = "Not Accepted";
  else if (s === "required") greAccepted = "Required";
  else if (
    [
      "optional",
      "not required",
      "nrbsr",
      "contingent",
      "contigent",
      "not required but strongly recommended",
    ].includes(s)
  )
    greAccepted = "Not Required";

  return {
    id: Number(data?.id),
    name: data?.name ?? "",
    school: data?.school ?? "",
    logo: data?.schoolLogo ?? data?.logo ?? "",
    degree: data?.degree ?? data?.degreeType ?? "",
    degreeType: data?.degreeType ?? "",
    fit: data?.fit ?? "",
    language: data?.language ?? "",
    campus: data?.campus ?? "",
    qsRank: data?.qsRanking ?? data?.qs_rank ?? data?.qsRank ?? null,
    duration: data?.duration ?? data?.programDuration ?? undefined,
    tuition: data?.tuition ?? undefined,
    deadline: Array.isArray(data?.deadline) ? data.deadline : [],
    deadlineSeason: data?.deadlineSeason ?? null,
    toefl: data?.requirements?.toefl?.min ?? data?.toefl ?? null,
    gpa: data?.requirements?.gpa?.min ?? data?.gpa ?? null,
    greAccepted,
  };
};

/* ---------------- Component ---------------- */
const Favorites: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [favoriteSchools, setFavoriteSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [errorSchools, setErrorSchools] = useState<string | null>(null);

  const [favoritePrograms, setFavoritePrograms] = useState<FavProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const API_SCHOOLS = API_URL;
  const API_PROGRAMS = `${API_URL}/program-data`;

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  };

  /* ---------- Fetch Favorite Schools ---------- */
  const fetchFavoriteSchools = useCallback(async () => {
    try {
      setLoadingSchools(true);
      setErrorSchools(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const idsRes = await fetch(`${API_SCHOOLS}/favorites/schools`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!idsRes.ok) {
        if (idsRes.status === 401 || idsRes.status === 403) {
          localStorage.removeItem("token");
          navigate("/auth?mode=login");
          return;
        }
        throw new Error("Failed to fetch favorite schools");
      }

      const { favorites: schoolIds } = await idsRes.json();
      if (!schoolIds || schoolIds.length === 0) {
        setFavoriteSchools([]);
        return;
      }

      const details: School[] = [];
      for (const id of schoolIds) {
        const res = await fetch(`${API_SCHOOLS}/school/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          details.push({ ...data, favorite: true });
        }
      }
      setFavoriteSchools(details);
    } catch (e) {
      console.error("Error fetching favorite schools:", e);
      setErrorSchools("Failed to load favorite schools.");
    } finally {
      setLoadingSchools(false);
    }
  }, [API_SCHOOLS, navigate]);

  /* ---------- Fetch Favorite Programs ---------- */
  const fetchFavoritePrograms = useCallback(async () => {
    try {
      setLoadingPrograms(true);
      setErrorPrograms(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const idsRes = await fetch(`${API_PROGRAMS}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!idsRes.ok) {
        if (idsRes.status === 401 || idsRes.status === 403) {
          localStorage.removeItem("token");
          navigate("/auth?mode=login");
          return;
        }
        throw new Error("Failed to fetch favorite program ids");
      }

      const { favorites: programIds } = await idsRes.json();
      if (!programIds || programIds.length === 0) {
        setFavoritePrograms([]);
        return;
      }

      const programs: FavProgram[] = [];
      for (const pid of programIds) {
        const res = await fetch(`${API_PROGRAMS}/details/${pid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          programs.push(normalizeProgramForFavorites(data));
        }
      }
      setFavoritePrograms(programs);
    } catch (e) {
      console.error("Error loading favorite programs:", e);
      setErrorPrograms("Failed to load favorite programs.");
    } finally {
      setLoadingPrograms(false);
    }
  }, [API_PROGRAMS, navigate]);

  /* ---------- Effects ---------- */
  useEffect(() => void fetchFavoriteSchools(), [fetchFavoriteSchools]);
  useEffect(() => void fetchFavoritePrograms(), [fetchFavoritePrograms]);

  /* ---------- Actions ---------- */
  const handleRemoveFavoriteSchool = async (schoolId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch(`${API_SCHOOLS}/favorites/schools`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolId, action: "remove" }),
      });

      if (!res.ok) throw new Error("Failed to remove from favorites");

      const s = favoriteSchools.find((x) => x.id === schoolId);
      setFavoriteSchools((prev) => prev.filter((x) => x.id !== schoolId));

      toast({
        title: "Removed from Favorites",
        description: `${
          s?.name ?? "School"
        } has been removed from your favorites.`,
      });
    } catch (e) {
      console.error("Error removing favorite:", e);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFavoriteProgram = async (programId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const res = await fetch(`${API_PROGRAMS}/favorites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programId, action: "remove" }),
      });

      if (!res.ok) throw new Error("Failed to remove program from favorites");

      setFavoritePrograms((prev) => prev.filter((p) => p.id !== programId));
      toast({
        title: "Removed from Favorites",
        description: "Program has been removed from your favorites.",
      });
    } catch (e) {
      console.error("Error removing favorite program:", e);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewSchool = (id: number) => navigate(`/school/${id}`);
  const handleViewProgram = (id: number) => navigate(`/program/${id}`);

  /* ---------- UI ---------- */
  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <NavigationButtons isDarkMode={isDarkMode} />
      <div className="space-y-8 mt-5 md:mt-7">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your favorite schools and programs.
          </p>
        </motion.div>

        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="mb-6 w-full flex justify-around items-center">
            <TabsTrigger
              value="schools"
              className="flex items-center gap-2 px-4"
            >
              <SchoolIcon className="h-4 w-4 " />
              <span className="md:text-lg">Schools</span>
            </TabsTrigger>
            <TabsTrigger
              value="programs"
              className="flex items-center gap-2 px-4"
            >
              <Settings className="h-4 w-4" />
              <span className="md:text-lg">Programs</span>
            </TabsTrigger>
          </TabsList>

          {/* Schools */}
          <TabsContent value="schools">
            {loadingSchools ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : errorSchools ? (
              <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                  Error Loading Favorites
                </h3>
                <p className="text-red-600 dark:text-red-400">{errorSchools}</p>
              </div>
            ) : favoriteSchools.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  No Favorite Schools
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't added any schools to your favorites yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6 md:px-40">
                {favoriteSchools.map((school, index) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    index={index}
                    isFavorite={true}
                    toggleFavorite={() => handleRemoveFavoriteSchool(school.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Programs */}
          <TabsContent value="programs">
            {loadingPrograms ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : errorPrograms ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Error
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {errorPrograms}
                </p>
              </div>
            ) : favoritePrograms.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  No Favorite Programs
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't added any programs to your favorites yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:px-40">
                {favoritePrograms.map((p, idx) => {
                  // Map FavProgram -> ProgramResultCard props
                  const program: ProgType = {
                    id: p.id,
                    name: p.name,
                    degree: p.degree ?? "",
                    school: p.school,
                    schoolLogo: p.logo ?? "",
                    degreeType: p.degreeType ?? p.degree ?? "Program",
                    fit: p.fit ?? "High Fit",
                    duration: p.duration ?? "-",
                    format: null,
                    language: p.language ?? "-",
                    campus: p.campus ?? "-",
                    qsRanking: p.qsRank != null ? String(p.qsRank) : "-",

                    deadline: Array.isArray(p.deadline) ? p.deadline : [],
                    requirements: {
                      toefl: { min: Number(p.toefl ?? 0) || 0 },
                      gpa: { min: Number(p.gpa ?? 0) || 0 },
                      gre: { status: p.greAccepted ?? "Not Required" },
                    },
                  };

                  return (
                    <ProgramResultCard
                      key={program.id}
                      index={idx}
                      program={program}
                      selectedEnglish={"TOEFL"}
                      isCompared={false}
                      isFavorite={true}
                      isInList={false}
                      onToggleCompare={() => {}}
                      onToggleFavorite={() =>
                        handleRemoveFavoriteProgram(program.id)
                      }
                      onProgramInfo={(id) => handleViewProgram(id)}
                      onToggleList={() => {}}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Favorites;
