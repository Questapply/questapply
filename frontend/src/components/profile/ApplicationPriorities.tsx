import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Target, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";

interface ApplicationPrioritiesProps {
  onNext: (data: any) => void;
  data: {
    options: string[];
  };
}

const priorityOptions = [
  { id: "ranking", label: "University Ranking" },
  { id: "funding", label: "Funding Opportunities" },
  { id: "location", label: "Location" },
  { id: "weather", label: "Weather & Climate" },
  { id: "cost", label: "Cost of Living" },
  { id: "community", label: "Student Community" },
  { id: "jobOpportunities", label: "Job Opportunities" },
  { id: "safety", label: "Safety & Security" },
];

const ApplicationPriorities: React.FC<ApplicationPrioritiesProps> = ({
  onNext,
  data,
}) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    data.options || []
  );
  const [error, setError] = useState(false);

  const handleNext = () => {
    if (selectedPriorities.length === 0) {
      setError(true);
      return;
    }

    onNext({ options: selectedPriorities });
  };

  const handlePrevious = () => {
    // Go back to the previous section (Standardized Tests)
    onNext({ type: "back" });
  };

  const togglePriority = (id: string) => {
    setSelectedPriorities((current) => {
      if (current.includes(id)) {
        return current.filter((p) => p !== id);
      } else {
        return [...current, id];
      }
    });

    if (error) setError(false);
  };

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const iconAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  return (
    <div className="p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={itemVariants} className="text-center">
          <div className="flex justify-center mb-4">
            <motion.div
              variants={iconAnimation}
              className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"
            >
              <Target className="w-10 h-10 text-orange-600 dark:text-orange-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Application Priorities
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            What are your main priorities when applying to universities? Select
            all that apply.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {priorityOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <Checkbox
                  id={option.id}
                  checked={selectedPriorities.includes(option.id)}
                  onCheckedChange={() => togglePriority(option.id)}
                  className="mt-1"
                />
                <Label htmlFor={option.id} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              Please select at least one priority
            </p>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex justify-between pt-6"
        >
          <Button variant="outline" onClick={handlePrevious} className="px-8">
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ApplicationPriorities;
