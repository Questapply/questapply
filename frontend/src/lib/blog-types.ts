
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  publishedOn: string;
  author: {
    name: string;
    avatar?: string;
  };
  readingTime: number;
  viewCount?: number;
}

export type BlogCategory = 
  | "All" 
  | "TOEFL" 
  | "Statement of Purpose (SOP)" 
  | "Standardized Tests" 
  | "Resume" 
  | "Recommendation Letters" 
  | "PTE" 
  | "Personal Statement" 
  | "MCAT" 
  | "GRE" 
  | "Cover Letter";
