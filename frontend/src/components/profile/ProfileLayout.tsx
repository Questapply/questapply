import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Sun, Moon, ArrowRight, Home, LayoutDashboard } from "lucide-react";
import { Toggle } from "../ui/toggle";
import { useToast } from "../ui/use-toast";
import StepNavigation from "./StepNavigation";
import StepContent from "./StepContent";
import { Step, StepData, ProfileStep } from "./ProfileTypes";
import { countriesMap } from "../../lib/constants/countries";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Define the steps
const steps: Step[] = [
  { id: "citizenship", title: "Citizenship & Residency", icon: "Flag" },
  { id: "education", title: "Education", icon: "School" },
  { id: "goals", title: "Destination", icon: "Globe" },
  { id: "language", title: "Language Proficiency", icon: "Languages" },
  { id: "tests", title: "Standardized Tests", icon: "TestTube" },
  { id: "priorities", title: "Application Priorities", icon: "Target" },
  { id: "financial", title: "Financial Status", icon: "DollarSign" },
  { id: "programs", title: "Number of Programs", icon: "List" },
  { id: "complete", title: "Complete", icon: "Check" },
];
const computeCompletionMap = (d: StepData) => ({
  citizenship: Boolean(d.citizenship?.country && d.citizenship?.residence),
  education: Boolean(
    d.education?.degree ||
      d.education?.university ||
      d.education?.major ||
      d.education?.gpa
  ),
  goals: Boolean(d.goals?.country && d.goals?.level),
  language: Boolean(d.language?.test && d.language?.score),
  tests: Boolean(d.tests?.type), // ساده و بی‌خطر؛ لاجیک دقیق داخل خود مرحله است
  priorities: Boolean(d.priorities?.options?.length),
  financial: Boolean(
    d.financial &&
      (d.financial.budget || d.financial.requiresFunding !== undefined)
  ),
  programs: Boolean(d.programs && d.programs.count > 0),
  complete: true,
});
interface ProfileLayoutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const ProfileLayout = ({ isDarkMode, onToggleTheme }: ProfileLayoutProps) => {
  const location = useLocation();
  const applicationType = location.state?.applicationType || "applyyourself";
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<ProfileStep>("citizenship");
  const [progress, setProgress] = useState(0);

  // افزودن state جدید برای نگهداری وضعیت بارگذاری
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { setProfileCompletionStatus, profileCompleted } = useAuth();

  const editMode = !!profileCompleted;

  const filteredSteps = useMemo(() => {
    if (applicationType === "applyyourself") {
      return steps.filter(
        (step) =>
          step.id !== "priorities" &&
          step.id !== "financial" &&
          step.id !== "programs"
      );
    }
    return steps;
  }, [applicationType]);

  const [formData, setFormData] = useState<StepData>({
    citizenship: { country: "", residence: "" },
    education: { degree: "", university: "", major: "", gpa: "" },
    goals: { country: "", level: "", field: "", availableFields: [] },
    language: { test: "", score: "" },
    tests: { type: "", scores: {} },
    priorities: { options: [] },
    financial: { requiresFunding: false, budget: "" },
    programs: { count: 0 },
  });

  useEffect(() => {
    if (!editMode) return;
    const stepQuery = searchParams.get("step");
    if (!stepQuery) return;
    const exists = filteredSteps.some((s) => s.id === stepQuery);
    if (exists) setCurrentStep(stepQuery as ProfileStep);
  }, [editMode, filteredSteps, searchParams]);

