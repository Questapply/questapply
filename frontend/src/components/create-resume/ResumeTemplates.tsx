// import { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import { Button } from "../ui/button";
// import { Card } from "../ui/card";
// import { Download, Star } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";

// import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton";
// import { useToast } from "../ui/use-toast";
// import { fetchTemplates } from "@/api/resumeApi";

// // Interface for resume template structure
// interface ResumeTemplate {
//   id: number;
//   image: string; // URL of the template image
//   program_id?: number;
//   level?: string;
//   date?: string;
//   name?: string;
//   description?: string;
//   popular?: boolean;
// }

// // Framer Motion variants for the container animation
// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// // Framer Motion variants for individual item animation
// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 },
// };

// interface ResumeTemplatesProps {
//   onTemplateSelect: (templateId: number, templateName: string) => void;
// }

// const ResumeTemplates = ({ onTemplateSelect }: ResumeTemplatesProps) => {
//   const [fetchedTemplates, setFetchedTemplates] = useState<ResumeTemplate[]>(
//     []
//   );
//   const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true); // Controls API loading state for skeleton display
//   const [apiError, setApiError] = useState<string | null>(null);
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState<string | null>(null); // Controls loading state for individual template buttons

//   const navigate = useNavigate();
//   const location = useLocation();

//   // Memoized function to fetch resume templates from the API
//   const fetchTemplatesCB = useCallback(async () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setIsLoadingApi(false);
//       return;
//     }
//     setIsLoadingApi(true);
//     try {
//       const data = await fetchTemplates(); // NEW
//       const processed = (data ?? []).map((t: any) => ({
//         ...t,
//         name: t.name || `Resume Template ${t.id}`,
//         description: t.description || "A professional resume template.",
//         popular: !!t.popular,
//       }));
//       setFetchedTemplates(processed);
//       setApiError(null);
//     } catch (e: any) {
//       setApiError(e?.message || "Failed to fetch templates.");
//       setFetchedTemplates([]);
//     } finally {
//       setIsLoadingApi(false);
//     }
//   }, []); // Empty dependency array means this callback is created only once

//   // useEffect hook to call fetchTemplates on component mount
//   useEffect(() => {
//     fetchTemplatesCB();
//   }, [fetchTemplatesCB]); // `fetchTemplates` is a dependency as it's a stable callback

//   // Handler for using a template, simulates a selection process
//   const handleUseTemplate = (templateId: number, templateName: string) => {
//     setIsLoading(String(templateId)); // Set loading state for the specific template button

//     toast({
//       title: "Template Selected",
//       description: "Successfully selected the Resume template!",
//       variant: "default",
//     });

//     setTimeout(() => {
//       onTemplateSelect(templateId, templateName);
//       setIsLoading(null); // Clear loading state for the button
//     }, 1000); // Simulate a delay for the selection process
//   };

//   return (
//     <div className="p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="mb-8"
//       >
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
//           Choose Your Template
//         </h2>
//         <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
//           Select from our professionally designed templates to create a standout
//           resume that matches your career goals and personal style.
//         </p>
//       </motion.div>

//       {/* Conditional Rendering Logic */}
//       {isLoadingApi ? (
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
//         >
//           {/* Render multiple skeleton loaders for a better loading experience */}
//           {Array.from({ length: 4 }).map((_, index) => (
//             <LoadingSkeleton key={index} type="skeleton" count={1} />
//           ))}
//         </motion.div>
//       ) : apiError ? (
//         <div className="text-center text-red-500 dark:text-red-400 py-10">
//           <p>Error fetching templates: {apiError}</p>
//           <p>
//             Please try refreshing the page or contact support if the issue
//             persists.
//           </p>
//         </div>
//       ) : fetchedTemplates.length > 0 ? (
//         <motion.div
//           variants={container}
//           initial="hidden"
//           animate="show"
//           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
//         >
//           {fetchedTemplates.map((template) => (
//             <motion.div
//               key={template.id} // Use template.id as the unique key
//               variants={item}
//               whileHover={{
//                 y: -8,
//                 transition: { type: "spring", stiffness: 300, damping: 20 },
//               }}
//             >
//               <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
//                 <div className="relative">
//                   <img
//                     src={template.image}
//                     alt={template.name || `Resume Template ${template.id}`} // Fallback alt text for image
//                     className="w-full h-64 object-contain object-center p-2 bg-white" // Ensure white background for transparent images
//                   />
//                   {template.popular && (
//                     <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
//                       <Star className="w-3 h-3 mr-1" fill="white" />
//                       Popular
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-5">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
//                     {template.name || `Resume Template ${template.id}`}
//                   </h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">
//                     {template.description || "A professional resume template."}
//                   </p>
//                   <div className="flex space-x-2">
//                     <Button
//                       className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
//                       onClick={() => {
//                         handleUseTemplate(
//                           template.id,
//                           template.name || `Template ${template.id}`
//                         );
//                         // بعد از انتخاب، برو به تب ساخت رزومه
//                         const params = new URLSearchParams(location.search);
//                         params.set("tab", "create");
//                         navigate(`?${params.toString()}`, { replace: true });
//                       }}
//                       disabled={isLoading === String(template.id)}
//                     >
//                       {isLoading === String(template.id)
//                         ? "Loading..."
//                         : "USE TEMPLATE"}
//                     </Button>

