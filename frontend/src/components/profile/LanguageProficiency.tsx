import React, { useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "../ui/button";
import { Languages, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { languageTests } from "../../lib/constants/test-options";

interface LanguageProficiencyProps {
  onNext: (data: any) => void;
  data: { test: string; score: string; examDate?: string };
}

const NO_SCORE_VALUES = [
  "I don't have this",
  "Not yet, but I will in the future",
] as const;

const SCORE_META: Record<
  string,
  { min?: number; max?: number; step?: number; placeholder: string }
> = {
  TOEFL: { min: 0, max: 120, step: 1, placeholder: "e.g., 100" },
  IELTS: { min: 0, max: 9, step: 0.5, placeholder: "e.g., 7.0" },
  Duolingo: { min: 10, max: 160, step: 1, placeholder: "e.g., 120" },
  MELAB: { min: 0, max: 100, step: 1, placeholder: "e.g., 85" },
  PTE: { min: 10, max: 90, step: 1, placeholder: "e.g., 65" },
  Cael: { min: 0, max: 90, step: 1, placeholder: "e.g., 70" },
};

const iconAnimation: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
  },
};

const LanguageProficiency: React.FC<LanguageProficiencyProps> = ({
  onNext,
  data,
}) => {
  const [selectedTest, setSelectedTest] = useState(data.test || "");
  const [scores, setScores] = useState<Record<string, string>>(() =>
    data?.test ? { [data.test]: data.score || "" } : {}
  );
  const [dates, setDates] = useState<Record<string, string>>(() =>
    data?.test && data?.examDate ? { [data.test]: data.examDate } : {}
  );
  const [errors, setErrors] = useState({ test: false, score: false });

  useEffect(() => {
    if (data?.test) {
      setSelectedTest(data.test);
      setScores((p) => ({ ...p, [data.test]: data.score || "" }));
      if (data.examDate)
        setDates((p) => ({ ...p, [data.test]: data.examDate! }));
    }
  }, [data]);

  const requiresScore =
    selectedTest && !NO_SCORE_VALUES.includes(selectedTest as any);
  const currentScore = scores[selectedTest] || "";
  const currentDate = dates[selectedTest] || "";

  const setCurrentScore = (v: string) =>
    setScores((p) => ({ ...p, [selectedTest]: v }));
  const setCurrentDate = (v: string) =>
    setDates((p) => ({ ...p, [selectedTest]: v }));

  const handleNext = () => {
    const newErrors = {
      test: !selectedTest,
      score: requiresScore && !currentScore,
    };
    setErrors(newErrors);
    if (newErrors.test || newErrors.score) return;

    if (!requiresScore) return onNext({ test: selectedTest, score: "" });

    const payload: any = { test: selectedTest, score: currentScore };
    if (currentDate) payload.examDate = currentDate; // تاریخ اختیاری برای همه تست‌ها
    onNext(payload);
  };

  const handlePrevious = () => onNext({ type: "back" });

  const renderFieldsFor = (testValue: string) => {
    if (NO_SCORE_VALUES.includes(testValue as any)) return null;
    if (selectedTest !== testValue) return null;

    const meta = SCORE_META[testValue] || {
      placeholder: `Enter your ${testValue} score`,
    };

    return (
      <div className="mt-3 border border-dashed rounded-lg p-4">
        <Label className="block mb-2">Your Score for {testValue}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${testValue}_score`} className="text-xs">
              {testValue} Score
            </Label>
            <Input
              id={`${testValue}_score`}
              type="number"
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
              placeholder={meta.placeholder}
              className={[
                errors.score ? "border-red-500 dark:border-red-500" : "",

                "[appearance:textfield]",
                "[&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none",
              ].join(" ")}
            />
            {errors.score && (
              <p className="text-red-500 text-sm mt-1">
                Please enter your {testValue} score
              </p>
            )}
          </div>

          <div>
            <Label htmlFor={`${testValue}_date`} className="text-xs">
              Date of exam
            </Label>
            <Input
              id={`${testValue}_date`}
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className={[
                // تم لایت/دارک برای کنترل‌های تاریخ
                "bg-white text-gray-900 border-gray-300",
                "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "focus-visible:ring-2 focus-visible:ring-indigo-500",
                // رنگ ویجت نِیتیو تاریخ در دارک/لایت
                "[color-scheme:light] dark:[color-scheme:dark]",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.15 } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              variants={iconAnimation}
              initial="hidden"
              animate="show"
              className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
            >
              <Languages className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Language Proficiency
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Most international programs require proof of language proficiency.
            Let us know what tests you've taken.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Have you taken any language proficiency tests?</Label>
            <RadioGroup
              value={selectedTest}
              onValueChange={setSelectedTest}
              className="space-y-3"
            >
              {languageTests.map((test) => (
                <div key={test.value} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={test.value} id={test.value} />
                    <Label htmlFor={test.value} className="cursor-pointer">
                      {test.label}
                    </Label>
                  </div>
                  {renderFieldsFor(test.value)}
                </div>
              ))}
            </RadioGroup>
            {errors.test && (
              <p className="text-red-500 text-sm">Please select an option</p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handlePrevious} className="px-8">
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LanguageProficiency;
