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
  Calendar,
  MapPin,
  User,
  Plane,
  Shield,
  Globe,
  Phone,
  CreditCard,
  Upload,
  Download,
  MessageSquare,
  Video,
} from "lucide-react";

interface VisaStep {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "scheduled";
  deadline?: string;
  category: "documentation" | "appointment" | "interview" | "tracking";
}

interface VisaApplication {
  id: string;
  country: string;
  visaType: string;
  university: string;
  applicationDate: string;
  status: "not-started" | "in-progress" | "submitted" | "approved" | "rejected";
  appointmentDate?: string;
  appointmentLocation?: string;
  trackingNumber?: string;
  overallProgress: number;
  steps: VisaStep[];
}

const VisaProcessing = () => {
  const [visaApplications] = useState<VisaApplication[]>([
    {
      id: "1",
      country: "United States",
      visaType: "F-1 Student Visa",
      university: "MIT",
      applicationDate: "2024-03-01",
      status: "in-progress",
      appointmentDate: "2024-04-15",
      appointmentLocation: "US Consulate, Mumbai",
      trackingNumber: "US2024789456",
      overallProgress: 75,
      steps: [
        {
          id: "1",
          name: "I-20 Document Receipt",
          description: "Receive I-20 from university",
          status: "completed",
          deadline: "2024-03-01",
          category: "documentation",
        },
        {
          id: "2",
          name: "DS-160 Form Completion",
          description: "Complete online visa application form",
          status: "completed",
          deadline: "2024-03-10",
          category: "documentation",
        },
        {
          id: "3",
          name: "SEVIS Fee Payment",
          description: "Pay SEVIS I-901 fee online",
          status: "completed",
          deadline: "2024-03-12",
          category: "documentation",
        },
        {
          id: "4",
          name: "Embassy Appointment",
          description: "Schedule visa interview appointment",
          status: "scheduled",
          deadline: "2024-04-15",
          category: "appointment",
        },
        {
          id: "5",
          name: "Document Preparation",
          description: "Prepare all required documents for interview",
          status: "in-progress",
          deadline: "2024-04-10",
          category: "documentation",
        },
        {
          id: "6",
          name: "Mock Interview",
          description: "Complete AI-powered interview preparation",
          status: "pending",
          deadline: "2024-04-12",
          category: "interview",
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
      case "scheduled":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
            <Calendar className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Rejected
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "documentation":
        return <FileText className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "interview":
        return <User className="h-4 w-4" />;
      case "tracking":
        return <MapPin className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Visa Processing
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Complete your visa application process with automated assistance and
          tracking.
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
                <p className="text-2xl font-bold">{visaApplications.length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interviews Scheduled
                </p>
                <p className="text-2xl font-bold text-purple-600">1</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Documents Ready
                </p>
                <p className="text-2xl font-bold text-green-600">3/6</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Processing Time
                </p>
                <p className="text-2xl font-bold text-amber-600">45 days</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visa Applications */}
      <div className="space-y-4">
        {visaApplications.map((application) => (
          <Card
            key={application.id}
            className="border border-gray-200 dark:border-gray-700"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {application.visaType}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    {application.country} - {application.university}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied:{" "}
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Interview Location: {application.appointmentLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Appointment:{" "}
                      {application.appointmentDate
                        ? new Date(
                            application.appointmentDate
                          ).toLocaleDateString()
                        : "Not scheduled"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Tracking: {application.trackingNumber}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{application.overallProgress}%</span>
                    </div>
                    <Progress
                      value={application.overallProgress}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <h4 className="font-medium">Visa Processing Steps</h4>
                {application.steps.map((step) => (
                  <Card
                    key={step.id}
                    className="border border-gray-100 dark:border-gray-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                              {getCategoryIcon(step.category)}
                            </div>
                            <div>
                              <h5 className="font-medium">{step.name}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {step.deadline && (
                            <div className="flex items-center gap-2 ml-8">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">
                                Due:{" "}
                                {new Date(step.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(step.status)}

                          {step.status !== "completed" && (
                            <div className="flex gap-1">
                              {step.category === "documentation" && (
                                <Button size="sm" variant="outline">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              )}
                              {step.category === "appointment" && (
                                <Button size="sm" variant="outline">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Schedule
                                </Button>
                              )}
                              {step.category === "interview" && (
                                <Button size="sm" variant="outline">
                                  <Video className="h-4 w-4 mr-2" />
                                  Practice
                                </Button>
                              )}
                            </div>
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
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Mock Interview
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Document Checklist
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Embassy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VisaProcessing;
