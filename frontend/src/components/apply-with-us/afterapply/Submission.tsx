import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Upload,
  CreditCard,
  Send,
  Eye,
  Download,
} from "lucide-react";

interface Application {
  id: string;
  university: string;
  program: string;
  deadline: string;
  status: "pending" | "submitted" | "in-progress" | "overdue";
  applicationFee: number;
  feePaid: boolean;
  documents: {
    name: string;
    uploaded: boolean;
    required: boolean;
  }[];
  submissionProgress: number;
  confirmationId?: string;
}

const Submission = () => {
  const [applications] = useState<Application[]>([
    {
      id: "1",
      university: "Stanford University",
      program: "MS Computer Science",
      deadline: "2023-12-15",
      status: "in-progress",
      applicationFee: 125,
      feePaid: true,
      documents: [
        { name: "Transcripts", uploaded: true, required: true },
        { name: "Statement of Purpose", uploaded: true, required: true },
        { name: "Letters of Recommendation", uploaded: false, required: true },
        { name: "Resume", uploaded: true, required: true },
      ],
      submissionProgress: 75,
    },
    {
      id: "2",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      deadline: "2023-12-01",
      status: "submitted",
      applicationFee: 150,
      feePaid: true,
      documents: [
        { name: "Transcripts", uploaded: true, required: true },
        { name: "Statement of Purpose", uploaded: true, required: true },
        { name: "Letters of Recommendation", uploaded: true, required: true },
        { name: "Resume", uploaded: true, required: true },
      ],
      submissionProgress: 100,
      confirmationId: "MIT-2024-789456",
    },
    {
      id: "3",
      university: "UC Berkeley",
      program: "MS Data Science",
      deadline: "2023-11-30",
      status: "overdue",
      applicationFee: 120,
      feePaid: false,
      documents: [
        { name: "Transcripts", uploaded: true, required: true },
        { name: "Statement of Purpose", uploaded: false, required: true },
        { name: "Letters of Recommendation", uploaded: false, required: true },
        { name: "Resume", uploaded: true, required: true },
      ],
      submissionProgress: 40,
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
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
        return <Badge variant="secondary">Pending</Badge>;
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
          Application Submission
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Track and manage your application submissions across all universities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Applications
                </p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submitted
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    applications.filter((app) => app.status === "submitted")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    applications.filter((app) => app.status === "in-progress")
                      .length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    applications.filter((app) => app.status === "overdue")
                      .length
                  }
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <Card
            key={application.id}
            className="border border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {application.university}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    {application.program}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Deadline and Progress */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Deadline:{" "}
                      {new Date(application.deadline).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-sm ${
                        getDaysUntilDeadline(application.deadline) < 7
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      ({getDaysUntilDeadline(application.deadline)} days left)
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Submission Progress</span>
                      <span>{application.submissionProgress}%</span>
                    </div>
                    <Progress
                      value={application.submissionProgress}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Application Fee: ${application.applicationFee}
                    </span>
                    {application.feePaid ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                        Unpaid
                      </Badge>
                    )}
                  </div>

                  {application.confirmationId && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Confirmation ID: {application.confirmationId}
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Checklist */}
              <div>
                <h4 className="font-medium mb-2">Required Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {application.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {doc.uploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={
                          doc.uploaded
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {doc.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Application
                </Button>

                {application.status !== "submitted" && (
                  <>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>

                    {!application.feePaid && (
                      <Button size="sm" variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Fee
                      </Button>
                    )}

                    {application.submissionProgress === 100 && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit Application
                      </Button>
                    )}
                  </>
                )}

                {application.status === "submitted" && (
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Confirmation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Submission;
