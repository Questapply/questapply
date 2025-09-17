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
  CreditCard,
  Phone,
  Luggage,
  Globe,
  Users,
  MapPin,
  Calendar,
  Info,
  Download,
  ExternalLink,
  MessageSquare,
  CheckSquare,
} from "lucide-react";

interface PreparationTask {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
  deadline?: string;
  category:
    | "accommodation"
    | "banking"
    | "communication"
    | "packing"
    | "cultural"
    | "emergency";
  priority: "high" | "medium" | "low";
}

interface PreparationProgram {
  id: string;
  university: string;
  program: string;
  country: string;
  city: string;
  startDate: string;
  overallProgress: number;
  tasks: PreparationTask[];
}

const PreDeparturePreparation = () => {
  const [preparationPrograms] = useState<PreparationProgram[]>([
    {
      id: "1",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      country: "United States",
      city: "Boston, MA",
      startDate: "2024-08-15",
      overallProgress: 60,
      tasks: [
        {
          id: "1",
          name: "Off-Campus Housing Search",
          description: "Find and secure off-campus accommodation",
          status: "in-progress",
          deadline: "2024-06-01",
          category: "accommodation",
          priority: "high",
        },
        {
          id: "2",
          name: "International Bank Account",
          description: "Set up US bank account for international students",
          status: "pending",
          deadline: "2024-07-01",
          category: "banking",
          priority: "high",
        },
        {
          id: "3",
          name: "US Phone Plan",
          description: "Choose and activate US mobile phone plan",
          status: "pending",
          deadline: "2024-07-15",
          category: "communication",
          priority: "medium",
        },
        {
          id: "4",
          name: "Climate-Specific Packing",
          description: "Pack according to Boston winter climate",
          status: "pending",
          deadline: "2024-08-01",
          category: "packing",
          priority: "medium",
        },
        {
          id: "5",
          name: "Cultural Orientation",
          description: "Complete US cultural adaptation resources",
          status: "completed",
          deadline: "2024-05-15",
          category: "cultural",
          priority: "low",
        },
        {
          id: "6",
          name: "Emergency Contact Network",
          description: "Establish local emergency contacts and support network",
          status: "pending",
          deadline: "2024-07-20",
          category: "emergency",
          priority: "high",
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
      case "accommodation":
        return <Home className="h-4 w-4" />;
      case "banking":
        return <CreditCard className="h-4 w-4" />;
      case "communication":
        return <Phone className="h-4 w-4" />;
      case "packing":
        return <Luggage className="h-4 w-4" />;
      case "cultural":
        return <Globe className="h-4 w-4" />;
      case "emergency":
        return <Users className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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
          Pre-Departure Preparation
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Prepare for your departure with comprehensive planning and setup
          assistance.
        </p>
      </div>

      {preparationPrograms.map((program) => {
        const completedTasks = program.tasks.filter(
          (t) => t.status === "completed"
        ).length;
        const totalTasks = program.tasks.length;
        const highPriorityPending = program.tasks.filter(
          (t) => t.priority === "high" && t.status !== "completed"
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
                    {program.city}, {program.country} • Starts:{" "}
                    {new Date(program.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {getDaysUntilDeadline(program.startDate)} days to departure
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {completedTasks}/{totalTasks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tasks Completed
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {highPriorityPending}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    High Priority
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">
                    {getDaysUntilDeadline(program.startDate)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Days Left
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

              {/* Category Sections */}
              <div className="space-y-4">
                {[
                  "accommodation",
                  "banking",
                  "communication",
                  "packing",
                  "cultural",
                  "emergency",
                ].map((category) => {
                  const categoryTasks = program.tasks.filter(
                    (task) => task.category === category
                  );
                  if (categoryTasks.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="space-y-2">
                        {categoryTasks.map((task) => (
                          <Card
                            key={task.id}
                            className="border border-gray-100 dark:border-gray-700"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div>
                                      <h5 className="font-medium">
                                        {task.name}
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {task.description}
                                      </p>
                                    </div>
                                  </div>

                                  {task.deadline && (
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">
                                          Due:{" "}
                                          {new Date(
                                            task.deadline
                                          ).toLocaleDateString()}
                                        </span>
                                        <span
                                          className={`text-sm ${
                                            getDaysUntilDeadline(
                                              task.deadline
                                            ) < 7
                                              ? "text-red-600"
                                              : "text-gray-600"
                                          }`}
                                        >
                                          ({getDaysUntilDeadline(task.deadline)}{" "}
                                          days left)
                                        </span>
                                      </div>
                                      {getPriorityBadge(task.priority)}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {getStatusBadge(task.status)}

                                  {task.status !== "completed" && (
                                    <div className="flex gap-1">
                                      {task.category === "accommodation" && (
                                        <Button size="sm" variant="outline">
                                          <Home className="h-4 w-4 mr-2" />
                                          Find Housing
                                        </Button>
                                      )}
                                      {task.category === "banking" && (
                                        <Button size="sm" variant="outline">
                                          <CreditCard className="h-4 w-4 mr-2" />
                                          Bank Setup
                                        </Button>
                                      )}
                                      {task.category === "communication" && (
                                        <Button size="sm" variant="outline">
                                          <Phone className="h-4 w-4 mr-2" />
                                          Phone Plans
                                        </Button>
                                      )}
                                      {task.category === "packing" && (
                                        <Button size="sm" variant="outline">
                                          <CheckSquare className="h-4 w-4 mr-2" />
                                          Checklist
                                        </Button>
                                      )}
                                      {task.category === "cultural" && (
                                        <Button size="sm" variant="outline">
                                          <Globe className="h-4 w-4 mr-2" />
                                          Resources
                                        </Button>
                                      )}
                                      {task.category === "emergency" && (
                                        <Button size="sm" variant="outline">
                                          <Users className="h-4 w-4 mr-2" />
                                          Setup Network
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
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Travel Assistant
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Complete Checklist
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  City Guide
                </Button>
                <Button size="sm" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Local Services
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PreDeparturePreparation;
