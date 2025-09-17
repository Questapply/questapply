// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { Button } from "../ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { GradientCard } from "@/components/ui/gradient-card";
// import {
//   Search,
//   BookOpen,
//   User,
//   FileText,
//   Send,
//   Calendar,
//   Activity,
//   Edit,
//   Download,
//   Share,
//   Eye,
//   Plus,
//   Star
// } from "lucide-react";
// import FindSchools from "@/components/dashboard/sections/FindSchools";
// import FindPrograms from "@/components/dashboard/sections/FindPrograms";
// import FindProfessors from "@/components/dashboard/sections/FindProfessors";
// import { cn } from "@/lib/utils";
// import { Card, CardContent } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import LORSamplesSection from "@/components/dashboard/sections/create-lor/LORSamplesSection";
// import RoadmapApplyNow from "./sections/apply-now/RoadmapApplyNow";

// const RoadmapSection = () => {
//   // States for tracking active step and selected programs
//   const [activeStep, setActiveStep] = useState<number>(1); // Default to step 1 (Find Schools)
//   const [showFindSchools, setShowFindSchools] = useState(true); // Start with Find Schools visible
//   const [showFindPrograms, setShowFindPrograms] = useState(false);
//   const [showFindProfessors, setShowFindProfessors] = useState(false);
//   const [showApplyPopup, setShowApplyPopup] = useState(false);
//   const [showApplicationForm, setShowApplicationForm] = useState(false);
//   const [selectedResume, setSelectedResume] = useState("academic");
//   const [viewingSection, setViewingSection] = useState("");
//   const [activeSOPTab, setActiveSOPTab] = useState("samples");
//   const [activeLORTab, setActiveLORTab] = useState("samples");

//   // Step data with blue color scheme
//   const steps = [
//     {
//       id: 1,
//       title: "Find Schools",
//       icon: <Search className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 2,
//       title: "Find Programs",
//       icon: <BookOpen className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 3,
//       title: "Find Professors",
//       icon: <User className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 4,
//       title: "Create Resume",
//       icon: <FileText className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 5,
//       title: "Create SOP",
//       icon: <FileText className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 6,
//       title: "Create LOR",
//       icon: <FileText className="h-5 w-5" />,
//       color: "#0EA5E9"
//     },
//     {
//       id: 7,
//       title: "Apply Now",
//       icon: <Send className="h-5 w-5" />,
//       color: "#0EA5E9"
//     }
//   ];

//   // SOP samples data
//   const sopSamples = [
//     {
//       id: 1,
//       title: "Computer Science Ph.D.",
//       university: "Stanford University",
//       content: "My interest in computer science began when I built my first program at age 13...",
//       rating: 5
//     },
//     {
//       id: 2,
//       title: "Molecular Biology Master's",
//       university: "MIT",
//       content: "The complex mechanisms of cellular function have fascinated me since my undergraduate research...",
//       rating: 5
//     },
//     {
//       id: 3,
//       title: "Economics Ph.D.",
//       university: "Harvard University",
//       content: "Working at the intersection of behavioral economics and public policy has shown me...",
//       rating: 4
//     },
//     {
//       id: 4,
//       title: "Mechanical Engineering Master's",
//       university: "UC Berkeley",
//       content: "My experience designing sustainable energy solutions has prepared me to contribute to...",
//       rating: 4
//     },
//     {
//       id: 5,
//       title: "Psychology Ph.D.",
//       university: "University of Michigan",
//       content: "Through my clinical experience and research in cognitive development, I've observed...",
//       rating: 5
//     },
//     {
//       id: 6,
//       title: "Business MBA",
//       university: "Wharton School",
//       content: "Leading teams in technology startups has honed my understanding of organizational...",
//       rating: 4
//     }
//   ];

//   // Resume sections data for the Create Resume step
//   const resumeSections = [
//     { id: "personal", title: "Personal Information", complete: true },
//     { id: "summary", title: "Summary", complete: true },
//     { id: "research", title: "Research Interests", complete: true },
//     { id: "education", title: "Education", complete: true },
//     { id: "experience", title: "Professional History", complete: true },
//     { id: "publications", title: "Publications", complete: false },
//     { id: "skills", title: "Certifications and Skills", complete: true },
//     { id: "awards", title: "Honors and Awards", complete: false },
//     { id: "memberships", title: "Memberships", complete: false },
//     { id: "interests", title: "Interests and Hobbies", complete: true },
//     { id: "references", title: "References", complete: false }
//   ];

//   // Handle step click
//   const handleStepClick = (stepId: number) => {
//     setActiveStep(stepId);

//     // Reset all display states
//     setShowFindSchools(false);
//     setShowFindPrograms(false);
//     setShowFindProfessors(false);
//     setShowApplyPopup(false);
//     setShowApplicationForm(false);

