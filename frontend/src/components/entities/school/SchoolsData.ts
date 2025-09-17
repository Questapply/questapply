export interface School {
  id: number;
  name: string;

  location: string;
  logo: string;
  state: string;
  ranking: Record<string, number>;
  programs: string[];
  acceptance: number;
  graduation: number;
  cost: {
    inState: number;
    outState: number;
    roomAndBoard: number;
    booksAndSupplies: number;
    otherExpenses: number;
    undergradInState: number;
    gradInState: number;
    undergradOutState: number;
    gradOutState: number;
  };
  favorite: boolean;

  // فیلدهای اضافی (برای صفحه جزئیات، اختیاری)
  description?: string;
  founded?: number;
  type?: string;
  address?: string;
  phone?: string;
  admissionsData?: {
    applied: number;
    admitted: number;
    enrolled: number;
    acceptanceRate: number;
    enrolledRate: number;
    genderDistribution: {
      men: number;
      women: number;
    };
  };
  students?: {
    men: number;
    women: number;
    fullTime: number;
    partTime: number;
    undergrad: number;
    graduate: number;
    total: number;
  };
  race_asian_and_pacific_islander?: string | number | null;
  race_black?: string | number | null;
  race_hispanic?: string | number | null;
  race_native_american?: string | number | null;
  race_white?: string | number | null;
  race_other?: string | number | null;
  studentDemographics?: {
    total: number;
    gender: {
      men: number;
      women: number;
    };
    enrollment: {
      fullTime: number;
      partTime: number;
    };
    level: {
      undergraduate: number;
      graduate: number;
    };
    raceEthnicity: Array<{
      type: string;
      value: number;
      color: string;
    }>;
  };
  programCategories?: Array<{
    name: string;
    image: string;
    programs: Array<{
      name: string;
      level: string;
      type: string;
    }>;
  }>;
  requirements?: Array<{
    program: string;
    level: string;
    type: string;
    deadline: string;
    gre: string;
  }>;
  englishRequirements?: {
    toefl: boolean;
    ielts: boolean;
    duolingo: boolean;
    melab: boolean;
    pte: boolean;
  };
  otherRequirements?: {
    sop: boolean;
    transcript: boolean;
    resumeCV: boolean;
    recommendations: boolean;
    applicationForm: boolean;
  };
  costBreakdown?: {
    tuition: number;
    roomAndBoard: number;
    booksAndSupplies: number;
    otherExpenses: number;
  };
}

export interface Program {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  fit: string;
  duration: string;
  format: string;
  language: string;
  campus: string;
  qsRanking: string;
  deadline: Array<{ season: string; date: string }>;
  requirements: {
    toefl: { min: number; avg?: number };
    gpa: { min: number; avg?: number };
    gre: {
      status: string;
      total?: { avg: number };
      verbal?: { avg: number };
      quantitative?: { avg: number };
      writing?: { avg: number };
    };
    ielts: number | null;
    duolingo: string | null;
    melab: number | null;
    pte: string | null;
    cael: number | null;
    greSubject: string | null;
    lsat: string | null;
    gmat: string | null;
  };
  favorite: boolean;
  tuition: string | null;
  livingCost: string | null;
  country: string;
  state: string;
}

