// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Button } from "../ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
// import {
//   saveResume,
//   previewResumeUrl,
//   SaveResumePayload,
//   exportResume,
// } from "@/api/resumeApi";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "../ui/dialog";
// import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
// import { Label as UiLabel } from "../ui/label";
// import { useToast } from "../ui/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Textarea } from "../ui/textarea";
// import { Input } from "../ui/input";
// import { Badge } from "../ui/badge";
// import { motion } from "framer-motion";
// import {
//   BookOpen,
//   FileText,
//   Image,
//   Wand,
//   University,
//   Trophy,
//   FileSearch,
//   Bot,
//   Send,
//   Download,
//   RotateCcw,
//   Save,
// } from "lucide-react";

// import ResumeGuidance from "./ResumeGuidance";
// import ResumeTemplates from "./ResumeTemplates";

// import AiImprovement from "./AiImprovement";

// import AtsAnalysis from "./AtsAnalysis";

// const resumeTabs = [
//   { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
//   {
//     id: "template",
//     name: "Choose Template",
//     icon: <Image className="w-4 h-4" />,
//   },
//   { id: "create", name: "Create Resume", icon: <Bot className="w-4 h-4" /> },

//   {
//     id: "aiImprovement",
//     name: "AI Improvement",
//     icon: <Wand className="w-4 h-4" />,
//   },

//   {
//     id: "atsAnalysis",
//     name: "ATS Analysis",
//     icon: <FileSearch className="w-4 h-4" />,
//   },
// ];

// // Initial seed sections with placeholder content
// const initialSections = {
//   personal: {
//     title: "Personal Informations",
//     content:
//       "John Doe\nComputer Science PhD Candidate\nPhone: +1 (555) 123-4567\nEmail: john.doe@university.edu\nLinkedIn: linkedin.com/in/johndoe",
//   },
//   summary: {
//     title: "Summary",
//     content:
//       "Passionate Computer Science PhD candidate with 5+ years of research experience in machine learning and artificial intelligence. Published 8 peer-reviewed papers and contributed to open-source ML frameworks.",
//   },
//   interests: {
//     title: "Research Interests",
//     content:
//       "• Machine Learning and Deep Neural Networks\n• Natural Language Processing\n• Computer Vision and Image Recognition\n• Distributed Systems and Cloud Computing",
//   },
//   education: {
//     title: "Education",
//     content:
//       "PhD in Computer Science (Expected 2025)\nStanford University, CA\nGPA: 3.85/4.0\n\nM.S. in Computer Science (2021)\nMIT, MA\nGPA: 3.9/4.0",
//   },
//   experience: {
//     title: "Professional History / Experience",
//     content:
//       "Research Assistant | Stanford AI Lab (2022-Present)\n• Led development of novel neural architecture achieving 15% performance improvement\n• Mentored 3 undergraduate researchers\n\nSoftware Engineering Intern | Google (Summer 2021)\n• Implemented machine learning pipeline processing 1M+ daily queries",
//   },
//   publications: {
//     title: "Publications",
//     content:
//       '1. Doe, J., et al. (2024). "Advanced Neural Networks for NLP." ICML 2024.\n2. Doe, J., Smith, A. (2023). "Efficient Training Methods." NeurIPS 2023.\n3. Doe, J. (2023). "Computer Vision Applications." CVPR 2023.',
//   },
//   skills: {
//     title: "Certifications and Skills",
//     content:
//       "Programming Languages: Python, C++, Java, JavaScript\nFrameworks: TensorFlow, PyTorch, React, Node.js\nTools: Git, Docker, Kubernetes, AWS\nCertifications: AWS Certified Developer (2023)",
//   },
//   awards: {
//     title: "Honors and Awards",
//     content:
//       "• Best Paper Award - ICML 2024\n• Stanford Graduate Fellowship (2022-2025)\n• Dean's List - MIT (2020, 2021)\n• Outstanding Graduate Student Award (2021)",
//   },
//   memberships: {
//     title: "Memberships",
//     content:
//       "• Association for Computing Machinery (ACM)\n• IEEE Computer Society\n• Stanford AI Research Group\n• Open Source Contributors Network",
//   },
//   hobbies: {
//     title: "Interest and Hobbies",
//     content:
//       "• Marathon running (completed 3 marathons)\n• Photography and digital art\n• Chess (rated 1800+ on Chess.com)\n• Volunteer coding instructor for underserved communities",
//   },
//   refs: {
//     title: "References",
//     content:
//       "Available upon request.\n\nDr. Sarah Johnson\nProfessor of Computer Science\nStanford University\nsarah.johnson@stanford.edu",
//   },
// };
// interface ResumeBuilderTabProps {
//   selectedTemplate: { id: number; name: string } | null;
// }
// // Resume Builder Component for Create Tab
// const ResumeBuilderTab = ({ selectedTemplate }: ResumeBuilderTabProps) => {
//   const [resumeId, setResumeId] = useState<string | null>(null);
//   const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
//     null
//   );

