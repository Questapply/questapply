import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { 
  CheckCircle, 
  ArrowRight, 
  Flag, 
  GraduationCap, 
  Globe, 
  Languages, 
  TestTube,
  DollarSign
} from "lucide-react";
import { ProfileCompleteProps } from "./ProfileTypes";

const ProfileComplete: React.FC<ProfileCompleteProps> = ({ onNext, profileData, applicationType  }) => {
  const navigate = useNavigate();
  
  // تابع کمکی برای بررسی وجود نمرات معنادار در آبجکت آزمون
  const hasValidTestScores = (testObj: any): boolean => {
    if (!testObj || !testObj.scores) return false;
    
    return Object.values(testObj.scores).some(value => 
      value !== null && 
      value !== undefined && 
      value !== '' && 
      String(value) !== '0'
    );
  };
  
  // کمک‌کننده برای استخراج مقدار نمایشی
  const formatDisplayValue = (value: any): string => {
    if (!value) return "Not specified";
    
    if (typeof value === 'object') {
      // اگر آبجکت دارای فیلد name باشد، از آن استفاده می‌کنیم
      if (value.name) return value.name;
      
      // در غیر این صورت، سعی می‌کنیم به رشته تبدیل کنیم
      return JSON.stringify(value);
    }
    
    return String(value);
  };
  
  const handleContinue = () => {
    if (applicationType === 'applyyourself') {
      navigate('/dashboard');
    } else {
      onNext({ completed: true });
    }
  };

  // بررسی وجود نمرات معنادار در هر آزمون
  const hasGREScores = profileData?.tests?.scores?.gre?.active && 
                       profileData?.tests?.scores?.gre?.scores?.total;
  const hasGMATScores = profileData?.tests?.scores?.gmat?.active && 
                        profileData?.tests?.scores?.gmat?.scores?.total;
  const hasLSATScores = profileData?.tests?.scores?.lsat?.active && 
                        profileData?.tests?.scores?.lsat?.scores?.total;

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const iconAnimation = {
    hidden: { scale: 0, rotate: -45 },
    show: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    }
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
              className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Complete!</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Thank you for completing your profile. We now have all the information we need to help you find the perfect programs.
          </p>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800/30"
        >
          <h3 className="text-xl font-medium text-gray-900 dark:text-white text-center mb-6">Your Profile Summary</h3>
          
          <div className="space-y-6">
            {/* Citizenship & Residency Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Flag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Citizenship & Residency</h4>
              </div>
              <div className="ml-9 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Citizenship:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.citizenship?.country)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Current Residence:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.citizenship?.residence)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Education Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                  <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Education</h4>
              </div>
              <div className="ml-9 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Highest Degree:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.education?.degree)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">University:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.education?.university)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Major:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.education?.major)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">GPA:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.education?.gpa)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Destination Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Study Destination</h4>
              </div>
              <div className="ml-9 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Country:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.goals?.country)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Study Level:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.goals?.level)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Field of Study:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDisplayValue(profileData.goals?.field)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Language Proficiency Section */}
            {profileData.language?.test && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <Languages className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Language Proficiency</h4>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Test Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDisplayValue(profileData.language.test)}
                    </span>
                  </div>
                  {profileData.language.score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Score:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {profileData.language.score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Standardized Tests Section */}
            {(profileData.tests?.type || hasGREScores || hasGMATScores || hasLSATScores) && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <TestTube className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Standardized Tests</h4>
                </div>
                <div className="ml-9 space-y-2">
                  {/* GRE Test Information */}
                  {hasGREScores && (
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <span className="bg-red-100 dark:bg-red-900/30 p-1 rounded text-red-600 dark:text-red-400 text-sm mr-2">GRE</span>
                        <span>Graduate Record Examination</span>
                      </div>
                      <div className="ml-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                        {profileData.tests.scores.gre.scores.total && (
                          <div className="flex flex-col md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Score</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {profileData.tests.scores.gre.scores.total}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 340</span>
                            </span>
                          </div>
                        )}
                        <div className="space-y-3">
                          {profileData.tests.scores.gre.scores.verbal && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Verbal Reasoning</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gre.scores.verbal}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 170</span>
                              </span>
                            </div>
                          )}
                          {profileData.tests.scores.gre.scores.writing && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Analytical Writing</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gre.scores.writing}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 6.0</span>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {profileData.tests.scores.gre.scores.quantitative && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Quantitative Reasoning</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gre.scores.quantitative}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 170</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* GMAT Test Information */}
                  {hasGMATScores && (
                    <div className="mt-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded text-blue-600 dark:text-blue-400 text-sm mr-2">GMAT</span>
                        <span>Graduate Management Admission Test</span>
                      </div>
                      <div className="ml-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                        {profileData.tests.scores.gmat.scores.total && (
                          <div className="flex flex-col md:col-span-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Total Score</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {profileData.tests.scores.gmat.scores.total}
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 800</span>
                            </span>
                          </div>
                        )}
                        <div className="space-y-3">
                          {profileData.tests.scores.gmat.scores.verbal && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Verbal Reasoning</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gmat.scores.verbal}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 60</span>
                              </span>
                            </div>
                          )}
                          {profileData.tests.scores.gmat.scores.writing && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Analytical Writing Assessment</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gmat.scores.writing}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 6.0</span>
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {profileData.tests.scores.gmat.scores.quantitative && (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Quantitative Reasoning</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {profileData.tests.scores.gmat.scores.quantitative}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 60</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* LSAT Test Information */}
                  {hasLSATScores && (
                    <div className="mt-4">
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                        <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded text-purple-600 dark:text-purple-400 text-sm mr-2">LSAT</span>
                        <span>Law School Admission Test</span>
                      </div>
                      <div className="ml-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Score</span>
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {profileData.tests.scores.lsat.scores.total}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">/ 180</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Financial Section */}
            {profileData.financial?.requiresFunding !== undefined && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Financial Status</h4>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Funding Needs:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileData.financial.requiresFunding 
                        ? "Requires Full Funding" 
                        : (profileData.financial.budget 
                            ? `$${parseInt(profileData.financial.budget).toLocaleString()} Budget/Year`
                            : "Self-funded"
                          )
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Programs Section */}
            {profileData.programs?.count > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Programs</h4>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Number of Applications:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileData.programs.count} Programs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center pt-6">
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            Begin Your Journey
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileComplete;
