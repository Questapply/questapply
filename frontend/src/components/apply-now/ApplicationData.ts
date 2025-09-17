
export const applications = [
  {
    id: 1,
    program: "Computer Science",
    degree: "Ph.D.",
    school: "Newcastle University",
    logo: "/placeholder.svg",
    deadline: "No Deadline",
    applicationFees: "FREE",
    eligibility: true,
    admissionFit: "High",
    admissionFitPercentage: 85,
    status: "applied",
    actions: ["Submit with Us", "Remove"],
    requirements: {
      gpa: { min: 3.0, student: 3.5 },
      gre: { min: 310, student: 320 },
      ielts: { min: 6.5, student: 7.5 },
      toefl: { min: 90, student: 100 }
    },
    documents: [
      { name: "Resume/CV", status: "completed" },
      { name: "Statement of Purpose", status: "completed" },
      { name: "Transcripts", status: "pending" },
      { name: "Letters of Recommendation", status: "pending" },
      { name: "English Proficiency", status: "completed" }
    ]
  },
  {
    id: 2,
    program: "Computer Science",
    degree: "Ph.D.",
    school: "University of Liverpool",
    logo: "/placeholder.svg",
    deadline: "56 days opening\nFall, Aug 31\nFall, Jul 12\nWinter, Nov 30",
    applicationFees: "FREE",
    eligibility: true,
    admissionFit: "Needs Info",
    admissionFitPercentage: 60,
    status: "applied",
    actions: ["Submit with Us", "Remove"],
    requirements: {
      gpa: { min: 3.0, student: 3.5 },
      gre: { min: 310, student: 315 },
      ielts: { min: 6.5, student: 7.0 },
      toefl: { min: 90, student: 95 }
    },
    documents: [
      { name: "Resume/CV", status: "completed" },
      { name: "Statement of Purpose", status: "pending" },
      { name: "Transcripts", status: "pending" },
      { name: "Letters of Recommendation", status: "not_started" },
      { name: "English Proficiency", status: "completed" }
    ]
  }
];