//     // Handle specific step actions without auto-scrolling
//     if (stepId === 1) {
//       setShowFindSchools(true);
//     } else if (stepId === 2) {
//       setShowFindPrograms(true);
//     } else if (stepId === 3) {
//       setShowFindProfessors(true);
//     } else if (stepId === 7) {
//       // For Apply Now, we'll show the component directly
//       setShowApplicationForm(true);
//     }
//   };

//   // Handle applying (for step 7)
//   const handleApplyNow = () => {
//     setShowApplyPopup(false);
//     setShowApplicationForm(true);
//   };

//   const handleSubmitWithUs = () => {
//     // In a real app, this would handle the submission form
//     console.log("Submit with us clicked");
//   };

//   // Animation variants
//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0 }
//   };

//   // Render star ratings
//   const renderRating = (rating: number) => {
//     return (
//       <div className="flex">
//         {[...Array(5)].map((_, i) => (
//           <Star
//             key={i}
//             className={cn(
//               "h-4 w-4",
//               i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
//             )}
//           />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="w-full bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900 dark:from-purple-800 dark:via-indigo-900 dark:to-purple-900 light:from-purple-200 light:via-indigo-100 light:to-purple-100 py-20 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Section Title - Now white in both modes */}
//         <motion.h2
//           className="text-3xl md:text-4xl lg:text-[4.5rem] font-bold text-center mb-4 text-white"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           viewport={{ once: true }}
//         >
//           <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AI-Powered</span> Roadmap to Success
//         </motion.h2>

//         {/* Subtitle - Increased spacing to match Hero section (mb-16 -> mb-8) */}
//         <motion.p
//           className="text-lg md:text-xl text-center mb-8 dark:text-purple-200 text-purple-700"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           viewport={{ once: true }}
//         >
//           A smart, step-by-step guide that uses AI to help you reach your educational and career goals.
//         </motion.p>

//         {/* Apply With Us Button - Centered in header area */}
//         <motion.div
//           className="flex justify-center mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           viewport={{ once: true }}
//         >
//           <Button
//             onClick={() => window.location.href = "/apply-with-us/profile"}
//             className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
//           >
//             Apply With Us
//           </Button>
//         </motion.div>

//         {/* Roadmap Container */}
//         <div className="w-full max-w-[1216px] mx-auto">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             viewport={{ once: true }}
//           >
//             <GradientCard
//               variant="talent-section"
//               className="p-4 md:p-6 shadow-xl w-full dark:bg-gray-800 bg-white/90"
//             >
//               {/* Updated Button Layout - with icons above text */}
//               <div className="flex justify-center items-center my-6 px-3 py-2">
//                 <div className="flex flex-wrap justify-center gap-2 w-full">
//                   {steps.map((step) => (
//                     <React.Fragment key={step.id}>
//                       {/* Button */}
//                       <motion.button
//                         className={cn(
//                           "relative flex flex-col items-center justify-center px-4 py-4 rounded-md text-sm md:text-base transition-all duration-300",
//                           "border border-gray-200 dark:border-gray-700",
//                           activeStep === step.id
//                             ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-700 shadow-md shadow-blue-500/20"
//                             : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-600"
//                         )}
//                         onClick={() => handleStepClick(step.id)}
//                         whileHover={{
//                           y: -2,
//                           boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
//                         }}
//                         style={{
//                           width: `calc(${100 / steps.length}% - 8px)`,
//                           minWidth: '130px',
//                           maxWidth: '160px',
//                           height: '90px' // Increased height to accommodate vertical layout
//                         }}
//                       >
//                         {/* Icon - Now positioned above text */}
//                         <span
//                           className={cn(
//                             "flex items-center justify-center h-8 w-8 rounded-md mb-2",
//                             activeStep === step.id ? "text-white" : ""
//                           )}
//                           style={{ color: activeStep === step.id ? "#ffffff" : step.color }}
//                         >
//                           {step.icon}
//                         </span>

//                         {/* Step Title */}
//                         <span className="font-medium whitespace-nowrap text-center">
//                           {step.title}
//                         </span>
//                       </motion.button>
//                     </React.Fragment>
//                   ))}
//                 </div>
//               </div>

//               {/* Dynamic Content Area - Fixed height with scrolling */}
//               <div className="mt-6">
//                 <ScrollArea className="h-[600px] rounded-md px-1">
//                   {activeStep === 1 && showFindSchools && (
//                     <FindSchools />
//                   )}

//                   {activeStep === 2 && showFindPrograms && (
//                     <FindPrograms />
//                   )}

//                   {activeStep === 3 && showFindProfessors && (
//                     <FindProfessors />
//                   )}

