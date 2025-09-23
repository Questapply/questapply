//////////////////////////////////
// // src/pages/PSU.tsx
// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { CheckCircle2, AlertCircle, Upload, X, ArrowLeft } from "lucide-react";
// import { Button } from "../ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useToast } from "@/hooks/use-toast";
// import {
//   getSubmissionFees,
//   getSubmissionDocs,
//   startOrUpdateSubmission,
//   getProgramDetails,
//   uploadSubmissionFile,
// } from "@/api/submission";

// const REVIEW_FEE = 50;

// // حداقل تایپ لازم از دیتای برنامه
// type ProgramDetailLite = {
//   id: number; // rel_id
//   name: string;
//   school: string;
//   schoolLogo: string;
//   degree: string;
//   contact: { website: string };
// };

// type RoadStatus = "completed" | "current" | "pending" | "skipped";

// // نرمال‌سازی وضعیت داک‌ها (done → completed)
// const normalizeDocs = (docs: any[] = []) =>
//   docs.map((d) => ({
//     ...d,
//     status: d.status === "done" ? "completed" : d.status, // یکدست‌سازی
//   }));

// function computeRoadmapStatuses({
//   docs,
//   reviewEnabled,
//   submissionStatus,
//   paid,
// }: {
//   docs: Array<{
//     required: boolean;
//     status: "missing" | "pending" | "completed";
//   }>;
//   reviewEnabled: boolean;
//   submissionStatus:
//     | "draft"
//     | "review"
//     | "submission"
//     | "decision"
//     | "post"
//     | "enroll";
//   paid: boolean;
// }) {
//   const req = docs.filter((d) => d.required);
//   const allReqDone =
//     req.length > 0 && req.every((d) => d.status === "completed");

//   const order = [
//     "draft",
//     "review",
//     "submission",
//     "decision",
//     "post",
//     "enroll",
//   ] as const;
//   const currentIdx = Math.max(0, order.indexOf(submissionStatus));

//   const steps = [
//     { key: "draft", label: "Prepare Application" },
//     { key: "review", label: "Review Documents" },
//     { key: "submission", label: "Submission" },
//     { key: "decision", label: "Decision" },
//     { key: "post", label: "Post-Decision Requirement" },
//     { key: "enroll", label: "Enrollment Confirmation" },
//   ].map((s, i) => {
//     let status: RoadStatus = "pending";

//     if (submissionStatus === "draft") {
//       if (s.key === "draft") status = allReqDone ? "completed" : "current";
//       else if (s.key === "review")
//         status = reviewEnabled
//           ? allReqDone
//             ? "current"
//             : "pending"
//           : "skipped";
//       else if (s.key === "submission")
//         status = allReqDone && paid ? "current" : "pending";
//       else status = "pending";
//     } else {
//       if (i < currentIdx) status = "completed";
//       else if (i === currentIdx) status = "current";
//       else status = "pending";
//       if (!reviewEnabled && s.key === "review") {
//         status = i < currentIdx ? "completed" : "skipped";
//       }
//     }

//     return { ...s, status };
//   });

//   return steps;
// }

// function PSU() {
//   const { relId } = useParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const token = useMemo(() => localStorage.getItem("token") || "", []);

//   const [loading, setLoading] = useState(true);

//   const [fees, setFees] = useState<{
//     application: number | null;
//     submission: number | null;
//     total: number | null;
//     review?: number | null;
//     currency: string;
//     symbol: string;
//   } | null>(null);

//   const [docs, setDocs] = useState<any[]>([]);
//   const [program, setProgram] = useState<ProgramDetailLite | null>(null);

//   const [submissionStatus, setSubmissionStatus] = useState<
//     "draft" | "review" | "submission" | "decision" | "post" | "enroll"
//   >("draft");
//   const [hasPaid, setHasPaid] = useState<boolean>(false);
//   const [reviewEnabled, setReviewEnabled] = useState(false);

//   const [busy, setBusy] = useState(false);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

//   // برای اسکرول به سکشن‌ها
//   const draftRef = useRef<HTMLDivElement | null>(null);
//   const reviewRef = useRef<HTMLDivElement | null>(null);
//   const submissionRef = useRef<HTMLDivElement | null>(null);

//   const handleOpenFilePicker = (docKey: string) => {
//     setSelectedDocKey(docKey);
//     fileInputRef.current?.click();
//   };

//   const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (
//     e
//   ) => {
//     const file = e.target.files?.[0];
//     e.target.value = ""; // امکان انتخاب مجدد همان فایل
//     if (!file || !selectedDocKey || !relId) return;

