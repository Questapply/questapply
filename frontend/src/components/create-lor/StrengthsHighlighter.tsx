import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const StrengthsHighlighter = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    academicStrength: "",
    academicAchievement: "",
    leadershipExample: "",
    teamworkSkill: "",
    personalQualities: "",
    challengeExample: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleGenerateSummary = () => {
    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Strengths Summary Generated",
        description: "Your strengths summary has been successfully generated.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-xl font-semibold">
              Highlight Student Strengths
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Answer these questions to help identify and articulate the student's
            key strengths for your letter.
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem
            value="academic"
            className="border bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white">
                  1
                </div>
                <h3 className="text-lg font-medium">Academic Excellence</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="academicStrength">
                    What is the student's greatest academic strength?
                  </Label>
                  <Input
                    id="academicStrength"
                    value={formData.academicStrength}
                    onChange={handleChange}
                    placeholder="E.g., analytical thinking, research methodology"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="academicAchievement">
                    Describe a specific academic achievement that stands out:
                  </Label>
                  <Textarea
                    id="academicAchievement"
                    value={formData.academicAchievement}
                    onChange={handleChange}
                    placeholder="E.g., Their research paper on quantum computing was published in..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="leadership"
            className="border bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm mt-3"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
                  2
                </div>
                <h3 className="text-lg font-medium">Leadership & Teamwork</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="leadershipExample">
                    Provide an example of the student's leadership abilities:
                  </Label>
                  <Textarea
                    id="leadershipExample"
                    value={formData.leadershipExample}
                    onChange={handleChange}
                    placeholder="E.g., Led a team of 5 students to complete..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="teamworkSkill">
                    How does the student contribute in team settings?
                  </Label>
                  <Textarea
                    id="teamworkSkill"
                    value={formData.teamworkSkill}
                    onChange={handleChange}
                    placeholder="E.g., Always ensures all team members are heard and incorporated in decisions..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="character"
            className="border bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm mt-3"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white">
                  3
                </div>
                <h3 className="text-lg font-medium">Character & Work Ethic</h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-4 pt-2">
                <div>
                  <Label htmlFor="personalQualities">
                    What personal qualities make this student exceptional?
                  </Label>
                  <Input
                    id="personalQualities"
                    value={formData.personalQualities}
                    onChange={handleChange}
                    placeholder="E.g., perseverance, integrity, curiosity"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="challengeExample">
                    Describe how the student overcame a significant challenge:
                  </Label>
                  <Textarea
                    id="challengeExample"
                    value={formData.challengeExample}
                    onChange={handleChange}
                    placeholder="E.g., When faced with a setback in their research, they..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="pt-4">
          <Button
            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Strengths Summary"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StrengthsHighlighter;
