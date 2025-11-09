// src/components/help/VideoTutorialsData.ts

export interface TutorialVideo {
  /** همان مقدار vid در PHP: 331 | school | program | professors | resume | sop | lor | apply */
  vid: string;
  /** عنوان در لیست */
  title: string;
  /** مثل 06:27 */
  duration: string;
  /** لینک مستقیم mp4 همانند PHP */
  src: string;
  /** در صورت تمایل تصویر بندانگشتی */
  thumbnail?: string;
  /** توضیح کوتاه */
  description?: string;
}

export const videoTutorialsData: TutorialVideo[] = [
  {
    vid: "331",
    title: "Profile Setup",
    duration: "06:27",
    src: "https://questapply.com/wp-content/uploads/2024/11/profile-setup.mp4",
    description:
      "Learn how to set up your profile with all the necessary details to maximize your chances of university admission.",
  },
  {
    vid: "school",
    title: "Find Schools",
    duration: "03:36",
    src: "https://questapply.com/wp-content/uploads/2024/11/find-schools-info.mp4",
    description:
      "Discover how to use advanced filters, rankings, and comparisons to find matching schools.",
  },
  {
    vid: "program",
    title: "Find Programs",
    duration: "03:51",
    src: "https://questapply.com/wp-content/uploads/2024/11/find-program-info.mp4",
    description:
      "Filter by discipline, level, deadlines, GPA/GRE/English thresholds to find the best-fit programs.",
  },
  {
    vid: "professors",
    title: "Find Professors",
    duration: "03:31",
    src: "https://questapply.com/wp-content/uploads/2024/11/find-profesor-info.mp4",
    description:
      "Search faculty by research areas and university; learn how to shortlist and reach out.",
  },
  {
    vid: "resume",
    title: "Create Resume",
    duration: "03:19",
    src: "https://questapply.com/wp-content/uploads/2024/11/create-resume.mp4",
    description:
      "Build a strong academic resume with our AI-powered tools and export-ready templates.",
  },
  {
    vid: "sop",
    title: "Create SOP",
    duration: "06:23",
    src: "https://questapply.com/wp-content/uploads/2024/12/sop-info.mp4",
    description:
      "Write a compelling SOP: structure, tone, and tailoring for each school/program.",
  },
  {
    vid: "lor",
    title: "Create LOR",
    duration: "05:07",
    src: "https://questapply.com/wp-content/uploads/2024/12/LOR5.mp4",
    description:
      "Request/manage recommenders, and understand best practices for strong letters.",
  },
  {
    vid: "apply",
    title: "Apply Now",
    duration: "02:58",
    src: "https://questapply.com/wp-content/uploads/2024/11/apply-now-info.mp4",
    description:
      "Walk through submission, fees, statuses, and ensure nothing is missed.",
  },
];
