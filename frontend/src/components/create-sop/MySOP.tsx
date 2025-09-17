// import { useEffect, useMemo, useState } from "react";
// import { Button } from "../ui/button";
// import { Badge } from "../ui/badge";
// import { Textarea } from "../ui/textarea";
// import { Input } from "../ui/input";
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
// import { Download, RotateCcw, Save as SaveIcon, Send } from "lucide-react";

// // ==== API helpers
// import { getSopMeta, SopSections, generateSop, exportSop } from "@/api/sopApi";

// const SECTION_DEFAULTS: Record<keyof typeof SECTION_DEFS, string> = {
//   hook: "In a world increasingly driven by data and AI, my curiosity has always been how technology can truly augment human decisions. That curiosity pushed me toward ML and NLP.",
//   segue:
//     "This passion led me to pursue rigorous training in computer science, exploring both theory and real-world applications of intelligent systems.",
//   academic:
//     "• GPA 3.8; Dean’s List ×6\n• 2 peer-reviewed publications\n• Led a 5-member team; 94% NLP accuracy (↑12%)\n• Outstanding CS Student Award (Senior year)",
//   extracurricular:
//     "200+ hours teaching programming to underrepresented youth; President of AI Ethics Society; organized symposiums with 300+ attendees.",
//   publications:
//     'Doe, J. & Smith, A. (2023). "Advancing NLU via Contextual Embeddings" – ICML.\nSmith, A., Doe, J. (2023). "Ethics of LLM Deployment" – Journal of AI Ethics.',
//   problems:
//     "During an internship, our early bias-detection approach kept failing. Studying fairness metrics and collaborating with social scientists led to the breakthrough used in my thesis.",
//   whySchool:
//     "Stanford’s HAI and the Stanford NLP Group match my focus on interpretable ML. I’m especially keen to work with Prof. Chen on neural interpretability.",
//   goal: "Short-term: contribute to explainable-AI research and co-author papers.\nLong-term: lead a lab building transparent, fair AI adopted by industry.\nConclusion: this program is the right environment to realize these goals.",
// };

// // === ۸ سکشن دقیقاً طبق PHP

// /* ---------- sopFormat.ts ---------- */

// // ترتیب کلیدها (با as const تا union type بسازد)
// const SECTION_ORDER = [
//   "hook",
//   "segue",
//   "academic",
//   "extracurricular",
//   "publications",
//   "problems",
//   "whySchool",
//   "goal",
// ] as const;

// // ✅ نوع درستِ کلیدها
// type SectionKey = (typeof SECTION_ORDER)[number];

// // مدل هر سکشن
// type SopSection = {
//   title: string;
//   content: string;
// };

// // آبجکت سکشن‌ها (Partial تا نبودن برخی سکشن‌ها مشکلی نباشد)
// type SopSections = Partial<Record<SectionKey, SopSection>>;

// // اگر SECTION_DEFS داری (عنوان‌های پیش‌فرض UI):
// // حتماً کلیدهاش با SECTION_ORDER یکی باشد.
// const SECTION_DEFS: Record<SectionKey, { title: string }> = {
//   hook: { title: "Hook" },
//   segue: { title: "Segue (Journey / Motivation)" },
//   academic: { title: "Academic Achievements" },
//   extracurricular: { title: "Extracurricular Activities" },
//   publications: { title: "Publications" },
//   problems: { title: "Problems in Background" },
//   whySchool: { title: "Why This School?" },
//   goal: { title: "Your Goal / Conclusion" },
// };

// // تبدیل state/object به آرایه‌ی مرتب‌شده‌ی سکشن‌ها
// function toStructuredSections(sections: SopSections): SopSection[] {
//   return SECTION_ORDER.map((k) => ({
//     title: sections[k]?.title ?? SECTION_DEFS[k].title,
//     content: (sections[k]?.content ?? "").trim(),
//   }));
// }

// // امن‌کردن HTML
// function escapeHtml(s: string = "") {
//   return s
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }

// // متن ساده برای export txt
// function assemblePlainText(sections: SopSections): string {
//   return SECTION_ORDER.map((k) => {
//     const sec = sections[k];
//     const title = sec?.title ?? SECTION_DEFS[k].title;
//     const content = sec?.content ?? "";
//     return `${title}\n${content}`;
//   }).join("\n\n");
// }

// // پاراگراف‌ساز: دو اینتر = پاراگراف؛ تک اینتر = <br>
// function nl2p(text = "") {
//   return escapeHtml(text)
//     .split(/\n{2,}/)
//     .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
//     .join("");
// }

