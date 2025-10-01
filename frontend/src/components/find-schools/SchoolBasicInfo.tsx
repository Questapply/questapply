import React from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast"; // ⬅️ اضافه شد

interface SchoolBasicInfoProps {
  name: string;
  location: string;
  logo: string;
  isFavorite: boolean;
  toggleFavorite: () => void | Promise<void>;
}

const SchoolBasicInfo = ({
  name,
  location,
  logo,
  isFavorite,
  toggleFavorite,
}: SchoolBasicInfoProps) => {
  const { toast } = useToast();

  const handleFavClick = async () => {
    const nextState = !isFavorite; // حالت بعد از کلیک
    try {
      await Promise.resolve(toggleFavorite());
    } catch (e) {
      toast({
        title: "Favorite action failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-start gap-3 md:gap-4 min-w-0">
      <motion.div
        whileHover={{ rotate: 5 }}
        transition={{ duration: 0.2 }}
        className="shrink-0"
      >
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-12 h-12 md:w-16 md:h-16 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
        />
      </motion.div>

      <div className="min-w-0">
        <h3
          className="text-base md:text-xl font-semibold text-gray-900 dark:text-white truncate"
          title={name}
        >
          {name}
        </h3>
        <p
          className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate"
          title={location}
        >
          {location}
        </p>

        <motion.button
          type="button"
          onClick={handleFavClick} // ⬅️ به‌جای toggleFavorite مستقیم
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="h-8 w-8 md:h-9 md:w-9 rounded-md border border-border
                     text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400
                     flex items-center justify-center transition-colors"
        >
          {isFavorite ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6 fill-red-500"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 md:h-6 md:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
  );
};

export default SchoolBasicInfo;
