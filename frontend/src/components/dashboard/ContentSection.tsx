import FindSchools from "../find-schools/FindSchools";
import FindPrograms from "../find-programs/FindPrograms";
import FindProfessors from "../find-professors/FindProfessors";
import CreateResume from "../create-resume/CreateResume";
import CreateSOP from "../create-sop/CreateSOP";
import CreateLOR from "../create-lor/CreateLOR";
import ApplyNow from "../apply-now/ApplyNow";
import { Section } from "../filters/FilterUtils";
import { motion } from "framer-motion";
import { FilterOption } from "../filters/FilterUtils";
import ChatBox from "../chat/ChatBox";
interface ContentSectionProps {
  activeSection: Section;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  filterOptions: FilterOption[] | null;
  searchQuery: string;
}

const ContentSection = ({
  activeSection,

  setSearchQuery,
  isDarkMode,
  filterOptions,
  searchQuery,
}: ContentSectionProps) => {
  // Render the appropriate section based on activeSection
  switch (activeSection) {
    case "quest-apply-ai":
      return (
        <ChatBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isDarkMode={isDarkMode}
          filterOptions={filterOptions}
          activeSection={activeSection}
        />
      );
    case "find-schools":
      return <FindSchools />;
    case "find-programs":
      return <FindPrograms />;
    case "find-professors":
      return <FindProfessors />;
    case "create-resume":
      return <CreateResume />;
    case "create-sop":
      return <CreateSOP />;
    case "create-lor":
      return <CreateLOR />;
    case "apply-now":
      return <ApplyNow />;
    default:
      // return <AiTalentAssessment />;
      return <div>Page Not Found</div>;
  }
};

export default ContentSection;
