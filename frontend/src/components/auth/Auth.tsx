import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import AuthForm from "@/components/auth/AuthForm";
import { Sun, Moon } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import Navbar from "../home/Navbar";
import Footer from "../home/Footer";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Get current mode from document
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Animation variants
  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.3,
      },
    },
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen">
      <Navbar onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <div className="flex-grow flex items-center justify-center p-4">
        {/* Dynamic background with gradient and animated shapes */}
        <motion.div
          className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
          initial="hidden"
          animate="visible"
          variants={backgroundVariants}
        >
          <div
            className={`absolute inset-0 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-900"
                : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100"
            }`}
          >
            {/* Animated decorative elements */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{
                background: isDarkMode
                  ? "linear-gradient(to right, #4f46e5, #7e22ce)"
                  : "linear-gradient(to right, #818cf8, #c084fc)",
              }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, -30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
            <motion.div
              className="absolute bottom-1/3 left-1/5 w-56 h-56 rounded-full opacity-10 blur-3xl"
              style={{
                background: isDarkMode
                  ? "linear-gradient(to right, #0ea5e9, #7c3aed)"
                  : "linear-gradient(to right, #60a5fa, #a78bfa)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                x: [0, 40, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
              style={{
                background: isDarkMode
                  ? "linear-gradient(to right, #be123c, #6d28d9)"
                  : "linear-gradient(to right, #f9a8d4, #c4b5fd)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                x: [0, -50, 0],
                y: [0, 40, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          {/* Theme toggle */}
          <div className="absolute top-4 right-4 z-50">
            <Toggle
              pressed={!isDarkMode}
              onPressedChange={toggleTheme}
              variant="outline"
              className={`rounded-full p-2 ${
                isDarkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-800"
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Toggle>
          </div>

          <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl">
            {/* Left side - Branding/Image (hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
              <div
                className={`flex flex-col justify-between h-full w-full ${
                  isDarkMode ? "bg-indigo-900" : "bg-indigo-100"
                } p-12`}
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="flex items-center"
                  >
                    <span
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-white" : "text-indigo-900"
                      }`}
                    >
                      Quest<span className="text-purple-500">Apply</span>
                    </span>
                  </motion.div>

                  <motion.h2
                    className={`text-4xl font-bold mt-12 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.7 }}
                  >
                    Start Your Academic Journey Today
                  </motion.h2>

                  <motion.p
                    className={`text-xl mt-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.7 }}
                  >
                    Join thousands of students who found their perfect
                    university match with our AI-powered platform.
                  </motion.p>
                </div>

                <motion.div
                  className="relative h-56 w-full mt-8 rounded-lg overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.7 }}
                >
                  <div
                    className={`absolute inset-0 ${
                      isDarkMode ? "bg-indigo-800/60" : "bg-indigo-200/60"
                    } rounded-lg backdrop-blur-sm`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p
                          className={`text-lg font-medium ${
                            isDarkMode ? "text-indigo-100" : "text-indigo-900"
                          }`}
                        >
                          "QuestApply helped me get into my dream university!"
                        </p>
                        <p
                          className={`mt-2 ${
                            isDarkMode ? "text-indigo-200" : "text-indigo-700"
                          }`}
                        >
                          — Sarah, MIT Graduate
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right side - Auth form */}
            <div
              className={`w-full lg:w-1/2 ${
                isDarkMode ? "bg-gray-900/90" : "bg-white/90"
              } backdrop-blur-sm`}
            >
              <AuthForm
                mode={mode}
                onToggleMode={toggleMode}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Auth;
