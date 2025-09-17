import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { HonorAwardItem } from "../../../types/resumeTypes";

interface HonorsAwardsFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: HonorAwardItem[]) => void;
  onCancel: () => void;
}

const HonorsAwardsForm: React.FC<HonorsAwardsFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [honorAwardItems, setHonorAwardItems] = useState<HonorAwardItem[]>(
    () => {
      try {
        const parsed = JSON.parse(initialData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse initial Honors and Awards data:", e);
        return [];
      }
    }
  );

  const handleChange = (
    index: number,
    field: keyof HonorAwardItem,
    value: string
  ) => {
    const updatedItems = [...honorAwardItems];
    updatedItems[index][field] = value;
    setHonorAwardItems(updatedItems);
  };

  const handleAddItem = () => {
    setHonorAwardItems([...honorAwardItems, { award: "", issuer: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setHonorAwardItems(honorAwardItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(honorAwardItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {honorAwardItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No honors or awards entries. Click "Add Entry" to begin!
        </p>
      )}
      {honorAwardItems.map((item, index) => (
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
            <Label htmlFor={`award-${index}`}>Award/Honor</Label>
            <Input
              id={`award-${index}`}
              name="award"
              value={item.award}
              onChange={(e) => handleChange(index, "award", e.target.value)}
              placeholder="e.g., Outstanding Dissertation Award"
            />
          </div>
          <div>
            <Label htmlFor={`issuer-${index}`}>Issuer / Date</Label>
            <Input
              id={`issuer-${index}`}
              name="issuer"
              value={item.issuer}
              onChange={(e) => handleChange(index, "issuer", e.target.value)}
              placeholder="e.g., Tech University, May 2024"
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

export default HonorsAwardsForm;
