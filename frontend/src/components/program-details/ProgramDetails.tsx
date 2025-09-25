import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import ProgramHeader from "@/components/program-details/ProgramHeader";
import ProgramOverview from "@/components/program-details/ProgramOverview";
import RequirementsSection from "@/components/program-details/RequirementsSection";
import CostSection from "@/components/program-details/CostSection";
import CareerOutcomes from "@/components/program-details/CareerOutcomes";
import SimilarPrograms from "@/components/program-details/SimilarPrograms";
import ContactInfo from "@/components/program-details/ContactInfo";
import type { ProgramDetail } from "@/data/programDetails";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type MinOnly = { min: number };
type MinAvg = { min: number; avg?: number };
type AvgObj = { avg: number };
type GreScore = number | AvgObj;

type CostBreakdown = {
  tuition: number;
  fees: number;
  healthInsurance: number;
  livingCost: number;
};

export type DeadlineChip = { season: string; date: string };

/* ---------------- Page ---------------- */
const ProgramDetails: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  /* --------- Helper: fetch from API --------- */

  async function fetchProgramDetails(
    programId: number
  ): Promise<ProgramDetail> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }
      if (!programId) {
        throw new Error("Invalid program id.");
        setLoading(false);
        return;
      }
      setLoading(true);

      const res = await fetch(`${API_URL}/program-data/details/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as ProgramDetail;
      console.log("Detail Program:", data);
      return data;
    } catch (err) {
      console.error(err?.message || "Failed to load program details.");
    } finally {
      setLoading(false);
    }
  }

  // Load from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!programId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchProgramDetails(Number(programId));
        if (mounted) {
          setProgram(data);
          setIsFavorite(Boolean(data.favorite));
        }
      } catch (err) {
        console.error(err);
        if (mounted) setProgram(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [programId]);

  const toggleFavorite = () => setIsFavorite((v) => !v);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/dashboard/find-programs"
            state={{ activeSection: "find-programs" }}
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to Programs</span>
          </Link>
        </motion.div>

        {program && (
          <>
            <ProgramHeader
              program={program}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
            <ProgramOverview program={program} />
            <RequirementsSection program={program} />
            <CostSection program={program} />
            <CareerOutcomes program={program} />
            <SimilarPrograms program={program} />
            <ContactInfo program={program} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramDetails;