//                     <Button variant="outline" size="icon">
//                       <Download className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </motion.div>
//           ))}
//         </motion.div>
//       ) : (
//         <div className="text-center text-gray-500 dark:text-gray-400 py-10">
//           <p>No resume templates found.</p>
//           <p>Check back later or try adjusting your criteria.</p>
//         </div>
//       )}

//       {/* "Import Existing Resume" button */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.5, duration: 0.5 }}
//         className="text-center mt-10"
//       >
//         <Button
//           variant="outline"
//           className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
//         >
//           <Download className="mr-2 h-4 w-4" />
//           Import Existing Resume
//         </Button>
//       </motion.div>
//     </div>
//   );
// };

// export default ResumeTemplates;
/////////////////////////////////////////
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Download, Star } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton";
import { useToast } from "../ui/use-toast";
import { fetchTemplates } from "@/api/resumeApi";

// ---------- Types ----------
interface ResumeTemplate {
  id: number;
  image?: string;
  program_id?: number;
  level?: string;
  date?: string;
  name?: string;
  description?: string;
  popular?: boolean;
}

interface ResumeTemplatesProps {
  onTemplateSelect: (templateId: number, templateName: string) => void;
}

// ---------- Animations ----------
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ResumeTemplates = ({ onTemplateSelect }: ResumeTemplatesProps) => {
  const [fetchedTemplates, setFetchedTemplates] = useState<ResumeTemplate[]>(
    []
  );
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // -------- fetch ----------

  const fetchTemplatesCB = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoadingApi(false);
      setFetchedTemplates([]);
      navigate("/auth?mode=login");
      return;
    }

    // فقط همین 4 تا
    const ALLOWED = new Set([84, 85, 86, 87]);

    setIsLoadingApi(true);
    try {
      const data = await fetchTemplates(); // همون API فعلی

      // 1) فیلتر روی آیدی‌ها (id ممکنه string بیاد، Number بگیر)
      const filtered = (Array.isArray(data) ? data : []).filter((t: any) =>
        ALLOWED.has(Number(t?.id ?? t?.ID))
      );

      // 2) map مثل قبل
      const processed: ResumeTemplate[] = filtered.map((t: any) => ({
        ...t,
        name: t?.name || `Resume Template ${t?.id ?? ""}`,
        description: t?.description || "A professional resume template.",
        popular: Boolean(t?.popular),
      }));

      setFetchedTemplates(processed);
      console.table(
        processed.map((t) => ({ id: t.id, name: t.name, image: t.image }))
      );
      setApiError(null);
    } catch (e: any) {
      setApiError(e?.message || "Failed to fetch templates.");
      setFetchedTemplates([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTemplatesCB();
  }, [fetchTemplatesCB]);

  // -------- select ----------
  const handleUseTemplate = (templateId: number, templateName: string) => {
    console.log("[TemplateSelect]", { templateId, templateName });
    setIsLoading(String(templateId));

    // 1) والد را مطلع کن (برای ست‌کردن selectedTemplateId در Create)
    onTemplateSelect(templateId, templateName);

    // 2) URL را به تب create ببریم و templateId را هم نگه داریم
    const params = new URLSearchParams(location.search);
    params.set("tab", "create");
    params.set("templateId", String(templateId));
    navigate(`?${params.toString()}`, { replace: true });

    toast({
      title: "Template Selected",
      description: `Selected: ${templateName}`,
      variant: "default",
    });

    setTimeout(() => setIsLoading(null), 400);
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
          Choose Your Template
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
          Select from our professionally designed templates to create a standout
          resume that matches your career goals and personal style.
        </p>
      </motion.div>

      {isLoadingApi ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} type="skeleton" count={1} />
          ))}
        </motion.div>
      ) : apiError ? (
        <div className="text-center text-red-500 dark:text-red-400 py-10">
          <p>Error fetching templates: {apiError}</p>
          <p>
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
        </div>
      ) : fetchedTemplates.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {fetchedTemplates.map((template) => (
            <motion.div
              key={template.id}
              variants={item}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={template.image || "/placeholder-template.png"}
                    alt={template.name || `Resume Template ${template.id}`}
                    className="w-full h-64 object-contain object-center p-2 bg-white"
                    loading="lazy"
                  />
                  {template.popular && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" fill="white" />
                      Popular
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {template.name || `Resume Template ${template.id}`}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">
                    {template.description || "A professional resume template."}
                  </p>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() =>
                        handleUseTemplate(
                          template.id,
                          template.name || `Template ${template.id}`
                        )
                      }
                      disabled={isLoading === String(template.id)}
                    >
                      {isLoading === String(template.id)
                        ? "Loading..."
                        : "USE TEMPLATE"}
                    </Button>

                    {/* Preview/Download sample (بدون resumeId فعلاً توست می‌دهیم) */}
                    <Button
                      variant="outline"
                      size="icon"
                      title="Preview / Download sample"
                      onClick={() =>
                        toast({
                          title: "Preview requires a resume",
                          description:
                            "First Save & Create your resume, then use the Preview button.",
                        })
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
          <p>No resume templates found.</p>
          <p>Check back later or try adjusting your criteria.</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center mt-10"
      >
        <Button
          variant="outline"
          className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
        >
          <Download className="mr-2 h-4 w-4" />
          Import Existing Resume
        </Button>
      </motion.div>
    </div>
  );
};

export default ResumeTemplates;
