import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "../../hooks/use-toast";

const AIImprovement = () => {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  // Example LORs for demonstration
  const examples = {
    generalAssessment: {
      original:
        "I have known Jane Smith for three years as her professor. She's a good student who works hard and gets good grades in my class.",
      improved:
        "I have had the privilege of knowing Jane Smith for the past three years in my capacity as her professor of Advanced Computer Systems. Throughout this time, Jane has consistently demonstrated exceptional analytical ability, creative problem-solving skills, and intellectual curiosity that distinguishes her among her peers.",
    },
    comparisonWithPeers: {
      original:
        "Jane is better than many students I've taught. She ranks high in her class.",
      improved:
        "In my fifteen years of teaching at University College, I can confidently place Jane in the top 5% of students I have encountered. Her academic performance consistently exceeds that of her classmates, and her contributions to class discussions demonstrate a depth of understanding rarely seen at the undergraduate level.",
    },
  };

  const handleAcceptSuggestion = (section: string) => {
    toast({
      title: "Suggestion Accepted",
      description: `The improved ${section} has been applied.`,
      variant: "default",
    });
  };

  const handleDecline = (section: string) => {
    toast({
      title: "Suggestion Declined",
      description: `The ${section} suggestion has been dismissed.`,
      variant: "default",
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes Saved",
      description: "All accepted improvements have been applied to your LOR.",
      variant: "default",
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">AI Improvement</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Select one of your LORs to improve with AI suggestions.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Assessment Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">General Assessment</h3>

          <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
            <p>{examples.generalAssessment.original}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
            <h4 className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
              AI Suggestion
            </h4>
            <p className="text-gray-800 dark:text-gray-200">
              {examples.generalAssessment.improved}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => handleDecline("general assessment")}
              variant="outline"
              size="sm"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleAcceptSuggestion("general assessment")}
              variant="default"
              size="sm"
            >
              Accept Suggestion
            </Button>
          </div>
        </div>

        {/* Comparison with Peers Section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Comparison with Peers</h3>

          <div className="border border-gray-200 dark:border-gray-700 rounded p-3 mb-4">
            <p>{examples.comparisonWithPeers.original}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
            <h4 className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
              AI Suggestion
            </h4>
            <p className="text-gray-800 dark:text-gray-200">
              {examples.comparisonWithPeers.improved}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => handleDecline("comparison with peers")}
              variant="outline"
              size="sm"
            >
              Decline
            </Button>
            <Button
              onClick={() => handleAcceptSuggestion("comparison with peers")}
              variant="default"
              size="sm"
            >
              Accept Suggestion
            </Button>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            onClick={handleSaveChanges}
            className="bg-teal-500 hover:bg-teal-600"
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIImprovement;
