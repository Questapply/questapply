// components/dashboard/sections/resume/forms/PublicationsForm.tsx
import React, { useState } from "react";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { PublicationItem } from "../../../types/resumeTypes";

interface PublicationsFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: PublicationItem[]) => void;
  onCancel: () => void;
}

const PublicationsForm: React.FC<PublicationsFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [publicationItems, setPublicationItems] = useState<PublicationItem[]>(
    () => {
      try {
        const parsed = JSON.parse(initialData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse initial Publications data:", e);
        return [];
      }
    }
  );

  const handleChange = (index: number, value: string) => {
    const updatedItems = [...publicationItems];
    updatedItems[index] = { text: value };
    setPublicationItems(updatedItems);
  };

  const handleAddItem = () => {
    setPublicationItems([...publicationItems, { text: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    setPublicationItems(publicationItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(publicationItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {publicationItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No publications entries. Click "Add Entry" to begin!
        </p>
      )}
      {publicationItems.map((item, index) => (
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
            <Label htmlFor={`publication-${index}`}>Publication Text</Label>
            <Textarea
              id={`publication-${index}`}
              name="text"
              value={item.text}
              onChange={(e) => handleChange(index, e.target.value)}
              rows={3}
              placeholder="e.g., Brown,j., & Green, A.(2025). 'AI Algorithms for Enhancing Cybersecurity Measures,' Computer Science Journal, 33(4), 78-102"
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

export default PublicationsForm;
