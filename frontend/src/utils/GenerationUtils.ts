
import { useState } from "react";

export type DocumentType = "sop" | "cv";

export interface GenerationStep {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox";
  options?: { value: string; label: string }[];
  placeholder?: string;
  value: string;
  required?: boolean;
}

// SOP Generation Steps
export const getSopSteps = (): GenerationStep[] => [
  {
    id: "basic",
    title: "Basic Information",
    description: "Let's start with some basic information about your application",
    complete: false,
    fields: [
      {
        id: "country",
        label: "Country",
        type: "select",
        options: [
          { value: "usa", label: "United States" },
          { value: "canada", label: "Canada" },
          { value: "uk", label: "United Kingdom" },
          { value: "australia", label: "Australia" },
          { value: "germany", label: "Germany" }
        ],
        value: "",
        required: true
      },
      {
        id: "program",
        label: "Program",
        type: "text",
        placeholder: "e.g., Computer Science, Data Science",
        value: "",
        required: true
      },
      {
        id: "level",
        label: "Level",
        type: "select",
        options: [
          { value: "masters", label: "Masters" },
          { value: "phd", label: "PhD" },
          { value: "undergrad", label: "Undergraduate" }
        ],
        value: "",
        required: true
      },
      {
        id: "university",
        label: "University",
        type: "text",
        placeholder: "e.g., Stanford University",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "hook",
    title: "Introduction/Hook",
    description: "Create a compelling introduction for your Statement of Purpose",
    complete: false,
    fields: [
      {
        id: "hook",
        label: "What unique story, quote, or idea would you like to start with?",
        type: "textarea",
        placeholder: "Share something interesting that captures attention...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "research",
    title: "Research Background",
    description: "Tell us about your research experience and interests",
    complete: false,
    fields: [
      {
        id: "researchExperience",
        label: "Do you have any research experience or publications?",
        type: "textarea",
        placeholder: "Describe your research experience in detail...",
        value: "",
        required: false
      },
      {
        id: "researchInterests",
        label: "What topics are you passionate about researching?",
        type: "textarea",
        placeholder: "Share your research interests...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "challenges",
    title: "Challenges",
    description: "Share any challenges you've faced (optional)",
    complete: false,
    fields: [
      {
        id: "challenges",
        label: "Have you faced any major academic or personal challenges?",
        type: "textarea",
        placeholder: "Share any challenges and how you overcame them...",
        value: "",
        required: false
      }
    ]
  },
  {
    id: "motivation",
    title: "Motivation",
    description: "What drives you to pursue this field?",
    complete: false,
    fields: [
      {
        id: "fieldMotivation",
        label: "Why are you pursuing this field/program?",
        type: "textarea",
        placeholder: "Share your motivation for this specific field...",
        value: "",
        required: true
      },
      {
        id: "inspiration",
        label: "Who or what inspired you?",
        type: "textarea",
        placeholder: "Tell us about your inspiration...",
        value: "",
        required: false
      }
    ]
  },
  {
    id: "goals",
    title: "Goals",
    description: "What are your academic and professional goals?",
    complete: false,
    fields: [
      {
        id: "shortTermGoals",
        label: "What are your short-term goals?",
        type: "textarea",
        placeholder: "Goals for the next 1-2 years...",
        value: "",
        required: true
      },
      {
        id: "longTermGoals",
        label: "What are your long-term goals?",
        type: "textarea",
        placeholder: "Goals for the next 5-10 years...",
        value: "",
        required: true
      },
      {
        id: "programFit",
        label: "How will this program help you achieve these goals?",
        type: "textarea",
        placeholder: "Explain how this program aligns with your goals...",
        value: "",
        required: true
      }
    ]
  }
];

// CV Generation Steps
export const getCvSteps = (): GenerationStep[] => [
  {
    id: "research",
    title: "Research Interests",
    description: "What areas of research are you interested in?",
    complete: false,
    fields: [
      {
        id: "researchInterests",
        label: "Research Interests",
        type: "textarea",
        placeholder: "Describe your research interests in detail...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "education",
    title: "Education",
    description: "Tell us about your educational background",
    complete: false,
    fields: [
      {
        id: "education",
        label: "Education",
        type: "textarea",
        placeholder: "List your degrees, institutions, years, and GPAs...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "publications",
    title: "Publications",
    description: "List any publications you have authored or co-authored",
    complete: false,
    fields: [
      {
        id: "publications",
        label: "Publications",
        type: "textarea",
        placeholder: "List in format: Authors, Title, Journal/Conference, Year...",
        value: "",
        required: false
      }
    ]
  },
  {
    id: "experience",
    title: "Work Experience",
    description: "Share your relevant work or teaching experience",
    complete: false,
    fields: [
      {
        id: "experience",
        label: "Work/Teaching Experience",
        type: "textarea",
        placeholder: "List positions, organizations, dates, and responsibilities...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "skills",
    title: "Skills & Tools",
    description: "What technical skills and tools do you have?",
    complete: false,
    fields: [
      {
        id: "skills",
        label: "Skills & Technical Tools",
        type: "textarea",
        placeholder: "List programming languages, software, lab techniques...",
        value: "",
        required: true
      }
    ]
  },
  {
    id: "certifications",
    title: "Certifications & Languages",
    description: "List any certifications and language proficiencies",
    complete: false,
    fields: [
      {
        id: "certifications",
        label: "Certifications",
        type: "textarea",
        placeholder: "List certifications, issuing organizations, and dates...",
        value: "",
        required: false
      },
      {
        id: "languages",
        label: "Languages",
        type: "textarea",
        placeholder: "List languages and proficiency levels...",
        value: "",
        required: false
      }
    ]
  },
  {
    id: "conferences",
    title: "Conferences & Presentations",
    description: "Have you participated in any conferences or given presentations?",
    complete: false,
    fields: [
      {
        id: "conferences",
        label: "Conferences & Presentations",
        type: "textarea",
        placeholder: "List conferences, presentations, dates, and locations...",
        value: "",
        required: false
      }
    ]
  },
  {
    id: "awards",
    title: "Awards & Honors",
    description: "Tell us about any academic or professional awards you've received",
    complete: false,
    fields: [
      {
        id: "awards",
        label: "Awards & Honors",
        type: "textarea",
        placeholder: "List awards, organizations, and dates...",
        value: "",
        required: false
      }
    ]
  }
];

export const useGenerationProcess = (documentType: DocumentType) => {
  const [steps, setSteps] = useState<GenerationStep[]>(documentType === 'sop' ? getSopSteps() : getCvSteps());
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generatedDocument, setGeneratedDocument] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  
  const updateField = (fieldId: string, value: string) => {
    setSteps(currentSteps => 
      currentSteps.map(step => 
        step.id === currentStep.id 
          ? {
              ...step,
              fields: step.fields.map(field => 
                field.id === fieldId ? { ...field, value } : field
              )
            }
          : step
      )
    );
  };
  
  const generateDocument = async () => {
    setIsGenerating(true);
    
    // Mark current step as complete
    setSteps(currentSteps => 
      currentSteps.map(step => 
        step.id === currentStep.id ? { ...step, complete: true } : step
      )
    );
    
    // In a real app, this would call an API to generate the document
    // For demo purposes, we'll just simulate it with a timeout
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a simple document based on the answers so far
    const stepsWithAnswers = steps.map(step => {
      return {
        title: step.title,
        fields: step.fields.map(field => {
          return {
            label: field.label,
            value: field.value || "(Not provided)"
          };
        })
      };
    });
    
    let document = "";
    
    if (documentType === 'sop') {
      document = `# Statement of Purpose\n\n`;
      stepsWithAnswers.forEach(step => {
        document += `## ${step.title}\n`;
        step.fields.forEach(field => {
          document += `${field.label}: ${field.value}\n\n`;
        });
      });
    } else {
      document = `# Academic CV\n\n`;
      stepsWithAnswers.forEach(step => {
        document += `## ${step.title}\n`;
        step.fields.forEach(field => {
          document += `${field.label}: ${field.value}\n\n`;
        });
      });
    }
    
    setGeneratedDocument(document);
    setIsGenerating(false);
  };
  
  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  
  return {
    steps,
    currentStep,
    currentStepIndex,
    totalSteps,
    generatedDocument,
    isGenerating,
    updateField,
    generateDocument,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep
  };
};
