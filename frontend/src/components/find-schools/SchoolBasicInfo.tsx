import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

interface SchoolBasicInfoProps {
  name: string;
  location: string;
  logo: string;
  isFavorite: boolean;
  toggleFavorite: () => void;
}

const SchoolBasicInfo = ({
  name,
  location,
  logo,
  isFavorite,
  toggleFavorite,
}: SchoolBasicInfoProps) => {
  return (
    <div className="flex items-center gap-4">
      <motion.div whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
        <img
          src={logo || "/placeholder.svg"}
          alt={`${name} logo`}
          className="w-20 h-20 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{location}</p>
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
  );
};

export default SchoolBasicInfo;