// // ساخت بلوک‌های HTML هر سکشن (برای preview/export html)
// function buildBlocks(structured: SopSection[]) {
//   return structured
//     .map(
//       (sec) => `
//     <section class="sop-sec">
//       <h2 class="sop-h2">${escapeHtml(sec.title || "Untitled")}</h2>
//       <div class="sop-body">${nl2p(sec.content || "")}</div>
//     </section>`
//     )
//     .join("\n");
// }

// /**
//  * ساخت HTML کامل (سازگار با لایت/دارک‌مد)
//  * ورودی می‌تواند آرایه‌ی سکشن‌ها یا آبجکت سکشن‌ها باشد.
//  */
// function assembleHtml(
//   input: SopSection[] | SopSections,
//   theme: "light" | "dark" = "light"
// ): string {
//   const structured = Array.isArray(input) ? input : toStructuredSections(input);

//   const blocks = buildBlocks(structured);
//   const isDark = theme === "dark";

//   const css = `
//     :root {
//       --ink:${isDark ? "#e5e7eb" : "#111827"};
//       --bg:${isDark ? "#0b1020" : "#ffffff"};
//       --muted:${isDark ? "#9ca3af" : "#6b7280"};
//       --line:${isDark ? "#374151" : "#e5e7eb"};
//       --h2-size:18px;
//       --body-size:15.6px;
//       --wrap:780px;
//     }
//     @media (prefers-color-scheme: dark) {
//       :root {
//         --ink:#e5e7eb; --bg:#0b1020; --muted:#9ca3af; --line:#374151;
//       }
//     }
//     body.dark, body[data-theme="dark"] {
//       --bg:#0b1020 !important; --ink:#e5e7eb !important;
//       --muted:#9ca3af !important; --line:#374151 !important;
//     }

//     html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);}
//     body{
//       font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
//                    "Noto Sans", "Vazirmatn", "IRANSans", Arial, "Apple Color Emoji",
//                    "Segoe UI Emoji", "Segoe UI Symbol";
//       line-height:1.75; margin:24px;
//       -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
//     }
//     .wrap{ max-width:var(--wrap); margin:0 auto; }

//     .sop-sec { padding:18px 0; }
//     .sop-sec + .sop-sec { border-top:1px solid var(--line); }
//     .sop-h2{ margin:0 0 10px; font-size:var(--h2-size); font-weight:800; letter-spacing:.2px; }
//     .sop-body{ font-size:var(--body-size); text-align:justify; }
//     .sop-body p { margin:0 0 10px; }
//     .sop-body p:last-child { margin-bottom:0; }

//     @media print {
//       :root{ --bg:#ffffff; --ink:#111827; --muted:#6b7280; --line:#e5e7eb; }
//       body { margin:0; }
//       .wrap { max-width: unset; margin: 0 24px; }
//       .sop-sec { page-break-inside: avoid; }
//     }
//   `;

//   return `<!doctype html>
//   <html lang="fa" dir="auto">
//     <head>
//       <meta charset="utf-8"/>
//       <meta name="viewport" content="width=device-width, initial-scale=1"/>
//       <title>SOP Preview</title>
//       <style>${css}</style>
//     </head>
//     <body>
//       <div class="wrap">${blocks}</div>
//     </body>
//   </html>`;
// }

// // برای پر کردن اولیه اگر بک‌اند هنوز خالی باشد
// const initialSections: SopSections = {
//   hook: { title: "Hook", content: "" },
//   segue: { title: "Segue (Journey / Motivation)", content: "" },
//   academic: { title: "Academic Achievements", content: "" },
//   extrac: { title: "Extracurricular Activities", content: "" },
//   publications: { title: "Publications", content: "" },
//   problem: { title: "Problems in Background", content: "" },
//   whyThisSchool: { title: "Why This School?", content: "" },
//   goalConclusion: { title: "Your Goal / Conclusion", content: "" },
// };

// const MySOP = () => {
//   const { toast } = useToast();

//   // وضعیت متن سکشن‌ها
//   const [sections, setSections] = useState<SopSections>(initialSections);

//   // پیش‌نمایش (از generate)
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewHtml, setPreviewHtml] = useState<string>("");

//   // اکسپورت
//   const [exportOpen, setExportOpen] = useState(false);
//   const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "docx">(
//     "txt"
//   );

//   // پیام‌های پنل چت
//   const [messages, setMessages] = useState<
//     { type: "ai" | "me"; content: string }[]
//   >([
//     {
//       type: "ai",
//       content:
//         "Welcome! I can help you refine each section, adjust tone, and prepare a strong SOP.",
//     },
//   ]);
//   const [chatInput, setChatInput] = useState("");

//   // مجموع کلمات
//   const totalWords = useMemo(
//     () =>
//       Object.values(sections).reduce((sum, s) => {
//         const n = (s.content || "").trim().split(/\s+/).filter(Boolean).length;
//         return sum + n;
//       }, 0),
//     [sections]
//   );

