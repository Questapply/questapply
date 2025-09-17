import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { cn } from "../../lib/utils";
import { Moon, Sun } from "lucide-react";
import { Switch } from "../ui/switch";
import { Link } from "react-router-dom";

interface RankingHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const RankingHeader = ({ isDarkMode, toggleTheme }: RankingHeaderProps) => {
  return (
    <header className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              <Link to="/">QuestApply</Link>
            </div>
            <NavigationMenu className="hidden md:block ml-10">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/dashboard"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    Dashboard
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/ranking"
                    className="px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  >
                    Ranking
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="#"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    Blog
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                    Help Center
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500 to-purple-700 p-6 no-underline outline-none focus:shadow-md"
                            href="#"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium text-white">
                              Documentation
                            </div>
                            <p className="text-sm leading-tight text-white/90">
                              Learn how to use QuestApply to find the perfect
                              university for your future.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30"
                            href="#"
                          >
                            <div className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                              FAQs
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                              Find answers to common questions.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <a
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/30"
                            href="#"
                          >
                            <div className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
                              Contact Support
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600 dark:text-gray-400">
                              Get in touch with our support team.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center space-x-4">
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

            <span className="relative">
              <button className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-200">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                >
                  <path
                    d="M3 6H21M3 12H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </span>
            <span className="relative">
              <button className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-200">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                >
                  <path
                    d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full bg-purple-600 text-xs text-white">
                1
              </span>
            </span>
            <div className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RankingHeader;
