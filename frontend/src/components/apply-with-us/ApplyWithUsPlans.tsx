import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  DollarSign,
  Plane,
  Users,
  Check,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileText,
  Headphones,
  Clock,
  Mail,
  BadgeCheck,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import { useToast } from "../../hooks/use-toast";

const ApplyWithUsPlans = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan);
    toast({
      title: `${plan} Plan Selected`,
      description: "Great choice! Click continue to proceed.",
    });
  };

  const handleContinue = () => {
    if (selectedPlan) {
      navigate("/apply-with-us/dashboard", { state: { plan: selectedPlan } });
    } else {
      toast({
        title: "Please select a plan",
        description: "You need to select a plan before continuing.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: "bronze",
      name: "Bronze",
      description: "University Admission Only",
      price: "$799",
      icon: <Award className="h-12 w-12 text-amber-500" />,
      color: "from-amber-500 to-orange-500",
      detailedDescription:
        "Perfect for independent applicants who need basic guidance and support for university admissions.",
      features: [
        {
          name: "University Selection Guidance",
          icon: <BookOpen size={18} />,
          description:
            "Get personalized recommendations for universities that match your profile and goals",
        },
        {
          name: "Application Strategy",
          icon: <FileText size={18} />,
          description:
            "Develop a comprehensive strategy for your applications with timeline and priorities",
        },
        {
          name: "Document Review",
          icon: <Check size={18} />,
          description:
            "Professional review of your personal statements, essays, and application materials",
        },
        {
          name: "Basic Email Support",
          icon: <Mail size={18} />,
          description:
            "Email support for questions and guidance throughout your application process",
        },
      ],
    },
    {
      id: "silver",
      name: "Silver",
      description: "Admission + Funding Support",
      price: "$1299",
      icon: <DollarSign className="h-12 w-12 text-slate-400" />,
      color: "from-slate-400 to-slate-500",
      popular: true,
      detailedDescription:
        "Ideal for students seeking both admission guidance and comprehensive funding assistance for their studies.",
      features: [
        {
          name: "Everything in Bronze",
          icon: <Check size={18} />,
          description: "All Bronze plan features included",
        },
        {
          name: "Scholarships & Funding Research",
          icon: <DollarSign size={18} />,
          description:
            "Extensive research and application assistance for scholarships, grants, and funding opportunities",
        },
        {
          name: "Priority Email Support",
          icon: <BadgeCheck size={18} />,
          description:
            "Faster response times and priority handling of your queries and concerns",
        },
        {
          name: "2 Personalized Consultation Calls",
          icon: <Headphones size={18} />,
          description:
            "One-on-one video calls with our experts to discuss strategy and answer detailed questions",
        },
        {
          name: "Application Fee Waivers",
          icon: <FileText size={18} />,
          description:
            "Assistance in obtaining fee waivers for university applications to reduce costs",
        },
      ],
    },
    {
      id: "gold",
      name: "Gold",
      description: "Admission + Funding + Visa Assistance",
      price: "$1999",
      icon: <Sparkles className="h-12 w-12 text-yellow-400" />,
      color: "from-yellow-400 to-amber-600",
      detailedDescription:
        "Complete end-to-end support from application to enrollment, including visa and settlement assistance.",
      features: [
        {
          name: "Everything in Silver",
          icon: <Check size={18} />,
          description: "All Silver plan features included",
        },
        {
          name: "Visa Application Support",
          icon: <Plane size={18} />,
          description:
            "Complete guidance through visa application process, document preparation, and interview prep",
        },
        {
          name: "Accommodation Guidance",
          icon: <Users size={18} />,
          description:
            "Help finding and securing suitable accommodation options near your chosen university",
        },
        {
          name: "24/7 Priority Support",
          icon: <Clock size={18} />,
          description:
            "Round-the-clock support with immediate response to urgent queries and concerns",
        },
        {
          name: "Pre-Departure Orientation",
          icon: <BookOpen size={18} />,
          description:
            "Comprehensive briefing on what to expect, cultural preparation, and practical tips",
        },
        {
          name: "Travel & Settlement Tips",
          icon: <Plane size={18} />,
          description:
            "Detailed guidance on travel arrangements, settling in, and adapting to your new environment",
        },
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header with Theme Toggle */}
      <header className="p-4 flex justify-end">
        <Toggle
          aria-label="Toggle theme"
          pressed={isDarkMode}
          onPressedChange={toggleTheme}
          className="p-2"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Toggle>
      </header>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 px-4 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Choose Your Application Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-6"
            >
              Select the plan that best fits your needs and goals. Each plan
              includes personalized support to help you succeed in your
              application journey.
            </motion.p>

            {/* Fee Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto"
            >
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                <span className="font-semibold">Important:</span> These are the
                application service fees. The official APPLICATION FEE is
                separate.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 
                  ${
                    selectedPlan === plan.id
                      ? "ring-2 ring-green-500 transform scale-[1.02]"
                      : ""
                  }
                  ${plan.popular ? "lg:transform lg:scale-[1.05] z-10" : ""}`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 text-center text-sm font-medium">
                    Most Popular Choice
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`h-20 w-20 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-2">
                    {plan.description}
                  </p>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {plan.detailedDescription}
                  </p>
                  <p className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {plan.price}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start text-gray-700 dark:text-gray-300"
                      >
                        <span className="mr-3 mt-1 text-green-500 dark:text-green-400 flex-shrink-0">
                          {feature.icon}
                        </span>
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {feature.description}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-2 rounded-lg transition-all duration-300 ${
                      selectedPlan === plan.id
                        ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
                        : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center mt-12"
          >
            <Button
              onClick={handleContinue}
              disabled={!selectedPlan}
              className={`bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-10 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${
                !selectedPlan ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ApplyWithUsPlans;
