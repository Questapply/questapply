import React from "react";
import { motion } from "framer-motion";
import { Check, X, FileText } from "lucide-react";
import { Progress } from "../ui/progress";
import StatCircle from "../ui/stat-circle";
import type { ProgramDetail } from "../../data/programDetails";

interface RequirementsSectionProps {
  program: ProgramDetail;
}

const RequirementsSection: React.FC<RequirementsSectionProps> = ({ program }) => {
  const getGREStatusStyle = (status: string) => {
    switch (status) {
      case "Not Accepted":
        return {
          border: "border-red-300 dark:border-red-800",
          text: "text-red-600 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950",
          icon: <X className="h-5 w-5" />,
        };
      case "Optional":
        return {
          border: "border-yellow-300 dark:border-yellow-800",
          text: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-50 dark:bg-yellow-950",
          icon: "!",
        };
      case "Required":
        return {
          border: "border-green-300 dark:border-green-800",
          text: "text-green-600 dark:text-green-400",
          bg: "bg-green-50 dark:bg-green-950",
          icon: <Check className="h-5 w-5" />,
        };
      default:
        return {
          border: "border-gray-300 dark:border-gray-700",
          text: "text-gray-600 dark:text-gray-400",
          bg: "bg-gray-50 dark:bg-gray-900",
          icon: "?",
        };
    }
  };

  const greStyle = getGREStatusStyle(program.requirements.gre.status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <FileText className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Requirements</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* English Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">English Requirement</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-blue-300 dark:border-blue-700 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{program.requirements.toefl.min}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">MIN TOEFL</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Min Score</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/20 border-4 border-blue-200 dark:border-blue-800 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-blue-500 dark:text-blue-300">{program.requirements.toefl.avg}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AVG TOEFL</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Avg Score</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-indigo-300 dark:border-indigo-700 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{program.requirements.ielts.min}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">MIN IELTS</div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Min Score</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 border-4 border-green-300 dark:border-green-700 flex items-center justify-center mb-2">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{program.requirements.duolingo.min}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">MIN Duolingo</div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">Min Score</div>
              </div>
            </div>
          </motion.div>
          
          {/* GRE Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">GRE {program.requirements.gre.status}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className={`p-4 rounded-lg ${greStyle.bg} ${greStyle.border} border`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-medium ${greStyle.text}`}>GRE Status: {program.requirements.gre.status}</h4>
                  <div className={`w-8 h-8 rounded-full ${greStyle.bg} ${greStyle.border} border flex items-center justify-center ${greStyle.text}`}>
                    {typeof greStyle.icon === 'string' ? greStyle.icon : greStyle.icon}
                  </div>
                </div>
                {program.requirements.gre.status === "Required" || program.requirements.gre.status === "Optional" ? (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{program.requirements.gre.total?.avg}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{program.requirements.gre.verbal?.avg}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Verbal</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{program.requirements.gre.quantitative?.avg}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Quantitative</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg text-gray-800 dark:text-gray-200">{program.requirements.gre.writing?.avg}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Writing</div>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${greStyle.text}`}>This program does not accept GRE scores as part of the application.</p>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* GPA Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">GPA</h3>
            <div className="flex justify-around">
              <div className="flex flex-col items-center">
                <StatCircle 
                  value={program.requirements.gpa.min} 
                  label="MIN" 
                  color="green"
                  isPercentage={false}
                  size="md"
                />
              </div>
              
              <div className="flex flex-col items-center">
                <StatCircle 
                  value={program.requirements.gpa.avg} 
                  label="AVG" 
                  color="green"
                  isPercentage={false}
                  size="md"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Other Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Other Requirements</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${program.otherRequirements.transcript ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500"}`}>
                  {program.otherRequirements.transcript ? <Check /> : <X />}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Transcript</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${program.otherRequirements.resumeCV ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500"}`}>
                  {program.otherRequirements.resumeCV ? <Check /> : <X />}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Resume/CV</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${program.otherRequirements.applicationForm ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500"}`}>
                  {program.otherRequirements.applicationForm ? <Check /> : <X />}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Application Form</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${program.otherRequirements.statementOfPurpose ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500"}`}>
                  {program.otherRequirements.statementOfPurpose ? <Check /> : <X />}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Statement of Purpose</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  {program.otherRequirements.recommendationLetters}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">Recommendation Letters</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Application Fee</h3>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-300 dark:border-orange-700 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">${program.applicationFees.international}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">International</div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 border-4 border-orange-200 dark:border-orange-800 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-orange-500 dark:text-orange-300">${program.applicationFees.us}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">US</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Admission Rate</h3>
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ddd"
                        strokeWidth="2"
                        strokeDasharray="100, 100"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#9b87f5"
                        strokeWidth="2"
                        strokeDasharray={`${program.admissionRate}, 100`}
                        className="dark:stroke-purple-400"
                      />
                      <text x="18" y="19" textAnchor="middle" fontSize="10" fill="#9b87f5" className="dark:fill-purple-400 font-bold">
                        {program.admissionRate}%
                      </text>
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Admission Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementsSection;
