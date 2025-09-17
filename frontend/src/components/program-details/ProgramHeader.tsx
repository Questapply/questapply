import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { ProgramDetail } from "../../data/programDetails";

interface ProgramHeaderProps {
  program: ProgramDetail;
  toggleFavorite: () => void;
  isFavorite: boolean;
}

const ProgramHeader: React.FC<ProgramHeaderProps> = ({
  program,
  toggleFavorite,
  isFavorite,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={program.schoolLogo}
                alt={`${program.school} logo`}
                className="w-24 h-24 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
              />
            </motion.div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <motion.h1
                className="text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {program.name}
              </motion.h1>
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                {program.degreeType}
              </Badge>
              <Badge
                className={
                  program.fit === "High Fit"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                }
              >
                {program.fit}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-lg text-gray-700 dark:text-gray-300 mb-4">
              <span className="font-medium">{program.degree}</span>
              <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
              <span>{program.school}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Duration
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {program.duration}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Format
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {program.format}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Language
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {program.language}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  QS Ranking
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {program.qsRanking}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <motion.button
              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors self-end"
              onClick={toggleFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isFavorite ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 fill-red-500"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </motion.button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400"
              >
                Compare
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Apply Now
              </Button>
            </div>

            <a
              href={program.schoolLogo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 dark:text-purple-400 flex items-center hover:underline"
            >
              <span>Visit Program Website</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramHeader;
