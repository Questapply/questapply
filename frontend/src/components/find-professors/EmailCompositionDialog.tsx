import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailCompositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professorName: string;
  professorEmail: string;
  defaultTemplate?: string;
  isReminder?: boolean;
  onCreateByExpert?: () => void;
}

const EmailCompositionDialog = ({
  open,
  onOpenChange,
  professorName,
  professorEmail,
  defaultTemplate,
  isReminder = false,
  onCreateByExpert,
}: EmailCompositionDialogProps) => {
  const [emailContent, setEmailContent] = useState(
    defaultTemplate || generateDefaultTemplate(professorName, isReminder)
  );
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  const handleSaveEmail = () => {
    // In a real app, we would save this to a database
    toast.success(
      `Email ${isReminder ? "reminder " : ""}draft saved for ${professorName}`
    );
  };

  const handleSendEmail = () => {
    // In a real app, we would send this email
    toast.success(
      `Email ${
        isReminder ? "reminder " : ""
      }sent to ${professorName} (${professorEmail})`
    );
    onOpenChange(false);
  };

  const handleCreateByExpert = () => {
    if (onCreateByExpert) {
      onCreateByExpert();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[#0D1117]">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isReminder
              ? `Send Reminder to ${professorName}`
              : `Email to ${professorName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="border-none rounded-md bg-transparent p-2">
          <div className="flex flex-col space-y-2 text-sm">
            <div className="flex items-center">
              <span className="w-16 font-medium text-gray-300">To:</span>
              <span className="text-gray-400">{professorEmail}</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 font-medium text-gray-300">Subject:</span>
              <span className="text-gray-400">
                {isReminder
                  ? "Following up on previous communication"
                  : "Research Interest and Application Inquiry"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center gap-4 p-1 border-b border-gray-700">
            <button className="p-1.5 rounded hover:bg-gray-800" title="Bold">
              <span className="font-bold text-white">B</span>
            </button>
            <button className="p-1.5 rounded hover:bg-gray-800" title="Italic">
              <span className="italic text-white">I</span>
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-800"
              title="Underline"
            >
              <span className="underline text-white">U</span>
            </button>
            <button className="p-1.5 rounded hover:bg-gray-800" title="Quote">
              <span className="font-serif text-white">"</span>
            </button>
            <button
              className="p-1.5 rounded hover:bg-gray-800"
              title="Bulleted list"
            >
              <span className="text-white">•</span>
            </button>
          </div>
          <Textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            className="min-h-[300px] font-sans text-sm bg-gray-900 text-white border-gray-700"
          />
          <div className="text-xs text-right text-gray-500">
            {emailContent.length} characters
          </div>
        </div>

        <DialogFooter>
          {!isReminder && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleCreateByExpert}
              disabled={isGeneratingEmail}
            >
              <span className="text-purple-400">👨‍🎓</span>
              Create by Our Expert
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 bg-transparent border-gray-600 hover:bg-gray-800 text-white"
            onClick={handleSaveEmail}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button
            className="gap-2 bg-indigo-500 hover:bg-indigo-600 border-none"
            onClick={handleSendEmail}
          >
            <Send className="h-4 w-4" />
            {isReminder ? "Send Email Reminder" : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCompositionDialog;

// Helper function to generate default email templates
function generateDefaultTemplate(
  professorName: string,
  isReminder: boolean
): string {
  if (isReminder) {
    return `Dear Professor ${professorName},

I hope this email finds you well. I am writing to follow up on my previous email regarding my interest in joining your research team.

I understand that you must be very busy, but I wanted to check if you had a chance to review my application and materials.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]`;
  }

  return `Dear Professor ${professorName},

I hope this email finds you well. My name is [Enter Your Full Name], and I am writing to express my strong interest in joining the [Enter the Ph.D. program] at Princeton University.

I have completed my undergraduate studies with a GPA of [Enter your undergraduate GPA] and my graduate studies with a GPA of [Enter your graduate GPA]. My research interests align closely with your work in [Enter the specific research area], which I have followed and admired through your publications.

I have published several papers in [Enter the journal names or conferences], and I am eager to contribute to your research team. Attached, please find my CV and copies of my publications for your review.

Could you please let me know if you are currently looking for a Ph.D. student under your supervision? I would be thrilled to discuss how my background, skills, and research interests might align with your current projects.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]`;
}