//   const [exportOpen, setExportOpen] = useState(false);
//   const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "doc">(
//     "txt"
//   );
//   const [resumeType, setResumeType] = useState("ATS / Industry");
//   const [sections, setSections] = useState(initialSections);
//   const [messages, setMessages] = useState([
//     {
//       type: "ai",
//       content:
//         "Welcome! I'm here to help you create an outstanding resume. What would you like to work on first?",
//     },
//   ]);
//   const [inputValue, setInputValue] = useState("");
//   const [snapshots, setSnapshots] = useState<any[]>([]);

//   const [searchParams] = useSearchParams();
//   const { toast } = useToast();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // 1) اولویت با props: اگر عدد معتبره، همونو ست کن
//     if (typeof selectedTemplate?.id === "number") {
//       if (selectedTemplateId !== selectedTemplate.id) {
//         setSelectedTemplateId(selectedTemplate.id);
//       }
//       return; // چون props معتبره، دیگه سراغ URL نرو
//     }

//     // 2) فالبک به URL: فقط وقتی props نداریم و state خالیه
//     const t = searchParams.get("templateId");
//     const n = t ? Number(t) : NaN;
//     if (
//       selectedTemplateId == null &&
//       !Number.isNaN(n) &&
//       selectedTemplateId !== n
//     ) {
//       setSelectedTemplateId(n);
//     }
//   }, [selectedTemplate?.id, searchParams, selectedTemplateId]);

//   // Calculate total word count
//   const totalWords = Object.values(sections).reduce((total, section) => {
//     return (
//       total +
//       section.content.split(/\s+/).filter((word) => word.length > 0).length
//     );
//   }, 0);

//   // Handle chat input
//   const handleSendMessage = () => {
//     if (!inputValue.trim()) return;

//     const userMessage = { type: "me", content: inputValue };
//     setMessages((prev) => [...prev, userMessage]);

//     // Simulate AI response
//     setTimeout(() => {
//       const aiResponse = {
//         type: "ai",
//         content: `I'll help you with "${inputValue}". Processing your request...`,
//       };
//       setMessages((prev) => [...prev, aiResponse]);
//     }, 1000);

//     setInputValue("");
//   };

//   // Handle quick actions
//   const handleQuickAction = (action: string, section?: string) => {
//     const responses = {
//       "Shorten Summary": "✅ shorten applied on **summary**.",
//       "Add metrics to Experience": "✅ metrics added to **experience**.",
//       "Tone: Formal": "✅ formal tone applied to document.",
//     };

//     const response = {
//       type: "ai",
//       content:
//         responses[action as keyof typeof responses] ||
//         `✅ ${action} completed.`,
//     };
//     setMessages((prev) => [...prev, response]);
//   };

//   // Handle section actions
//   const handleSectionAction = (sectionKey: string, action: string) => {
//     const response = {
//       type: "ai",
//       content: `✅ ${action.toLowerCase()} applied on **${sectionKey}**.`,
//     };
//     setMessages((prev) => [...prev, response]);
//   };

//   //Handle save section

//   async function handleSaveSection(sectionKey: string) {
//     try {
//       const oneSection: any = sections[sectionKey as keyof typeof sections];
//       const payload = {
//         templateId: selectedTemplateId ?? 0,
//         title: "My Resume",
//         sections: { [sectionKey]: oneSection },
//       } as SaveResumePayload;

//       const res = await saveResume(payload, resumeId ?? null);
//       const savedId =
//         (res as any)?.id || (res as any)?.new_resume_id || resumeId || null;
//       if (savedId && !resumeId) setResumeId(savedId);

//       toast({ title: "Saved", description: `Section "${sectionKey}" saved.` });
//     } catch (e: any) {
//       toast({
//         title: "Save section failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   }

//   // Save snapshot
//   const handleSaveSnapshot = () => {
//     const snapshot = {
//       id: `RES-${String(snapshots.length + 1).padStart(3, "0")}`,
//       timestamp: new Date().toLocaleString(),
//       sections: { ...sections },
//     };
//     setSnapshots((prev) => [...prev, snapshot]);

