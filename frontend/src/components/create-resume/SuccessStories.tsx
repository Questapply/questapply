import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import {
  Trophy,
  ArrowRight,
  GraduationCap,
  Building,
  ChevronDown,
  User,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import StatCircle from "../ui/stat-circle";

interface SuccessStory {
  id: string;
  name: string;
  degree: string;
  field: string;
  university: string;
  role: string;
  company: string;
  story: string;
  improvements: string[];
  acceptanceRate: number;
}

const successStories: SuccessStory[] = [
  {
    id: "story1",
    name: "Michael Chen",
    degree: "PhD",
    field: "Computer Science",
    university: "Stanford University",
    role: "Research Scientist",
    company: "Google AI",
    story:
      "After being rejected twice from Stanford's PhD program, I completely restructured my resume and personal statement. I focused on highlighting my research contributions and technical skills with concrete metrics, which made a dramatic difference.",
    improvements: [
      "Added quantifiable metrics to all research project descriptions",
      "Restructured publication section to highlight first-author papers",
      "Enhanced technical skills section with specific frameworks and methodologies",
      "Added a dedicated section for open-source contributions",
    ],
    acceptanceRate: 5.2,
  },
  {
    id: "story2",
    name: "Emily Rodriguez",
    degree: "Master's",
    field: "Neuroscience",
    university: "Harvard University",
    role: "Neuroscience Researcher",
    company: "Brain Research Institute",
    story:
      "I applied to Harvard's competitive neuroscience program after working in a research lab for two years. My initial application was generic, but after consulting with alumni, I completely revamped my CV to align with Harvard's research priorities.",
    improvements: [
      "Aligned research experience with Harvard's specific focus areas",
      "Created a dedicated section for laboratory techniques and methodologies",
      "Added detailed metrics about research outcomes and impacts",
      "Included relevant coursework and specialized training",
    ],
    acceptanceRate: 7.8,
  },
  {
    id: "story3",
    name: "David Kim",
    degree: "Bachelor's",
    field: "Business Administration",
    university: "University of Pennsylvania",
    role: "Financial Analyst",
    company: "Morgan Stanley",
    story:
      "As a transfer student applying to UPenn's Wharton School, I needed my application to stand out. I transformed my resume by focusing on my entrepreneurial projects and leadership roles, which showcased my practical business experience.",
    improvements: [
      "Highlighted entrepreneurial projects with clear metrics and outcomes",
      "Restructured leadership experiences to emphasize management skills",
      "Added financial modeling and analysis skills with concrete examples",
      "Included relevant internships with quantifiable achievements",
    ],
    acceptanceRate: 8.4,
  },
];

const degreeOptions = ["Bachelor's", "Master's", "PhD"];
const fieldOptions = [
  "Computer Science",
  "Engineering",
  "Business Administration",
  "Neuroscience",
  "Physics",
  "Mathematics",
  "Chemistry",
  "Biology",
];
const universityOptions = [
  "Stanford University",
  "Harvard University",
  "MIT",
  "University of Pennsylvania",
  "Columbia University",
  "Princeton University",
];

const SuccessStories = () => {
  const [degree, setDegree] = useState<string>("");
  const [field, setField] = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [filteredStories, setFilteredStories] =
    useState<SuccessStory[]>(successStories);

  const applyFilters = () => {
    let filtered = [...successStories];

    if (degree) {
      filtered = filtered.filter((story) => story.degree === degree);
    }

    if (field) {
      filtered = filtered.filter((story) => story.field === field);
    }

    if (university) {
      filtered = filtered.filter((story) => story.university === university);
    }

    setFilteredStories(filtered);
  };

  const resetFilters = () => {
    setDegree("");
    setField("");
    setUniversity("");
    setFilteredStories(successStories);
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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Success Stories
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
              Learn from applicants who successfully gained admission to top
              universities and apply their strategies to your own resume.
            </p>
          </div>
          <div className="hidden md:block">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-amber-800 dark:text-amber-400 font-semibold">
                  Success Tip
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                Applicants who tailor their resume to specific institutions
                increase their acceptance chances by up to 65%.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
                Filter Stories
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                    Degree Level
                  </label>
                  <Select value={degree} onValueChange={setDegree}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select degree level" />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                    Field of Study
                  </label>
                  <Select value={field} onValueChange={setField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                    University
                  </label>
                  <Select value={university} onValueChange={setUniversity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universityOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <Button
                  onClick={applyFilters}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Apply Filters
                </Button>

                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div variants={container} initial="hidden" animate="show">
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <motion.div key={story.id} variants={item} className="mb-6">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">
                                {story.name}
                              </h3>
                              <p className="text-purple-100">
                                {story.role} at {story.company}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              <span className="font-medium">
                                {story.degree} in {story.field}
                              </span>
                            </div>
                            <div className="flex items-center text-purple-100">
                              <Building className="h-4 w-4 mr-1" />
                              <span>{story.university}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Success Story
                          </h4>
                          <div className="flex items-center">
                            <StatCircle
                              value={story.acceptanceRate}
                              label="Acceptance Rate"
                              size="sm"
                              color="purple"
                              isPercentage={true}
                            />
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                          {story.story}
                        </p>

                        <Accordion type="single" collapsible>
                          <AccordionItem
                            value="improvements"
                            className="border-b-0"
                          >
                            <AccordionTrigger className="py-2 text-purple-600 dark:text-purple-400">
                              Resume Improvements Made
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300 ml-1">
                                {story.improvements.map(
                                  (improvement, index) => (
                                    <li key={index}>{improvement}</li>
                                  )
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <div className="mt-4">
                          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            Apply These Strategies to My Resume
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    No matching stories
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try changing your filters or check back soon for new success
                    stories
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessStories;
