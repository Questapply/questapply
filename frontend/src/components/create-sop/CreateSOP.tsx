// import { useState, useCallback, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { motion } from "framer-motion";
// import {
//   BookOpen,
//   FileText,
//   Bot,
//   Wand,
//   University,
//   Trophy,
//   FileSearch,
//   Clipboard,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import ProgressCircle from "@/components/ui/progress-circle";
// import { useForm } from "react-hook-form";

// // Define tabs
// const sopTabs = [
//   { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
//   { id: "samples", name: "Samples", icon: <Clipboard className="w-4 h-4" /> },
//   { id: "createSOP", name: "My SOP", icon: <FileText className="w-4 h-4" /> },
//   {
//     id: "aiImprovement",
//     name: "AI Improvement",
//     icon: <Wand className="w-4 h-4" />,
//   },
//   {
//     id: "universityMatch",
//     name: "Match with University",
//     icon: <University className="w-4 h-4" />,
//   },
//   {
//     id: "successStories",
//     name: "Success Stories",
//     icon: <Trophy className="w-4 h-4" />,
//   },
//   {
//     id: "aiHumanizer",
//     name: "AI Humanizer",
//     icon: <Bot className="w-4 h-4" />,
//   },
// ];

// // SOP structure steps
// const sopSteps = [
//   {
//     id: 1,
//     title: "Country / Program / Level / University",
//     icon: "🎓",
//     description:
//       "What country are you applying to, and what specific program and level of study are you pursuing at the university?",
//   },
//   {
//     id: 2,
//     title: "Hook",
//     icon: "🔍",
//     description:
//       "Create a compelling opening that grabs the reader's attention and introduces your academic passion.",
//   },
//   {
//     id: 3,
//     title: "Journey",
//     icon: "🚀",
//     description:
//       "Describe your academic and professional journey that led you to this specific field of interest.",
//   },
//   {
//     id: 4,
//     title: "Motivation",
//     icon: "⭐",
//     description:
//       "Explain what motivates you to pursue this specific program and institution.",
//   },
//   {
//     id: 5,
//     title: "Goals",
//     icon: "🎯",
//     description:
//       "Outline your short-term and long-term goals after completing this program.",
//   },
// ];

// // Dropdown options for the create SOP section
// const countryOptions = [
//   "United States",
//   "Canada",
//   "United Kingdom",
//   "Australia",
//   "Germany",
//   "Japan",
//   "Singapore",
//   "Netherlands",
// ];
// const programOptions = [
//   "Computer Science",
//   "Business Administration",
//   "Data Science",
//   "Electrical Engineering",
//   "Psychology",
//   "Medicine",
//   "Law",
//   "Arts",
// ];
// const levelOptions = [
//   "Bachelor's",
//   "Master's",
//   "PhD",
//   "MBA",
//   "Professional Certificate",
// ];
// const universityOptions = [
//   "Harvard University",
//   "Stanford University",
//   "MIT",
//   "Oxford University",
//   "Cambridge University",
//   "ETH Zurich",
//   "University of Tokyo",
// ];

// const hookOptions = [
//   "What makes you unique?",
//   "A significant challenge you've overcome",
//   "Your primary academic interest",
//   "A pivotal moment in your life",
// ];

// const journeyOptions = [
//   "Academic project",
//   "Professional experience",
//   "Research experience",
//   "Volunteer work",
//   "Personal project",
// ];

// const motivationOptions = [
//   "Faculty",
//   "Research opportunities",
//   "Curriculum structure",
//   "University reputation",
//   "Location/environment",
// ];

// const goalOptions = [
//   "What's your ultimate goal?",
//   "Research",
//   "Teaching",
//   "Industry",
//   "Entrepreneurship",
//   "Public service",
// ];

// // Interface for SOP Sample structure
// interface SOPSample {
//   id: number;
//   file: string;
//   program_id?: number;
//   level?: string;
//   date?: string;
//   name?: string;
//   description?: string;
//   point?: boolean;
// }

// const CreateSOP = () => {
//   const [fetchedTemplates, setFetchedTemplates] = useState<SOPSample[]>([]);
//   const [activeTab, setActiveTab] = useState("guidance");
//   const [selectedDegree, setSelectedDegree] = useState("All");
//   const [selectedField, setSelectedField] = useState("All");
//   const [filteredSamples, setFilteredSamples] = useState<SOPSample[]>([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [sopText, setSopText] = useState("Your SOP will appear here...");
//   const [showTextEditor, setShowTextEditor] = useState(false);

//   const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
//   const [apiError, setApiError] = useState<string | null>(null);

//   // Memoized function to fetch resume templates from the API
//   const fetchTemplates = useCallback(async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       // Check if a token exists
//       setIsLoadingApi(false);
//       return;
//     }

//     setIsLoadingApi(true); // Set API loading to true at the start of the fetch
//     try {
//       // Adjust the API endpoint as necessary
//       const response = await fetch(
//         "http://localhost:5000/api/sop-data/sample",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Include authentication token in headers
//           },
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data: SOPSample[] = await response.json();
//       const processedData = data.map((template) => ({
//         ...template,
//         name: template.name || `SOP Sample ${template.id}`, // Fallback name
//         description: template.description || "A professional SOP Sample.", // Fallback description
//         popular: template.point || 0, // Default popular to false
//       }));
//       setFetchedTemplates(processedData);
//       setApiError(null); // Clear any previous errors
//     } catch (error) {
//       if (error instanceof Error) {
//         setApiError(error.message);
//       } else {
//         setApiError("An unknown error occurred while fetching templates.");
//       }
//       setFetchedTemplates([]); // Clear templates on error
//     } finally {
//       setIsLoadingApi(false); // Set API loading to false after fetch completes (success or error)
//     }
//   }, []);

//   useEffect(() => {
//     fetchTemplates();
//   }, [fetchTemplates]);

//   // Form for current step
//   const form = useForm({
//     defaultValues: {
//       country: "",
//       program: "",
//       level: "",
//       university: "",
//       hook: "",
//       hookText: "",
//       journey: "",
//       journeyText: "",
//       journeyOutcome: "",
//       motivation: "",
//       motivationText: "",
//       challenges: "",
//       goal: "",
//       goalText: "",
//     },
//   });

//   // Filter samples when degree or field changes
//   const filterSamples = (degree, field) => {
//     let filtered = fetchedTemplates;

//     if (degree !== "All") {
//       filtered = filtered.filter((sop) => sop.level === degree);
//     }

//     if (field !== "All") {
//       filtered = filtered.filter((sop) => sop.level === field);
//     }

//     setFilteredSamples(filtered);
//   };

//   // Handle AI humanization
//   const handleHumanizeText = () => {
//     setShowTextEditor(true);
//     // In a real app, this would call an AI service
//     setTimeout(() => {
//       setSopText(
//         "This humanized version of your statement of purpose reads more naturally and authentically while maintaining your original ideas and intent..."
//       );
//     }, 1500);
//   };

//   // Generate SOP based on form inputs
//   const generateSOP = () => {
//     const values = form.getValues();
//     setSopText(`
//       Dear Admissions Committee,

//       I am writing to express my interest in the ${values.program} ${
//       values.level
//     } program at ${values.university}. ${values.hookText}

//       ${values.journeyText} This project resulted in ${values.journeyOutcome}.

//       ${values.motivationText} ${
//       values.challenges !== "No"
//         ? `Despite facing challenges such as ${values.challenges}, I remain committed to my academic goals.`
//         : ""
//     }

//       My ultimate goal is to ${values.goalText}. I believe that ${
//       values.university
//     }'s program will provide me with the knowledge and skills necessary to achieve this ambition.

//       Thank you for considering my application.

//       Sincerely,
//       [Your Name]
//     `);
//   };

//   // Handle tab change
//   const handleTabChange = (value) => {
//     setActiveTab(value);
//   };

//   return (
//     <div className="animate-fade-in">
//       <Tabs
//         defaultValue="guidance"
//         value={activeTab}
//         onValueChange={handleTabChange}
//         className="w-full"
//       >
//         <div className="relative border-b border-gray-200 dark:border-gray-700">
//           <TabsList className="w-full h-auto px-2 py-1 bg-transparent overflow-x-auto flex justify-start">
//             {sopTabs.map((tab) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className={`
//                   px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
//                   ${
//                     activeTab === tab.id
//                       ? "text-purple-600 dark:text-purple-400"
//                       : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                   }
//                 `}
//               >
//                 {tab.icon}
//                 {tab.name}
//                 {activeTab === tab.id && (
//                   <motion.div
//                     className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
//                     layoutId="activeTabSOP"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                   />
//                 )}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>

//         {/* Tab Content */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//           className="mt-4"
//         >
//           {/* Guidance Tab */}
//           <TabsContent value="guidance" className="m-0">
//             <div className="p-6">
//               <div className="max-w-4xl mx-auto">
//                 <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
//                   <h2 className="text-3xl font-bold mb-4">
//                     How to Write an Effective Statement of Purpose
//                   </h2>
//                   <p className="text-lg">
//                     A compelling Statement of Purpose (SOP) is your opportunity
//                     to showcase your academic achievements, research interests,
//                     and career goals to admission committees. Follow the
//                     structure below to create a powerful SOP that stands out.
//                   </p>
//                 </div>

//                 <div className="mt-8 space-y-12">
//                   {sopSteps.map((step, index) => (
//                     <motion.div
//                       key={step.id}
//                       className="relative"
//                       initial={{ opacity: 0, y: 15 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.5, delay: index * 0.1 }}
//                     >
//                       {/* Step Number Circle */}
//                       <div className="absolute left-0 top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
//                         {step.id}
//                       </div>