//   // --- Load existing meta from server (GET /sop/meta)
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getSopMeta();
//         if (res?.sections) {
//           // ادغام با initial تا titleها محفوظ بمانند
//           const merged: SopSections = { ...initialSections };
//           for (const key of Object.keys(
//             SECTION_DEFS
//           ) as (keyof typeof SECTION_DEFS)[]) {
//             const srv = (res.sections as any)?.[key];
//             merged[key] = {
//               title: SECTION_DEFS[key].title,
//               content: srv?.content?.trim()
//                 ? srv.content
//                 : SECTION_DEFAULTS[key],
//             };
//           }
//           setSections(merged);
//         }
//       } catch {
//         // اگر چیزی نبود اشکال ندارد؛ با initial می‌مانیم
//       }
//     })();
//   }, []);

//   // تغییر متن سکشن
//   const updateSection = (key: string, content: string) => {
//     setSections((prev) => ({
//       ...prev,
//       [key]: { ...prev[key], content },
//     }));
//   };

//   // اکشن‌های محلی بدون AI
//   const localTransform = (
//     key: string,
//     action: "improve" | "shorten" | "expand"
//   ) => {
//     const current = sections[key]?.content || "";
//     let next = current;

//     if (action === "shorten") {
//       const w = current.split(/\s+/);
//       const target = Math.max(18, Math.floor(w.length * 0.7));
//       next = w.slice(0, target).join(" ") + (w.length > target ? "…" : "");
//     } else if (action === "expand") {
//       next =
//         current +
//         (current ? " " : "") +
//         "This experience further strengthened my readiness for graduate study.";
//     } else {
//       // improve: کمی پاک‌سازی ساده
//       next = current.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
//     }

//     updateSection(key, next);
//     setMessages((m) => [
//       ...m,
//       { type: "ai", content: `✅ ${action} applied on **${key}**.` },
//     ]);
//   };

//   // Save فقط یک سکشن (POST /sop/meta)
//   const saveOneSection = async (key: string) => {
//     try {
//       const payload = {
//         format: exportFormat,
//         title: "My SOP",
//         sections: toStructuredSections(sections),
//       };
//       const blob = await exportSop(payload);
//       toast({
//         title: "Saved",
//         description: `Section "${SECTION_DEFS[key].title}" saved.`,
//       });
//     } catch (e: any) {
//       toast({
//         title: "Save failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   };

//   // Reset به حالت اولیه (یا لود تازه)
//   const handleReset = () => {
//     setSections(initialSections);
//     setMessages([{ type: "ai", content: "Draft reset to initial skeleton." }]);
//   };

//   // Preview (POST /sop/generate با previewOnly)
//   const handlePreview = async () => {
//     try {
//       const res = await generateSop({ preview: true, sections });
//       const html = assembleHtml(sections);
//       setPreviewHtml(html);
//       setPreviewOpen(true);
//     } catch (e: any) {
//       toast({
//         title: "Preview failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   };

//   // Save & Create (ذخیره همه سکشن‌ها و سپس generate نهایی)
//   const handleSaveAndCreate = async () => {
//     try {
//       await generateSop({ preview: false }); // ساخت فایل‌ها + درج در اسناد کاربر
//       toast({
//         title: "Done",
//         description: "SOP saved and created. Check My Documents.",
//       });
//     } catch (e: any) {
//       toast({
//         title: "Operation failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   };

//   // Export (modal)
//   const handleExport = async () => {
//     try {
//       const plain = assemblePlainText(sections); // همه ۸ بخش، به ترتیب ثابت
//       const blob = await exportSop({
//         format: exportFormat, // "pdf" | "docx" | "txt"
//         content: plain,
//         title: "My SOP",
//       });

//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `sop.${exportFormat === "docx" ? "docx" : exportFormat}`;
//       a.click();
//       URL.revokeObjectURL(url);
//       setExportOpen(false);
//     } catch (e: any) {
//       toast({
//         title: "Export failed",
//         description: e?.message ?? "Unexpected error",
//         variant: "destructive",
//       });
//     }
//   };

//   // پیام چت محلی
//   const sendChat = () => {
//     if (!chatInput.trim()) return;
//     setMessages((m) => [...m, { type: "me", content: chatInput }]);
//     setTimeout(() => {
//       setMessages((m) => [
//         ...m,
//         { type: "ai", content: "Noted. (AI actions are disabled for now)" },
//       ]);
//     }, 500);
//     setChatInput("");
//   };

