// import React, { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import {
//   Check,
//   X as XIcon,
//   Mail,
//   Phone,
//   Globe,
//   ExternalLink,
// } from "lucide-react";

// /** ---------------- Types (هم‌سو با خروجی API فعلی) ---------------- */
// type DeadlineChip = { season: string; date: string };
// type GreTotal = number | { avg: number } | undefined;

// type OtherRequirementKey =
//   | "applicationForm"
//   | "resumeCV"
//   | "statementOfPurpose"
//   | "recommendationLetters"
//   | "transcript";

// type ProgramDetail = {
//   id: number;
//   name: string;
//   degree: string;
//   school: string;
//   schoolLogo: string;
//   degreeType: string;
//   duration: string;
//   format: string;
//   language: string;
//   campus: string;
//   fit: string;
//   ranking: number; // number (QS)
//   qsRanking: string; // string (raw)
//   deadline: string | DeadlineChip[]; // API فعلی رشته است؛ آرایه هم پشتیبانی می‌کنیم
//   requirements: {
//     toefl: { min: number; avg: number };
//     ielts: { min: number; avg: number };
//     duolingo: { min: number; avg: number };
//     pte: { min: number; avg: number };
//     gre: {
//       status: string;
//       total: { avg: number };
//       verbal: { avg: number };
//       quantitative: { avg: number };
//       writing: { avg: number };
//     };
//     gpa: { min: number; avg: number };
//   };
//   costs: {
//     residents: {
//       tuition: number;
//       fees: number;
//       healthInsurance: number;
//       livingCost: number;
//     };
//     international: {
//       tuition: number;
//       fees: number;
//       healthInsurance: number;
//       livingCost: number;
//     };
//   };
//   applicationFees: {
//     international: number;
//     us: number;
//   };
//   otherRequirements: {
//     transcript: boolean;
//     resumeCV: boolean;
//     applicationForm: boolean;
//     statementOfPurpose: boolean;
//     recommendationLetters: number;
//   };
//   admissionRate: number;
//   contact: {
//     tel: string;
//     email: string;
//     website: string;
//     address: string;
//   };
//   similarPrograms?: Array<{ id: number; name: string; school: string }>;
//   description: string;
//   courseStructure: string;
//   facultyHighlights?: Array<{
//     name: string;
//     title: string;
//     photoUrl?: string;
//     research?: string;
//   }>;
//   careerOutcomes?: Array<{ title: string; percentage: number }>;
//   overview: string;
//   favorite: boolean;
//   country: string;
//   state: string;
// };

// /** ---------------- Utils ---------------- */
// const currency = (n: number) =>
//   Number.isFinite(n)
//     ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
//     : "—";

// const getGreTotal = (t: GreTotal): number => {
//   if (typeof t === "number") return t;
//   if (t && typeof t === "object" && "avg" in t) return t.avg;
//   return 0;
// };

// const OR_LABELS: Record<OtherRequirementKey, string> = {
//   applicationForm: "Application Form",
//   resumeCV: "Resume / CV",
//   statementOfPurpose: "Statement of Purpose",
//   recommendationLetters: "Recommendation Letters",
//   transcript: "Transcript",
// };

// const OR_ORDER: OtherRequirementKey[] = [
//   "applicationForm",
//   "resumeCV",
//   "statementOfPurpose",
//   "recommendationLetters",
//   "transcript",
// ];

// function parseDeadlineChips(
//   deadline: ProgramDetail["deadline"]
// ): DeadlineChip[] {
//   if (!deadline) return [];

//   if (Array.isArray(deadline)) {
//     return deadline.filter(Boolean);
//   }

//   if (typeof deadline === "string") {
//     return deadline
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean)
//       .map((part) => {
//         const [seasonRaw, dateRaw] = part.split(":").map((x) => x?.trim());
//         return seasonRaw && dateRaw
//           ? { season: seasonRaw, date: dateRaw }
//           : { season: part, date: "" };
//       });
//   }
//   return [];
// }

// /** ---------------- Component ---------------- */
// const ProgramDetails: React.FC = () => {
//   const { id, programId, relId } = useParams<{
//     id?: string;
//     programId?: string;
//     relId?: string;
//   }>();
//   const paramId = id ?? programId ?? relId ?? "";
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState<boolean>(true);
//   const [program, setProgram] = useState<ProgramDetail | null>(null);
//   const [error, setError] = useState<string>("");

//   const handleBack = () => {
//     navigate("/dashboard?section=find-programs", {
//       state: { activeSection: "find-programs" },
//       replace: true,
//     });
//   };

