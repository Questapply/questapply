import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { DollarSign, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";

interface FinancialStatusProps {
  onNext: (data: any) => void;
  data: {
    requiresFunding: boolean;
    budget: string;
  };
}

const FinancialStatus: React.FC<FinancialStatusProps> = ({ onNext, data }) => {
  const [requiresFunding, setRequiresFunding] = useState<boolean>(
    data.requiresFunding !== undefined ? data.requiresFunding : false
  );
  const [budget, setBudget] = useState(data.budget || "");
  const [errors, setErrors] = useState({
    budget: false,
  });

  const handleNext = () => {
    // Only validate budget if they can pay (not requiring full funding)
    if (!requiresFunding) {
      if (!budget) {
        setErrors({ budget: true });
        return;
      }
    }

    onNext({
      requiresFunding,
      budget: requiresFunding ? "0" : budget,
    });
  };

  const handlePrevious = () => {
    // Go back to the previous section (Application Priorities)
    onNext({ type: "back" });
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
    hidden: { scale: 0.8, opacity: 0, rotate: 15 },
    show: {
      scale: 1,
      opacity: 1,
      rotate: 0,
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
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <DollarSign className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Status
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Let us know about your financial situation for your studies abroad.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="space-y-4">
            <Label>Can you pay tuition or do you require full funding?</Label>
            <RadioGroup
              value={requiresFunding ? "funding" : "self-pay"}
              onValueChange={(value) => setRequiresFunding(value === "funding")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="self-pay" id="self-pay" />
                <Label htmlFor="self-pay" className="cursor-pointer">
                  I can pay tuition
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="funding" id="funding" />
                <Label htmlFor="funding" className="cursor-pointer">
                  I require full funding
                </Label>
              </div>
            </RadioGroup>
          </div>

          {!requiresFunding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="budget">
                How much can you afford per year? (USD)
              </Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="E.g., 30000"
                prefix={<span className="text-gray-500">$</span>}
                className={
                  errors.budget ? "border-red-500 dark:border-red-500" : ""
                }
              />
              {errors.budget && (
                <p className="text-red-500 text-sm">Please enter your budget</p>
              )}
            </motion.div>
          )}
        </motion.div>

        {!requiresFunding && budget && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800/30"
          >
            <div className="text-center">
              <span className="inline-block p-3 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4">
                <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              </span>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Your Budget
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-semibold">
                  ${parseInt(budget).toLocaleString()}
                </span>{" "}
                per year
              </p>
            </div>
          </motion.div>
        )}

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

export default FinancialStatus;
