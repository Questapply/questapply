
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface University {
  id: number;
  name: string;
  location: string;
  country: string;
  logo: string;
  rankings: {
    qs: string;
    usNews: string;
    shanghai: string;
    the: string;
    forbes: string;
  };
}

interface UniversityTableProps {
  universities: University[];
  favorites: Record<number, boolean>;
  toggleFavorite: (id: number) => void;
}

const UniversityTable = ({ universities, favorites, toggleFavorite }: UniversityTableProps) => {
  return (
    <motion.div 
      className="flex-grow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-6 gap-4 p-4 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <div className="col-span-2">University</div>
          <div className="text-center font-medium text-purple-600 dark:text-purple-400">QS</div>
          <div className="text-center">US News</div>
          <div className="text-center">Shanghai</div>
          <div className="text-center">THE</div>
          <div className="text-center">Forbes</div>
          <div className="text-center">Favorite</div>
        </div>

        {universities.map((university) => (
          <div key={university.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
            <div className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="col-span-2 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                  <img 
                    src={university.logo} 
                    alt={university.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">{university.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{university.location}</p>
                </div>
              </div>
              <div className="text-center">
                {university.rankings.qs && (
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {university.rankings.qs}
                  </span>
                )}
              </div>
              <div className="text-center">
                {university.rankings.usNews && (
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {university.rankings.usNews}
                  </span>
                )}
              </div>
              <div className="text-center">
                {university.rankings.shanghai && (
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {university.rankings.shanghai}
                  </span>
                )}
              </div>
              <div className="text-center">
                {university.rankings.the && (
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {university.rankings.the}
                  </span>
                )}
              </div>
              <div className="text-center">
                {university.rankings.forbes && (
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {university.rankings.forbes}
                  </span>
                )}
              </div>
              <div className="flex justify-center">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleFavorite(university.id)}
                >
                  {favorites[university.id] ? (
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default UniversityTable;
