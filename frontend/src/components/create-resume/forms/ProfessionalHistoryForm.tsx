import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { ProfessionalHistoryItem } from "../../../types/resumeTypes";

type ProfessionalHistorySaveData = Array<[string, string, string, string[]]>;

interface ProfessionalHistoryFormProps {
  initialData: string;
  onSave: (data: ProfessionalHistorySaveData) => void;
  onCancel: () => void;
}
const ProfessionalHistoryForm: React.FC<ProfessionalHistoryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [historyItems, setHistoryItems] = useState<ProfessionalHistoryItem[]>(
    () => {
      try {
        const parsed: Array<Array<string | string[]>> = JSON.parse(initialData);
        return Array.isArray(parsed)
          ? parsed.map((itemArray: [string, string, string, string[]]) => ({
              duration: typeof itemArray[0] === "string" ? itemArray[0] : "",
              title: typeof itemArray[1] === "string" ? itemArray[1] : "",
              location: typeof itemArray[2] === "string" ? itemArray[2] : "",
              responsibilities: Array.isArray(itemArray[3])
                ? itemArray[3]
                : [""],
            }))
          : [];
      } catch (e) {
        console.error("Failed to parse initial Professional History data:", e);
        return [];
      }
    }
  );

  const handleChange = (
    index: number,
    field: keyof ProfessionalHistoryItem,
    inputValue: string
  ) => {
    const updatedItems = [...historyItems];

    if (field === "responsibilities") {
      updatedItems[index].responsibilities = inputValue
        .split("\n")
        .filter((line) => line.trim() !== "");
    } else {
      updatedItems[index][field] = inputValue;
    }
    setHistoryItems(updatedItems);
  };

  const handleAddItem = () => {
    setHistoryItems([
      ...historyItems,
      { duration: "", title: "", location: "", responsibilities: [""] },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setHistoryItems(historyItems.filter((_, i) => i !== index));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDataForSave: ProfessionalHistorySaveData = historyItems.map(
      (item) => [
        item.duration,
        item.title,
        item.location,
        item.responsibilities,
      ]
    );
    onSave(formattedDataForSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {historyItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No professional history entries. Click "Add Entry" to begin!
        </p>
      )}
      {historyItems.map((item, index) => (
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
              placeholder="e.g., May 2018 - May 2020"
            />
          </div>
          <div>
            <Label htmlFor={`title-${index}`}>Title</Label>
            <Input
              id={`title-${index}`}
              name="title"
              value={item.title}
              onChange={(e) => handleChange(index, "title", e.target.value)}
              placeholder="e.g., Computer Science Research Assistant"
            />
          </div>
          <div>
            <Label htmlFor={`location-${index}`}>Location / Organization</Label>
            <Input
              id={`location-${index}`}
              name="location"
              value={item.location}
              onChange={(e) => handleChange(index, "location", e.target.value)}
              placeholder="e.g., Tech University, Tech city, USA"
            />
          </div>
          <div>
            <Label htmlFor={`responsibilities-${index}`}>
              Responsibilities (one per line)
            </Label>
            <Textarea
              id={`responsibilities-${index}`}
              name="responsibilities"
              value={
                Array.isArray(item.responsibilities)
                  ? item.responsibilities.join("\n")
                  : ""
              }
              onChange={(e) =>
                handleChange(index, "responsibilities", e.target.value)
              }
              rows={4}
              placeholder="e.g., Conducted research on AI Algorithms for Cybersecurity."
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

export default ProfessionalHistoryForm;
