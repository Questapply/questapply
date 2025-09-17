import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  { id: "profile", name: "Profile Setup and Management", icon: "👤" },
  { id: "dashboard", name: "Dashboard", icon: "📊" },
  { id: "schools", name: "Finding Schools", icon: "🏫" },
  { id: "programs", name: "Finding Programs", icon: "📚" },
  { id: "professors", name: "Finding Professors", icon: "👨‍🏫" },
  { id: "plans", name: "Plans", icon: "💎" },
  { id: "payments", name: "Payments", icon: "💳" },
  { id: "referral", name: "Referral Codes", icon: "🔗" },
  { id: "technical", name: "Technical Issues", icon: "💻" },
  { id: "resume", name: "Resume", icon: "📄" },
  { id: "sop", name: "Statement of Purpose", icon: "🎯" },
  { id: "recommendation", name: "Recommendation Letter", icon: "✉️" },
  { id: "apply", name: "Apply Now", icon: "📝" },
  { id: "cover", name: "Cover Letter", icon: "📋" },
  { id: "personal", name: "Personal Statement", icon: "💼" },
];

const faqQuestions: Record<string, { question: string; answer: string }[]> = {
  profile: [
    {
      question: "How do I create a new profile?",
      answer: "Click 'Sign Up' and follow the guided steps.",
    },
    {
      question: "Can I update my info later?",
      answer: "Yes, go to Profile → Edit Profile.",
    },
  ],
  dashboard: [
    {
      question: "What does dashboard show?",
      answer: "Progress, saved universities, deadlines, and recommendations.",
    },
  ],
  // سایر دسته‌ها را به‌مرور اضافه کن
};

export default function HelpCenterFaqs() {
  const [selectedCategory, setSelectedCategory] = useState("profile");
  const items = faqQuestions[selectedCategory] || [];

  return (
    <div className="space-y-8">
      {/* دسته‌ها */}
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          Explore FAQs by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {faqCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`rounded-lg p-4 text-center transition border
                ${
                  selectedCategory === c.id
                    ? "border-purple-500 dark:border-purple-400"
                    : "border-gray-200 dark:border-gray-700"
                }
                bg-white dark:bg-gray-800 hover:shadow`}
            >
              <div className="text-2xl mb-2">{c.icon}</div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* سوال‌ها */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {faqCategories.find((c) => c.id === selectedCategory)?.name}
          </h3>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {items.map((faq, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