//                       {/* Step Content */}
//                       <div className="ml-16">
//                         <div className="flex mb-4">
//                           <div className="flex items-center gap-4">
//                             <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
//                               {step.icon}
//                             </div>
//                             <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
//                               {step.title}
//                             </h3>
//                           </div>
//                         </div>
//                         <div className="pl-20">
//                           <p className="text-gray-600 dark:text-gray-400">
//                             {step.description}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Connector Line */}
//                       {index < sopSteps.length - 1 && (
//                         <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700 h-16"></div>
//                       )}
//                     </motion.div>
//                   ))}
//                 </div>

//                 <div className="mt-12 flex justify-center">
//                   <Button
//                     className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg"
//                     onClick={() => setActiveTab("createSOP")}
//                   >
//                     Create My Statement of Purpose
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Samples Tab */}
//           <TabsContent value="samples" className="m-0">
//             <div className="p-6">
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                   Sample Statements of Purpose
//                 </h2>

//                 <div className="flex flex-col md:flex-row gap-4 mb-6">
//                   <div className="w-full md:w-1/2">
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       Degree Level
//                     </label>
//                     <Select
//                       value={selectedDegree}
//                       onValueChange={(value) => {
//                         setSelectedDegree(value);
//                         filterSamples(value, selectedField);
//                       }}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select Degree Level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="All">All Degrees</SelectItem>
//                         <SelectItem value="Bachelor's">Bachelor's</SelectItem>
//                         <SelectItem value="Master's">Master's</SelectItem>
//                         <SelectItem value="PhD">PhD</SelectItem>
//                         <SelectItem value="MBA">MBA</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="w-full md:w-1/2">
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       Field of Study
//                     </label>
//                     <Select
//                       value={selectedField}
//                       onValueChange={(value) => {
//                         setSelectedField(value);
//                         filterSamples(selectedDegree, value);
//                       }}
//                     >
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select Field of Study" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="All">All Fields</SelectItem>
//                         <SelectItem value="Computer Science">
//                           Computer Science
//                         </SelectItem>
//                         <SelectItem value="Engineering">Engineering</SelectItem>
//                         <SelectItem value="Business">Business</SelectItem>
//                         <SelectItem value="Biology">Biology</SelectItem>
//                         <SelectItem value="Psychology">Psychology</SelectItem>
//                         <SelectItem value="Economics">Economics</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {fetchedTemplates.map((sample, i) => (
//                     <motion.div
//                       key={i}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.3, delay: i * 0.1 }}
//                       whileHover={{
//                         y: -5,
//                         boxShadow:
//                           "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
//                       }}
//                       className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
//                     >
//                       <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-500"></div>
//                       <div className="p-6">
//                         <div className="flex justify-between items-start mb-3">
//                           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                             {sample.name}
//                           </h3>
//                           <div className="flex">
//                             {[...Array(sample.point)].map((_, i) => (
//                               <svg
//                                 key={i}
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="h-4 w-4 text-yellow-400"
//                                 viewBox="0 0 20 20"
//                                 fill="currentColor"
//                               >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                               </svg>
//                             ))}
//                           </div>
//                         </div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
//                           {sample.name}
//                         </p>
//                         <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
//                           {sample.description}
//                         </p>
//                         <div className="flex justify-between">
//                           <a
//                             href={sample.file}
//                             className="btn btn-primary border p-2 text-sm hover:text-white rounded  text-purple-600 border-purple-300 dark:border-purple-700"
//                           >
//                             Read More
//                           </a>
//                           <Button
//                             size="sm"
//                             variant="ghost"
//                             className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                           >
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               className="h-5 w-5"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
//                               />
//                             </svg>
//                           </Button>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>

//                 <div className="text-center mt-8">
//                   <Button
//                     variant="outline"
//                     className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
//                   >
//                     Load More Samples
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Create SOP Tab */}
//           <TabsContent value="createSOP" className="m-0">
//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                 Create Your Statement of Purpose
//               </h2>

//               <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
//                 <div className="mb-8">
//                   {/* Step progress indicators */}
//                   <div className="flex justify-between items-center mb-8">
//                     {sopSteps.map((step) => (
//                       <div
//                         key={step.id}
//                         className="flex flex-col items-center relative"
//                         onClick={() => setCurrentStep(step.id)}
//                       >
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
//                             currentStep >= step.id
//                               ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
//                               : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
//                           }`}
//                         >
//                           {step.id}
//                         </div>
//                         <span
//                           className={`text-xs mt-2 text-center ${
//                             currentStep >= step.id
//                               ? "text-purple-600 dark:text-purple-400"
//                               : "text-gray-500 dark:text-gray-400"
//                           }`}
//                         >
//                           {step.title.split(" / ")[0]}
//                         </span>
//                         {step.id < sopSteps.length && (
//                           <div
//                             className={`absolute w-full top-5 left-full h-0.5 -ml-3 ${
//                               currentStep > step.id
//                                 ? "bg-gradient-to-r from-purple-600 to-blue-500"
//                                 : "bg-gray-200 dark:bg-gray-700"
//                             }`}
//                             style={{ width: "calc(100% - 2.5rem)" }}
//                           ></div>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   {/* Step content */}
//                   <Form {...form}>
//                     <motion.div
//                       key={currentStep}
//                       initial={{ opacity: 0, x: 20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -20 }}
//                       transition={{ duration: 0.3 }}
//                       className="space-y-6"
//                     >
//                       {currentStep === 1 && (
//                         <div className="space-y-4">
//                           <FormField
//                             name="country"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select Country
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Select Country" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {countryOptions.map((country) => (
//                                       <SelectItem key={country} value={country}>
//                                         {country}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="program"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select Program
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Select Program" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {programOptions.map((program) => (
//                                       <SelectItem key={program} value={program}>
//                                         {program}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="level"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select Level
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Select Level" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {levelOptions.map((level) => (
//                                       <SelectItem key={level} value={level}>
//                                         {level}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="university"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select University
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Select University" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {universityOptions.map((university) => (
//                                       <SelectItem
//                                         key={university}
//                                         value={university}
//                                       >
//                                         {university}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}

//                       {currentStep === 2 && (
//                         <div className="space-y-4">
//                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                             <span className="text-blue-500 dark:text-blue-400 text-2xl mr-2">
//                               2.
//                             </span>{" "}
//                             Hook
//                           </h3>

