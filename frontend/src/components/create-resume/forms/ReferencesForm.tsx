import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { ReferenceItem } from "../../../types/resumeTypes";

interface ReferencesFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: ReferenceItem[]) => void;
  onCancel: () => void;
}

const ReferencesForm: React.FC<ReferencesFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [referenceItems, setReferenceItems] = useState<ReferenceItem[]>(() => {
    try {
      const parsed = JSON.parse(initialData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse initial References data:", e);
      return [];
    }
  });

  const handleChange = (
    index: number,
    field: keyof ReferenceItem,
    value: string
  ) => {
    const updatedItems = [...referenceItems];
    updatedItems[index][field] = value;
    setReferenceItems(updatedItems);
  };

  const handleAddItem = () => {
    setReferenceItems([
      ...referenceItems,
      { nameTitle: "", organization: "", contact: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setReferenceItems(referenceItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(referenceItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {referenceItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No reference entries. Click "Add Entry" to begin!
        </p>
      )}
      {referenceItems.map((item, index) => (
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
            <Label htmlFor={`nameTitle-${index}`}>Name & Title</Label>
            <Input
              id={`nameTitle-${index}`}
              name="nameTitle"
              value={item.nameTitle}
              onChange={(e) => handleChange(index, "nameTitle", e.target.value)}
              placeholder="e.g., Dr. Sarah Thompson - Associate Professor"
            />
          </div>
          <div>
            <Label htmlFor={`organization-${index}`}>Organization</Label>
            <Input
              id={`organization-${index}`}
              name="organization"
              value={item.organization}
              onChange={(e) =>
                handleChange(index, "organization", e.target.value)
              }
              placeholder="e.g., Department of Computer Science, MIT"
            />
          </div>
          <div>
            <Label htmlFor={`contact-${index}`}>Contact (Email/Phone)</Label>
            <Input
              id={`contact-${index}`}
              name="contact"
              value={item.contact}
              onChange={(e) => handleChange(index, "contact", e.target.value)}
              placeholder="e.g., +1 (617) 253-1234 - sarah.thompson@mit.edu"
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

export default ReferencesForm;
