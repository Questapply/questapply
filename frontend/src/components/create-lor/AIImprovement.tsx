import React, { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "../../hooks/use-toast";
import { Wand } from "lucide-react";

// اگر همین ProgressCircle را در پروژه SOP دارید از همان استفاده کنید
// در غیر این صورت جایگزینش کنید یا حذفش کنید.
import ProgressCircle from "../ui/progress-circle";

const LORImprovement: React.FC = () => {
  // متن‌های ورودی/خروجی
  const [original, setOriginal] = useState<string>("");
  const [improved, setImproved] = useState<string>("");

  // نمونه‌های دم‌دستی (مثل نسخه فعلی شما)
  const examples = {
    generalAssessment: {
      original:
        "I have known Jane Smith for three years as her professor. She's a good student who works hard and gets good grades in my class.",
      improved:
        "I have had the privilege of knowing Jane Smith for the past three years in my capacity as her professor of Advanced Computer Systems. Throughout this time, Jane has consistently demonstrated exceptional analytical ability, creative problem-solving skills, and intellectual curiosity that distinguishes her among her peers.",
    },
    comparisonWithPeers: {
      original:
        "Jane is better than many students I've taught. She ranks high in her class.",
      improved:
        "In my fifteen years of teaching at University College, I can confidently place Jane in the top 5% of students I have encountered. Her academic performance consistently exceeds that of her classmates, and her contributions to class discussions demonstrate a depth of understanding rarely seen at the undergraduate level.",
    },
  };

  // دکمه‌ی Preview (در حال حاضر فقط پیام می‌دهد؛ اگر خواستید می‌توانید Modal diff اضافه کنید)
  const preview = () => {
    if (!original.trim() && !improved.trim()) {
      toast({
        title: "Nothing to preview",
        description: "Add some text first.",
      });
      return;
    }
    toast({
      title: "Preview ready",
      description: "Scroll to compare both sides.",
    });
  };

  // شبیه‌سازی بهبود (اینجا می‌توانید API واقعی بگذارید)
  const runImprove = async () => {
    const src = original.trim();
    if (!src) {
      // اگر چیزی وارد نشده، برای دمو یکی از مثال‌ها را می‌ریزیم
      setOriginal(examples.generalAssessment.original);
      setImproved(examples.generalAssessment.improved);
      toast({
        title: "Example loaded",
        description: "Filled with a sample LOR.",
      });
      return;
    }

    // بهبود ساده‌ی محلی – موقتی
    const better = src
      .replace(/\b(good|nice|very good)\b/gi, "strong")
      .replace(/\b(work|worked|works)\b/gi, "contributed")
      .replace(/\b(class)\b/gi, "Advanced Computer Systems course")
      .concat(
        src.endsWith(".") ? " " : ". ",
        "Her performance places her among the top students I have mentored in recent years."
      );

    setImproved(better);
    toast({
      title: "Improved",
      description: "An improved draft has been generated.",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        AI-Powered LOR Improvement
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Paste your Letter of Recommendation on the left. Our AI suggests
        clearer, stronger wording on the right while preserving your intent and
        voice.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Your Original LOR
          </h3>
          <Textarea
            className="min-h-[400px] font-serif text-base"
            placeholder="Paste your LOR here…"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOriginal(examples.comparisonWithPeers.original);
                setImproved("");
                toast({ title: "Sample inserted" });
              }}
            >
              Load Sample
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOriginal("");
                setImproved("");
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Improved */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            AI Improved Version
          </h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[400px] font-serif text-base bg-gray-50 dark:bg-gray-900/50 whitespace-pre-wrap">
            {improved ? (
              improved
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                AI suggestions will appear here after you submit your LOR…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline" size="lg" className="px-6" onClick={preview}>
          Preview Changes
        </Button>
        <Button
          size="lg"
          className="px-6 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
          onClick={runImprove}
        >
          <Wand className="h-5 w-5 mr-2" />
          Improve My LOR
        </Button>
      </div>

      {/* Analysis cards */}
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          AI Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ProgressCircle value={improved ? 88 : 65} size="md" color="blue" />
            <h4 className="text-lg font-medium mt-4">Clarity Score</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {improved
                ? "Clearer phrasing and stronger verbs."
                : "Paste your LOR to analyze clarity."}
            </p>
          </div>

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ProgressCircle
              value={improved ? 72 : 58}
              size="md"
              color="purple"
            />
            <h4 className="text-lg font-medium mt-4">Distinctiveness</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {improved
                ? "More concrete, specific evidence of impact."
                : "Add details for a stronger distinctiveness score."}
            </p>
          </div>

          <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <ProgressCircle
              value={improved ? 90 : 70}
              size="md"
              color="green"
            />
            <h4 className="text-lg font-medium mt-4">Credibility</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              {improved
                ? "Tone is formal, balanced, and credible."
                : "Use specific roles, dates, and outcomes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LORImprovement;
