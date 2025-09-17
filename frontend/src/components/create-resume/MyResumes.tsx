import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Edit, Download, Share, Eye, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useToast } from "../ui/use-toast";

import PersonalInfoForm from "./forms/PersonalInfoForm";
import SummaryForm from "./forms/SummaryForm";
import ProfessionalHistoryForm from "./forms/ProfessionalHistoryForm";
import EducationForm from "./forms/EducationForm";
import ResearchInterestsForm from "./forms/ResearchInterestsForm";
import PublicationsForm from "./forms/PublicationsForm";
import CertificationsSkillsForm from "./forms/CertificationsSkillsForm";
import HonorsAwardsForm from "./forms/HonorsAwardsForm";
import MembershipsForm from "./forms/MembershipsForm";
import InterestsHobbiesForm from "./forms/InterestsHobbiesForm";
import ReferencesForm from "./forms/ReferencesForm";

// Import all new interfaces
import {
  PersonalInfoData,
  SummaryData,
  ProfessionalHistoryItem,
  EducationItem,
  ResearchInterestsData,
  PublicationItem,
  CertificationSkillItem,
  HonorAwardItem,
  MembershipItem,
  InterestsHobbiesData,
  ReferenceItem,
} from "../../types/resumeTypes";

// --- Interfaces ---
interface MyResumesProps {
  selectedTemplateIdForCreation: number | null;
  selectedTemplateNameForCreation: string | null;
  // New prop: a function to notify the parent to change tab
  onNavigateToChooseTemplate: () => void;
}

interface UserResumeSummary {
  resume_id: string;
  template_id: number;
  display_name: string;
}

interface FullResumeData {
  resume_id: string;
  template_id: number;
  sections: { [key: string]: string };
  display_name: string;
  created_at?: string;
}

// Update SaveResult interface to match the new API response
interface SaveResult {
  success: boolean;
  new_resume_id?: string;
  message?: string;
  error?: string; // Add error property
}

const resumeSectionsConfig = [
  { id: "header", title: "Personal Information", order: 1 },
  { id: "summary", title: "Summary", order: 2 },
  { id: "history", title: "Professional History", order: 3 },
  { id: "education", title: "Education", order: 4 },
  { id: "research", title: "Research Interests", order: 5 },
  { id: "publications", title: "Publications", order: 6 },
  { id: "certifications", title: "Certifications and Skills", order: 7 },
  { id: "honors", title: "Honors and Awards", order: 8 },
  { id: "memberships", title: "Memberships", order: 9 },
  { id: "hobbies", title: "Interests and Hobbies", order: 10 },
  { id: "reference", title: "References", order: 11 },
];

