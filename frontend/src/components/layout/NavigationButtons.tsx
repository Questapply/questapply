import { Button } from "../ui/button";
import {
  Book,
  BookOpen,
  Users,
  FileText,
  FilePen,
  FileLock,
  Check,
  Search,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

type NavigationButtonsProps = {
  isDarkMode: boolean;
  inline?: boolean; // نمایش جمع‌وجورتر
};

const NavigationButtons = ({
  isDarkMode,
  inline = false,
}: NavigationButtonsProps) => {
  const { pathname } = useLocation();
  const active = (p: string) => pathname.startsWith(p);

  const baseInactive =
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200";

  const tabs: Array<{
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { to: "/dashboard/ai", label: "QuestApply AI", icon: Search, badge: "NEW" },
    { to: "/dashboard/find-schools", label: "Find Schools", icon: Book },
    { to: "/dashboard/find-programs", label: "Find Programs", icon: BookOpen },
    { to: "/dashboard/find-professors", label: "Find Professors", icon: Users },
    { to: "/dashboard/create-resume", label: "Create Resume", icon: FileText },
    { to: "/dashboard/create-sop", label: "Create SOP", icon: FilePen },
    { to: "/dashboard/create-lor", label: "Create LOR", icon: FileLock },
    { to: "/dashboard/apply-now", label: "Apply Now", icon: Check },
  ];

  return (
    <div
      className={`${
        inline ? "mb-4" : "mb-8"
      } w-full flex scrollbar-hide no-scrollbar`}
    >
      <div className="flex justify-between w-full gap-2">
        {tabs.map(({ to, label, icon: Icon, badge }) => {
          const isActive = active(to);
          return (
            <Button
              key={to}
              asChild
              variant={isActive ? "blueButton" : "outline"}
              size="sm"
              className={`relative flex items-center gap-1.5 h-10 px-3 py-1 min-w-max transition-all duration-300 ${
                isActive ? "" : baseInactive
              } ${inline ? "text-xs" : ""}`}
            >
              <NavLink to={to}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge && (
                  <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[9px] font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
              </NavLink>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationButtons;
