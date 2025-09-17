import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const cvSections = [
  {
    icon: "📧",
    title: "Personal Information",
    description:
      "Full Name, Address, Phone Number, Email Address, LinkedIn Profile, Personal Website or Portfolio",
  },
  {
    icon: "📝",
    title: "Summary",
    description:
      "A concise overview of your professional background and career goals",
  },
  {
    icon: "🔍",
    title: "Research Interests",
    description:
      "Areas of research focus and expertise, methodologies, theoretical frameworks",
  },
  {
    icon: "🎓",
    title: "Education",
    description:
      "Degrees, Institutions, Dates, GPAs, Relevant Coursework, Honors and Awards",
  },
  {
    icon: "💼",
    title: "Professional Experience",
    description:
      "Positions, Organizations, Dates, Responsibilities, Achievements, Skills Demonstrated",
  },
  {
    icon: "📚",
    title: "Publications",
    description:
      "Academic papers, books, chapters, conference proceedings, citations",
  },
  {
    icon: "🌟",
    title: "Skills and Certifications",
    description:
      "Technical Skills, Language Proficiency, Certifications, Software Proficiency",
  },
  {
    icon: "🏆",
    title: "Honors and Awards",
    description:
      "Scholarships, Academic Distinctions, Professional Recognitions, Dates Received",
  },
  {
    icon: "🤝",
    title: "Memberships",
    description:
      "Professional associations, academic societies, community organizations",
  },
  {
    icon: "🏄‍♂️",
    title: "Interests and Hobbies",
    description:
      "Personal interests that demonstrate character and transferable skills",
  },
  {
    icon: "👥",
    title: "References",
    description:
      "Professional and academic references with contact information (or 'Available upon request')",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const ResumeGuidance = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl p-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Academic CV Guidance
          </motion.h2>
          <motion.p
            className="text-xl font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Essential sections for a comprehensive academic curriculum vitae
          </motion.p>
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-2xl font-semibold mb-2">Key Components</h3>
            <p className="text-purple-100">
              Follow this structure to create a professional and comprehensive
              academic CV
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {cvSections.map((section, index) => (
            <motion.div
              key={index}
              className="mb-8"
              variants={item}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-6">
                  <motion.div
                    whileHover={{
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 },
                    }}
                    className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl shadow-md"
                  >
                    {section.icon}
                  </motion.div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {section.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>
                  {index < cvSections.length - 1 && (
                    <div className="border-l-2 border-dashed border-purple-300 dark:border-purple-700 ml-8 pl-8 h-8 my-2"></div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8 group">
              <span>Create My Resume</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeGuidance;
