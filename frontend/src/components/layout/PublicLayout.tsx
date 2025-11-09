import { Outlet } from "react-router-dom";
import Navbar from "@/components/home/Navbar";

type Props = { isDarkMode: boolean; toggleTheme: () => void };

export default function PublicLayout({ isDarkMode, toggleTheme }: Props) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 ">
      <Navbar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <main className="max-w-7xl mx-auto  py-6 dark:bg-gray-800 my-2 rounded-md">
        <Outlet />
      </main>
    </div>
  );
}
