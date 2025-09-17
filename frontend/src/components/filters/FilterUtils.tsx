import { ReactNode } from "react";
import {
  Globe,
  Map,
  GraduationCap,
  BookOpen,
  FileText,
  Scroll,
  Calendar,
  PercentIcon,
  BarChart,
  ArrowUpDown,
  Users,
  Trophy,
  DollarSign,
  Building,
} from "lucide-react";

export interface FilterOption {
  icon: ReactNode;
  label: string;
}

export type Section =
  | "quest-apply-ai"
  | "find-schools"
  | "find-programs"
  | "find-professors"
  | "create-resume"
  | "create-sop"
  | "create-lor"
  | "apply-now";

// Create icon components outside the getFilterOptions function
const createIcon = (Icon: any) => <Icon size={16} />;

export const getFilterOptions = (
  activeSection: Section,
  isQuestApplyAI: boolean
): FilterOption[] | null => {
  if (
    isQuestApplyAI ||
    activeSection === "quest-apply-ai" ||
    activeSection === "create-resume" ||
    activeSection === "create-sop" ||
    activeSection === "create-lor" ||
    activeSection === "apply-now"
  ) {
    return null;
  }

  switch (activeSection) {
    case "find-schools":
      return [
        { icon: createIcon(Globe), label: "Country" },
        { icon: createIcon(Map), label: "State" },
        { icon: createIcon(GraduationCap), label: "Schools" },
        { icon: createIcon(BookOpen), label: "Degree Level" },
        { icon: createIcon(FileText), label: "Area of Study" },
        { icon: createIcon(Scroll), label: "Programs" },
        { icon: createIcon(ArrowUpDown), label: "Order By" },
      ];
    case "find-programs":
      return [
        { icon: createIcon(Globe), label: "Country" },
        { icon: createIcon(Map), label: "State" },
        { icon: createIcon(GraduationCap), label: "Schools" },
        { icon: createIcon(BookOpen), label: "Degree Level" },
        { icon: createIcon(FileText), label: "Area of Study" },
        { icon: createIcon(Scroll), label: "Programs" },
        { icon: createIcon(Calendar), label: "Deadline" },
        { icon: createIcon(FileText), label: "English" },
        { icon: createIcon(PercentIcon), label: "GPA" },
        { icon: createIcon(BarChart), label: "GRE" },
        { icon: createIcon(ArrowUpDown), label: "Order By" },
      ];
    case "find-professors":
      return [
        { icon: createIcon(Globe), label: "Country" },
        { icon: createIcon(Map), label: "State" },
        { icon: createIcon(GraduationCap), label: "Schools" },
        { icon: createIcon(FileText), label: "Area of Study" },
        { icon: createIcon(Scroll), label: "Programs" },
        { icon: createIcon(BookOpen), label: "Research Interest" },
        { icon: createIcon(Users), label: "Title" },
      ];
    default:
      return null;
  }
};
