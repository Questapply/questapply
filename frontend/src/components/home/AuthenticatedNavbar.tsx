////////////////////////////////////

import { Link, useNavigate } from "react-router-dom";
import QuestApplyLogo from "../shared/QuestApplyLogo";
import {
  BookOpen,
  FileText,
  ListOrdered,
  HelpCircle,
  Moon,
  Sun,
  Shield,
  Menu,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
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

interface AuthenticatedNavbarProps {
  isDarkMode: boolean;
  // setIsGameOpen: (isOpen: boolean) => void;
  onToggleTheme: () => void;
}

function AuthenticatedNavbar({
  isDarkMode,

  onToggleTheme,
}: AuthenticatedNavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section: Logo */}
          <div className="flex-shrink-0">
            <QuestApplyLogo variant="full" size="md" />
          </div>

          {/* Middle Section: Nav Links - Optimized for space distribution */}
          <div className="hidden md:flex flex-grow justify-center items-center">
            {/* ADDED 'flex' CLASS HERE */}
            <div className="flex space-x-8">
              {/* Dashboard link */}
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              {/* Blog link */}
              <Link
                to="/blog"
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center"
              >
                <FileText className="h-4 w-4 mr-1" />
                Blog
              </Link>
              {/* Help Center Dropdown */}
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
                      to="/help-center?tab=faqs"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      FAQs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
                    <Link
                      to="/help-center?tab=video-tutorials"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      Video Tutorials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
                    <Link
                      to="/help-center?tab=support-ticket"
                      className="flex items-center w-full px-2 py-1.5"
                    >
                      Support Ticket
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Section: Theme, Pro, Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-8 flex-shrink-0">
            {/* Theme toggle switch */}
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

            {/* <Link to="/pro" className="hidden sm:inline-block">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Pro</span>{" "}
              </Button>
            </Link> */}

            {/* Auth Buttons - show Profile/Logout for authenticated Navbar */}
            <>
              <Link to="/profile" className="hidden sm:inline-block">
                <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none">
                  <User className="h-4 w-4 md:mr-2" />{" "}
                  <span className="hidden md:inline">Profile</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="hidden sm:inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white "
              >
                <LogOut className="h-4 w-4 " />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>

            {/* Mobile navigation (Sheet) */}
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
                    {/* Auth links for mobile - show Profile/Logout */}
                    <Link
                      to="/dashboard"
                      className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 py-2 text-base font-medium flex items-center"
                    >
                      Dashboard
                    </Link>
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
                      className="w-full bg-red-500 hover:bg-red-600 text-white mt-2 flex flex-row items-center justify-center "
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                    {/* Common mobile links (always visible) */}
                    <Link
                      to="/blog"
                      className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 py-2 text-base font-medium flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Blog
                    </Link>
                    <Link
                      to="/support"
                      className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 py-2 text-base font-medium flex items-center"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Link>
                    {/* <Link to="/pro" className="block">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Pro
                      </Button>
                    </Link> */}
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

export default AuthenticatedNavbar;

// function Navbar({ isDarkMode, setIsGameOpen, onToggleTheme }: NavbarProps) {
//   const { isAuthenticated, logout, isLoading } = useAuth();
//   const navigate = useNavigate();

//   const openGame = () => {
//     setIsGameOpen(true);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/50 sticky top-0 z-10">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-4">
//           <div className="flex items-center">
//             <QuestApplyLogo variant="full" size="md" />

//             <div className="hidden md:flex ml-10 space-x-4">
//               <Link
//                 to="/dashboard"
//                 className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
//               >
//                 Dashboard
//               </Link>
//               <Link
//                 to="/ranking"
//                 className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center"
//               >
//                 <ListOrdered className="h-4 w-4 mr-1" />
//                 Ranking
//               </Link>
//               <Link
//                 to="/blog"
//                 className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center"
//               >
//                 <FileText className="h-4 w-4 mr-1" />
//                 Blog
//               </Link>
//               <button
//                 onClick={openGame}
//                 className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center group"
//               >
//                 <BookOpen className="h-4 w-4 mr-1 group-hover:animate-pulse" />
//                 <span>TOEFL Game</span>
//                 <motion.span
//                   className="ml-1 inline-block text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full px-2"
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 1, duration: 0.5 }}
//                 >
//                   New!
//                 </motion.span>
//               </button>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium flex items-center">
//                     <HelpCircle className="h-4 w-4 mr-1" />
//                     Help Center
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent
//                   align="end"
//                   className="w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2"
//                 >
//                   <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
//                     <Link
//                       to="/help-center?tab=faqs"
//                       className="flex items-center w-full px-2 py-1.5"
//                     >
//                       FAQs
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
//                     <Link
//                       to="/help-center?tab=video-tutorials"
//                       className="flex items-center w-full px-2 py-1.5"
//                     >
//                       Video Tutorials
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="focus:bg-purple-100 dark:focus:bg-purple-900/30 rounded-md">
//                     <Link
//                       to="/help-center?tab=support-ticket"
//                       className="flex items-center w-full px-2 py-1.5"
//                     >
//                       Support Ticket
//                     </Link>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2 sm:space-x-4">
//             {/* Theme toggle switch */}
//             <div className="flex items-center space-x-2">
//               <Sun
//                 className={`w-5 h-5 ${
//                   isDarkMode ? "text-gray-400" : "text-yellow-500"
//                 }`}
//               />
//               <Switch
//                 checked={isDarkMode}
//                 onCheckedChange={onToggleTheme}
//                 className="data-[state=checked]:bg-blue-600"
//               />
//               <Moon
//                 className={`w-5 h-5 ${
//                   isDarkMode ? "text-blue-400" : "text-gray-400"
//                 }`}
//               />
//             </div>

