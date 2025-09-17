import { useState } from "react";
import { Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../ui/button";

type ApplicationFilter = {
  id: string;
  name: string;
};

interface RoadmapApplicationFiltersProps {
  activeFilters: string[];
  toggleFilter: (filterId: string) => void;
}

const filters: ApplicationFilter[] = [
  { id: "deadline", name: "Deadline" },
  { id: "qsRank", name: "QS Rank" },
  { id: "gpa", name: "GPA" },
  { id: "applicationFee", name: "Application Fee" },
  { id: "desc", name: "DESC" },
  { id: "asc", name: "ASC" },
];

const RoadmapApplicationFilters = ({
  activeFilters,
  toggleFilter,
}: RoadmapApplicationFiltersProps) => {
  return (
    <motion.div
      className="flex flex-wrap gap-4 items-center mb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center">
        <div className="flex items-center mr-2">
          <Filter className="h-5 w-5 text-gray-500 mr-1" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            Order by:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <motion.button
              key={filter.id}
              className={`
                px-4 py-1.5 rounded-full text-sm
                ${
                  activeFilters.includes(filter.id)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                }
                transition-colors duration-200
              `}
              onClick={() => toggleFilter(filter.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </div>
      <motion.div
        className="ml-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Filter className="mr-2 h-4 w-4" />
          Filter My Applications
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default RoadmapApplicationFilters;
