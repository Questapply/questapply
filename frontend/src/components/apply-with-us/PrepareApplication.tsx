import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Filter, Calendar, Bell } from "lucide-react";

interface Application {
  id: string;
  program: string;
  university: string;
  status: "submitted" | "pending" | "accepted" | "rejected";
  deadline: string;
  submissionDate: string;
  documentsCompleted: number;
  totalDocuments: number;
}

const PrepareApplication = () => {
  const [activeTab, setActiveTab] = useState("all");

  const applications: Application[] = [
    {
      id: "1",
      program: "MS in Computer Science",
      university: "Stanford University",
      status: "submitted",
      deadline: "12/14/2023",
      submissionDate: "11/29/2023",
      documentsCompleted: 4,
      totalDocuments: 4,
    },
    {
      id: "2",
      program: "MS in Data Science",
      university: "Massachusetts Institute of Technology",
      status: "pending",
      deadline: "11/30/2023",
      submissionDate: "Not yet submitted",
      documentsCompleted: 2,
      totalDocuments: 4,
    },
    {
      id: "3",
      program: "PhD in Artificial Intelligence",
      university: "University of California, Berkeley",
      status: "pending",
      deadline: "01/15/2024",
      submissionDate: "Not yet submitted",
      documentsCompleted: 3,
      totalDocuments: 5,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            Submitted
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "all", label: "All Applications" },
    { id: "submitted", label: "Submitted" },
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Prepare Application
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and track your application preparation progress.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search applications..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Deadlines
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Alerts
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-16 bg-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {application.program}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {application.university}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(application.status)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Deadline
                </span>
                <p className="text-gray-900 dark:text-white">
                  {application.deadline}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Submission Date
                </span>
                <p className="text-gray-900 dark:text-white">
                  {application.submissionDate}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Documents
                </span>
                <p className="text-gray-900 dark:text-white">
                  {application.documentsCompleted} /{" "}
                  {application.totalDocuments} completed
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrepareApplication;
