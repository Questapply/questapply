import { useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NavigationButtons from "@/components/layout/NavigationButtons"; // ← مسیر خودت
import Navbar from "@/components/home/Navbar";
type Props = { isDarkMode: boolean; toggleTheme: () => void };
import { useAuth } from "@/context/AuthContext";

export default function Dashboard({ isDarkMode, toggleTheme }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      {/* نوار تب‌ها */}
      <div className="w-full max-w-full">
        <NavigationButtons isDarkMode={isDarkMode} />

        {/* محتوای صفحه‌های تب (FindSchools, FindPrograms, ...) */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300">
          <Outlet context={{ isDarkMode, toggleTheme }} />
        </div>
      </div>
    </DashboardLayout>
  );
}