//     try {
//       setUploading(true);
//       const resp = await uploadSubmissionFile(
//         relId,
//         token,
//         selectedDocKey,
//         file
//       );
//       // انتظار: سرور لیست کامل docs را برگرداند
//       setDocs(normalizeDocs(resp.docs || resp.documents || []));
//       // اگر سرور status/fees هم برگرداند:
//       if (resp.status) setSubmissionStatus(resp.status);
//       if (resp.fees?.paid != null) setHasPaid(!!resp.fees.paid);

//       toast({
//         title: "Uploaded",
//         description: "Document uploaded successfully.",
//       });
//     } catch (err: any) {
//       toast({
//         title: "Upload failed",
//         description: err?.message || "Please try again",
//         variant: "destructive",
//       });
//     } finally {
//       setUploading(false);
//       setSelectedDocKey(null);
//     }
//   };
//   const totalWithReview = useMemo(() => {
//     const base =
//       fees?.total ?? (fees?.application ?? 0) + (fees?.submission ?? 0);
//     const review = reviewEnabled ? fees?.review ?? REVIEW_FEE : 0;
//     return base + review;
//   }, [fees, reviewEnabled]);

//   useEffect(() => {
//     if (!token) {
//       navigate("/auth?mode=login");
//       return;
//     }
//     if (!relId) return;

//     (async () => {
//       try {
//         setLoading(true);

//         const [feesRes, docsRes, progRes] = await Promise.all([
//           getSubmissionFees(relId, token), // اگر نساختی می‌تونی موقت حذفش کنی و فقط از docsRes.fees بخونی
//           getSubmissionDocs(relId, token),
//           getProgramDetails(relId, token),
//         ]);

//         // fees
//         if (feesRes) {
//           setFees({
//             application: feesRes.application ?? null,
//             submission: feesRes.submission ?? null,
//             total: feesRes.total ?? null,
//             review: feesRes.review ?? REVIEW_FEE,
//             currency: feesRes.currency,
//             symbol: feesRes.symbol,
//           });
//         } else if (docsRes?.fees) {
//           setFees({
//             application: docsRes.fees.application ?? null,
//             submission: docsRes.fees.submission ?? null,
//             total: docsRes.fees.total ?? null,
//             review: feesRes.review ?? REVIEW_FEE,
//             currency: docsRes.fees.currency || "USD",
//             symbol: docsRes.fees.symbol || "$",
//           });
//         }

//         // docs + status
//         setDocs(normalizeDocs(docsRes.docs || docsRes.documents || []));
//         setSubmissionStatus(docsRes.status ?? "draft");
//         setReviewEnabled(
//           Boolean(docsRes.review_enabled ?? docsRes.fees?.reviewEnabled)
//         );
//         setHasPaid(Boolean(docsRes.fees?.paid ?? false));

//         // program
//         setProgram({
//           id: progRes.id,
//           name: progRes.name,
//           school: progRes.school,
//           schoolLogo: progRes.schoolLogo,
//           degree: progRes.degree,
//           contact: { website: progRes.contact?.website || "" },
//         });
//       } catch (e: any) {
//         toast({
//           title: "Error",
//           description: e?.message || "Failed to load submission data",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [relId, token, navigate, toast]);

//   const completion = useMemo(() => {
//     if (!docs.length) return 0;
//     const done = docs.filter((d) => d.status === "completed").length;
//     return Math.round((done / docs.length) * 100);
//   }, [docs]);

//   // محاسبه‌ی استپ‌ها به‌صورت داینامیک
//   const steps = useMemo(
//     () =>
//       computeRoadmapStatuses({
//         docs,
//         reviewEnabled,
//         submissionStatus,
//         paid: hasPaid,
//       }),
//     [docs, reviewEnabled, submissionStatus, hasPaid]
//   );

//   const scrollToSection = (key: string) => {
//     const map: Record<string, React.RefObject<HTMLDivElement>> = {
//       draft: draftRef,
//       review: reviewRef,
//       submission: submissionRef,
//     };
//     map[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   async function handleStartOrUpdate() {
//     if (!relId) return;
//     try {
//       setBusy(true);
//       const resp = await startOrUpdateSubmission(relId, token, reviewEnabled);

//       setDocs(normalizeDocs(resp.docs || resp.documents || []));
//       if (resp.status) setSubmissionStatus(resp.status);
//       if (resp.fees?.paid != null) setHasPaid(!!resp.fees.paid);
//       if (resp.fees?.reviewEnabled != null)
//         setReviewEnabled(!!resp.fees.reviewEnabled);

//       toast({ title: "Saved", description: "Submission updated." });
//     } catch (e: any) {
//       toast({
//         title: "Error",
//         description: e?.message || "Failed to start/update submission",
//         variant: "destructive",
//       });
//     } finally {
//       setBusy(false);
//     }
//   }