//                   {activeStep === 4 && (
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.3 }}
//                       className="p-6"
//                     >
//                       {/* Tabs navigation - matching dashboard appearance without horizontal scroll */}
//                       <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
//                         {[
//                           { id: "guidance", icon: <BookOpen className="w-4 h-4" />, label: "Guidance" },
//                           { id: "template", icon: <FileText className="w-4 h-4" />, label: "Choose Template" },
//                           { id: "myResumes", icon: <FileText className="w-4 h-4" />, label: "My Resumes", active: true },
//                           { id: "aiImprovement", icon: <Activity className="w-4 h-4" />, label: "AI Improvement" },
//                           { id: "universityMatch", icon: <User className="w-4 h-4" />, label: "Match with University" },
//                           { id: "successStories", icon: <BookOpen className="w-4 h-4" />, label: "Success Stories" },
//                           { id: "atsAnalysis", icon: <FileText className="w-4 h-4" />, label: "ATS Analysis" }
//                         ].map((tab) => (
//                           <div
//                             key={tab.id}
//                             className={`
//                               px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
//                               ${tab.active ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 -mb-px' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}
//                             `}
//                           >
//                             {tab.icon}
//                             {tab.label}
//                           </div>
//                         ))}
//                       </div>

//                       <motion.div
//                         className="flex justify-between items-center mb-6"
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h2>
//                         <Button className="bg-blue-600 hover:bg-blue-700 text-white">
//                           <Plus className="h-4 w-4 mr-2" />
//                           Create New Resume
//                         </Button>
//                       </motion.div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         <div className="md:col-span-1">
//                           <motion.div
//                             className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.5 }}
//                           >
//                             <div className="p-5 border-b border-gray-200 dark:border-gray-700">
//                               <h3 className="font-semibold text-lg text-gray-900 dark:text-white">My Documents</h3>
//                             </div>
//                             <div className="p-0">
//                               {/* Left sidebar tabs */}
//                               <div className="flex flex-col w-full rounded-none border-none bg-transparent h-auto">
//                                 <div
//                                   className="justify-start py-3 px-5 text-left border-l-2 border-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-blue-900/20 rounded-none bg-blue-50 dark:bg-blue-900/20"
//                                 >
//                                   Academic CV
//                                 </div>
//                                 <div
//                                   className="justify-start py-3 px-5 text-left border-l-2 border-transparent rounded-none text-gray-600 dark:text-gray-300"
//                                 >
//                                   Professional Resume
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         </div>

//                         <div className="md:col-span-2">
//                           <motion.div
//                             className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
//                             initial={{ opacity: 0, x: 20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ duration: 0.5 }}
//                           >
//                             <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//                               <div>
//                                 <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
//                                   Academic CV
//                                 </h3>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: May 16, 2025</p>
//                               </div>
//                               <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
//                                 7/11 Complete
//                               </div>
//                             </div>

//                             <div className="p-5">
//                               <div className="flex space-x-4 mb-6">
//                                 <Button size="sm">
//                                   <Edit className="h-4 w-4 mr-2" />
//                                   Edit
//                                 </Button>
//                                 <Button size="sm" variant="outline">
//                                   <Download className="h-4 w-4 mr-2" />
//                                   Download
//                                 </Button>
//                                 <Button size="sm" variant="outline">
//                                   <Share className="h-4 w-4 mr-2" />
//                                   Share
//                                 </Button>
//                               </div>

//                               <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">Sections</h4>

