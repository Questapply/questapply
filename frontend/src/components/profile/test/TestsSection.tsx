import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { standardizedTests as DEFAULT_TESTS } from "../../../lib/constants/test-options";
import TestOption from "./TestOption";
import TestScoreForm from "./TestScoreForm";

interface TestDef {
  id: string;
  name: string;
  description?: string;
  scoreFields: { id: string; label: string }[];
}

interface TestsSectionProps {
  // لیست تست‌هایی که باید نمایش داده شوند؛ اگر داده نشود از پیش‌فرض (constants) استفاده می‌شود
  tests?: TestDef[];
  selectedTests: Record<string, boolean>;
  testData: Record<string, { active: boolean; scores: Record<string, string> }>;
  errors: Record<string, any>;
  handleToggleTest: (testId: string) => void;
  handleScoreChange: (
    testId: string,
    scoreField: string,
    value: string
  ) => void;
  variants: any;
}

const titleFor = (ids: string[]) => {
  const set = new Set(ids);
  if (set.size === 2 && set.has("sat") && set.has("act"))
    return "SAT or ACT Scores";
  if (["gre", "gmat", "lsat"].every((k) => set.has(k)) && set.size === 3)
    return "GRE, GMAT or LSAT Scores";
  return "Standardized Test Scores";
};

const TestsSection: React.FC<TestsSectionProps> = ({
  tests,
  selectedTests,
  testData,
  errors,
  handleToggleTest,
  handleScoreChange,
  variants,
}) => {
  // فقط با همان لیستی کار کن که از پدر پاس شده؛ در غیر این صورت پیش‌فرض
  const list: TestDef[] =
    tests && tests.length ? tests : (DEFAULT_TESTS as TestDef[]);
  const visibleIds = new Set(list.map((t) => t.id));

  // فقط انتخاب‌های مربوط به تست‌های قابل‌نمایش را لحاظ کن
  const anyTestSelected = Object.entries(selectedTests).some(
    ([id, sel]) => visibleIds.has(id) && sel
  );

  const headerTitle = titleFor([...visibleIds]);

  return (
    <motion.div variants={variants} className="space-y-4 max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="text-lg font-medium text-gray-800 dark:text-gray-200 p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span>{headerTitle}</span>
        </div>

        <div className="p-6 space-y-6">
          {list.map((test) => (
            <div key={test.id} className="mb-6 last:mb-0">
              {/* دکمه/هدر انتخاب تست (باز/بسته شدن) */}
              <TestOption
                testId={test.id}
                testName={test.name}
                isSelected={!!selectedTests[test.id]}
                onToggle={handleToggleTest}
              />

              <AnimatePresence>
                {selectedTests[test.id] && (
                  <TestScoreForm
                    testId={test.id}
                    description={test.description || ""}
                    scoreFields={test.scoreFields}
                    scores={testData[test.id]?.scores || {}}
                    errors={errors[test.id] || {}}
                    onScoreChange={handleScoreChange}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}

          {!anyTestSelected && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 italic text-sm">
              No tests selected. You can continue without adding test scores if
              you haven't taken any standardized tests yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestsSection;
