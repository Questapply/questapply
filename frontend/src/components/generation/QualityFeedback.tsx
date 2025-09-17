import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Target,
  Lightbulb,
  FileText,
} from "lucide-react";
import { QualityScore, DocumentSection } from "../../utils/QualityAssessment";

interface QualityFeedbackProps {
  score: QualityScore;
  sections: DocumentSection[];
  documentType: "sop" | "cv";
}

const QualityFeedback: React.FC<QualityFeedbackProps> = ({
  score,
  sections,
  documentType,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60)
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Score
            </CardTitle>
            <div className="flex items-center gap-2">
              {getScoreIcon(score.overall)}
              <span
                className={`text-2xl font-bold ${getScoreColor(score.overall)}`}
              >
                {score.overall}/100
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={score.overall}
            className="h-3"
            style={{
              background: `linear-gradient(to right, ${getProgressColor(
                score.overall
              )} 0%, ${getProgressColor(score.overall)} ${
                score.overall
              }%, #e5e7eb ${score.overall}%, #e5e7eb 100%)`,
            }}
          />
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(score.breakdown).map(([category, value]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="capitalize font-medium">{category}</span>
              <div className="flex items-center gap-2">
                <Progress value={value} className="w-24 h-2" />
                <span
                  className={`text-sm font-semibold w-8 ${getScoreColor(
                    value
                  )}`}
                >
                  {value}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completeness Checker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Completeness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center gap-2">
                {section.present ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">{section.name}</span>
                {section.required && !section.present && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {section.present && (
                  <>
                    <Progress value={section.quality} className="w-16 h-1" />
                    <span className="text-xs text-gray-500">
                      {section.quality}%
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      {score.weaknesses.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {score.strengths.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Lightbulb className="h-5 w-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {score.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QualityFeedback;