//                               <motion.div
//                                 className="grid grid-cols-1 sm:grid-cols-2 gap-3"
//                                 variants={container}
//                                 initial="hidden"
//                                 animate="show"
//                               >
//                                 {resumeSections.map((section) => (
//                                   <motion.div
//                                     key={section.id}
//                                     variants={item}
//                                     whileHover={{ scale: 1.02 }}
//                                     transition={{ type: "spring", stiffness: 400, damping: 10 }}
//                                   >
//                                     <Dialog>
//                                       <DialogTrigger asChild>
//                                         <Card
//                                           className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
//                                         >
//                                           <CardContent className="p-4 flex justify-between items-center">
//                                             <div>
//                                               <h5 className="font-medium text-gray-900 dark:text-white">{section.title}</h5>
//                                               <p className="text-xs text-gray-500 dark:text-gray-400">
//                                                 {section.complete ? "Complete" : "Not complete"}
//                                               </p>
//                                             </div>
//                                             <div className={`w-2 h-2 rounded-full ${section.complete ? "bg-green-500" : "bg-amber-500"}`}></div>
//                                             <Eye className="h-4 w-4 text-gray-400" />
//                                           </CardContent>
//                                         </Card>
//                                       </DialogTrigger>
//                                       <DialogContent className="sm:max-w-md">
//                                         <DialogHeader>
//                                           <DialogTitle>{section.title}</DialogTitle>
//                                         </DialogHeader>
//                                         <div className="py-4">
//                                           {section.id === "personal" && (
//                                             <div className="space-y-4">
//                                               <div>
//                                                 <h3 className="font-semibold">Dr. Sarah Johnson</h3>
//                                                 <p className="text-sm text-gray-500">Neuroscience Researcher</p>
//                                               </div>
//                                               <div className="grid grid-cols-2 gap-4 text-sm">
//                                                 <div>
//                                                   <p className="text-gray-500">Email:</p>
//                                                   <p>sarah.johnson@university.edu</p>
//                                                 </div>
//                                                 <div>
//                                                   <p className="text-gray-500">Phone:</p>
//                                                   <p>(123) 456-7890</p>
//                                                 </div>
//                                                 <div>
//                                                   <p className="text-gray-500">Address:</p>
//                                                   <p>123 University Ave, Boston, MA</p>
//                                                 </div>
//                                                 <div>
//                                                   <p className="text-gray-500">LinkedIn:</p>
//                                                   <p>linkedin.com/in/sarahjohnson</p>
//                                                 </div>
//                                               </div>
//                                             </div>
//                                           )}
//                                           {section.id !== "personal" && (
//                                             <p className="text-gray-500">
//                                               {section.complete
//                                                 ? "This section has been completed. Click Edit to modify its contents."
//                                                 : "This section needs to be completed. Click Edit to add content."}
//                                             </p>
//                                           )}
//                                         </div>
//                                         <div className="flex justify-end">
//                                           <Button>
//                                             <Edit className="h-4 w-4 mr-2" />
//                                             Edit Section
//                                           </Button>
//                                         </div>
//                                       </DialogContent>
//                                     </Dialog>
//                                   </motion.div>
//                                 ))}
//                               </motion.div>
//                             </div>
//                           </motion.div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {activeStep === 5 && (
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.3 }}
//                       className="p-4 md:p-6 mx-auto"
//                     >
//                       {/* SOP Tabs - without horizontal scroll */}
//                       <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
//                         {[
//                           { id: "guidance", icon: <BookOpen className="w-4 h-4" />, label: "Guidance" },
//                           { id: "samples", icon: <FileText className="w-4 h-4" />, label: "Samples", active: true },
//                           { id: "mySop", icon: <FileText className="w-4 h-4" />, label: "My SOP" },
//                           { id: "aiImprovement", icon: <Activity className="w-4 h-4" />, label: "AI Improvement" },
//                           { id: "universityMatch", icon: <User className="w-4 h-4" />, label: "Match with University" },
//                           { id: "successStories", icon: <BookOpen className="w-4 h-4" />, label: "Success Stories" },
//                           { id: "aiHumanizer", icon: <User className="w-4 h-4" />, label: "AI Humanizer" }
//                         ].map((tab) => (
//                           <div
//                             key={tab.id}
//                             onClick={() => setActiveSOPTab(tab.id)}
//                             className={`
//                               px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium cursor-pointer transition-all duration-300
//                               ${(tab.active || activeSOPTab === tab.id) ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 -mb-px' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}
//                             `}
//                           >
//                             {tab.icon}
//                             {tab.label}
//                           </div>
//                         ))}
//                       </div>

//                       {/* SOP Samples Content */}
//                       <div className="space-y-6">
//                         <div>
//                           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sample Statements of Purpose</h2>

//                           {/* Filters */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//                             <div>
//                               <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Degree Level</h3>
//                               <Select defaultValue="all">
//                                 <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                                   <SelectValue placeholder="All Degrees" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="all">All Degrees</SelectItem>
//                                   <SelectItem value="phd">PhD</SelectItem>
//                                   <SelectItem value="masters">Master's</SelectItem>
//                                   <SelectItem value="mba">MBA</SelectItem>
//                                   <SelectItem value="bachelors">Bachelor's</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>

//                             <div>
//                               <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Field of Study</h3>
//                               <Select defaultValue="all">
//                                 <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                                   <SelectValue placeholder="All Fields" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="all">All Fields</SelectItem>
//                                   <SelectItem value="cs">Computer Science</SelectItem>
//                                   <SelectItem value="biology">Biology</SelectItem>
//                                   <SelectItem value="economics">Economics</SelectItem>
//                                   <SelectItem value="engineering">Engineering</SelectItem>
//                                   <SelectItem value="psychology">Psychology</SelectItem>
//                                   <SelectItem value="business">Business</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                           </div>

//                           {/* Sample SOPs */}
//                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                             {sopSamples.map((sample) => (
//                               <motion.div
//                                 key={sample.id}
//                                 whileHover={{ y: -5, transition: { duration: 0.2 } }}
//                                 className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
//                               >
//                                 <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
//                                 <div className="p-5">
//                                   <div className="flex justify-between items-start mb-2">
//                                     <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{sample.title}</h3>
//                                     {renderRating(sample.rating)}
//                                   </div>
//                                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{sample.university}</p>
//                                   <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">{sample.content}</p>
//                                   <div className="flex justify-between items-center">
//                                     <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20">
//                                       Read More
//                                     </Button>
//                                     <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
//                                       <Share className="h-4 w-4" />
//                                     </button>
//                                   </div>
//                                 </div>
//                               </motion.div>
//                             ))}
//                           </div>

//                           {/* Load More Button */}
//                           <div className="flex justify-center mt-8">
//                             <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
//                               Load More Samples
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}

//                   {activeStep === 6 && (
//                     <motion.div
//                       className="p-4 md:p-6"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       {/* LOR section header */}
//                       <motion.h1
//                         className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-6"
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5 }}
//                       >
//                         Letter of Recommendation
//                       </motion.h1>