//   useEffect(() => {
//     const run = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/auth?mode=login");
//           return;
//         }
//         if (!paramId) {
//           setError("Invalid program id.");
//           setLoading(false);
//           return;
//         }
//         setLoading(true);
//         setError("");

//         const res = await fetch(
//           `http://localhost:5000/api/program-data/details/${paramId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!res.ok) {
//           const t = await res.text();
//           throw new Error(t || "Failed to load program details.");
//         }

//         const data: ProgramDetail = await res.json();
//         console.log("Detail Programs:", data);
//         setProgram(data);
//       } catch (e: any) {
//         setError(e?.message || "Failed to load program details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     run();
//   }, [id, navigate]);

//   const deadlineChips = useMemo(
//     () => parseDeadlineChips(program?.deadline || ""),
//     [program]
//   );

//   /** ---------------- Renders ---------------- */
//   if (loading) {
//     return (
//       <div className="p-6 space-y-4">
//         <div className="h-8 w-48 bg-gray-800/60 rounded" />
//         <div className="h-20 w-full bg-gray-800/40 rounded-xl" />
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="h-36 bg-gray-800/30 rounded-xl" />
//           <div className="h-36 bg-gray-800/30 rounded-xl" />
//           <div className="h-36 bg-gray-800/30 rounded-xl" />
//         </div>
//       </div>
//     );
//   }

//   if (error || !program) {
//     return (
//       <div className="p-6">
//         <div className="rounded-xl bg-gray-900/40 border border-gray-800 p-8 text-center">
//           <h2 className="text-gray-200 font-semibold mb-3">
//             Program not found
//           </h2>
//           <p className="text-gray-400 mb-6">
//             {error || "No details available."}
//           </p>
//           <button
//             className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
//             onClick={handleBack}
//           >
//             Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div className="flex gap-4">
//           {program.schoolLogo ? (
//             <img
//               src={program.schoolLogo}
//               alt={`${program.school} logo`}
//               className="w-16 h-16 object-contain bg-gray-900/50 rounded-md p-2 border border-gray-800"
//             />
//           ) : (
//             <div className="w-16 h-16 bg-gray-900/50 rounded-md border border-gray-800" />
//           )}
//           <div>
//             <div className="flex flex-wrap items-center gap-2">
//               <h1 className="text-2xl font-semibold text-white">
//                 {program.name}
//               </h1>
//               <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs">
//                 {program.degreeType || "Program"}
//               </span>
//               {!!program.qsRanking && (
//                 <span className="bg-yellow-900/30 text-yellow-300 px-3 py-1 rounded-full text-xs">
//                   QS #{program.qsRanking}
//                 </span>
//               )}
//             </div>
//             <div className="text-gray-400 mt-1">
//               {program.degree} • {program.school}
//             </div>
//             <div className="text-gray-500 text-sm mt-1">
//               {program.country}
//               {program.state ? `, ${program.state}` : ""}
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button
//             className="px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
// onClick={() =>
//   navigate("/dashboard?section=find-programs", {
//     state: { activeSection: "find-programs" },
//     replace: true,
//   })
// }
//           >
//             Back
//           </button>
//           {program.contact?.website ? (
//             <a
//               href={program.contact.website}
//               target="_blank"
//               rel="noreferrer"
//               className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
//             >
//               Program Website
//             </a>
//           ) : null}
//         </div>
//       </div>

//       {/* Top Info Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Features */}
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-4">
//           <h3 className="text-sm text-gray-300 mb-3">Program Features</h3>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-yellow-900/30 text-yellow-300 flex items-center justify-center">
//                 🏆
//               </div>
//               <div>
//                 <div className="text-xs text-gray-400">QS Ranking</div>
//                 <div className="text-white font-medium">
//                   {program.qsRanking || "—"}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-300 flex items-center justify-center">
//                 ⏱
//               </div>
//               <div>
//                 <div className="text-xs text-gray-400">Duration</div>
//                 <div className="text-white font-medium">
//                   {program.duration || "—"}
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-green-900/30 text-green-300 flex items-center justify-center">
//                 🎓
//               </div>
//               <div>
//                 <div className="text-xs text-gray-400">Degree</div>
//                 <div className="text-white font-medium">{program.degree}</div>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-full bg-indigo-900/30 text-indigo-300 flex items-center justify-center">
//                 🏫
//               </div>
//               <div>
//                 <div className="text-xs text-gray-400">School</div>
//                 <div className="text-white font-medium">{program.school}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Deadlines */}
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-4">
//           <h3 className="text-sm text-gray-300 mb-3">Application Deadline</h3>
//           {deadlineChips.length > 0 ? (
//             <div className="flex flex-wrap gap-2">
//               {deadlineChips.map((d, i) => (
//                 <div
//                   key={`${d.season}-${d.date}-${i}`}
//                   className="px-3 py-2 rounded-lg bg-purple-900/20 text-purple-200 text-sm"
//                 >
//                   {d.season}
//                   {d.date ? `, ${d.date}` : ""}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-gray-500 text-sm">No deadline</div>
//           )}
//         </div>