//     const response = {
//       type: "ai",
//       content: `📸 Snapshot saved as **${snapshot.id}** at ${snapshot.timestamp}.`,
//     };
//     setMessages((prev) => [...prev, response]);
//   };

//   // Reset to initial data
//   const handleReset = () => {
//     setSections(initialSections);
//     setMessages([
//       {
//         type: "ai",
//         content: "Resume reset to initial template. Ready to start fresh!",
//       },
//     ]);
//   };

//   // Export as text

//   // Update section content
//   const updateSectionContent = (sectionKey: string, content: string) => {
//     setSections((prev) => ({
//       ...prev,
//       [sectionKey]: {
//         ...prev[sectionKey as keyof typeof prev],
//         content,
//       },
//     }));
//   };

//   // resume download
//   function buildPayload(): SaveResumePayload {
//     return {
//       templateId: selectedTemplateId ?? null,
//       title: "My Resume",
//       sections,
//     };
//   }

//   async function handleSaveAndCreate() {
//     try {
//       const res = await saveResume(buildPayload(), resumeId ?? null);

//       const savedId =
//         (res as any)?.id || (res as any)?.new_resume_id || resumeId || null;

//       if (savedId) setResumeId(savedId);

//       toast({
//         title: "Saved",
//         description: "Resume saved to My Documents → Resumes.",
//       });
//     } catch (e: any) {
//       toast({
//         title: "Save failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   }