//                       {/* Modified LOR tabs to remove horizontal scrolling and disable most buttons */}
//                       <div className="flex w-full mb-6 border-b border-gray-200 dark:border-gray-700">
//                         {[
//                           { id: "guidance", icon: <BookOpen className="w-4 h-4" />, label: "Guidance" },
//                           { id: "samples", icon: <FileText className="w-4 h-4" />, label: "LOR Samples", active: true },
//                           { id: "mylors", icon: <FileText className="w-4 h-4" />, label: "My LORs" },
//                           { id: "improvement", icon: <Activity className="w-4 h-4" />, label: "AI Improvement" },
//                           { id: "strengths", icon: <Activity className="w-4 h-4" />, label: "Highlight Strengths" },
//                           { id: "tone", icon: <FileText className="w-4 h-4" />, label: "Professional Tone" },
//                           { id: "humanizer", icon: <User className="w-4 h-4" />, label: "AI Humanizer" }
//                         ].map((tab) => (
//                           <div
//                             key={tab.id}
//                             // Only allow clicks on samples tab, all others are disabled
//                             onClick={tab.id === "samples" ? () => setActiveLORTab("samples") : undefined}
//                             className={`
//                               px-4 py-3 flex items-center gap-2 whitespace-nowrap font-medium transition-all duration-300
//                               ${tab.id === "samples" ? "cursor-pointer" : "cursor-default opacity-70"}
//                               ${(tab.active || activeLORTab === tab.id) ? 'text-teal-500 dark:text-teal-400 border-b-2 border-teal-500 dark:border-teal-400 -mb-px' : 'text-gray-600 dark:text-gray-300'}
//                             `}
//                           >
//                             {tab.icon}
//                             {tab.label}
//                           </div>
//                         ))}
//                       </div>

//                       {/* LOR Samples content - only showing this tab */}
//                       <LORSamplesSection />
//                     </motion.div>
//                   )}

