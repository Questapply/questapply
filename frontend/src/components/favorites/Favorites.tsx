import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";
import AnimatedCard from "../ui/animated-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Heart, SchoolIcon, Settings, Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { School } from "../entities/school/SchoolsData";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
type FavProgram = {
  id: number;
  name: string;
  school: string;
  duration?: string;
  deadline?: string;
  tuition?: string;
};

const Favorites = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [favoriteSchools, setFavoriteSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favoritePrograms, setFavoritePrograms] = useState<FavProgram[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const API_SCHOOLS = API_URL;
  const API_PROGRAMS = `${API_URL}/program-data`;

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // ---------- Fetch Favorite Schools ----------
  const fetchFavoriteSchools = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      // IDs
      const favoriteIdsResponse = await fetch(
        `${API_SCHOOLS}/favorites/schools`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!favoriteIdsResponse.ok) {
        if (
          favoriteIdsResponse.status === 401 ||
          favoriteIdsResponse.status === 403
        ) {
          localStorage.removeItem("token");
          navigate("/auth?mode=login");
          return;
        }
        throw new Error("Failed to fetch favorite schools");
      }

      const { favorites: favoriteIds } = await favoriteIdsResponse.json();

      if (!favoriteIds || favoriteIds.length === 0) {
        setFavoriteSchools([]);
        return;
      }

      // Details
      const schools: School[] = [];
      for (const schoolId of favoriteIds) {
        const schoolResponse = await fetch(
          `${API_SCHOOLS}/school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (schoolResponse.ok) {
          const schoolData = await schoolResponse.json();
          schools.push({ ...schoolData, favorite: true });
        }
      }

      setFavoriteSchools(schools);
    } catch (err) {
      console.error("Error fetching favorite schools:", err);
      setError("Failed to load favorite schools");
    } finally {
      setLoading(false);
    }
  }, [API_SCHOOLS, navigate]);

  // ---------- Fetch Favorite Programs ----------
  const loadFavoritePrograms = useCallback(async () => {
    try {
      setLoadingPrograms(true);
      setErrorPrograms(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      // 1) IDs
      const idsRes = await fetch(`${API_PROGRAMS}/favorites`, {
        method: "GET",
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

      // 2) Details (مسیر درست جزییات)
      const programs: FavProgram[] = [];
      for (const pid of programIds) {
        const pRes = await fetch(`${API_PROGRAMS}/details/${pid}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (pRes.ok) {
          const data = await pRes.json();
          programs.push({ ...data });
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

  // ---------- Effects ----------
  useEffect(() => {
    fetchFavoriteSchools();
  }, [fetchFavoriteSchools]);

  useEffect(() => {
    // برای اطمینان، در مونت هم لود کن
    loadFavoritePrograms();
  }, [loadFavoritePrograms]);

  // ---------- Actions ----------
  const handleToggleFavoriteProgram = async (programId: number) => {
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
        variant: "default",
      });
    } catch (err) {
      console.error("Error removing favorite program:", err);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (schoolId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }

      const response = await fetch(`${API_SCHOOLS}/favorites/schools`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schoolId, action: "remove" }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      const school = favoriteSchools.find((s) => s.id === schoolId);
      const schoolName = school ? school.name : "School";

      setFavoriteSchools((prev) => prev.filter((s) => s.id !== schoolId));

      toast({
        title: "Removed from Favorites",
        description: `${schoolName} has been removed from your favorites.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (schoolId: number) => {
    navigate(`/school/${schoolId}`);
  };

  // ---------- UI ----------
  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            My Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your favorite schools and programs.
          </p>
        </motion.div>

        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <SchoolIcon className="h-4 w-4" />
              <span>Schools</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Programs</span>
            </TabsTrigger>
          </TabsList>

          {/* Schools */}
          <TabsContent value="schools">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                  Error Loading Favorites
                </h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteSchools.map((school, index) => (
                  <AnimatedCard
                    key={school.id}
                    delay={index * 0.1}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={school.logo || "/placeholder.svg"}
                        alt={school.name}
                        className="w-full h-40 object-cover"
                      />
                      <button
                        className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full"
                        onClick={() => handleToggleFavorite(school.id)}
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-1">
                        {school.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {school.location}
                      </p>

                      {/* rankings display kept as-is */}
                      {/* ... */}

                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {school.acceptance}% Acceptance Rate
                      </div>

                      <button
                        className="mt-4 text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
                        onClick={() => handleViewDetails(school.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </AnimatedCard>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {favoritePrograms.map((program, index) => (
                  <AnimatedCard
                    key={program.id}
                    delay={index * 0.1}
                    className="flex flex-col"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {program.school}
                          </p>
                        </div>
                        <button
                          className="bg-white/80 dark:bg-gray-800/80 p-2 rounded-full"
                          onClick={() =>
                            handleToggleFavoriteProgram(program.id)
                          }
                        >
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-300">
                            {program.duration}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Application Deadline:
                          </span>
                          <span className="ml-2 text-gray-600 dark:text-gray-300">
                            {program.deadline}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Tuition:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-300">
                            {program.tuition}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:underline"
                          onClick={() => navigate(`/program/${program.id}`)}
                        >
                          View Program
                        </button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Favorites;
