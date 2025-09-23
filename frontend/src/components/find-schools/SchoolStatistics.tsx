import React from "react";
import { motion } from "framer-motion";
import ProgressCircle from "../ui/progress-circle";
import { School } from "../entities/school/SchoolsData";

interface SchoolStatisticsProps {
  school: School;
}

const SchoolStatistics = ({ school }: SchoolStatisticsProps) => {
  // اگر مقادیر undefined/null باشند، ProgressCircle معمولاً خودش هندل می‌کند؛
  // اما برای اطمینان می‌توانیم 0 نمایش بدهیم:
  const acc = typeof school.acceptance === "number" ? school.acceptance : 0;
  const grad = typeof school.graduation === "number" ? school.graduation : 0;

  return (
    <div className="rounded-lg bg-gray-100/70 dark:bg-gray-800/60 p-3 md:p-4 min-w-0">
      <h4 className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 md:mb-3">
        Statistics
      </h4>

      {/* در موبایل جمع‌وجور: فاصله کم + بدون اسکرول افقی */}
      <div className="flex items-center justify-between gap-3 md:gap-4 min-w-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center min-w-0"
        >
          {/* اگر ProgressCircle سایز ثابت دارد، با scale کوچیک‌ترش می‌کنیم */}
          <div className="transform scale-90 md:scale-100">
            <ProgressCircle
              value={acc}
              size="sm"
              color="red"
              label="Acceptance"
              strokeWidth={2}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="flex flex-col items-center min-w-0"
        >
          <div className="transform scale-90 md:scale-100">
            <ProgressCircle
              value={grad}
              size="sm"
              color="green"
              label="Graduation"
              strokeWidth={2}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolStatistics;
