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
    // { to: "/dashboard/ai", label: "QuestApply AI", icon: Search, badge: "NEW" },
    { to: "/dashboard/find-schools", label: "Find Schools", icon: Book },
    { to: "/dashboard/find-programs", label: "Find Programs", icon: BookOpen },
    { to: "/dashboard/find-professors", label: "Find Professors", icon: Users },
    { to: "/dashboard/create-resume", label: "Create Resume", icon: FileText },
    { to: "/dashboard/create-sop", label: "Create SOP", icon: FilePen },
    { to: "/dashboard/create-lor", label: "Create LOR", icon: FileLock },
    { to: "/dashboard/apply-now", label: "Apply Now", icon: Check },
  ];

  return (
    <nav
      className={`${inline ? "mb-4" : "mb-8"} w-full relative -mx-4 md:-mx-6  `}
    >
      {/* فید گرادیانی کنارها (نمایش فقط موبایل) */}
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-8 bg-gradient-to-r from-background to-transparent md:hidden" />
      <div className="pointer-events-none absolute right-0 top-0 h-10 w-8 bg-gradient-to-l from-background to-transparent md:hidden" />

      {/* ردیف دکمه‌ها */}
      <div
        className="
        scroll-strip w-full
        pl-4 md:pl-6 
        flex items-center gap-2 md:gap-x-4 lg:gap-x-8
        overflow-x-auto md:overflow-visible
        snap-x snap-mandatory md:snap-none
        whitespace-nowrap   
        md:justify-center
          
        "
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* مخفی کردن اسکرول‌بار در WebKit */}
        <style>{`nav > div::-webkit-scrollbar{display:none}`}</style>

        {tabs.map(({ to, label, icon: Icon, badge }) => {
          const isActive = active(to);
          return (
            <Button
              key={to}
              asChild
              variant={isActive ? "blueButton" : "outline"}
              size="sm"
              className={`
                relative inline-flex items-center gap-1.5 md:gap-2.5
                h-10 md:h-12 px-3 md:px-4 py-1
                rounded-xl
                shrink-0 md:shrink snap-start
                min-w-max
                transition-all duration-300
                ${isActive ? "" : baseInactive}
                ${inline ? "text-xs" : "text-sm md:text-base"}
              `}
            >
              <NavLink to={to}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="truncate">{label}</span>
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
    </nav>
  );
};

export default NavigationButtons;
