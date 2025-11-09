import FindSchoolsTourGuide from "../find-schools/FindSchoolsTourGuide";
import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { staticSchool } from "../roadmap/roadmapData";
import {
  ChevronsUpDown,
  GitCompare,
  GraduationCap,
  Search,
  Star,
} from "lucide-react";
import { cn } from "../../lib/utils";

import SchoolRankings from "../find-schools/SchoolRankings";
import ProgressCircle from "../ui/progress-circle";
import SchoolPrograms from "../find-schools/SchoolPrograms";
import { filterIcons } from "../filters/FilterData";

interface staticSchool {
  id: number;
  name: string;
  location: string;
  logo: string;
  ranking: {
    qs: string;
    usNews: string;
    forbes: string;
    shanghai: string;
    the: string;
  };
  programs: string[];
  acceptance: number;
  graduation: number;
  cost: {
    inState: number;
    outState: number;
  };
  favorite: boolean;
  filterIcons: string;
}
const filterButtonsData = [
  {
    id: 1,
    label: "United States of America",
    placeholder: "United States of America",
    icon: filterIcons.country,
  },
  { id: 2, label: null, placeholder: "State", icon: filterIcons.state },
  {
    id: 3,
    label: null,
    placeholder: "School",
    icon: filterIcons.schools,
  },
  {
    id: 4,
    label: "Ph.D",
    placeholder: "Ph.D",
    icon: filterIcons.degreeLevel,
  },
  {
    id: 5,
    label: "Engineering & Technology",
    placeholder: "Engineering & Technology",
    icon: filterIcons.areaOfStudy,
  },
  {
    id: 6,
    label: "Computer Science and Engineering, IT& Information",
    placeholder: "Computer Science and Engineering, IT& Information",
    icon: filterIcons.programs,
  },
  { id: 7, label: null, placeholder: "Order By", icon: filterIcons.gre },
];
// static commponent school

function StaticSchoolList() {
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) {
      return "N/A";
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };
  return (
    <div className="p-6 animate-fade-in">
      <FindSchoolsTourGuide />
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Schools
        </motion.h1>
        <motion.div
          className="flex items-center gap-3"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Find Schools helps you explore educational institutions worldwide
          </div>
        </motion.div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search schools by name..."
            className="pl-10 py-2 w-full"
            disabled
          />
        </div>
      </div>

      <motion.div
        className="mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
          >
            <path
              d="M3 4.5h18M7 12h10M11 19.5h2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            Filters
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterButtonsData.map((button) => (
            <motion.button
              whileHover={{ y: -3 }}
              className={cn(
                "flex items-center gap-2 px-4  rounded-full text-xs border !py-1.5 ",

                "bg-sky-300 font-semibold dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-800 dark:text-gray-300",
                "hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-sm",
                "transition-all duration-300 ease-in-out focus:outline-none",

                button.label
                  ? "bg-purple-400 dark:bg-purple-900/30 font-semibold  dark:text-gray-50 border-gray-400 dark:border-purple-700 text-violet-700"
                  : "",

                "opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-700 hover:shadow-none"
              )}
            >
              <span>{button.icon}</span>
              <span className="truncate max-w-[100px]">
                {button.label ? button.label : button.placeholder}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 ml-1" />X
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-6">
        {staticSchool.map((school, index) => (
          <motion.div
            key={school.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo, Basic Info and Rankings */}
                <div className="flex flex-col gap-2 w-full md:w-1/3">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={school.logo || "/placeholder.svg"}
                        alt={`${school.name} logo`}
                        className="w-20 h-20 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {school.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {school.location}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          School Details
                        </Button>
                        <motion.button
                          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {school.favorite === true ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 fill-red-500"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
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
                      </div>
                    </div>
                  </div>

                  {/* Rankings */}
                  <SchoolRankings rankings={school.ranking} />

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-purple-900/20 text-purple-400 border-purple-500 hover:bg-purple-800/30 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-800/30"
                    >
                      School Details
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 
                   
                      bg-green-900/20 text-green-400 border-green-500 hover:bg-green-800/30 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-800/30"
                    >
                      <GitCompare className="h-4 w-4" />
                      Compare
                    </Button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Cost */}
                    <div className="bg-gray-200/70 dark:bg-gray-800/60 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Tuition Cost
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            In-state
                          </div>
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg font-semibold text-gray-800 dark:text-white"
                          >
                            {formatCurrency(school.cost.inState)}{" "}
                            {/* اینجا از inState استفاده می‌شود */}
                          </motion.div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Out-of-state
                          </div>
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-lg font-semibold text-gray-800 dark:text-white"
                          >
                            {formatCurrency(school.cost.outState)}{" "}
                            {/* اینجا از outState استفاده می‌شود */}
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="bg-gray-200/70 dark:bg-gray-800/60 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Statistics
                      </h4>
                      <div className="flex justify-around items-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <ProgressCircle
                            value={school.acceptance}
                            size="sm"
                            color="red"
                            label="Acceptance"
                            strokeWidth={2}
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                          className="flex flex-col items-center"
                        >
                          <ProgressCircle
                            value={school.graduation}
                            size="sm"
                            color="green"
                            label="Graduation"
                            strokeWidth={2}
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Programs */}
                    <div className="lg:col-span-2">
                      <SchoolPrograms programs={school.programs} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default StaticSchoolList;
