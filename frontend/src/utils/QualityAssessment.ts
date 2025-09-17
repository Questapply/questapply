
export interface QualityScore {
  overall: number;
  breakdown: {
    clarity: number;
    specificity: number;
    structure: number;
    completeness: number;
    relevance: number;
  };
  weaknesses: string[];
  strengths: string[];
  suggestions: string[];
}

export interface DocumentSection {
  id: string;
  name: string;
  required: boolean;
  present: boolean;
  quality: number;
  content?: string;
}

export const calculateDocumentScore = (content: string, documentType: 'sop' | 'cv'): QualityScore => {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  
  // Calculate individual scores
  const clarity = calculateClarity(content, avgSentenceLength);
  const specificity = calculateSpecificity(content);
  const structure = calculateStructure(content, documentType);
  const completeness = calculateCompleteness(content, documentType);
  const relevance = calculateRelevance(content, documentType);
  
  const overall = Math.round((clarity + specificity + structure + completeness + relevance) / 5);
  
  return {
    overall,
    breakdown: { clarity, specificity, structure, completeness, relevance },
    weaknesses: identifyWeaknesses(content, { clarity, specificity, structure, completeness, relevance }),
    strengths: identifyStrengths(content, { clarity, specificity, structure, completeness, relevance }),
    suggestions: generateSuggestions(content, documentType, { clarity, specificity, structure, completeness, relevance })
  };
};

const calculateClarity = (content: string, avgSentenceLength: number): number => {
  let score = 85;
  
  // Penalize overly long sentences
  if (avgSentenceLength > 25) score -= 15;
  else if (avgSentenceLength > 20) score -= 10;
  
  // Check for passive voice overuse
  const passiveIndicators = /\b(was|were|been|being)\s+\w+ed\b/gi;
  const passiveCount = (content.match(passiveIndicators) || []).length;
  const wordCount = content.split(/\s+/).length;
  if (passiveCount / wordCount > 0.1) score -= 10;
  
  // Check for clarity markers
  const clarityMarkers = /\b(specifically|for example|in particular|namely|such as)\b/gi;
  const markerCount = (content.match(clarityMarkers) || []).length;
  if (markerCount > 0) score += 5;
  
  return Math.max(0, Math.min(100, score));
};

const calculateSpecificity = (content: string): number => {
  let score = 70;
  
  // Look for specific examples and metrics
  const specificIndicators = /\b(\d+%|\d+\.\d+|\$\d+|increased|decreased|improved|reduced|achieved|developed|led|managed)\b/gi;
  const specificCount = (content.match(specificIndicators) || []).length;
  score += Math.min(20, specificCount * 3);
  
  // Penalize vague language
  const vagueWords = /\b(many|some|various|several|good|nice|great|excellent|amazing)\b/gi;
  const vagueCount = (content.match(vagueWords) || []).length;
  score -= Math.min(15, vagueCount * 2);
  
  return Math.max(0, Math.min(100, score));
};

const calculateStructure = (content: string, documentType: 'sop' | 'cv'): number => {
  let score = 80;
  
  if (documentType === 'sop') {
    // Check for typical SOP structure
    const hasIntro = /\b(motivation|inspired|interest|passion|pursue)\b/i.test(content);
    const hasBackground = /\b(experience|background|education|research)\b/i.test(content);
    const hasGoals = /\b(goal|objective|aim|plan|future|career)\b/i.test(content);
    
    if (hasIntro) score += 5;
    if (hasBackground) score += 5;
    if (hasGoals) score += 5;
  }
  
  // Check for logical flow indicators
  const transitionWords = /\b(furthermore|additionally|however|therefore|consequently|meanwhile|subsequently)\b/gi;
  const transitionCount = (content.match(transitionWords) || []).length;
  score += Math.min(10, transitionCount * 2);
  
  return Math.max(0, Math.min(100, score));
};

const calculateCompleteness = (content: string, documentType: 'sop' | 'cv'): number => {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  if (documentType === 'sop') {
    if (wordCount < 200) return 30;
    if (wordCount < 400) return 60;
    if (wordCount < 600) return 85;
    if (wordCount > 1000) return 70; // Too long
    return 95;
  } else {
    // CV scoring based on content richness
    if (wordCount < 150) return 40;
    if (wordCount < 300) return 70;
    return 90;
  }
};

const calculateRelevance = (content: string, documentType: 'sop' | 'cv'): number => {
  let score = 75;
  
  if (documentType === 'sop') {
    const academicTerms = /\b(research|study|academic|university|program|degree|field|knowledge|learning)\b/gi;
    const academicCount = (content.match(academicTerms) || []).length;
    score += Math.min(15, academicCount * 1);
  } else {
    const professionalTerms = /\b(experience|skills|project|team|responsibility|achievement|leadership|technical)\b/gi;
    const professionalCount = (content.match(professionalTerms) || []).length;
    score += Math.min(15, professionalCount * 1);
  }
  
  return Math.max(0, Math.min(100, score));
};

