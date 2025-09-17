import React from "react";
import { motion } from "framer-motion";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

interface ScoreField {
  id: string;
  label: string;
}

interface TestScoreFormProps {
  testId: string;
  description: string;
  scoreFields: ScoreField[];
  scores: Record<string, string>;
  errors: Record<string, boolean>;
  onScoreChange: (testId: string, scoreField: string, value: string) => void;
}

const TestScoreForm: React.FC<TestScoreFormProps> = ({
  testId,
  description,
  scoreFields,
  scores,
  errors,
  onScoreChange,
}) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{ height: 0, opacity: 0, overflow: "hidden" }}
      transition={{ duration: 0.3 }}
      className="mt-3 border border-dashed border-gray-200 dark:border-gray-700 p-4 rounded-md"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label
              htmlFor={`${testId}-${field.id}`}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </Label>
            <Input
              id={`${testId}-${field.id}`}
              value={scores[field.id] || ""}
              onChange={(e) => onScoreChange(testId, field.id, e.target.value)}
              placeholder={`Enter your ${field.label}`}
              className={
                errors?.[field.id] ? "border-red-500 dark:border-red-500" : ""
              }
            />
            {errors?.[field.id] && (
              <p className="text-red-500 text-sm">Required</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TestScoreForm;
