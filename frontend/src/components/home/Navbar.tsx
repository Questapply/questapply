import { Link, useNavigate } from "react-router-dom";
import QuestApplyLogo from "../shared/QuestApplyLogo";
import {
  FileText,
  HelpCircle,
  Moon,
  Sun,
  Menu,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

function Navbar({ isDarkMode, onToggleTheme }: NavbarProps) {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  console.log("NAVBAR auth?", isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left: Logo */}
          <Link to="/" className="flex-shrink-0">
            <QuestApplyLogo variant="full" size="md" />
          </Link>

          {/* Middle: Nav links */}
          <div className="hidden md:flex flex-grow justify-center items-center">
            <div className="flex space-x-8">
              {/* Auth-aware primary nav */}
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/schools"
                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                  >
                    Find Schools
                  </Link>
                  <Link
                    to="/programs"
                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                  >
                    Find Programs
                  </Link>
                  <Link
                    to="/professors"
                    className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                  >
                    Find Professors
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}

              {/* Blog */}
              <Link
                to="/blog"
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                Blog
              </Link>

              {/* Help Center */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Help Center
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2"
                >
                  <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
                    <Link
                      to="/help-center/faqs"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      FAQs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
                    <Link
                      to="/help-center/video-tutorials"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      Video Tutorials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
                    <Link
                      to="/help-center/support-ticket"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      Support Ticket
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right: Theme + Auth buttons */}
          <div className="flex items-center space-x-2 sm:space-x-8 flex-shrink-0">
            {/* Theme toggle */}
            <div className="flex items-center space-x-2">
              <Sun
                className={`w-5 h-5 ${
                  isDarkMode ? "text-gray-400" : "text-yellow-500"
                }`}
              />
              <Switch
                checked={isDarkMode}
                onCheckedChange={onToggleTheme}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon
                className={`w-5 h-5 ${
                  isDarkMode ? "text-blue-400" : "text-gray-400"
                }`}
              />
            </div>

            {/* Auth area */}
            {!isAuthenticated ? (
              <>
                <Link to="/auth?mode=login" className="hidden sm:inline-block">
                  <Button
                    variant="outline"
                    className="border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                  >
                    <LogIn className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Login</span>
                  </Button>
                </Link>
                <Link to="/auth?mode=signup" className="hidden sm:inline-block">
                  <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none">
                    <span className="hidden md:inline">Sign Up</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="hidden sm:inline-block">
                  <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none">
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Profile</span>
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="hidden sm:inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[250px] sm:w-[300px] bg-white dark:bg-gray-900 pt-8"
                >
                  <nav className="flex flex-col gap-4">
                    {/* Primary links (auth-aware) */}
                    {!isAuthenticated ? (
                      <>
                        <Link
                          to="/schools"
                          className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          Find Schools
                        </Link>
                        <Link
                          to="/programs"
                          className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          Find Programs
                        </Link>
                        <Link
                          to="/professors"
                          className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          Find Professors
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        Dashboard
                      </Link>
                    )}

                    {/* Common links */}
                    <Link
                      to="/blog"
                      className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Blog
                    </Link>
                    <Link
                      to="/help-center"
                      className="py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 flex items-center"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Link>

                    {/* Auth buttons (mobile) */}
                    {!isAuthenticated ? (
                      <>
                        <Link to="/auth?mode=login" className="block mt-2">
                          <Button
                            variant="outline"
                            className="w-full border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2"
                          >
                            <LogIn className="h-4 w-4" />
                            Login
                          </Button>
                        </Link>
                        <Link to="/auth?mode=signup" className="block mt-2">
                          <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none flex items-center justify-center gap-2">
                            Sign Up
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="mt-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 py-2 text-base font-medium flex items-center"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Button
                          onClick={handleLogout}
                          variant="destructive"
                          className="w-full bg-red-500 hover:bg-red-600 text-white mt-2 flex flex-row items-center justify-center"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