//   function goCheckout() {
//     navigate(`/checkout?relId=${relId}`);
//   }

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded" />
//           <div className="lg:col-span-2 h-64 bg-gray-100 dark:bg-gray-800 rounded" />
//         </div>
//       </div>
//     );
//   }

//   async function handleToggleReview(enabled: boolean) {
//     if (!relId) return;
//     const prev = reviewEnabled;
//     setReviewEnabled(enabled);
//     try {
//       const resp = await startOrUpdateSubmission(relId, token, enabled);

//       if (resp.fees) {
//         setFees((old) => ({
//           application: resp.fees.application ?? old?.application ?? null,
//           submission: resp.fees.submission ?? old?.submission ?? null,
//           total: resp.fees.total ?? old?.total ?? null,
//           review: resp.fees.review ?? old?.review ?? REVIEW_FEE,
//           currency: resp.fees.currency ?? old?.currency ?? "USD",
//           symbol: resp.fees.symbol ?? old?.symbol ?? "$",
//         }));
//       }
//       if (resp.docs || resp.documents) {
//         setDocs(normalizeDocs(resp.docs || resp.documents));
//       }
//       if (typeof resp.review_enabled !== "undefined") {
//         setReviewEnabled(!!resp.review_enabled);
//       }
//       toast({ title: "Saved", description: "Review option updated." });
//     } catch (e: any) {
//       setReviewEnabled(prev); // برگردون
//       toast({
//         title: "Error",
//         description: e?.message || "Failed to update review option",
//         variant: "destructive",
//       });
//     }
//   }
//   const REVIEW_FEE = fees?.review ?? 50;
//   const baseTotal =
//     fees?.total ?? (fees?.application ?? 0) + (fees?.submission ?? 0);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header + back + breadcrumb */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Button variant="ghost" onClick={() => navigate(-1)}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//           <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
//             Submit with Us
//           </h1>
//         </div>
//         <div className="text-xs text-muted-foreground hidden md:block">
//           <div className="flex items-center gap-2">
//             <Link to="/my-account" className="hover:underline">
//               Home
//             </Link>
//             <span>/</span>
//             <Link to="/apply-now" className="hover:underline">
//               Applications
//             </Link>
//             <span>/</span>
//             <span className="text-foreground font-medium truncate">
//               {program?.name || "-"}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Steps (Roadmap) */}
//       <div className="relative flex justify-between bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
//         {steps.map((step, i) => (
//           <div key={step.key} className="flex flex-col items-center relative">
//             <button
//               type="button"
//               onClick={() => scrollToSection(step.key)}
//               className={[
//                 "w-8 h-8 rounded-full flex items-center justify-center z-10 border",
//                 step.status === "completed"
//                   ? "bg-green-500 text-white border-green-500"
//                   : step.status === "current"
//                   ? "bg-blue-500 text-white border-blue-500"
//                   : step.status === "skipped"
//                   ? "bg-gray-300 text-gray-500 border-gray-300"
//                   : "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600",
//               ].join(" ")}
//               title={step.label}
//             >
//               {step.status === "completed" ? (
//                 <CheckCircle2 className="h-4 w-4" />
//               ) : (
//                 <span>{i + 1}</span>
//               )}
//             </button>
//             <span className="text-xs mt-2 text-center w-32 truncate">
//               {step.label}
//             </span>

//             {i < steps.length - 1 && (
//               <div
//                 className={[
//                   "absolute top-4 left-1/2 w-full h-[2px]",
//                   steps[i].status === "completed" &&
//                   (steps[i + 1].status === "completed" ||
//                     steps[i + 1].status === "current")
//                     ? "bg-green-500"
//                     : "bg-gray-200 dark:bg-gray-700",
//                 ].join(" ")}
//               />
//             )}
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left: Program card + Fees */}
//         <div className="space-y-6">
//           <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
//             <div className="flex items-start gap-3">
//               {program?.schoolLogo ? (
//                 <img
//                   src={program.schoolLogo}
//                   alt={program.school}
//                   className="w-12 h-12 object-contain bg-gray-100 dark:bg-gray-800 rounded"
//                 />
//               ) : null}
//               <div>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {program?.school}
//                 </p>
//                 <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-5">
//                   {program?.name}
//                 </h2>
//                 <div className="mt-1">
//                   <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
//                     {program?.degree || "Program"}
//                   </Badge>
//                 </div>
//                 <Link
//                   to={`/program/${program?.id}`}
//                   className="text-blue-600 hover:underline text-sm"
//                 >
//                   View program details
//                 </Link>
//               </div>
//             </div>
//           </div>