//                           <FormField
//                             name="hook"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select Hook Type
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="What makes you unique?" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {hookOptions.map((hook) => (
//                                       <SelectItem key={hook} value={hook}>
//                                         {hook}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="hookText"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Tell us more
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Textarea
//                                     className="min-h-[120px] border border-gray-300 dark:border-gray-600 rounded-md bg-blue-950/5"
//                                     placeholder="e.g., 'My interest in AI started with a high school project'"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}

//                       {currentStep === 3 && (
//                         <div className="space-y-4">
//                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                             <span className="text-blue-500 dark:text-blue-400 text-2xl mr-2">
//                               3.
//                             </span>{" "}
//                             Journey
//                           </h3>

//                           <FormField
//                             name="journey"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Select Journey Type
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Academic project" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {journeyOptions.map((journey) => (
//                                       <SelectItem key={journey} value={journey}>
//                                         {journey}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="journeyText"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Project title/description
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     placeholder="e.g., 'AI Model for Healthcare'"
//                                     className="border border-gray-300 dark:border-gray-600"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="journeyOutcome"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Outcome
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     placeholder="e.g., 'Improved diagnosis accuracy by 20%'"
//                                     className="border border-gray-300 dark:border-gray-600"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}

//                       {currentStep === 4 && (
//                         <div className="space-y-4">
//                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                             <span className="text-blue-500 dark:text-blue-400 text-2xl mr-2">
//                               4.
//                             </span>{" "}
//                             Motivation
//                           </h3>

//                           <FormField
//                             name="motivation"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   What motivates you?
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="Faculty" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {motivationOptions.map((motivation) => (
//                                       <SelectItem
//                                         key={motivation}
//                                         value={motivation}
//                                       >
//                                         {motivation}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="motivationText"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Tell us more
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Textarea
//                                     className="min-h-[120px] border border-gray-300 dark:border-gray-600 rounded-md bg-blue-950/5"
//                                     placeholder="e.g., 'I admire Prof. Smith's work in AI'"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="challenges"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Any challenges?
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value || "No"}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="No" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     <SelectItem value="No">No</SelectItem>
//                                     <SelectItem value="Financial constraints">
//                                       Financial constraints
//                                     </SelectItem>
//                                     <SelectItem value="Academic background">
//                                       Academic background
//                                     </SelectItem>
//                                     <SelectItem value="Geographic limitations">
//                                       Geographic limitations
//                                     </SelectItem>
//                                     <SelectItem value="Language barriers">
//                                       Language barriers
//                                     </SelectItem>
//                                     <SelectItem value="Other">Other</SelectItem>
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}

//                       {currentStep === 5 && (
//                         <div className="space-y-4">
//                           <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
//                             <span className="text-blue-500 dark:text-blue-400 text-2xl mr-2">
//                               5.
//                             </span>{" "}
//                             Goal
//                           </h3>

//                           <FormField
//                             name="goal"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Your ultimate goal
//                                 </FormLabel>
//                                 <Select
//                                   onValueChange={field.onChange}
//                                   defaultValue={field.value}
//                                 >
//                                   <FormControl>
//                                     <SelectTrigger className="w-full">
//                                       <SelectValue placeholder="What's your ultimate goal?" />
//                                     </SelectTrigger>
//                                   </FormControl>
//                                   <SelectContent>
//                                     {goalOptions.map((goal) => (
//                                       <SelectItem key={goal} value={goal}>
//                                         {goal}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </FormItem>
//                             )}
//                           />

//                           <FormField
//                             name="goalText"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel className="text-base font-medium">
//                                   Tell us more
//                                 </FormLabel>
//                                 <FormControl>
//                                   <Textarea
//                                     className="min-h-[120px] border border-gray-300 dark:border-gray-600 rounded-md bg-blue-950/5"
//                                     placeholder="Describe your career goals after completing the program"
//                                     {...field}
//                                   />
//                                 </FormControl>
//                               </FormItem>
//                             )}
//                           />
//                         </div>
//                       )}
//                     </motion.div>

//                     <div className="flex justify-between mt-8">
//                       <Button
//                         variant="outline"
//                         onClick={() =>
//                           setCurrentStep(Math.max(1, currentStep - 1))
//                         }
//                         disabled={currentStep === 1}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-4 w-4 mr-2"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M15 19l-7-7 7-7"
//                           />
//                         </svg>
//                         Previous
//                       </Button>

//                       {currentStep < 5 ? (
//                         <Button
//                           className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
//                           onClick={() =>
//                             setCurrentStep(Math.min(5, currentStep + 1))
//                           }
//                         >
//                           Next
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-4 w-4 ml-2"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M9 5l7 7-7 7"
//                             />
//                           </svg>
//                         </Button>
//                       ) : (
//                         <Button
//                           className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
//                           onClick={generateSOP}
//                         >
//                           Generate SOP
//                         </Button>
//                       )}
//                     </div>
//                   </Form>
//                 </div>

//                 {/* Preview Area */}
//                 <div className="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
//                   <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//                     Statement of Purpose Preview
//                   </h3>
//                   <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md min-h-[300px] whitespace-pre-line font-serif">
//                     {sopText}
//                   </div>
//                   <div className="flex justify-end space-x-4 mt-4">
//                     <Button variant="outline">Download as PDF</Button>
//                     <Button variant="outline">Download as Word</Button>
//                     <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
//                       Save SOP
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* AI Improvement Tab */}
//           <TabsContent value="aiImprovement" className="m-0">
//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                 AI-Powered SOP Improvement
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Our AI will analyze your Statement of Purpose and suggest
//                 improvements for clarity, structure, and impact.
//               </p>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
//                     Your Original SOP
//                   </h3>
//                   <Textarea
//                     className="min-h-[400px] font-serif text-base"
//                     placeholder="Paste your current Statement of Purpose here..."
//                   />
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
//                     AI Improved Version
//                   </h3>
//                   <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[400px] font-serif text-base bg-gray-50 dark:bg-gray-900/50">
//                     <p className="text-gray-500 dark:text-gray-400">
//                       AI suggestions will appear here after you submit your
//                       SOP...
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-center mt-8 space-x-4">
//                 <Button variant="outline" size="lg" className="px-6">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5 mr-2"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                     />
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                     />
//                   </svg>
//                   Preview Changes
//                 </Button>

//                 <Button
//                   size="lg"
//                   className="px-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
//                 >
//                   <Wand className="h-5 w-5 mr-2" />
//                   Improve My SOP
//                 </Button>
//               </div>

//               <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
//                   AI Analysis
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//                     <ProgressCircle value={85} size="md" color="blue" />
//                     <h4 className="text-lg font-medium mt-4">Clarity Score</h4>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
//                       Your SOP is clear and well-structured
//                     </p>
//                   </div>

//                   <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//                     <ProgressCircle value={68} size="md" color="purple" />
//                     <h4 className="text-lg font-medium mt-4">
//                       Uniqueness Score
//                     </h4>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
//                       Adds some unique elements but could be more distinctive
//                     </p>
//                   </div>

//                   <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
//                     <ProgressCircle value={92} size="md" color="green" />
//                     <h4 className="text-lg font-medium mt-4">
//                       Relevance Score
//                     </h4>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
//                       Excellent alignment with program requirements
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* University Match Tab */}
//           <TabsContent value="universityMatch" className="m-0">
//             <div className="p-6">
//               <div className="max-w-4xl mx-auto">
//                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                   Match with University
//                 </h2>
//                 <p className="text-gray-600 dark:text-gray-400 mb-6">
//                   Tailor your Statement of Purpose to match the specific
//                   expectations and requirements of your target university.
//                 </p>

//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
//                   <div className="mb-6">
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Search for University
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         placeholder="e.g., Stanford University, MIT, Harvard..."
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//                       />
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-5 w-5 text-gray-400"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                           />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     {[
//                       "Stanford University",
//                       "Massachusetts Institute of Technology",
//                       "Harvard University",
//                     ].map((uni, idx) => (
//                       <motion.div
//                         key={idx}
//                         whileHover={{ scale: 1.03 }}
//                         className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer bg-white dark:bg-gray-800"
//                       >
//                         <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center p-4">
//                           <University className="w-12 h-12 text-white" />
//                         </div>
//                         <div className="p-4">
//                           <h3 className="font-semibold text-gray-900 dark:text-white">
//                             {uni}
//                           </h3>
//                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                             Click to tailor your SOP to this university's
//                             requirements
//                           </p>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <div className="mt-8 p-6 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
//                       University Requirements Analysis
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-400 mb-4">
//                       Select a university to see its specific requirements and
//                       recommendations for your Statement of Purpose.
//                     </p>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//                       <Button
//                         variant="outline"
//                         className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
//                       >
//                         View Example SOPs
//                       </Button>
//                       <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
//                         Adapt My SOP
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* Success Stories Tab */}
//           <TabsContent value="successStories" className="m-0">
//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//                 Success Stories
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Learn from successful applications and adapt proven strategies
//                 to your own Statement of Purpose.
//               </p>

//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Degree Level
//                     </label>
//                     <Select defaultValue="master">
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select Degree Level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="bachelor">Bachelor's</SelectItem>
//                         <SelectItem value="master">Master's</SelectItem>
//                         <SelectItem value="phd">PhD</SelectItem>
//                         <SelectItem value="mba">MBA</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Field of Study
//                     </label>
//                     <Select defaultValue="cs">
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select Field" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="cs">Computer Science</SelectItem>
//                         <SelectItem value="business">Business</SelectItem>
//                         <SelectItem value="engineering">Engineering</SelectItem>
//                         <SelectItem value="medicine">Medicine</SelectItem>
//                         <SelectItem value="law">Law</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       University
//                     </label>
//                     <Select defaultValue="stanford">
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select University" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="stanford">
//                           Stanford University
//                         </SelectItem>
//                         <SelectItem value="mit">MIT</SelectItem>
//                         <SelectItem value="harvard">
//                           Harvard University
//                         </SelectItem>
//                         <SelectItem value="oxford">
//                           Oxford University
//                         </SelectItem>
//                         <SelectItem value="berkeley">UC Berkeley</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 dark:bg-gray-900/30 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
//                   <div className="flex items-center mb-4">
//                     <div className="mr-4">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold">
//                         KL
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                         Kevin Liu
//                       </h3>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Admitted to Stanford MS in Computer Science (2024)
//                       </p>
//                     </div>
//                   </div>

//                   <div className="text-gray-700 dark:text-gray-300 mb-4">
//                     <p className="italic">
//                       "My SOP focused on my unique research experience in
//                       blockchain technology and how it aligned with Stanford's
//                       Computer Security Lab. I made sure to demonstrate both
//                       technical expertise and a clear vision for how Stanford's
//                       program would help me achieve my goals in cybersecurity
//                       research."
//                     </p>
//                   </div>

//                   <div className="mt-6">
//                     <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                       Key Success Factors:
//                     </h4>
//                     <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
//                       <li>
//                         Clear connection between past research and Stanford's
//                         specific labs
//                       </li>
//                       <li>
//                         Demonstrated both technical knowledge and
//                         forward-thinking vision
//                       </li>
//                       <li>
//                         Included specific professors and ongoing projects of
//                         interest
//                       </li>
//                       <li>
//                         Maintained professional tone while showing authentic
//                         passion
//                       </li>
//                     </ul>
//                   </div>
//                 </div>

//                 <div className="flex justify-center">
//                   <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
//                     Apply Success Pattern to My SOP
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>

//           {/* AI Humanizer Tab */}
//           <TabsContent value="aiHumanizer" className="m-0">
//             <div className="p-6">
//               <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                 AI Humanizer
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Make your AI-generated Statement of Purpose sound more natural
//                 and authentic.
//               </p>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
//                   <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
//                     Your SOP Text
//                   </h3>

//                   <div className="mb-4">
//                     <div className="flex justify-center gap-3 mb-6">
//                       {[
//                         "Human",
//                         "DeepSeek",
//                         "ChatGPT",
//                         "GPT4",
//                         "Claude",
//                         "Gemini",
//                       ].map((model) => (
//                         <Button
//                           key={model}
//                           variant="outline"
//                           size="sm"
//                           className="rounded-full"
//                         >
//                           {model}
//                         </Button>
//                       ))}
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="rounded-full"
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-5 w-5 mr-1"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                           />
//                         </svg>
//                         Paste Text
//                       </Button>
//                     </div>

//                     <Textarea
//                       className="min-h-[300px]"
//                       placeholder="Paste your AI-generated Statement of Purpose here..."
//                     />
//                   </div>

//                   <div className="flex justify-center space-x-4">
//                     <Button variant="outline" className="gap-2">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                         />
//                       </svg>
//                       Upload File
//                     </Button>
//                     <Button
//                       className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 gap-2"
//                       onClick={handleHumanizeText}
//                     >
//                       <Bot className="h-5 w-5" />
//                       Humanize Text
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                       Humanized Version
//                     </h3>

//                     {showTextEditor && (
//                       <div className="flex items-center space-x-2">
//                         <span className="text-sm text-green-600 dark:text-green-400 font-medium">
//                           99% Human
//                         </span>
//                         <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-green-500 dark:bg-green-400"
//                             style={{ width: "99%" }}
//                           ></div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div
//                     className={`min-h-[300px] bg-gray-50 dark:bg-gray-900/30 rounded-md p-4 border border-gray-200 dark:border-gray-700 ${
//                       showTextEditor ? "font-serif text-base" : ""
//                     }`}
//                   >
//                     {showTextEditor ? (
//                       <>{sopText}</>
//                     ) : (
//                       <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
//                         <Bot className="h-16 w-16 mb-4 opacity-30" />
//                         <p>Humanized text will appear here</p>
//                       </div>
//                     )}
//                   </div>

//                   {showTextEditor && (
//                     <div className="flex justify-between mt-4">
//                       <div className="flex space-x-2">
//                         <Button variant="outline" size="sm">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-4 w-4 mr-1"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
//                             />
//                           </svg>
//                           Save as file
//                         </Button>
//                         <Button variant="outline" size="sm">
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-4 w-4 mr-1"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                             />
//                           </svg>
//                           Copy to clipboard
//                         </Button>
//                       </div>
//                       <div className="flex items-center">
//                         <Button variant="outline" size="sm" className="mr-2">
//                           Regenerate
//                         </Button>
//                         <Button
//                           className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
//                           size="sm"
//                         >
//                           Apply to My SOP
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
//                   How AI Humanizer Works
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
//                     <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-6 w-6"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
//                         />
//                       </svg>
//                     </div>
//                     <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                       Pattern Detection
//                     </h4>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       Our system identifies AI-generated patterns, formulaic
//                       language, and repetitive structures in your text.
//                     </p>
//                   </div>

//                   <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
//                     <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-6 w-6"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
//                         />
//                       </svg>
//                     </div>
//                     <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                       Style Transformation
//                     </h4>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       We transform your text to include more natural language
//                       variations, sentence structures, and personal voice.
//                     </p>
//                   </div>

//                   <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700">
//                     <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-6 w-6"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                     </div>
//                     <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
//                       Human Verification
//                     </h4>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">
//                       Your humanized text passes AI detection tools while
//                       maintaining your original content and intent.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-6 flex justify-between items-center">
//                   <div className="flex space-x-2">
//                     <Button variant="outline" size="sm" className="gap-1">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-4 w-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                       Learn More
//                     </Button>
//                   </div>
//                   <div className="flex items-center">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       className="text-gray-600 dark:text-gray-400 mr-2"
//                     >
//                       CHECK FOR AI
//                     </Button>
//                     <Button
//                       className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
//                       size="sm"
//                     >
//                       HUMANIZE
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </TabsContent>
//         </motion.div>
//       </Tabs>
//     </div>
//   );
// };

// export default CreateSOP;
////////////////////////////////////////////////
///////////////////////////////////////////////////////////
// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { motion } from "framer-motion";
// import {
//   BookOpen,
//   FileText,
//   Bot,
//   Wand,
//   University,
//   Trophy,
//   FileSearch,
//   Clipboard,
//   Send,
//   Download,
//   RotateCcw,
//   Sparkles,
//   Scissors,
//   Expand,
//   Target,
// } from "lucide-react";

// // Define tabs
// const sopTabs = [
//   { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
//   { id: "samples", name: "Samples", icon: <Clipboard className="w-4 h-4" /> },
//   {
//     id: "createSOP",
//     name: "Create SOP",
//     icon: <FileText className="w-4 h-4" />,
//   },
//   {
//     id: "aiImprovement",
//     name: "AI Improvement",
//     icon: <Wand className="w-4 h-4" />,
//   },
//   {
//     id: "universityMatch",
//     name: "Match with University",
//     icon: <University className="w-4 h-4" />,
//   },
//   {
//     id: "successStories",
//     name: "Success Stories",
//     icon: <Trophy className="w-4 h-4" />,
//   },
//   {
//     id: "aiHumanizer",
//     name: "AI Humanizer",
//     icon: <Bot className="w-4 h-4" />,
//   },
// ];

// // Seed section data
// const initialSections = {
//   hook: {
//     title: "Hook",
//     hint: "80–120 words, problem/motivation",
//     content:
//       "In a world increasingly driven by data and artificial intelligence, I find myself captivated by the intersection of technology and human understanding. My journey into computer science began with a simple question: how can we build systems that not only process information but truly comprehend and assist human decision-making? This fundamental curiosity has shaped my academic pursuits and research interests, leading me to seek advanced study in machine learning and natural language processing.",
//   },
//   segue: {
//     title: "Segue",
//     hint: "bridge to academic background",
//     content:
//       "This passion for bridging technology and human cognition naturally led me to pursue rigorous academic training in computer science, where I could explore both the theoretical foundations and practical applications of intelligent systems.",
//   },
//   achievements: {
//     title: "Academic Achievements",
//     hint: "3–5 impactful items with numbers",
//     content:
//       "During my undergraduate studies, I maintained a 3.8 GPA while conducting research that resulted in 2 peer-reviewed publications in top-tier conferences. I led a team of 5 students in developing an innovative natural language processing system that achieved 94% accuracy in sentiment analysis, outperforming existing models by 12%. Additionally, I was awarded the Dean's List recognition for 6 consecutive semesters and received the Outstanding Computer Science Student Award in my senior year.",
//   },
//   extracurricular: {
//     title: "Extracurricular Activities",
//     hint: "volunteering/teaching/etc.",
//     content:
//       "Beyond academics, I dedicated 200+ hours to teaching programming to underrepresented youth through the Code for All initiative. I also served as president of the AI Ethics Society, organizing symposiums that attracted over 300 participants from industry and academia. My volunteer work includes mentoring 15 high school students in STEM fields and contributing to open-source machine learning libraries used by over 10,000 developers worldwide.",
//   },
//   publications: {
//     title: "Publications",
//     hint: "concise if any",
//     content:
//       "Smith, J., & Doe, A. (2023). 'Advancing Natural Language Understanding Through Contextual Embeddings.' Proceedings of the International Conference on Machine Learning, 45(2), 123-135.\n\nDoe, A., Johnson, K., & Smith, J. (2023). 'Ethical Considerations in Large Language Model Deployment.' Journal of AI Ethics, 8(3), 67-89.",
//   },
//   problems: {
//     title: "Problems in Background",
//     hint: "challenges/lessons learned",
//     content:
//       "One significant challenge I encountered was during my research internship when our initial approach to bias detection in language models consistently failed to meet accuracy benchmarks. Rather than abandoning the project, I spent months studying fairness metrics and collaborated with social scientists to understand the nuanced nature of algorithmic bias. This experience taught me the importance of interdisciplinary collaboration and resilient problem-solving, ultimately leading to a breakthrough that became the foundation for my thesis work.",
//   },
//   whySchool: {
//     title: "Why This School?",
//     hint: "labs/professors/fit",
//     content:
//       "Stanford's AI Lab, particularly Dr. Sarah Chen's work on interpretable machine learning, aligns perfectly with my research interests in developing transparent AI systems. The Human-Centered AI Institute's interdisciplinary approach, combining computer science with cognitive psychology and ethics, provides the exact environment I need to pursue my goal of creating AI that genuinely serves human needs. Additionally, the opportunity to collaborate with the Stanford NLP Group and access to cutting-edge computational resources would be invaluable for my research.",
//   },
//   goal: {
//     title: "Your Goal/Conclusion",
//     hint: "short-term/long-term goals",
//     content:
//       "In the short term, I aim to contribute to groundbreaking research in explainable AI while completing my PhD at Stanford. My long-term vision is to establish a research lab focused on developing AI systems that are not only powerful but also transparent, fair, and aligned with human values. I believe that through rigorous academic training and collaborative research, I can help shape the future of artificial intelligence to benefit society as a whole.",
//   },
// };

// type MessageSender = "user" | "ai";

// interface Message {
//   sender: MessageSender;
//   content: string;
// }

// interface Snapshot {
//   id: string;
//   timestamp: Date;
//   sections: typeof initialSections;
// }

// const CreateSOPBuilder = () => {
//   const [tone, setTone] = useState<"formal" | "friendly" | "story">("formal");
//   const [sections, setSections] = useState(initialSections);
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       sender: "ai",
//       content:
//         "Welcome! I'm here to help you create an outstanding Statement of Purpose. You can ask me to improve specific sections, adjust the tone, or make any other changes you'd like.",
//     },
//   ]);
//   const [inputValue, setInputValue] = useState("");
//   const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
//   const [wordCount, setWordCount] = useState(0);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Calculate total word count
//   useEffect(() => {
//     const totalWords = Object.values(sections).reduce((total, section) => {
//       return (
//         total +
//         (section.content
//           ? section.content.split(" ").filter((word) => word.length > 0).length
//           : 0)
//       );
//     }, 0);
//     setWordCount(totalWords);
//   }, [sections]);

//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const sendMessage = () => {
//     if (!inputValue.trim()) return;

//     setMessages((prev) => [...prev, { sender: "user", content: inputValue }]);

//     // Simple AI response simulation
//     setTimeout(() => {
//       const response = processMessage(inputValue);
//       setMessages((prev) => [...prev, { sender: "ai", content: response }]);
//     }, 1000);

//     setInputValue("");
//   };

//   const processMessage = (message: string): string => {
//     const lowerMessage = message.toLowerCase();

//     // Determine target section
//     let targetSection = "segue"; // default
//     if (lowerMessage.includes("hook")) targetSection = "hook";
//     else if (
//       lowerMessage.includes("achievement") ||
//       lowerMessage.includes("academic")
//     )
//       targetSection = "achievements";
//     else if (lowerMessage.includes("publication"))
//       targetSection = "publications";
//     else if (lowerMessage.includes("why") || lowerMessage.includes("school"))
//       targetSection = "whySchool";
//     else if (
//       lowerMessage.includes("goal") ||
//       lowerMessage.includes("conclusion")
//     )
//       targetSection = "goal";
//     else if (lowerMessage.includes("extracurricular"))
//       targetSection = "extracurricular";
//     else if (
//       lowerMessage.includes("problem") ||
//       lowerMessage.includes("challenge")
//     )
//       targetSection = "problems";

//     // Determine mode
//     let mode = "improve";
//     if (lowerMessage.includes("shorten")) mode = "shorten";
//     else if (lowerMessage.includes("expand")) mode = "expand";
//     else if (lowerMessage.includes("align")) mode = "align";

//     // Apply the change
//     applySectionChange(targetSection, mode);

//     return `✅ ${mode} applied on **${targetSection}**.`;
//   };

//   const applySectionChange = (sectionKey: string, mode: string) => {
//     setSections((prev) => {
//       const section = prev[sectionKey];
//       if (!section) return prev;

//       let newContent = section.content;

//       switch (mode) {
//         case "shorten":
//           const words = newContent.split(" ");
//           const targetLength = Math.max(18, Math.floor(words.length * 0.7));
//           newContent =
//             words.slice(0, targetLength).join(" ") +
//             (words.length > targetLength ? "..." : "");
//           break;

//         case "expand":
//           if (sectionKey === "hook") {
//             newContent +=
//               " This early experience revealed the profound impact that well-designed technology can have on human potential.";
//           } else if (sectionKey === "achievements") {
//             newContent +=
//               " These experiences have prepared me to tackle complex research challenges in graduate school.";
//           } else {
//             newContent +=
//               " This foundation has shaped my research perspective and academic approach.";
//           }
//           break;

//         case "align":
//           if (sectionKey === "whySchool") {
//             newContent +=
//               " I am particularly excited about the opportunity to work with Professor Johnson's lab on neural network interpretability research.";
//           }
//           break;

//         case "improve":
//         default:
//           // Apply tone-based improvement
//           if (tone === "friendly") {
//             newContent = newContent
//               .replace(/Furthermore,/g, "What's more,")
//               .replace(/Additionally,/g, "I'm also excited that");
//           } else if (tone === "story") {
//             newContent =
//               "Looking back, " +
//               newContent.charAt(0).toLowerCase() +
//               newContent.slice(1);
//           }
//           break;
//       }

//       return {
//         ...prev,
//         [sectionKey]: {
//           ...section,
//           content: newContent,
//         },
//       };
//     });
//   };

//   const handleQuickAction = (action: string) => {
//     let targetSection = "";
//     let mode = "improve";

//     if (action === "Improve Hook") {
//       targetSection = "hook";
//       mode = "improve";
//     } else if (action === "Expand Why This School") {
//       targetSection = "whySchool";
//       mode = "expand";
//     } else if (action === "Shorten Publications") {
//       targetSection = "publications";
//       mode = "shorten";
//     }

//     applySectionChange(targetSection, mode);
//     setMessages((prev) => [
//       ...prev,
//       { sender: "ai", content: `✅ ${mode} applied on **${targetSection}**.` },
//     ]);
//   };

//   const saveSnapshot = () => {
//     const snapshot: Snapshot = {
//       id: `SOP-${String(snapshots.length + 1).padStart(3, "0")}`,
//       timestamp: new Date(),
//       sections: { ...sections },
//     };

//     setSnapshots((prev) => [...prev, snapshot]);
//     setMessages((prev) => [
//       ...prev,
//       { sender: "ai", content: `📸 Snapshot saved as ${snapshot.id}` },
//     ]);
//   };

//   const resetSections = () => {
//     setSections(initialSections);
//     setMessages((prev) => [
//       ...prev,
//       { sender: "ai", content: "🔄 Draft reset." },
//     ]);
//   };

//   const exportTxt = () => {
//     let content = "# Statement of Purpose Draft\n\n";

//     Object.entries(sections).forEach(([key, section]) => {
//       content += `## ${section.title}\n\n${section.content}\n\n`;
//     });

//     const blob = new Blob([content], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "sop_draft.txt";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   const updateSectionContent = (sectionKey: string, newContent: string) => {
//     setSections((prev) => ({
//       ...prev,
//       [sectionKey]: {
//         ...prev[sectionKey],
//         content: newContent,
//       },
//     }));
//   };

//   const getSectionWordCount = (content: string) => {
//     return content
//       ? content.split(" ").filter((word) => word.length > 0).length
//       : 0;
//   };

//   return (
//     <div
//       className="min-h-screen"
//       style={
//         {
//           "--sop-bg": "#0b1020",
//           "--sop-panel": "#111827",
//           "--sop-card": "#0e1526",
//           "--sop-border": "#25324a",
//           "--sop-chip": "#0b213a",
//           "--sop-text": "#e5e7eb",
//           "--sop-sub": "#9ca3af",
//           "--sop-brand": "#7c3aed",
//           "--sop-ok": "#22c55e",
//           "--sop-warn": "#f59e0b",
//         } as React.CSSProperties
//       }
//     >
//       {/* Sticky Header */}
//       <div
//         className="sticky top-0 z-20 border-b"
//         style={{
//           backgroundColor: "var(--sop-panel)",
//           borderColor: "var(--sop-border)",
//         }}
//       >
//         <div className="px-6 py-4">
//           <div className="flex items-center gap-3">
//             <Badge
//               variant="secondary"
//               className="text-xs px-2 py-1"
//               style={{
//                 backgroundColor: "var(--sop-chip)",
//                 color: "var(--sop-text)",
//               }}
//             >
//               QuestApply • AI Demo
//             </Badge>
//             <h1
//               className="text-xl font-semibold"
//               style={{ color: "var(--sop-text)" }}
//             >
//               Create SOP
//             </h1>
//           </div>
//         </div>
//       </div>

//       {/* Main Layout */}
//       <div
//         className="max-w-7xl mx-auto p-6"
//         style={{ backgroundColor: "var(--sop-bg)" }}
//       >
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-120px)]">
//           {/* LEFT - Chat Panel */}
//           <div
//             className="lg:col-span-1 rounded-xl border flex flex-col h-full"
//             style={{
//               backgroundColor: "var(--sop-panel)",
//               borderColor: "var(--sop-border)",
//             }}
//           >
//             {/* Chat Header */}
//             <div
//               className="p-4 border-b"
//               style={{ borderColor: "var(--sop-border)" }}
//             >
//               <div className="flex items-center justify-between gap-3 mb-3">
//                 <Select
//                   value={tone}
//                   onValueChange={(value: "formal" | "friendly" | "story") =>
//                     setTone(value)
//                   }
//                 >
//                   <SelectTrigger
//                     className="w-full"
//                     style={{
//                       backgroundColor: "var(--sop-card)",
//                       borderColor: "var(--sop-border)",
//                       color: "var(--sop-text)",
//                     }}
//                   >
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="formal">Tone: Formal</SelectItem>
//                     <SelectItem value="friendly">Tone: Friendly</SelectItem>
//                     <SelectItem value="story">Tone: Narrative</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Badge
//                   className="text-xs whitespace-nowrap px-2 py-1"
//                   style={{
//                     backgroundColor: "var(--sop-chip)",
//                     color: "var(--sop-text)",
//                   }}
//                 >
//                   Draft v1 • Skeleton
//                 </Badge>
//               </div>

