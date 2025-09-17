
export interface TutorialVideo {
  id: number;
  title: string;
  duration: string;
  thumbnail?: string;
  description?: string;
}

export const videoTutorialsData: TutorialVideo[] = [
  { 
    id: 1, 
    title: "Profile Setup", 
    duration: "06:27",
    description: "Learn how to set up your profile with all the necessary details to maximize your chances of university admission. This comprehensive guide covers personal information, academic background, test scores, and preferences."
  },
  { 
    id: 2, 
    title: "Find Schools", 
    duration: "03:36",
    description: "Discover how to use our advanced search features to find schools that match your preferences, academic profile, and career goals. Learn about filters, rankings, and how to compare institutions."
  },
  { 
    id: 3, 
    title: "Find Programs", 
    duration: "03:51",
    description: "Navigate through thousands of academic programs to find your perfect match. This tutorial shows how to filter by discipline, degree level, and specific requirements that align with your background."
  },
  { 
    id: 4, 
    title: "Find Professors", 
    duration: "03:31",
    description: "Learn how to research and connect with professors whose research interests align with yours. This tutorial covers how to find faculty members, review their work, and approach them appropriately."
  },
  { 
    id: 5, 
    title: "Create Resume", 
    duration: "03:19",
    description: "Follow this step-by-step guide to creating a standout academic resume using our AI-powered tools. Learn how to highlight your strengths and tailor your resume for academic admissions."
  },
  { 
    id: 6, 
    title: "Create SOP", 
    duration: "06:23",
    description: "Master the art of writing an effective Statement of Purpose with our guided process. Learn how to structure your story, emphasize your motivation, and connect your background to your future goals."
  },
  { 
    id: 7, 
    title: "Create LOR", 
    duration: "05:07",
    description: "Get detailed instructions on how to request and manage Letters of Recommendation through our platform. Learn best practices for selecting recommenders and providing them with the information they need."
  },
  { 
    id: 8, 
    title: "Apply Now", 
    duration: "02:58",
    description: "Walk through the complete application submission process, from document uploads to fee payments. This tutorial ensures you don't miss any critical steps in finalizing your university applications."
  }
];
