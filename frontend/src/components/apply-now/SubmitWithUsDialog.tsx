// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { getDocumentCompletionPercentage } from "./documents";

// // فقط تایپ (بدون ایجاد باندل چرخه‌ای)
// import type { ProgramDetail } from "../ApplyNow";

// interface SubmitWithUsDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   activeApplication: number | null; // همان rel_id
//   applications: ProgramDetail[];
// }

// const SubmitWithUsDialog = ({
//   open,
//   onOpenChange,
//   activeApplication,
//   applications,
// }: SubmitWithUsDialogProps) => {
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   // آیتم انتخاب‌شده براساس rel_id
//   const [selectedApp, setSelectedApp] = React.useState<ProgramDetail | null>(
//     null
//   );

//   React.useEffect(() => {
//     if (!open || activeApplication == null) {
//       setSelectedApp(null);
//       return;
//     }
//     const found = applications.find((a) => a.id === activeApplication) ?? null;
//     setSelectedApp(found);
//   }, [open, activeApplication, applications]);

//   // استِپ‌های تایم‌لاین (UI)
//   const applicationSteps = [
//     { label: "Prepare Application", status: "completed" as const },
//     { label: "Review Documents", status: "current" as const },
//     { label: "Submission", status: "pending" as const },
//     { label: "Decision", status: "pending" as const },
//     { label: "Post-Decision Requirements", status: "pending" as const },
//     { label: "Enrollment Confirmation", status: "pending" as const },
//   ];

//   // محاسبه‌ی فی‌ها (ApplicationFee از دیتای برنامه + SubmissionFee ثابت 100)
//   const appFee =
//     (selectedApp?.applicationFees?.international ??
//       selectedApp?.applicationFees?.us ??
//       75) ||
//     0;
//   const submissionFee = 100;
//   const totalFee = appFee + submissionFee;

//   const documents = selectedApp?.documents ?? [];

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>Submit with QuestApply</DialogTitle>
//           <DialogDescription>
//             We'll help you prepare and submit your application to increase your
//             chances of acceptance.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="py-4">
//           {!selectedApp && open && (
//             <div className="text-sm text-gray-500">
//               No application selected.
//             </div>
//           )}

//           {selectedApp && (
//             <div className="space-y-6">
//               {/* Timeline */}
//               <div className="relative flex justify-between mb-6">
//                 {applicationSteps.map((step, i) => (
//                   <div key={i} className="flex flex-col items-center relative">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
//                         step.status === "completed"
//                           ? "bg-green-500 text-white"
//                           : step.status === "current"
//                           ? "bg-blue-500 text-white"
//                           : "bg-gray-200 dark:bg-gray-700 text-gray-400"
//                       }`}
//                     >
//                       {step.status === "completed" ? (
//                         <CheckCircle2 className="h-4 w-4" />
//                       ) : (
//                         <span>{i + 1}</span>
//                       )}
//                     </div>
//                     <span
//                       className="text-xs mt-2 text-center w-24 truncate"
//                       title={step.label}
//                     >
//                       {step.label}
//                     </span>

//                     {/* اتصال بین دایره‌ها */}
//                     {i < applicationSteps.length - 1 && (
//                       <div
//                         className={`absolute top-4 w-full h-[2px] left-1/2 ${
//                           step.status === "completed"
//                             ? "bg-green-500"
//                             : "bg-gray-200 dark:bg-gray-700"
//                         }`}
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {/* هشدار پرداخت */}
//               <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 p-3 rounded-md flex items-start">
//                 <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
//                 <p className="text-sm text-yellow-800 dark:text-yellow-200">
//                   Application will not be processed until payment is received.
//                 </p>
//               </div>

//               {/* مدارک موردنیاز */}
//               <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-4">Required Documents</h3>

//                 <div className="space-y-3">
//                   {documents.map((doc: any, i: number) => (
//                     <div
//                       key={i}
//                       className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-10 h-10 rounded-md flex items-center justify-center ${
//                             doc.status === "completed"
//                               ? "bg-green-100 dark:bg-green-900/20 text-green-500"
//                               : "bg-red-100 dark:bg-red-900/20 text-red-500"
//                           }`}
//                         >
//                           {doc.status === "completed" ? (
//                             <CheckCircle2 className="h-5 w-5" />
//                           ) : (
//                             <X className="h-5 w-5" />
//                           )}
//                         </div>
//                         <div>
//                           <p className="font-medium">{doc.name}</p>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">
//                             {doc.description ||
//                               (doc.status === "completed"
//                                 ? "Already uploaded"
//                                 : "Required for submission")}
//                           </p>
//                         </div>
//                       </div>

