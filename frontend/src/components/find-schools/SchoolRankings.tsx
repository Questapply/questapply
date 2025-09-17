import { motion } from "framer-motion";

interface SchoolRankingsProps {
  rankings: Record<string, any>;
}

const SchoolRankings = ({ rankings }: SchoolRankingsProps) => {
  // Map for ranking labels and colors
  const rankingLabels: Record<string, string> = {
    qs: "QS",
    usNews: "US",
    forbes: "FB",
    shanghai: "SH",
    the: "THE"
  };

  // Map for text colors based on ranking service
  const rankingColors: Record<string, string> = {
    qs: "text-amber-400",
    usNews: "text-red-400",
    forbes: "text-blue-400",
    shanghai: "text-green-400",
    the: "text-purple-400"
  };

  // Filter out rankings with 'N/A' values
  const validRankings = Object.entries(rankings).filter(
    ([_, value]) => value !== 'N/A' && value !== undefined && value !== null
  );

  // Don't render the component if there are no valid rankings
  if (validRankings.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800/60 px-4 py-1 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rankings</h4>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {validRankings.map(([key, value]) => (
          <motion.div 
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div 
              className={`w-6 h-6 bg-gray-200 dark:bg-[#1A1A1A] rounded flex items-center justify-center shadow-lg`}
            >
              <span className={`font-bold text-xs ${rankingColors[key]}`}>{rankingLabels[key]}</span>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium text-gray-800 dark:text-white">#{value}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SchoolRankings;