//           <div
//             ref={submissionRef}
//             className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
//           >
//             <h3 className="font-medium mb-3">Application & Submission Fees</h3>

//             {!!fees && (
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span>Application Fee</span>
//                   <span>
//                     {fees.symbol}
//                     {fees.application ?? 0} {fees.currency}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Submission Fee</span>
//                   <span>
//                     {fees.symbol}
//                     {fees.submission ?? 0} {fees.currency}
//                   </span>
//                 </div>

//                 {/* سوییچ Review Documents */}
//                 <div className="flex items-center justify-between pt-2">
//                   <label className="flex items-center gap-2 cursor-pointer select-none">
//                     Review Documents
//                   </label>
//                   <Button
//                     size="sm"
//                     variant={reviewEnabled ? "secondary" : "outline"}
//                     onClick={() => setReviewEnabled((v) => !v)}
//                   >
//                     {reviewEnabled ? "Remove" : "Add"}
//                   </Button>
//                 </div>

//                 {/* باکس نمایش مبلغ Review هنگام فعال بودن */}
//                 {reviewEnabled && (
//                   <div className="mt-2 text-sm rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/30">
//                     Document Review Fee:{" "}
//                     <strong>
//                       {fees.symbol}
//                       {fees.review ?? REVIEW_FEE}
//                     </strong>
//                   </div>
//                 )}

//                 <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
//                   <span>Total</span>
//                   <span>
//                     {fees?.symbol}
//                     {totalWithReview} {fees?.currency}
//                   </span>
//                 </div>
//               </div>
//             )}

//             <Button className="w-full mt-4" onClick={goCheckout}>
//               Proceed to Checkout
//             </Button>

//             <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 p-2 rounded flex items-start">
//               <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
//               <p className="text-xs text-yellow-800 dark:text-yellow-200">
//                 Application will not be processed until payment is received.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right: Documents */}
//         <div
//           ref={draftRef}
//           className="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
//         >
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="font-medium">Required Documents</h3>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500 dark:text-gray-400">
//                 Completion: <b>{completion}%</b>
//               </span>
//               <div className="w-40">
//                 <Progress value={completion} className="h-2" />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {docs.map((doc) => (
//               <div
//                 key={doc.key}
//                 className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`w-10 h-10 rounded-md flex items-center justify-center
//                     ${
//                       doc.status === "completed"
//                         ? "bg-green-100 dark:bg-green-900/20 text-green-600"
//                         : "bg-red-100 dark:bg-red-900/20 text-red-500"
//                     }`}
//                   >
//                     {doc.status === "completed" ? (
//                       <CheckCircle2 className="h-5 w-5" />
//                     ) : (
//                       <X className="h-5 w-5" />
//                     )}
//                   </div>
//                   <div>
//                     <p className="font-medium">{doc.name}</p>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       {doc.required ? "Required" : "Optional"}
//                     </p>
//                   </div>
//                 </div>

//                 {doc.status === "completed" ? (
//                   <Badge className="bg-green-600">Completed</Badge>
//                 ) : (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="gap-1"
//                     onClick={() => handleOpenFilePicker(doc.key)}
//                     disabled={uploading}
//                   >
//                     <Upload className="h-3 w-3" />
//                     Upload
//                   </Button>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* input مخفی آپلود */}
//           <input
//             ref={fileInputRef}
//             type="file"
//             accept=".pdf,.png,.jpg,.jpeg,.zip"
//             className="hidden"
//             onChange={handleFileSelected}
//           />

//           {/* Review toggle و دکمه‌ی ذخیره */}
//           <div
//             ref={reviewRef}
//             className="mt-6 flex items-center justify-between"
//           >
//             <div className="text-sm text-gray-500 dark:text-gray-400">
//               <label className="inline-flex items-center gap-2 cursor-pointer select-none">
//                 <input
//                   type="checkbox"
//                   className="cursor-pointer"
//                   checked={reviewEnabled}
//                   onChange={(e) => setReviewEnabled(e.target.checked)}
//                 />
//                 Enable Document Review (+$50)
//               </label>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button variant="outline" onClick={() => navigate(-1)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleStartOrUpdate} disabled={busy}>
//                 {busy ? "Saving..." : "Start / Update Submission"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer note */}
//       <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
//         <div className="flex items-start">
//           <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
//           <div>
//             <h4 className="font-medium text-blue-800 dark:text-blue-300">
//               QuestApply Submission Service
//             </h4>
//             <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
//               Our experts will review your documents and handle submission to
//               increase your chances of acceptance.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PSU;
/////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////////////
// src/pages/PSU.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { useToast } from "../../hooks/use-toast";
import {
  getSubmissionFees,
  getSubmissionDocs,
  startOrUpdateSubmission,
  getProgramDetails,
  uploadSubmissionFile,
} from "../../api/submission";