//               <Button
//                 onClick={saveSnapshot}
//                 variant="outline"
//                 size="sm"
//                 className="w-full"
//                 style={{
//                   borderColor: "var(--sop-border)",
//                   color: "var(--sop-text)",
//                 }}
//               >
//                 Save Snapshot
//               </Button>
//             </div>

//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3">
//               {messages.map((message, i) => (
//                 <div
//                   key={i}
//                   className={`flex ${
//                     message.sender === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[80%] p-3 rounded-lg text-sm ${
//                       message.sender === "user"
//                         ? "rounded-br-none"
//                         : "rounded-bl-none"
//                     }`}
//                     style={{
//                       backgroundColor:
//                         message.sender === "user"
//                           ? "var(--sop-brand)"
//                           : "var(--sop-card)",
//                       color: "var(--sop-text)",
//                     }}
//                   >
//                     {message.content}
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Quick Actions */}
//             <div
//               className="p-4 border-t space-y-2"
//               style={{ borderColor: "var(--sop-border)" }}
//             >
//               <div
//                 className="text-xs font-medium mb-2"
//                 style={{ color: "var(--sop-sub)" }}
//               >
//                 Quick Actions:
//               </div>
//               {[
//                 "Improve Hook",
//                 "Expand Why This School",
//                 "Shorten Publications",
//               ].map((action) => (
//                 <Button
//                   key={action}
//                   onClick={() => handleQuickAction(action)}
//                   variant="outline"
//                   size="sm"
//                   className="w-full justify-start text-xs"
//                   style={{
//                     borderColor: "var(--sop-border)",
//                     color: "var(--sop-sub)",
//                   }}
//                 >
//                   {action}
//                 </Button>
//               ))}
//             </div>