  // دریافت داده‌های پروفایل از API
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        // Check if token already has Bearer prefix
        const tokenToUse = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        // استفاده از آدرس کامل API
        const profileRes = await fetch(`${API_URL}/user/profile-form`, {
          headers: { Authorization: tokenToUse, Accept: "application/json" },
        });

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error("API Error:", profileRes.status, errorText);
          throw new Error(`Failed to fetch profile data: ${profileRes.status}`);
        }

        const data = await profileRes.json();
        console.log("ProfileLayout: Received profile data from API:", data); // **این لاگ مهم است**
        console.log(
          "ProfileLayout: isProfileComplete from API:",
          data.isProfileComplete
        );
        setProfileCompletionStatus(data.isProfileComplete || false);
        // آپدیت کردن formData با داده‌های دریافتی
        setFormData((prevData) => {
          return {
            ...prevData,
            citizenship: {
              country: data.citizenship?.country?.name || "",
              residence: data.citizenship?.residence?.name || "",
            },
            education: {
              degree: data.education?.degree || "",
              university: data.education?.university || "",
              major: data.education?.major || "",
              gpa: data.education?.gpa || "",
            },
            goals: data.goals || {
              country: "",
              level: "",
              field: "",
              availableFields: [],
            },
            language: data.language || {
              test: "",
              score: "",
            },
            tests: data.tests || {
              type: "",
              scores: {},
            },
          };
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [setProfileCompletionStatus]);

  const completionMap = useMemo(
    () => computeCompletionMap(formData),
    [formData]
  );
  useEffect(() => {
    const ids = filteredSteps.map((s) => s.id);

    // 'complete' را از مخرج حذف می‌کنیم تا قبل از مرحله نهایی هم درصد معنی‌دار باشد
    const denomIds = ids.filter((id) => id !== "complete");
    const denom = Math.max(denomIds.length, 1);

    const doneCount = denomIds.reduce((acc, id) => {
      return acc + (completionMap[id as keyof typeof completionMap] ? 1 : 0);
    }, 0);

    setProgress(Math.round((doneCount / denom) * 100));
  }, [completionMap, filteredSteps]);

  const handleNext = async (data: any) => {
    // Find the current step index
    const currentIndex = steps.findIndex((step) => step.id === currentStep);

    // Check if this is a "back" navigation
    if (data.type === "back") {
      // Move back one step if possible
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1].id as ProfileStep);
      }
      return;
    }

    // ذخیره داده‌ها در سرور (برای مراحل citizenship و education)
    if (
      currentStep === "citizenship" ||
      currentStep === "education" ||
      currentStep === "goals" ||
      currentStep === "language" ||
      currentStep === "tests"
    ) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Check if token already has Bearer prefix
        const tokenToUse = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        const apiUrl = `${API_URL}/user/profile-form`;

        let requestBody = {};

        if (currentStep === "citizenship") {
          // تبدیل نام کشور به فرمت مورد نیاز سرور (کد و نام)
          const citizenshipData = {
            country: {
              name: data.country,
              code: countriesMap[data.country] || "",
            },
            residence: {
              name: data.residence,
              code: countriesMap[data.residence] || "",
            },
          };
          requestBody = { citizenship: citizenshipData };
        } else if (currentStep === "education") {
          // ارسال مستقیم داده‌های education
          requestBody = { education: data };
        } else if (currentStep === "goals") {
          // ارسال داده‌های goals
          requestBody = { goals: data };
        } else if (currentStep === "language") {
          // ارسال داده‌های language
          requestBody = { language: data };
        } else if (currentStep === "tests") {
          // ارسال داده‌های tests
          requestBody = { tests: data };
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: tokenToUse,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(
            `Failed to save ${currentStep} data: ${response.status}`
          );
        }

        // داده‌ها با موفقیت ذخیره شدند
      } catch (error) {
        console.error(`Error saving ${currentStep} data:`, error);
        // نمایش پیام خطا به کاربر
        toast({
          title: "Error",
          description: `Failed to save ${currentStep} data. Please try again.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Update form data for forward navigation
    setFormData((prevData) => ({
      ...prevData,
      [currentStep]: data,
    }));

    // If this is the last step, finalize the process and navigate to plans page
    if (currentStep === "complete") {
      navigate("/apply-with-us/plans");
      return;
    }

    // If this is the second-to-last step, navigate to the complete step
    if (currentIndex === steps.length - 2) {
      setCurrentStep("complete");

      // Show success toast
      toast({
        title: "Profile Almost Complete!",
        description: "Just one more step to finalize your profile.",
      });
    } else if (currentIndex < filteredSteps.length - 2) {
      // Move to the next step
      setCurrentStep(filteredSteps[currentIndex + 1].id as ProfileStep);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header with Theme Toggle */}
      <header className="p-4 flex items-center justify-between md:justify-around">
        <div className="flex items-center gap-2">
          {/* وقتی پروفایل کامل نیست: رفتن به صفحه اصلی */}
          {!profileCompleted && (
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-gray-600 dark:text-gray-300"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          )}

          {/* وقتی پروفایل کامل است: رفتن به داشبورد */}
          {profileCompleted && (
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          )}
        </div>

        {/* Theme toggle (سمت راست) */}
        <Toggle
          aria-label="Toggle theme"
          pressed={isDarkMode}
          onPressedChange={onToggleTheme}
          className="p-2"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Toggle>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div
          className={`w-full ${
            applicationType === "applyyourself" ? "max-w-4xl" : "max-w-6xl"
          }`}
        >
          {/* Progress Bar */}
          <div className="mb-10 px-8 md:px-16">
            <div className="flex flex-col gap-2 mb-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Completion
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Complete your profile to get personalized university
                recommendations
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <StepNavigation
            steps={filteredSteps}
            currentStep={currentStep}
            progress={progress}
            enableClicks={editMode}
            onStepClick={(id) => {
              if (!editMode) {
                toast({
                  title: "Complete your profile first",
                  description:
                    "You can jump between steps after completing your profile.",
                });
                return;
              }
              setCurrentStep(id);
              setSearchParams({ step: id });
            }}
            completedMap={computeCompletionMap(formData)}
          />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <StepContent
                currentStep={currentStep}
                onNext={handleNext}
                data={formData}
                applicationType={applicationType}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Skip button (except for complete step) */}
      {/* {currentStep !== 'complete' && (
        <div className="flex justify-center p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Skip for now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default ProfileLayout;
