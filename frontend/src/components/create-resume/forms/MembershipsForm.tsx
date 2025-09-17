import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { MembershipItem } from "../../../types/resumeTypes";

interface MembershipsFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: MembershipItem[]) => void;
  onCancel: () => void;
}

const MembershipsForm: React.FC<MembershipsFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [membershipItems, setMembershipItems] = useState<MembershipItem[]>(
    () => {
      try {
        const parsed = JSON.parse(initialData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to parse initial Memberships data:", e);
        return [];
      }
    }
  );

  const handleChange = (
    index: number,
    field: keyof MembershipItem,
    value: string
  ) => {
    const updatedItems = [...membershipItems];
    updatedItems[index][field] = value;
    setMembershipItems(updatedItems);
  };

  const handleAddItem = () => {
    setMembershipItems([
      ...membershipItems,
      { organization: "", duration: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setMembershipItems(membershipItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(membershipItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {membershipItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No membership entries. Click "Add Entry" to begin!
        </p>
      )}
      {membershipItems.map((item, index) => (
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
            <Label htmlFor={`organization-${index}`}>Organization</Label>
            <Input
              id={`organization-${index}`}
              name="organization"
              value={item.organization}
              onChange={(e) =>
                handleChange(index, "organization", e.target.value)
              }
              placeholder="e.g., IEEE"
            />
          </div>
          <div>
            <Label htmlFor={`duration-${index}`}>Duration</Label>
            <Input
              id={`duration-${index}`}
              name="duration"
              value={item.duration}
              onChange={(e) => handleChange(index, "duration", e.target.value)}
              placeholder="e.g., September 2022 – Present"
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

export default MembershipsForm;
