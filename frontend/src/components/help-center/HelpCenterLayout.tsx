import { NavLink, Outlet } from "react-router-dom";
import Navbar from "../home/Navbar";

export default function HelpCenterLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Help Center
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Find answers, watch tutorials, or open a support ticket.
        </p>

        {/* Tabs via route-based NavLink */}
        <div className="flex gap-2 mb-8">
          <NavLink
            to="faqs"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
              }`
            }
          >
            FAQs
          </NavLink>

          <NavLink
            to="video-tutorials"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
              }`
            }
          >
            Video Tutorials
          </NavLink>

          <NavLink
            to="support-ticket"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
              }`
            }
          >
            Support Ticket
          </NavLink>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
