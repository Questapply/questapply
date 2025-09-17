import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Home,
  Calendar,
  DollarSign,
  GraduationCap,
  User,
  Plane,
  Shield,
  Phone,
  MapPin,
} from "lucide-react";

interface EnrollmentStep {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  deadline?: string;
  category:
    | "enrollment"
    | "housing"
    | "academic"
    | "financial"
    | "travel"
    | "integration";
}

interface EnrollmentProgram {
  id: string;
  university: string;
  program: string;
  startDate: string;
  enrollmentConfirmed: boolean;
  overallProgress: number;
  steps: EnrollmentStep[];
}

const EnrollmentConfirmation = () => {
  const [enrollmentPrograms] = useState<EnrollmentProgram[]>([
    {
      id: "1",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      startDate: "2024-09-03",
      enrollmentConfirmed: false,
      overallProgress: 75,
      steps: [
        {
          id: "1",
          name: "Final Enrollment Confirmation",
          description: "Submit final enrollment confirmation form",
          status: "pending",
          deadline: "2024-05-01",
          category: "enrollment",
        },
        {
          id: "2",
          name: "Housing Assignment",
          description: "Complete housing application and receive assignment",
          status: "completed",
          category: "housing",
        },
        {
          id: "3",
          name: "Course Registration",
          description: "Register for first semester courses",
          status: "in-progress",
          deadline: "2024-07-15",
          category: "academic",
        },
        {
          id: "4",
          name: "Student ID & Email Setup",
          description: "Activate student accounts and obtain ID card",
          status: "pending",
          category: "enrollment",
        },
        {
          id: "5",
          name: "Financial Aid Finalization",
          description: "Complete financial aid paperwork and loan processing",
          status: "completed",
          category: "financial",
        },
        {
          id: "6",
          name: "Health Insurance Enrollment",
          description: "Enroll in student health insurance plan",
          status: "completed",
          category: "financial",
        },
        {
          id: "7",
          name: "Flight Booking",
          description: "Book flights and arrange airport pickup",
          status: "pending",
          deadline: "2024-08-01",
          category: "travel",
        },
        {
          id: "8",
          name: "Pre-Departure Orientation",
          description: "Attend online pre-departure orientation",
          status: "pending",
          deadline: "2024-08-15",
          category: "integration",
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
      case "enrollment":
        return <GraduationCap className="h-4 w-4" />;
      case "housing":
        return <Home className="h-4 w-4" />;
      case "academic":
        return <Calendar className="h-4 w-4" />;
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "travel":
        return <Plane className="h-4 w-4" />;
      case "integration":
        return <User className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "enrollment":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "housing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "academic":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "financial":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400";
      case "travel":
        return "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400";
      case "integration":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilStart = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Enrollment Confirmation
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Finalize your enrollment and prepare for your academic journey.
        </p>
      </div>

      {enrollmentPrograms.map((program) => {
        const completedSteps = program.steps.filter(
          (s) => s.status === "completed"
        ).length;
        const totalSteps = program.steps.length;
        const daysUntilStart = getDaysUntilStart(program.startDate);

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
                    Program Starts:{" "}
                    {new Date(program.startDate).toLocaleDateString()} (
                    {daysUntilStart} days)
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      program.enrollmentConfirmed
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                    }
                  >
                    {program.enrollmentConfirmed
                      ? "Enrollment Confirmed"
                      : "Confirmation Pending"}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {completedSteps}/{totalSteps}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Steps Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {daysUntilStart}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Days Until Start
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

              {/* Quick Actions */}
              {!program.enrollmentConfirmed && (
                <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Ready to Confirm Enrollment?
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Complete all pending steps to confirm your enrollment
                        </p>
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Confirm Enrollment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Steps by Category */}
              <div className="space-y-4">
                <h4 className="font-medium">Enrollment Steps</h4>
                {Object.entries(
                  program.steps.reduce((acc, step) => {
                    if (!acc[step.category]) acc[step.category] = [];
                    acc[step.category].push(step);
                    return acc;
                  }, {} as Record<string, EnrollmentStep[]>)
                ).map(([category, steps]) => (
                  <Card
                    key={category}
                    className="border border-gray-100 dark:border-gray-700"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-lg ${getCategoryColor(
                            category
                          )}`}
                        >
                          {getCategoryIcon(category)}
                        </div>
                        <h5 className="font-medium capitalize">{category}</h5>
                        <Badge variant="secondary">
                          {steps.filter((s) => s.status === "completed").length}
                          /{steps.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <h6 className="font-medium text-sm">{step.name}</h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {step.description}
                            </p>
                            {step.deadline && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Deadline:{" "}
                                {new Date(step.deadline).toLocaleDateString()}
                                {getDaysUntilDeadline(step.deadline) !==
                                  null && (
                                  <span
                                    className={`ml-1 ${
                                      getDaysUntilDeadline(step.deadline)! < 7
                                        ? "text-red-600"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    ({getDaysUntilDeadline(step.deadline)} days
                                    left)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(step.status)}
                            {step.status !== "completed" && (
                              <Button size="sm" variant="outline">
                                Start
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Emergency Contacts & Support */}
              <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
                    Support & Emergency Contacts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">International Office</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          +1 (617) 253-3795
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Emergency Services</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          +1 (617) 253-1212
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Campus Address</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          77 Massachusetts Ave, Cambridge, MA
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Download Pre-Departure Guide
                </Button>
                <Button size="sm" variant="outline">
                  Schedule Advisor Meeting
                </Button>
                <Button size="sm" variant="outline">
                  Join Student Groups
                </Button>
                <Button size="sm" variant="outline">
                  Arrange Airport Pickup
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EnrollmentConfirmation;
