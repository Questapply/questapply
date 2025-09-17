import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { EducationItem } from "../../../types/resumeTypes";

interface EducationFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: EducationItem[]) => void;
  onCancel: () => void;
}

const EducationForm: React.FC<EducationFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>(() => {
    try {
      const parsed = JSON.parse(initialData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse initial Education data:", e);
      return [];
    }
  });

  const handleChange = (
    index: number,
    field: keyof EducationItem,
    value: string
  ) => {
    const updatedItems = [...educationItems];
    updatedItems[index][field] = value;
    setEducationItems(updatedItems);
  };

  const handleAddItem = () => {
    setEducationItems([
      ...educationItems,
      { duration: "", degree: "", institution: "", dissertation: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEducationItems(educationItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(educationItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {educationItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No education entries. Click "Add Entry" to begin!
        </p>
      )}
      {educationItems.map((item, index) => (
        <div
          key={index}
          className="border p-4 rounded-md shadow-sm space-y-3 relative bg-gray-50 dark:bg-gray-700"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveItem(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            <XCircle className="w-5 h-5" />
          </Button>
          <div>
            <Label htmlFor={`duration-${index}`}>Duration</Label>
            <Input
              id={`duration-${index}`}
              name="duration"
              value={item.duration}
              onChange={(e) => handleChange(index, "duration", e.target.value)}
              placeholder="e.g., June 2021 - Sep 2025"
            />
          </div>
          <div>
            <Label htmlFor={`degree-${index}`}>Degree</Label>
            <Input
              id={`degree-${index}`}
              name="degree"
              value={item.degree}
              onChange={(e) => handleChange(index, "degree", e.target.value)}
              placeholder="e.g., Ph.D. In Computer Science"
            />
          </div>
          <div>
            <Label htmlFor={`institution-${index}`}>Institution</Label>
            <Input
              id={`institution-${index}`}
              name="institution"
              value={item.institution}
              onChange={(e) =>
                handleChange(index, "institution", e.target.value)
              }
              placeholder="e.g., MIT University"
            />
          </div>
          <div>
            <Label htmlFor={`dissertation-${index}`}>
              Dissertation (Optional)
            </Label>
            <Textarea
              id={`dissertation-${index}`}
              name="dissertation"
              value={item.dissertation || ""}
              onChange={(e) =>
                handleChange(index, "dissertation", e.target.value)
              }
              rows={2}
              placeholder="e.g., Dissertation: 'AI Algorithms for Enhancing Cybersecurity applications'"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddItem}
        className="w-full"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Add Entry
      </Button>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default EducationForm;
