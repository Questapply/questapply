export interface ProgramDetail {
  id: number;
  name: string;
  degree: string;
  school: string;
  schoolLogo: string;
  degreeType: string;
  fit: string;
  ranking: number;
  favorite?: boolean;

  duration: string;
  format: string;
  language: string;
  campus: string;
  qsRanking: string;
  deadline: string;
  requirements: {
    toefl: {
      min: number;
      avg: number;
    };
    ielts: {
      min: number;
    };
    duolingo: {
      min: number;
    };
    pte: {
      min: number;
    };
    gre: {
      status: string;
      total?: {
        avg: number;
      };
      verbal?: {
        avg: number;
      };
      quantitative?: {
        avg: number;
      };
      writing?: {
        avg: number;
      };
    };
    gpa: {
      min: number;
      avg: number;
    };
  };
  applicationFees: {
    international: number;
    us: number;
  };
  otherRequirements: {
    transcript: boolean;
    resumeCV: boolean;
    applicationForm: boolean;
    statementOfPurpose: boolean;
    recommendationLetters: number;
  };
  admissionRate: number;
  costs: {
    residents: {
      tuition: number;
      fees: number;
      healthInsurance: number;
      livingCost: number;
    };
    international: {
      tuition: number;
      fees: number;
      healthInsurance: number;
      livingCost: number;
    };
  };
  contact: {
    tel: string;
    email: string;
    website: string;
    address: string;
  };
  similarPrograms: Array<{
    id: number;
    name: string;
    school: string;
  }>;
  description: string;
  courseStructure: string;
  facultyHighlights: Array<{
    name: string;
    title: string;
    photoUrl: string;
    research: string;
  }>;
  careerOutcomes: Array<{
    title: string;
    percentage: number;
  }>;
}

