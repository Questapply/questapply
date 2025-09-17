// SchoolFilters.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import isEqual from "lodash/isEqual";
import { FilterOption } from "../../types";
import {
  Filter,
  Flag,
  MapPin,
  GraduationCap,
  Book,
  Layers,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import FilterDropdown from "../filters/FilterDropdown";
import {
  countryOptions as defaultCountryOptions,
  usStatesOptions as defaultStatesOptions,
  degreeLevelOptions,
  areaOfStudyOptions as defaultAreaOfStudyOptions,
  orderBySchoolOptions,
  professorTitleOptions,
  filterIcons,
} from "../filters/FilterData";

import { UserPreferences } from "../../types";

interface SchoolFiltersProps {
  activeFilters?: string[];
  toggleFilter?: (filterId: string) => void;
  type?: "schools" | "professors";
  compact?: boolean;
  title?: string;
  onFilterChange?: (filters: Record<string, string>) => void;
  selectedFilters?: Record<string, string>;
  userPreferences?: UserPreferences | null;
  researchInterests?: string[];
  // **تغییرات اینجا:** پراپ ها را اختیاری (optional) می‌کنیم
  availableCountriesOptions?: FilterOption[]; // <-- اینجا تغییر کرد
  availableAreasOfStudyOptions?: FilterOption[]; // <-- اینجا تغییر کرد
  availableProgramsOptions?: FilterOption[]; // <-- اینجا تغییر کرد
  availableStatesOptions?: FilterOption[]; // <-- اینجا تغییر کرد
  loadingStates?: boolean;
}

interface SchoolOption {
  id: string;
  name: string;
}

interface ProgramOption {
  id: string;
  name: string;
}

const defaultProgramIdToNameMap: Record<string, string> = {
  "1": "Aerospace Engineering",
  "2": "Agricultural Engineering",
  "3": "Architectural Studies",
  "4": "Bio & Biomedical Engineering",
  "5": "Biotechnology and Bioinformatics & Computational Biology",
  "6": "Chemical and Environmental Engineering",
  "7": "Computer Science and Engineering, IT & Information",
  "8": "Computational Science and Engineering",
  "9": "Computer Science and Engineering, IT & Information",
  "10": "Earth Science and Engineering",
  "11": "Electrical & Computer Engineering",
};
//////////////////////////////////////////////
const SchoolFilters = ({
  toggleFilter = () => {},
  type = "schools",
  compact = false,
  onFilterChange = () => {},
  selectedFilters = {},
  userPreferences = null,
  researchInterests = [],
  // **تغییرات اینجا:** مقادیر پیش‌فرض برای پراپ‌های optional
  availableStatesOptions = [],
  loadingStates = false,
  availableCountriesOptions = [], // <-- اینجا اضافه شد
  availableAreasOfStudyOptions = [], // <-- اینجا اضافه شد
  availableProgramsOptions = [], // <-- اینجا اضافه شد
}: SchoolFiltersProps) => {
  console.log("SchoolFilters - selectedFilters received:", selectedFilters);
  const countryOptions = useMemo(() => {
    // **تغییر اینجا:** از optional chaining استفاده می‌کنیم
    return availableCountriesOptions?.length // <-- اینجا تغییر کرد
      ? availableCountriesOptions
      : defaultCountryOptions.map((option) => {
          if (typeof option === "string") {
            return { value: option, label: option } as FilterOption;
          }
          return option as FilterOption;
        });
  }, [availableCountriesOptions]);

  const areaOfStudyOptions = useMemo(() => {
    // **تغییر اینجا:** از optional chaining استفاده می‌کنیم
    return availableAreasOfStudyOptions?.length // <-- اینجا تغییر کرد
      ? availableAreasOfStudyOptions
      : defaultAreaOfStudyOptions.map((option) => {
          if (typeof option === "string") {
            return { value: option, label: option } as FilterOption;
          }
          return option as FilterOption;
        });
  }, [availableAreasOfStudyOptions]);

  const programOptions = useMemo(() => {
    const currentAreaOfStudyId = selectedFilters.areaOfStudy;
    const allAvailablePrograms = userPreferences?.availablePrograms || [];

    let optionsArray: FilterOption[] = [];

    if (currentAreaOfStudyId) {
      if (
        userPreferences?.availablePrograms?.length &&
        String(userPreferences.areaOfStudy?.id) === currentAreaOfStudyId
      ) {
        optionsArray = userPreferences.availablePrograms.map((p) => ({
          value: String(p.id),
          label: p.name,
        }));
      } else {
        optionsArray = Object.entries(defaultProgramIdToNameMap).map(
          ([id, name]) => ({
            value: id,
            label: name,
          })
        );
      }
    } else {
      if (userPreferences?.availablePrograms?.length) {
        optionsArray = userPreferences.availablePrograms.map((program) => ({
          value: String(program.id),
          label: program.name,
        }));
      } else {
        optionsArray = Object.entries(defaultProgramIdToNameMap).map(
          ([id, name]) => ({
            value: id,
            label: name,
          })
        );
      }
    }

    const currentSelectedProgramId = selectedFilters.program;
    if (
      currentSelectedProgramId &&
      !optionsArray.some((p) => p.value === currentSelectedProgramId)
    ) {
      const programFromUserPrefs = allAvailablePrograms.find(
        (p) => String(p.id) === currentSelectedProgramId
      );
      if (programFromUserPrefs) {
        optionsArray.unshift({
          value: String(programFromUserPrefs.id),
          label: programFromUserPrefs.name,
        });
      } else if (defaultProgramIdToNameMap[currentSelectedProgramId]) {
        optionsArray.unshift({
          value: currentSelectedProgramId,
          label: defaultProgramIdToNameMap[currentSelectedProgramId],
        });
      }
    }

    return optionsArray;
  }, [
    selectedFilters.program,
    selectedFilters.areaOfStudy,
    userPreferences?.availablePrograms,
    userPreferences?.areaOfStudy?.id,
  ]);

  const selectedProgramLabel = useMemo(() => {
    const selectedProgramId = selectedFilters.program;
    if (!selectedProgramId) return "";

    const foundInOptions = programOptions.find(
      (opt) => opt.value === selectedProgramId
    );
    if (foundInOptions) {
      return foundInOptions.label;
    }

    if (
      userPreferences?.programDetails?.id &&
      String(userPreferences.programDetails.id) === selectedProgramId &&
      userPreferences.programDetails.name
    ) {
      return userPreferences.programDetails.name;
    }

    if (defaultProgramIdToNameMap[selectedProgramId]) {
      return defaultProgramIdToNameMap[selectedProgramId];
    }

    return "";
  }, [
    selectedFilters.program,
    userPreferences?.programDetails,
    programOptions,
  ]);

  const [schoolList, setSchoolList] = useState<SchoolOption[]>([]);
  const [allProgramsList, setAllProgramsList] = useState<ProgramOption[]>([]);
  const [schoolSearchOpen, setSchoolSearchOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");

  const handleFilterSelect = useCallback(
    (filterName: string, value: string) => {
      console.log(
        "SchoolFilters: handleFilterSelect called. filterName:",
        filterName,
        "value:",
        value
      );
      const newFilters = { ...selectedFilters };
      if (value === "") {
        delete newFilters[filterName];
        if (filterName === "areaOfStudy" && newFilters.program) {
          delete newFilters.program;
        }
        if (filterName === "country" && newFilters.state) {
          delete newFilters.state;
        }
      } else {
        newFilters[filterName] = value;
        if (
          filterName === "country" &&
          selectedFilters.country !== value &&
          newFilters.state
        ) {
          delete newFilters.state;
        }
      }
      if (newFilters[filterName] === selectedFilters[filterName]) {
        console.log(
          "SchoolFilters: Filter value unchanged, skipping onFilterChange."
        );
        return;
      }
      if (!isEqual(selectedFilters, newFilters)) {
        console.log(
          "SchoolFilters: Calling onFilterChange with new filters:",
          newFilters
        );
        onFilterChange(newFilters);
      } else {
        console.log(
          "SchoolFilters: Filters are equal, skipping onFilterChange."
        );
      }
    },
    [onFilterChange, selectedFilters]
  );

  const handleSchoolSelect = useCallback(
    (schoolId: string) => {
      const newFilters = { ...selectedFilters, school: schoolId };
      onFilterChange(newFilters);
      setSchoolSearchOpen(false);
    },
    [onFilterChange, selectedFilters]
  );

  const handleSchoolSearch = useCallback((searchText: string) => {
    setSchoolSearch(searchText);
    if (searchText.length > 0) {
      // Implement search logic here
    } else {
      // Reset search
    }
  }, []);

  const filteredSchools = useMemo(() => {
    if (!schoolSearch) return schoolList;
    return schoolList.filter((school) =>
      school.name.toLowerCase().includes(schoolSearch.toLowerCase())
    );
  }, [schoolList, schoolSearch]);

  const selectedSchoolName = useMemo(() => {
    if (!selectedFilters.school) return "";
    const selected = schoolList.find(
      (school) => school.id === selectedFilters.school
    );
    return selected ? selected.name : "";
  }, [selectedFilters.school, schoolList]);

  const researchInterestOptions = useMemo<FilterOption[]>(() => {
    if (!researchInterests?.length) return []; // <-- اینجا هم تغییر کرد

    const processedInterests = researchInterests.reduce(
      (acc: string[], interest) => {
        if (!interest) return acc;

        const cleanInterest = interest.replace(/^s:\d+:"|"$/g, "");
        const interests = cleanInterest.split(",").map((i) => i.trim());

        return [...acc, ...interests];
      },
      []
    );

    return [...new Set(processedInterests)].sort().map((interest) => ({
      value: interest,
      label: interest,
    }));
  }, [researchInterests]);

  return (
    <motion.div
      className={`${compact ? "mb-4" : "mb-4"}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">
            Filters
          </h2>
        </div>
      )}

      <div
        className={`flex ${compact ? "flex-wrap gap-1" : "flex-wrap gap-2"}`}
      >
        <FilterDropdown
          label="Country"
          icon={<Flag className="h-4 w-4" />}
          options={countryOptions}
          onSelect={(value) => handleFilterSelect("country", value)}
          selectedValue={selectedFilters.country || ""}
          buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
        />

        <FilterDropdown
          label="State"
          icon={<MapPin className="h-4 w-4" />}
          options={availableStatesOptions}
          onSelect={(value) => handleFilterSelect("state", value)}
          selectedValue={selectedFilters.state || ""}
          buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
          disabled={
            loadingStates ||
            !selectedFilters.country ||
            availableStatesOptions.length === 0
          }
        />

        {type === "schools" ? (
          <>
            <FilterDropdown
              label="Degree Level"
              icon={<GraduationCap className="h-4 w-4" />}
              options={degreeLevelOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              onSelect={(value) => handleFilterSelect("degreeLevel", value)}
              selectedValue={selectedFilters.degreeLevel || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />

            <FilterDropdown
              label="Area of Study"
              icon={<Book className="h-4 w-4" />}
              options={areaOfStudyOptions}
              onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
              selectedValue={selectedFilters.areaOfStudy || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />

            <FilterDropdown
              label="Program"
              icon={<Layers className="h-4 w-4" />}
              options={programOptions}
              onSelect={(value) => handleFilterSelect("program", value)}
              selectedValue={selectedFilters.program || ""}
              selectedLabel={selectedProgramLabel}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
              disabled={!selectedFilters.areaOfStudy}
            />

            <FilterDropdown
              label="Order By"
              icon={<BarChart3 className="h-4 w-4" />}
              options={orderBySchoolOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              onSelect={(value) => handleFilterSelect("orderBy", value)}
              selectedValue={selectedFilters.orderBy || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />
          </>
        ) : (
          // Professor filters
          <>
            <FilterDropdown
              label="Area of Study"
              icon={<Book className="h-4 w-4" />}
              options={areaOfStudyOptions}
              onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
              selectedValue={selectedFilters.areaOfStudy || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />

            <FilterDropdown
              label="Programs"
              icon={<Layers className="h-4 w-4" />}
              options={programOptions}
              onSelect={(value) => handleFilterSelect("program", value)}
              selectedValue={selectedFilters.program || ""}
              selectedLabel={selectedProgramLabel}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />

            <FilterDropdown
              label="Research Interest"
              icon={<span>{filterIcons.researchInterest}</span>}
              options={researchInterestOptions}
              onSelect={(value) =>
                handleFilterSelect("researchInterest", value)
              }
              selectedValue={selectedFilters.researchInterest || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
              searchable={true}
            />

            <FilterDropdown
              label="Title"
              icon={<span>{filterIcons.title}</span>}
              options={professorTitleOptions.map((option) => ({
                value: option,
                label: option,
              }))}
              onSelect={(value) => handleFilterSelect("title", value)}
              selectedValue={selectedFilters.title || ""}
              buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
            />
          </>
        )}
      </div>
    </motion.div>
  );
};

// export default SchoolFilters;
/////////////////////////////////////
// const SchoolFilters = ({
//   toggleFilter = () => {},
//   type = "schools",
//   compact = false,
//   onFilterChange = () => {},
//   selectedFilters = {},
//   userPreferences = null,
//   researchInterests = [],
//   availableStatesOptions = [],
//   loadingStates = false,
//   availableCountriesOptions = [],
//   availableAreasOfStudyOptions = [],
//   availableProgramsOptions = [],
// }: SchoolFiltersProps) => {
//   console.log("SchoolFilters - selectedFilters received:", selectedFilters);

//   // Memoized Country options (from FindSchools or default)
//   const countryOptions = useMemo<FilterOption[]>(() => {
//     return availableCountriesOptions.length
//       ? availableCountriesOptions
//       : defaultCountryOptions.map((option) => {
//           if (typeof option === "string") {
//             return { value: option, label: option };
//           }
//           return option;
//         });
//   }, [availableCountriesOptions]);

//   // Memoized Area of Study options (from FindSchools or default)
//   const areaOfStudyOptions = useMemo<FilterOption[]>(() => {
//     return availableAreasOfStudyOptions.length
//       ? availableAreasOfStudyOptions
//       : defaultAreaOfStudyOptions.map((option) => {
//           if (typeof option === "string") {
//             return { value: option, label: option };
//           }
//           return option;
//         });
//   }, [availableAreasOfStudyOptions]);

//   // Memoized Program options (logic already exists, make sure it's robust)
//   const programOptions = useMemo<FilterOption[]>(() => {
//     const currentAreaOfStudyId = selectedFilters.areaOfStudy;
//     const allAvailablePrograms = userPreferences?.availablePrograms || [];

//     let optionsArray: FilterOption[] = [];

//     if (currentAreaOfStudyId) {
//       if (
//         userPreferences?.availablePrograms?.length &&
//         String(userPreferences.areaOfStudy?.id) === currentAreaOfStudyId
//       ) {
//         optionsArray = userPreferences.availablePrograms.map((p) => ({
//           value: String(p.id),
//           label: p.name,
//         }));
//       } else {
//         optionsArray = Object.entries(defaultProgramIdToNameMap).map(
//           ([id, name]) => ({
//             value: id,
//             label: name,
//           })
//         );
//       }
//     } else {
//       if (userPreferences?.availablePrograms?.length) {
//         optionsArray = userPreferences.availablePrograms.map((program) => ({
//           value: String(program.id),
//           label: program.name,
//         }));
//       } else {
//         optionsArray = Object.entries(defaultProgramIdToNameMap).map(
//           ([id, name]) => ({
//             value: id,
//             label: name,
//           })
//         );
//       }
//     }

//     const currentSelectedProgramId = selectedFilters.program;
//     if (
//       currentSelectedProgramId &&
//       !optionsArray.some((p) => p.value === currentSelectedProgramId)
//     ) {
//       const programFromUserPrefs = allAvailablePrograms.find(
//         (p) => String(p.id) === currentSelectedProgramId
//       );
//       if (programFromUserPrefs) {
//         optionsArray.unshift({
//           value: String(programFromUserPrefs.id),
//           label: programFromUserPrefs.name,
//         });
//       } else if (defaultProgramIdToNameMap[currentSelectedProgramId]) {
//         optionsArray.unshift({
//           value: currentSelectedProgramId,
//           label: defaultProgramIdToNameMap[currentSelectedProgramId],
//         });
//       }
//     }

//     return optionsArray;
//   }, [
//     selectedFilters.program,
//     selectedFilters.areaOfStudy,
//     userPreferences?.availablePrograms,
//     userPreferences?.areaOfStudy?.id,
//   ]);

//   // --------------- تغییرات جدید برای نمایش لیبل‌ها -----------------

//   const getLabelFromId = useCallback(
//     (
//       id: string,
//       options: FilterOption[],
//       fallbackMap?: Record<string, string>
//     ): string => {
//       const foundOption = options.find((opt) => opt.value === id);
//       if (foundOption) {
//         return foundOption.label;
//       }
//       if (fallbackMap && fallbackMap[id]) {
//         return fallbackMap[id];
//       }
//       return ""; // اگر پیدا نشد، رشته خالی برگردان
//     },
//     []
//   );

//   const selectedCountryLabel = useMemo(() => {
//     const selectedCountryId = selectedFilters.country;
//     if (!selectedCountryId) return "";

//     // ابتدا در availableCountriesOptions که از userPreferences می آید جستجو کن
//     const countryFromPrefs = userPreferences?.availableCountries?.find(
//       (c) => String(c.id) === selectedCountryId
//     );
//     if (countryFromPrefs) return countryFromPrefs.name;

//     // سپس در countryOptions (که شامل defaultCountryOptions است) جستجو کن
//     return getLabelFromId(selectedCountryId, countryOptions);
//   }, [
//     selectedFilters.country,
//     countryOptions,
//     userPreferences?.availableCountries,
//     getLabelFromId,
//   ]);

//   const selectedStateLabel = useMemo(() => {
//     const selectedStateId = selectedFilters.state;
//     if (!selectedStateId) return "";

//     // ابتدا در availableStatesOptions (از userPreferences) جستجو کن
//     const stateFromPrefs = userPreferences?.countryDetails?.states?.find(
//       (s) => String(s.id) === selectedStateId
//     );
//     if (stateFromPrefs) return stateFromPrefs.name;

//     // سپس در defaultStatesOptions (اگر لازم بود) جستجو کن - هرچند اینها فعلا فقط string هستند
//     // نیاز است که defaultStatesOptions نیز به FilterOption[] تبدیل شود اگر قرار است ID داشته باشد.
//     // فعلاً فرض می‌کنیم availableStatesOptions کافی است.
//     return getLabelFromId(selectedStateId, availableStatesOptions);
//   }, [
//     selectedFilters.state,
//     availableStatesOptions,
//     userPreferences?.countryDetails?.states,
//     getLabelFromId,
//   ]);

//   const selectedAreaOfStudyLabel = useMemo(() => {
//     const selectedAreaId = selectedFilters.areaOfStudy;
//     if (!selectedAreaId) return "";

//     // ابتدا در availableAreasOfStudyOptions (از userPreferences) جستجو کن
//     const areaFromPrefs = userPreferences?.availableAreasOfStudy?.find(
//       (a) => String(a.id) === selectedAreaId
//     );
//     if (areaFromPrefs) return areaFromPrefs.name;

//     // سپس در areaOfStudyOptions (که شامل defaultAreaOfStudyOptions است) جستجو کن
//     return getLabelFromId(selectedAreaId, areaOfStudyOptions);
//   }, [
//     selectedFilters.areaOfStudy,
//     areaOfStudyOptions,
//     userPreferences?.availableAreasOfStudy,
//     getLabelFromId,
//   ]);

//   const selectedProgramLabel = useMemo(() => {
//     const selectedProgramId = selectedFilters.program;
//     if (!selectedProgramId) return "";

//     // ابتدا در programOptions (که از ترکیب userPreferences و defaultProgramIdToNameMap ساخته شده) جستجو کن
//     const foundInOptions = programOptions.find(
//       (opt) => opt.value === selectedProgramId
//     );
//     if (foundInOptions) {
//       return foundInOptions.label;
//     }

//     // سپس به صورت مستقیم در userPreferences.programDetails یا defaultProgramIdToNameMap جستجو کن
//     if (
//       userPreferences?.programDetails?.id &&
//       String(userPreferences.programDetails.id) === selectedProgramId &&
//       userPreferences.programDetails.name
//     ) {
//       return userPreferences.programDetails.name;
//     }

//     if (defaultProgramIdToNameMap[selectedProgramId]) {
//       return defaultProgramIdToNameMap[selectedProgramId];
//     }

//     return "";
//   }, [
//     selectedFilters.program,
//     userPreferences?.programDetails,
//     programOptions,
//   ]);

//   // ------------------------------------------------------------------

//   const [schoolList, setSchoolList] = useState<SchoolOption[]>([]);
//   const [allProgramsList, setAllProgramsList] = useState<ProgramOption[]>([]);
//   const [schoolSearchOpen, setSchoolSearchOpen] = useState(false);
//   const [schoolSearch, setSchoolSearch] = useState("");

//   const handleFilterSelect = useCallback(
//     (filterName: string, value: string) => {
//       console.log(
//         "SchoolFilters: handleFilterSelect called. filterName:",
//         filterName,
//         "value:",
//         value
//       );
//       const newFilters = { ...selectedFilters };
//       if (value === "") {
//         delete newFilters[filterName];
//         if (filterName === "areaOfStudy" && newFilters.program) {
//           delete newFilters.program;
//         }
//         if (filterName === "country" && newFilters.state) {
//           delete newFilters.state;
//         }
//       } else {
//         newFilters[filterName] = value;
//         if (
//           filterName === "country" &&
//           selectedFilters.country !== value &&
//           newFilters.state
//         ) {
//           delete newFilters.state;
//         }
//       }
//       if (newFilters[filterName] === selectedFilters[filterName]) {
//         console.log(
//           "SchoolFilters: Filter value unchanged, skipping onFilterChange."
//         );
//         return;
//       }
//       if (!isEqual(selectedFilters, newFilters)) {
//         console.log(
//           "SchoolFilters: Calling onFilterChange with new filters:",
//           newFilters
//         );
//         onFilterChange(newFilters);
//       } else {
//         console.log(
//           "SchoolFilters: Filters are equal, skipping onFilterChange."
//         );
//       }
//     },
//     [onFilterChange, selectedFilters]
//   );

//   const handleSchoolSelect = useCallback(
//     (schoolId: string) => {
//       const newFilters = { ...selectedFilters, school: schoolId };
//       onFilterChange(newFilters);
//       setSchoolSearchOpen(false);
//     },
//     [onFilterChange, selectedFilters]
//   );

//   const handleSchoolSearch = useCallback((searchText: string) => {
//     setSchoolSearch(searchText);
//     if (searchText.length > 0) {
//       // Implement search logic here
//     } else {
//       // Reset search
//     }
//   }, []);

//   const filteredSchools = useMemo(() => {
//     if (!schoolSearch) return schoolList;
//     return schoolList.filter((school) =>
//       school.name.toLowerCase().includes(schoolSearch.toLowerCase())
//     );
//   }, [schoolList, schoolSearch]);

//   const selectedSchoolName = useMemo(() => {
//     if (!selectedFilters.school) return "";
//     const selected = schoolList.find(
//       (school) => school.id === selectedFilters.school
//     );
//     return selected ? selected.name : "";
//   }, [selectedFilters.school, schoolList]);

//   const researchInterestOptions = useMemo<FilterOption[]>(() => {
//     if (!researchInterests?.length) return [];

//     const processedInterests = researchInterests.reduce(
//       (acc: string[], interest) => {
//         if (!interest) return acc;

//         const cleanInterest = interest.replace(/^s:\d+:"|"$/g, "");
//         const interests = cleanInterest.split(",").map((i) => i.trim());

//         return [...acc, ...interests];
//       },
//       []
//     );

//     return [...new Set(processedInterests)].sort().map((interest) => ({
//       value: interest,
//       label: interest,
//     }));
//   }, [researchInterests]);

//   return (
//     <motion.div
//       className={`${compact ? "mb-4" : "mb-4"}`}
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       {!compact && (
//         <div className="flex items-center gap-2 mb-4">
//           <Filter className="h-4 w-4 text-gray-500" />
//           <h2 className="font-semibold text-gray-700 dark:text-gray-200">
//             Filters
//           </h2>
//         </div>
//       )}

//       <div
//         className={`flex ${compact ? "flex-wrap gap-1" : "flex-wrap gap-2"}`}
//       >
//         <FilterDropdown
//           label="Country"
//           icon={<Flag className="h-4 w-4" />}
//           options={countryOptions}
//           onSelect={(value) => handleFilterSelect("country", value)}
//           selectedValue={selectedFilters.country || ""}
//           selectedLabel={selectedCountryLabel} // <--- تغییر اینجا
//           buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//         />

//         <FilterDropdown
//           label="State"
//           icon={<MapPin className="h-4 w-4" />}
//           options={availableStatesOptions}
//           onSelect={(value) => handleFilterSelect("state", value)}
//           selectedValue={selectedFilters.state || ""}
//           selectedLabel={selectedStateLabel} // <--- تغییر اینجا
//           buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//           disabled={
//             loadingStates ||
//             !selectedFilters.country ||
//             availableStatesOptions.length === 0
//           }
//         />

//         {type === "schools" ? (
//           <>
//             <FilterDropdown
//               label="Degree Level"
//               icon={<GraduationCap className="h-4 w-4" />}
//               options={degreeLevelOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("degreeLevel", value)}
//               selectedValue={selectedFilters.degreeLevel || ""}
//               // برای Degree Level نیازی به تبدیل ID نیست، چون value و label یکسان هستند.
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Area of Study"
//               icon={<Book className="h-4 w-4" />}
//               options={areaOfStudyOptions}
//               onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
//               selectedValue={selectedFilters.areaOfStudy || ""}
//               selectedLabel={selectedAreaOfStudyLabel} // <--- تغییر اینجا
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Program"
//               icon={<Layers className="h-4 w-4" />}
//               options={programOptions}
//               onSelect={(value) => handleFilterSelect("program", value)}
//               selectedValue={selectedFilters.program || ""}
//               selectedLabel={selectedProgramLabel} // <--- این قبلا وجود داشت و درست بود
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//               disabled={!selectedFilters.areaOfStudy}
//             />

//             <FilterDropdown
//               label="Order By"
//               icon={<BarChart3 className="h-4 w-4" />}
//               options={orderBySchoolOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("orderBy", value)}
//               selectedValue={selectedFilters.orderBy || ""}
//               // برای Order By نیازی به تبدیل ID نیست، چون value و label یکسان هستند.
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />
//           </>
//         ) : (
//           // Professor filters (بدون تغییر)
//           <>
//             <FilterDropdown
//               label="Area of Study"
//               icon={<Book className="h-4 w-4" />}
//               options={areaOfStudyOptions}
//               onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
//               selectedValue={selectedFilters.areaOfStudy || ""}
//               selectedLabel={selectedAreaOfStudyLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Programs"
//               icon={<Layers className="h-4 w-4" />}
//               options={programOptions}
//               onSelect={(value) => handleFilterSelect("program", value)}
//               selectedValue={selectedFilters.program || ""}
//               selectedLabel={selectedProgramLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Research Interest"
//               icon={<span>{filterIcons.researchInterest}</span>}
//               options={researchInterestOptions}
//               onSelect={(value) =>
//                 handleFilterSelect("researchInterest", value)
//               }
//               selectedValue={selectedFilters.researchInterest || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//               searchable={true}
//             />

//             <FilterDropdown
//               label="Title"
//               icon={<span>{filterIcons.title}</span>}
//               options={professorTitleOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("title", value)}
//               selectedValue={selectedFilters.title || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

/////////////////////////////////
//////////////////////////////////
// const SchoolFilters = ({
//   toggleFilter = () => {},
//   type = "schools",
//   compact = false,
//   onFilterChange = () => {},
//   selectedFilters = {},
//   userPreferences = null,
//   researchInterests = [],
//   availableStatesOptions = [],
//   loadingStates = false,
//   availableCountriesOptions = [],
//   availableAreasOfStudyOptions = [],
//   availableProgramsOptions = [],
// }: SchoolFiltersProps) => {
//   console.log("SchoolFilters - selectedFilters received:", selectedFilters);
//   console.log("SchoolFilters - userPreferences:", userPreferences);

//   const countryOptions = useMemo<FilterOption[]>(() => {
//     return availableCountriesOptions.length
//       ? availableCountriesOptions
//       : defaultCountryOptions.map((option) => ({
//           value: option,
//           label: option,
//         }));
//   }, [availableCountriesOptions]);

//   const areaOfStudyOptions = useMemo<FilterOption[]>(() => {
//     return availableAreasOfStudyOptions.length
//       ? availableAreasOfStudyOptions
//       : defaultAreaOfStudyOptions.map((option) => ({
//           value: option,
//           label: option,
//         }));
//   }, [availableAreasOfStudyOptions]);

//   const programOptions = useMemo<FilterOption[]>(() => {
//     const optionsArray: FilterOption[] = availableProgramsOptions.length
//       ? availableProgramsOptions
//       : Object.entries(defaultProgramIdToNameMap).map(([id, name]) => ({
//           value: id,
//           label: name,
//         }));

//     const currentSelectedProgramId = selectedFilters.program;
//     if (
//       currentSelectedProgramId &&
//       !optionsArray.some((p) => p.value === currentSelectedProgramId)
//     ) {
//       const programFromUserPrefs = userPreferences?.availablePrograms?.find(
//         (p) => String(p.id) === currentSelectedProgramId
//       );
//       if (programFromUserPrefs) {
//         optionsArray.unshift({
//           value: String(programFromUserPrefs.id),
//           label: programFromUserPrefs.name,
//         });
//       } else if (defaultProgramIdToNameMap[currentSelectedProgramId]) {
//         optionsArray.unshift({
//           value: currentSelectedProgramId,
//           label: defaultProgramIdToNameMap[currentSelectedProgramId],
//         });
//       }
//     }

//     return optionsArray;
//   }, [
//     selectedFilters.program,
//     availableProgramsOptions,
//     userPreferences?.availablePrograms,
//   ]);

//   const getLabelFromId = useCallback(
//     (
//       id: string,
//       options: FilterOption[],
//       fallbackMap?: Record<string, string>
//     ): string => {
//       const foundOption = options.find((opt) => opt.value === id);
//       if (foundOption) {
//         return foundOption.label;
//       }
//       if (fallbackMap && fallbackMap[id]) {
//         return fallbackMap[id];
//       }
//       return id; // Return ID as fallback to make debugging easier
//     },
//     []
//   );

//   const selectedCountryLabel = useMemo(() => {
//     const selectedCountryId = selectedFilters.country;
//     if (!selectedCountryId) return "";
//     return getLabelFromId(selectedCountryId, countryOptions);
//   }, [selectedFilters.country, countryOptions, getLabelFromId]);

//   const selectedStateLabel = useMemo(() => {
//     const selectedStateId = selectedFilters.state;
//     if (!selectedStateId) return "";
//     return getLabelFromId(selectedStateId, availableStatesOptions);
//   }, [selectedFilters.state, availableStatesOptions, getLabelFromId]);

//   const selectedAreaOfStudyLabel = useMemo(() => {
//     const selectedAreaId = selectedFilters.areaOfStudy;
//     if (!selectedAreaId) return "";
//     return getLabelFromId(selectedAreaId, areaOfStudyOptions);
//   }, [selectedFilters.areaOfStudy, areaOfStudyOptions, getLabelFromId]);

//   const selectedProgramLabel = useMemo(() => {
//     const selectedProgramId = selectedFilters.program;
//     if (!selectedProgramId) return "";
//     return getLabelFromId(
//       selectedProgramId,
//       programOptions,
//       defaultProgramIdToNameMap
//     );
//   }, [selectedFilters.program, programOptions, getLabelFromId]);

//   const handleFilterSelect = useCallback(
//     (filterName: string, value: string) => {
//       console.log(
//         "SchoolFilters: handleFilterSelect called. filterName:",
//         filterName,
//         "value:",
//         value
//       );
//       const newFilters = { ...selectedFilters };
//       if (value === "") {
//         delete newFilters[filterName];
//         if (filterName === "areaOfStudy" && newFilters.program) {
//           delete newFilters.program;
//         }
//         if (filterName === "country" && newFilters.state) {
//           delete newFilters.state;
//         }
//       } else {
//         newFilters[filterName] = value;
//         if (
//           filterName === "country" &&
//           selectedFilters.country !== value &&
//           newFilters.state
//         ) {
//           delete newFilters.state;
//         }
//       }
//       if (!isEqual(selectedFilters, newFilters)) {
//         console.log(
//           "SchoolFilters: Calling onFilterChange with new filters:",
//           newFilters
//         );
//         onFilterChange(newFilters);
//       }
//     },
//     [onFilterChange, selectedFilters]
//   );

//   // Remove unused state
//   // const [schoolList, setSchoolList] = useState<SchoolOption[]>([]);
//   // const [allProgramsList, setAllProgramsList] = useState<ProgramOption[]>([]);
//   // const [schoolSearchOpen, setSchoolSearchOpen] = useState(false);
//   // const [schoolSearch, setSchoolSearch] = useState("");

//   const researchInterestOptions = useMemo<FilterOption[]>(() => {
//     if (!researchInterests?.length) return [];

//     const processedInterests = researchInterests.reduce(
//       (acc: string[], interest) => {
//         if (!interest) return acc;
//         const cleanInterest = interest.replace(/^s:\d+:"|"$/g, "");
//         const interests = cleanInterest.split(",").map((i) => i.trim());
//         return [...acc, ...interests];
//       },
//       []
//     );

//     return [...new Set(processedInterests)].sort().map((interest) => ({
//       value: interest,
//       label: interest,
//     }));
//   }, [researchInterests]);

//   // Add loading state for dropdowns
//   if (
//     !countryOptions.length ||
//     !areaOfStudyOptions.length ||
//     !programOptions.length
//   ) {
//     return <div>Loading filter options...</div>;
//   }

//   return (
//     <motion.div
//       className={`${compact ? "mb-4" : "mb-4"}`}
//       initial={{ y: 20, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       {!compact && (
//         <div className="flex items-center gap-2 mb-4">
//           <Filter className="h-4 w-4 text-gray-500" />
//           <h2 className="font-semibold text-gray-700 dark:text-gray-200">
//             Filters
//           </h2>
//         </div>
//       )}

//       <div
//         className={`flex ${compact ? "flex-wrap gap-1" : "flex-wrap gap-2"}`}
//       >
//         <FilterDropdown
//           label="Country"
//           icon={<Flag className="h-4 w-4" />}
//           options={countryOptions}
//           onSelect={(value) => handleFilterSelect("country", value)}
//           selectedValue={selectedFilters.country || ""}
//           selectedLabel={selectedCountryLabel}
//           buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//         />

//         <FilterDropdown
//           label="State"
//           icon={<MapPin className="h-4 w-4" />}
//           options={availableStatesOptions}
//           onSelect={(value) => handleFilterSelect("state", value)}
//           selectedValue={selectedFilters.state || ""}
//           selectedLabel={selectedStateLabel}
//           buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//           disabled={
//             loadingStates ||
//             !selectedFilters.country ||
//             availableStatesOptions.length === 0
//           }
//         />

//         {type === "schools" ? (
//           <>
//             <FilterDropdown
//               label="Degree Level"
//               icon={<GraduationCap className="h-4 w-4" />}
//               options={degreeLevelOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("degreeLevel", value)}
//               selectedValue={selectedFilters.degreeLevel || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Area of Study"
//               icon={<Book className="h-4 w-4" />}
//               options={areaOfStudyOptions}
//               onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
//               selectedValue={selectedFilters.areaOfStudy || ""}
//               selectedLabel={selectedAreaOfStudyLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Program"
//               icon={<Layers className="h-4 w-4" />}
//               options={programOptions}
//               onSelect={(value) => handleFilterSelect("program", value)}
//               selectedValue={selectedFilters.program || ""}
//               selectedLabel={selectedProgramLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//               disabled={!selectedFilters.areaOfStudy}
//             />

//             <FilterDropdown
//               label="Order By"
//               icon={<BarChart3 className="h-4 w-4" />}
//               options={orderBySchoolOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("orderBy", value)}
//               selectedValue={selectedFilters.orderBy || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />
//           </>
//         ) : (
//           <>
//             <FilterDropdown
//               label="Area of Study"
//               icon={<Book className="h-4 w-4" />}
//               options={areaOfStudyOptions}
//               onSelect={(value) => handleFilterSelect("areaOfStudy", value)}
//               selectedValue={selectedFilters.areaOfStudy || ""}
//               selectedLabel={selectedAreaOfStudyLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Programs"
//               icon={<Layers className="h-4 w-4" />}
//               options={programOptions}
//               onSelect={(value) => handleFilterSelect("program", value)}
//               selectedValue={selectedFilters.program || ""}
//               selectedLabel={selectedProgramLabel}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />

//             <FilterDropdown
//               label="Research Interest"
//               icon={<span>{filterIcons.researchInterest}</span>}
//               options={researchInterestOptions}
//               onSelect={(value) =>
//                 handleFilterSelect("researchInterest", value)
//               }
//               selectedValue={selectedFilters.researchInterest || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//               searchable={true}
//             />

//             <FilterDropdown
//               label="Title"
//               icon={<span>{filterIcons.title}</span>}
//               options={professorTitleOptions.map((option) => ({
//                 value: option,
//                 label: option,
//               }))}
//               onSelect={(value) => handleFilterSelect("title", value)}
//               selectedValue={selectedFilters.title || ""}
//               buttonClassName={`!py-1.5 ${compact ? "text-xs" : ""}`}
//             />
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// };

export default SchoolFilters;
