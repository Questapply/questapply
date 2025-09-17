import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { useToast } from "../../../../hooks/use-toast";
import RoadmapApplicationFilters from "./RoadmapApplicationFilters";
import RoadmapApplicationRow from "./RoadmapApplicationRow";

// Sample application data
const applications = [
  {
    id: 1,
    program: "Computer Science",
    degree: "Ph.D.",
    school: "Newcastle University",
    logo: "/placeholder.svg",
    deadline: "No Deadline",
    applicationFees: "FREE",
    eligibility: true,
    admissionFit: "High",
    admissionFitPercentage: 85,
    status: "applied",
  },
  {
    id: 2,
    program: "Computer Science",
    degree: "Ph.D.",
    school: "University of Liverpool",
    logo: "/placeholder.svg",
    deadline: "56 days opening\nFall, Aug 31\nFall, Jul 12\nWinter, Nov 30",
    applicationFees: "FREE",
    eligibility: true,
    admissionFit: "Needs Info",
    admissionFitPercentage: 60,
    status: "applied",
  },
];

const RoadmapApplyNow = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleApplyYourself = (applicationId: number) => {
    toast({
      title: "Apply Yourself",
      description: `You selected to apply yourself for application #${applicationId}`,
    });
  };

  const handleSubmitWithUs = (applicationId: number) => {
    toast({
      title: "Submit with Us",
      description: `You selected to submit with us for application #${applicationId}`,
    });
  };

  return (
    <div className="animate-fade-in p-4">
      <motion.h1
        className="text-2xl font-bold text-gray-900 dark:text-white mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Applications
      </motion.h1>

      {/* Filters */}
      <RoadmapApplicationFilters
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
      />

      {/* Table Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead className="font-medium">Program</TableHead>
              <TableHead className="font-medium">Deadline</TableHead>
              <TableHead className="font-medium">Application Fees</TableHead>
              <TableHead className="font-medium">Eligibility</TableHead>
              <TableHead className="font-medium">Admission Fit</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <RoadmapApplicationRow
                key={application.id}
                application={application}
                handleApplyYourself={handleApplyYourself}
                handleSubmitWithUs={handleSubmitWithUs}
              />
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default RoadmapApplyNow;
