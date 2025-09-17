import React from "react";
import { Badge } from "../ui/badge";
import { Download, Edit, Trash2 } from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastUpdated: string;
  status: "Verified" | "Draft" | "In Review";
}

const CreatedDocuments = () => {
  const documents: Document[] = [
    {
      id: "1",
      name: "Statement of Purpose - CS",
      type: "PDF",
      size: "1.2 MB",
      lastUpdated: "11/9/2023",
      status: "Verified",
    },
    {
      id: "2",
      name: "Resume - Software Engineer",
      type: "PDF",
      size: "850 KB",
      lastUpdated: "11/14/2023",
      status: "Verified",
    },
    {
      id: "3",
      name: "Letter of Recommendation - Prof. Smith",
      type: "DOCX",
      size: "900 KB",
      lastUpdated: "11/12/2023",
      status: "Draft",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            Verified
          </Badge>
        );
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "In Review":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            In Review
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Created Documents
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Documents that our team has created for your application.
        </p>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                      {doc.type === "PDF" ? "📄" : "📝"}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {doc.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Last updated: {doc.lastUpdated}</span>
                      <span>Size: {doc.size}</span>
                      <span>Type: {doc.type}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreatedDocuments;
