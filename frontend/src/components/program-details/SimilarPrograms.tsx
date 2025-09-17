import React from "react";
import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProgramDetail } from "../../data/programDetails";

interface SimilarProgramsProps {
  program: ProgramDetail;
}

const SimilarPrograms: React.FC<SimilarProgramsProps> = ({ program }) => {
  const navigate = useNavigate();

  const handleProgramClick = (programId: number) => {
    navigate(`/program/${programId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <GitCompare className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Similar Programs
        </h2>
      </div>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {program.similarPrograms.map((similarProgram, index) => (
              <motion.div
                key={similarProgram.id}
                className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                onClick={() => handleProgramClick(similarProgram.id)}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  {similarProgram.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {similarProgram.school}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SimilarPrograms;
