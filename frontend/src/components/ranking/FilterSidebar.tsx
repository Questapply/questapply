
import { motion } from "framer-motion";
import { ListOrdered, ChevronDown } from "lucide-react";

const FilterSidebar = () => {
  return (
    <motion.div 
      className="w-full md:w-64 flex-shrink-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-gray-800/90 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button className="w-full flex items-center justify-between text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
              <div className="flex items-center">
                <ListOrdered className="h-5 w-5 mr-2" />
                <span>Country</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button className="w-full flex items-center justify-between text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
              <div className="flex items-center">
                <ListOrdered className="h-5 w-5 mr-2" />
                <span>QS Ranking</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <button className="w-full flex items-center justify-between text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
              <div className="flex items-center">
                <ListOrdered className="h-5 w-5 mr-2" />
                <span>Program</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSidebar;
