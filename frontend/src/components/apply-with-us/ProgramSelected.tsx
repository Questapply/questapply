import React, { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCard from "../ui/animated-card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Star, Check } from "lucide-react";

interface Program {
  id: number;
  name: string;
  school: string;
  duration: string;
  deadline: string;
  tuition: string;
  accepted?: boolean;
}

const ProgramSelected = () => {
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: 1,
      name: "Computer Science MS",
      school: "Massachusetts Institute of Technology",
      duration: "2 years",
      deadline: "December 15, 2023",
      tuition: "$58,000 per year",
    },
    {
      id: 2,
      name: "Artificial Intelligence PhD",
      school: "Stanford University",
      duration: "5 years",
      deadline: "January 5, 2024",
      tuition: "$62,000 per year",
    },
    {
      id: 3,
      name: "Data Science MS",
      school: "University of California, Berkeley",
      duration: "2 years",
      deadline: "December 1, 2023",
      tuition: "$54,000 per year",
    },
  ]);

  const handleAcceptProgram = (programId: number) => {
    setPrograms(
      programs.map((program) =>
        program.id === programId ? { ...program, accepted: true } : program
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Selected Programs
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Our team has selected these programs based on your profile and
          preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program, index) => (
          <AnimatedCard
            key={program.id}
            delay={index * 0.1}
            className="flex flex-col"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{program.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {program.school}
                  </p>
                </div>
                {program.accepted && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <Check className="h-3 w-3 mr-1" />
                    Accepted
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                <div>
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {program.duration}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Application Deadline:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {program.deadline}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Tuition:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    {program.tuition}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600 dark:text-purple-400"
                >
                  View Program
                </Button>
                {!program.accepted ? (
                  <Button
                    size="sm"
                    onClick={() => handleAcceptProgram(program.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept Program
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-green-600">
                    Program Accepted
                  </Badge>
                )}
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default ProgramSelected;