const MyResumes = ({
  selectedTemplateIdForCreation,
  selectedTemplateNameForCreation,
  onNavigateToChooseTemplate,
}: MyResumesProps) => {
  const [userResumes, setUserResumes] = useState<UserResumeSummary[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [currentEditingResume, setCurrentEditingResume] =
    useState<FullResumeData | null>(null);
  const [isCreatingNewResume, setIsCreatingNewResume] =
    useState<boolean>(false);
  const [newResumeTemplateId, setNewResumeTemplateId] = useState<number | null>(
    null
  );
  const [newResumeTemplateName, setNewResumeTemplateName] = useState<
    string | null
  >(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const { toast } = useToast();

  // --- API Functions ---
  const fetchUserResumesFromApi = useCallback(async (): Promise<
    UserResumeSummary[] | undefined
  > => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your resumes.",
        variant: "destructive",
      });
      return undefined;
    }
    try {
      const response = await fetch("/api/resume-data/user-resumes-summary", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `API error: ${response.statusText}`
        );
      }
      const data: UserResumeSummary[] = await response.json();
      return data;
    } catch (error) {
      toast({
        title: "Failed to load resumes.",
        description:
          (error instanceof Error
            ? error.message
            : "An unknown error occurred.") + " Please try again later.",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const fetchFullResumeFromApi = useCallback(
    async (resumeId: string): Promise<FullResumeData | null> => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view resume details.",
          variant: "destructive",
        });
        return null;
      }
      try {
        const response = await fetch(`/api/resume-data/resume/${resumeId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `API error: ${response.statusText}`
          );
        }
        const data: FullResumeData = await response.json();
        return data;
      } catch (error) {
        toast({
          title: "Failed to load resume details.",
          description:
            (error instanceof Error
              ? error.message
              : "An unknown error occurred.") + " Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Simulate Save Resume operation
  // const simulateSaveResume = useCallback(
  //   async (resumeData: FullResumeData): Promise<SaveResult> => {
  //     console.log("Simulating saving resume:", resumeData);
  //     return new Promise((resolve) => {
  //       setTimeout(() => {
  //         // In a real scenario, this would return the actual new resume_id if it's a new creation
  //         resolve({
  //           success: true,
  //           new_resume_id: `resume_${Date.now()}`,
  //           message: "Resume saved successfully!",
  //         });
  //       }, 1500);
  //     });
  //   },
  //   []
  // );

  // --- Effects ---

  // Effect to load user resumes on component mount and when creating new resume state changes

  useEffect(() => {
    const loadResumes = async () => {
      const resumes = await fetchUserResumesFromApi();

      if (resumes === undefined) {
        // This indicates a missing token, so clear states
        setUserResumes([]);
        setActiveResumeId(null);
        setCurrentEditingResume(null);
        return;
      }

      setUserResumes(resumes);

      // Logic to determine initial active resume
      if (isCreatingNewResume) {
        // If we are explicitly in new creation mode, activate the placeholder
        setActiveResumeId("new_resume_placeholder");
      } else if (resumes.length > 0) {
        // If there are existing resumes and not in new creation mode, select the first one
        setActiveResumeId(resumes[0].resume_id);
      } else {
        // No resumes found, not in new creation mode, so nothing is active
        setActiveResumeId(null);
        setCurrentEditingResume(null);
      }
    };
    loadResumes();
  }, [isCreatingNewResume, fetchUserResumesFromApi]);

  // Effect to handle template selection from parent (CreateResume)
  useEffect(() => {
    if (selectedTemplateIdForCreation !== null) {
      setNewResumeTemplateId(selectedTemplateIdForCreation);
      setNewResumeTemplateName(selectedTemplateNameForCreation);
      setIsCreatingNewResume(true); // Activate new resume creation flow
      setActiveResumeId("new_resume_placeholder"); // A temporary ID for the new resume being built
      setCurrentEditingResume({
        resume_id: "new_resume_placeholder", // This will be replaced on actual save
        template_id: selectedTemplateIdForCreation,
        display_name: `New Resume (${
          selectedTemplateNameForCreation ||
          "Template " + selectedTemplateIdForCreation
        })`,
        sections: {}, // Start with empty sections
      });
      toast({
        title: "New Resume Initiated",
        description: `Ready to create new resume with template: ${selectedTemplateNameForCreation}. Click 'Save Resume' to finalize.`,
      });
    }
  }, [selectedTemplateIdForCreation, selectedTemplateNameForCreation, toast]);

  // Effect to load the full resume data when activeResumeId changes
  useEffect(() => {
    const loadFullResumeData = async () => {
      if (activeResumeId && activeResumeId !== "new_resume_placeholder") {
        const resumeData = await fetchFullResumeFromApi(activeResumeId);
        if (resumeData) {
          setCurrentEditingResume(resumeData);
        } else {
          setCurrentEditingResume(null);
        }
      } else if (activeResumeId === "new_resume_placeholder") {
        // If it's a new resume placeholder and currentEditingResume isn't set for it yet, or needs update
        if (
          !currentEditingResume ||
          currentEditingResume.resume_id !== "new_resume_placeholder" ||
          currentEditingResume.template_id !== (newResumeTemplateId || 0)
        ) {
          setCurrentEditingResume({
            resume_id: "new_resume_placeholder",
            template_id: newResumeTemplateId || 0,
            display_name: newResumeTemplateName
              ? `New Resume (${newResumeTemplateName})`
              : "New Unnamed Resume",
            sections: {},
          });
        }
      } else if (!activeResumeId) {
        setCurrentEditingResume(null); // No resume active
      }
    };
    loadFullResumeData();
  }, [
    activeResumeId,
    fetchFullResumeFromApi,
    newResumeTemplateId,
    newResumeTemplateName,
  ]); // Add currentEditingResume back for proper new resume init state.

  // --- Handlers ---

  const handleCreateNewResume = () => {
    // Instead of initializing a new resume here, we navigate to the template selection
    setIsCreatingNewResume(true);
    setNewResumeTemplateId(null);
    setNewResumeTemplateName(null);
    setActiveResumeId("new_resume_placeholder"); // Temporarily set active to represent new creation flow
    setCurrentEditingResume(null); // Clear current editing resume as we are about to choose a template
    onNavigateToChooseTemplate(); // Notify parent to change tab
    toast({
      description: "Please choose a template to start your new resume.",
    });
  };

  const handleSaveResume = async () => {
    if (!currentEditingResume || !currentEditingResume.resume_id) {
      toast({ description: "No resume data to save.", variant: "destructive" });
      return;
    }
    // For a new resume, ensure a real template_id is set
    if (
      currentEditingResume.resume_id === "new_resume_placeholder" &&
      !currentEditingResume.template_id
    ) {
      toast({
        description: "Please select a template before saving a new resume.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your resume.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the new API endpoint
      const response = await fetch("/api/resume-data/save-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currentEditingResume),
      });

      const result: SaveResult = await response.json();

      if (response.ok && result.success) {
        toast({
          title: result.message || "Resume saved successfully!",
          variant: "default",
        });

        // If it was a new resume, update the state with the real ID
        if (currentEditingResume.resume_id === "new_resume_placeholder") {
          const newRealResumeId = result.new_resume_id;
          if (newRealResumeId) {
            // Fetch the newly saved resume data to ensure state is fully updated
            const updatedResumeData = await fetchFullResumeFromApi(
              newRealResumeId
            );

            if (updatedResumeData) {
              // Add the new resume summary to the list
              const newResumeSummary: UserResumeSummary = {
                resume_id: newRealResumeId,
                template_id: updatedResumeData.template_id, // Use template_id from fetched data
                display_name: updatedResumeData.display_name, // Use display_name from fetched data
              };
              // Prevent adding duplicates if the fetchUserResumes effect runs concurrently
              setUserResumes((prev) => {
                if (
                  prev.some((resume) => resume.resume_id === newRealResumeId)
                ) {
                  return prev;
                }
                return [...prev, newResumeSummary];
              });

              setActiveResumeId(newRealResumeId);
              setCurrentEditingResume(updatedResumeData); // Set the fetched data as current
              setIsCreatingNewResume(false); // Exit new creation mode after successful save
              setNewResumeTemplateId(null);
              setNewResumeTemplateName(null);
            } else {
              // Fallback if fetching the new resume fails
              toast({
                description: "Resume saved, but failed to load updated data.",
                variant: "destructive",
              });
              // Attempt to update state with minimal info
              const newResumeSummary: UserResumeSummary = {
                resume_id: newRealResumeId,
                template_id: currentEditingResume.template_id,
                display_name: currentEditingResume.display_name,
              };
              setUserResumes((prev) => {
                if (
                  prev.some((resume) => resume.resume_id === newRealResumeId)
                ) {
                  return prev;
                }
                return [...prev, newResumeSummary];
              });
              setActiveResumeId(newRealResumeId);
              setIsCreatingNewResume(false);
              setNewResumeTemplateId(null);
              setNewResumeTemplateName(null);
              setCurrentEditingResume((prev) =>
                prev ? { ...prev, resume_id: newRealResumeId } : null
              );
            }
          } else {
            toast({
              description: "Error: New resume ID not returned from save.",
              variant: "destructive",
            });
          }
        }
      } else {
        // If updating an existing resume, refetch its data to ensure state is fresh
        const updatedResumeData = await fetchFullResumeFromApi(
          currentEditingResume.resume_id
        );
        if (updatedResumeData) {
          setCurrentEditingResume(updatedResumeData);
        } else {
          toast({
            description: "Resume saved, but failed to refresh data.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        description: "An error occurred while saving the resume.",
        variant: "destructive",
      });
    }
  };

  const getSectionCompleteness = (sectionId: string): boolean => {
    const content = currentEditingResume?.sections[sectionId];
    if (!content) return false;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.length > 0;
      }
    } catch (e) {
      // Not JSON, treat as string
    }
    return content.trim().length > 0;
  };

  // Helper function to format section content for display (EXTENDED)
  const formatSectionContentForDisplay = (
    sectionId: string,
    content: string
  ): React.ReactNode => {
    // <--- Changed return type
    if (!content)
      return <p className="text-gray-500 italic">No content yet.</p>; // Better empty state

    try {
      const parsed = JSON.parse(content);

      switch (sectionId) {
        case "header": {
          const personalInfo: PersonalInfoData = parsed;
          return (
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Name:
                </span>{" "}
                {personalInfo.name || "N/A"}
              </p>
              {personalInfo.address && (
                <p>
                  <span className="font-semibold">Address:</span>{" "}
                  {personalInfo.address}
                </p>
              )}
              {personalInfo.email && (
                <p>
                  <span className="font-semibold">Email/Social:</span>{" "}
                  {personalInfo.email}
                </p>
              )}
              {personalInfo.site && (
                <p>
                  <span className="font-semibold">Website:</span>{" "}
                  <a
                    href={personalInfo.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {personalInfo.site}
                  </a>
                </p>
              )}
            </div>
          );
        }

        case "summary": {
          const summaryData: SummaryData = parsed;
          const textToDisplay =
            summaryData && typeof summaryData.text === "string"
              ? summaryData.text
              : content;
          return (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {textToDisplay}
            </p>
          );
        }
        case "history": {
          // Assuming parsed is Array<Array<string | string[]>> as per our previous discussion
          const historyItemsRaw: Array<Array<string | string[]>> = parsed;
          const historyItems: ProfessionalHistoryItem[] = historyItemsRaw.map(
            (itemArray) => ({
              duration: typeof itemArray[0] === "string" ? itemArray[0] : "N/A",
              title: typeof itemArray[1] === "string" ? itemArray[1] : "N/A",
              location: typeof itemArray[2] === "string" ? itemArray[2] : "N/A",
              responsibilities: Array.isArray(itemArray[3]) ? itemArray[3] : [],
            })
          );

          if (historyItems.length === 0)
            return (
              <p className="text-gray-500 italic">
                No professional history entries.
              </p>
            );

          return (
            <div className="space-y-4">
              {historyItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <CardHeader className="p-0 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {item.title}
                    </h6>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.duration} | {item.location}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    {item.responsibilities &&
                    item.responsibilities.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        {item.responsibilities.map((resp, i) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        No responsibilities listed.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        }

        case "education": {
          const educationItems: EducationItem[] = parsed;
          if (educationItems.length === 0)
            return (
              <p className="text-gray-500 italic">No education entries.</p>
            );
          return (
            <div className="space-y-4">
              {educationItems.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <CardHeader className="p-0 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {item.degree}
                    </h6>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.institution} | {item.duration}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    {item.dissertation && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Dissertation:</span>{" "}
                        {item.dissertation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        }

        case "research": {
          const researchInterests: ResearchInterestsData = parsed;
          if (
            !researchInterests.interests ||
            researchInterests.interests.length === 0
          )
            return (
              <p className="text-gray-500 italic">
                No research interests listed.
              </p>
            );
          return (
            <div className="flex flex-wrap gap-2">
              {researchInterests.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          );
        }

        case "publications": {
          const publications: PublicationItem[] = parsed;
          if (publications.length === 0)
            return (
              <p className="text-gray-500 italic">No publications listed.</p>
            );
          return (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {publications.map((item, idx) => (
                <li key={idx}>{item.text}</li>
              ))}
            </ul>
          );
        }

        case "certifications": {
          const certSkills: CertificationSkillItem[] = parsed;
          if (certSkills.length === 0)
            return (
              <p className="text-gray-500 italic">
                No certifications or skills listed.
              </p>
            );
          return (
            <div className="space-y-4">
              {certSkills.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <CardHeader className="p-0 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {item.certification}
                    </h6>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    {item.skills && item.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        No skills listed for this certification.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        }

        case "honors": {
          const honors: HonorAwardItem[] = parsed;
          if (honors.length === 0)
            return (
              <p className="text-gray-500 italic">
                No honors or awards listed.
              </p>
            );
          return (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {honors.map((item, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{item.award}</span> from{" "}
                  {item.issuer}
                </li>
              ))}
            </ul>
          );
        }

        case "memberships": {
          const memberships: MembershipItem[] = parsed;
          if (memberships.length === 0)
            return (
              <p className="text-gray-500 italic">No memberships listed.</p>
            );
          return (
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {memberships.map((item, idx) => (
                <li key={idx}>
                  <span className="font-semibold">{item.organization}</span> (
                  {item.duration})
                </li>
              ))}
            </ul>
          );
        }

        case "hobbies": {
          const hobbiesData: InterestsHobbiesData = parsed;
          if (!hobbiesData.hobbies || hobbiesData.hobbies.length === 0)
            return (
              <p className="text-gray-500 italic">
                No hobbies or interests listed.
              </p>
            );
          return (
            <div className="flex flex-wrap gap-2">
              {hobbiesData.hobbies.map((hobby, idx) => (
                <span
                  key={idx}
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {hobby}
                </span>
              ))}
            </div>
          );
        }

        case "reference": {
          const references: ReferenceItem[] = parsed;
          if (references.length === 0)
            return (
              <p className="text-gray-500 italic">No references listed.</p>
            );
          return (
            <div className="space-y-4">
              {references.map((item, idx) => (
                <Card
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  <CardHeader className="p-0 pb-2 border-b border-gray-200 dark:border-gray-600">
                    <h6 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {item.nameTitle}
                    </h6>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.organization}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.contact}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          );
        }

        default:
          // For unknown or simple string content, wrap in a readable paragraph
          return (
            <p className="whitespace-pre-wrap text-wrap text-sm text-gray-700 dark:text-gray-300">
              {content}
            </p>
          );
      }
    } catch (e) {
      // If content is not valid JSON, display it as a readable paragraph
      return (
        <p className="whitespace-pre-wrap text-wrap text-red-500 italic text-sm">
          Error parsing content or invalid JSON: {content}
        </p>
      );
    }
  };

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

  return (
    <div className="p-6">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Resumes
        </h2>
        {/* Conditionally render "Create New Resume" or "Save Resume" button */}
        {!isCreatingNewResume ? (
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateNewResume}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Resume
          </Button>
        ) : (
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSaveResume}
          >
            <Download className="h-4 w-4 mr-2" />
            Save Resume
          </Button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                My Documents
              </h3>
            </div>
            <div className="p-0">
              <Tabs
                defaultValue={activeResumeId || "no_resume_selected"}
                value={activeResumeId || "no_resume_selected"}
                onValueChange={(value) => {
                  if (value === "new_resume_placeholder") {
                    setIsCreatingNewResume(true);
                    setActiveResumeId("new_resume_placeholder");
                  } else {
                    // Only exit new creation mode if selecting an existing resume
                    // This prevents flickering if the user just created a new resume and it becomes active
                    if (isCreatingNewResume && value !== activeResumeId) {
                      setIsCreatingNewResume(false);
                    }
                    setNewResumeTemplateId(null);
                    setNewResumeTemplateName(null);
                    setActiveResumeId(value);
                  }
                }}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col w-full rounded-none border-none bg-transparent h-auto">
                  {/* Message when no resumes and not creating */}
                  {userResumes.length === 0 && !isCreatingNewResume && (
                    <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                      No resumes found. Click "Create New Resume" to start!
                    </div>
                  )}

                  {/* List existing resumes */}
                  {userResumes.map((resume) => (
                    <TabsTrigger
                      key={resume.resume_id}
                      value={resume.resume_id}
                      className={`justify-start w-full py-3 px-5 text-left border-l-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-purple-50 data-[state=active]:dark:bg-purple-900/20 rounded-none
                        ${
                          activeResumeId === resume.resume_id
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }
                      `}
                    >
                      {resume.display_name}
                    </TabsTrigger>
                  ))}

                  {/* Temporary tab for the new resume being created */}
                  {isCreatingNewResume && (
                    <TabsTrigger
                      key="new_resume_placeholder"
                      value="new_resume_placeholder"
                      className={`justify-start w-full py-3 px-5 text-left border-l-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-purple-50 data-[state=active]:dark:bg-purple-900/20 rounded-none
                        ${
                          activeResumeId === "new_resume_placeholder"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }
                    `}
                    >
                      {newResumeTemplateName
                        ? `New Resume (${newResumeTemplateName})`
                        : "New Unnamed Resume"}
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
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
            <div className="p-5 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {currentEditingResume?.display_name ||
                    "Select or Create Resume"}
                </h3>
                {currentEditingResume &&
                currentEditingResume.resume_id !== "new_resume_placeholder" &&
                currentEditingResume.template_id ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Template ID: {currentEditingResume.template_id}
                  </p>
                ) : currentEditingResume &&
                  currentEditingResume.resume_id === "new_resume_placeholder" &&
                  currentEditingResume.template_id === 0 ? (
                  <p className="text-sm text-amber-500 dark:text-amber-400">
                    Please choose a template from the "Choose Template" tab.
                  </p>
                ) : currentEditingResume &&
                  currentEditingResume.resume_id === "new_resume_placeholder" &&
                  currentEditingResume.template_id ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Template ID: {currentEditingResume.template_id} (New Resume)
                  </p>
                ) : null}

                {currentEditingResume && currentEditingResume.created_at && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created At:{" "}
                    {new Date(
                      currentEditingResume.created_at
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
              {currentEditingResume && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                  {
                    resumeSectionsConfig.filter((section) =>
                      getSectionCompleteness(section.id)
                    ).length
                  }
                  /{resumeSectionsConfig.length} Complete
                </div>
              )}
            </div>

            <div className="p-5">
              {currentEditingResume ? (
                <>
                  <div className="flex space-x-4 mb-6">
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({
                          description: "Edit functionality coming soon!",
                          variant: "default",
                        })
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveResume}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Save Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toast({
                          description: "Download functionality coming soon!",
                          variant: "default",
                        })
                      }
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Download Final
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toast({
                          description: "Preview functionality coming soon!",
                          variant: "default",
                        })
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        toast({
                          description: "Delete functionality coming soon!",
                          variant: "destructive",
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
                    {resumeSectionsConfig.map((section) => (
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
                            <Card className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {section.title}
                                  </h5>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {getSectionCompleteness(section.id)
                                      ? "Complete"
                                      : "Not complete"}
                                  </p>
                                </div>
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    getSectionCompleteness(section.id)
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
                              <DialogTitle>{section.title}</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              {editingSectionId === section.id ? (
                                // Render the specific form component based on section.id
                                // Make sure currentEditingResume and sections[section.id] exist before parsing
                                currentEditingResume &&
                                currentEditingResume.sections[section.id] !==
                                  undefined ? (
                                  (() => {
                                    const initialJsonString =
                                      currentEditingResume.sections[
                                        section.id
                                      ] || "[]"; // Default to empty array string for list-based sections
                                    const initialString =
                                      currentEditingResume.sections[
                                        section.id
                                      ] || ""; // Default to empty string for text-based sections
                                    const parsedData = initialJsonString
                                      ? initialJsonString
                                      : "";

                                    const onSaveHandler = (updatedData) => {
                                      // updatedData's type needs to be specified correctly
                                      setCurrentEditingResume((prev) => {
                                        if (!prev) return null;
                                        return {
                                          ...prev,
                                          sections: {
                                            ...prev.sections,
                                            [section.id]:
                                              JSON.stringify(updatedData), // updatedData is now ProfessionalHistorySaveData
                                          },
                                        };
                                      });
                                      setEditingSectionId(null);
                                      toast({
                                        description: `${section.title} updated! Remember to save the resume.`,
                                        variant: "default",
                                      });
                                    };

                                    const onCancelHandler = () =>
                                      setEditingSectionId(null);

                                    switch (section.id) {
                                      case "header":
                                        return (
                                          <PersonalInfoForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "summary":
                                        return (
                                          <SummaryForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "history":
                                        return (
                                          <ProfessionalHistoryForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "education":
                                        return (
                                          <EducationForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "research":
                                        return (
                                          <ResearchInterestsForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "publications":
                                        return (
                                          <PublicationsForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "certifications":
                                        return (
                                          <CertificationsSkillsForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "honors":
                                        return (
                                          <HonorsAwardsForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "memberships":
                                        return (
                                          <MembershipsForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "hobbies":
                                        return (
                                          <InterestsHobbiesForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      case "reference":
                                        return (
                                          <ReferencesForm
                                            initialData={parsedData}
                                            onSave={onSaveHandler}
                                            onCancel={onCancelHandler}
                                          />
                                        );
                                      default:
                                        return (
                                          <div className="space-y-4">
                                            <p className="text-gray-500">
                                              Editing functionality for this
                                              section is not yet implemented.
                                              Displaying raw content:
                                            </p>
                                            <pre className="whitespace-pre-wrap text-wrap bg-gray-100 p-3 rounded dark:bg-gray-700">
                                              {
                                                currentEditingResume.sections[
                                                  section.id
                                                ]
                                              }
                                            </pre>
                                            <div className="flex justify-end">
                                              <Button
                                                variant="outline"
                                                onClick={onCancelHandler}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                    }
                                  })()
                                ) : (
                                  <p className="text-gray-500">
                                    No data available to edit for this section.
                                  </p>
                                )
                              ) : // Display content when not in editing mode
                              currentEditingResume?.sections[section.id] ? (
                                formatSectionContentForDisplay(
                                  section.id,
                                  currentEditingResume.sections[section.id]
                                )
                              ) : (
                                <p className="text-gray-500">
                                  This section is empty. Click "Edit Section" to
                                  add content.
                                </p>
                              )}
                            </div>
                            <div className="flex justify-end">
                              {editingSectionId !== section.id && (
                                <Button
                                  onClick={() =>
                                    setEditingSectionId(section.id)
                                  }
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Section
                                </Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </motion.div>
                    ))}
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">
                    Select an existing resume from the left or click "Create New
                    Resume" to start.
                  </p>
                  <p>
                    Or, choose a template from the "Choose Template" tab to
                    begin a new resume.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MyResumes;
