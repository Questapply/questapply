import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

interface EmailQuestionnaireFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professorName: string;
  professorResearch: string[];
  onComplete: (emailTemplate: string) => void;
}

const totalSteps = 6;

const EmailQuestionnaireFlow = ({
  open,
  onOpenChange,
  professorName,
  professorResearch,
  onComplete,
}: EmailQuestionnaireFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    gpa: "",
    paperMention: "",
    reasonForInterest: "",
    fieldOfInterest: "",
    skillsProjects: "",
    fundingRequest: {
      needsFunding: false,
      explanation: "",
    },
  });

  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Generate email
      const generatedEmail = generateEmailFromAnswers();
      onComplete(generatedEmail);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generateEmailFromAnswers = (): string => {
    // In a real app, this would be handled by an AI service
    // This is a simplified template generation

    const {
      gpa,
      paperMention,
      reasonForInterest,
      fieldOfInterest,
      skillsProjects,
      fundingRequest,
    } = answers;

    let email = `Dear Professor ${professorName},

I hope this email finds you well. My name is [Your Name], and I am writing to express my strong interest in joining your research team at your university.

`;

    if (gpa) {
      email += `I have completed my studies with a GPA of ${gpa}, and I am eager to continue my academic journey under your guidance.

`;
    }

    if (paperMention) {
      email += `I was particularly impressed by your paper "${paperMention}", which has significantly influenced my understanding of the field.

`;
    }

    email += `${reasonForInterest}

`;

    if (fieldOfInterest) {
      email += `I am especially interested in ${fieldOfInterest}, which aligns closely with your research focus.

`;
    }

    if (skillsProjects) {
      email += `Through my academic and professional experience, I have developed the following skills and completed relevant projects:

${skillsProjects}

`;
    }

    if (fundingRequest.needsFunding) {
      email += `Regarding funding, ${fundingRequest.explanation}

`;
    }

    email += `I would greatly appreciate the opportunity to discuss how my background and interests might align with your current projects. Please let me know if you would be available for a brief conversation.

Thank you for your time and consideration. I look forward to your response.

Best regards,
[Your Name]`;

    return email;
  };

  const updateAnswer = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Create Expert Email for Professor {professorName}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Step {currentStep}</span>
            <span>of {totalSteps}</span>
          </div>
        </div>

        <div className="py-4">
          {currentStep === 1 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">What's your GPA?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your GPA to help the professor assess your academic
                performance.
              </p>
              <Input
                type="number"
                placeholder="e.g., 3.8"
                min="0"
                max="4.0"
                step="0.01"
                value={answers.gpa}
                onChange={(e) => updateAnswer("gpa", e.target.value)}
                className="max-w-[120px]"
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">
                Any specific paper or research to mention?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mentioning a professor's specific work shows you've done your
                research.
              </p>
              <Input
                placeholder="e.g., Your 2023 paper on quantum computing"
                value={answers.paperMention}
                onChange={(e) => updateAnswer("paperMention", e.target.value)}
              />
              <p className="text-xs text-gray-500">(Optional)</p>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">
                Why are you interested in this professor's work?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explain your genuine interest in their research.
              </p>
              <Textarea
                placeholder="Your reason for interest..."
                value={answers.reasonForInterest}
                onChange={(e) =>
                  updateAnswer("reasonForInterest", e.target.value)
                }
                className="min-h-[100px]"
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">
                Field of Interest / Research Area
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select or enter the research area that interests you most.
              </p>

              {professorResearch.length > 0 ? (
                <Select
                  value={answers.fieldOfInterest}
                  onValueChange={(value) =>
                    updateAnswer("fieldOfInterest", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select research area" />
                  </SelectTrigger>
                  <SelectContent>
                    {professorResearch.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">
                      Other (please specify)
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="e.g., Machine Learning, Quantum Computing"
                  value={answers.fieldOfInterest}
                  onChange={(e) =>
                    updateAnswer("fieldOfInterest", e.target.value)
                  }
                />
              )}

              {answers.fieldOfInterest === "other" && (
                <Input
                  placeholder="Please specify your field of interest"
                  onChange={(e) =>
                    updateAnswer("fieldOfInterest", e.target.value)
                  }
                  className="mt-2"
                />
              )}
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">Your Skills or Projects</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Highlight relevant skills, experience or projects that make you
                a good fit.
              </p>
              <Textarea
                placeholder="List your skills, experiences or relevant projects..."
                value={answers.skillsProjects}
                onChange={(e) => updateAnswer("skillsProjects", e.target.value)}
                className="min-h-[150px]"
              />
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="font-medium text-lg">Funding Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you seeking funding or a specific position?
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="fundingYes"
                    checked={answers.fundingRequest.needsFunding}
                    onChange={(e) =>
                      updateAnswer("fundingRequest", {
                        ...answers.fundingRequest,
                        needsFunding: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="fundingYes" className="text-sm">
                    Yes, I'm seeking funding or a position
                  </label>
                </div>

                {answers.fundingRequest.needsFunding && (
                  <Textarea
                    placeholder="Please provide details about your funding needs or position interest..."
                    value={answers.fundingRequest.explanation}
                    onChange={(e) =>
                      updateAnswer("fundingRequest", {
                        ...answers.fundingRequest,
                        explanation: e.target.value,
                      })
                    }
                    className="min-h-[100px] mt-2"
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex-1 text-center text-sm text-gray-500">
            {currentStep}/{totalSteps}
          </div>

          <Button onClick={handleNext} className="gap-1">
            {currentStep === totalSteps ? (
              <>
                <Check className="h-4 w-4" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailQuestionnaireFlow;
