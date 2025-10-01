export interface UserPreferences {
  country: string | { id: string | number; name: string } | null;
  level: string | null;
  program: string | null;
  areaOfStudy: {
    id: string;
    name: string;
  } | null;
  programDetails?: {
    id: string;
    name: string;
  };
  countryDetails?: {
    id: string;
    name: string;
    states?: Array<{
      id: string;
      name: string;
    }>;
  };
  englishTest?: string | null; // Add this
  englishScore?: string | null; // Add this
  gpa?: string | null; // Add this

  availableAreasOfStudy?: Array<{
    id: string;
    name: string;
  }>;
  availablePrograms?: Array<{
    id: string;
    name: string;
  }>;
  appliedFilters?: {
    country: boolean;
    level: boolean;
    areaOfStudy: boolean;
    program: boolean;
  };
  availableCountries?: Array<{
    country: string | number; // قبلاً: id
    name: string;
  }>;
}

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;
}
export type AvailableCountry = {
  id: string | number;
  country: string | number;
  name: string;
};

export type AvailableAreaOfStudy = {
  id: string | number;
  name: string;
};

export type AvailableProgram = {
  id: string | number;
  name: string;
};
export type DialogProfessor = {
  id: number;
  name: string;
  title: string;
  email?: string;
  research: string[];
};
export type ProfessorFilterState = {
  page: number;
  limit: number;
  country?: string;
  state?: string;
  program?: string;
  areaOfStudy?: string;
  degreeLevel?: string;
  researchInterest?: string;
  title?: string;

  // ... سایر فیلترهایی که ممکن است داشته باشید
};
export type AvailableOptionsState = {
  availableCountries?: []; // یا نوع دقیق‌تر آن
  availableAreasOfStudy?: [];
  availablePrograms?: [];
};
export type FiltersState = {
  country?: string;
  state?: string[]; // ✅ multi
  school?: string;
  degreeLevel?: string;
  areaOfStudy?: string[]; // ✅ multi
  program?: string[]; // ✅ multi
  orderBy?: string;
};