export const getProgramDetails = (id: number): ProgramDetail => {
  const programDetails: Record<number, ProgramDetail> = {
    1: {
      id: 1,
      name: "Computer Science",
      degree: "Ph.D.",
      school: "Harvard University",
      schoolLogo: "/placeholder.svg",
      degreeType: "STEM Course",
      fit: "High Fit",
      ranking: 1,
      duration: "4 Years",
      format: "Full Time",
      language: "English",
      campus: "On Campus",
      qsRanking: "1",
      deadline: "Fall, Dec 15",
      requirements: {
        toefl: {
          min: 92,
          avg: 105,
        },
        ielts: {
          min: 6.5,
        },
        duolingo: {
          min: 125,
        },
        pte: {
          min: 68,
        },
        gre: {
          status: "Not Accepted",
        },
        gpa: {
          min: 3.0,
          avg: 3.7,
        },
      },
      applicationFees: {
        international: 105,
        us: 105,
      },
      otherRequirements: {
        transcript: true,
        resumeCV: true,
        applicationForm: true,
        statementOfPurpose: true,
        recommendationLetters: 3,
      },
      admissionRate: 4,
      costs: {
        residents: {
          tuition: 59968,
          fees: 4720,
          healthInsurance: 5384,
          livingCost: 17500,
        },
        international: {
          tuition: 59968,
          fees: 4720,
          healthInsurance: 5384,
          livingCost: 21500,
        },
      },
      contact: {
        tel: "617-495-5315",
        email: "admissions@seas.harvard.edu",
        website: "https://www.seas.harvard.edu/computer-science",
        address: "33 Oxford St, Cambridge, MA 02138",
      },
      similarPrograms: [
        {
          id: 3,
          name: "Computer Science",
          school: "Stanford University",
        },
        {
          id: 4,
          name: "Computer Science",
          school: "MIT",
        },
        {
          id: 5,
          name: "Computer Science: Bioinformatics",
          school: "Model University",
        },
        {
          id: 6,
          name: "Information Systems",
          school: "Model University",
        },
        {
          id: 7,
          name: "Computer Science",
          school: "University of British Columbia",
        },
      ],
      description:
        "The Ph.D. program in Computer Science at Harvard University offers students the opportunity to work at the frontiers of knowledge in areas such as artificial intelligence, systems, theory, programming languages and systems, and more. With access to distinguished faculty, state-of-the-art facilities, and interdisciplinary collaboration opportunities, students are prepared to make significant contributions to the field of computer science through research, teaching, and professional practice.",
      courseStructure:
        "The program structure includes foundational coursework, qualifying examinations, research projects, and dissertation work. Students are expected to complete coursework in their first two years, followed by a qualifying exam. The remaining time is dedicated to original research leading to a dissertation that represents a significant contribution to the field of computer science.",
      facultyHighlights: [
        {
          name: "Dr. Jane Smith",
          title: "Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Artificial Intelligence, Machine Learning",
        },
        {
          name: "Dr. Michael Johnson",
          title: "Associate Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Distributed Systems, Cloud Computing",
        },
        {
          name: "Dr. Emily Chen",
          title: "Assistant Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Human-Computer Interaction, User Experience Design",
        },
      ],
      careerOutcomes: [
        {
          title: "Academia",
          percentage: 45,
        },
        {
          title: "Industry Research",
          percentage: 35,
        },
        {
          title: "Tech Startups",
          percentage: 15,
        },
        {
          title: "Other",
          percentage: 5,
        },
      ],
    },
    2: {
      id: 2,
      name: "Computer Science",
      degree: "Ph.D. / M.S.",
      school: "University of California, Berkeley",
      schoolLogo: "/placeholder.svg",
      degreeType: "STEM Course",
      fit: "High Fit",
      ranking: 4,
      duration: "4-5 Years",
      format: "Full Time",
      language: "English",
      campus: "On Campus",
      qsRanking: "4",
      deadline: "Fall, Dec 8",
      requirements: {
        toefl: {
          min: 90,
          avg: 102,
        },
        ielts: {
          min: 7.0,
        },
        duolingo: {
          min: 120,
        },
        pte: {
          min: 65,
        },
        gre: {
          status: "Required",
          total: {
            avg: 329,
          },
          verbal: {
            avg: 161,
          },
          quantitative: {
            avg: 168,
          },
          writing: {
            avg: 4.5,
          },
        },
        gpa: {
          min: 3.0,
          avg: 3.8,
        },
      },
      applicationFees: {
        international: 120,
        us: 120,
      },
      otherRequirements: {
        transcript: true,
        resumeCV: true,
        applicationForm: true,
        statementOfPurpose: true,
        recommendationLetters: 3,
      },
      admissionRate: 8,
      costs: {
        residents: {
          tuition: 14100,
          fees: 3200,
          healthInsurance: 4600,
          livingCost: 23000,
        },
        international: {
          tuition: 29500,
          fees: 3200,
          healthInsurance: 4600,
          livingCost: 23000,
        },
      },
      contact: {
        tel: "510-642-3214",
        email: "admissions@cs.berkeley.edu",
        website: "https://cs.berkeley.edu/",
        address: "Soda Hall, Berkeley, CA 94720",
      },
      similarPrograms: [
        {
          id: 1,
          name: "Computer Science",
          school: "Harvard University",
        },
        {
          id: 4,
          name: "Computer Science",
          school: "MIT",
        },
        {
          id: 8,
          name: "Computer Science",
          school: "Stanford University",
        },
      ],
      description:
        "UC Berkeley's Ph.D. program in Computer Science is renowned for its cutting-edge research and academic excellence. Students work alongside world-class faculty on projects that advance the frontiers of knowledge in areas like artificial intelligence, robotics, security, and data science. The program prepares students for leadership roles in academia, industry research labs, and entrepreneurial ventures.",
      courseStructure:
        "The program includes foundational coursework, preliminary exams, and research leading to a dissertation. Students typically spend the first two years taking courses and engaging in initial research projects, followed by advancement to candidacy and dissertation work. Teaching experience is also a component of the program.",
      facultyHighlights: [
        {
          name: "Dr. Robert Williams",
          title: "Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Computer Vision, Deep Learning",
        },
        {
          name: "Dr. Sarah Park",
          title: "Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Cybersecurity, Cryptography",
        },
      ],
      careerOutcomes: [
        {
          title: "Industry Research",
          percentage: 40,
        },
        {
          title: "Academia",
          percentage: 35,
        },
        {
          title: "Tech Startups",
          percentage: 20,
        },
        {
          title: "Other",
          percentage: 5,
        },
      ],
    },
    3: {
      id: 3,
      name: "Machine Learning",
      degree: "Master's",
      school: "Stanford University",
      schoolLogo: "/placeholder.svg",
      degreeType: "STEM Course",
      fit: "Medium Fit",
      ranking: 2,
      duration: "2 Years",
      format: "Full Time",
      language: "English",
      campus: "On Campus",
      qsRanking: "2",
      deadline: "Fall, Dec 6",
      requirements: {
        toefl: {
          min: 100,
          avg: 110,
        },
        ielts: {
          min: 7.0,
        },
        duolingo: {
          min: 125,
        },
        pte: {
          min: 70,
        },
        gre: {
          status: "Optional",
          total: {
            avg: 332,
          },
          verbal: {
            avg: 162,
          },
          quantitative: {
            avg: 170,
          },
          writing: {
            avg: 4.5,
          },
        },
        gpa: {
          min: 3.5,
          avg: 3.9,
        },
      },
      applicationFees: {
        international: 125,
        us: 125,
      },
      otherRequirements: {
        transcript: true,
        resumeCV: true,
        applicationForm: true,
        statementOfPurpose: true,
        recommendationLetters: 3,
      },
      admissionRate: 5,
      costs: {
        residents: {
          tuition: 55011,
          fees: 2505,
          healthInsurance: 5208,
          livingCost: 35000,
        },
        international: {
          tuition: 55011,
          fees: 2505,
          healthInsurance: 5208,
          livingCost: 35000,
        },
      },
      contact: {
        tel: "650-723-4891",
        email: "admissions@cs.stanford.edu",
        website: "https://cs.stanford.edu/",
        address: "353 Jane Stanford Way, Stanford, CA 94305",
      },
      similarPrograms: [
        {
          id: 1,
          name: "Computer Science",
          school: "Harvard University",
        },
        {
          id: 9,
          name: "Data Science",
          school: "MIT",
        },
      ],
      description:
        "Stanford's Master's in Machine Learning is designed for students who wish to develop expertise in the rapidly evolving field of artificial intelligence and machine learning. The program combines theoretical foundations with practical applications, preparing students for careers at the cutting edge of technology innovation.",
      courseStructure:
        "The program structure includes core courses in machine learning, artificial intelligence, and statistical methods, followed by electives that allow students to specialize in areas such as computer vision, natural language processing, or robotics. A capstone project or thesis is required for graduation.",
      facultyHighlights: [
        {
          name: "Dr. Andrew Lee",
          title: "Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Machine Learning, Reinforcement Learning",
        },
        {
          name: "Dr. Maria Rodriguez",
          title: "Associate Professor of Computer Science",
          photoUrl: "/placeholder.svg",
          research: "Natural Language Processing, AI Ethics",
        },
      ],
      careerOutcomes: [
        {
          title: "Tech Companies",
          percentage: 60,
        },
        {
          title: "Research Positions",
          percentage: 20,
        },
        {
          title: "Startups",
          percentage: 15,
        },
        {
          title: "Further Education",
          percentage: 5,
        },
      ],
    },
  };

  return programDetails[id] || programDetails[1]; // Return default if not found
};