//   function downloadTxt() {
//     const content = Object.entries(sections)
//       .map(([_, s]: any) => `${s.title.toUpperCase()}\n${s.content}\n`)
//       .join("\n");
//     const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "resume.txt";
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   function downloadDoc() {
//     const html = `
//     <html>
//       <head><meta charset="utf-8"></head>
//       <body>${Object.entries(sections)
//         .map(
//           ([_, s]: any) => `
//         <h2>${s.title}</h2><pre style="font-family:inherit;white-space:pre-wrap">${s.content}</pre>
//       `
//         )
//         .join("")}</body>
//     </html>`;
//     const blob = new Blob([html], { type: "application/msword" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "resume.doc";
//     a.click();
//     URL.revokeObjectURL(url);
//   }

//   function downloadPdf() {
//     const wrapper = document.createElement("div");
//     wrapper.style.padding = "24px";
//     wrapper.style.fontFamily = "ui-sans-serif,system-ui";
//     wrapper.style.color = "#111"; // مطمئن: متن مشکی روی پس‌زمینه سفید

//     const html = Object.entries(sections)
//       .map(([_, s]: any) => {
//         // اگر از سرور برگشته و string شده، parse کن
//         let title = s?.title ?? "";
//         let content = s?.content ?? "";
//         if (!title && typeof s === "string") {
//           try {
//             const p = JSON.parse(s);
//             title = p?.title ?? "";
//             content = p?.content ?? s;
//           } catch {
//             content = s;
//           }
//         }
//         return `
//       <h2 style="margin:0 0 8px 0">${title}</h2>
//       <div style="white-space:pre-wrap;margin:0 0 16px 0">${content}</div>
//     `;
//       })
//       .join("");

//     wrapper.innerHTML = html || "<div>No content</div>";

//     const h2p = (window as any).html2pdf;
//     if (!h2p) {
//       toast({
//         title: "Missing html2pdf",
//         description: "Add the CDN <script> into index.html.",
//         variant: "destructive",
//       });
//       return;
//     }

//     h2p()
//       .from(wrapper)
//       .set({
//         margin: 0.5,
//         filename: "resume.pdf",
//         image: { type: "jpeg", quality: 0.98 },
//         html2canvas: { scale: 2, useCORS: true },
//         jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
//       })
//       .save();
//   }

//   async function ensureSavedThenExport() {
//     // 1) اگر هنوز save نشده، اول ذخیره کن
//     let id = resumeId;
//     if (!id) {
//       try {
//         const res = await saveResume(buildPayload());
//         id = (res as any).new_resume_id ?? (res as any).id; // یکی از این دو
//         setResumeId(id);
//       } catch (e: any) {
//         toast({
//           title: "Save failed",
//           description: e?.message ?? "Unexpected error",
//           variant: "destructive",
//         });
//         return;
//       }
//     }

//     // 2) مپ فرمت UI به فرمت API
//     const apiFormat = exportFormat === "doc" ? "docx" : exportFormat; // doc -> docx

//     // 3) صدا زدن API سرور برای ساخت فایل
//     try {
//       const blob = await exportResume({
//         resumeId: id!,
//         templateId: selectedTemplateId, // همونی که از تب Template انتخاب شد
//         // sections, // اگر لازم داری متن فعلی رو از فرانت بفرستی باز کن
//         format: apiFormat as "pdf" | "docx" | "txt",
//       });

//       // 4) دانلود فایل
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `resume.${apiFormat}`; // pdf / docx / txt
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch (e: any) {
//       toast({
//         title: "Export failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   }
//   function openPreview() {
//     if (!resumeId) {
//       /* toast ... */ return;
//     }
//     const t = selectedTemplateId ?? undefined;
//     navigate(
//       `/dashboard/resume/preview/${resumeId}${t ? `?templateId=${t}` : ""}`
//     );
//   }

//   return (
//     <div
//       className="dir-ltr min-h-screen"
//       style={{
//         backgroundColor: "#0b1020",
//         color: "#e5e7eb",
//       }}
//     >
//       {/* Sticky Header */}
//       <div
//         className="sticky top-0 z-50 px-6 py-4 border-b"
//         style={{
//           backgroundColor: "#111827",
//           borderColor: "#25324a",
//         }}
//       >
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Badge
//               variant="outline"
//               className="px-3 py-1"
//               style={{
//                 backgroundColor: "#0b213a",
//                 borderColor: "#25324a",
//                 color: "#e5e7eb",
//               }}
//             >
//               QuestApply • AI Demo
//             </Badge>
//             <h1 className="text-xl font-semibold">Create Resume</h1>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-full mx-auto p-6">
//         {/* ارتفاع و overflow فقط در دسکتاپ قفل می‌شود */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:h-[calc(100vh-120px)] md:overflow-hidden">
//           {/* LEFT - Chat Panel */}
//           <div className="lg:col-span-1">
//             <div
//               className="flex flex-col h-full min-h-0 overflow-hidden rounded-xl border"
//               style={{
//                 backgroundColor: "#111827",
//                 borderColor: "#25324a",
//               }}
//             >
//               {/* Chat Header */}
//               <div
//                 className="p-4 border-b flex items-center justify-between gap-2 shrink-0"
//                 style={{ borderColor: "#25324a" }}
//               >
//                 <Select value={resumeType} onValueChange={setResumeType}>
//                   <SelectTrigger
//                     className="w-40 h-8 text-xs"
//                     style={{
//                       backgroundColor: "#0e1526",
//                       borderColor: "#25324a",
//                     }}
//                   >
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ATS / Industry">
//                       ATS / Industry
//                     </SelectItem>
//                     <SelectItem value="Research / Academic">
//                       Research / Academic
//                     </SelectItem>
//                     <SelectItem value="Concise">Concise</SelectItem>
//                   </SelectContent>
//                 </Select>

//                 <Badge
//                   variant="outline"
//                   className="text-xs"
//                   style={{
//                     backgroundColor: "#0b213a",
//                     borderColor: "#25324a",
//                     color: "#22c55e",
//                   }}
//                 >
//                   Draft v1 • Ready
//                 </Badge>

//                 <Button
//                   size="sm"
//                   onClick={handleSaveSnapshot}
//                   className="text-xs"
//                   style={{
//                     backgroundColor: "#7c3aed",
//                     color: "white",
//                   }}
//                 >
//                   Save Snapshot
//                 </Button>
//               </div>

//               {/* Messages — اسکرول داخلی فقط در دسکتاپ */}
//               <div className="flex-1 min-h-[220px] md:min-h-0 md:overflow-y-auto p-4 space-y-3">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={`flex ${
//                       message.type === "me" ? "justify-end" : "justify-start"
//                     }`}
//                   >
//                     <div
//                       className={`max-w-[80%] p-3 rounded-lg text-sm ${
//                         message.type === "me"
//                           ? "bg-opacity-20 border"
//                           : "border"
//                       }`}
//                       style={{
//                         backgroundColor:
//                           message.type === "me" ? "#7c3aed20" : "#0e1526",
//                         borderColor: "#25324a",
//                       }}
//                     >
//                       {message.content}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Quick Actions */}
//               <div
//                 className="p-4 border-t space-y-3 shrink-0"
//                 style={{ borderColor: "#25324a" }}
//               >
//                 <div className="flex flex-wrap gap-2">
//                   {[
//                     "Shorten Summary",
//                     "Add metrics to Experience",
//                     "Tone: Formal",
//                   ].map((action) => (
//                     <Button
//                       key={action}
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleQuickAction(action)}
//                       className="text-xs"
//                       style={{
//                         backgroundColor: "#0e1526",
//                         borderColor: "#25324a",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       {action}
//                     </Button>
//                   ))}
//                 </div>

//                 {/* Input */}
//                 <div className="flex gap-2">
//                   <Input
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     placeholder="Type anything… e.g., Improve Education with GPA 3.7"
//                     className="flex-1 text-sm"
//                     style={{
//                       backgroundColor: "#0e1526",
//                       borderColor: "#25324a",
//                     }}
//                     onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                   />
//                   <Button
//                     size="sm"
//                     onClick={handleSendMessage}
//                     style={{
//                       backgroundColor: "#7c3aed",
//                       color: "white",
//                     }}
//                   >
//                     <Send className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT - Document Panel */}
//           <div
//             className="lg:col-span-2 rounded-xl border flex flex-col h-full min-h-0 overflow-hidden"
//             style={{ backgroundColor: "#111827", borderColor: "#25324a" }}
//           >
//             {/* هدر پنل راست: در موبایل دو ردیفه می‌شود؛ دسکتاپ مثل قبل */}
//             <div
//               className="p-4 border-b shrink-0"
//               style={{ borderColor: "#25324a" }}
//             >
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <Badge
//                     variant="outline"
//                     style={{
//                       backgroundColor: "#0b213a",
//                       borderColor: "#25324a",
//                       color: "#e5e7eb",
//                     }}
//                   >
//                     Target: Computer Science (PhD)
//                   </Badge>
//                   <Badge
//                     variant="outline"
//                     style={{
//                       backgroundColor: "#0b213a",
//                       borderColor: "#25324a",
//                       color: "#e5e7eb",
//                     }}
//                   >
//                     Country: USA
//                   </Badge>
//                   <Badge
//                     variant="outline"
//                     style={{
//                       backgroundColor: "#0b213a",
//                       borderColor: "#25324a",
//                       color: "#e5e7eb",
//                     }}
//                   >
//                     Words ~ {totalWords}
//                   </Badge>
//                 </div>

//                 <div className="flex flex-wrap gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleReset}
//                     className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
//                     style={{
//                       backgroundColor: "#0e1526",
//                       borderColor: "#25324a",
//                       color: "#9ca3af",
//                     }}
//                   >
//                     <RotateCcw className="w-4 h-4 mr-1" />
//                     Reset
//                   </Button>

//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={openPreview}
//                     className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
//                     style={{
//                       backgroundColor: "#0e1526",
//                       borderColor: "#25324a",
//                       color: "#9ca3af",
//                     }}
//                   >
//                     Preview
//                   </Button>

//                   <Button
//                     size="sm"
//                     onClick={() => setExportOpen(true)}
//                     className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
//                     style={{ backgroundColor: "#7c3aed", color: "white" }}
//                   >
//                     <Download className="w-4 h-4 mr-1" />
//                     Export
//                   </Button>

//                   <Button
//                     size="sm"
//                     onClick={handleSaveAndCreate}
//                     className="h-8 px-2.5 text-xs md:h-9 md:px-4 md:text-sm"
//                     style={{ backgroundColor: "#22c55e", color: "white" }}
//                   >
//                     <Save className="w-4 h-4 mr-1" />
//                     Save & Create
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             {/* اسکرول داخلی فقط روی دسکتاپ */}
//             <div className="flex-1 md:min-h-0 md:overflow-y-auto p-4 space-y-4">
//               {Object.entries(sections).map(([sectionKey, section]) => {
//                 const wordCount = section.content
//                   .split(/\s+/)
//                   .filter(Boolean).length;

//                 return (
//                   <div
//                     key={sectionKey}
//                     className="p-4 rounded-xl border"
//                     style={{
//                       backgroundColor: "#111827",
//                       borderColor: "#25324a",
//                     }}
//                   >
//                     {/* Section Header – در موبایل می‌شکند */}
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
//                       <div className="flex items-center gap-3 flex-wrap">
//                         <h3 className="font-medium">{section.title}</h3>
//                         <span className="text-xs" style={{ color: "#9ca3af" }}>
//                           Essential section for academic resumes
//                         </span>
//                         <Badge
//                           variant="outline"
//                           className="text-xs"
//                           style={{
//                             backgroundColor: "#0b213a",
//                             borderColor: "#25324a",
//                             color: "#9ca3af",
//                           }}
//                         >
//                           {sectionKey}
//                         </Badge>
//                       </div>

//                       <div className="flex flex-wrap gap-1">
//                         {["Improve", "Shorten", "Expand"].map((action) => (
//                           <Button
//                             key={action}
//                             size="sm"
//                             variant="outline"
//                             onClick={() =>
//                               handleSectionAction(sectionKey, action)
//                             }
//                             className="h-8 px-2.5 text-[12px] md:h-9 md:px-3 md:text-sm"
//                             style={{
//                               backgroundColor: "#0e1526",
//                               borderColor: "#25324a",
//                               color: "#9ca3af",
//                             }}
//                           >
//                             {action}
//                           </Button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Section Content */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
//                       {/* Left - Textarea */}
//                       <div>
//                         <Textarea
//                           value={section.content}
//                           onChange={(e) =>
//                             updateSectionContent(sectionKey, e.target.value)
//                           }
//                           className="min-h-28 md:min-h-32 text-[13px] md:text-sm"
//                           style={{
//                             backgroundColor: "#0e1526",
//                             borderColor: "#25324a",
//                           }}
//                         />
//                       </div>

//                       {/* Right - Preview */}
//                       <div>
//                         <div className="mb-2">
//                           <span
//                             className="text-[12px] md:text-sm font-medium"
//                             style={{ color: "#9ca3af" }}
//                           >
//                             Preview
//                           </span>
//                         </div>
//                         <div
//                           className="min-h-32 p-3 rounded border-2 border-dashed text-[13px] md:text-sm whitespace-pre-wrap"
//                           style={{
//                             borderColor: "#25324a",
//                             backgroundColor: "#0b1020",
//                             color: "#e5e7eb",
//                           }}
//                         >
//                           {section.content}
//                         </div>
//                         <div className="flex items-center justify-between mt-2">
//                           <Button
//                             size="sm"
//                             className="h-8 px-3 text-[12px] md:h-9 md:px-4 md:text-sm"
//                             style={{
//                               backgroundColor: "#22c55e",
//                               color: "white",
//                             }}
//                             onClick={() => handleSaveSection(sectionKey)}
//                           >
//                             <Save className="w-3 h-3 mr-1" />
//                             Save
//                           </Button>
//                           <span
//                             className="text-[12px] md:text-xs"
//                             style={{ color: "#9ca3af" }}
//                           >
//                             Word ~ {wordCount}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>

//         {/* start Modal */}
//         <Dialog open={exportOpen} onOpenChange={setExportOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Export Resume</DialogTitle>
//             </DialogHeader>

//             <RadioGroup
//               value={exportFormat}
//               onValueChange={(v: any) => setExportFormat(v)}
//             >
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="txt" id="exp-txt" />
//                 <UiLabel htmlFor="exp-txt">Text (.txt)</UiLabel>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="pdf" id="exp-pdf" />
//                 <UiLabel htmlFor="exp-pdf">PDF (.pdf)</UiLabel>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="doc" id="exp-doc" />
//                 <UiLabel htmlFor="exp-doc">Word (.doc)</UiLabel>
//               </div>
//             </RadioGroup>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => setExportOpen(false)}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={async () => {
//                   await ensureSavedThenExport();
//                   setExportOpen(false);
//                 }}
//               >
//                 Download
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//         {/* end modal */}
//       </div>
//     </div>
//   );
// };

// const CreateResume = () => {
//   // const [searchParams] = useSearchParams();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const initialTab = searchParams.get("tab") || "guidance";
//   const [activeTab, setActiveTab] = useState(initialTab);
//   const [selectedTemplate, setSelectedTemplate] = useState<{
//     id: number;
//     name: string;
//   } | null>(null);

//   // Update active tab based on URL params
//   useEffect(() => {
//     const tabFromParams = searchParams.get("tab");
//     if (tabFromParams && resumeTabs.some((tab) => tab.id === tabFromParams)) {
//       setActiveTab(tabFromParams);
//     }
//   }, [searchParams]);

//   return (
//     <div className="animate-fade-in">
//       <Tabs
//         defaultValue={activeTab}
//         value={activeTab}
//         onValueChange={(val) => {
//           setActiveTab(val);
//           // URL را هم آپدیت کن تا ?tab=... همیشه هماهنگ بماند
//           setSearchParams(
//             (prev) => {
//               const p = new URLSearchParams(prev);
//               p.set("tab", val);
//               return p;
//             },
//             { replace: true }
//           );
//         }}
//         className="w-full"
//       >
//         <div className="relative border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
//           <TabsList className="w-full h-auto px-2 py-1 bg-transparent flex justify-around">
//             {resumeTabs.map((tab) => (
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
//                     layoutId="activeTab"
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
//           <TabsContent value="guidance" className="m-0">
//             <ResumeGuidance />
//           </TabsContent>

//           <TabsContent value="template" className="m-0">
//             <ResumeTemplates
//               onTemplateSelect={(id, name) => setSelectedTemplate({ id, name })}
//             />
//           </TabsContent>

//           <TabsContent value="create" className="m-0">
//             <ResumeBuilderTab selectedTemplate={selectedTemplate} />
//           </TabsContent>

//           <TabsContent value="aiImprovement" className="m-0">
//             <AiImprovement />
//           </TabsContent>

//           <TabsContent value="atsAnalysis" className="m-0">
//             <AtsAnalysis />
//           </TabsContent>
//         </motion.div>
//       </Tabs>
//     </div>
//   );
// };

// export default CreateResume;
////////////////////////////
// src/components/CreateResume.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { BookOpen, Image, FileSearch, Bot } from "lucide-react";

import ResumeGuidance from "./ResumeGuidance";
import ResumeTemplates from "./ResumeTemplates";
import AiImprovement from "./AiImprovement";
import AtsAnalysis from "./AtsAnalysis";

// ⬇️ جدید: بچه‌ها
import ChatPanel from "./ChatPanel";
import ResumeEditor from "./ResumeEditor";

const resumeTabs = [
  { id: "guidance", name: "Guidance", icon: <BookOpen className="w-4 h-4" /> },
  {
    id: "template",
    name: "Choose Template",
    icon: <Image className="w-4 h-4" />,
  },
  { id: "create", name: "Create Resume", icon: <Bot className="w-4 h-4" /> },
  {
    id: "aiImprovement",
    name: "AI Improvement",
    icon: <FileSearch className="w-4 h-4" />,
  },
  {
    id: "atsAnalysis",
    name: "ATS Analysis",
    icon: <FileSearch className="w-4 h-4" />,
  },
];

// Initial seed sections with placeholder content (برای placeholder و استارت)
const initialSections = {
  summary: {
    title: "Summary",
    content:
      "Passionate Computer Science PhD candidate with 5+ years of research experience in machine learning and artificial intelligence. Published 8 peer-reviewed papers and contributed to open-source ML frameworks.",
  },
  personal: {
    title: "Personal Informations",
    content:
      "John Doe\nComputer Science PhD Candidate\nPhone: +1 (555) 123-4567\nEmail: john.doe@university.edu\nLinkedIn: linkedin.com/in/johndoe",
  },
  interests: {
    title: "Research Interests",
    content:
      "• Machine Learning and Deep Neural Networks\n• Natural Language Processing\n• Computer Vision and Image Recognition\n• Distributed Systems and Cloud Computing",
  },
  education: {
    title: "Education",
    content:
      "PhD in Computer Science (Expected 2025)\nStanford University, CA\nGPA: 3.85/4.0\n\nM.S. in Computer Science (2021)\nMIT, MA\nGPA: 3.9/4.0",
  },
  experience: {
    title: "Professional History / Experience",
    content:
      "Research Assistant | Stanford AI Lab (2022-Present)\n• Led development of novel neural architecture achieving 15% performance improvement\n• Mentored 3 undergraduate researchers\n\nSoftware Engineering Intern | Google (Summer 2021)\n• Implemented machine learning pipeline processing 1M+ daily queries",
  },
  publications: {
    title: "Publications",
    content:
      '1. Doe, J., et al. (2024). "Advanced Neural Networks for NLP." ICML 2024.\n2. Doe, J., Smith, A. (2023). "Efficient Training Methods." NeurIPS 2023.\n3. Doe, J. (2023). "Computer Vision Applications." CVPR 2023.',
  },
  skills: {
    title: "Certifications and Skills",
    content:
      "Programming Languages: Python, C++, Java, JavaScript\nFrameworks: TensorFlow, PyTorch, React, Node.js\nTools: Git, Docker, Kubernetes, AWS\nCertifications: AWS Certified Developer (2023)",
  },
  awards: {
    title: "Honors and Awards",
    content:
      "• Best Paper Award - ICML 2024\n• Stanford Graduate Fellowship (2022-2025)\n• Dean's List - MIT (2020, 2021)\n• Outstanding Graduate Student Award (2021)",
  },
  memberships: {
    title: "Memberships",
    content:
      "• Association for Computing Machinery (ACM)\n• IEEE Computer Society\n• Stanford AI Research Group\n• Open Source Contributors Network",
  },
  hobbies: {
    title: "Interest and Hobbies",
    content:
      "• Marathon running (completed 3 marathons)\n• Photography and digital art\n• Chess (rated 1800+ on Chess.com)\n• Volunteer coding instructor for underserved communities",
  },
  refs: {
    title: "References",
    content:
      "Available upon request.\n\nDr. Sarah Johnson\nProfessor of Computer Science\nStanford University\nsarah.johnson@stanford.edu",
  },
};

interface ResumeBuilderTabProps {
  selectedTemplate: { id: number; name: string } | null;
}

// ⬇️ تب Create، الان فقط Parent دو بچه است
const ResumeBuilderTab = ({ selectedTemplate }: ResumeBuilderTabProps) => {
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );

  // دیتای سکشن‌ها در والد نگه داشته می‌شود و به ResumeEditor پاس می‌خورد
  const [sections, setSections] = useState(initialSections);

  const [searchParams] = useSearchParams();

  // سنک انتخاب تمپلیت بین props و URL (?templateId=)
  useEffect(() => {
    if (typeof selectedTemplate?.id === "number") {
      if (selectedTemplateId !== selectedTemplate.id)
        setSelectedTemplateId(selectedTemplate.id);
      return;
    }
    const t = searchParams.get("templateId");
    const n = t ? Number(t) : NaN;
    if (
      selectedTemplateId == null &&
      !Number.isNaN(n) &&
      selectedTemplateId !== n
    ) {
      setSelectedTemplateId(n);
    }
  }, [selectedTemplate?.id, searchParams, selectedTemplateId]);

  return (
    <div className="dir-ltr min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sticky Header بالای صفحه (برجای می‌ماند) */}
      <div className="sticky top-0 z-50 px-6 py-4 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between ">
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-gray-100 text-gray-900 border-gray-300
             dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            >
              QuestApply • AI Demo
            </Badge>
            <h1 className="text-xl font-semibold">Create Resume</h1>
          </div>
        </div>
      </div>

      {/* Main Content: سه ستون (۱/۳ چت + ۲/۳ ادیتور) */}
      <div className="max-w-full mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:h-[calc(100vh-120px)] md:overflow-hidden ">
          {/* LEFT - Chat (1/3) */}
          <div className="lg:col-span-1">
            <ChatPanel />
          </div>

          {/* RIGHT - Editor (2/3) */}
          <div className="lg:col-span-2 h-full min-h-0">
            <ResumeEditor
              sections={sections}
              setSections={setSections}
              initialSections={initialSections}
              selectedTemplateId={selectedTemplateId}
              resumeId={resumeId}
              setResumeId={setResumeId}
              // اگر بعداً context از API لود کردی، این‌ها رو پاس بده:
              // targetBadge={target}
              // countryBadge={country}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateResume = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "guidance";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    const tabFromParams = searchParams.get("tab");
    if (tabFromParams && resumeTabs.some((tab) => tab.id === tabFromParams)) {
      setActiveTab(tabFromParams);
    }
  }, [searchParams]);

  return (
    <div className="animate-fade-in">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          setSearchParams(
            (prev) => {
              const p = new URLSearchParams(prev);
              p.set("tab", val);
              return p;
            },
            { replace: true }
          );
        }}
        className="w-full"
      >
        <div className="relative border-b border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
          <TabsList className="w-full h-auto px-2 py-1 bg-transparent flex justify-around">
            {resumeTabs.map((tab) => (
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
                    layoutId="activeTab"
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

        {/* Tab Contents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <TabsContent value="guidance" className="m-0">
            <ResumeGuidance />
          </TabsContent>

          <TabsContent value="template" className="m-0">
            <ResumeTemplates
              onTemplateSelect={(id, name) => setSelectedTemplate({ id, name })}
            />
          </TabsContent>

          <TabsContent value="create" className="m-0">
            <ResumeBuilderTab selectedTemplate={selectedTemplate} />
          </TabsContent>

          <TabsContent value="aiImprovement" className="m-0">
            <AiImprovement />
          </TabsContent>

          <TabsContent value="atsAnalysis" className="m-0">
            <AtsAnalysis />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default CreateResume;