//   return (
//     <div
//       className="min-h-screen"
//       style={{ background: "#0b1020", color: "#e5e7eb" }}
//     >
//       {/* Sticky Header */}
//       <div
//         className="sticky top-0 z-50 px-6 py-4 border-b"
//         style={{ background: "#111827", borderColor: "#25324a" }}
//       >
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <Badge
//               variant="outline"
//               className="px-3 py-1"
//               style={{ background: "#0b213a", borderColor: "#25324a" }}
//             >
//               QuestApply • AI Demo
//             </Badge>
//             <h1 className="text-xl font-semibold">Create SOP</h1>
//           </div>
//         </div>
//       </div>

//       {/* Main */}
//       <div className="max-w-7xl mx-auto p-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-170px)] overflow-hidden">
//           {/* LEFT chat */}
//           <div className="lg:col-span-1">
//             <div
//               className="flex flex-col h-full min-h-0 overflow-hidden rounded-xl border"
//               style={{ background: "#111827", borderColor: "#25324a" }}
//             >
//               {/* header */}
//               <div
//                 className="p-4 border-b flex items-center justify-between gap-2"
//                 style={{ borderColor: "#25324a" }}
//               >
//                 <Badge
//                   variant="outline"
//                   className="text-xs"
//                   style={{
//                     background: "#0b213a",
//                     borderColor: "#25324a",
//                     color: "#22c55e",
//                   }}
//                 >
//                   Draft v1 • Skeleton
//                 </Badge>
//                 <Button
//                   size="sm"
//                   className="text-xs"
//                   style={{ background: "#7c3aed", color: "white" }}
//                   onClick={() =>
//                     setMessages((m) => [
//                       ...m,
//                       {
//                         type: "ai",
//                         content: `📸 Snapshot saved at ${new Date().toLocaleString()}`,
//                       },
//                     ])
//                   }
//                 >
//                   Save Snapshot
//                 </Button>
//               </div>

//               {/* messages */}
//               <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
//                 {messages.map((msg, i) => (
//                   <div
//                     key={i}
//                     className={`flex ${
//                       msg.type === "me" ? "justify-end" : "justify-start"
//                     }`}
//                   >
//                     <div
//                       className="max-w-[80%] p-3 rounded-lg text-sm border"
//                       style={{
//                         background: msg.type === "me" ? "#7c3aed20" : "#0e1526",
//                         borderColor: "#25324a",
//                       }}
//                     >
//                       {msg.content}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* input */}
//               <div className="p-4 border-t" style={{ borderColor: "#25324a" }}>
//                 <div className="flex gap-2">
//                   <Input
//                     value={chatInput}
//                     onChange={(e) => setChatInput(e.target.value)}
//                     placeholder="Type anything… e.g., Shorten publications"
//                     className="text-sm"
//                     style={{ background: "#0e1526", borderColor: "#25324a" }}
//                     onKeyDown={(e) => e.key === "Enter" && sendChat()}
//                   />
//                   <Button
//                     size="sm"
//                     onClick={sendChat}
//                     style={{ background: "#7c3aed", color: "white" }}
//                   >
//                     <Send className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT document */}
//           <div
//             className="lg:col-span-2 rounded-xl border flex flex-col h-full min-h-0 overflow-hidden"
//             style={{ background: "#111827", borderColor: "#25324a" }}
//           >
//             {/* toolbar */}
//             <div
//               className="p-4 border-b flex items-center justify-between"
//               style={{ borderColor: "#25324a" }}
//             >
//               <div className="flex items-center gap-2 flex-wrap">
//                 <Badge
//                   variant="outline"
//                   style={{ background: "#0b213a", borderColor: "#25324a" }}
//                 >
//                   Target: CS Ph.D. • Stanford
//                 </Badge>
//                 <Badge
//                   variant="outline"
//                   style={{ background: "#0b213a", borderColor: "#25324a" }}
//                 >
//                   Words ~ {totalWords}
//                 </Badge>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={handleReset}
//                   style={{
//                     background: "#0e1526",
//                     borderColor: "#25324a",
//                     color: "#9ca3af",
//                   }}
//                 >
//                   <RotateCcw className="w-4 h-4 mr-1" /> Reset
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={handlePreview}
//                   style={{
//                     background: "#0e1526",
//                     borderColor: "#25324a",
//                     color: "#9ca3af",
//                   }}
//                 >
//                   Preview
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={() => setExportOpen(true)}
//                   style={{ background: "#7c3aed", color: "white" }}
//                 >
//                   <Download className="w-4 h-4 mr-1" /> Export
//                 </Button>
//                 <Button
//                   size="sm"
//                   onClick={handleSaveAndCreate}
//                   style={{ background: "#22c55e", color: "white" }}
//                 >
//                   <SaveIcon className="w-4 h-4 mr-1" /> Save & Create
//                 </Button>
//               </div>
//             </div>

