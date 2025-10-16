export type ProfileStep =
  | "citizenship"
  | "education"
  | "goals"
  | "language"
  | "tests"
  | "priorities"
  | "financial"
  | "programs"
  | "complete";

export interface Step {
  id: string;
  title: string;
  icon: string;
}

export interface CitizenshipData {
  country: string;
  residence: string;
}
export interface EducationItem {
  degree: string;
  university: string;
  major: string;
  gpa: string;
  startYear?: string;
  endYear?: string;
}

export interface EducationBlocks {
  items: EducationItem[];
}
export type CountryOpt = { id: string; name: string; code?: string };
export type Option = { id: string; name: string };
export interface GoalsData {
  country: "" | { id: string; name: string };
  level: string;
  field: "" | { id: string; name: string };
  availableFields?: Array<{ id: string; name: string }>;
}

export interface LanguageData {
  test: string;
  score: string;
}

export interface TestData {
  type: string;
  scores: Record<string, any>;
}

export interface PrioritiesData {
  options: string[];
}

export interface FinancialData {
  requiresFunding: boolean;
  budget: string;
}

export interface ProgramsData {
  count: number;
}

export interface StepData {
  citizenship: CitizenshipData;
  education: { items: EducationItem[] };
  goals: GoalsData;
  language: LanguageData;
  tests: TestData;
  priorities: PrioritiesData;
  financial: FinancialData;
  programs: ProgramsData;
}

export interface ProfileCompleteProps {
  onNext: (data: any) => void;
  profileData: StepData;
  applicationType: string;
}
