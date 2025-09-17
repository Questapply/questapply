import { useState } from "react";
import { Button } from "../ui/button";
import AnimatedCard from "../ui/animated-card";

const PersonalityTypes = [
  {
    id: "mbti",
    name: "Myers-Briggs Type Indicator",
    icon: "🧠",
    color: "bg-blue-900/30",
    title: "Myers-Briggs",
    subtitle: "Type Indicator",
  },
  {
    id: "disc",
    name: "DISC Assessment",
    icon: "🔄",
    color: "bg-amber-900/30",
    title: "DISC",
    subtitle: "Assessment",
  },
  {
    id: "logical",
    name: "Logical Reasoning",
    icon: "🧩",
    color: "bg-green-900/30",
    title: "Logical",
    subtitle: "Reasoning",
  },
  {
    id: "mathematical",
    name: "Mathematical Aptitude",
    icon: "🔢",
    color: "bg-blue-900/30",
    title: "Mathematical",
    subtitle: "Aptitude",
  },
  {
    id: "analytical",
    name: "Analytical Thinking",
    icon: "🔍",
    color: "bg-purple-900/30",
    title: "Analytical",
    subtitle: "Thinking",
  },
  {
    id: "artistic",
    name: "Artistic Skills",
    icon: "🎨",
    color: "bg-pink-900/30",
    title: "Artistic Skills",
    subtitle: "",
  },
];

// Test categories with colored borders and icons
const TestCategories = [
  {
    title: "Comprehensive Personality Analysis",
    description: "Understand your MBTI, Big Five traits, and strengths",
    icon: "🧠",
    color: "from-blue-500 to-blue-600",
    borderColor: "blue-400",
  },
  {
    title: "Academic Aptitude Assessment",
    description: "Evaluate your mathematical, verbal, and analytical skills",
    icon: "📚",
    color: "from-green-500 to-teal-600",
    borderColor: "green-400",
  },
  {
    title: "Career Path Finder",
    description: "Discover optimal career paths aligned with your abilities",
    icon: "🎯",
    color: "from-red-500 to-red-600",
    borderColor: "red-400",
  },
  {
    title: "Learning Style Assessment",
    description: "Identify how you best acquire and retain information",
    icon: "💡",
    color: "from-yellow-500 to-amber-600",
    borderColor: "yellow-400",
  },
  {
    title: "Graduate Program Matcher",
    description: "Find graduate programs that match your profile",
    icon: "🎓",
    color: "from-purple-500 to-indigo-600",
    borderColor: "purple-400",
  },
  {
    title: "Research Interest Analyzer",
    description: "Discover research areas that align with your strengths",
    icon: "🔬",
    color: "from-pink-500 to-rose-600",
    borderColor: "pink-400",
  },
];

const AiTalentAssessment = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All Tests");

  return (
    <div className="p-6 animate-fade-in bg-gray-900">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Discover Your Academic Potential
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Our AI Talent Test analyzes multiple dimensions of your personality
          and aptitude to provide personalized academic and career
          recommendations that align with your strengths.
        </p>
        <div className="flex gap-4">
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Start Your Assessment
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-purple-700 text-purple-300 hover:bg-purple-900/20"
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Personality Types Grid */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {PersonalityTypes.map((type) => (
          <div
            key={type.id}
            className={`${type.color} p-4 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <div className="font-medium text-gray-200">{type.title}</div>
            <div className="text-sm text-gray-400">{type.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">
          Explore by Type
        </h2>
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {[
            "All Tests",
            "Personality",
            "Aptitude",
            "Career",
            "Academic",
            "Intelligence",
            "Emotional",
          ].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                selectedFilter === filter
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              } transition-colors duration-200`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Test Categories - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {TestCategories.slice(0, 3).map((category, index) => (
          <AnimatedCard
            key={index}
            className="bg-gray-800 overflow-hidden border-t-4"
            style={{ borderTopColor: `var(--${category.borderColor})` }}
            delay={index * 0.1}
          >
            <div className="p-6">
              <div className="text-2xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <Button
                variant="outline"
                className="text-purple-400 border-purple-700 hover:bg-purple-900/20"
              >
                Take Test
              </Button>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Test Categories - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TestCategories.slice(3).map((category, index) => (
          <AnimatedCard
            key={index}
            className="bg-gray-800 overflow-hidden border-t-4"
            style={{ borderTopColor: `var(--${category.borderColor})` }}
            delay={(index + 3) * 0.1}
          >
            <div className="p-6">
              <div className="text-2xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-400 mb-4">{category.description}</p>
              <Button
                variant="outline"
                className="text-purple-400 border-purple-700 hover:bg-purple-900/20"
              >
                Take Test
              </Button>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default AiTalentAssessment;