//             {/* Input */}
//             <div
//               className="p-4 border-t"
//               style={{ borderColor: "var(--sop-border)" }}
//             >
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={inputValue}
//                   onChange={(e) => setInputValue(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                   placeholder="e.g., Improve Academic Achievements with metrics"
//                   className="flex-1 px-3 py-2 rounded-lg border text-sm"
//                   style={{
//                     backgroundColor: "var(--sop-card)",
//                     borderColor: "var(--sop-border)",
//                     color: "var(--sop-text)",
//                   }}
//                 />
//                 <Button
//                   onClick={sendMessage}
//                   size="sm"
//                   className="px-3"
//                   style={{ backgroundColor: "var(--sop-brand)" }}
//                 >
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT - Document Panel */}
//           <div
//             className="lg:col-span-2 rounded-xl border overflow-hidden"
//             style={{
//               backgroundColor: "var(--sop-panel)",
//               borderColor: "var(--sop-border)",
//             }}
//           >
//             {/* Document Toolbar */}
//             <div
//               className="p-4 border-b flex items-center justify-between"
//               style={{ borderColor: "var(--sop-border)" }}
//             >
//               <div className="flex items-center gap-2">
//                 <Badge
//                   variant="outline"
//                   className="text-xs"
//                   style={{
//                     backgroundColor: "var(--sop-chip)",
//                     borderColor: "var(--sop-border)",
//                     color: "var(--sop-text)",
//                   }}
//                 >
//                   Target: CS Ph.D. • Stanford
//                 </Badge>
//                 <Badge
//                   variant="outline"
//                   className="text-xs"
//                   style={{
//                     backgroundColor: "var(--sop-chip)",
//                     borderColor: "var(--sop-border)",
//                     color: "var(--sop-text)",
//                   }}
//                 >
//                   Words ~ {wordCount}
//                 </Badge>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   onClick={resetSections}
//                   variant="outline"
//                   size="sm"
//                   className="gap-1"
//                   style={{
//                     borderColor: "var(--sop-border)",
//                     color: "var(--sop-sub)",
//                   }}
//                 >
//                   <RotateCcw className="w-3 h-3" />
//                   Reset
//                 </Button>
//                 <Button
//                   onClick={exportTxt}
//                   size="sm"
//                   className="gap-1"
//                   style={{ backgroundColor: "var(--sop-brand)" }}
//                 >
//                   <Download className="w-3 h-3" />
//                   Export .txt
//                 </Button>
//               </div>
//             </div>