//         {/* Requirements (Min) */}
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-4">
//           <h3 className="text-sm text-gray-300 mb-3">Requirements (Min)</h3>
//           <div className="grid grid-col-1 md:grid-cols-2 gap-3 text-sm">
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3 text-center">
//               <div className="text-xs text-gray-400 mb-1">TOEFL</div>
//               <div className="text-white">
//                 {program.requirements?.toefl?.min ?? 0}
//               </div>
//             </div>
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3 text-center">
//               <div className="text-xs text-gray-400 mb-1">GPA</div>
//               <div className="text-white">
//                 {program.requirements?.gpa?.min ?? 0}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Overview & Costs */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-5 lg:col-span-2">
//           <h3 className="text-sm text-gray-300 mb-3 font-semibold">
//             Overview & Costs
//           </h3>
//           <div className="prose prose-invert max-w-none text-gray-200 text-sm whitespace-pre-line">
//             {/* cost */}

//             <div className="rounded-xl bg-[#111826] border border-gray-800 p-5">
//               <h3 className="text-sm text-gray-300 mb-3">
//                 Estimated Costs (per year)
//               </h3>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Tuition</span>
//                   <span className="text-gray-100 ">
//                     ${currency(program.costs?.international?.tuition ?? 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Fees</span>
//                   <span className="text-gray-100 ">
//                     ${currency(program.costs?.international?.fees ?? 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Living Cost</span>
//                   <span className="text-gray-100">
//                     ${currency(program.costs?.international?.livingCost ?? 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Health Insurance</span>
//                   <span className="text-gray-100">
//                     $
//                     {currency(
//                       program.costs?.international?.healthInsurance ?? 0
//                     )}
//                   </span>
//                 </div>
//                 <div className="h-px bg-gray-800 my-2" />
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">App Fee (Intl)</span>
//                   <span className="text-gray-100">
//                     ${currency(program.applicationFees?.international ?? 0)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">App Fee (US)</span>
//                   <span className="text-gray-100">
//                     ${currency(program.applicationFees?.us ?? 0)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* GRE (AVG)*/}

//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-4">
//           <h3 className="text-sm text-gray-300 mb-3">GRE (AVG)</h3>
//           <div className="grid grid-col-1 md:grid-cols-2 gap-3 text-sm">
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3">
//               <div className="text-xs text-gray-400 mb-1">Total</div>
//               <div className="text-white">
//                 {getGreTotal(program.requirements?.gre?.total)}
//               </div>
//             </div>
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3">
//               <div className="text-xs text-gray-400 mb-1">Verbal</div>
//               <div className="text-white">
//                 {getGreTotal(program.requirements?.gre?.verbal)}
//               </div>
//             </div>
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3">
//               <div className="text-xs text-gray-400 mb-1">Quantitative</div>
//               <div className="text-white">
//                 {getGreTotal(program.requirements?.gre?.quantitative)}
//               </div>
//             </div>
//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3">
//               <div className="text-xs text-gray-400 mb-1">Writing</div>
//               <div className="text-white">
//                 {getGreTotal(program.requirements?.gre?.writing)}
//               </div>
//             </div>

//             <div className="rounded-lg bg-gray-900/30 border border-gray-800 p-3">
//               <div className="text-xs text-gray-400 mb-1">GRE</div>
//               <div className="text-white text-xs leading-snug">
//                 {program.requirements?.gre?.status || "—"}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Course Structure & Side Info */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Other Requirements */}
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-5 lg:col-span-2">
//           <h3 className="text-sm text-gray-300 mb-3">Other Requirements</h3>

//           <div className="rounded-xl bg-[#111826] border border-gray-800 p-5">
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
//               {OR_ORDER.map((key) => {
//                 const val = program?.otherRequirements?.[key] as
//                   | boolean
//                   | number
//                   | undefined;

//                 const isBool = typeof val === "boolean";
//                 const isNum = typeof val === "number";

