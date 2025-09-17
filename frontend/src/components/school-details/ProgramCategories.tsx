
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Folder } from "lucide-react";

interface Program {
  name: string;
  level: string;
  type: string;
}

interface ProgramCategory {
  name: string;
  image: string;
  programs: Program[];
}

interface ProgramCategoriesProps {
  categories: ProgramCategory[];
}

const ProgramCategories: React.FC<ProgramCategoriesProps> = ({ categories }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Folder className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Academic Programs by Category</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div 
              key={category.name} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <h3 className="p-4 text-lg font-medium text-white">{category.name}</h3>
                </div>
              </div>
              
              <div 
                className="p-4 bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-between"
                onClick={() => toggleCategory(category.name)}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Programs ({category.programs.length})
                </span>
                {expandedCategories[category.name] ? (
                  <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              
              {expandedCategories[category.name] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {category.programs.map((program, idx) => (
                      <li key={idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{program.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {program.level} • {program.type}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramCategories;
