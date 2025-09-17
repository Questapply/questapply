// components/dashboard/sections/resume/forms/ResearchInterestsForm.tsx
import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { ResearchInterestsData } from "../../../types/resumeTypes";

interface ResearchInterestsFormProps {
  initialData: string; // Raw JSON string or plain text
  onSave: (data: ResearchInterestsData) => void;
  onCancel: () => void;
}

const ResearchInterestsForm: React.FC<ResearchInterestsFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [interestsText, setInterestsText] = useState<string>(() => {
    try {
      const parsed = JSON.parse(initialData);
      return Array.isArray(parsed.interests) ? parsed.interests.join("\n") : "";
    } catch (e) {
      // If it's not valid JSON, assume it's raw text and try to split by common separators
      if (typeof initialData === "string" && initialData.includes(",")) {
        return initialData
          .split(",")
          .map((s) => s.trim())
          .join("\n");
      }
      return initialData; // Fallback to raw data
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Split by newline, trim each line, and filter out empty lines
    const interestsArray = interestsText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onSave({ interests: interestsArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="interests">Research Interests (one per line)</Label>
        <Textarea
          id="interests"
          name="interests"
          value={interestsText}
          onChange={(e) => setInterestsText(e.target.value)}
          rows={6}
          placeholder="e.g., Artificial Intelligence&#10;Machine Learning&#10;Cybersecurity"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default ResearchInterestsForm;
