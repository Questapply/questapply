import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";

// import { useAuth } from "@/contexts/AuthContext"; // Original import
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Check, ArrowRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Validation schemas
const signupSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  userType: z.string().min(1, "Please select who you are"),
  referralCode: z.string().optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SignupValues = z.infer<typeof signupSchema>;
type LoginValues = z.infer<typeof loginSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
  onToggleMode: () => void;
  isDarkMode: boolean;
}

// Type guard to safely check if an error object has a 'message' property
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

const AuthForm = ({ mode, onToggleMode, isDarkMode }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, profileCompleted } = useAuth(); // Using the (mock) useAuth hook
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize the correct form based on mode
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      userType: "",
      referralCode: "",
      agreeTerms: false,
    },
  });

  const form = mode === "login" ? loginForm : signupForm;

  const onSubmit = async (values: LoginValues | SignupValues) => {
    setIsLoading(true);
    let url = "";
    let successTitle = "";
    let successDescription = "";
    let errorMessage = "";
    if (mode === "login") {
      url = `${API_URL}/auth/login`;
      successTitle = "Login successful!";
      successDescription = "Welcome back to QuestApply.";
      errorMessage = "Login failed";
    } else {
      url = `${API_URL}/auth/signup`;
      successTitle = "Registration successful!";
      successDescription = "Please complete your profile.";
      errorMessage = "Registration failed";
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorMessage);
      }

      const data = await response.json();
      console.log("Backend response data:", data);

      login(data.token, data.isProfileComplete);

      toast({
        title: successTitle,
        description: data.message || successDescription,
      });

      if (data.isProfileComplete) {
        navigate("/");
      } else {
        navigate("/profile", { state: { applicationType: "applyyourself" } });
      }
    } catch (error) {
      toast({
        title: errorMessage,
        description: isErrorWithMessage(error)
          ? error.message
          : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className={`w-full max-w-md mx-auto p-8 ${
        isDarkMode ? "text-white" : "text-gray-800"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={formVariants}
          className="space-y-6"
        >
          {/* Logo and Welcome message */}
          <motion.div variants={itemVariants} className="text-center">
            <h2
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p
              className={`mt-2 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {mode === "login"
                ? "Sign in to continue your journey"
                : "Join us and start your academic adventure"}
            </p>
          </motion.div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 w-full"
            >
              {/* Full Name - Sign Up only */}
              {mode === "signup" && (
                <motion.div variants={itemVariants}>
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative group">
                            <Input
                              {...field}
                              placeholder="Full Name"
                              className={`h-12 pl-11 pr-4 ${
                                isDarkMode
                                  ? "bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white"
                                  : "bg-gray-50 border-gray-200 focus:border-purple-500"
                              } rounded-lg transition-all duration-200 backdrop-blur-sm`}
                            />
                            <User
                              className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-200 ${
                                isDarkMode
                                  ? "text-gray-400 group-focus-within:text-purple-400"
                                  : "text-gray-400 group-focus-within:text-purple-500"
                              }`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Email Field - Both Login & Sign Up */}
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            {...field}
                            placeholder="Email address"
                            type="email"
                            className={`h-12 pl-11 pr-4 ${
                              isDarkMode
                                ? "bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white"
                                : "bg-gray-50 border-gray-200 focus:border-purple-500"
                            } rounded-lg transition-all duration-200 backdrop-blur-sm`}
                          />
                          <Mail
                            className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-200 ${
                              isDarkMode
                                ? "text-gray-400 group-focus-within:text-purple-400"
                                : "text-gray-400 group-focus-within:text-purple-500"
                            }`}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Password Field - Both Login & Sign Up */}
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`h-12 pl-11 pr-11 ${
                              isDarkMode
                                ? "bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white"
                                : "bg-gray-50 border-gray-200 focus:border-purple-500"
                            } rounded-lg transition-all duration-200 backdrop-blur-sm`}
                          />
                          <Lock
                            className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-200 ${
                              isDarkMode
                                ? "text-gray-400 group-focus-within:text-purple-400"
                                : "text-gray-400 group-focus-within:text-purple-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className={`absolute right-3 top-3 transition-colors duration-200 ${
                              isDarkMode
                                ? "text-gray-400 hover:text-purple-400"
                                : "text-gray-400 hover:text-purple-500"
                            }`}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Additional Sign Up Fields */}
              {mode === "signup" && (
                <>
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={signupForm.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <select
                                {...field}
                                className={`w-full h-12 pl-11 pr-4 rounded-lg ${
                                  isDarkMode
                                    ? "bg-gray-800/70 border-gray-700 text-white focus:border-purple-500"
                                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500"
                                } appearance-none transition-all duration-200 backdrop-blur-sm`}
                              >
                                <option
                                  value=""
                                  className={
                                    isDarkMode ? "bg-gray-800" : "bg-white"
                                  }
                                >
                                  Who are you?
                                </option>
                                <option
                                  value="student"
                                  className={
                                    isDarkMode ? "bg-gray-800" : "bg-white"
                                  }
                                >
                                  Student
                                </option>
                                <option
                                  value="parent"
                                  className={
                                    isDarkMode ? "bg-gray-800" : "bg-white"
                                  }
                                >
                                  Parent
                                </option>
                                <option
                                  value="counselor"
                                  className={
                                    isDarkMode ? "bg-gray-800" : "bg-white"
                                  }
                                >
                                  Counselor
                                </option>
                                <option
                                  value="other"
                                  className={
                                    isDarkMode ? "bg-gray-800" : "bg-white"
                                  }
                                >
                                  Other
                                </option>
                              </select>
                              <User
                                className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-200 ${
                                  isDarkMode
                                    ? "text-gray-400 group-focus-within:text-purple-400"
                                    : "text-gray-400 group-focus-within:text-purple-500"
                                }`}
                              />
                              <div className="absolute right-3 top-5 border-l-4 border-t-4 border-r-4 border-transparent border-t-gray-400 pointer-events-none"></div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={signupForm.control}
                      name="referralCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                {...field}
                                placeholder="Referral Code (optional)"
                                className={`h-12 pl-11 pr-4 ${
                                  isDarkMode
                                    ? "bg-gray-800/70 border-gray-700 focus:border-purple-500 text-white"
                                    : "bg-gray-50 border-gray-200 focus:border-purple-500"
                                } rounded-lg transition-all duration-200 backdrop-blur-sm`}
                              />
                              <User
                                className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-200 ${
                                  isDarkMode
                                    ? "text-gray-400 group-focus-within:text-purple-400"
                                    : "text-gray-400 group-focus-within:text-purple-500"
                                }`}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      control={signupForm.control}
                      name="agreeTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                          <FormControl>
                            <div className="relative flex items-center">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className={`h-4 w-4 rounded border ${
                                    isDarkMode
                                      ? "border-gray-600"
                                      : "border-gray-300"
                                  } appearance-none`}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  id="terms"
                                />
                                {field.value && (
                                  <Check className="h-3 w-3 text-purple-500 absolute top-0.5 left-0.5" />
                                )}
                              </div>
                              <label
                                htmlFor="terms"
                                className={`text-sm ml-2 ${
                                  isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                I agree to the{" "}
                                <span className="text-purple-500 hover:underline cursor-pointer">
                                  Terms & Conditions
                                </span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </>
              )}

              {/* Login Additional Fields */}
              {mode === "login" && (
                <motion.div
                  variants={itemVariants}
                  className="flex items-center justify-between mt-2"
                >
                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <div className="flex items-center">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className={`h-4 w-4 rounded border ${
                                  isDarkMode
                                    ? "border-gray-600"
                                    : "border-gray-300"
                                } appearance-none`}
                                checked={field.value}
                                onChange={field.onChange}
                                id="remember"
                              />
                              {field.value && (
                                <Check className="h-3 w-3 text-purple-500 absolute top-0.5 left-0.5" />
                              )}
                            </div>
                            <label
                              htmlFor="remember"
                              className={`text-sm ml-2 ${
                                isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Remember me
                            </label>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <motion.div
                    variants={itemVariants}
                    className="text-purple-500 text-sm hover:underline cursor-pointer font-medium"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Forgot password?
                  </motion.div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="pt-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300 rounded-lg flex items-center justify-center gap-2 text-white font-medium text-lg shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {mode === "login" ? "Logging in..." : "Signing up..."}
                    </>
                  ) : (
                    <>
                      {mode === "login" ? "Log in" : "Sign up"}
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Toggle mode link */}
              <motion.div variants={itemVariants} className="text-center mt-6">
                {mode === "login" ? (
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                    Don't have an account?{" "}
                    <motion.span
                      onClick={onToggleMode}
                      className="text-purple-500 font-medium hover:underline cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign up here
                    </motion.span>
                  </p>
                ) : (
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                    Already have an account?{" "}
                    <motion.span
                      onClick={onToggleMode}
                      className="text-purple-500 font-medium hover:underline cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Log in here
                    </motion.span>
                  </p>
                )}
              </motion.div>

              {/* Social login options */}
              <motion.div variants={itemVariants} className="mt-6 relative">
                <div
                  className={`absolute inset-0 flex items-center ${
                    isDarkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  <div className="w-full border-t border-current"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className={`px-2 ${
                      isDarkMode
                        ? "bg-gray-900 text-gray-400"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-6 flex justify-center" // 'grid grid-cols-3 gap-3' را به 'flex justify-center' تغییر دادم
              >
                <motion.button
                  key="Google" // حالا key مستقیماً "Google" است
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex justify-center items-center py-2.5 px-6 rounded-lg shadow-sm ${
                    // px-6 را برای padding اضافه کردم
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 border border-gray-700"
                      : "bg-white hover:bg-gray-50 border border-gray-200"
                  } transition-all duration-200`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Google
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthForm;
