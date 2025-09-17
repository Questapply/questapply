import { useState, useEffect } from "react";
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
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  useEffect(() => {
    // Randomly determine if we should show a feedback prompt (20% chance)
    const shouldShowPrompt = Math.random() < 0.2;
    setShowFeedbackPrompt(shouldShowPrompt);
  }, []);

  const handleApplyWithUs = () => {
    navigate("/apply-with-us/profile", {
      state: { applicationType: "applywithus" },
    });
  };

  return (
    <div
      className={`flex min-h-screen w-full ${
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
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Navigation */}
        <nav
          className={`${
            isDarkMode ? "bg-gray-900/80" : "bg-white/80"
          } backdrop-blur-md border-b ${
            isDarkMode ? "border-blue-900/50" : "border-blue-100"
          } p-4 sticky top-0 z-10`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                className={`md:hidden ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                } mr-4`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
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
        <div className="px-4 md:px-8 py-6 flex-1">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
