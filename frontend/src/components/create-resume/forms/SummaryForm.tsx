import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { SummaryData } from "../../../types/resumeTypes"; // Adjust path

interface SummaryFormProps {
  initialData: string; // Raw JSON string or plain text
  onSave: (data: SummaryData) => void;
  onCancel: () => void;
}

const SummaryForm: React.FC<SummaryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [summaryText, setSummaryText] = useState<string>(() => {
    try {
      // Try to parse if it's a JSON string like {"text": "..."}
      const parsed = JSON.parse(initialData);
      return parsed.text || initialData; // Fallback to raw initialData if 'text' property not found
    } catch (e) {
      // If it's not JSON, assume it's plain text directly
      return initialData;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ text: summaryText }); // Wrap in object as per SummaryData interface
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          name="summary"
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          rows={6}
          placeholder="Write a compelling summary highlighting your key skills and experiences..."
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

export default SummaryForm;
