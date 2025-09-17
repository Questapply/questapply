import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { ProgramDetail } from "../../data/programDetails";

interface ProgramOverviewProps {
  program: ProgramDetail;
}

const ProgramOverview: React.FC<ProgramOverviewProps> = ({ program }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Info className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Program Overview
        </h2>
      </div>

      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {program.description}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Course Structure
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {program.courseStructure}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Faculty Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {program.facultyHighlights.map((faculty, index) => (
                <motion.div
                  key={faculty.name}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  whileHover={{
                    y: -5,
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="mr-4">
                      <img
                        src={faculty.photoUrl}
                        alt={faculty.name}
                        className="w-12 h-12 rounded-full object-cover bg-gray-200 dark:bg-gray-600"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {faculty.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faculty.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Research focus:</span>{" "}
                    {faculty.research}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgramOverview;
