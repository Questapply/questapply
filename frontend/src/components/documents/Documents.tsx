// src/pages/Documents.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { listResumes, exportResume, deleteResume } from "@/api/resumeApi";
import { motion } from "framer-motion";
import { useToast } from "../ui/use-toast";
import DashboardLayout from "../layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import ResumeEditDialog from "./ResumeEditDialog";
import SopEditDialog from "./SopEditDialog";

import {
  getSopDocuments,
  mapSopDocsToCards,
  deleteSopDocument,
} from "@/api/sopApi";
// ❗️برای LOR از lorApi استفاده می‌کنیم تا توکن و BASE هماهنگ باشد
import {
  authHeaders,
  LOR_BASE,
  getRecommenderRequests,
  deleteLorDocument,
  deleteLorRequest,
} from "@/api/lorApi";
import LorEditDialog from "./LorEditDialog";
import LorRemindDialog from "./LorRemindDialog";

import {
  File,
  UploadCloud,
  Download,
  FileText,
  Edit3,
  Trash2,
  Plus,
  FileCheck,
  FileX,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Category = "sop" | "lors" | "transcripts" | "resumes";

type DocCard = {
  id: number | string;
  title: string | null;
  lastUpdated?: string | null;
  status?: string | null;
  size?: string | null;
  type?: string | null;
  // LOR/SOP files
  url?: string | null;
  // رزومه
  templateId?: number | string | null;
  // LOR requests
  professor?: string | null;
  teacherEmail?: string | null;
  // tag to distinguish LOR file vs request
  kind?: "lor-file" | "lor-request";
};

/* ===== سبک تایپ برای ردیف‌های API تا any حذف شود ===== */
type ResumeSummaryRow = {
  resume_id: number | string;
  template_id?: number | string | null;
  updated_at?: string | null;
  display_name?: string | null;
};
type LorFileRow = { title?: string | null; url?: string | null };
type LorRequestRow = {
  id: number | string;
  teacher_name?: string | null;
  teacher_email?: string | null; // اگر بک‌اند ندارد، null می‌آید
  created_at?: string | null;
  recommend_status?: string | null;
};

const Documents = () => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // search params / tab state
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "sop");
  const highlightId = searchParams.get("highlight") || null;

  // data
  const [resumes, setResumes] = useState<DocCard[]>([]);
  const [sops, setSops] = useState<DocCard[]>([]);
  const [lorFiles, setLorFiles] = useState<DocCard[]>([]);
  const [lorRequests, setLorRequests] = useState<DocCard[]>([]);

  // editors
  const [editOpen, setEditOpen] = useState(false);
  const [editResumeId, setEditResumeId] = useState<string | null>(null);

  const [sopEditOpen, setSopEditOpen] = useState(false);
  const [editSopId, setEditSopId] = useState<string | null>(null);

  const [lorEditOpen, setLorEditOpen] = useState(false);
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindInfo, setRemindInfo] = useState<{
    id: number | string | null;
    email: string | null;
    name?: string | null;
  } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "sop");
  }, [searchParams]);

  // ===== Resumes =====
  const reloadResumes = useCallback(async () => {
    try {
      const data = await listResumes(); // GET /user-resumes-summary
      const rows: ResumeSummaryRow[] = Array.isArray(data) ? data : [];
      const mapped: DocCard[] = rows.map((d) => ({
        id: d.resume_id,
        templateId: d.template_id ?? null,
        title:
          d.display_name ??
          `Resume ${d.resume_id}${
            d.template_id != null ? ` (T: ${d.template_id})` : ""
          }`,
        lastUpdated: d.updated_at ?? null,
        status: "draft",
        size: null,
        type: "DOCX",
      }));
      setResumes(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch resumes", e);
      toast({
        title: "Failed to load resumes",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ===== SOPs =====
  const reloadSops = useCallback(async () => {
    try {
      const raw = await getSopDocuments(); // GET /api/sop/documents
      const mapped = mapSopDocsToCards(raw) as DocCard[];
      setSops(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({
        title: "Failed to load SOPs",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ===== LORs: files (generated PDFs/DOCX) =====
  const reloadLorFiles = useCallback(async () => {
    try {
      const res = await fetch(`${LOR_BASE}/documents`, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const items: LorFileRow[] = await res.json(); // [{ type:'lor', title:'LOR PDF', url:'...' }, ...]

      const mapped: DocCard[] = (Array.isArray(items) ? items : []).map(
        (it, idx) => ({
          id: `lorfile-${idx}`,
          title: it.title || "LOR File",
          lastUpdated: null,
          status: "generated",
          type: it?.url?.toLowerCase()?.endsWith(".pdf")
            ? "PDF"
            : it?.url?.toLowerCase()?.endsWith(".docx")
            ? "DOCX"
            : null,
          url: it.url || null,
          kind: "lor-file",
        })
      );

      setLorFiles(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch LOR files", e);
      toast({
        title: "Failed to load LOR files",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }, [toast]);

  // ===== LORs: recommender requests =====
  const mapLorStatus = (s?: string | null) => {
    const v = (s || "").toLowerCase();
    if (["submitted", "received", "done", "completed"].includes(v))
      return "received";
    if (["sent", "pending"].includes(v)) return "pending";
    if (["rejected", "declined"].includes(v)) return "rejected";
    return "draft";
  };

  const reloadLorRequests = useCallback(async () => {
    try {
      const rows = await getRecommenderRequests(); // GET /api/lor/recommender/requests
      const items: LorRequestRow[] = (
        Array.isArray(rows) ? rows : []
      ) as LorRequestRow[];
      const mapped: DocCard[] = items.map((r) => ({
        id: r.id,
        title: r.teacher_name ? `LOR - ${r.teacher_name}` : `LOR #${r.id}`,
        lastUpdated: r.created_at ?? null,
        status: mapLorStatus(r.recommend_status),
        type: null,
        professor: r.teacher_name || null,
        teacherEmail: r.teacher_email || null, // اگر بک‌اند این ستون را ندارد، null می‌ماند
        kind: "lor-request",
      }));
      setLorRequests(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Failed to fetch LOR requests", e);
      toast({
        title: "Failed to load LOR requests",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }, [toast]);

  // initial + on tab change
  useEffect(() => {
    if (activeTab === "resumes") {
      reloadResumes();
    } else if (activeTab === "sop") {
      reloadSops();
    } else if (activeTab === "lors") {
      reloadLorFiles();
      reloadLorRequests();
    }
  }, [activeTab, reloadResumes, reloadSops, reloadLorFiles, reloadLorRequests]);

  // theme toggle
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  async function downloadUrlAsFile(fileUrl: string, fallbackName = "download") {
    // سعی می‌کنیم Blob بگیریم تا تب جدید باز نشه
    const res = await fetch(fileUrl, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();

    // نام فایل را از Header یا URL حدس بزن
    const cd = res.headers.get("content-disposition") || "";
    let fromHeader = "";
    const mUtf8 = cd.match(/filename\*=\s*UTF-8''([^;]+)/i);
    const mQuoted = cd.match(/filename="([^"]+)"/i);
    const mBare = cd.match(/filename=([^;]+)/i);
    if (mUtf8) fromHeader = decodeURIComponent(mUtf8[1]);
    else if (mQuoted) fromHeader = mQuoted[1];
    else if (mBare) fromHeader = mBare[1];

    let name = (fromHeader || fallbackName || "download").toString();

    // اگر پسوند نداشت، از content-type یا URL دربیار
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    let ext = "";
    if (/pdf/.test(ct)) ext = "pdf";
    else if (/word/.test(ct)) ext = "docx";
    else if (/text/.test(ct)) ext = "txt";

    if (!/\.[a-z0-9]{2,8}$/i.test(name)) {
      if (!ext) {
        try {
          const u = new URL(fileUrl);
          const last = u.pathname.split("/").pop() || "";
          const dot = last.lastIndexOf(".");
          if (dot >= 0) ext = last.slice(dot + 1);
        } catch {
          /* ignore */
        }
      }
      if (ext) name = `${name}.${ext}`;
    }

    // sanitize
    name = name.replace(/[^\w.\-]+/g, "_").slice(0, 120);

    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  // ===== Actions (download/edit/delete) =====
  async function handleDownload(doc: DocCard, category: Category) {
    try {
      if (category === "resumes") {
        const tidRaw = (doc as { templateId?: number | string | null })
          .templateId;
        const templateId =
          tidRaw !== null &&
          tidRaw !== undefined &&
          Number.isFinite(Number(tidRaw))
            ? Number(tidRaw)
            : undefined;

        const blob = await exportResume({
          resumeId: String(doc.id),
          templateId,
          format: "pdf",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(doc.title || "resume")
          .toString()
          .replace(/\s+/g, "_")}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      if (category === "sop" || category === "lors") {
        // بعضی مپ‌ها قبلاً فیلد directUrl داشتند؛ هر دو را چک کن
        const fileUrl = (doc as any).url ?? (doc as any).directUrl ?? null;

        if (!fileUrl) {
          toast({
            title: "No file",
            description:
              category === "lors"
                ? "This LOR item has no file URL (it's likely a request entry)."
                : "No downloadable link found for this SOP.",
          });
          return;
        }

        const base = (doc.title || (category === "sop" ? "sop" : "lor"))
          .toString()
          .replace(/\s+/g, "_");

        // دانلود مثل رزومه، بدون باز شدن تب
        await downloadUrlAsFile(String(fileUrl), base);
        return;
      }

      toast({
        title: "Not implemented",
        description: "Download for this type is not wired yet.",
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({
        title: "Download failed",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  async function handleEdit(
    doc: DocCard,
    category: "resumes" | "sop" | "lors" | "transcripts"
  ) {
    if (category === "resumes") {
      setEditResumeId(String(doc.id));
      setEditOpen(true);
      return;
    }
    if (category === "sop") {
      setEditSopId(null);
      setSopEditOpen(true);
      return;
    }
    if (category === "lors") {
      // اگر kind ست نشده بود، با داشتن url حدس می‌زنیم فایل است
      const kind: "lor-file" | "lor-request" =
        doc.kind || (doc.url ? "lor-file" : "lor-request");

      if (kind === "lor-file") {
        setLorEditOpen(true); // ویرایش/Export
        return;
      }

      if (kind === "lor-request") {
        const teacherEmail: string | null = doc.teacherEmail ?? null;
        const teacherName: string | null = doc.professor ?? null;

        if (!teacherEmail) {
          toast({
            title: "Missing email",
            description: "This request has no teacherEmail.",
            variant: "destructive",
          });
          return;
        }

        setRemindInfo({ id: doc.id, email: teacherEmail, name: teacherName });
        setRemindOpen(true);
        return;
      }
    }
    toast({
      title: "Not implemented",
      description: `Edit for ${category} not wired yet.`,
    });
  }

  async function handleDelete(doc: DocCard, category: Category) {
    if (!doc?.id) {
      toast({
        title: "Delete failed",
        description: "Missing document id",
        variant: "destructive",
      });
      return;
    }
    if (
      !confirm(`Delete "${doc.title || `#${doc.id}`}"? This cannot be undone.`)
    )
      return;

    try {
      if (category === "resumes") {
        await deleteResume(String(doc.id));
        setResumes((prev) =>
          prev.filter((r) => String(r.id) !== String(doc.id))
        );
        await reloadResumes();
        toast({
          title: "Deleted",
          description: "Resume removed from your documents.",
        });
      } else if (category === "sop") {
        const fileUrl = (doc as any).url ?? (doc as any).directUrl ?? null;
        if (!fileUrl) {
          toast({
            title: "Delete failed",
            description: "No URL for this SOP item.",
            variant: "destructive",
          });
          return;
        }
        await deleteSopDocument(String(fileUrl));
        setSops((prev) =>
          prev.filter(
            (s) => ((s as any).url ?? (s as any).directUrl) !== fileUrl
          )
        );
        toast({ title: "Deleted", description: "SOP file removed." });
        return;
      } else if (category === "lors") {
        const kind =
          (doc as any).kind || ((doc as any).url ? "lor-file" : "lor-request");

        // حذف فایل تولید شده
        if (kind === "lor-file" && (doc as any).url) {
          await deleteLorDocument(String((doc as any).url));
          setLorFiles((prev) =>
            prev.filter((x) => (x as any).url !== (doc as any).url)
          );
          toast({ title: "Deleted", description: "LOR file removed." });
          return;
        }

        // حذف درخواست (اگر بک‌اند رو راه انداختی)
        if (kind === "lor-request") {
          try {
            await deleteLorRequest(String(doc.id)); // ← نیازمند روت اختیاری بالا
            setLorRequests((prev) =>
              prev.filter((x) => String(x.id) !== String(doc.id))
            );
            toast({ title: "Deleted", description: "LOR request removed." });
          } catch (e: any) {
            // اگر هنوز پیاده نکرده‌ای، پیام مناسب بده
            toast({
              title: "Not supported",
              description:
                e?.message || "Deleting LOR requests isn't supported yet.",
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Delete failed",
          description: "Unknown LOR item.",
          variant: "destructive",
        });
        return;
      } else {
        toast({
          title: "Not implemented",
          description: "Delete for this type isn't wired yet.",
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast({
        title: "Delete failed",
        description: message || "Unexpected error",
        variant: "destructive",
      });
    }
  }

  // mock for transcripts
  const documents = {
    transcripts: [
      {
        id: 5,
        title: "Undergraduate Transcript",
        lastUpdated: "2023-09-20",
        status: "verified",
        size: "2.1 MB",
        type: "PDF",
        institution: "University of Washington",
      },
      {
        id: 6,
        title: "Graduate Transcript",
        lastUpdated: "2023-09-20",
        status: "rejected",
        size: "1.8 MB",
        type: "PDF",
        institution: "University of California",
      },
    ] as unknown as DocCard[],
  };

  const getStatusIcon = (status: string | undefined | null) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <FileX className="h-5 w-5 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "received":
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case "draft":
        return <Edit3 className="h-5 w-5 text-gray-500" />;
      case "generated":
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getStatusText = (status: string | undefined | null) => {
    switch (status) {
      case "verified":
        return (
          <span className="text-green-600 dark:text-green-400">Verified</span>
        );
      case "rejected":
        return <span className="text-red-600 dark:text-red-400">Rejected</span>;
      case "pending":
        return (
          <span className="text-amber-600 dark:text-amber-400">Pending</span>
        );
      case "received":
        return (
          <span className="text-blue-600 dark:text-blue-400">Received</span>
        );
      case "draft":
        return <span className="text-gray-600 dark:text-gray-400">Draft</span>;
      case "generated":
        return (
          <span className="text-blue-600 dark:text-blue-400">Generated</span>
        );
      default:
        return null;
    }
  };

  const renderDocumentCards = (docArray: DocCard[], category: Category) => {
    return docArray.map((doc, index) => {
      const isHighlight =
        highlightId != null && String(doc.id) === String(highlightId);

      return (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card
            className={`hover:shadow-md transition-shadow ${
              isHighlight ? "ring-2 ring-purple-500" : ""
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    {getStatusIcon(doc.status || "draft")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{doc.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {doc.lastUpdated && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Last updated:{" "}
                          {new Date(doc.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                      {doc.size && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Size: {doc.size}
                        </p>
                      )}
                      {doc.type && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Type: {doc.type}
                        </p>
                      )}
                      {/* LOR: show recommender name/email for requests */}
                      {category === "lors" && doc.professor && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Recommender: {doc.professor}
                          {doc.teacherEmail ? ` — ${doc.teacherEmail}` : ""}
                        </p>
                      )}
                    </div>
                    <p className="mt-2 text-sm">
                      Status: {getStatusText(doc.status || "draft")}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Download */}
                  <Button
                    aria-label="Download"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleDownload(doc, category)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {/* Edit */}
                  <Button
                    aria-label="Edit"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handleEdit(doc, category)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>

                  {/* Delete */}
                  <Button
                    aria-label="Delete"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(doc, category)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    });
  };

  return (
    <>
      <DashboardLayout
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              My Documents
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage and organize all your application documents in one place.
            </p>
          </motion.div>

          <div className="flex justify-end">
            <Button className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" />
              Upload New Document
            </Button>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setSearchParams((prev) => {
                const p = new URLSearchParams(prev);
                p.set("tab", val);
                return p;
              })
            }
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="sop" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Statements of Purpose</span>
              </TabsTrigger>
              <TabsTrigger value="lors" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Letters of Recommendation</span>
              </TabsTrigger>
              <TabsTrigger
                value="transcripts"
                className="flex items-center gap-2"
              >
                <FileCheck className="h-4 w-4" />
                <span>Transcripts</span>
              </TabsTrigger>
              <TabsTrigger value="resumes" className="flex items-center gap-2">
                <File className="h-4 w-4" />
                <span>Resumes</span>
              </TabsTrigger>
            </TabsList>

            {/* SOP (dynamic) */}
            <TabsContent value="sop">
              <div className="space-y-4">
                {renderDocumentCards(sops, "sop")}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 border-dashed flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => {
                      setEditSopId(null);
                      setSopEditOpen(true);
                    }}
                  >
                    <Plus className="h-5 w-5" />
                    Create / Edit Statement of Purpose
                  </Button>
                </motion.div>
              </div>
            </TabsContent>

            {/* LOR (dynamic): Generated Files + Requests */}
            <TabsContent value="lors">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Generated LOR Files
                  </h3>
                  {lorFiles.length ? (
                    renderDocumentCards(lorFiles, "lors")
                  ) : (
                    <p className="text-sm text-gray-500">
                      No generated LOR files yet.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                    Recommender Requests
                  </h3>
                  {lorRequests.length ? (
                    renderDocumentCards(lorRequests, "lors")
                  ) : (
                    <p className="text-sm text-gray-500">No requests yet.</p>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 border-dashed flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => navigate("/lor")}
                  >
                    <Plus className="h-5 w-5" />
                    Request New Letter of Recommendation
                  </Button>
                </motion.div>
              </div>
            </TabsContent>

            {/* Transcripts (mock) */}
            <TabsContent value="transcripts">
              <div className="space-y-4">
                {renderDocumentCards(documents.transcripts, "transcripts")}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 border-dashed flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Plus className="h-5 w-5" />
                    Upload New Transcript
                  </Button>
                </motion.div>
              </div>
            </TabsContent>

            {/* Resumes (dynamic) */}
            <TabsContent value="resumes">
              <div className="space-y-4">
                {renderDocumentCards(resumes, "resumes")}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    className="w-full py-6 border-dashed flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Plus className="h-5 w-5" />
                    Create New Resume
                  </Button>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      {/* dialogs */}
      <ResumeEditDialog
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditResumeId(null);
        }}
        resumeId={editResumeId}
        onSaved={async () => {
          await reloadResumes();
        }}
      />

      <SopEditDialog
        open={sopEditOpen}
        onOpenChange={(o) => {
          setSopEditOpen(o);
          if (!o) setEditSopId(null);
        }}
        sopId={editSopId}
        onSaved={async () => {
          await reloadSops();
        }}
      />

      <LorEditDialog
        open={lorEditOpen}
        onOpenChange={(o) => setLorEditOpen(o)}
        onSaved={async () => {
          await reloadLorFiles();
        }}
      />

      <LorRemindDialog
        open={remindOpen}
        onOpenChange={(o) => setRemindOpen(o)}
        requestId={remindInfo?.id ?? null}
        teacherEmail={remindInfo?.email ?? null}
        recommenderName={remindInfo?.name ?? ""}
      />
    </>
  );
};

export default Documents;
