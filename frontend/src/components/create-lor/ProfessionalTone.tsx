import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "../../hooks/use-toast";

const ProfessionalTone = () => {
  const [textToAnalyze, setTextToAnalyze] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sample issues for demonstration
  const informalExample = {
    original:
      "Jane is a good kid, who always gets her work done on time. She's pretty smart, and does a great job on assignments.",
    suggestion:
      "Jane is a diligent student who consistently submits assignments by their deadlines. She demonstrates strong analytical abilities and produces exemplary work throughout her coursework.",
  };

  const vagueExample = {
    original:
      "Jane has many skills that will make her successful. She is very good at programming and works well with others.",
    suggestion:
      "Jane possesses a diverse set of technical and interpersonal skills that will serve her well in graduate studies. She has demonstrated proficiency in Python, Java, and C++, developing a machine learning application that effectively facilitated collaboration among cross-functional team members.",
  };

  const handleAnalyzeText = () => {
    if (!textToAnalyze.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis processing
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      toast({
        title: "Analysis Complete",
        description: "Your text has been analyzed for professional tone.",
        variant: "default",
      });
    }, 1500);
  };

  const handleAcceptRevision = (issue: string) => {
    toast({
      title: "Revision Accepted",
      description: `The suggested ${issue} revision has been applied.`,
      variant: "default",
    });
  };

  const handleIgnore = (issue: string) => {
    toast({
      title: "Suggestion Ignored",
      description: `The ${issue} suggestion has been dismissed.`,
      variant: "default",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Professional Tone Suggestions
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Our AI analyzes your LOR for tone and formality, suggesting
          improvements to maintain a professional voice.
        </p>
      </div>

      {showResults ? (
        <div className="space-y-6">
          {/* Informal Language Issue */}
          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-100/40 dark:bg-amber-900/20 px-4 py-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Informal Language Detected
              </span>
            </div>
            <div className="p-4 bg-amber-50/50 dark:bg-transparent text-amber-800 dark:text-amber-100">
              {informalExample.original}
            </div>
            <div className="p-4 border-t border-amber-200">
              <div className="font-medium text-green-700 dark:text-green-400 mb-2">
                Suggested Revision
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-100 rounded">
                {informalExample.suggestion}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => handleIgnore("informal language")}
                  variant="outline"
                  size="sm"
                >
                  Ignore
                </Button>
                <Button
                  onClick={() => handleAcceptRevision("informal language")}
                  variant="default"
                  size="sm"
                >
                  Accept Revision
                </Button>
              </div>
            </div>
          </div>

          {/* Vague Statements Issue */}
          <div className="border border-amber-200 rounded-lg overflow-hidden">
            <div className="bg-amber-100/40 dark:bg-amber-900/20 px-4 py-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-500 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Vague Statements Detected
              </span>
            </div>
            <div className="p-4 bg-amber-50/50 dark:bg-transparent text-amber-800 dark:text-amber-100">
              {vagueExample.original}
            </div>
            <div className="p-4 border-t border-amber-200">
              <div className="font-medium text-green-700 dark:text-green-400 mb-2">
                Suggested Revision
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-900/20 text-green-800 dark:text-green-100 rounded">
                {vagueExample.suggestion}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => handleIgnore("vague statements")}
                  variant="outline"
                  size="sm"
                >
                  Ignore
                </Button>
                <Button
                  onClick={() => handleAcceptRevision("vague statements")}
                  variant="default"
                  size="sm"
                >
                  Accept Revision
                </Button>
              </div>
            </div>
          </div>

          {/* Text Analysis Section */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-8">
            <h3 className="text-lg font-medium mb-4">Analyze Your Own Text</h3>
            <Textarea
              placeholder="Paste any section of your LOR here to get professional tone suggestions..."
              rows={6}
              value={textToAnalyze}
              onChange={(e) => setTextToAnalyze(e.target.value)}
              className="mb-4"
            />
            <Button
              onClick={handleAnalyzeText}
              disabled={isAnalyzing}
              className="w-full md:w-auto"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Text"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your LOR text here to analyze its tone and receive professional language suggestions..."
            rows={8}
            value={textToAnalyze}
            onChange={(e) => setTextToAnalyze(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={handleAnalyzeText}
            disabled={isAnalyzing}
            className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white mb-4"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Tone"}
          </Button>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Tone Analysis Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Paste your LOR above to see professional tone analysis results
              here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalTone;