//             <Link to="/pro" className="hidden sm:inline-block">
//               <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
//                 <Shield className="h-4 w-4" />
//                 <span className="hidden md:inline">Pro</span>{" "}
//               </Button>
//             </Link>

//             {isLoading ? null : isAuthenticated ? (
//               <>
//                 <Link to="/profile" className="hidden sm:inline-block">
//                   <Button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none">
//                     <User className="h-4 w-4 md:mr-2" />{" "}
//                     <span className="hidden md:inline">Profile</span>
//                   </Button>
//                 </Link>
//                 <Button
//                   onClick={handleLogout}
//                   variant="destructive"
//                   className="hidden sm:inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white "
//                 >
//                   <LogOut className="h-4 w-4 " />
//                   <span className="hidden md:inline">Logout</span>
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Link to="/auth?mode=login" className="hidden sm:inline-block">
//                   <Button
//                     variant="outline"
//                     className="border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50"
//                   >
//                     <LogIn className="h-4 w-4 md:mr-2" />
//                     <span className="hidden md:inline">Login</span>
//                   </Button>
//                 </Link>
//                 <Link to="/auth?mode=signup" className="hidden sm:inline-block">
//                   <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none">
//                     <span className="hidden md:inline">Sign Up</span>
//                   </Button>
//                 </Link>
//               </>
//             )}

//             {/* Mobile navigation (Sheet) */}
//             <div className="md:hidden">
//               <Sheet>
//                 <SheetTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Menu className="h-6 w-6" />
//                     <span className="sr-only">Open navigation menu</span>
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent
//                   side="right"
//                   className="w-[250px] sm:w-[300px] bg-white dark:bg-gray-900 pt-8"
//                 >
//                   <nav className="flex flex-col gap-4">
//                     {isLoading ? null : isAuthenticated ? (
//                       <>
//                         <Link
//                           to="/profile"
//                           className=" mt-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 py-2 text-base font-medium flex items-center"
//                         >
//                           <User className="h-4 w-4 mr-2" />
//                           Profile
//                         </Link>
//                         <Button
//                           onClick={handleLogout}
//                           variant="destructive"
//                           className="w-full bg-red-500 hover:bg-red-600 text-white mt-2 flex flex-row items-center justify-center "
//                         >
//                           <LogOut className="h-4 w-4" />
//                           Logout
//                         </Button>
//                       </>
//                     ) : (
//                       <>
//                         <Link to="/auth?mode=login" className="block mt-2">
//                           <Button
//                             variant="outline"
//                             className="w-full border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2"
//                           >
//                             <LogIn className="h-4 w-4" />
//                             Login
//                           </Button>
//                         </Link>
//                         <Link to="/auth?mode=signup" className="block mt-2">
//                           <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none flex items-center justify-center gap-2">
//                             Sign Up
//                           </Button>
//                         </Link>
//                       </>
//                     )}
//                   </nav>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Navbar;
