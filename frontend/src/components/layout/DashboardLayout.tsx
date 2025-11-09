import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import Sidebar from "./Sidebar";
import UserAccountMenu from "./UserAccountMenu";
import QuestApplyLogo from "../shared/QuestApplyLogo";
import NotificationDropdown from "../notifications/NotificationDropdown";

interface DashboardLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  customHeaderButton?: React.ReactNode;
}

const DashboardLayout = ({
  children,
  isDarkMode,
  toggleTheme,
  sidebarOpen,
  setSidebarOpen,
  customHeaderButton,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  useEffect(() => {
    // Randomly determine if we should show a feedback prompt (20% chance)
    const shouldShowPrompt = Math.random() < 0.2;
    setShowFeedbackPrompt(shouldShowPrompt);
  }, []);
  useLayoutEffect(() => {
    const apply = () => {
      const h = headerRef.current?.offsetHeight ?? 64;
      // مقدار برای همهٔ صفحه در دسترس می‌شود
      document.documentElement.style.setProperty("--top-nav-h", `${h}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  const handleApplyWithUs = () => {
    navigate("/apply-with-us/profile", {
      state: { applicationType: "applywithus" },
    });
  };

  return (
    <div
      className={`flex min-h-screen w-full  ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-black"
          : "bg-gradient-to-br from-blue-50 to-teal-100"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto ">
        {/* Top Navigation */}
        <nav
          ref={headerRef}
          className={`${
            isDarkMode ? "bg-gray-900/80" : "bg-white/80"
          } backdrop-blur-md border-b ${
            isDarkMode ? "border-blue-900/50" : "border-blue-100"
          } p-4 md:fixed md:top-0 md:left-0 md:right-0 z-50`}
          id="top-nav"
        >
          <div className="flex justify-between items-center ">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2  rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Open sidebar"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path
                    fill="currentColor"
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <Link to="/">
                <QuestApplyLogo variant="full" size="md" />
              </Link>
            </div>

            {/* Centered Custom Button or Apply With Us Button */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
              {customHeaderButton || (
                <Button
                  onClick={handleApplyWithUs}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Apply With Us
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle switch */}
              <div className="flex items-center space-x-2">
                <Sun
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-yellow-500"
                  }`}
                />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Moon
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-blue-400" : "text-gray-400"
                  }`}
                />
              </div>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Account Menu */}
              <UserAccountMenu />
            </div>
          </div>

          {/* Mobile Custom Button or Apply With Us Button */}
          <div className="md:hidden mt-4 flex justify-center">
            {customHeaderButton || (
              <Button
                onClick={handleApplyWithUs}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
              >
                Apply With Us
              </Button>
            )}
          </div>
        </nav>

        {/* Main Content Container */}
        <div className="px-4 mt-20 py-6 flex-1">
          <h1>hello</h1>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