//             {/* Sections */}
//             <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4">
//               {Object.entries(sections).map(([key, section]) => (
//                 <div
//                   key={key}
//                   className="border rounded-xl p-4"
//                   style={{
//                     backgroundColor: "var(--sop-card)",
//                     borderColor: "var(--sop-border)",
//                   }}
//                 >
//                   {/* Section Header */}
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <h3
//                         className="font-medium"
//                         style={{ color: "var(--sop-text)" }}
//                       >
//                         {section.title}
//                       </h3>
//                       <span
//                         className="text-xs"
//                         style={{ color: "var(--sop-sub)" }}
//                       >
//                         {section.hint}
//                       </span>
//                       <Badge
//                         variant="outline"
//                         className="text-xs"
//                         style={{
//                           backgroundColor: "var(--sop-chip)",
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-text)",
//                         }}
//                       >
//                         {key}
//                       </Badge>
//                     </div>

//                     <div className="flex gap-1">
//                       <Button
//                         onClick={() => applySectionChange(key, "improve")}
//                         variant="outline"
//                         size="sm"
//                         className="text-xs gap-1"
//                         style={{
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-sub)",
//                         }}
//                       >
//                         <Sparkles className="w-3 h-3" />
//                         Improve
//                       </Button>
//                       <Button
//                         onClick={() => applySectionChange(key, "shorten")}
//                         variant="outline"
//                         size="sm"
//                         className="text-xs gap-1"
//                         style={{
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-sub)",
//                         }}
//                       >
//                         <Scissors className="w-3 h-3" />
//                         Shorten
//                       </Button>
//                       <Button
//                         onClick={() => applySectionChange(key, "expand")}
//                         variant="outline"
//                         size="sm"
//                         className="text-xs gap-1"
//                         style={{
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-sub)",
//                         }}
//                       >
//                         <Expand className="w-3 h-3" />
//                         Expand
//                       </Button>
//                       {key === "whySchool" && (
//                         <Button
//                           onClick={() => applySectionChange(key, "align")}
//                           variant="outline"
//                           size="sm"
//                           className="text-xs gap-1"
//                           style={{
//                             borderColor: "var(--sop-border)",
//                             color: "var(--sop-sub)",
//                           }}
//                         >
//                           <Target className="w-3 h-3" />
//                           Align to School
//                         </Button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Section Content */}
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                     {/* Left - Editor */}
//                     <div>
//                       <Textarea
//                         value={section.content}
//                         onChange={(e) =>
//                           updateSectionContent(key, e.target.value)
//                         }
//                         className="min-h-[120px] resize-none text-sm"
//                         style={{
//                           backgroundColor: "var(--sop-bg)",
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-text)",
//                         }}
//                       />
//                     </div>

//                     {/* Right - Preview */}
//                     <div className="space-y-2">
//                       <div
//                         className="min-h-[120px] p-3 rounded-lg border-2 border-dashed text-sm"
//                         style={{
//                           borderColor: "var(--sop-border)",
//                           color: "var(--sop-sub)",
//                         }}
//                       >
//                         <div
//                           className="text-xs font-medium mb-2"
//                           style={{ color: "var(--sop-sub)" }}
//                         >
//                           Preview:
//                         </div>
//                         {section.content}
//                       </div>

//                       <div className="flex items-center justify-between">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="text-xs"
//                           style={{
//                             borderColor: "var(--sop-border)",
//                             color: "var(--sop-sub)",
//                           }}
//                         >
//                           Save
//                         </Button>
//                         <span
//                           className="text-xs"
//                           style={{ color: "var(--sop-sub)" }}
//                         >
//                           Word ~ {getSectionWordCount(section.content)}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CreateSOP = () => {
//   const [activeTab, setActiveTab] = useState("guidance");

//   return (
//     <div className="animate-fade-in">
//       <Tabs
//         defaultValue="guidance"
//         value={activeTab}
//         onValueChange={setActiveTab}
//         className="w-full"
//       >
//         <div className="relative border-b border-gray-200 dark:border-gray-700">
//           <TabsList className="w-full h-auto px-2 py-1 bg-transparent overflow-x-auto flex justify-start">
//             {sopTabs.map((tab) => (
//               <TabsTrigger
//                 key={tab.id}
//                 value={tab.id}
//                 className={`
//                   px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
//                   ${
//                     activeTab === tab.id
//                       ? "text-purple-600 dark:text-purple-400"
//                       : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                   }
//                 `}
//               >
//                 {tab.icon}
//                 {tab.name}
//                 {activeTab === tab.id && (
//                   <motion.div
//                     className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
//                     layoutId="activeTabSOP"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.2 }}
//                   />
//                 )}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </div>

//         <TabsContent value="createSOP" className="m-0">
//           <CreateSOPBuilder />
//         </TabsContent>

//         <TabsContent value="guidance" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 SOP Guidance Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 Comprehensive guidance for writing effective statements of
//                 purpose.
//               </p>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="samples" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 SOP Samples Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 Browse through successful statement of purpose examples.
//               </p>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="aiImprovement" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 AI Improvement Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 AI-powered improvements for your statement of purpose.
//               </p>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="universityMatch" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 University Match Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 Match your SOP with specific university requirements.
//               </p>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="successStories" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 Success Stories Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 Read about successful applications and their SOPs.
//               </p>
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="aiHumanizer" className="m-0">
//           <div className="p-6">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold mb-4">
//                 AI Humanizer Coming Soon
//               </h2>
//               <p className="text-gray-600">
//                 Make your AI-generated content sound more human.
//               </p>
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default CreateSOP;

