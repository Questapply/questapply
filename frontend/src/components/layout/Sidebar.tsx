import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Home,
  User,
  Heart,
  Users,
  BarChart2,
  FileText,
  Headphones,
  Gift,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import QuestApplyLogo from "../shared/QuestApplyLogo";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

type NavItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
};

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("Dashboard");

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Heart, label: "Favorite Lists", href: "/favorites" },
    { icon: Users, label: "My Professors", href: "/professors" },
    {
      icon: BarChart2,
      label: "Track My Applications",
      href: "/applications",
    },
    { icon: FileText, label: "My Documents", href: "/documents" },
    { icon: Headphones, label: "Support Ticket", href: "/support" },
    { icon: Gift, label: "Quest Rewards", href: "/rewards" },
    { icon: CreditCard, label: "My Payments", href: "/payments" },
  ];

  const handleNavigation = (href: string, label: string) => {
    setActiveItem(label);
    navigate(href);
  };

  return (
    <motion.aside
      className={cn(
        "relative h-full bg-white dark:bg-gray-800 border-r border-purple-100 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col shadow-lg",
        isOpen ? "w-64" : "w-20"
      )}
      initial={{ x: -20, opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Collapse Button */}
      <motion.button
        className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 rounded-full p-1 shadow-md z-10"
        onClick={toggleSidebar}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        )}
      </motion.button>

      {/* Logo Area */}
      <div className="flex items-center justify-center h-20 border-b border-purple-100 dark:border-gray-700">
        {isOpen ? (
          <Link to="/">
            <QuestApplyLogo variant="full" size="md" />
          </Link>
        ) : (
          <QuestApplyLogo variant="icon" size="md" />
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 dark:scrollbar-thumb-purple-800">
        <ul className="space-y-2 px-3">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.button
                  className={cn(
                    "w-full flex items-center rounded-lg p-3 transition-all duration-200",
                    activeItem === item.label
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10"
                  )}
                  onClick={() => handleNavigation(item.href, item.label)}
                  whileHover={{ x: isOpen ? 5 : 0 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      activeItem === item.label
                        ? "text-purple-600 dark:text-purple-400"
                        : ""
                    )}
                  />
                  {isOpen && (
                    <motion.span
                      className={cn(
                        "ml-3 font-medium",
                        activeItem === item.label
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-700 dark:text-gray-300"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-purple-100 dark:border-gray-700 flex items-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold">
          U
        </div>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3"
          >
            <div className="font-medium text-gray-800 dark:text-gray-200">
              User Name
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              user@example.com
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