//             {/* sections list */}
//             <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
//               {Object.entries(SECTION_DEFS).map(([key, def]) => {
//                 const val = sections[key]?.content || "";
//                 const words = val.trim().split(/\s+/).filter(Boolean).length;
//                 return (
//                   <div
//                     key={key}
//                     className="p-4 rounded-xl border"
//                     style={{ background: "#111827", borderColor: "#25324a" }}
//                   >
//                     {/* header */}
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-3">
//                         <h3 className="font-medium">{def.title}</h3>
//                         {def.hint && (
//                           <span
//                             className="text-xs"
//                             style={{ color: "#9ca3af" }}
//                           >
//                             {def.hint}
//                           </span>
//                         )}
//                         <Badge
//                           variant="outline"
//                           className="text-xs"
//                           style={{
//                             background: "#0b213a",
//                             borderColor: "#25324a",
//                             color: "#9ca3af",
//                           }}
//                         >
//                           {key}
//                         </Badge>
//                       </div>
//                       <div className="flex gap-1">
//                         {(["improve", "shorten", "expand"] as const).map(
//                           (a) => (
//                             <Button
//                               key={a}
//                               size="sm"
//                               variant="outline"
//                               onClick={() => localTransform(key, a)}
//                               className="text-xs px-2 py-1"
//                               style={{
//                                 background: "#0e1526",
//                                 borderColor: "#25324a",
//                                 color: "#9ca3af",
//                               }}
//                             >
//                               {a[0].toUpperCase() + a.slice(1)}
//                             </Button>
//                           )
//                         )}
//                       </div>
//                     </div>
//                     {/* body */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <Textarea
//                           value={val}
//                           onChange={(e) => updateSection(key, e.target.value)}
//                           className="min-h-32 text-sm"
//                           style={{
//                             background: "#0e1526",
//                             borderColor: "#25324a",
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <div className="mb-2">
//                           <span
//                             className="text-sm font-medium"
//                             style={{ color: "#9ca3af" }}
//                           >
//                             Preview
//                           </span>
//                         </div>
//                         <div
//                           className="min-h-32 p-3 rounded border-2 border-dashed text-sm whitespace-pre-wrap"
//                           style={{
//                             borderColor: "#25324a",
//                             background: "#0b1020",
//                             color: "#e5e7eb",
//                           }}
//                         >
//                           {val}
//                         </div>
//                         <div className="flex items-center justify-between mt-2">
//                           <Button
//                             size="sm"
//                             className="text-xs"
//                             style={{ background: "#22c55e", color: "white" }}
//                             onClick={() => saveOneSection(key)}
//                           >
//                             <SaveIcon className="w-3 h-3 mr-1" /> Save
//                           </Button>
//                           <span
//                             className="text-xs"
//                             style={{ color: "#9ca3af" }}
//                           >
//                             Word ~ {words}
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

//         {/* Export modal */}
//         <Dialog open={exportOpen} onOpenChange={setExportOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Export SOP</DialogTitle>
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
//                 <RadioGroupItem value="docx" id="exp-docx" />
//                 <UiLabel htmlFor="exp-docx">Word (.docx)</UiLabel>
//               </div>
//             </RadioGroup>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setExportOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleExport}>Download</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Preview modal */}
//         <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
//           <DialogContent className="max-w-3xl">
//             <DialogHeader>
//               <DialogTitle>Preview (assembled)</DialogTitle>
//             </DialogHeader>

//             <div className="max-h-[70vh]">
//               <iframe
//                 title="SOP Preview"
//                 className="w-full h-[60vh] rounded-md border"
//                 // اگر assembleHtml بدنه کامل HTML را برمی‌گرداند:
//                 srcDoc={previewHtml}
//                 // تا اسکرول داخلی داشته باشد
//                 sandbox="allow-same-origin"
//                 style={{ background: "white" }} // زمینه روشن؛ در حالت دارک هم به‌خوبی خواناست
//               />
//             </div>

//             <DialogFooter>
//               <Button onClick={() => setPreviewOpen(false)}>Close</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// };

// export default MySOP;
//////////////////
// src/pages/MySOP.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label as UiLabel } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Download, RotateCcw, Save as SaveIcon, Send } from "lucide-react";

// ==== API
import {
  getSopMeta,
  saveSopMeta,
  exportSop,
  type SopKey,
  type SopSections as ApiSopSections,
} from "@/api/sopApi";

// ==== Helpers (extracted utils)
import {
  SECTION_ORDER,
  SECTION_DEFS,
  type SectionKey,
  type SopSection,
  type SopSections, // UI shape: Partial<Record<SectionKey, SopSection>>
  assembleHtml,
  assemblePlainText,
} from "@/components/shared/sopFormat";

