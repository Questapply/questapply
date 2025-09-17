import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { School, ArrowRight } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EducationProps {
  onNext: (data: any) => void;
  data: {
    degree: string;
    university: string;
    major: string;
    gpa: string;
  };
}

const degreeOptions = [
  "High School Diploma",
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Professional Degree (MD, JD, etc.)",
  "Other",
];

const Education: React.FC<EducationProps> = ({ onNext, data }) => {
  const [degree, setDegree] = useState(data.degree || "");
  const [university, setUniversity] = useState(data.university || "");
  const [major, setMajor] = useState(data.major || "");
  const [gpa, setGpa] = useState(data.gpa || "");
  const [errors, setErrors] = useState({
    degree: false,
    university: false,
    major: false,
    gpa: false,
  });

  const handleNext = () => {
    // Validate
    const newErrors = {
      degree: !degree,
      university: !university,
      major: !major,
      gpa: !gpa,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).includes(true)) {
      onNext({ degree, university, major, gpa });
    }
  };

  const handlePrevious = () => {
    // Go back to the previous section (Citizenship)
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
              <School className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Educational Background
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Let us know about your most recent education to help match you with
            appropriate programs.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <Label htmlFor="degree">What was your last degree?</Label>
            <Select value={degree} onValueChange={setDegree}>
              <SelectTrigger
                id="degree"
                className={`w-full ${
                  errors.degree ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select your most recent degree" />
              </SelectTrigger>
              <SelectContent>
                {degreeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.degree && (
              <p className="text-red-500 text-sm">Please select your degree</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">Which university did you attend?</Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Enter university name"
              className={
                errors.university ? "border-red-500 dark:border-red-500" : ""
              }
            />
            {errors.university && (
              <p className="text-red-500 text-sm">
                Please enter your university
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">What was your major/field of study?</Label>
            <Input
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Enter your major"
              className={
                errors.major ? "border-red-500 dark:border-red-500" : ""
              }
            />
            {errors.major && (
              <p className="text-red-500 text-sm">Please enter your major</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa">What was your GPA? (out of 4.0)</Label>
            <Input
              id="gpa"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="Enter your GPA (e.g., 3.5)"
              className={errors.gpa ? "border-red-500 dark:border-red-500" : ""}
            />
            {errors.gpa && (
              <p className="text-red-500 text-sm">Please enter your GPA</p>
            )}
          </div>
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

export default Education;
