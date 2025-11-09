import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Filter,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NavigationButtons from "../layout/NavigationButtons";



const Applications = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Sample applications data
  const applications = [
    {
      id: 1,
      program: "MS in Computer Science",
      university: "Stanford University",
      deadline: "2023-12-15",
      status: "submitted",
      submissionDate: "2023-11-30",
      documents: ["SOP", "Resume", "Transcripts", "LORs"],
    },
    {
      id: 2,
      program: "MS in Data Science",
      university: "Massachusetts Institute of Technology",
      deadline: "2023-12-01",
      status: "pending",
      submissionDate: null,
      documents: ["SOP", "Resume"],
      missingDocuments: ["Transcripts", "LORs"],
    },
    {
      id: 3,
      program: "PhD in Artificial Intelligence",
      university: "UC Berkeley",
      deadline: "2024-01-05",
      status: "rejected",
      submissionDate: "2023-10-15",
      documents: ["SOP", "Resume", "Transcripts", "LORs", "Research Proposal"],
    },
    {
      id: 4,
      program: "MS in Human-Computer Interaction",
      university: "Carnegie Mellon University",
      deadline: "2023-12-10",
      status: "accepted",
      submissionDate: "2023-11-05",
      documents: ["SOP", "Resume", "Transcripts", "LORs", "Portfolio"],
    },
    {
      id: 5,
      program: "MS in Machine Learning",
      university: "University of Washington",
      deadline: "2024-01-15",
      status: "pending",
      submissionDate: null,
      documents: ["SOP"],
      missingDocuments: ["Resume", "Transcripts", "LORs"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            <Clock className="h-3 w-3 mr-1" /> Submitted
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      
        <NavigationButtons isDarkMode={isDarkMode} />
     
      <div className="space-y-8 mt-4 md:mt-7">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Track My Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor all your submitted applications and track their status.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search applications..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Deadlines</span>
            </Button>
            <Button className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span>Alerts</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2 bg-gradient-to-b from-purple-500 to-blue-500" />
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {app.program}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {app.university}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              {getStatusBadge(app.status)}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Deadline
                              </p>
                              <p className="text-sm">
                                {new Date(app.deadline).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Submission Date
                              </p>
                              <p className="text-sm">
                                {app.submissionDate
                                  ? new Date(
                                      app.submissionDate
                                    ).toLocaleDateString()
                                  : "Not yet submitted"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Documents
                              </p>
                              <p className="text-sm">
                                {app.documents.length} /{" "}
                                {app.documents.length +
                                  (app.missingDocuments?.length || 0)}
                                completed
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {app.status === "pending" && (
                              <Button size="sm">Continue Application</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {["submitted", "pending", "accepted", "rejected"].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="space-y-4">
                {filteredApplications
                  .filter((app) => app.status === status)
                  .map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-2 bg-gradient-to-b from-purple-500 to-blue-500" />
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {app.program}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {app.university}
                                  </p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                  {getStatusBadge(app.status)}
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Deadline
                                  </p>
                                  <p className="text-sm">
                                    {new Date(
                                      app.deadline
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Submission Date
                                  </p>
                                  <p className="text-sm">
                                    {app.submissionDate
                                      ? new Date(
                                          app.submissionDate
                                        ).toLocaleDateString()
                                      : "Not yet submitted"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Documents
                                  </p>
                                  <p className="text-sm">
                                    {app.documents.length} /{" "}
                                    {app.documents.length +
                                      (app.missingDocuments?.length || 0)}
                                    completed
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                {app.status === "pending" && (
                                  <Button size="sm">
                                    Continue Application
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Applications;