/////////////////////////////////////
///////////////////////////////////////////////
////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { motion } from "framer-motion";
import MySOP from "./MySOP";
import {
  BookOpen,
  FileText,
  Bot,
  Wand,
  University,
  Trophy,
  FileSearch,
  Clipboard,
  Send,
  Download,
  RotateCcw,
  Sparkles,
  Scissors,
  Expand,
  Target,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import ProgressCircle from "../ui/progress-circle";
import { Badge } from "../ui/badge";
import SampleSopGallery from "@/components/create-sop/SampleSopGallery";

/* =========================================================
   TABS (kept as in original — label remains "My SOP")
   ========================================================= */
const sopTabs = [
  { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
  { id: "samples", name: "Samples", icon: <Clipboard className="w-4 h-4" /> },
  { id: "createSOP", name: "My SOP", icon: <FileText className="w-4 h-4" /> },
  {
    id: "aiImprovement",
    name: "AI Improvement",
    icon: <Wand className="w-4 h-4" />,
  },
  {
    id: "universityMatch",
    name: "Match with University",
    icon: <University className="w-4 h-4" />,
  },
  {
    id: "successStories",
    name: "Success Stories",
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    id: "aiHumanizer",
    name: "AI Humanizer",
    icon: <Bot className="w-4 h-4" />,
  },
];

/* =========================================================
   Guidance steps (used by Guidance tab from original code)
   ========================================================= */
const sopSteps = [
  {
    id: 1,
    title: "Country / Program / Level / University",
    icon: "🎓",
    description:
      "What country are you applying to, and what specific program and level of study are you pursuing at the university?",
  },
  {
    id: 2,
    title: "Hook",
    icon: "🔍",
    description:
      "Create a compelling opening that grabs the reader's attention and introduces your academic passion.",
  },
  {
    id: 3,
    title: "Journey",
    icon: "🚀",
    description:
      "Describe your academic and professional journey that led you to this specific field of interest.",
  },
  {
    id: 4,
    title: "Motivation",
    icon: "⭐",
    description:
      "Explain what motivates you to pursue this specific program and institution.",
  },
  {
    id: 5,
    title: "Goals",
    icon: "🎯",
    description:
      "Outline your short-term and long-term goals after completing this program.",
  },
];

/* =========================================================
   CreateSOPBuilder (NEW) — from your second code
   Only used inside TabsContent value="createSOP" (My SOP)
   ========================================================= */

const initialSections = {
  hook: {
    title: "Hook",
    hint: "80–120 words, problem/motivation",
    content:
      "In a world increasingly driven by data and artificial intelligence, I find myself captivated by the intersection of technology and human understanding. My journey into computer science began with a simple question: how can we build systems that not only process information but truly comprehend and assist human decision-making? This fundamental curiosity has shaped my academic pursuits and research interests, leading me to seek advanced study in machine learning and natural language processing.",
  },
  segue: {
    title: "Segue",
    hint: "bridge to academic background",
    content:
      "This passion for bridging technology and human cognition naturally led me to pursue rigorous academic training in computer science, where I could explore both the theoretical foundations and practical applications of intelligent systems.",
  },
  achievements: {
    title: "Academic Achievements",
    hint: "3–5 impactful items with numbers",
    content:
      "During my undergraduate studies, I maintained a 3.8 GPA while conducting research that resulted in 2 peer-reviewed publications in top-tier conferences. I led a team of 5 students in developing an innovative natural language processing system that achieved 94% accuracy in sentiment analysis, outperforming existing models by 12%. Additionally, I was awarded the Dean's List recognition for 6 consecutive semesters and received the Outstanding Computer Science Student Award in my senior year.",
  },
  extracurricular: {
    title: "Extracurricular Activities",
    hint: "volunteering/teaching/etc.",
    content:
      "Beyond academics, I dedicated 200+ hours to teaching programming to underrepresented youth through the Code for All initiative. I also served as president of the AI Ethics Society, organizing symposiums that attracted over 300 participants from industry and academia. My volunteer work includes mentoring 15 high school students in STEM fields and contributing to open-source machine learning libraries used by over 10,000 developers worldwide.",
  },
  publications: {
    title: "Publications",
    hint: "concise if any",
    content:
      "Smith, J., & Doe, A. (2023). 'Advancing Natural Language Understanding Through Contextual Embeddings.' Proceedings of the International Conference on Machine Learning, 45(2), 123-135.\n\nDoe, A., Johnson, K., & Smith, J. (2023). 'Ethical Considerations in Large Language Model Deployment.' Journal of AI Ethics, 8(3), 67-89.",
  },
  problems: {
    title: "Problems in Background",
    hint: "challenges/lessons learned",
    content:
      "One significant challenge I encountered was during my research internship when our initial approach to bias detection in language models consistently failed to meet accuracy benchmarks. Rather than abandoning the project, I spent months studying fairness metrics and collaborated with social scientists to understand the nuanced nature of algorithmic bias. This experience taught me the importance of interdisciplinary collaboration and resilient problem-solving, ultimately leading to a breakthrough that became the foundation for my thesis work.",
  },
  whySchool: {
    title: "Why This School?",
    hint: "labs/professors/fit",
    content:
      "Stanford's AI Lab, particularly Dr. Sarah Chen's work on interpretable machine learning, aligns perfectly with my research interests in developing transparent AI systems. The Human-Centered AI Institute's interdisciplinary approach, combining computer science with cognitive psychology and ethics, provides the exact environment I need to pursue my goal of creating AI that genuinely serves human needs. Additionally, the opportunity to collaborate with the Stanford NLP Group and access to cutting-edge computational resources would be invaluable for my research.",
  },
  goal: {
    title: "Your Goal/Conclusion",
    hint: "short-term/long-term goals",
    content:
      "In the short term, I aim to contribute to groundbreaking research in explainable AI while completing my PhD at Stanford. My long-term vision is to establish a research lab focused on developing AI systems that are not only powerful but also transparent, fair, and aligned with human values. I believe that through rigorous academic training and collaborative research, I can help shape the future of artificial intelligence to benefit society as a whole.",
  },
};

type MessageSender = "user" | "ai";
interface Message {
  sender: MessageSender;
  content: string;
}
interface Snapshot {
  id: string;
  timestamp: Date;
  sections: typeof initialSections;
}

const CreateSOPBuilder = () => {
  const [tone, setTone] = useState<"formal" | "friendly" | "story">("formal");
  const [sections, setSections] = useState(initialSections);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      content:
        "Welcome! I'm here to help you create an outstanding Statement of Purpose. You can ask me to improve specific sections, adjust the tone, or make any other changes you'd like.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const totalWords = Object.values(sections).reduce((total, section) => {
      return (
        total +
        (section.content
          ? section.content.split(" ").filter((w) => w.length > 0).length
          : 0)
      );
    }, 0);
    setWordCount(totalWords);
  }, [sections]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processMessage = (message: string): string => {
    const lower = message.toLowerCase();

    let target = "segue";
    if (lower.includes("hook")) target = "hook";
    else if (lower.includes("achievement") || lower.includes("academic"))
      target = "achievements";
    else if (lower.includes("publication")) target = "publications";
    else if (lower.includes("why") || lower.includes("school"))
      target = "whySchool";
    else if (lower.includes("goal") || lower.includes("conclusion"))
      target = "goal";
    else if (lower.includes("extracurricular")) target = "extracurricular";
    else if (lower.includes("problem") || lower.includes("challenge"))
      target = "problems";

    let mode = "improve";
    if (lower.includes("shorten")) mode = "shorten";
    else if (lower.includes("expand")) mode = "expand";
    else if (lower.includes("align")) mode = "align";

    applySectionChange(target, mode);
    return `✅ ${mode} applied on **${target}**.`;
  };

  const applySectionChange = (sectionKey: string, mode: string) => {
    setSections((prev) => {
      const section = (prev as any)[sectionKey];
      if (!section) return prev;

      let newContent = section.content;

      switch (mode) {
        case "shorten": {
          const words = newContent.split(" ");
          const targetLength = Math.max(18, Math.floor(words.length * 0.7));
          newContent =
            words.slice(0, targetLength).join(" ") +
            (words.length > targetLength ? "..." : "");
          break;
        }
        case "expand":
          if (sectionKey === "hook") {
            newContent +=
              " This early experience revealed the profound impact that well-designed technology can have on human potential.";
          } else if (sectionKey === "achievements") {
            newContent +=
              " These experiences have prepared me to tackle complex research challenges in graduate school.";
          } else {
            newContent +=
              " This foundation has shaped my research perspective and academic approach.";
          }
          break;
        case "align":
          if (sectionKey === "whySchool") {
            newContent +=
              " I am particularly excited about the opportunity to work with Professor Johnson's lab on neural network interpretability research.";
          }
          break;
        case "improve":
        default:
          if (tone === "friendly") {
            newContent = newContent
              .replace(/Furthermore,/g, "What's more,")
              .replace(/Additionally,/g, "I'm also excited that");
          } else if (tone === "story") {
            newContent =
              "Looking back, " +
              newContent.charAt(0).toLowerCase() +
              newContent.slice(1);
          }
          break;
      }

      return {
        ...prev,
        [sectionKey]: {
          ...section,
          content: newContent,
        },
      };
    });
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", content: inputValue }]);
    setTimeout(() => {
      const response = processMessage(inputValue);
      setMessages((prev) => [...prev, { sender: "ai", content: response }]);
    }, 600);
    setInputValue("");
  };

  const handleQuickAction = (action: string) => {
    let targetSection = "";
    let mode = "improve";

    if (action === "Improve Hook") {
      targetSection = "hook";
      mode = "improve";
    } else if (action === "Expand Why This School") {
      targetSection = "whySchool";
      mode = "expand";
    } else if (action === "Shorten Publications") {
      targetSection = "publications";
      mode = "shorten";
    }

    applySectionChange(targetSection, mode);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: `✅ ${mode} applied on **${targetSection}**.` },
    ]);
  };

  const saveSnapshot = () => {
    const snapshot: Snapshot = {
      id: `SOP-${String(snapshots.length + 1).padStart(3, "0")}`,
      timestamp: new Date(),
      sections: { ...sections },
    };
    setSnapshots((prev) => [...prev, snapshot]);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: `📸 Snapshot saved as ${snapshot.id}` },
    ]);
  };

  const resetSections = () => {
    setSections(initialSections);
    setMessages((prev) => [
      ...prev,
      { sender: "ai", content: "🔄 Draft reset." },
    ]);
  };

  const exportTxt = () => {
    let content = "# Statement of Purpose Draft\n\n";
    Object.entries(sections).forEach(([_, section]) => {
      content += `## ${section.title}\n\n${section.content}\n\n`;
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sop_draft.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSectionContent = (sectionKey: string, newContent: string) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey as keyof typeof prev],
        content: newContent,
      },
    }));
  };

  const getSectionWordCount = (content: string) =>
    content ? content.split(" ").filter((w) => w.length > 0).length : 0;

  return (
    <div
      className="min-h-screen"
      style={
        {
          "--sop-bg": "#0b1020",
          "--sop-panel": "#111827",
          "--sop-card": "#0e1526",
          "--sop-border": "#25324a",
          "--sop-chip": "#0b213a",
          "--sop-text": "#e5e7eb",
          "--sop-sub": "#9ca3af",
          "--sop-brand": "#7c3aed",
          "--sop-ok": "#22c55e",
          "--sop-warn": "#f59e0b",
        } as React.CSSProperties
      }
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: "var(--sop-panel)",
          borderColor: "var(--sop-border)",
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-1"
              style={{
                backgroundColor: "var(--sop-chip)",
                color: "var(--sop-text)",
              }}
            >
              QuestApply • AI Demo
            </Badge>
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--sop-text)" }}
            >
              Create SOP
            </h1>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div
        className="max-w-7xl mx-auto p-6"
        style={{ backgroundColor: "var(--sop-bg)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-120px)]">
          {/* LEFT - Chat Panel */}
          <div
            className="lg:col-span-1 rounded-xl border flex flex-col h-full"
            style={{
              backgroundColor: "var(--sop-panel)",
              borderColor: "var(--sop-border)",
            }}
          >
            {/* Chat Header */}
            <div
              className="p-4 border-b"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <Select
                  value={tone}
                  onValueChange={(v: "formal" | "friendly" | "story") =>
                    setTone(v)
                  }
                >
                  <SelectTrigger
                    className="w-full"
                    style={{
                      backgroundColor: "var(--sop-card)",
                      borderColor: "var(--sop-border)",
                      color: "var(--sop-text)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Tone: Formal</SelectItem>
                    <SelectItem value="friendly">Tone: Friendly</SelectItem>
                    <SelectItem value="story">Tone: Narrative</SelectItem>
                  </SelectContent>
                </Select>

                <Badge
                  className="text-xs whitespace-nowrap px-2 py-1"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    color: "var(--sop-text)",
                  }}
                >
                  Draft v1 • Skeleton
                </Badge>
              </div>

              <Button
                onClick={saveSnapshot}
                variant="outline"
                size="sm"
                className="w-full"
                style={{
                  borderColor: "var(--sop-border)",
                  color: "var(--sop-text)",
                }}
              >
                Save Snapshot
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      m.sender === "user"
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                    }`}
                    style={{
                      backgroundColor:
                        m.sender === "user"
                          ? "var(--sop-brand)"
                          : "var(--sop-card)",
                      color: "var(--sop-text)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div
              className="p-4 border-t space-y-2"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div
                className="text-xs font-medium mb-2"
                style={{ color: "var(--sop-sub)" }}
              >
                Quick Actions:
              </div>
              {[
                "Improve Hook",
                "Expand Why This School",
                "Shorten Publications",
              ].map((action) => (
                <Button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  style={{
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-sub)",
                  }}
                >
                  {action}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div
              className="p-4 border-t"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="e.g., Improve Academic Achievements with metrics"
                  className="flex-1 px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: "var(--sop-card)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="px-3"
                  style={{ backgroundColor: "var(--sop-brand)" }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT - Document Panel */}
          <div
            className="lg:col-span-2 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: "var(--sop-panel)",
              borderColor: "var(--sop-border)",
            }}
          >
            {/* Toolbar */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--sop-border)" }}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                >
                  Target: CS Ph.D. • Stanford
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: "var(--sop-chip)",
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-text)",
                  }}
                >
                  Words ~ {wordCount}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={resetSections}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  style={{
                    borderColor: "var(--sop-border)",
                    color: "var(--sop-sub)",
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
                <Button
                  onClick={exportTxt}
                  size="sm"
                  className="gap-1"
                  style={{ backgroundColor: "var(--sop-brand)" }}
                >
                  <Download className="w-3 h-3" />
                  Export .txt
                </Button>
              </div>
            </div>

            {/* Sections */}
            <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4">
              {Object.entries(sections).map(([key, section]) => (
                <div
                  key={key}
                  className="border rounded-xl p-4"
                  style={{
                    backgroundColor: "var(--sop-card)",
                    borderColor: "var(--sop-border)",
                  }}
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-medium"
                        style={{ color: "var(--sop-text)" }}
                      >
                        {section.title}
                      </h3>
                      <span
                        className="text-xs"
                        style={{ color: "var(--sop-sub)" }}
                      >
                        {section.hint}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: "var(--sop-chip)",
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-text)",
                        }}
                      >
                        {key}
                      </Badge>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        onClick={() => applySectionChange(key, "improve")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Improve
                      </Button>
                      <Button
                        onClick={() => applySectionChange(key, "shorten")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Scissors className="w-3 h-3" />
                        Shorten
                      </Button>
                      <Button
                        onClick={() => applySectionChange(key, "expand")}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <Expand className="w-3 h-3" />
                        Expand
                      </Button>
                      {key === "whySchool" && (
                        <Button
                          onClick={() => applySectionChange(key, "align")}
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          style={{
                            borderColor: "var(--sop-border)",
                            color: "var(--sop-sub)",
                          }}
                        >
                          <Target className="w-3 h-3" />
                          Align to School
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSectionContent(key, e.target.value)
                        }
                        className="min-h[120px] min-h-[120px] resize-none text-sm"
                        style={{
                          backgroundColor: "var(--sop-bg)",
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-text)",
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div
                        className="min-h-[120px] p-3 rounded-lg border-2 border-dashed text-sm"
                        style={{
                          borderColor: "var(--sop-border)",
                          color: "var(--sop-sub)",
                        }}
                      >
                        <div
                          className="text-xs font-medium mb-2"
                          style={{ color: "var(--sop-sub)" }}
                        >
                          Preview:
                        </div>
                        {section.content}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          style={{
                            borderColor: "var(--sop-border)",
                            color: "var(--sop-sub)",
                          }}
                        >
                          Save
                        </Button>
                        <span
                          className="text-xs"
                          style={{ color: "var(--sop-sub)" }}
                        >
                          Word ~ {getSectionWordCount(section.content)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Main CreateSOP (keeps all other tabs unchanged)
   Only the My SOP tab renders <CreateSOPBuilder />
   ========================================================= */

interface SOPSample {
  id: number;
  file: string;
  program_id?: number;
  level?: string;
  date?: string;
  name?: string;
  description?: string;
  point?: boolean;
}

const CreateSOP = () => {
  const [fetchedTemplates, setFetchedTemplates] = useState<SOPSample[]>([]);
  const [activeTab, setActiveTab] = useState("guidance");
  const [selectedDegree, setSelectedDegree] = useState("All");
  const [selectedField, setSelectedField] = useState("All");
  const [filteredSamples, setFilteredSamples] = useState<SOPSample[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoadingApi(false);
      return;
    }
    setIsLoadingApi(true);
    try {
      const response = await fetch("http://localhost:5000/api/sop/sample", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data: SOPSample[] = await response.json();
      const processedData = data.map((t) => ({
        ...t,
        name: t.name || `SOP Sample ${t.id}`,
        description: t.description || "A professional SOP Sample.",
        popular: t.point || 0,
      }));
      setFetchedTemplates(processedData);
      setApiError(null);
      setFilteredSamples(processedData);
    } catch (err: any) {
      setApiError(
        err?.message || "An unknown error occurred while fetching templates."
      );
      setFetchedTemplates([]);
      setFilteredSamples([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filterSamples = (degree: string, field: string) => {
    let filtered = fetchedTemplates;
    if (degree !== "All") filtered = filtered.filter((s) => s.level === degree);
    if (field !== "All") filtered = filtered.filter((s) => s.level === field);
    setFilteredSamples(filtered);
  };

  return (
    <div className="animate-fade-in">
      <Tabs
        defaultValue="guidance"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="relative border-b border-gray-200 dark:border-gray-700">
          <TabsList className="w-full h-auto px-2 py-1 bg-transparent overflow-x-auto flex justify-start">
            {sopTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  px-4 py-3 flex items-center gap-2 whitespace-nowrap relative font-medium transition-all duration-300
                  ${
                    activeTab === tab.id
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                `}
              >
                {tab.icon}
                {tab.name}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"
                    layoutId="activeTabSOP"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* My SOP (REPLACED) */}
        <TabsContent value="createSOP" className="m-0">
          <MySOP />
        </TabsContent>

        {/* Guidance Tab (unchanged) */}
        <TabsContent value="guidance" className="m-0">
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-4">
                  How to Write an Effective Statement of Purpose
                </h2>
                <p className="text-lg">
                  A compelling Statement of Purpose (SOP) is your opportunity to
                  showcase your academic achievements, research interests, and
                  career goals to admission committees. Follow the structure
                  below to create a powerful SOP that stands out.
                </p>
              </div>

              <div className="mt-8 space-y-12">
                {sopSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="absolute left-0 top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                      {step.id}
                    </div>

                    <div className="ml-16">
                      <div className="flex mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                      <div className="pl-20">
                        <p className="text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < sopSteps.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700 h-16" />
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6 text-lg"
                  onClick={() => setActiveTab("createSOP")}
                >
                  Create My Statement of Purpose
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Samples Tab (unchanged, keeps API + filters) */}
        <TabsContent value="samples" className="m-0">
          <SampleSopGallery />
        </TabsContent>

        {/* AI Improvement (unchanged) */}
        <TabsContent value="aiImprovement" className="m-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered SOP Improvement
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our AI will analyze your Statement of Purpose and suggest
              improvements for clarity, structure, and impact.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Your Original SOP
                </h3>
                <Textarea
                  className="min-h-[400px] font-serif text-base"
                  placeholder="Paste your SOP here..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  AI Improved Version
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[400px] font-serif text-base bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-gray-500 dark:text-gray-400">
                    AI suggestions will appear here after you submit your SOP...
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-4">
              <Button variant="outline" size="lg" className="px-6">
                Preview Changes
              </Button>
              <Button
                size="lg"
                className="px-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                <Wand className="h-5 w-5 mr-2" />
                Improve My SOP
              </Button>
            </div>

            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                AI Analysis
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={85} size="md" color="blue" />
                  <h4 className="text-lg font-medium mt-4">Clarity Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Your SOP is clear and well-structured
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={68} size="md" color="purple" />
                  <h4 className="text-lg font-medium mt-4">Uniqueness Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Adds some unique elements but could be more distinctive
                  </p>
                </div>

                <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <ProgressCircle value={92} size="md" color="green" />
                  <h4 className="text-lg font-medium mt-4">Relevance Score</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Excellent alignment with program requirements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* University Match (unchanged placeholder) */}
        <TabsContent value="universityMatch" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                University Match Coming Soon
              </h2>
              <p className="text-gray-600">
                Match your SOP with specific university requirements.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Success Stories (unchanged placeholder) */}
        <TabsContent value="successStories" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Success Stories Coming Soon
              </h2>
              <p className="text-gray-600">
                Read about successful applications and their SOPs.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* AI Humanizer (unchanged placeholder) */}
        <TabsContent value="aiHumanizer" className="m-0">
          <div className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                AI Humanizer Coming Soon
              </h2>
              <p className="text-gray-600">
                Make your AI-generated content sound more human.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateSOP;
