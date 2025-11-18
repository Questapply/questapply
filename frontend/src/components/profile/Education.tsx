import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { School, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SingleEdu {
  degree: string;
  university: string;
  major: string;
  gpa: string;
  start?: string;
  end?: string;
}
interface EducationProps {
  onNext: (data: any) => void;
  data:
    | SingleEdu
    | {
        degree: string;
        university: string;
        major: string;
        gpa: string;
        startYear?: string;
        endYear?: string;
      }
    | {
        items?: {
          degree: string;
          university: string;
          major: string;
          gpa: string;
          startYear?: string;
          endYear?: string;
        }[];
      }
    | Array<{
        degree: string;
        university: string;
        major: string;
        gpa: string;
        startYear?: string;
        endYear?: string;
      }>;
}

const degreeOptions = [
  "High School Diploma",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Degree (MD, JD, etc.)",
  "Other",
];

const toLocal = (x: any): SingleEdu => ({
  degree: x?.degree || "",
  university: x?.university || "",
  major: x?.major || "",
  gpa: x?.gpa || "",
  start: x?.start ?? x?.startYear ?? "",
  end: x?.end ?? x?.endYear ?? "",
});

const Education: React.FC<EducationProps> = ({ onNext, data }) => {
  // ---------- derive initial blocks from props ----------
  const initialBlocks: SingleEdu[] = useMemo(() => {
    if (Array.isArray(data)) {
      return (data as any[]).map(toLocal);
    }
    if (data && typeof data === "object" && "items" in (data as any)) {
      const arr = ((data as any).items || []) as any[];
      return arr.length ? arr.map(toLocal) : [toLocal({})];
    }
    if (data && typeof data === "object") {
      return [toLocal(data)];
    }
    return [toLocal({})];
  }, [data]);

  const [items, setItems] = useState<SingleEdu[]>(
    initialBlocks.length ? initialBlocks : [toLocal({})]
  );

  // ← مهم: وقتی از والد برگشتی و data عوض شد، state را sync کن
  useEffect(() => {
    const next = initialBlocks.length ? initialBlocks : [toLocal({})];
    setItems(next);
    setErrors(
      next.map(() => ({
        degree: false,
        university: false,
        major: false,
        gpa: false,
        start: false,
        end: false,
      }))
    );
  }, [initialBlocks]);
  useEffect(() => {
    console.log("[Education] props.data (from parent):", data);
    console.log("[Education] derived initialBlocks:", initialBlocks);
    setItems(
      initialBlocks.length
        ? initialBlocks
        : [
            {
              degree: "",
              university: "",
              major: "",
              gpa: "",
              start: "",
              end: "",
            },
          ]
    );
  }, [initialBlocks, data]);

  const blankErr = {
    degree: false,
    university: false,
    major: false,
    gpa: false,
    start: false,
    end: false,
  };
  const [errors, setErrors] = useState<
    {
      degree: boolean;
      university: boolean;
      major: boolean;
      gpa: boolean;
      start: boolean;
      end: boolean;
    }[]
  >(items.map(() => ({ ...blankErr })));

  const updateField = (idx: number, key: keyof SingleEdu, value: string) => {
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const addBlock = () => {
    setItems((prev) => [...prev, toLocal({})]);
    setErrors((prev) => [...prev, { ...blankErr }]);
  };

  const removeBlock = (idx: number) => {
    if (idx <= 0) return; // بلاک اول حذف نشود
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setErrors((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    const newErr = items.map((it) => ({
      degree: !it.degree,
      university: !it.university,
      major: !it.major,
      gpa: !it.gpa,
      start: !it.start,
      end: !it.end,
    }));
    setErrors(newErr);
    if (newErr.some((e) => Object.values(e).some(Boolean))) return;

    const normalized = items.map((it) => ({
      degree: it.degree,
      university: it.university,
      major: it.major,
      gpa: it.gpa,
      // برای سازگاری با بک‌اند
      start: it.start || "",
      end: it.end || "",
      // برای سازگاری با تایپ‌های داخلی/والد
      startYear: it.start || "",
      endYear: it.end || "",
    }));
    onNext({ items: normalized }); // ← همیشه آرایه
  };

  const handlePrevious = () => onNext({ type: "back" });

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  const iconAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
    },
  };

  return (
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              variants={iconAnimation}
              className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
            >
              <School className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Educational Background
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            <strong>Note:</strong> Please list every educational institution
            where you were — or are currently — enrolled in an undergraduate,
            graduate, or high school program
          </p>
        </motion.div>

        {/* Blocks */}
        {items.map((it, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="space-y-6 border rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Education #{idx + 1}
              </span>
              {idx > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBlock(idx)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Degree */}
              <div className="space-y-2">
                <Label htmlFor={`degree-${idx}`}>What was your degree?</Label>
                <Select
                  value={it.degree}
                  onValueChange={(v) => updateField(idx, "degree", v)}
                >
                  <SelectTrigger
                    id={`degree-${idx}`}
                    className={`w-full ${
                      errors[idx]?.degree
                        ? "border-red-500 dark:border-red-500"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select your most recent degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[idx]?.degree && (
                  <p className="text-red-500 text-sm">
                    Please select your degree
                  </p>
                )}
              </div>

              {/* University */}
              <div className="space-y-2">
                <Label htmlFor={`university-${idx}`}>
                  Which university did you attend?
                </Label>
                <Input
                  id={`university-${idx}`}
                  value={it.university}
                  onChange={(e) =>
                    updateField(idx, "university", e.target.value)
                  }
                  placeholder="Enter university name"
                  className={
                    errors[idx]?.university
                      ? "border-red-500 dark:border-red-500"
                      : ""
                  }
                />
                {errors[idx]?.university && (
                  <p className="text-red-500 text-sm">
                    Please enter your university
                  </p>
                )}
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label htmlFor={`major-${idx}`}>
                  What was your major/field of study?
                </Label>
                <Input
                  id={`major-${idx}`}
                  value={it.major}
                  onChange={(e) => updateField(idx, "major", e.target.value)}
                  placeholder="Enter your major"
                  className={
                    errors[idx]?.major
                      ? "border-red-500 dark:border-red-500"
                      : ""
                  }
                />
                {errors[idx]?.major && (
                  <p className="text-red-500 text-sm">
                    Please enter your major
                  </p>
                )}
              </div>

              {/* GPA */}
              <div className="space-y-2">
                <Label htmlFor={`gpa-${idx}`}>
                  What was your GPA? (out of 4.0)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`gpa-${idx}`}
                    value={it.gpa}
                    onChange={(e) => updateField(idx, "gpa", e.target.value)}
                    placeholder="Enter your GPA (e.g., 3.5)"
                    className={
                      errors[idx]?.gpa
                        ? "border-red-500 dark:border-red-500"
                        : ""
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "https://www.scholaro.com/gpa-calculator/",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="shrink-0 rounded-md px-3  text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    GPA Calculator
                  </button>
                </div>
                {errors[idx]?.gpa && (
                  <p className="text-red-500 text-sm">Please enter your GPA</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor={`start-${idx}`}>Start date / year</Label>
                <Input
                  id={`start-${idx}`}
                  value={it.start || ""}
                  onChange={(e) => updateField(idx, "start", e.target.value)}
                  placeholder="Start year (e.g., 2020)"
                  className={
                    errors[idx]?.start
                      ? "border-red-500 dark:border-red-500"
                      : ""
                  }
                />
                {errors[idx]?.start && (
                  <p className="text-red-500 text-sm">
                    Please enter start date
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`end-${idx}`}>End date / year</Label>
                <Input
                  id={`end-${idx}`}
                  value={it.end || ""}
                  onChange={(e) => updateField(idx, "end", e.target.value)}
                  placeholder="End year (e.g., 2024)"
                  className={
                    errors[idx]?.end ? "border-red-500 dark:border-red-500" : ""
                  }
                />
                {errors[idx]?.end && (
                  <p className="text-red-500 text-sm">Please enter end date</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex justify-between pt-6"
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrevious} className="px-8">
              Back
            </Button>
            <Button
              type="button"
              onClick={addBlock}
              variant="outline"
              className="px-6"
              title="Add another education block"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Education;
