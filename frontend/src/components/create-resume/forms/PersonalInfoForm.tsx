import React, { useState } from "react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { PersonalInfoData } from "../../../types/resumeTypes"; // Adjust path as necessary

interface PersonalInfoFormProps {
  initialData: string; // Raw JSON string from currentEditingResume.sections.header
  onSave: (data: PersonalInfoData) => void;
  onCancel: () => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  // Initialize state with parsed JSON data or default empty values
  const [formData, setFormData] = useState<PersonalInfoData>(() => {
    try {
      const parsed = JSON.parse(initialData);
      return {
        name: parsed.name || "",
        address: parsed.address || "",
        email: parsed.email || "",
        site: parsed.site || "",
      };
    } catch (e) {
      console.error("Failed to parse initial Personal Info data:", e);
      // Fallback to empty data if parsing fails (e.g., initialData is empty string or invalid JSON)
      return { name: "", address: "", email: "", site: "" };
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Vahab Mohammadi"
        />
      </div>
      <div>
        <Label htmlFor="address">Address & Contact Info</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          placeholder="e.g., 456 Code Street, Tech City, USA | Denver, CO 87654 | (789) 123-6540"
        />
      </div>
      <div>
        <Label htmlFor="email">Email & Professional Social Media</Label>
        <Textarea
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          rows={3}
          placeholder="e.g., vahabmohammadi74@gmail.com | linkedin.com/in/vahabmohammadi"
        />
      </div>
      <div>
        <Label htmlFor="site">Website/Portfolio Link (Optional)</Label>
        <Input
          id="site"
          name="site"
          value={formData.site}
          onChange={handleChange}
          placeholder="e.g., yourwebsite.com"
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

export default PersonalInfoForm;
