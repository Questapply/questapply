export interface PersonalInfoData {
  name: string;
  address: string;
  email: string;
  site: string;
}

export interface SummaryData {
  text: string; // Summary is a single block of text
}

export interface ProfessionalHistoryItem {
  duration: string;
  title: string;
  location: string;
  responsibilities: string[];
}

export interface EducationItem {
  duration: string; // e.g., "June 2021 - Sep 2025"
  degree: string;   // e.g., "Ph.D. In Computer"
  institution: string; // e.g., "MIT University"
  dissertation?: string; // e.g., "Dessertation : \"AI Algorithms for Enhancing Cybersecurity applications\""
}

export interface ResearchInterestsData {
  interests: string[]; // List of strings
}

export interface PublicationItem {
  text: string; // Full publication string
}

export interface CertificationSkillItem {
  certification: string; // e.g., "Certified Information Systems Professional (CISSP) (ISC), April 2023"
  skills: string[];      // e.g., ["Proficient in Python...", "Experienced in machine learning..."]
}

export interface HonorAwardItem {
  award: string;  // e.g., "Outstanding Dissertation Award"
  issuer: string; // e.g., "Tech University , May 2024"
}

export interface MembershipItem {
  organization: string; // e.g., "IEEE"
  duration: string;     // e.g., "September 2022 – Present"
}

export interface InterestsHobbiesData {
  hobbies: string[]; // List of strings
}

export interface ReferenceItem {
  nameTitle: string;    // e.g., "Dr. Sarah Thompson - Associate Professor of Computer Science"
  organization: string; // e.g., "Department of Computer Science, MIT"
  contact: string;      // e.g., "+1 (617) 253-1234 - sarah.thompson@mit.edu"
}

// FullResumeData should then use these interfaces for its sections for better type safety
// (though the actual stored data will still be JSON strings)