import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Info,
  FileText,
  MenuSquare,
  Sparkles,
  MessageSquare,
  User,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import StrengthsHighlighter from "./StrengthsHighlighter";
import AIHumanizer from "./AIHumanizer";
import ProfessionalTone from "./ProfessionalTone";
import AIImprovement from "./AIImprovement";
import LORSamples from "./LORSamples";
import LORGuidance from "./LORGuidance";
import MyLORs from "./MyLORs";

const CreateLOR = () => {
  const [activeTab, setActiveTab] = useState("guidance");

  return (
    <motion.div
      className="min-h-screen animate-fade-in"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h1
        className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Letter of Recommendation
      </motion.h1>

      <Tabs
        defaultValue="guidance"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full flex mb-6 overflow-x-auto space-x-1 border-b-0">
          <TabsTrigger
            value="guidance"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <Info className="w-4 h-4" />
            <span>Guidance</span>
          </TabsTrigger>
          <TabsTrigger
            value="samples"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>LOR Samples</span>
          </TabsTrigger>
          <TabsTrigger
            value="mylors"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <MenuSquare className="w-4 h-4" />
            <span>My LORs</span>
          </TabsTrigger>
          <TabsTrigger
            value="improvement"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Improvement</span>
          </TabsTrigger>
          <TabsTrigger
            value="strengths"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Highlight Strengths</span>
          </TabsTrigger>
          <TabsTrigger
            value="tone"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Professional Tone</span>
          </TabsTrigger>
          <TabsTrigger
            value="humanizer"
            className="flex items-center gap-1.5 flex-1 data-[state=active]:border-b-2 data-[state=active]:border-b-teal-500 data-[state=active]:text-teal-500 rounded-none border-b-2 border-transparent transition-all"
          >
            <User className="w-4 h-4" />
            <span>AI Humanizer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guidance" className="pt-4">
          <LORGuidance />
        </TabsContent>

        <TabsContent value="samples" className="pt-4">
          <LORSamples />
        </TabsContent>

        <TabsContent value="mylors" className="pt-4">
          <MyLORs />
        </TabsContent>

        <TabsContent value="improvement" className="pt-4">
          <AIImprovement />
        </TabsContent>

        <TabsContent value="strengths" className="pt-4">
          <StrengthsHighlighter />
        </TabsContent>

        <TabsContent value="tone" className="pt-4">
          <ProfessionalTone />
        </TabsContent>

        <TabsContent value="humanizer" className="pt-4">
          <AIHumanizer />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CreateLOR;
