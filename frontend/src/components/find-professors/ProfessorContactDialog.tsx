import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Mail, Clock } from "lucide-react";
import EmailCompositionDialog from "./EmailCompositionDialog";
import EmailQuestionnaireFlow from "./EmailQuestionnaireFlow";

interface Professor {
  id: number;
  name: string;
  title: string;
  email?: string;
  research: string[];
}

interface ProfessorContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professor: Professor;
  isReminder?: boolean;
  directEmailMode?: boolean;
}

const ProfessorContactDialog = ({
  open,
  onOpenChange,
  professor,
  isReminder = false,
  directEmailMode = false,
}: ProfessorContactDialogProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");

  // If isReminder is true, directly show the reminder dialog
  useEffect(() => {
    if (isReminder && open) {
      setReminderDialogOpen(true);
    }

    // If directEmailMode is true, directly show the email dialog
    if (directEmailMode && open) {
      setEmailDialogOpen(true);
    }
  }, [isReminder, directEmailMode, open]);

  const handleCreateEmail = () => {
    setEmailDialogOpen(true);
    onOpenChange(false); // Close this dialog as we're opening the email dialog
  };

  const handleRemind = () => {
    setReminderDialogOpen(true);
    onOpenChange(false); // Close this dialog as we're opening the reminder dialog
  };

  const handleCreateByExpert = () => {
    setEmailDialogOpen(false);
    setQuestionnaireOpen(true);
  };

  const handleQuestionnaireComplete = (generatedEmail: string) => {
    setEmailTemplate(generatedEmail);
    setQuestionnaireOpen(false);
    setEmailDialogOpen(true);
  };

  const professorEmail =
    professor.email ||
    `${professor.name.toLowerCase().replace(/\s+/g, ".")}@university.edu`;

  return (
    <>
      {/* Main Contact Options Dialog */}
      {!isReminder && !directEmailMode && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact Professor {professor.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col space-y-4 py-6">
              <Button
                onClick={handleCreateEmail}
                className="justify-start gap-3"
              >
                <Mail className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div>Create Email</div>
                  <div className="text-xs opacity-70">
                    Draft an email to the professor
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleRemind}
                variant="outline"
                className="justify-start gap-3"
              >
                <Clock className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div>Send Reminder</div>
                  <div className="text-xs opacity-70">
                    Follow up on a previous email
                  </div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Email Composition Dialog */}
      <EmailCompositionDialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) setEmailTemplate("");
        }}
        professorName={professor.name}
        professorEmail={professorEmail}
        defaultTemplate={emailTemplate || undefined}
        onCreateByExpert={handleCreateByExpert}
      />

      {/* Reminder Dialog */}
      <EmailCompositionDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        professorName={professor.name}
        professorEmail={professorEmail}
        isReminder={true}
      />

      {/* Questionnaire Flow Dialog */}
      <EmailQuestionnaireFlow
        open={questionnaireOpen}
        onOpenChange={setQuestionnaireOpen}
        professorName={professor.name}
        professorResearch={professor.research}
        onComplete={handleQuestionnaireComplete}
      />
    </>
  );
};

export default ProfessorContactDialog;