//                   {activeStep === 7 && showApplicationForm && (
//                     <RoadmapApplyNow />
//                   )}
//                 </ScrollArea>
//               </div>
//             </GradientCard>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoadmapSection;
////////////////////////////
///////////////////////////

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { GradientCard } from "../ui/gradient-card";
import {
  Search,
  BookOpen,
  User,
  FileText,
  Send,
  Calendar,
  Activity,
  Edit,
  Download,
  Share,
  Eye,
  Plus,
  Star,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import LORSamplesSection from "../create-lor/LORSamplesSection";
import RoadmapApplyNow from "./sections/apply-now/RoadmapApplyNow";
import StaticSchoolList from "./StaticSchoolsList";
import StaticProgramList from "./StaticProgramsList";
import StaticProfessorList from "./StaticProfessorsList";
const RoadmapSection = () => {
  // States for tracking active step and selected programs
  const [activeStep, setActiveStep] = useState<number>(1); // Default to step 1 (Find Schools)
  const [showFindSchools, setShowFindSchools] = useState(true); // Start with Find Schools visible
  const [showFindPrograms, setShowFindPrograms] = useState(false);
  const [showFindProfessors, setShowFindProfessors] = useState(false);
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedResume, setSelectedResume] = useState("academic");
  const [viewingSection, setViewingSection] = useState("");
  const [activeSOPTab, setActiveSOPTab] = useState("samples");
  const [activeLORTab, setActiveLORTab] = useState("samples");

  // Step data with blue color scheme
  const steps = [
    {
      id: 1,
      title: "Find Schools",
      icon: <Search className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 2,
      title: "Find Programs",
      icon: <BookOpen className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 3,
      title: "Find Professors",
      icon: <User className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 4,
      title: "Create Resume",
      icon: <FileText className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 5,
      title: "Create SOP",
      icon: <FileText className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 6,
      title: "Create LOR",
      icon: <FileText className="h-5 w-5" />,
      color: "#0EA5E9",
    },
    {
      id: 7,
      title: "Apply Now",
      icon: <Send className="h-5 w-5" />,
      color: "#0EA5E9",
    },
  ];

  // SOP samples data
  const sopSamples = [
    {
      id: 1,
      title: "Computer Science Ph.D.",
      university: "Stanford University",
      content:
        "My interest in computer science began when I built my first program at age 13...",
      rating: 5,
    },
    {
      id: 2,
      title: "Molecular Biology Master's",
      university: "MIT",
      content:
        "The complex mechanisms of cellular function have fascinated me since my undergraduate research...",
      rating: 5,
    },
    {
      id: 3,
      title: "Economics Ph.D.",
      university: "Harvard University",
      content:
        "Working at the intersection of behavioral economics and public policy has shown me...",
      rating: 4,
    },
    {
      id: 4,
      title: "Mechanical Engineering Master's",
      university: "UC Berkeley",
      content:
        "My experience designing sustainable energy solutions has prepared me to contribute to...",
      rating: 4,
    },
    {
      id: 5,
      title: "Psychology Ph.D.",
      university: "University of Michigan",
      content:
        "Through my clinical experience and research in cognitive development, I've observed...",
      rating: 5,
    },
    {
      id: 6,
      title: "Business MBA",
      university: "Wharton School",
      content:
        "Leading teams in technology startups has honed my understanding of organizational...",
      rating: 4,
    },
  ];

  // Resume sections data for the Create Resume step
  const resumeSections = [
    { id: "personal", title: "Personal Information", complete: true },
    { id: "summary", title: "Summary", complete: true },
    { id: "research", title: "Research Interests", complete: true },
    { id: "education", title: "Education", complete: true },
    { id: "experience", title: "Professional History", complete: true },
    { id: "publications", title: "Publications", complete: false },
    { id: "skills", title: "Certifications and Skills", complete: true },
    { id: "awards", title: "Honors and Awards", complete: false },
    { id: "memberships", title: "Memberships", complete: false },
    { id: "interests", title: "Interests and Hobbies", complete: true },
    { id: "references", title: "References", complete: false },
  ];

  // Handle step click
  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);

    // Reset all display states
    setShowFindSchools(false);
    setShowFindPrograms(false);
    setShowFindProfessors(false);
    setShowApplyPopup(false);
    setShowApplicationForm(false);

    // Handle specific step actions without auto-scrolling
    if (stepId === 1) {
      setShowFindSchools(true);
    } else if (stepId === 2) {
      setShowFindPrograms(true);
    } else if (stepId === 3) {
      setShowFindProfessors(true);
    } else if (stepId === 7) {
      // For Apply Now, we'll show the component directly
      setShowApplicationForm(true);
    }
  };

  // Handle applying (for step 7)
  const handleApplyNow = () => {
    setShowApplyPopup(false);
    setShowApplicationForm(true);
  };

  const handleSubmitWithUs = () => {
    // In a real app, this would handle the submission form
    console.log("Submit with us clicked");
  };

  // Animation variants
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

  // Render star ratings
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900 dark:from-purple-800 dark:via-indigo-900 dark:to-purple-900 light:from-purple-200 light:via-indigo-100 light:to-purple-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title - Now white in both modes */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-[4.5rem] font-bold text-center mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{" "}
          Roadmap to Success
        </motion.h2>

        {/* Subtitle - Increased spacing to match Hero section (mb-16 -> mb-8) */}
        <motion.p
          className="text-lg md:text-xl text-center mb-8 dark:text-purple-200 text-purple-700"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          A smart, step-by-step guide that uses AI to help you reach your
          educational and career goals.
        </motion.p>

        {/* Apply With Us Button - Centered in header area */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Button
            onClick={() => (window.location.href = "/apply-with-us/profile")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            Apply With Us
          </Button>
        </motion.div>

        {/* Roadmap Container */}
        <div className="w-full max-w-[1216px] mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <GradientCard
              variant="talent-section"
              className="p-4 md:p-6 shadow-xl w-full dark:bg-gray-800 bg-white/90"
            >
              {/* Updated Button Layout - with icons above text */}
              <div className="flex justify-center items-center my-6 px-3 py-2">
                <div className="flex flex-wrap justify-center gap-2 w-full">
                  {steps.map((step) => (
                    <React.Fragment key={step.id}>
                      {/* Button */}
                      <motion.button
                        className={cn(
                          "relative flex flex-col items-center justify-center px-4 py-4 rounded-md text-sm md:text-base transition-all duration-300",
                          "border border-gray-200 dark:border-gray-700",
                          activeStep === step.id
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-700 shadow-md shadow-blue-500/20"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-600"
                        )}
                        onClick={() => handleStepClick(step.id)}
                        whileHover={{
                          y: -2,
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        style={{
                          width: `calc(${100 / steps.length}% - 8px)`,
                          minWidth: "130px",
                          maxWidth: "160px",
                          height: "90px", // Increased height to accommodate vertical layout
                        }}
                      >
                        {/* Icon - Now positioned above text */}
                        <span
                          className={cn(
                            "flex items-center justify-center h-8 w-8 rounded-md mb-2",
                            activeStep === step.id ? "text-white" : ""
                          )}
                          style={{
                            color:
                              activeStep === step.id ? "#ffffff" : step.color,
                          }}
                        >
                          {step.icon}
                        </span>

                        {/* Step Title */}
                        <span className="font-medium whitespace-nowrap text-center">
                          {step.title}
                        </span>
                      </motion.button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Dynamic Content Area - Fixed height with scrolling */}
              <div className="mt-6">
                <ScrollArea className="h-[600px] rounded-md px-1">
                  {activeStep === 1 && showFindSchools && <StaticSchoolList />}

                  {activeStep === 2 && showFindPrograms && (
                    <StaticProgramList />
                  )}

                  {activeStep === 3 && showFindProfessors && (
                    <StaticProfessorList />
                  )}

                  {activeStep === 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      {/* Tabs navigation - matching dashboard appearance without horizontal scroll */}
                      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
                        {[
                          {
                            id: "guidance",
                            icon: <BookOpen className="w-4 h-4" />,
                            label: "Guidance",
                          },
                          {
                            id: "template",
                            icon: <FileText className="w-4 h-4" />,
                            label: "Choose Template",
                          },
                          {
                            id: "myResumes",
                            icon: <FileText className="w-4 h-4" />,
                            label: "My Resumes",
                            active: true,
                          },
                          {
                            id: "aiImprovement",
                            icon: <Activity className="w-4 h-4" />,
                            label: "AI Improvement",
                          },
                          {
                            id: "universityMatch",
                            icon: <User className="w-4 h-4" />,
                            label: "Match with University",
                          },
                          {
                            id: "successStories",
                            icon: <BookOpen className="w-4 h-4" />,
                            label: "Success Stories",
                          },
                          {
                            id: "atsAnalysis",
                            icon: <FileText className="w-4 h-4" />,
                            label: "ATS Analysis",
                          },
                        ].map((tab) => (
                          <div
                            key={tab.id}
                            className={`
                              px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
                              ${
                                tab.active
                                  ? "text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 -mb-px"
                                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                              }
                            `}
                          >
                            {tab.icon}
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <motion.div
                        className="flex justify-between items-center mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          My Resumes
                        </h2>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Resume
                        </Button>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                          <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                My Documents
                              </h3>
                            </div>
                            <div className="p-0">
                              {/* Left sidebar tabs */}
                              <div className="flex flex-col w-full rounded-none border-none bg-transparent h-auto">
                                <div className="justify-start py-3 px-5 text-left border-l-2 border-blue-600 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:dark:bg-blue-900/20 rounded-none bg-blue-50 dark:bg-blue-900/20">
                                  Academic CV
                                </div>
                                <div className="justify-start py-3 px-5 text-left border-l-2 border-transparent rounded-none text-gray-600 dark:text-gray-300">
                                  Professional Resume
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="md:col-span-2">
                          <motion.div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                  Academic CV
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Last updated: May 16, 2025
                                </p>
                              </div>
                              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                                7/11 Complete
                              </div>
                            </div>

                            <div className="p-5">
                              <div className="flex space-x-4 mb-6">
                                <Button size="sm">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Share className="h-4 w-4 mr-2" />
                                  Share
                                </Button>
                              </div>

                              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
                                Sections
                              </h4>

                              <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                variants={container}
                                initial="hidden"
                                animate="show"
                              >
                                {resumeSections.map((section) => (
                                  <motion.div
                                    key={section.id}
                                    variants={item}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 400,
                                      damping: 10,
                                    }}
                                  >
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Card className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                                          <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                              <h5 className="font-medium text-gray-900 dark:text-white">
                                                {section.title}
                                              </h5>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {section.complete
                                                  ? "Complete"
                                                  : "Not complete"}
                                              </p>
                                            </div>
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                section.complete
                                                  ? "bg-green-500"
                                                  : "bg-amber-500"
                                              }`}
                                            ></div>
                                            <Eye className="h-4 w-4 text-gray-400" />
                                          </CardContent>
                                        </Card>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>
                                            {section.title}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4">
                                          {section.id === "personal" && (
                                            <div className="space-y-4">
                                              <div>
                                                <h3 className="font-semibold">
                                                  Dr. Sarah Johnson
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                  Neuroscience Researcher
                                                </p>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                  <p className="text-gray-500">
                                                    Email:
                                                  </p>
                                                  <p>
                                                    sarah.johnson@university.edu
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-gray-500">
                                                    Phone:
                                                  </p>
                                                  <p>(123) 456-7890</p>
                                                </div>
                                                <div>
                                                  <p className="text-gray-500">
                                                    Address:
                                                  </p>
                                                  <p>
                                                    123 University Ave, Boston,
                                                    MA
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-gray-500">
                                                    LinkedIn:
                                                  </p>
                                                  <p>
                                                    linkedin.com/in/sarahjohnson
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          {section.id !== "personal" && (
                                            <p className="text-gray-500">
                                              {section.complete
                                                ? "This section has been completed. Click Edit to modify its contents."
                                                : "This section needs to be completed. Click Edit to add content."}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex justify-end">
                                          <Button>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Section
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 5 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 md:p-6 mx-auto"
                    >
                      {/* SOP Tabs - without horizontal scroll */}
                      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
                        {[
                          {
                            id: "guidance",
                            icon: <BookOpen className="w-4 h-4" />,
                            label: "Guidance",
                          },
                          {
                            id: "samples",
                            icon: <FileText className="w-4 h-4" />,
                            label: "Samples",
                            active: true,
                          },
                          {
                            id: "mySop",
                            icon: <FileText className="w-4 h-4" />,
                            label: "My SOP",
                          },
                          {
                            id: "aiImprovement",
                            icon: <Activity className="w-4 h-4" />,
                            label: "AI Improvement",
                          },
                          {
                            id: "universityMatch",
                            icon: <User className="w-4 h-4" />,
                            label: "Match with University",
                          },
                          {
                            id: "successStories",
                            icon: <BookOpen className="w-4 h-4" />,
                            label: "Success Stories",
                          },
                          {
                            id: "aiHumanizer",
                            icon: <User className="w-4 h-4" />,
                            label: "AI Humanizer",
                          },
                        ].map((tab) => (
                          <div
                            key={tab.id}
                            onClick={() => setActiveSOPTab(tab.id)}
                            className={`
                              px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium cursor-pointer transition-all duration-300
                              ${
                                tab.active || activeSOPTab === tab.id
                                  ? "text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 -mb-px"
                                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                              }
                            `}
                          >
                            {tab.icon}
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* SOP Samples Content */}
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Sample Statements of Purpose
                          </h2>

                          {/* Filters */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div>
                              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Degree Level
                              </h3>
                              <Select defaultValue="all">
                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <SelectValue placeholder="All Degrees" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All Degrees
                                  </SelectItem>
                                  <SelectItem value="phd">PhD</SelectItem>
                                  <SelectItem value="masters">
                                    Master's
                                  </SelectItem>
                                  <SelectItem value="mba">MBA</SelectItem>
                                  <SelectItem value="bachelors">
                                    Bachelor's
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                Field of Study
                              </h3>
                              <Select defaultValue="all">
                                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <SelectValue placeholder="All Fields" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    All Fields
                                  </SelectItem>
                                  <SelectItem value="cs">
                                    Computer Science
                                  </SelectItem>
                                  <SelectItem value="biology">
                                    Biology
                                  </SelectItem>
                                  <SelectItem value="economics">
                                    Economics
                                  </SelectItem>
                                  <SelectItem value="engineering">
                                    Engineering
                                  </SelectItem>
                                  <SelectItem value="psychology">
                                    Psychology
                                  </SelectItem>
                                  <SelectItem value="business">
                                    Business
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Sample SOPs */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {sopSamples.map((sample) => (
                              <motion.div
                                key={sample.id}
                                whileHover={{
                                  y: -5,
                                  transition: { duration: 0.2 },
                                }}
                                className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                              >
                                <div className="h-2 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                                <div className="p-5">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      {sample.title}
                                    </h3>
                                    {renderRating(sample.rating)}
                                  </div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                    {sample.university}
                                  </p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
                                    {sample.content}
                                  </p>
                                  <div className="flex justify-between items-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                                    >
                                      Read More
                                    </Button>
                                    <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                                      <Share className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Load More Button */}
                          <div className="flex justify-center mt-8">
                            <Button
                              variant="outline"
                              className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              Load More Samples
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 6 && (
                    <motion.div
                      className="p-4 md:p-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* LOR section header */}
                      <motion.h1
                        className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        Letter of Recommendation
                      </motion.h1>

                      {/* Modified LOR tabs to remove horizontal scrolling and disable most buttons */}
                      <div className="flex w-full mb-6 border-b border-gray-200 dark:border-gray-700">
                        {[
                          {
                            id: "guidance",
                            icon: <BookOpen className="w-4 h-4" />,
                            label: "Guidance",
                          },
                          {
                            id: "samples",
                            icon: <FileText className="w-4 h-4" />,
                            label: "LOR Samples",
                            active: true,
                          },
                          {
                            id: "mylors",
                            icon: <FileText className="w-4 h-4" />,
                            label: "My LORs",
                          },
                          {
                            id: "improvement",
                            icon: <Activity className="w-4 h-4" />,
                            label: "AI Improvement",
                          },
                          {
                            id: "strengths",
                            icon: <Activity className="w-4 h-4" />,
                            label: "Highlight Strengths",
                          },
                          {
                            id: "tone",
                            icon: <FileText className="w-4 h-4" />,
                            label: "Professional Tone",
                          },
                          {
                            id: "humanizer",
                            icon: <User className="w-4 h-4" />,
                            label: "AI Humanizer",
                          },
                        ].map((tab) => (
                          <div
                            key={tab.id}
                            // Only allow clicks on samples tab, all others are disabled
                            onClick={
                              tab.id === "samples"
                                ? () => setActiveLORTab("samples")
                                : undefined
                            }
                            className={`
                              px-4 py-3 flex items-center gap-2 whitespace-nowrap font-medium transition-all duration-300
                              ${
                                tab.id === "samples"
                                  ? "cursor-pointer"
                                  : "cursor-default opacity-70"
                              }
                              ${
                                tab.active || activeLORTab === tab.id
                                  ? "text-teal-500 dark:text-teal-400 border-b-2 border-teal-500 dark:border-teal-400 -mb-px"
                                  : "text-gray-600 dark:text-gray-300"
                              }
                            `}
                          >
                            {tab.icon}
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* LOR Samples content - only showing this tab */}
                      <LORSamplesSection />
                    </motion.div>
                  )}

                  {activeStep === 7 && showApplicationForm && (
                    <RoadmapApplyNow />
                  )}
                </ScrollArea>
              </div>
            </GradientCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSection;
