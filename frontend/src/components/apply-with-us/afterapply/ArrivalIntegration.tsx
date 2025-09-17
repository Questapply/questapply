
import React, { useState } from "react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Progress } from "../../ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plane,
  MapPin,
  User,
  GraduationCap,
  Users,
  Coffee,
  Phone,
  Calendar,
  CheckSquare,
  MessageSquare,
  Navigation,
  Home,
  CreditCard,
  FileText,
  Heart
} from "lucide-react";

interface IntegrationTask {
  id: string;
  name: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "scheduled";
  scheduledDate?: string;
  category: "arrival" | "setup" | "academic" | "social" | "orientation" | "support";
  priority: "high" | "medium" | "low";
}

interface ArrivalProgram {
  id: string;
  university: string;
  program: string;
  country: string;
  city: string;
  arrivalDate: string;
  orientationDate: string;
  overallProgress: number;
  tasks: IntegrationTask[];
}

const ArrivalIntegration = () => {
  const [arrivalPrograms] = useState<ArrivalProgram[]>([
    {
      id: "1",
      university: "MIT",
      program: "PhD Artificial Intelligence",
      country: "United States",
      city: "Boston, MA",
      arrivalDate: "2024-08-10",
      orientationDate: "2024-08-15",
      overallProgress: 45,
      tasks: [
        {
          id: "1",
          name: "Airport Pickup Coordination",
          description: "Arrange pickup from Logan International Airport",
          status: "scheduled",
          scheduledDate: "2024-08-10",
          category: "arrival",
          priority: "high"
        },
        {
          id: "2",
          name: "Student ID Card",
          description: "Obtain MIT student identification card",
          status: "pending",
          category: "setup",
          priority: "high"
        },
        {
          id: "3",
          name: "Social Security Number",
          description: "Apply for SSN at local office",
          status: "pending",
          category: "setup",
          priority: "high"
        },
        {
          id: "4",
          name: "Academic Advisor Meeting",
          description: "First meeting with PhD supervisor",
          status: "scheduled",
          scheduledDate: "2024-08-18",
          category: "academic",
          priority: "high"
        },
        {
          id: "5",
          name: "International Student Orientation",
          description: "Attend mandatory international student orientation",
          status: "scheduled",
          scheduledDate: "2024-08-15",
          category: "orientation",
          priority: "high"
        },
        {
          id: "6",
          name: "Library Access Setup",
          description: "Activate library access and research databases",
          status: "pending",
          category: "setup",
          priority: "medium"
        },
        {
          id: "7",
          name: "Graduate Student Groups",
          description: "Join relevant PhD and international student groups",
          status: "pending",
          category: "social",
          priority: "medium"
        },
        {
          id: "8",
          name: "Campus Tour",
          description: "Complete comprehensive campus and city orientation",
          status: "scheduled",
          scheduledDate: "2024-08-16",
          category: "orientation",
          priority: "medium"
        },
        {
          id: "9",
          name: "30-Day Check-in",
          description: "First follow-up support session",
          status: "scheduled",
          scheduledDate: "2024-09-10",
          category: "support",
          priority: "low"
        }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"><Calendar className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "arrival":
        return <Plane className="h-4 w-4" />;
      case "setup":
        return <FileText className="h-4 w-4" />;
      case "academic":
        return <GraduationCap className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "orientation":
        return <MapPin className="h-4 w-4" />;
      case "support":
        return <Heart className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getDaysUntilDate = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Arrival & Integration</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Seamlessly integrate into your new academic and social environment with guided support.
        </p>
      </div>

      {arrivalPrograms.map((program) => {
        const completedTasks = program.tasks.filter(t => t.status === "completed").length;
        const totalTasks = program.tasks.length;
        const scheduledTasks = program.tasks.filter(t => t.status === "scheduled").length;
        const highPriorityPending = program.tasks.filter(t => t.priority === "high" && t.status !== "completed").length;

        return (
          <Card key={program.id} className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{program.university}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">{program.program}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {program.city}, {program.country}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Arrival: {new Date(program.arrivalDate).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{completedTasks}/{totalTasks}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{scheduledTasks}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{highPriorityPending}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{getDaysUntilDate(program.arrivalDate)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Days to Arrival</p>
                </div>
                <div className="text-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{program.overallProgress}%</span>
                    </div>
                    <Progress value={program.overallProgress} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Timeline View */}
              <div className="space-y-4">
                <h4 className="font-medium">Integration Timeline</h4>
                
                {/* Arrival Phase */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <Plane className="h-4 w-4 text-blue-500" />
                    Arrival & Initial Setup
                  </h5>
                  <div className="space-y-2 ml-6">
                    {program.tasks.filter(task => ["arrival", "setup"].includes(task.category)).map((task) => (
                      <Card key={task.id} className="border border-gray-100 dark:border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div>
                                  <h6 className="font-medium text-sm">{task.name}</h6>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{task.description}</p>
                                </div>
                              </div>
                              
                              {task.scheduledDate && (
                                <div className="flex items-center gap-2 ml-8">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs">
                                    {task.status === "scheduled" ? "Scheduled: " : "Due: "}{new Date(task.scheduledDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Academic Integration */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-green-500" />
                    Academic Integration
                  </h5>
                  <div className="space-y-2 ml-6">
                    {program.tasks.filter(task => task.category === "academic").map((task) => (
                      <Card key={task.id} className="border border-gray-100 dark:border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div>
                                  <h6 className="font-medium text-sm">{task.name}</h6>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{task.description}</p>
                                </div>
                              </div>
                              
                              {task.scheduledDate && (
                                <div className="flex items-center gap-2 ml-8">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs">
                                    {task.status === "scheduled" ? "Scheduled: " : "Due: "}{new Date(task.scheduledDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Social & Support */}
                <div className="space-y-2">
                  <h5 className="font-medium text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Social Integration & Support
                  </h5>
                  <div className="space-y-2 ml-6">
                    {program.tasks.filter(task => ["social", "orientation", "support"].includes(task.category)).map((task) => (
                      <Card key={task.id} className="border border-gray-100 dark:border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {getCategoryIcon(task.category)}
                                </div>
                                <div>
                                  <h6 className="font-medium text-sm">{task.name}</h6>
                                  <p className="text-xs text-gray-600 dark:text-gray-300">{task.description}</p>
                                </div>
                              </div>
                              
                              {task.scheduledDate && (
                                <div className="flex items-center gap-2 ml-8">
                                  <Calendar className="h-3 w-3 text-gray-500" />
                                  <span className="text-xs">
                                    {task.status === "scheduled" ? "Scheduled: " : "Due: "}{new Date(task.scheduledDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Integration Assistant
                </Button>
                <Button size="sm" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Campus Map
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Contacts
                </Button>
                <Button size="sm" variant="outline">
                  <Coffee className="h-4 w-4 mr-2" />
                  Student Groups
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ArrivalIntegration;