const REVIEW_FEE = 50;

// حداقل تایپ لازم از دیتای برنامه
type ProgramDetailLite = {
  id: number; // rel_id
  name: string;
  school: string;
  schoolLogo: string;
  degree: string;
  contact: { website: string };
};

type RoadStatus = "completed" | "current" | "pending" | "skipped";

// نرمال‌سازی وضعیت داک‌ها (done → completed)
const normalizeDocs = (docs: any[] = []) =>
  docs.map((d) => ({
    ...d,
    status: d.status === "done" ? "completed" : d.status,
  }));

function computeRoadmapStatuses({
  docs,
  reviewEnabled,
  submissionStatus,
  paid,
}: {
  docs: Array<{
    required: boolean;
    status: "missing" | "pending" | "completed";
  }>;
  reviewEnabled: boolean;
  submissionStatus:
    | "draft"
    | "review"
    | "submission"
    | "decision"
    | "post"
    | "enroll";
  paid: boolean;
}) {
  const req = docs.filter((d) => d.required);
  const allReqDone =
    req.length > 0 && req.every((d) => d.status === "completed");

  const order = [
    "draft",
    "review",
    "submission",
    "decision",
    "post",
    "enroll",
  ] as const;
  const currentIdx = Math.max(0, order.indexOf(submissionStatus));

  const steps = [
    { key: "draft", label: "Prepare Application" },
    { key: "review", label: "Review Documents" },
    { key: "submission", label: "Submission" },
    { key: "decision", label: "Decision" },
    { key: "post", label: "Post-Decision Requirement" },
    { key: "enroll", label: "Enrollment Confirmation" },
  ].map((s, i) => {
    let status: RoadStatus = "pending";

    if (submissionStatus === "draft") {
      if (s.key === "draft") status = allReqDone ? "completed" : "current";
      else if (s.key === "review")
        status = reviewEnabled
          ? allReqDone
            ? "current"
            : "pending"
          : "skipped";
      else if (s.key === "submission")
        status = allReqDone && paid ? "current" : "pending";
      else status = "pending";
    } else {
      if (i < currentIdx) status = "completed";
      else if (i === currentIdx) status = "current";
      else status = "pending";
      if (!reviewEnabled && s.key === "review") {
        status = i < currentIdx ? "completed" : "skipped";
      }
    }

    return { ...s, status };
  });

  return steps;
}

