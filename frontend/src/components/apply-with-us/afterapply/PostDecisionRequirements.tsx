import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Heart,
  Calendar,
  DollarSign,
  Upload,
  Download,
  User,
  Shield,
} from "lucide-react";

interface Requirement {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "overdue";
  deadline: string;
  category: "financial" | "health" | "academic" | "legal" | "housing";
  priority: "high" | "medium" | "low";
}

interface AcceptedProgram {
  id: string;
  university: string;
  program: string;
  acceptedDate: string;
  responseDeadline: string;
  enrollmentDeposit: number;
  depositPaid: boolean;
  requirements: Requirement[];
  overallProgress: number;
}

const PostDecisionRequirements = () => {
  const [acceptedPrograms] = useState<AcceptedProgram[]>([
    {
      id: "1",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      acceptedDate: "2024-02-25",
      responseDeadline: "2024-04-15",
      enrollmentDeposit: 500,
      depositPaid: true,
      overallProgress: 65,
      requirements: [
        {
          id: "1",
          name: "Submit Final Transcripts",
          description: "Official transcripts from all institutions",
          status: "completed",
          deadline: "2024-06-01",
          category: "academic",
          priority: "high",
        },
        {
          id: "2",
          name: "Health Insurance Waiver",
          description:
            "Submit proof of health insurance or enroll in university plan",
          status: "in-progress",
          deadline: "2024-07-15",
          category: "health",
          priority: "high",
        },
        {
          id: "3",
          name: "Immunization Records",
          description: "Complete immunization requirements",
          status: "pending",
          deadline: "2024-07-01",
          category: "health",
          priority: "medium",
        },
        {
          id: "4",
          name: "I-20 Document Request",
          description: "Request I-20 for F-1 visa application",
          status: "completed",
          deadline: "2024-03-15",
          category: "legal",
          priority: "high",
        },
        {
          id: "5",
          name: "Financial Documentation",
          description: "Submit financial statements for I-20",
          status: "completed",
          deadline: "2024-03-15",
          category: "financial",
          priority: "high",
        },
        {
          id: "6",
          name: "Housing Application",
          description: "Apply for on-campus housing",
          status: "overdue",
          deadline: "2024-03-01",
          category: "housing",
          priority: "medium",
        },
      ],
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            Medium
          </Badge>
        );
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "health":
        return <Heart className="h-4 w-4" />;
      case "academic":
        return <FileText className="h-4 w-4" />;
      case "legal":
        return <Shield className="h-4 w-4" />;
      case "housing":
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Post-Decision Requirements
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Complete all required steps for your accepted programs to secure your
          enrollment.
        </p>
      </div>

      {acceptedPrograms.map((program) => {
        const completedReqs = program.requirements.filter(
          (r) => r.status === "completed"
        ).length;
        const totalReqs = program.requirements.length;
        const overdueReqs = program.requirements.filter(
          (r) => r.status === "overdue"
        ).length;
        const highPriorityPending = program.requirements.filter(
          (r) => r.priority === "high" && r.status !== "completed"
        ).length;

        return (
          <Card
            key={program.id}
            className="border border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {program.university}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    {program.program}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Accepted:{" "}
                    {new Date(program.acceptedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      program.depositPaid
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }
                  >
                    Deposit {program.depositPaid ? "Paid" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {completedReqs}/{totalReqs}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {overdueReqs}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overdue
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {highPriorityPending}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    High Priority
                  </p>
                </div>
                <div className="text-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{program.overallProgress}%</span>
                    </div>
                    <Progress value={program.overallProgress} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Requirements List */}
              <div className="space-y-3">
                <h4 className="font-medium">Requirements Checklist</h4>
                {program.requirements.map((req) => (
                  <Card
                    key={req.id}
                    className="border border-gray-100 dark:border-gray-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {getCategoryIcon(req.category)}
                            </div>
                            <div>
                              <h5 className="font-medium">{req.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {req.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 ml-8">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Due:{" "}
                                {new Date(req.deadline).toLocaleDateString()}
                              </span>
                              <span
                                className={`text-sm ${
                                  getDaysUntilDeadline(req.deadline) < 7
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                ({getDaysUntilDeadline(req.deadline)} days left)
                              </span>
                            </div>
                            {getPriorityBadge(req.priority)}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(req.status)}

                          {req.status !== "completed" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </div>
                          )}

                          {req.status === "completed" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Bulk Upload Documents
                </Button>
                <Button size="sm" variant="outline">
                  Download Checklist
                </Button>
                <Button size="sm" variant="outline">
                  Schedule Consultation
                </Button>
                {!program.depositPaid && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay Deposit (${program.enrollmentDeposit})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PostDecisionRequirements;