//                 return (
//                   <div
//                     key={key}
//                     className="rounded-lg border border-gray-800 bg-[#0e1726] p-3 text-center h-full flex flex-col"
//                   >
//                     <div className="text-xs text-gray-400 leading-5 min-h-[40px] flex items-center justify-center text-center">
//                       {OR_LABELS[key]}
//                     </div>

//                     <div className="mt-4 flex justify-center">
//                       <div className="w-12 h-12 rounded-full border border-blue-500 flex items-center justify-center">
//                         {isBool ? (
//                           val ? (
//                             <Check className="w-5 h-5 text-green-500" />
//                           ) : (
//                             <XIcon className="w-5 h-5 text-red-500" />
//                           )
//                         ) : isNum ? (
//                           <span className="text-green-500 font-semibold">
//                             {val}
//                           </span>
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//         {/* conected */}
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-5">
//           <h3 className="text-sm text-gray-300 mb-3">Contact</h3>

//           <div className="text-sm text-gray-200 space-y-2">
//             {/* Email */}
//             <div className="flex items-center gap-2 mb-3">
//               <Mail className="w-5 h-5 text-blue-400" />
//               <span className="text-gray-400">Email:</span>
//               {program.contact?.email ? (
//                 <a
//                   href={`mailto:${program.contact.email}`}
//                   className="hover:underline"
//                 >
//                   {program.contact.email}
//                 </a>
//               ) : (
//                 <span className="text-gray-400">—</span>
//               )}
//             </div>

//             {/* Tel */}
//             <div className="flex items-center gap-2 mb-3">
//               <Phone className="w-4 h-4 text-blue-400" />
//               <span className="text-gray-400">Tel:</span>
//               {program.contact?.tel ? (
//                 <a
//                   href={`tel:${program.contact.tel}`}
//                   className="hover:underline"
//                 >
//                   {program.contact.tel}
//                 </a>
//               ) : (
//                 <span className="text-gray-400">—</span>
//               )}
//             </div>

//             {/* Website */}
//             <div className="flex items-center gap-2">
//               <Globe className="w-7 h-7 text-blue-400" />
//               <span className="text-gray-400">Website:</span>
//               {program.contact?.website ? (
//                 <a
//                   href={
//                     /^https?:\/\//i.test(program.contact.website)
//                       ? program.contact.website
//                       : `https://${program.contact.website}`
//                   }
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-purple-300 hover:underline break-all inline-flex items-center gap-1"
//                 >
//                   {program.contact.website}
//                   <ExternalLink className="w-3 h-3 opacity-70" />
//                 </a>
//               ) : (
//                 <span className="text-gray-400">—</span>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="space-y-6">{/* Other Requirements -2 */}</div>
//       </div>

//       {/* Similar Programs */}
//       {program.similarPrograms && program.similarPrograms.length > 0 && (
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-5">
//           <h3 className="text-sm text-gray-300 mb-3">Similar Programs</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {program.similarPrograms.map((sp) => (
//               <div
//                 key={sp.id}
//                 className="rounded-lg border border-gray-800 p-3 bg-gray-900/30"
//               >
//                 <div className="text-gray-200 font-medium">{sp.name}</div>
//                 <div className="text-gray-400 text-sm">{sp.school}</div>
//                 <button
//                   className="mt-3 text-xs px-3 py-1 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800"
//                   onClick={() => navigate(`/program/${sp.id}`)}
//                 >
//                   View
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Faculty Highlights */}
//       {program.facultyHighlights && program.facultyHighlights.length > 0 && (
//         <div className="rounded-xl bg-[#111826] border border-gray-800 p-5">
//           <h3 className="text-sm text-gray-300 mb-3">Faculty Highlights</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {program.facultyHighlights.map((f, idx) => (
//               <div
//                 key={`${f.name}-${idx}`}
//                 className="rounded-lg border border-gray-800 p-3 bg-gray-900/30"
//               >
//                 <div className="flex items-center gap-3">
//                   {f.photoUrl ? (
//                     <img
//                       src={f.photoUrl}
//                       alt={f.name}
//                       className="w-12 h-12 rounded-full object-cover border border-gray-800"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 rounded-full bg-gray-800" />
//                   )}
//                   <div>
//                     <div className="text-gray-200 font-medium">{f.name}</div>
//                     <div className="text-gray-400 text-xs">{f.title}</div>
//                   </div>
//                 </div>
//                 {f.research ? (
//                   <div className="text-gray-400 text-xs mt-2">
//                     Research: {f.research}
//                   </div>
//                 ) : null}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProgramDetails;

/////////////////////////////////
////////////////////////////////////
/////////////////////////////////////////
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

