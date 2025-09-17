// components/dashboard/sections/resume/forms/CertificationsSkillsForm.tsx
import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { PlusCircle, XCircle } from "lucide-react";
import { CertificationSkillItem } from "@/types/resumeTypes";

interface CertificationsSkillsFormProps {
  initialData: string; // Raw JSON string representing array of items
  onSave: (data: CertificationSkillItem[]) => void;
  onCancel: () => void;
}

const CertificationsSkillsForm: React.FC<CertificationsSkillsFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [certSkillItems, setCertSkillItems] = useState<
    CertificationSkillItem[]
  >(() => {
    try {
      const parsed = JSON.parse(initialData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(
        "Failed to parse initial Certifications and Skills data:",
        e
      );
      return [];
    }
  });

  const handleChange = (
    index: number,
    field: keyof CertificationSkillItem,
    value: string
  ) => {
    const updatedItems = [...certSkillItems];
    if (field === "skills") {
      updatedItems[index][field] = value
        .split("\n")
        .filter((line) => line.trim() !== "");
    } else {
      updatedItems[index][field] = value;
    }
    setCertSkillItems(updatedItems);
  };

  const handleAddItem = () => {
    setCertSkillItems([...certSkillItems, { certification: "", skills: [""] }]);
  };

  const handleRemoveItem = (index: number) => {
    setCertSkillItems(certSkillItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(certSkillItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {certSkillItems.length === 0 && (
        <p className="text-gray-500 text-center">
          No certifications or skills entries. Click "Add Entry" to begin!
        </p>
      )}
      {certSkillItems.map((item, index) => (
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
            <Label htmlFor={`certification-${index}`}>
              Certification/Course
            </Label>
            <Input
              id={`certification-${index}`}
              name="certification"
              value={item.certification}
              onChange={(e) =>
                handleChange(index, "certification", e.target.value)
              }
              placeholder="e.g., Certified Information Systems Professional (CISSP)"
            />
          </div>
          <div>
            <Label htmlFor={`skills-${index}`}>
              Associated Skills (one per line)
            </Label>
            <Textarea
              id={`skills-${index}`}
              name="skills"
              value={item.skills.join("\n")}
              onChange={(e) => handleChange(index, "skills", e.target.value)}
              rows={4}
              placeholder="e.g., Proficient in Python, Java, C++&#10;Experienced in machine learning and AI development"
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

export default CertificationsSkillsForm;
