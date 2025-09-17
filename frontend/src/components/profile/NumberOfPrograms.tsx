import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { List, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

interface NumberOfProgramsProps {
  onNext: (data: any) => void;
  data: {
    count: number;
  };
}

const NumberOfPrograms: React.FC<NumberOfProgramsProps> = ({
  onNext,
  data,
}) => {
  const [programCount, setProgramCount] = useState(data.count || 5);
  const [error, setError] = useState(false);

  const handleNext = () => {
    if (programCount < 1) {
      setError(true);
      return;
    }

    onNext({ count: programCount });
  };

  const handlePrevious = () => {
    // Go back to the previous section (Financial Status)
    onNext({ type: "back" });
  };

  const handleSliderChange = (value: number[]) => {
    setProgramCount(value[0]);
    if (error) setError(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setProgramCount(Math.min(Math.max(value, 1), 20));
      if (error) setError(false);
    } else {
      setProgramCount(0);
    }
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
              className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
            >
              <List className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Number of Programs
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            How many programs do you plan to apply to?
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="program-count">Select number of programs:</Label>
              <Slider
                value={[programCount]}
                min={1}
                max={20}
                step={1}
                onValueChange={handleSliderChange}
                className="py-4"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Input
                id="program-count"
                type="number"
                min={1}
                max={20}
                value={programCount}
                onChange={handleInputChange}
                className={`w-24 text-center ${
                  error ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              <span className="text-gray-600 dark:text-gray-300">Programs</span>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                Please enter at least 1 program
              </p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800/30"
          >
            <div className="text-center">
              <span className="inline-block p-3 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4">
                <List className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </span>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {programCount} Programs
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {programCount < 5
                  ? "Consider applying to more programs to increase your chances"
                  : programCount > 10
                  ? "That's a lot of applications to manage!"
                  : "A good number of programs to apply to"}
              </p>
            </div>
          </motion.div>
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

export default NumberOfPrograms;
