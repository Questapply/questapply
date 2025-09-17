import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Search, University, Check, ArrowRight } from "lucide-react";
import StatCircle from "../ui/stat-circle";

const topUniversities = [
  {
    id: "mit",
    name: "Massachusetts Institute of Technology",
    country: "USA",
    match: 87,
  },
  { id: "harvard", name: "Harvard University", country: "USA", match: 92 },
  { id: "stanford", name: "Stanford University", country: "USA", match: 89 },
  {
    id: "cambridge",
    name: "University of Cambridge",
    country: "UK",
    match: 85,
  },
  { id: "oxford", name: "University of Oxford", country: "UK", match: 88 },
  {
    id: "caltech",
    name: "California Institute of Technology",
    country: "USA",
    match: 79,
  },
];

interface MatchRequirement {
  id: string;
  name: string;
  description: string;
  status: "fulfilled" | "partial" | "missing";
}

interface UniversityDetails {
  name: string;
  requirements: MatchRequirement[];
}

const universityDetails: { [key: string]: UniversityDetails } = {
  mit: {
    name: "Massachusetts Institute of Technology",
    requirements: [
      {
        id: "format",
        name: "Format Requirements",
        description: "Uses preferred format with clear section headers",
        status: "fulfilled",
      },
      {
        id: "research",
        name: "Research Alignment",
        description:
          "Aligns with MIT's focus on cutting-edge technical research",
        status: "fulfilled",
      },
      {
        id: "publications",
        name: "Publication Quality",
        description: "Includes publications in high-impact journals",
        status: "partial",
      },
      {
        id: "skills",
        name: "Technical Skills",
        description: "Highlights quantitative and programming skills",
        status: "fulfilled",
      },
      {
        id: "achievements",
        name: "Notable Achievements",
        description: "Emphasizes innovative contributions and leadership",
        status: "missing",
      },
    ],
  },
  harvard: {
    name: "Harvard University",
    requirements: [
      {
        id: "format",
        name: "Format Requirements",
        description: "Uses Harvard's preferred chronological format",
        status: "fulfilled",
      },
      {
        id: "research",
        name: "Research Alignment",
        description: "Shows interdisciplinary research approach",
        status: "partial",
      },
      {
        id: "publications",
        name: "Publication Quality",
        description: "Includes publications in high-impact journals",
        status: "fulfilled",
      },
      {
        id: "teaching",
        name: "Teaching Experience",
        description: "Demonstrates teaching and mentoring experience",
        status: "missing",
      },
      {
        id: "service",
        name: "Service & Leadership",
        description: "Shows commitment to community and leadership",
        status: "fulfilled",
      },
    ],
  },
};

const UniversityMatch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    null
  );

  const handleSelectUniversity = (id: string) => {
    setSelectedUniversity(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter universities based on search
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Match with University
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Optimize your resume to match specific university requirements and
          increase your chances of acceptance.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Find University
              </h3>

              <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search universities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {topUniversities.map((university) => (
                    <motion.div
                      key={university.id}
                      variants={item}
                      onClick={() => handleSelectUniversity(university.id)}
                      className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                        selectedUniversity === university.id
                          ? "bg-purple-100 dark:bg-purple-900/30"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                          <University className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {university.name}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {university.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm font-semibold mr-1 text-purple-600 dark:text-purple-400">
                          {university.match}%
                        </div>
                        {selectedUniversity === university.id && (
                          <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedUniversity && universityDetails[selectedUniversity] ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {universityDetails[selectedUniversity].name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Resume Matching Analysis
                    </p>
                  </div>
                  <StatCircle
                    value={
                      topUniversities.find((u) => u.id === selectedUniversity)
                        ?.match || 0
                    }
                    label="Match Score"
                    size="lg"
                    color="purple"
                    isPercentage={true}
                  />
                </div>

                <h4 className="text-md font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  University Requirements
                </h4>

                <motion.div
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {universityDetails[selectedUniversity].requirements.map(
                    (req) => (
                      <motion.div
                        key={req.id}
                        variants={item}
                        className="p-4 border rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                                req.status === "fulfilled"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : req.status === "partial"
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {req.status === "fulfilled" ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <span className="text-xs font-bold">
                                  {req.status === "partial" ? "!" : "×"}
                                </span>
                              )}
                            </div>
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              {req.name}
                            </h5>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-8">
                            {req.description}
                          </p>
                        </div>

                        <div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              req.status === "fulfilled"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : req.status === "partial"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {req.status === "fulfilled"
                              ? "Fulfilled"
                              : req.status === "partial"
                              ? "Partial"
                              : "Missing"}
                          </span>
                        </div>
                      </motion.div>
                    )
                  )}
                </motion.div>

                <div className="mt-8">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Optimize Resume for{" "}
                    {universityDetails[selectedUniversity].name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
              <div className="text-center">
                <University className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select a University
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a university from the list to see how your resume
                  matches their requirements
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UniversityMatch;
