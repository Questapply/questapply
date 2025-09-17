import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Flag, Home, ArrowRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { countries } from "../../lib/constants/countries";
import { CitizenshipData } from "./ProfileTypes";

interface CitizenshipResidencyProps {
  onNext: (data: any) => void;
  data: CitizenshipData;
}

const CitizenshipResidency: React.FC<CitizenshipResidencyProps> = ({
  onNext,
  data,
}) => {
  const [country, setCountry] = useState(data.country || "");
  const [residence, setResidence] = useState(data.residence || "");
  const [errors, setErrors] = useState({ country: false, residence: false });

  const handleNext = () => {
    // Validate
    const newErrors = {
      country: !country,
      residence: !residence,
    };

    setErrors(newErrors);

    if (!newErrors.country && !newErrors.residence) {
      onNext({ country, residence });
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
              className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"
            >
              <Flag className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tell us about your citizenship
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            This information helps us provide you with relevant university
            options and immigration guidance.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <Label htmlFor="country">What is your citizenship?</Label>
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                id="country"
                className={`w-full ${
                  errors.country ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select your country of citizenship" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-red-500 text-sm">
                Please select your citizenship
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <Label htmlFor="residence">Where do you currently live?</Label>
            </div>
            <Select value={residence} onValueChange={setResidence}>
              <SelectTrigger
                id="residence"
                className={`w-full ${
                  errors.residence ? "border-red-500 dark:border-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select your current country of residence" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.residence && (
              <p className="text-red-500 text-sm">
                Please select your country of residence
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex justify-center pt-6"
        >
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

export default CitizenshipResidency;
