import React from "react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, X } from "lucide-react";
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
  onRemove: () => void;
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
    onRemove,
    ...rest // Capture any other props
  } = props;

  const isExpanded = expandedDetails.includes(application.id);
  return (
    <>
      {/* 📱 موبایل: کارت عمودی */}
      <TableRow className="md:hidden border-b border-gray-400 dark:border-gray-700">
        <TableCell colSpan={7} className="p-0">
          <div className="p-3 space-y-3">
            {/* Header کارت + دکمهٔ جزئیات */}
            <div className="flex items-start gap-3">
              <motion.img
                src={application.schoolLogo}
                alt={`${application.school} logo`}
                className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700 shrink-0"
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1">
                  <span className="font-medium text-gray-900 dark:text-white text-base leading-snug break-words">
                    {application.name}
                  </span>
                  <Badge className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-[11px]">
                    {application.degree}
                  </Badge>
                </div>
                <div className="text-[13px] text-gray-500 dark:text-gray-400 break-words">
                  {application.school}
                </div>
              </div>

              {/* دکمهٔ Details موبایل */}
            </div>

            {/* Grid فیلدها */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Deadline
                </div>
                <span className="text-left text-sm text-gray-800 dark:text-gray-200   hover:opacity-90">
                  {application.deadline || "N/A"}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Fees
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {application.applicationFees.international}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Eligibility
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {application.eligibility?.status === "pass" ? (
                    <CheckCircle2 className="inline w-5 h-5 text-green-500" />
                  ) : application.eligibility?.status === "fail" ? (
                    <X className="inline w-5 h-5 text-red-500" />
                  ) : (
                    <span className="text-[12px] text-gray-500">Unknown</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Admission Fit
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={application.admissionRate}
                    className="w-24 h-2 bg-gray-700"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {application.fit}
                  </span>
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </div>
                <ApplicationStatus
                  status={application.status ?? "considered"}
                  applicationId={application.id}
                  isExpanded={isExpanded}
                  toggleDetails={() => toggleDetails(application.id)}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1">
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                Actions
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ApplicationActions
                  onApplyYourself={() => handleApplyYourself(application.id)}
                  onSubmitWithUs={() => handleSubmitWithUs(application.id)}
                  onApplicationRemove={onRemove}
                />
              </div>
            </div>
          </div>
        </TableCell>
      </TableRow>

      {/* 🖥️ دسکتاپ/تبلت: ردیف جدول اصلی */}
      <TableRow className="hidden md:table-row border-b border-gray-400 dark:border-gray-700 ">
        {/* Program */}
        <TableCell className="md:w-1/3 w-auto ">
          <div className="flex items-start md:items-center gap-2.5 md:gap-3">
            <motion.img
              src={application.schoolLogo}
              alt={`${application.school} logo`}
              className="w-8 h-8 md:w-10 md:h-10 object-contain bg-gray-100 dark:bg-gray-800 rounded-md p-1.5 md:p-2 border border-gray-200 dark:border-gray-700 shrink-0"
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-1">
                <span className="font-medium text-gray-900 dark:text-white text-sm md:text-base leading-snug break-words">
                  {application.name}
                </span>
                <Badge className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-[10px] md:text-xs">
                  {application.degree}
                </Badge>
              </div>
              <div className="text-[12px] md:text-sm text-gray-500 dark:text-gray-400 truncate md:whitespace-normal md:break-words">
                {application.school}
              </div>
            </div>
          </div>
        </TableCell>

        {/* Deadline → تریگرِ جزئیات */}
        <TableCell className="text-gray-700 dark:text-gray-300 text-center text-nowrap  leading-tight text-[12px] md:text-sm md:w-[125px]">
          <span className="  hover:opacity-90">
            {application.deadline || "N/A"}
          </span>
        </TableCell>

        {/* Fees */}
        <TableCell className="text-gray-700 dark:text-gray-300 text-center text-[12px] md:text-sm md:w-[100px] whitespace-normal break-words">
          {application.applicationFees.international}
        </TableCell>

        {/* Eligibility */}
        <TableCell className="text-center md:w-[100px]">
          {application.eligibility?.status === "pass" ? (
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500 inline-block" />
          ) : application.eligibility?.status === "fail" ? (
            <X className="w-5 h-5 md:w-6 md:h-6 text-red-500 inline-block" />
          ) : (
            <span className="text-[11px] md:text-xs text-gray-500">
              Unknown
            </span>
          )}
        </TableCell>

        {/* Admission Fit */}
        <TableCell className="md:w-[120px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-center">
                  <Progress
                    value={application.admissionRate}
                    className="w-20 md:w-24 h-2 bg-gray-700"
                  />
                  <span className="text-[12px] md:text-sm text-gray-600 dark:text-gray-400">
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

        {/* Status */}
        <TableCell className="min-w-0">
          <div className="flex justify-center md:block">
            <ApplicationStatus
              status={application.status ?? "considered"}
              applicationId={application.id}
              isExpanded={isExpanded}
              toggleDetails={() => toggleDetails(application.id)}
              onStatusChange={handleStatusChange}
            />
          </div>
        </TableCell>

        {/* Actions + دکمهٔ Details صریح */}
        <TableCell className="min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <ApplicationActions
              onApplyYourself={() => handleApplyYourself(application.id)}
              onSubmitWithUs={() => handleSubmitWithUs(application.id)}
              onApplicationRemove={onRemove}
            />
          </div>
        </TableCell>
      </TableRow>

      {/* ردیف جزئیات (برای هر دو نما) */}
      {isExpanded && (
        <TableRow className="border-b-0">
          <TableCell colSpan={7} className="p-0">
            <ApplicationDetails
              application={application}
              userMeta={userMeta}
              documents={documents}
              isExpanded={isExpanded}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ApplicationRow;