function PSU() {
  const { relId } = useParams<{ relId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = useMemo(() => localStorage.getItem("token") || "", []);

  const [loading, setLoading] = useState(true);

  const [fees, setFees] = useState<{
    application: number | null;
    submission: number | null;
    total: number | null;
    review?: number | null;
    currency: string;
    symbol: string;
    paid?: boolean;
    reviewEnabled?: boolean;
  } | null>(null);

  const [docs, setDocs] = useState<any[]>([]);
  const [program, setProgram] = useState<ProgramDetailLite | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState<
    "draft" | "review" | "submission" | "decision" | "post" | "enroll"
  >("draft");
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [reviewEnabled, setReviewEnabled] = useState(false);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null);

  // برای اسکرول به سکشن‌ها
  const draftRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const submissionRef = useRef<HTMLDivElement | null>(null);
  const decisionRef = useRef<HTMLDivElement | null>(null);
  const postRef = useRef<HTMLDivElement | null>(null);
  const enrollRef = useRef<HTMLDivElement | null>(null);

  const handleOpenFilePicker = (docKey: string) => {
    setSelectedDocKey(docKey);
    fileInputRef.current?.click();
  };

  const handleFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !selectedDocKey || !relId) return;

    try {
      setUploading(true);
      const resp = await uploadSubmissionFile(
        relId,
        token,
        selectedDocKey,
        file
      );
      setDocs(normalizeDocs(resp.docs || resp.documents || []));
      if (resp.status) setSubmissionStatus(resp.status);

      // اگر بک‌اند فیلدهای زیر رو بده، sync کن
      if (resp.fees) {
        setHasPaid(Boolean(resp.fees.paid ?? hasPaid));
        setFees((old) => ({
          application: resp.fees.application ?? old?.application ?? null,
          submission: resp.fees.submission ?? old?.submission ?? null,
          total: resp.fees.total ?? old?.total ?? null,
          review: resp.fees.review ?? old?.review ?? REVIEW_FEE,
          currency: resp.fees.currency ?? old?.currency ?? "USD",
          symbol: resp.fees.symbol ?? old?.symbol ?? "$",
          paid: resp.fees.paid ?? old?.paid ?? false,
          reviewEnabled:
            resp.fees.reviewEnabled ?? old?.reviewEnabled ?? reviewEnabled,
        }));
        if (typeof resp.fees.reviewEnabled === "boolean") {
          setReviewEnabled(resp.fees.reviewEnabled);
        }
      }

      toast({
        title: "Uploaded",
        description: "Document uploaded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedDocKey(null);
    }
  };

  // total: اولویت با fees.total؛ وگرنه fallback با وضعیت محلی
  const totalWithReview = useMemo(() => {
    if (!fees) return 0;
    if (typeof fees.total === "number") return fees.total;
    const app = fees.application ?? 0;
    const sub = fees.submission ?? 0;
    const rev = reviewEnabled ? fees.review ?? REVIEW_FEE : 0;
    return app + sub + rev;
  }, [fees, reviewEnabled]);

  const requiredDocsDone = useMemo(() => {
    const req = docs.filter((d) => d.required);
    return req.length > 0 && req.every((d) => d.status === "completed");
  }, [docs]);

  useEffect(() => {
    if (!token) {
      navigate("/auth?mode=login");
      return;
    }
    if (!relId) return;

    (async () => {
      try {
        setLoading(true);

        const [feesRes, docsRes, progRes] = await Promise.all([
          getSubmissionFees(relId, token),
          getSubmissionDocs(relId, token),
          getProgramDetails(relId, token),
        ]);

        // fees
        const mergedFees = feesRes || docsRes?.fees || null;
        if (mergedFees) {
          setFees({
            application: mergedFees.application ?? null,
            submission: mergedFees.submission ?? null,
            total: mergedFees.total ?? null,
            review: mergedFees.review ?? REVIEW_FEE,
            currency: mergedFees.currency || "USD",
            symbol: mergedFees.symbol || "$",
            paid: mergedFees.paid ?? false,
            reviewEnabled: mergedFees.reviewEnabled ?? false,
          });
          setReviewEnabled(Boolean(mergedFees.reviewEnabled));
          setHasPaid(Boolean(mergedFees.paid));
        }

        // docs + status
        setDocs(normalizeDocs(docsRes.docs || docsRes.documents || []));
        setSubmissionStatus(docsRes.status ?? "draft");

        // program
        setProgram({
          id: progRes.id,
          name: progRes.name,
          school: progRes.school,
          schoolLogo: progRes.schoolLogo,
          degree: progRes.degree,
          contact: { website: progRes.contact?.website || "" },
        });
      } catch (e: any) {
        toast({
          title: "Error",
          description: e?.message || "Failed to load submission data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [relId, token, navigate, toast]);

  const completion = useMemo(() => {
    if (!docs.length) return 0;
    const done = docs.filter((d) => d.status === "completed").length;
    return Math.round((done / docs.length) * 100);
  }, [docs]);

  // محاسبه‌ی استپ‌ها
  const steps = useMemo(
    () =>
      computeRoadmapStatuses({
        docs,
        reviewEnabled,
        submissionStatus,
        paid: hasPaid,
      }),
    [docs, reviewEnabled, submissionStatus, hasPaid]
  );

  const scrollToSection = (key: string) => {
    const map: Record<string, React.RefObject<HTMLDivElement>> = {
      draft: draftRef,
      review: reviewRef,
      submission: submissionRef,
      decision: decisionRef,
      post: postRef,
      enroll: enrollRef,
    };
    const target = map[key]?.current;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function handleStartOrUpdate() {
    if (!relId) return;
    try {
      setBusy(true);
      const resp = await startOrUpdateSubmission(relId, token, reviewEnabled);

      setDocs(normalizeDocs(resp.docs || resp.documents || []));
      if (resp.status) setSubmissionStatus(resp.status);

      // sync fees بعد از ذخیره
      if (resp.fees) {
        setFees((old) => ({
          application: resp.fees.application ?? old?.application ?? null,
          submission: resp.fees.submission ?? old?.submission ?? null,
          total: resp.fees.total ?? old?.total ?? null,
          review: resp.fees.review ?? old?.review ?? REVIEW_FEE,
          currency: resp.fees.currency ?? old?.currency ?? "USD",
          symbol: resp.fees.symbol ?? old?.symbol ?? "$",
          paid: resp.fees.paid ?? old?.paid ?? false,
          reviewEnabled:
            resp.fees.reviewEnabled ?? old?.reviewEnabled ?? reviewEnabled,
        }));
        if (typeof resp.fees.reviewEnabled === "boolean") {
          setReviewEnabled(resp.fees.reviewEnabled);
        }
        if (typeof resp.fees.paid === "boolean") {
          setHasPaid(resp.fees.paid);
        }
      }

      toast({ title: "Saved", description: "Submission updated." });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to start/update submission",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  function goCheckout() {
    navigate(`/checkout?intent=psu_submission&relId=${relId}`);
  }

  async function handleToggleReview(enabled: boolean) {
    if (!relId) return;
    if (hasPaid) {
      toast({
        title: "Locked",
        description: "Review option is locked after payment.",
      });
      return;
    }
    const prev = reviewEnabled;
    setReviewEnabled(enabled);
    try {
      const resp = await startOrUpdateSubmission(relId, token, enabled);

      // sync fees از پاسخ
      if (resp.fees) {
        setFees((old) => ({
          application: resp.fees.application ?? old?.application ?? null,
          submission: resp.fees.submission ?? old?.submission ?? null,
          total: resp.fees.total ?? old?.total ?? null,
          review: resp.fees.review ?? old?.review ?? REVIEW_FEE,
          currency: resp.fees.currency ?? old?.currency ?? "USD",
          symbol: resp.fees.symbol ?? old?.symbol ?? "$",
          paid: resp.fees.paid ?? old?.paid ?? hasPaid,
          reviewEnabled:
            resp.fees.reviewEnabled ?? old?.reviewEnabled ?? enabled,
        }));
      }
      if (resp.docs || resp.documents) {
        setDocs(normalizeDocs(resp.docs || resp.documents));
      }
      if (typeof resp.fees?.reviewEnabled === "boolean") {
        setReviewEnabled(resp.fees.reviewEnabled);
      }

      // تضمین sync کامل: یک بار fees را مستقیم هم بخوان
      try {
        const refetched = await getSubmissionFees(relId, token);
        if (refetched) {
          setFees((old) => ({
            application: refetched.application ?? old?.application ?? null,
            submission: refetched.submission ?? old?.submission ?? null,
            total: refetched.total ?? old?.total ?? null,
            review: refetched.review ?? old?.review ?? REVIEW_FEE,
            currency: refetched.currency ?? old?.currency ?? "USD",
            symbol: refetched.symbol ?? old?.symbol ?? "$",
            paid: refetched.paid ?? old?.paid ?? hasPaid,
            reviewEnabled:
              refetched.reviewEnabled ?? old?.reviewEnabled ?? enabled,
          }));
          if (typeof refetched.reviewEnabled === "boolean") {
            setReviewEnabled(refetched.reviewEnabled);
          }
          if (typeof refetched.paid === "boolean") {
            setHasPaid(refetched.paid);
          }
        }
      } catch {
        /* ignore */
      }

      toast({ title: "Saved", description: "Review option updated." });
    } catch (e: any) {
      setReviewEnabled(prev);
      toast({
        title: "Error",
        description: e?.message || "Failed to update review option",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="lg:col-span-2 h-64 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header + back + breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Submit with Us
          </h1>
        </div>
        <div className="text-xs text-muted-foreground hidden md:block">
          <div className="flex items-center gap-2">
            <Link to="/my-account" className="hover:underline">
              Home
            </Link>
            <span>/</span>
            <Link to="/apply-now" className="hover:underline">
              Applications
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">
              {program?.name || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Steps (Roadmap) */}
      <div className="relative flex justify-between bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
        {steps.map((step, i) => (
          <div key={step.key} className="flex flex-col items-center relative">
            <button
              type="button"
              onClick={() => scrollToSection(step.key)}
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center z-10 border",
                step.status === "completed"
                  ? "bg-green-500 text-white border-green-500"
                  : step.status === "current"
                  ? "bg-blue-500 text-white border-blue-500"
                  : step.status === "skipped"
                  ? "bg-gray-300 text-gray-500 border-gray-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600",
              ].join(" ")}
              title={step.label}
            >
              {step.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span>{i + 1}</span>
              )}
            </button>
            <span className="text-xs mt-2 text-center w-32 truncate">
              {step.label}
            </span>

            {i < steps.length - 1 && (
              <div
                className={[
                  "absolute top-4 left-1/2 w-full h-[2px]",
                  steps[i].status === "completed" &&
                  (steps[i + 1].status === "completed" ||
                    steps[i + 1].status === "current")
                    ? "bg-green-500"
                    : "bg-gray-200 dark:bg-gray-700",
                ].join(" ")}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Program card + Fees */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-start gap-3">
              {program?.schoolLogo ? (
                <img
                  src={program.schoolLogo}
                  alt={program.school}
                  className="w-12 h-12 object-contain bg-gray-100 dark:bg-gray-800 rounded"
                />
              ) : null}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {program?.school}
                </p>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100 leading-5">
                  {program?.name}
                </h2>
                <div className="mt-1">
                  <Badge className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {program?.degree || "Program"}
                  </Badge>
                </div>
                <Link
                  to={`/program/${program?.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View program details
                </Link>
              </div>
            </div>
          </div>

          <div
            ref={submissionRef}
            className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          >
            <h3 className="font-medium mb-3">Application & Submission Fees</h3>

            {!!fees && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Application Fee</span>
                  <span>
                    {fees.symbol}
                    {fees.application ?? 0} {fees.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Submission Fee</span>
                  <span>
                    {fees.symbol}
                    {fees.submission ?? 0} {fees.currency}
                  </span>
                </div>

                {/* Review Documents toggle (بالا) */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 select-none">
                    Review Documents
                  </label>
                  <div className="flex items-center gap-2">
                    {hasPaid && (
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <Lock className="h-3 w-3 mr-1" /> Locked after payment
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={reviewEnabled ? "secondary" : "outline"}
                      onClick={() => handleToggleReview(!reviewEnabled)}
                      disabled={busy || hasPaid}
                    >
                      {reviewEnabled ? "Remove" : "Add"}
                    </Button>
                  </div>
                </div>

                {/* باکس نمایش مبلغ Review هنگام فعال بودن */}
                {reviewEnabled && (
                  <div className="mt-2 text-sm rounded border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900/30">
                    Document Review Fee:{" "}
                    <strong>
                      {fees.symbol}
                      {fees.review ?? REVIEW_FEE}
                    </strong>
                  </div>
                )}

                <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>
                    {fees?.symbol}
                    {totalWithReview} {fees?.currency}
                  </span>
                </div>
              </div>
            )}

            <Button className="w-full mt-4" onClick={goCheckout}>
              Proceed to Checkout
            </Button>

            <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 p-2 rounded flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Application will not be processed until payment is received.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Documents */}
        <div
          ref={draftRef}
          className="lg:col-span-2 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Required Documents</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Completion: <b>{completion}%</b>
              </span>
              <div className="w-40">
                <Progress value={completion} className="h-2" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {docs.map((doc) => (
              <div
                key={doc.key}
                className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center
                    ${
                      doc.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                        : "bg-red-100 dark:bg-red-900/20 text-red-500"
                    }`}
                  >
                    {doc.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <X className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.required ? "Required" : "Optional"}
                    </p>
                  </div>
                </div>

                {doc.status === "completed" ? (
                  <Badge className="bg-green-600">Completed</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleOpenFilePicker(doc.key)}
                    disabled={uploading}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* input مخفی آپلود */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.zip"
            className="hidden"
            onChange={handleFileSelected}
          />

          {/* Review toggle و دکمه‌ی ذخیره */}
          <div
            ref={reviewRef}
            className="mt-6 flex items-center justify-between"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={reviewEnabled}
                  onChange={(e) => handleToggleReview(e.target.checked)}
                  disabled={busy || hasPaid}
                />
                Enable Document Review (+$50)
                {hasPaid && (
                  <span className="inline-flex items-center text-xs text-gray-500 ml-2">
                    <Lock className="h-3 w-3 mr-1" /> Locked after payment
                  </span>
                )}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button onClick={handleStartOrUpdate} disabled={busy}>
                {busy ? "Saving..." : "Start / Update Submission"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholders for remaining steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decision */}
        <div
          ref={decisionRef}
          className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Decision</h3>
            <Badge variant="outline" className="text-xs">
              Pending
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            As soon as the university decision arrives, it will appear here.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" disabled>
              Mark Accepted
            </Button>
            <Button size="sm" variant="outline" disabled>
              Mark Rejected
            </Button>
            <Button size="sm" variant="outline" disabled>
              Upload Decision Letter
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
        </div>

        {/* Post-Decision Requirement */}
        <div
          ref={postRef}
          className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Post-Decision Requirement</h3>
            <Badge variant="outline" className="text-xs">
              Coming soon
            </Badge>
          </div>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Deposit</li>
            <li>• Financial Documents</li>
            <li>• Visa / I-20</li>
            <li>• Housing</li>
            <li>• Immunization</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            These items will be activated after acceptance.
          </p>
        </div>

        {/* Enrollment Confirmation */}
        <div
          ref={enrollRef}
          className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Enrollment Confirmation</h3>
            <Badge variant="outline" className="text-xs">
              Coming soon
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            After completing post-decision steps, upload your proof of
            enrollment.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled>
              Upload Proof of Enrollment
            </Button>
            <Button size="sm" variant="outline" disabled>
              Mark as Enrolled
            </Button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300">
              QuestApply Submission Service
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Our experts will review your documents and handle submission to
              increase your chances of acceptance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PSU;
