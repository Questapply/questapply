import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";
import { Loader2, FileText, BookOpen, Download, Send, Save, Target } from "lucide-react";
import { DocumentType, FormField, useGenerationProcess } from "../../utils/GenerationUtils";
import { calculateDocumentScore, getDocumentSections } from "../../utils/QualityAssessment";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import QualityFeedback from "./QualityFeedback";

interface DocumentGeneratorProps {
  documentType: DocumentType;
  onClose: () => void;
  isDarkMode: boolean;
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({ documentType, onClose, isDarkMode }) => {
  const {
    steps,
    currentStep,
    currentStepIndex,
    totalSteps,
    generatedDocument,
    isGenerating,
    updateField,
    generateDocument,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep
  } = useGenerationProcess(documentType);

  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewType, setPreviewType] = useState<"rich" | "plain" | "quality">("rich");
  const [qualityScore, setQualityScore] = useState<any>(null);
  const [documentSections, setDocumentSections] = useState<any[]>([]);

  // Calculate quality score whenever document changes
  useEffect(() => {
    if (generatedDocument) {
      const score = calculateDocumentScore(generatedDocument, documentType);
      const sections = getDocumentSections(generatedDocument, documentType);
      setQualityScore(score);
      setDocumentSections(sections);
    }
  }, [generatedDocument, documentType]);

  // Generate initial document on first render
  useEffect(() => {
    generateDocument();
  }, []);

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="w-full"
            required={field.required}
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={field.value}
            onChange={(e) => updateField(field.id, e.target.value)}
            className="w-full min-h-[120px]"
            required={field.required}
          />
        );
      case "select":
        return (
          <Select value={field.value} onValueChange={(value) => updateField(field.id, value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  const handleGenerateAgain = () => {
    generateDocument();
  };

  const handleNextStep = async () => {
    await generateDocument();
    nextStep();
  };

  const handleFinish = async () => {
    await generateDocument();
    setShowPreview(true);
  };

  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  const renderDocument = () => {
    if (!generatedDocument) return null;
    
    if (previewType === "rich") {
      // Convert the markdown-like document into structured JSX
      const sections = generatedDocument.split('#').filter(Boolean);
      
      return (
        <div className="space-y-6 p-6 max-h-[500px] overflow-y-auto">
          {sections.map((section, idx) => {
            const [title, ...content] = section.split('\n').filter(Boolean);
            
            return (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-3">{title.trim()}</h3>
                {content.map((line, lineIdx) => {
                  const [label, value] = line.split(':').map(part => part.trim());
                  if (!value) return null;
                  
                  return (
                    <div key={lineIdx} className="mb-2 last:mb-0">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}: </span>
                      <span className="text-sm">{value}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    } else if (previewType === "quality") {
      return (
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {qualityScore && (
            <QualityFeedback 
              score={qualityScore} 
              sections={documentSections}
              documentType={documentType}
            />
          )}
        </div>
      );
    } else {
      // Plain text view
      return (
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-x-auto max-h-[500px] overflow-y-auto">
            {generatedDocument}
          </pre>
        </div>
      );
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={`border-2 ${
          documentType === 'sop' 
            ? 'border-purple-500/30 dark:border-purple-500/40' 
            : 'border-blue-500/30 dark:border-blue-500/40'
        } shadow-xl`}>
          <CardHeader className={`${
            documentType === 'sop'
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30'
              : 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {documentType === 'sop' ? (
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <CardTitle>
                  {documentType === 'sop' ? 'Statement of Purpose' : 'Academic CV'} Generator
                </CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {qualityScore && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className={`font-bold ${
                      qualityScore.overall >= 80 ? 'text-green-600' : 
                      qualityScore.overall >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {qualityScore.overall}/100
                    </span>
                  </div>
                )}
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Step {currentStepIndex + 1} of {totalSteps}
                </div>
              </div>
            </div>
            <CardDescription>
              {showPreview 
                ? 'Preview your document and export it' 
                : `Let's create a professional ${documentType === 'sop' ? 'Statement of Purpose' : 'Academic CV'} step by step`}
            </CardDescription>
            {!showPreview && (
              <Progress value={progressPercentage} className="h-1 mt-2" />
            )}
          </CardHeader>
          
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <Tabs defaultValue="rich" onValueChange={(value) => setPreviewType(value as "rich" | "plain" | "quality")} className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="rich">Rich Preview</TabsTrigger>
                      <TabsTrigger value="quality">Quality Analysis</TabsTrigger>
                      <TabsTrigger value="plain">Plain Text</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {renderDocument()}
                
                <CardFooter className="flex justify-between gap-2 border-t border-gray-200 dark:border-gray-700 p-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Back to Editor
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Word
                    </Button>
                    <Button variant="outline">
                      <Send className="mr-2 h-4 w-4" />
                      Review
                    </Button>
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </CardFooter>
              </motion.div>
            ) : (
              <motion.div
                key="step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{currentStep.description}</p>
                    
                      <form className="space-y-4">
                        {currentStep.fields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            <label htmlFor={field.id} className="block text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {renderFormField(field)}
                          </div>
                        ))}
                      </form>
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        onClick={handleGenerateAgain}
                        className={`w-full ${documentType === 'sop' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={isGenerating}
                      >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Generating..." : "Generate Again"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`border rounded-lg ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} p-4 relative h-[400px] overflow-y-auto`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Live Preview
                      </div>
                      {qualityScore && (
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          <span className={`text-xs font-bold ${
                            qualityScore.overall >= 80 ? 'text-green-600' : 
                            qualityScore.overall >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {qualityScore.overall}/100
                          </span>
                        </div>
                      )}
                    </div>
                    {isGenerating ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-400" />
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {renderDocument()}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-2 border-t border-gray-200 dark:border-gray-700 p-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={isFirstStep || isGenerating}
                  >
                    Previous
                  </Button>
                  
                  {isLastStep ? (
                    <Button 
                      onClick={handleFinish}
                      className={`${documentType === 'sop' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={isGenerating}
                    >
                      {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Finish and Preview
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextStep}
                      className={`${documentType === 'sop' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      disabled={isGenerating}
                    >
                      {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Next Step
                    </Button>
                  )}
                </CardFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default DocumentGenerator;