const identifyWeaknesses = (content: string, scores: any): string[] => {
  const weaknesses: string[] = [];
  
  if (scores.clarity < 70) {
    weaknesses.push("Consider simplifying complex sentences for better clarity");
  }
  if (scores.specificity < 60) {
    weaknesses.push("Add specific examples and quantifiable achievements");
  }
  if (scores.structure < 70) {
    weaknesses.push("Improve document structure with better transitions");
  }
  if (scores.completeness < 70) {
    weaknesses.push("Document appears incomplete or too brief");
  }
  if (scores.relevance < 70) {
    weaknesses.push("Include more relevant keywords and terminology");
  }
  
  return weaknesses;
};

const identifyStrengths = (content: string, scores: any): string[] => {
  const strengths: string[] = [];
  
  if (scores.clarity >= 85) {
    strengths.push("Excellent clarity and readability");
  }
  if (scores.specificity >= 80) {
    strengths.push("Strong use of specific examples and metrics");
  }
  if (scores.structure >= 85) {
    strengths.push("Well-organized structure with good flow");
  }
  if (scores.completeness >= 85) {
    strengths.push("Comprehensive and well-detailed content");
  }
  if (scores.relevance >= 85) {
    strengths.push("Highly relevant content for your field");
  }
  
  return strengths;
};

const generateSuggestions = (content: string, documentType: 'sop' | 'cv', scores: any): string[] => {
  const suggestions: string[] = [];
  
  if (scores.specificity < 75) {
    suggestions.push("Add specific numbers, percentages, or metrics to strengthen your claims");
  }
  if (scores.clarity < 75) {
    suggestions.push("Break down long sentences and use active voice more frequently");
  }
  if (documentType === 'sop' && scores.structure < 75) {
    suggestions.push("Consider restructuring with clear introduction, body, and conclusion sections");
  }
  
  return suggestions;
};

export const getDocumentSections = (content: string, documentType: 'sop' | 'cv'): DocumentSection[] => {
  if (documentType === 'sop') {
    return [
      {
        id: 'introduction',
        name: 'Introduction/Hook',
        required: true,
        present: /\b(motivation|inspired|interest|passion)\b/i.test(content),
        quality: calculateSectionQuality(content, 'introduction')
      },
      {
        id: 'background',
        name: 'Academic/Professional Background',
        required: true,
        present: /\b(experience|background|education|degree)\b/i.test(content),
        quality: calculateSectionQuality(content, 'background')
      },
      {
        id: 'research',
        name: 'Research Interests',
        required: true,
        present: /\b(research|study|investigation|analysis)\b/i.test(content),
        quality: calculateSectionQuality(content, 'research')
      },
      {
        id: 'goals',
        name: 'Future Goals',
        required: true,
        present: /\b(goal|objective|aim|plan|future|career)\b/i.test(content),
        quality: calculateSectionQuality(content, 'goals')
      },
      {
        id: 'fit',
        name: 'Program Fit',
        required: true,
        present: /\b(program|university|institution|fit|align)\b/i.test(content),
        quality: calculateSectionQuality(content, 'fit')
      }
    ];
  } else {
    return [
      {
        id: 'contact',
        name: 'Contact Information',
        required: true,
        present: /\b(email|phone|address)\b/i.test(content),
        quality: calculateSectionQuality(content, 'contact')
      },
      {
        id: 'education',
        name: 'Education',
        required: true,
        present: /\b(education|degree|university|college)\b/i.test(content),
        quality: calculateSectionQuality(content, 'education')
      },
      {
        id: 'experience',
        name: 'Work Experience',
        required: true,
        present: /\b(experience|work|employment|position)\b/i.test(content),
        quality: calculateSectionQuality(content, 'experience')
      },
      {
        id: 'skills',
        name: 'Skills',
        required: true,
        present: /\b(skills|technical|programming|software)\b/i.test(content),
        quality: calculateSectionQuality(content, 'skills')
      },
      {
        id: 'publications',
        name: 'Publications',
        required: false,
        present: /\b(publication|paper|journal|conference)\b/i.test(content),
        quality: calculateSectionQuality(content, 'publications')
      }
    ];
  }
};

const calculateSectionQuality = (content: string, sectionType: string): number => {
  // Basic quality assessment for sections
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 50) return 40;
  if (wordCount < 100) return 70;
  return 85;
};
