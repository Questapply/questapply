import { useState } from "react";
import { Button } from "../ui/button";
import { Eye, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { statuses } from "./statuses";
import type { AppStatus } from "./statuses";
interface ApplicationStatusProps {
  status: string;
  applicationId: number;
  isExpanded: boolean;
  toggleDetails: () => void;
  onStatusChange: (applicationId: number, newStatus: string) => void;
}
const normalizeStatus = (s: string): AppStatus => {
  const known = statuses.find((x) => x.value === s)?.value;
  if (known) return known as AppStatus;

  if (s === "not_started") return "considered";

  return "considered";
};

const getStatusColor = (status: string) => {
  const s = normalizeStatus(status);
  const statusObj = statuses.find((st) => st.value === s);
  return statusObj?.color || "bg-gray-500";
};

const getStatusLabel = (status: string) => {
  const s = normalizeStatus(status);
  const statusObj = statuses.find((st) => st.value === s);
  return statusObj?.label || "Unknown";
};

const ApplicationStatus = ({
  status,
  applicationId,
  isExpanded,
  toggleDetails,
  onStatusChange,
}: ApplicationStatusProps) => {
  const norm = normalizeStatus(status);
  return (
    <div className="flex md:flex-col gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`capitalize ${getStatusColor(status).replace(
              "bg-",
              "border-"
            )} border`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(status)}`}
            />
            {getStatusLabel(norm)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statuses.map((statusOption) => (
            <DropdownMenuItem
              key={statusOption.value}
              onClick={() => onStatusChange(applicationId, statusOption.value)}
              className="flex items-center gap-2"
            >
              <span className={`w-2 h-2 rounded-full ${statusOption.color}`} />
              {statusOption.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon"
        className="text-gray-400 hover:text-gray-600 bg-gray-800 md:w-24 md:px-10 border "
        onClick={toggleDetails}
      >
        {isExpanded ? (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <X className="h-4 w-4" />
          </motion.div>
        ) : (
          <span className=" text-xs text-center text-gray-100">Details</span>
        )}
      </Button>
    </div>
  );
};

export default ApplicationStatus;
