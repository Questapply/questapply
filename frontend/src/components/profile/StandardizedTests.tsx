import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TestData } from "./ProfileTypes";
import TestsHeader from "./test/TestsHeader";
import TestsSection from "./test/TestsSection";
import TestsActions from "./test/TestsActions";
import { standardizedTests as BASE_TESTS } from "../../lib/constants/test-options";

interface StandardizedTestsProps {
  onNext: (data: any) => void;
  data: TestData;
  level?: string;
}

const isUG = (lvl?: string) => {
  const s = (lvl || "").toLowerCase();
  return /undergrad|bachelor|ba\b|bs\b/.test(s);
};

// در صورتی که SAT/ACT در constants نباشند، اینجا تعریف موقت می‌کنیم
const SAT_ACT: any[] = [
  {
    id: "sat",
    name: "SAT",
    description: "SAT scores for undergraduate (bachelor) admissions.",
    scoreFields: [
      { id: "total", label: "SAT Total" },
      { id: "reading_writing", label: "SAT Reading-writing" },
      { id: "math", label: "SAT Mathematics" },
    ],
  },
  {
    id: "act",
    name: "ACT",
    description: "ACT scores for undergraduate (bachelor) admissions.",
    scoreFields: [{ id: "total", label: "ACT Total" }],
  },
];

const mergeTests = () => {
  const ids = new Set((BASE_TESTS as any[]).map((t) => t.id));
  const merged = [...(BASE_TESTS as any[])];
  for (const t of SAT_ACT) if (!ids.has(t.id)) merged.push(t);
  return merged;
};

const StandardizedTests: React.FC<StandardizedTestsProps> = ({
  onNext,
  data,
  level,
}) => {
  const ALL = mergeTests();

  // فقط تست‌های مربوط به level را انتخاب کن
  const visibleIds = isUG(level) ? ["sat", "act"] : ["gre", "gmat", "lsat"];
  const defs = ALL.filter((t) => visibleIds.includes(t.id));

  // کمک‌تابع: ساخت state خالی فقط برای تست‌های visible
  const makeEmpty = () =>
    Object.fromEntries(
      defs.map((d) => [
        d.id,
        {
          active: false,
          scores: Object.fromEntries(d.scoreFields.map((f: any) => [f.id, ""])),
        },
      ])
    ) as Record<string, { active: boolean; scores: Record<string, string> }>;

  // selectedTests فقط برای تست‌های visible نگهداری شود
  const [selectedTests, setSelectedTests] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(defs.map((d) => [d.id, false])) as Record<
        string,
        boolean
      >
  );

  const [testData, setTestData] = useState<
    Record<string, { active: boolean; scores: Record<string, string> }>
  >(makeEmpty());

  const [errors, setErrors] = useState<Record<string, any>>({});

  // هیدریت از props (وقتی level یا data تغییر کند)
  useEffect(() => {
    // selectedTests پایه
    const baseSelected = Object.fromEntries(
      defs.map((d) => [d.id, false])
    ) as Record<string, boolean>;

    // state خالی
    const baseData = makeEmpty();

    // اگر از سرور قبلاً چیزی داریم، همان را بنشان
    const incoming = (data?.scores || {}) as any;
    for (const id of Object.keys(baseData)) {
      const src = incoming[id];
      if (src?.scores) {
        baseSelected[id] = true;
        baseData[id] = {
          active: true,
          scores: { ...baseData[id].scores, ...src.scores },
        };
      }
    }

    setSelectedTests(baseSelected);
    setTestData(baseData);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, data]); // مهم: با تغییر level همه‌چیز برای مجموعهٔ جدید بازسازی می‌شود

  // باز/بسته کردن هر بخش
  const handleToggleTest = (testId: string) => {
    setSelectedTests((prev) => ({ ...prev, [testId]: !prev[testId] }));
    setTestData((prev) => ({
      ...prev,
      [testId]: { ...prev[testId], active: !selectedTests[testId] },
    }));
  };

  // تغییر مقدار هر فیلد
  const handleScoreChange = (
    testId: string,
    scoreField: string,
    value: string
  ) => {
    setTestData((prev) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        scores: { ...prev[testId].scores, [scoreField]: value },
      },
    }));

    if (errors[testId]?.[scoreField]) {
      setErrors((prev) => ({
        ...prev,
        [testId]: { ...prev[testId], [scoreField]: false },
      }));
    }
  };

  // مرحله اختیاری: فقط تست‌هایی را بفرست که حداقل یک فیلدشان پر است
  const handleNext = () => {
    const payloadScores: any = {};

    for (const id of Object.keys(selectedTests)) {
      if (!selectedTests[id]) continue;

      const filled = Object.entries(testData[id]?.scores || {}).filter(
        ([, v]) => String(v || "").trim() !== ""
      );
      if (filled.length > 0) {
        payloadScores[id] = {
          active: true,
          scores: Object.fromEntries(filled),
        };
      }
    }

    const first = Object.keys(payloadScores)[0] || "";
    onNext({ type: first, scores: payloadScores }); // اگر خالی باشد {} می‌رود و مسیر بلوکه نمی‌شود
  };

  const handlePrevious = () => onNext({ type: "back" });

  // انیمیشن‌ها
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <TestsHeader variants={itemVariants} />

        <TestsSection
          // فقط همین تست‌ها را رندر کن (مهم)
          tests={defs} // ← نیاز است TestsSection از این استفاده کند
          selectedTests={selectedTests}
          testData={testData}
          errors={errors}
          handleToggleTest={handleToggleTest}
          handleScoreChange={handleScoreChange}
          variants={itemVariants}
          showSwitches={true} // اگر سوییچ دارید؛ یا از کلیکِ هدر برای باز/بسته استفاده می‌کنید
        />

        <TestsActions
          onPrevious={handlePrevious}
          onNext={handleNext}
          variants={itemVariants}
        />
      </motion.div>
    </div>
  );
};

export default StandardizedTests;
