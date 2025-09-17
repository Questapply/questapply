import { useState } from "react";

import Hero3 from "../../components/hero/Hero3";
import RoadmapSection from "../../components/roadmap/RoadmapSection";
import SuccessStories from "../../components/shared/SuccessStories";
import CallToAction from "../../components/shared/CallToAction";
import TalentAssessment from "../../components/hero/TalentAssessment";

import Footer from "../../components/home/Footer";

interface IndexPageProps {
  isDarkMode: boolean;
  // onToggleTheme: () => void;
}
const Index = ({ isDarkMode }: IndexPageProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/40 dark:bg-gray-900">
      {/* Header/Navigation */}

      <section className="flex-grow flex items-center bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Hero3 isDarkMode={isDarkMode} />
          <TalentAssessment isDarkMode={isDarkMode} />
        </div>
      </section>

      <RoadmapSection />
      {/* Success Stories Section */}
      <section className="bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mt-12">
            <SuccessStories />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <CallToAction isDarkMode={isDarkMode} />

      {/* Footer Section */}
      <Footer />

      {/* TOEFL Game Dialog */}
      {/* <WordQuestGame open={isGameOpen} onOpenChange={setIsGameOpen} /> */}
    </div>
  );
};

export default Index;