// export const schools: School[] = [
//   {
//     id: 1,
//     name: "Harvard University",
//     location: "Cambridge, Massachusetts",
//     logo: "/placeholder.svg",
//     ranking: {
//       qs: 1,
//       usNews: 3,
//       forbes: 15,
//       shanghai: 1,
//       the: 1,
//     },
//     programs: [
//       "Ph.D: 74 Programs",
//       "Master: 13 Programs",
//       "Bachelor: 62 Programs",
//     ],
//     acceptance: 5,
//     graduation: 98,
//     cost: {
//       inState: 22441,
//       outState: 91403,
//     },
//     favorite: false,
//     description:
//       "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Founded in 1636 as Harvard College and named for its first benefactor, the Puritan clergyman John Harvard. It is the oldest institution of higher learning in the United States and one of the most prestigious and highly ranked universities in the world.",
//     founded: 1636,
//     type: "Private Research University",
//     address: "Cambridge, MA, United States",
//     phone: "+1 617-495-1000",
//     admissionsData: {
//       applied: 40248,
//       admitted: 2015,
//       enrolled: 1407,
//       acceptanceRate: 5,
//       enrolledRate: 70,
//       genderDistribution: {
//         men: 48,
//         women: 52,
//       },
//     },
//     studentDemographics: {
//       total: 30391,
//       gender: {
//         men: 14509,
//         women: 15882,
//       },
//       enrollment: {
//         fullTime: 19030,
//         partTime: 11361,
//       },
//       level: {
//         undergraduate: 8527,
//         graduate: 21864,
//       },
//       raceEthnicity: [
//         { type: "White", value: 43.5, color: "#80CBC4" },
//         { type: "Asian and Pacific Islander", value: 19.8, color: "#5E35B1" },
//         { type: "Hispanic", value: 12.9, color: "#BA68C8" },
//         { type: "Black", value: 7.9, color: "#7986CB" },
//         { type: "Other", value: 10.9, color: "#FF8A65" },
//       ],
//     },
//     programCategories: [
//       {
//         name: "Humanities",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "History", level: "Bachelor's", type: "B.A." },
//           { name: "Philosophy", level: "Master's", type: "M.A." },
//           { name: "Literature", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Social Sciences",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Economics", level: "Bachelor's", type: "B.A." },
//           { name: "Political Science", level: "Master's", type: "M.A." },
//           { name: "Psychology", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Engineering & Technology",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Computer Science", level: "Bachelor's", type: "B.S." },
//           { name: "Electrical Engineering", level: "Master's", type: "M.S." },
//           { name: "Systems Engineering", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Journalism & Media",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Journalism", level: "Bachelor's", type: "B.A." },
//           { name: "Media Studies", level: "Master's", type: "M.A." },
//           { name: "Film Production", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Mathematics and Natural Science",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Mathematics", level: "Bachelor's", type: "B.S." },
//           { name: "Physics", level: "Master's", type: "M.S." },
//           { name: "Chemistry", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Education & Training",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Education", level: "Bachelor's", type: "B.A." },
//           { name: "Educational Leadership", level: "Master's", type: "M.Ed." },
//           { name: "Curriculum Design", level: "Ph.D.", type: "Ed.D." },
//         ],
//       },
//       {
//         name: "Business and Management",
//         image: "/placeholder.svg",
//         programs: [
//           {
//             name: "Business Administration",
//             level: "Bachelor's",
//             type: "B.B.A.",
//           },
//           { name: "Finance", level: "Master's", type: "M.B.A." },
//           { name: "Marketing", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//       {
//         name: "Arts & Design",
//         image: "/placeholder.svg",
//         programs: [
//           { name: "Fine Arts", level: "Bachelor's", type: "B.F.A." },
//           { name: "Graphic Design", level: "Master's", type: "M.F.A." },
//           { name: "Art History", level: "Ph.D.", type: "Ph.D." },
//         ],
//       },
//     ],
//     requirements: [
//       {
//         program: "Design Engineering",
//         level: "Master",
//         type: "M.D.E.",
//         deadline: "December 1",
//         gre: "Not Required",
//       },
//       {
//         program: "History of Art and Architecture",
//         level: "Ph.D.",
//         type: "Doctor Of Philosophy",
//         deadline: "January 5",
//         gre: "Not Accepted",
//       },
//       {
//         program: "Bioengineering",
//         level: "Bachelor",
//         type: "A.B.",
//         deadline: "January 20",
//         gre: "Not Accepted",
//       },
//       {
//         program: "Bioengineering",
//         level: "Ph.D.",
//         type: "Doctor of Philosophy",
//         deadline: "December 15",
//         gre: "Not Accepted",
//       },
//       {
//         program: "Biomedical Engineering",
//         level: "Bachelor",
//         type: "A.B.",
//         deadline: "January 20",
//         gre: "Not Accepted",
//       },
//       {
//         program: "Biomedical Informatics",
//         level: "Ph.D.",
//         type: "Doctor Of Philosophy",
//         deadline: "December 1",
//         gre: "Optional",
//       },
//     ],
//     englishRequirements: {
//       toefl: true,
//       ielts: true,
//       duolingo: false,
//       melab: false,
//       pte: false,
//     },
//     otherRequirements: {
//       sop: true,
//       transcript: true,
//       resumeCV: true,
//       recommendations: true,
//       applicationForm: true,
//     },
//     costBreakdown: {
//       tuition: 68123,
//       roomAndBoard: 18941,
//       booksAndSupplies: 900,
//       otherExpenses: 2600,
//     },
//   },
//   {
//     id: 2,
//     name: "Stanford University",
//     location: "Stanford, California",
//     logo: "/placeholder.svg",
//     ranking: {
//       qs: 2,
//       usNews: 4,
//       forbes: 10,
//       shanghai: 2,
//       the: 3,
//     },
//     programs: [
//       "Ph.D: 74 Programs",
//       "Master: 51 Programs",
//       "Bachelor: 58 Programs",
//     ],
//     acceptance: 4,
//     graduation: 96,
//     cost: {
//       inState: 18491,
//       outState: 77740,
//     },
//     favorite: false,
//     // ... add similar detailed information for Stanford
//   },
//   {
//     id: 3,
//     name: "Massachusetts Institute of Technology",
//     location: "Cambridge, Massachusetts",
//     logo: "/placeholder.svg",
//     ranking: {
//       qs: 3,
//       usNews: 2,
//       forbes: 4,
//       shanghai: 4,
//       the: 2,
//     },
//     programs: [
//       "Ph.D: 65 Programs",
//       "Master: 46 Programs",
//       "Bachelor: 55 Programs",
//     ],
//     acceptance: 7,
//     graduation: 95,
//     cost: {
//       inState: 20454,
//       outState: 83250,
//     },
//     favorite: true,
//     // ... add similar detailed information for MIT
//   },
// ];
