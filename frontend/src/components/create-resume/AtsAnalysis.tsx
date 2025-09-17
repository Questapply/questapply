import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  FileSearch,
  Check,
  AlertCircle,
  FileText,
  BarChart2,
  Search,
  Upload,
} from "lucide-react";
import StatCircle from "../ui/stat-circle";
import { Progress } from "../ui/progress";

interface AtsScore {
  overall: number;
  format: number;
  keywords: number;
  clarity: number;
  readability: number;
}

interface Keyword {
  word: string;
  count: number;
  importance: "high" | "medium" | "low";
}

interface AtsIssue {
  type: "error" | "warning";
  message: string;
  section: string;
  suggestion: string;
}

const AtsAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(true); // Set to true for demonstration

  const [atsScore, setAtsScore] = useState<AtsScore>({
    overall: 78,
    format: 90,
    keywords: 65,
    clarity: 85,
    readability: 72,
  });

  const [keywords, setKeywords] = useState<Keyword[]>([
    { word: "Research", count: 8, importance: "high" },
    { word: "Analysis", count: 5, importance: "high" },
    { word: "Publications", count: 4, importance: "medium" },
    { word: "Leadership", count: 2, importance: "high" },
    { word: "Python", count: 3, importance: "medium" },
    { word: "Data visualization", count: 1, importance: "medium" },
    { word: "Neuroscience", count: 6, importance: "high" },
    { word: "Collaboration", count: 3, importance: "low" },
  ]);

  const [issues, setIssues] = useState<AtsIssue[]>([
    {
      type: "error",
      message: "Complex formatting detected",
      section: "Overall Document",
      suggestion:
        "Remove tables, headers, footers, and images that ATS systems cannot parse properly.",
    },
    {
      type: "warning",
      message: "Missing key technical skills",
      section: "Skills Section",
      suggestion:
        "Add more relevant technical skills such as 'data analysis' and 'statistical methods'.",
    },
    {
      type: "warning",
      message: "Inconsistent job titles",
      section: "Experience Section",
      suggestion:
        "Standardize job titles to ensure consistency throughout your resume.",
    },
    {
      type: "error",
      message: "Excessive bullet points",
      section: "Experience Section",
      suggestion:
        "Limit bullet points to 4-6 per role, focusing on achievements rather than responsibilities.",
    },
  ]);

  const startAnalysis = () => {
    setIsAnalyzing(true);

    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
    }, 2500);
  };

  const optimizeResume = () => {
    // This would implement the suggested changes in a real app
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          ATS Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Optimize your resume to pass through Applicant Tracking Systems used
          by universities and employers.
        </p>
      </motion.div>

      {!isAnalyzed && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
            <FileSearch className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analyze Your Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
            Upload your resume to scan it for ATS compatibility and receive
            optimization suggestions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={startAnalysis}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>
            <Button variant="outline" onClick={startAnalysis}>
              <Search className="mr-2 h-4 w-4" />
              Analyze Current Resume
            </Button>
          </div>
        </motion.div>
      )}

      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 mb-6 relative">
            <motion.div
              className="w-20 h-20 border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 dark:border-t-purple-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <FileSearch className="h-10 w-10 text-purple-600 dark:text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analyzing Your Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We're scanning your resume for ATS compatibility issues...
          </p>
          <div className="w-full max-w-md">
            <Progress value={65} className="h-2 bg-gray-200 dark:bg-gray-700" />
          </div>
        </motion.div>
      )}

      {isAnalyzed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ATS Score
                    </h3>
                    <StatCircle
                      value={atsScore.overall}
                      label="Overall Score"
                      size="md"
                      color={
                        atsScore.overall >= 80
                          ? "green"
                          : atsScore.overall >= 60
                          ? "yellow"
                          : "red"
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Format
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {atsScore.format}%
                        </span>
                      </div>
                      <Progress value={atsScore.format} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Keywords
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {atsScore.keywords}%
                        </span>
                      </div>
                      <Progress value={atsScore.keywords} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Clarity
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {atsScore.clarity}%
                        </span>
                      </div>
                      <Progress value={atsScore.clarity} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Readability
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {atsScore.readability}%
                        </span>
                      </div>
                      <Progress value={atsScore.readability} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-6">
                    <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Keyword Analysis
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {keywords.map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 dark:text-gray-100">
                              {keyword.word}
                            </span>
                            <span
                              className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                keyword.importance === "high"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : keyword.importance === "medium"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {keyword.importance}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {keyword.count}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(keyword.count * 10, 100)}
                          className="h-1.5"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      High-importance keywords should appear 3-5 times
                      throughout your resume for optimal ATS performance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ATS Compatibility Issues
                    </h3>
                  </div>
                  <div className="text-sm">
                    <span className="text-red-500 font-medium mr-2">
                      {issues.filter((i) => i.type === "error").length} Errors
                    </span>
                    <span className="text-amber-500 font-medium">
                      {issues.filter((i) => i.type === "warning").length}{" "}
                      Warnings
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {issues.map((issue, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start">
                        <div
                          className={`flex-shrink-0 mt-0.5 ${
                            issue.type === "error"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {issue.type === "error" ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4
                            className={`text-base font-medium ${
                              issue.type === "error"
                                ? "text-red-800 dark:text-red-400"
                                : "text-amber-800 dark:text-amber-400"
                            }`}
                          >
                            {issue.message}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Section:</span>{" "}
                            {issue.section}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Suggestion:</span>{" "}
                            {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Download Report
                  </Button>
                  <Button
                    onClick={optimizeResume}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Apply All Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    ATS Tip
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Most university application systems prefer simple, clean
                    formatting with standard section headers and chronological
                    ordering of experience. Focus on content over design.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AtsAnalysis;
