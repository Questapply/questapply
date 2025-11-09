import { motion } from "framer-motion";

interface SchoolRankingsProps {
  rankings: Record<string, any>;
}

const SchoolRankings = ({ rankings }: SchoolRankingsProps) => {
  const rankingLabels: Record<string, string> = {
    qs: "QS",
    usNews: "US",
    forbes: "FB",
    shanghai: "SH",
    the: "THE",
  };

  const rankingColors: Record<string, string> = {
    qs: "text-amber-400",
    usNews: "text-red-400",
    forbes: "text-blue-400",
    shanghai: "text-green-400",
    the: "text-purple-400",
  };

  // فقط آیتم‌های معتبر
  const validRankings = Object.entries(rankings).filter(
    ([, v]) => v !== "N/A" && v !== undefined && v !== null && v !== ""
  );
  if (!validRankings.length) return null;

  return (
    <div className="rounded-lg bg-gray-200/70 dark:bg-gray-800/60 p-2.5 md:p-3 min-w-0">
      <h4 className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 md:mb-2">
        Rankings
      </h4>

      {/* روی موبایل wrap شود؛ از md به بالا فاصله‌ها بیشتر */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 min-w-0">
        {validRankings.map(([key, value]) => {
          const label = rankingLabels[key] ?? key.toUpperCase();
          const color = rankingColors[key] ?? "text-foreground";

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1 px-2 py-1
                         rounded-md border border-border bg-card
                         text-[11px] md:text-xs leading-none"
            >
              <span className={`font-semibold ${color}`}>{label}</span>
              <span className="font-medium text-foreground">#{value}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolRankings;
