import { motion } from "framer-motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { filterIcons } from "../filters/FilterData";
import {
  ChevronsUpDown,
  Globe,
  Heart,
  Mail,
  MapPin,
  SearchIcon,
  Send,
} from "lucide-react";
import { cn } from "../../lib/utils";
import AnimatedCard from "../ui/animated-card";
import { CardContent } from "../ui/card";
import { staticProfessors } from "../roadmap/roadmapData";

const filterButtonsProfessor = [
  {
    id: 1,
    label: "United States of America",
    placeholder: "United States of America",
    icon: filterIcons.country,
  },

  {
    id: 2,
    label: "Ph.D",
    placeholder: "Ph.D",
    icon: filterIcons.degreeLevel,
  },
  {
    id: 3,
    label: "Engineering & Technology",
    placeholder: "Engineering & Technology",
    icon: filterIcons.areaOfStudy,
  },
  {
    id: 4,
    label: "Computer Science and Engineering, IT& Information",
    placeholder: "Computer Science and Engineering, IT& Information",
    icon: filterIcons.programs,
  },
  {
    id: 5,
    label: null,
    placeholder: "Research Interests",
    icon: filterIcons.researchInterest,
  },
  {
    id: 6,
    label: null,
    placeholder: "Professor Title",
    icon: filterIcons.researchInterest,
  },
];

function StaticProfessorList() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <motion.h1
          className="text-2xl font-bold text-gray-900 dark:text-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Find Professors
        </motion.h1>
        <motion.div
          className="text-sm text-gray-500 dark:text-gray-400"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Professors are sorted by university ranking
        </motion.div>
      </div>
      <motion.div
        className="mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form className="w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all duration-300"
            placeholder="Search by name"
            disabled
          />
        </form>
      </motion.div>

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
          {filterButtonsProfessor.map((button) => (
            <motion.button
              key={button.id}
              whileHover={{ y: -3 }}
              className={cn(
                "flex items-center gap-2 px-4  rounded-full text-xs border !py-1.5 ",

                "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                "hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-sm",
                "transition-all duration-300 ease-in-out focus:outline-none",

                button.label
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-gray-50 border-purple-200 dark:border-purple-700 "
                  : "",

                "opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-none"
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

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {staticProfessors.map((professor) => (
          <AnimatedCard
            key={professor.ID}
            delay={0.2}
            className="border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="flex flex-col items-center md:items-start gap-4"
                  variants={itemVariants}
                >
                  <div className="flex items-start gap-4 w-full">
                    <div className="relative">
                      <motion.img
                        src={professor.image || "/placeholder.svg"}
                        alt={`${professor.name}'s avatar`}
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 dark:border-purple-900/30 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.div
                        className="absolute -bottom-2 -right-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full px-3 py-1 text-xs font-medium shadow-sm border border-purple-200 dark:border-purple-800"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        {professor.title}
                      </motion.div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {professor.name}
                        </h3>
                        <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors">
                          <Heart
                            className={cn(
                              "h-5 w-5 transition-colors duration-300",
                              professor.favorite === true
                                ? "text-red-500 fill-red-500"
                                : ""
                            )}
                          />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-2 w-full min-h-[80px]">
                        <div className="flex flex-col">
                          <a className="text-purple-600 dark:text-purple-400 hover:underline text-md font-medium transition-colors">
                            {professor.school_name}
                          </a>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3 mr-1" />{" "}
                            {professor.state}, {professor.country_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professor contact icons */}
                  <div className="flex items-center gap-6 mt-2 justify-center w-full">
                    {professor.email && (
                      <a className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                        <Mail className="w-6 h-6" />
                      </a>
                    )}
                    {professor.google_scholar && (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 0 0 0-14z" />
                          <path d="M10 15h4v1h-4z" />
                          <path d="M10 18h4v1h-4z" />
                          <path d="M10 12h4v1h-4z" />
                        </svg>
                      </a>
                    )}
                    {professor.website && (
                      <a
                        rel="noopener noreferrer"
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                      >
                        <Globe className="w-6 h-6" />
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Send Email
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Remind
                    </Button>
                  </div>
                </motion.div>

                {/* Research and Programs */}
                <motion.div className="md:col-span-2" variants={itemVariants}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full ">
                    {/* Research Interests */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Research Interest
                        </h4>
                      </div>
                      <ul className="space-y-3 h-36 overflow-hidden">
                        {professor.researchInterests.map((interest, i) => (
                          <motion.li
                            key={i}
                            className="flex items-start gap-2 transition-all duration-300 hover:translate-x-1"
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                          >
                            <span className="text-purple-500 dark:text-purple-400 mt-1">
                              •
                            </span>
                            <span className="text-gray-700  dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              {interest}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Programs */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 h-full">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Programs
                      </h4>
                      <div className="space-y-4">
                        <motion.div
                          className="flex items-center gap-2 p-2 rounded-lg transition-all duration-300 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <svg
                            className="w-5 h-5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            {professor.program_name}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </AnimatedCard>
        ))}
      </motion.div>
    </div>
  );
}
export default StaticProfessorList;
