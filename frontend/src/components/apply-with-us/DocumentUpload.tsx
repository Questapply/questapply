import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Upload,
  FileText,
  GraduationCap,
  Globe,
  CreditCard,
  Users,
  BookOpen,
  Paperclip,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "missing" | "uploaded" | "reviewing";
  required: boolean;
  fileType?: string;
  extraFields?: React.ReactNode;
}

interface TranscriptEntry {
  id: string;
  degreeType: string;
  fieldOfStudy: string;
  startDate: string;
  graduationDate: string;
  universityName: string;
  gpa: string;
  uploadedFile?: File;
}

const DocumentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [
      {
        id: "1",
        degreeType: "",
        fieldOfStudy: "",
        startDate: "",
        graduationDate: "",
        universityName: "",
        gpa: "",
      },
    ]
  );

  const addTranscriptEntry = () => {
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      degreeType: "",
      fieldOfStudy: "",
      startDate: "",
      graduationDate: "",
      universityName: "",
      gpa: "",
    };
    setTranscriptEntries([...transcriptEntries, newEntry]);
  };

  const removeTranscriptEntry = (id: string) => {
    if (transcriptEntries.length > 1) {
      setTranscriptEntries(
        transcriptEntries.filter((entry) => entry.id !== id)
      );
    }
  };

  const updateTranscriptEntry = (
    id: string,
    field: keyof TranscriptEntry,
    value: string
  ) => {
    setTranscriptEntries(
      transcriptEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleTranscriptFileUpload = (
    entryId: string,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setTranscriptEntries(
      transcriptEntries.map((entry) =>
        entry.id === entryId ? { ...entry, uploadedFile: file } : entry
      )
    );
  };

  const documents: DocumentItem[] = [
    {
      id: "resume",
      title: "Resume/CV",
      description: "Please upload your most recent resume or curriculum vitae.",
      icon: <FileText className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF, DOC, DOCX",
      extraFields: (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="resume-experience">
              Professional Experience Summary
            </Label>
            <Textarea
              id="resume-experience"
              placeholder="Brief summary of your professional experience..."
              className="mt-2"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="resume-skills">Key Skills</Label>
            <Input
              id="resume-skills"
              placeholder="Programming languages, tools, certifications..."
              className="mt-2"
            />
          </div>
        </div>
      ),
    },
    {
      id: "sop",
      title: "Statement of Purpose (SOP)",
      description:
        "Submit your Statement of Purpose explaining your motivations and goals.",
      icon: <FileText className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF, DOC, DOCX",
      extraFields: (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="sop-goals">Academic Goals</Label>
            <Textarea
              id="sop-goals"
              placeholder="Describe your academic and career goals..."
              className="mt-2"
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="sop-assistance">
              Areas where you need assistance
            </Label>
            <Textarea
              id="sop-assistance"
              placeholder="Let us know how our team can help you improve your SOP..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      ),
    },
    {
      id: "transcript",
      title: "Transcript",
      description:
        "Upload your official degree transcripts (Bachelor, Master, etc.).",
      icon: <GraduationCap className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF",
      extraFields: (
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Academic Records</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTranscriptEntry}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More
            </Button>
          </div>

          {transcriptEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Academic Record {index + 1}</h4>
                {transcriptEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTranscriptEntry(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`degree-type-${entry.id}`}>Degree Type</Label>
                  <Select
                    onValueChange={(value) =>
                      updateTranscriptEntry(entry.id, "degreeType", value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select degree type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachelor">Bachelor's</SelectItem>
                      <SelectItem value="master">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="associate">Associate</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`field-study-${entry.id}`}>
                    Field of Study
                  </Label>
                  <Input
                    id={`field-study-${entry.id}`}
                    placeholder="Computer Science, Economics, etc."
                    className="mt-2"
                    value={entry.fieldOfStudy}
                    onChange={(e) =>
                      updateTranscriptEntry(
                        entry.id,
                        "fieldOfStudy",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`start-date-${entry.id}`}>Start Date</Label>
                  <Input
                    id={`start-date-${entry.id}`}
                    type="date"
                    className="mt-2"
                    value={entry.startDate}
                    onChange={(e) =>
                      updateTranscriptEntry(
                        entry.id,
                        "startDate",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`graduation-date-${entry.id}`}>
                    Graduation Date
                  </Label>
                  <Input
                    id={`graduation-date-${entry.id}`}
                    type="date"
                    className="mt-2"
                    value={entry.graduationDate}
                    onChange={(e) =>
                      updateTranscriptEntry(
                        entry.id,
                        "graduationDate",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`university-${entry.id}`}>
                    University Name
                  </Label>
                  <Input
                    id={`university-${entry.id}`}
                    placeholder="University of California, Berkeley"
                    className="mt-2"
                    value={entry.universityName}
                    onChange={(e) =>
                      updateTranscriptEntry(
                        entry.id,
                        "universityName",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <Label htmlFor={`gpa-${entry.id}`}>GPA</Label>
                  <Input
                    id={`gpa-${entry.id}`}
                    placeholder="3.8/4.0"
                    className="mt-2"
                    value={entry.gpa}
                    onChange={(e) =>
                      updateTranscriptEntry(entry.id, "gpa", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Upload area for this transcript */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <div className="space-y-2">
                  <Upload className="h-6 w-6 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium">Upload Transcript</p>
                  <p className="text-xs text-gray-500">PDF files only</p>
                  <input
                    type="file"
                    className="hidden"
                    id={`transcript-file-${entry.id}`}
                    onChange={(e) =>
                      handleTranscriptFileUpload(entry.id, e.target.files)
                    }
                    accept=".pdf"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document
                        .getElementById(`transcript-file-${entry.id}`)
                        ?.click()
                    }
                  >
                    {entry.uploadedFile ? "Replace File" : "Select File"}
                  </Button>
                  {entry.uploadedFile && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      {entry.uploadedFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "english-test",
      title: "English Test",
      description:
        "Submit your English proficiency test scores (e.g., TOEFL, IELTS).",
      icon: <Globe className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF, JPG, PNG",
      extraFields: (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="english-test-type">Test Type</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toefl">TOEFL</SelectItem>
                <SelectItem value="ielts">IELTS</SelectItem>
                <SelectItem value="pte">PTE</SelectItem>
                <SelectItem value="duolingo">Duolingo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="english-score">Score</Label>
            <Input id="english-score" placeholder="110/120" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="english-date">Test Date</Label>
            <Input id="english-date" type="date" className="mt-2" />
          </div>
        </div>
      ),
    },
    {
      id: "passport",
      title: "Passport",
      description: "Upload a copy of your valid passport.",
      icon: <CreditCard className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF, JPG, PNG",
      extraFields: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="passport-expiry">Expiration Date</Label>
            <Input id="passport-expiry" type="date" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="passport-nationality">Nationality</Label>
            <Input
              id="passport-nationality"
              placeholder="United States"
              className="mt-2"
            />
          </div>
        </div>
      ),
    },
    {
      id: "standardized-test",
      title: "GRE/GMAT/LSAT/MCAT",
      description:
        "Upload your standardized test scores as required by the program.",
      icon: <BookOpen className="h-5 w-5" />,
      status: "missing",
      required: false,
      fileType: "PDF",
      extraFields: (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <Label htmlFor="std-test-type">Test Type</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gre">GRE</SelectItem>
                <SelectItem value="gmat">GMAT</SelectItem>
                <SelectItem value="lsat">LSAT</SelectItem>
                <SelectItem value="mcat">MCAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="std-score">Score</Label>
            <Input id="std-score" placeholder="320/340" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="std-date">Test Date</Label>
            <Input id="std-date" type="date" className="mt-2" />
          </div>
        </div>
      ),
    },
    {
      id: "lor",
      title: "Letter of Recommendation (LOR)",
      description:
        "Provide letters of recommendation from your professors or employers.",
      icon: <Users className="h-5 w-5" />,
      status: "missing",
      required: true,
      fileType: "PDF",
      extraFields: (
        <div className="space-y-4 mt-4">
          <Label>Recommenders Information</Label>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h4 className="font-medium mb-3">Recommender {num}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`rec-${num}-name`}>Full Name</Label>
                  <Input
                    id={`rec-${num}-name`}
                    placeholder="Dr. John Smith"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`rec-${num}-email`}>Email</Label>
                  <Input
                    id={`rec-${num}-email`}
                    placeholder="john.smith@university.edu"
                    type="email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`rec-${num}-position`}>Position/Title</Label>
                  <Input
                    id={`rec-${num}-position`}
                    placeholder="Professor of Computer Science"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`rec-${num}-affiliation`}>
                    Institution/Company
                  </Label>
                  <Input
                    id={`rec-${num}-affiliation`}
                    placeholder="MIT"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "papers",
      title: "Papers",
      description: "Provide any relevant research papers or publications.",
      icon: <BookOpen className="h-5 w-5" />,
      status: "missing",
      required: false,
      fileType: "PDF",
      extraFields: (
        <div className="space-y-4 mt-4">
          <Label>Research Papers/Publications</Label>
          {[1, 2].map((num) => (
            <div
              key={num}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h4 className="font-medium mb-3">Publication {num}</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`paper-${num}-title`}>Paper Title</Label>
                  <Input
                    id={`paper-${num}-title`}
                    placeholder="Machine Learning Applications in Healthcare"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`paper-${num}-journal`}>
                      Journal/Conference
                    </Label>
                    <Input
                      id={`paper-${num}-journal`}
                      placeholder="IEEE Transactions"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`paper-${num}-date`}>
                      Publication Date
                    </Label>
                    <Input
                      id={`paper-${num}-date`}
                      type="date"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`paper-${num}-link`}>DOI/Link</Label>
                  <Input
                    id={`paper-${num}-link`}
                    placeholder="https://doi.org/10.1109/..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "others",
      title: "Others",
      description: "Upload any other supporting documents.",
      icon: <Paperclip className="h-5 w-5" />,
      status: "missing",
      required: false,
      fileType: "PDF, DOC, DOCX, JPG, PNG",
      extraFields: (
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="others-description">Document Description</Label>
            <Textarea
              id="others-description"
              placeholder="Please describe what these documents are and their relevance to your application..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>
      ),
    },
  ];

  const handleFileUpload = (documentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Simulate upload progress
    setUploadProgress((prev) => ({ ...prev, [documentId]: 0 }));

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[documentId] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [documentId]: currentProgress + 10 };
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "reviewing":
        return <Eye className="h-5 w-5 text-blue-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string, required: boolean) => {
    switch (status) {
      case "uploaded":
        return <Badge className="bg-green-500 text-white">Uploaded</Badge>;
      case "reviewing":
        return <Badge className="bg-blue-500 text-white">Reviewing</Badge>;
      default:
        return (
          <Badge variant={required ? "destructive" : "secondary"}>
            {required ? "Required" : "Optional"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Documents
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Please upload all required documents for your application. Each
          document should be clear and readable.
        </p>

        {/* Progress Overview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm">2/9 completed</span>
          </div>
          <Progress value={22} className="h-2" />
        </div>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {documents.map((doc) => (
          <AccordionItem
            key={doc.id}
            value={doc.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      doc.status === "uploaded"
                        ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        : doc.status === "reviewing"
                        ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {doc.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(doc.status)}
                  {getStatusBadge(doc.status, doc.required)}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {/* Upload Area - Only show for non-transcript documents */}
                {doc.id !== "transcript" && (
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                      uploadProgress[doc.id] !== undefined
                        ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    )}
                  >
                    {uploadProgress[doc.id] !== undefined ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <Upload className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Uploading...</p>
                          <Progress
                            value={uploadProgress[doc.id]}
                            className="h-2 mt-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Drop files here or click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            Supported formats: {doc.fileType}
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          id={`file-${doc.id}`}
                          onChange={(e) =>
                            handleFileUpload(doc.id, e.target.files)
                          }
                          accept={doc.fileType?.includes("PDF") ? ".pdf" : "*"}
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            document.getElementById(`file-${doc.id}`)?.click()
                          }
                        >
                          Select File
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Extra Fields */}
                {doc.extraFields && (
                  <div
                    className={
                      doc.id !== "transcript"
                        ? "border-t border-gray-200 dark:border-gray-700 pt-4"
                        : ""
                    }
                  >
                    {doc.extraFields}
                  </div>
                )}

                {/* Action Buttons */}
                {doc.status === "uploaded" && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      Replace
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Save Progress Button */}
      <div className="flex justify-end pt-6">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Progress</Button>
      </div>
    </div>
  );
};

export default DocumentUpload;
