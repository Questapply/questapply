import React, { useState } from "react";
import { ListFilter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Select } from "../ui/select";

interface Requirement {
  program: string;
  level: string;
  type: string;
  deadline: string;
  gre: string;
}

interface RequirementsTableProps {
  requirements: Requirement[];
}

const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
}) => {
  const [filter, setFilter] = useState("All");

  const filteredRequirements =
    filter === "All"
      ? requirements
      : requirements.filter((req) => req.level === filter);

  const levelOptions = [
    "All",
    ...Array.from(new Set(requirements.map((req) => req.level))),
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <ListFilter className="h-5 w-5 text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Program Requirements
          </h2>
        </div>

        <div className="flex items-center">
          <label
            htmlFor="levelFilter"
            className="text-sm text-gray-600 dark:text-gray-300 mr-2"
          >
            Select Program Level:
          </label>
          <select
            id="levelFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm rounded border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white py-1 px-3"
          >
            {levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-purple-50 dark:bg-purple-900/20">
            <TableRow>
              <TableHead className="text-left text-purple-700 dark:text-purple-300 font-semibold">
                Programs
              </TableHead>
              <TableHead className="text-left text-purple-700 dark:text-purple-300 font-semibold">
                Level
              </TableHead>
              <TableHead className="text-left text-purple-700 dark:text-purple-300 font-semibold">
                Type
              </TableHead>
              <TableHead className="text-left text-purple-700 dark:text-purple-300 font-semibold">
                Deadline
              </TableHead>
              <TableHead className="text-left text-purple-700 dark:text-purple-300 font-semibold">
                GRE*
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequirements.map((req, idx) => (
              <TableRow
                key={idx}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-750"
                }
              >
                <TableCell className="text-purple-600 dark:text-purple-400 font-medium">
                  {req.program}
                </TableCell>
                <TableCell>{req.level}</TableCell>
                <TableCell>{req.type}</TableCell>
                <TableCell>
                  <span className="font-medium">Fall:</span> {req.deadline}
                </TableCell>
                <TableCell>{req.gre}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequirementsTable;
