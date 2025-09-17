import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import TalentAssessmentFlow from "./TalentAssessmentFlow"; // فرضاً این فایل وجود داره
import {
  talentQuestionsData,
  talentAreasData,
  recommendedProgramsData,
  topUniversitiesData,
} from "../hero/data/mockData";

interface TalentAssessmentProps {
  isDarkMode: boolean;
}

const TalentAssessment = ({ isDarkMode }: TalentAssessmentProps) => {
  const [talentAssessmentActive, setTalentAssessmentActive] = useState(false);
  const [talentAssessmentStarted, setTalentAssessmentStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTalentAssessmentActive(true);
      const startTimer = setTimeout(() => {
        setTalentAssessmentStarted(true);
      }, 1000);
      return () => clearTimeout(startTimer);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full pt-24">
      <hr className="border-gray-300 dark:border-gray-700 mb-8" />
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-cyan-300"
        >
          AI <span className="text-white">Meets Your Talent</span>
        </motion.h2>
        <p className="mt-6 text-lg text-white/90 max-w-3xl mx-auto">
          Our advanced AI algorithms analyze your skills, interests, and
          achievements to identify your unique talents and potential.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden"
        style={{ height: 600 }}
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            AI Talent Assessment
          </span>
        </div>
        <div className="flex-grow p-6">
          {talentAssessmentActive && (
            <div className="w-full h-full">
              <TalentAssessmentFlow
                started={talentAssessmentStarted}
                onStart={() => setTalentAssessmentStarted(true)}
                talentQuestionsData={talentQuestionsData}
                talentAreasData={talentAreasData}
                recommendedProgramsData={recommendedProgramsData}
                topUniversitiesData={topUniversitiesData}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TalentAssessment;
