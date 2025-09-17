import React from "react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { TableCell, TableRow } from "../ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import ApplicationStatus from "./ApplicationStatus";
import ApplicationActions from "./ApplicationActions";
import ApplicationDetails from "./ApplicationDetails";

// Define the type for user meta
export interface UserMeta {
  meta_key: string;
  meta_value: unknown; // Use unknown as meta_value type is flexible and requires type checking
}

// Import the ProgramDetail interface from ApplyNow.tsx
import type { ProgramDetail } from "./ApplyNow";

// Define type for application documents
export interface ApplicationDocument {
  name: string;
  status: "not_started" | "in_progress" | "completed" | "applied" | "pending"; // Add pending status
}

interface ApplicationRowProps {
  application: ProgramDetail;
  userMeta: UserMeta | null;
  documents: ApplicationDocument[]; // Add documents prop
  expandedDetails: number[];
  toggleDetails: (applicationId: number) => void;
  handleApplyYourself: (applicationId: number) => void;
  handleSubmitWithUs: (applicationId: number) => void;
  handleStatusChange: (applicationId: number, newStatus: string) => void;
}

const ApplicationRow = (
  props: ApplicationRowProps & { [key: string]: unknown }
) => {
  const {
    application,
    userMeta,
    documents,
    expandedDetails,
    toggleDetails,
    handleApplyYourself,
    handleSubmitWithUs,
    handleStatusChange,
    ...rest // Capture any other props
  } = props;

  const isExpanded = expandedDetails.includes(application.id);
  return (
    <React.Fragment key={application.id}>
      <TableRow className="border-b border-gray-200 dark:border-gray-700 w-full">
        <TableCell className="w-1/3">
          <div className="flex items-center gap-3">
            <motion.img
              src={application.schoolLogo}
              alt={`${application.school} logo`}
              className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  {application.name}
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

        <TableCell className="text-gray-700 dark:text-gray-300 text-center whitespace-pre-line text-sm w-[120px]">
          {/* Render the deadline string directly */}
          {application.deadline || "N/A"}
        </TableCell>

        <TableCell className="text-gray-700 dark:text-gray-300 w-[100px] text-center">
          {application.applicationFees.international}
        </TableCell>

        <TableCell className="w-[100px] text-center">
          {application.eligibility?.status === "pass" ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 m-auto" />
          ) : application.eligibility?.status === "fail" ? (
            <X className="w-6 h-6 text-red-500 m-auto" />
          ) : (
            <span className="text-xs text-gray-500">Unknown</span>
          )}
        </TableCell>

        <TableCell className="w-[120px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Progress
                    value={application.admissionRate}
                    className="w-24 h-2 bg-gray-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {application.fit}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Admission Fit Score: {application.admissionRate}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>

        <TableCell>
          <ApplicationStatus
            status={application.status ?? "considered"}
            applicationId={application.id}
            isExpanded={isExpanded}
            toggleDetails={() => toggleDetails(application.id)}
            onStatusChange={handleStatusChange}
          />
        </TableCell>

        <TableCell>
          <ApplicationActions
            onApplyYourself={() => handleApplyYourself(application.id)}
            onSubmitWithUs={() => handleSubmitWithUs(application.id)}
          />
        </TableCell>
      </TableRow>

      {/* Expanded Details */}
      <ApplicationDetails
        application={application}
        userMeta={userMeta}
        documents={documents}
        isExpanded={isExpanded}
      />
    </React.Fragment>
  );
};

export default ApplicationRow;