// ⛔️ getProgramDetails حذف شد؛ UI هیچ تغییری نکرده
// import { getProgramDetails } from "@/data/programDetails";

// Components (بدون تغییر)
import ProgramHeader from "@/components/program-details/ProgramHeader";
import ProgramOverview from "@/components/program-details/ProgramOverview";
import RequirementsSection from "@/components/program-details/RequirementsSection";
import CostSection from "@/components/program-details/CostSection";
import CareerOutcomes from "@/components/program-details/CareerOutcomes";
import SimilarPrograms from "@/components/program-details/SimilarPrograms";
import ContactInfo from "@/components/program-details/ContactInfo";
import type { ProgramDetail } from "@/data/programDetails";

type MinOnly = { min: number };
type MinAvg = { min: number; avg?: number };
type AvgObj = { avg: number };
type GreScore = number | AvgObj;

type CostBreakdown = {
  tuition: number;
  fees: number;
  healthInsurance: number;
  livingCost: number;
};

export type DeadlineChip = { season: string; date: string };

// export interface ProgramDetail {
//   id: number;
//   name: string;
//   degree: string;
//   school: string;

//   // ⬇️ این‌ها با API اختیاری می‌شن
//   schoolLogo?: string;
//   degreeType?: string;
//   duration?: string;
//   format?: string;
//   language?: string;
//   campus?: string;
//   fit?: string;
//   ranking?: number;
//   qsRanking?: string;

//   deadline?: string | DeadlineChip[];

//   overview?: string;
//   description?: string;

//   // ⬇️ الزامات پذیرش؛ با API سازگار شده
//   requirements: {
//     toefl: MinAvg; // API: min(+avg)
//     ielts: MinOnly | MinAvg; // بعضی APIها فقط min می‌دهند
//     duolingo: MinOnly | MinAvg; // بعضی APIها فقط min می‌دهند

//     // ❗️API بعضی وقت‌ها pet می‌فرستد؛ ما هر دو را می‌پذیریم
//     pte?: MinOnly | MinAvg;
//     pet?: MinOnly | MinAvg;

//     gre: {
//       status: string;
//       total?: GreScore;
//       verbal?: GreScore;
//       quantitative?: GreScore;
//       writing?: GreScore;
//     };

//     gpa: { min: number; avg: number };
//   };

//   costs: {
//     residents: CostBreakdown;
//     international: CostBreakdown;
//   };

//   applicationFees: { international: number; us: number };

//   otherRequirements: {
//     transcript: boolean;
//     resumeCV: boolean;
//     applicationForm: boolean;
//     statementOfPurpose: boolean;
//     recommendationLetters: number;
//   };

//   admissionRate: number;

//   contact: { tel?: string; email?: string; website?: string; address?: string };

//   careerOutcomes?: Array<{ title: string; percentage: number }>;
//   similarPrograms?: Array<{ id: number; name: string; school: string }>;

//   favorite?: boolean;
//   country?: string;
//   state?: string;

//   // ⬇️ این‌ها هم با API اختیاری می‌شن
//   courseStructure?: string;
//   facultyHighlights?: Array<{
//     name: string;
//     title: string;
//     photoUrl?: string;
//     research?: string;
//   }>;
// }

/* ---------------- Page ---------------- */
const ProgramDetails: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  /* --------- Helper: fetch from API --------- */

  async function fetchProgramDetails(
    programId: number
  ): Promise<ProgramDetail> {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth?mode=login");
        return;
      }
      if (!programId) {
        throw new Error("Invalid program id.");
        setLoading(false);
        return;
      }
      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/program-data/details/${programId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as ProgramDetail;
      console.log("Detail Program:", data);
      return data;
    } catch (err) {
      console.error(err?.message || "Failed to load program details.");
    } finally {
      setLoading(false);
    }
  }

  // Load from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!programId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchProgramDetails(Number(programId));
        if (mounted) {
          setProgram(data);
          setIsFavorite(Boolean(data.favorite));
        }
      } catch (err) {
        console.error(err);
        if (mounted) setProgram(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [programId]);

  const toggleFavorite = () => setIsFavorite((v) => !v);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            to="/dashboard/find-programs"
            state={{ activeSection: "find-programs" }}
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to Programs</span>
          </Link>
        </motion.div>

        {program && (
          <>
            <ProgramHeader
              program={program}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
            <ProgramOverview program={program} />
            <RequirementsSection program={program} />
            <CostSection program={program} />
            <CareerOutcomes program={program} />
            <SimilarPrograms program={program} />
            <ContactInfo program={program} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramDetails;