/* ------------------- defaults for quick initial fill (UI keys) ------------------- */
const SECTION_DEFAULTS: Record<SectionKey, string> = {
  hook: "In a world increasingly driven by data and AI, my curiosity has always been how technology can truly augment human decisions. That curiosity pushed me toward ML and NLP.",
  segue:
    "This passion led me to pursue rigorous training in computer science, exploring both theory and real-world applications of intelligent systems.",
  academic:
    "• GPA 3.8; Dean’s List ×6\n• 2 peer-reviewed publications\n• Led a 5-member team; 94% NLP accuracy (↑12%)\n• Outstanding CS Student Award (Senior year)",
  extracurricular:
    "200+ hours teaching programming to underrepresented youth; President of AI Ethics Society; organized symposiums with 300+ attendees.",
  publications:
    'Doe, J. & Smith, A. (2023). "Advancing NLU via Contextual Embeddings" – ICML.\nSmith, A., Doe, J. (2023). "Ethics of LLM Deployment" – Journal of AI Ethics.',
  problems:
    "During an internship, our early bias-detection approach kept failing. Studying fairness metrics and collaborating with social scientists led to the breakthrough used in my thesis.",
  whySchool:
    "Stanford’s HAI and the Stanford NLP Group match my focus on interpretable ML. I’m especially keen to work with Prof. Chen on neural interpretability.",
  goal: "Short-term: contribute to explainable-AI research and co-author papers.\nLong-term: lead a lab building transparent, fair AI adopted by industry.\nConclusion: this program is the right environment to realize these goals.",
};

/* ------------------- UI <-> API key mapping ------------------- */
const uiToApiKey: Record<SectionKey, SopKey> = {
  hook: "hook",
  segue: "segue",
  academic: "academic",
  extracurricular: "extrac", // API uses 'extrac'
  publications: "publications",
  problems: "problem", // API uses 'problem'
  whySchool: "why", // API uses 'why'
  goal: "goal",
};

const apiToUiKey: Record<SopKey, SectionKey | null> = {
  country: null, // we don't render country block in this editor
  hook: "hook",
  segue: "segue",
  academic: "academic",
  extrac: "extracurricular",
  publications: "publications",
  problem: "problems",
  why: "whySchool",
  goal: "goal",
};

/* ------------------- theme detector (eslint fix in catch) ------------------- */
function getCurrentTheme(): "light" | "dark" {
  try {
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.body.classList.contains("dark")) return "dark";
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    return "light";
  }
  return "light";
}

/* ------------------- empty scaffold ------------------- */
const emptySections: SopSections = SECTION_ORDER.reduce((acc, k) => {
  acc[k] = { title: SECTION_DEFS[k].title, content: "" };
  return acc;
}, {} as SopSections);

