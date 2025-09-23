import { useEffect } from "react";
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
  X,
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

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Heart, label: "Favorite Lists", href: "/favorites" },
    { icon: Users, label: "My Professors", href: "/professors" },
    { icon: BarChart2, label: "Track My Applications", href: "/applications" },
    { icon: FileText, label: "My Documents", href: "/documents" },
    { icon: Headphones, label: "Support Ticket", href: "/support" },
    { icon: Gift, label: "Quest Rewards", href: "/rewards" },
    { icon: CreditCard, label: "My Payments", href: "/payments" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    toggleSidebar(); // روی موبایل بعد از کلیک، ببند
  };

  // قفل اسکرول وقتی سایدبار باز است
  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={toggleSidebar}
        className={cn(
          "fixed inset-0 z-[60] transition-[opacity,backdrop-filter] duration-200",
          "bg-black/20 dark:bg-white/10",
          "backdrop-blur-sm ",
          "backdrop-saturate-150 backdrop-contrast-110",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        initial={false}
        animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 1 }}
        transition={{ type: "tween", duration: 0.25 }}
        className={cn(
          "fixed left-0 top-0 z-[61] h-screen w-72",
          "bg-white dark:bg-gray-800 border-r border-purple-100 dark:border-gray-700",
          "shadow-2xl flex flex-col"
        )}
      >
        {/* Close */}
        <button
          onClick={toggleSidebar}
          aria-label="Close sidebar"
          className="absolute right-2 top-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-purple-100 dark:border-gray-700">
          <Link to="/" onClick={toggleSidebar}>
            <QuestApplyLogo variant="full" size="md" />
          </Link>
        </div>

        {/* Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map(({ icon: Icon, label, href }, index) => (
              <li key={label}>
                <button
                  onClick={() => handleNavigation(href)}
                  className={cn(
                    "w-full flex items-center rounded-lg px-3 py-2.5 transition-colors",
                    "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-purple-100 dark:border-gray-700 flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold">
            U
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-800 dark:text-gray-200">
              User Name
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              user@example.com
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