//                       {doc.status === "completed" ? (
//                         <Badge className="bg-green-500">
//                           <CheckCircle2 className="h-3 w-3 mr-1" />
//                           Completed
//                         </Badge>
//                       ) : (
//                         <Button size="sm" variant="outline" className="gap-1">
//                           <Upload className="h-3 w-3" />
//                           Upload
//                         </Button>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-8">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-medium">Submission Progress</h4>
//                     <span className="text-sm font-medium">
//                       {getDocumentCompletionPercentage(documents)}%
//                     </span>
//                   </div>
//                   <Progress
//                     value={getDocumentCompletionPercentage(documents)}
//                     className="h-2"
//                   />
//                 </div>
//               </div>

//               {/* هزینه‌ها */}
//               <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
//                 <h3 className="text-lg font-medium mb-3">
//                   Application & Submission Fees
//                 </h3>

//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span>Application Fee</span>
//                     <span>${appFee}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>Submission Fee</span>
//                     <span>${submissionFee}</span>
//                   </div>
//                   <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
//                     <span>Total Fee</span>
//                     <span>${totalFee}</span>
//                   </div>
//                 </div>

//                 <Button
//                   className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
//                   onClick={() => {
//                     toast({
//                       title: "Added to cart",
//                       description:
//                         "Payment flow is not implemented yet in this version.",
//                     });
//                   }}
//                 >
//                   Add to cart - ${totalFee}
//                 </Button>
//               </div>

//               {/* توضیح سرویس */}
//               <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
//                 <div className="flex items-start">
//                   <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
//                   <div>
//                     <h4 className="font-medium text-blue-800 dark:text-blue-300">
//                       QuestApply Submission Service
//                     </h4>
//                     <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
//                       Our experts will review your documents, suggest
//                       improvements, and handle the submission process for you.
//                       This service increases your chances of acceptance by
//                       ensuring all materials meet the program's expectations.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         <DialogFooter className="flex flex-row justify-end gap-3">
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button
//             onClick={() => {
//               onOpenChange(false);
//               if (selectedApp?.id) {
//                 // مثل نسخه قدیمی: رفتن به /psu/<rel_id>
//                 navigate(`/psu/${selectedApp.id}`);
//               } else {
//                 toast({
//                   title: "No application selected",
//                   description:
//                     "Please select an application before starting submission.",
//                   variant: "destructive",
//                 });
//               }
//             }}
//           >
//             Start Submission Process
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default SubmitWithUsDialog;
///////////////////////////////////////
/////////////////////////////////////////////
import React from "react";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle2, Upload, Clock, X } from "lucide-react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useToast } from "../../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useNavigate } from "react-router-dom";
import { getDocumentCompletionPercentage } from "../../utils/docs";
import { startOrUpdateSubmission } from "../../api/submission";

interface SubmitWithUsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeApplication: number | null;
  applications: any[];
}

const SubmitWithUsDialog = ({
  open,
  onOpenChange,
  activeApplication,
  applications,
}: SubmitWithUsDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const applicationData = applications.find(
    (app) => app.id === activeApplication
  );

  // نمایش قدم‌ها فقط UI ساده
  const applicationSteps = [
    { label: "Prepare Application", status: "completed" },
    { label: "Review Documents", status: "current" },
    { label: "Submission", status: "pending" },
    { label: "Decision", status: "pending" },
    { label: "Post-Decision Requirements", status: "pending" },
    { label: "Enrollment Confirmation", status: "pending" },
  ];

  const handleStart = async () => {
    if (!activeApplication) return;
    try {
      await startOrUpdateSubmission(activeApplication, token, false);
      onOpenChange(false);
      navigate(`/psu/${activeApplication}`);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to start submission",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Submit with QuestApply</DialogTitle>
          <DialogDescription>
            We'll help you prepare and submit your application to increase your
            chances of acceptance.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {activeApplication !== null && applicationData && (
            <div className="space-y-6">
              {/* Timeline (UI ساده) */}
              <div className="relative flex justify-between mb-6">
                {applicationSteps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center z-10 
                      ${
                        step.status === "completed"
                          ? "bg-green-500 text-white"
                          : step.status === "current"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span
                      className="text-xs mt-2 text-center w-24 truncate"
                      title={step.label}
                    >
                      {step.label}
                    </span>
                    {i < applicationSteps.length - 1 && (
                      <div
                        className={`absolute top-4 w-full h-[2px] left-1/2 
                        ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* هشدار پرداخت */}
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 p-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Application will not be processed until payment is received.
                </p>
              </div>

              {/* مدارک (نمایش خلاصه) */}
              <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Documents Summary</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion:{" "}
                  {getDocumentCompletionPercentage(applicationData.documents)}%
                </div>
                <Progress
                  value={getDocumentCompletionPercentage(
                    applicationData.documents
                  )}
                  className="h-2 mt-2"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Submission Process</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitWithUsDialog;