const MySOP = () => {
  const { toast } = useToast();

  // state
  const [sections, setSections] = useState<SopSections>(emptySections);

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // export
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"txt" | "pdf" | "docx">(
    "txt"
  );

  // chat panel (left)
  const [messages, setMessages] = useState<
    { type: "ai" | "me"; content: string }[]
  >([
    {
      type: "ai",
      content:
        "Welcome! I can help you refine each section, adjust tone, and prepare a strong SOP.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  // words
  const totalWords = useMemo(
    () =>
      SECTION_ORDER.reduce((sum, k) => {
        const n = (sections[k]?.content || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        return sum + n;
      }, 0),
    [sections]
  );

  /* ------------------- load meta → UI ------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getSopMeta(); // GET /api/sop/meta
        const ui: SopSections = { ...emptySections };

        if (res?.sections) {
          (Object.keys(res.sections) as SopKey[]).forEach((apiKey) => {
            const uiKey = apiToUiKey[apiKey];
            if (!uiKey) return;
            const srv = (res.sections as any)[apiKey];
            ui[uiKey] = {
              title: SECTION_DEFS[uiKey].title,
              content: srv?.content?.trim()
                ? srv.content
                : SECTION_DEFAULTS[uiKey],
            };
          });
        } else {
          // fill defaults if nothing
          SECTION_ORDER.forEach((k) => {
            ui[k] = {
              title: SECTION_DEFS[k].title,
              content: SECTION_DEFAULTS[k],
            };
          });
        }

        setSections(ui);
      } catch (e: any) {
        // keep empty/defaults silently
        console.error("Load SOP meta failed:", e);
      }
    })();
  }, []);

  /* ------------------- helpers ------------------- */
  const updateSection = (key: SectionKey, content: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { title: SECTION_DEFS[key].title }), content },
    }));
  };

  const localTransform = (
    key: SectionKey,
    action: "improve" | "shorten" | "expand"
  ) => {
    const current = sections[key]?.content || "";
    let next = current;

    if (action === "shorten") {
      const w = current.split(/\s+/);
      const target = Math.max(18, Math.floor(w.length * 0.7));
      next = w.slice(0, target).join(" ") + (w.length > target ? "…" : "");
    } else if (action === "expand") {
      next =
        current +
        (current ? " " : "") +
        "This experience further strengthened my readiness for graduate study.";
    } else {
      next = current.replace(/\s{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
    }

    updateSection(key, next);
    setMessages((m) => [
      ...m,
      { type: "ai", content: `✅ ${action} applied on **${key}**.` },
    ]);
  };

  /* ------------------- actions ------------------- */

  // save only one section -> POST /api/sop/meta
  const saveOneSection = async (key: SectionKey) => {
    try {
      const apiKey = uiToApiKey[key];
      await saveSopMeta({
        sections: {
          [apiKey]: {
            title: SECTION_DEFS[key].title,
            content: sections[key]?.content || "",
          },
        } as Partial<ApiSopSections>,
      });
      toast({
        title: "Saved",
        description: `Section "${SECTION_DEFS[key].title}" saved.`,
      });
    } catch (e: any) {
      toast({
        title: "Save failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  // reset to empty scaffold
  const handleReset = () => {
    setSections(emptySections);
    setMessages([{ type: "ai", content: "Draft reset to initial skeleton." }]);
  };

  // preview (client-side assemble, theme-aware)
  const handlePreview = async () => {
    try {
      const html = assembleHtml(sections, getCurrentTheme());
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch (e: any) {
      toast({
        title: "Preview failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  // Save meta + create a file (PDF) so Documents tab shows a card
  const handleSaveAndCreate = async () => {
    try {
      // 1) save all sections to usermeta
      const apiPayload: Partial<ApiSopSections> = {};
      SECTION_ORDER.forEach((uiKey) => {
        const apiKey = uiToApiKey[uiKey];
        (apiPayload as any)[apiKey] = {
          title: SECTION_DEFS[uiKey].title,
          content: sections[uiKey]?.content || "",
        };
      });
      await saveSopMeta({ sections: apiPayload });

      // 2) immediately export a PDF; server will save URL into usermeta
      const structured = SECTION_ORDER.map((k) => ({
        title: SECTION_DEFS[k].title,
        content: sections[k]?.content || "",
      }));
      await exportSop({
        format: "pdf",
        title: "My SOP",
        sections: structured, // KEY: use sections for PDF/DOCX
        content: assemblePlainText(sections), // also fine to include
      });

      toast({
        title: "Done",
        description: "SOP saved and created. Check My Documents.",
      });
    } catch (e: any) {
      toast({
        title: "Operation failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  // Export by chosen format (txt/pdf/docx) – always pass sections so latest edits appear
  const handleExport = async () => {
    try {
      const structured = SECTION_ORDER.map((k) => ({
        title: SECTION_DEFS[k].title,
        content: sections[k]?.content || "",
      }));
      const plain = assemblePlainText(sections);

      const blob = await exportSop({
        format: exportFormat, // "pdf" | "docx" | "txt"
        title: "My SOP",
        sections: structured, // IMPORTANT for pdf/docx
        content: plain, // for txt
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sop.${exportFormat === "docx" ? "docx" : exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
      setExportOpen(false);
    } catch (e: any) {
      toast({
        title: "Export failed",
        description: e?.message ?? "Unexpected error",
        variant: "destructive",
      });
    }
  };

  // chat mock
  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages((m) => [...m, { type: "me", content: chatInput }]);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { type: "ai", content: "Noted. (AI actions are disabled for now)" },
      ]);
    }, 300);
    setChatInput("");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0b1020", color: "#e5e7eb" }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 border-b"
        style={{ background: "#111827", borderColor: "#25324a" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="px-3 py-1"
              style={{ background: "#0b213a", borderColor: "#25324a" }}
            >
              QuestApply • AI Demo
            </Badge>
            <h1 className="text-xl font-semibold">Create SOP</h1>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-170px)] overflow-hidden">
          {/* LEFT chat */}
          <div className="lg:col-span-1">
            <div
              className="flex flex-col h-full min-h-0 overflow-hidden rounded-xl border"
              style={{ background: "#111827", borderColor: "#25324a" }}
            >
              {/* header */}
              <div
                className="p-4 border-b flex items-center justify-between gap-2"
                style={{ borderColor: "#25324a" }}
              >
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    background: "#0b213a",
                    borderColor: "#25324a",
                    color: "#22c55e",
                  }}
                >
                  Draft v1 • Skeleton
                </Badge>
                <Button
                  size="sm"
                  className="text-xs"
                  style={{ background: "#7c3aed", color: "white" }}
                  onClick={() =>
                    setMessages((m) => [
                      ...m,
                      {
                        type: "ai",
                        content: `📸 Snapshot saved at ${new Date().toLocaleString()}`,
                      },
                    ])
                  }
                >
                  Save Snapshot
                </Button>
              </div>

              {/* messages */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.type === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className="max-w-[80%] p-3 rounded-lg text-sm border"
                      style={{
                        background: msg.type === "me" ? "#7c3aed20" : "#0e1526",
                        borderColor: "#25324a",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* input */}
              <div className="p-4 border-t" style={{ borderColor: "#25324a" }}>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type anything… e.g., Shorten publications"
                    className="text-sm"
                    style={{ background: "#0e1526", borderColor: "#25324a" }}
                    onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  />
                  <Button
                    size="sm"
                    onClick={sendChat}
                    style={{ background: "#7c3aed", color: "white" }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT document */}
          <div
            className="lg:col-span-2 rounded-xl border flex flex-col h-full min-h-0 overflow-hidden"
            style={{ background: "#111827", borderColor: "#25324a" }}
          >
            {/* toolbar */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: "#25324a" }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  style={{ background: "#0b213a", borderColor: "#25324a" }}
                >
                  Target: CS Ph.D. • Stanford
                </Badge>
                <Badge
                  variant="outline"
                  style={{ background: "#0b213a", borderColor: "#25324a" }}
                >
                  Words ~ {totalWords}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  style={{
                    background: "#0e1526",
                    borderColor: "#25324a",
                    color: "#9ca3af",
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePreview}
                  style={{
                    background: "#0e1526",
                    borderColor: "#25324a",
                    color: "#9ca3af",
                  }}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => setExportOpen(true)}
                  style={{ background: "#7c3aed", color: "white" }}
                >
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAndCreate}
                  style={{ background: "#22c55e", color: "white" }}
                >
                  <SaveIcon className="w-4 h-4 mr-1" /> Save & Create
                </Button>
              </div>
            </div>

            {/* sections */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {SECTION_ORDER.map((key) => {
                const def = SECTION_DEFS[key];
                const val = sections[key]?.content || "";
                const words = val.trim().split(/\s+/).filter(Boolean).length;

                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl border"
                    style={{ background: "#111827", borderColor: "#25324a" }}
                  >
                    {/* header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{def.title}</h3>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            background: "#0b213a",
                            borderColor: "#25324a",
                            color: "#9ca3af",
                          }}
                        >
                          {key}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        {(["improve", "shorten", "expand"] as const).map(
                          (a) => (
                            <Button
                              key={a}
                              size="sm"
                              variant="outline"
                              onClick={() => localTransform(key, a)}
                              className="text-xs px-2 py-1"
                              style={{
                                background: "#0e1526",
                                borderColor: "#25324a",
                                color: "#9ca3af",
                              }}
                            >
                              {a[0].toUpperCase() + a.slice(1)}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {/* body */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Textarea
                          value={val}
                          onChange={(e) => updateSection(key, e.target.value)}
                          className="min-h-32 text-sm"
                          style={{
                            background: "#0e1526",
                            borderColor: "#25324a",
                          }}
                        />
                      </div>
                      <div>
                        <div className="mb-2">
                          <span
                            className="text-sm font-medium"
                            style={{ color: "#9ca3af" }}
                          >
                            Preview
                          </span>
                        </div>
                        <div
                          className="min-h-32 p-3 rounded border-2 border-dashed text-sm whitespace-pre-wrap"
                          style={{
                            borderColor: "#25324a",
                            background: "#0b1020",
                            color: "#e5e7eb",
                          }}
                        >
                          {val}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <Button
                            size="sm"
                            className="text-xs"
                            style={{ background: "#22c55e", color: "white" }}
                            onClick={() => saveOneSection(key)}
                          >
                            <SaveIcon className="w-3 h-3 mr-1" /> Save
                          </Button>
                          <span
                            className="text-xs"
                            style={{ color: "#9ca3af" }}
                          >
                            Word ~ {words}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Export modal */}
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export SOP</DialogTitle>
            </DialogHeader>
            <RadioGroup
              value={exportFormat}
              onValueChange={(v: any) => setExportFormat(v)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="txt" id="exp-txt" />
                <UiLabel htmlFor="exp-txt">Text (.txt)</UiLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="exp-pdf" />
                <UiLabel htmlFor="exp-pdf">PDF (.pdf)</UiLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="exp-docx" />
                <UiLabel htmlFor="exp-docx">Word (.docx)</UiLabel>
              </div>
            </RadioGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>Download</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview modal (theme-aware via assembleHtml) */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview (assembled)</DialogTitle>
            </DialogHeader>

            <div className="max-h-[70vh]">
              <iframe
                title="SOP Preview"
                className="w-full h-[60vh] rounded-md border"
                srcDoc={previewHtml}
                sandbox="allow-same-origin"
                style={{ background: "white" }}
              />
            </div>

            <DialogFooter>
              <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MySOP;
