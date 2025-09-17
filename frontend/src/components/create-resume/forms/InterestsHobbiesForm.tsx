import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { InterestsHobbiesData } from "../../../types/resumeTypes";

interface InterestsHobbiesFormProps {
  initialData: string; // Raw JSON string or plain text
  onSave: (data: InterestsHobbiesData) => void;
  onCancel: () => void;
}

const InterestsHobbiesForm: React.FC<InterestsHobbiesFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [hobbiesText, setHobbiesText] = useState<string>(() => {
    try {
      const parsed = JSON.parse(initialData);
      return Array.isArray(parsed.hobbies) ? parsed.hobbies.join("\n") : "";
    } catch (e) {
      if (typeof initialData === "string" && initialData.includes(",")) {
        return initialData
          .split(",")
          .map((s) => s.trim())
          .join("\n");
      }
      return initialData;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hobbiesArray = hobbiesText
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    onSave({ hobbies: hobbiesArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="hobbies">Interests and Hobbies (one per line)</Label>
        <Textarea
          id="hobbies"
          name="hobbies"
          value={hobbiesText}
          onChange={(e) => setHobbiesText(e.target.value)}
          rows={6}
          placeholder="e.g., Artificial Intelligence and Machine Learning&#10;Competitive Programming and Hackathons"
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

export default InterestsHobbiesForm;
