import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const AIHumanizer = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [formalityLevel, setFormalityLevel] = useState("professional");
  const [personality, setPersonality] = useState("balanced");
  const [specificity, setSpecificity] = useState("balanced");

  const handleHumanizeText = () => {
    if (!inputText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter or upload some text to humanize.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      // Example humanized output based on the input
      const humanizedExample = `It is with great pleasure and enthusiasm that I write this letter of recommendation for Jane Smith, whom I have had the privilege of knowing for the past three years as her professor of Advanced Computer Science at University College.

Jane has consistently impressed me with her exceptional analytical abilities and intellectual curiosity. I recall a particular instance during our Neural Networks seminar when she posed a thoughtful question that fundamentally shifted our class discussion. Her ability to connect theoretical concepts with practical applications demonstrates a depth of understanding that is rare among undergraduate students.

Beyond her academic prowess, Jane has shown remarkable leadership qualities. When our department faced challenges with the annual student hackathon, she voluntarily stepped in to coordinate teams and manage resources. The event was ultimately a success, largely due to her organizational skills and calm demeanor under pressure.`;

      setOutputText(humanizedExample);
      setIsProcessing(false);
      toast({
        title: "Text Humanized",
        description: "Your text has been successfully humanized.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Humanizer</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Make your recommendation letter sound more natural and personal while
          maintaining professionalism.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Input</h3>

          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/30">
            <p className="font-medium mb-2">Upload LOR Document</p>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-gray-500 mb-1">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supported formats: .docx, .pdf, .rtf (Max 5MB)
                </p>
              </div>
            </div>

            <Button variant="outline" className="mt-2 w-full">
              Browse Files
            </Button>
          </div>

          <div>
            <p className="font-medium mb-2">Or Paste LOR Text</p>
            <Textarea
              placeholder="Paste your letter text here..."
              className="min-h-[200px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <Button
            onClick={handleHumanizeText}
            disabled={isProcessing}
            className="w-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Humanize Text</span>
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Output</h3>
          <Textarea
            className="min-h-[420px] bg-gray-50 dark:bg-gray-800/30"
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder="Humanized text will appear here..."
            readOnly={!outputText}
          />

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" disabled={!outputText}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Text
            </Button>

            <Button variant="outline" className="flex-1" disabled={!outputText}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download as Document
            </Button>
          </div>
        </div>
      </div>

      <Card className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/20 border-none">
        <h3 className="text-lg font-semibold mb-4">Humanizer Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">Formality Level</p>
            <Select value={formalityLevel} onValueChange={setFormalityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select formality level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Personality</p>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger>
                <SelectValue placeholder="Select personality style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Specificity</p>
            <Select value={specificity} onValueChange={setSpecificity}>
              <SelectTrigger>
                <SelectValue placeholder="Select specificity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIHumanizer;
