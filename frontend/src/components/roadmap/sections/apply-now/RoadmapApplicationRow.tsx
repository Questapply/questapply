import React from "react";
import { Badge } from "../../../ui/badge";
import { Progress } from "../../../ui/progress";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, X } from "lucide-react";
import { TableCell, TableRow } from "../../../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";

interface ApplicationRowProps {
  application: any;
  handleApplyYourself: (applicationId: number) => void;
  handleSubmitWithUs: (applicationId: number) => void;
}

const RoadmapApplicationRow = ({
  application,
  handleApplyYourself,
  handleSubmitWithUs,
}: ApplicationRowProps) => {
  // Status styling
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      interested: "bg-blue-500",
      planning: "bg-purple-500",
      applying: "bg-yellow-500",
      applied: "bg-green-500",
      waitlisted: "bg-orange-500",
      accepted: "bg-emerald-500",
      denied: "bg-red-500",
      enrolled: "bg-blue-600",
    };
    return statusMap[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      interested: "Interested",
      planning: "Planning to Apply",
      applying: "Applying",
      applied: "Applied",
      waitlisted: "Waitlisted",
      accepted: "Accepted",
      denied: "Denied",
      enrolled: "Enrolled",
    };
    return statusMap[status] || "Unknown";
  };

  return (
    <TableRow className="border-b border-gray-200 dark:border-gray-700">
      <TableCell>
        <div className="flex items-center gap-3">
          <motion.img
            src={application.logo}
            alt={`${application.school} logo`}
            className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          <div>
            <div className="flex items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {application.program}
              </span>
              <Badge className="ml-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {application.degree}
              </Badge>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {application.school}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm">
        {application.deadline}
      </TableCell>

      <TableCell className="text-gray-700 dark:text-gray-300">
        {application.applicationFees}
      </TableCell>

      <TableCell>
        {application.eligibility ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <X className="w-6 h-6 text-red-500" />
        )}
      </TableCell>

      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <Progress
                  value={application.admissionFitPercentage}
                  className="w-24 h-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {application.admissionFit}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Admission Fit Score: {application.admissionFitPercentage}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      <TableCell>
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${getStatusColor(
                application.status
              )}`}
            />
            {getStatusLabel(application.status)}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex gap-2">
          <motion.button
            className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20 border px-2 py-1 rounded text-sm flex items-center"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleApplyYourself(application.id)}
          >
            <span className="h-4 w-4 mr-1">👤</span>
            Apply Yourself
          </motion.button>
          <motion.button
            className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20 border px-2 py-1 rounded text-sm flex items-center"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSubmitWithUs(application.id)}
          >
            <span className="h-4 w-4 mr-1">📤</span>
            Submit with Us
          </motion.button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RoadmapApplicationRow;
