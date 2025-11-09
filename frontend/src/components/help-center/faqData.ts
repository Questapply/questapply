// src/data/faqData.ts

export type FaqItem = { q: string; a: string };
export type FaqSection = { id: string; title?: string; items: FaqItem[] };
export type FaqCategory = {
  id: string;
  name: string;
  icon?: string;
  sections: FaqSection[];
};

export const faqCategoriesMeta = [
  { id: "profile", name: "Profile Setup and Management", icon: "👤" },
  { id: "dashboard", name: "Dashboard", icon: "📊" },
  { id: "schools", name: "Finding Schools", icon: "🏫" },
  { id: "programs", name: "Finding Programs", icon: "📚" },
  { id: "professors", name: "Finding Professors", icon: "👨‍🏫" },
  { id: "plans", name: "Plans", icon: "💎" },
  { id: "payments", name: "Payments", icon: "💳" },
  { id: "referral", name: "Referral Codes", icon: "🔗" },
  { id: "technical", name: "Technical Issues", icon: "💻" },
  { id: "resume", name: "Resume", icon: "📄" },
  { id: "sop", name: "Statement of Purpose", icon: "🎯" },
  { id: "recommendation", name: "Recommendation Letter", icon: "✉️" },
  { id: "apply", name: "Apply Now", icon: "📝" },
  { id: "cover", name: "Cover Letter", icon: "📋" },
  { id: "personal", name: "Personal Statement", icon: "💼" },
];

// ---- محتوا: نسخه‌ی کامل برای دسته‌ی "profile" مطابق PHP ----
export const faqContentByCategory: Record<string, FaqCategory> = {
  profile: {
    id: "profile",
    name: "Profile Setup and Management",
    icon: "👤",
    sections: [
      {
        id: "personal",
        title: "1 - Personal Background",
        items: [
          {
            q: "How do I create a new profile?",
            a: "To create a new profile, click on the 'Sign Up' button on the homepage and fill out all the required fields marked with an asterisk (*), such as your email, full name, and personal details.",
          },
          {
            q: "Can I update my personal information after signing up?",
            a: "Yes, you can update your personal information by logging into your account, navigating to the 'Profile' section, and editing the fields you want to change.",
          },
          {
            q: "What should I do if I forget my password?",
            a: "Click on the 'Recovery Password?' link on the login page to reset your password.",
          },
        ],
      },
      {
        id: "application",
        title: "2 - Application Information",
        items: [
          {
            q: "Why do I need to provide my English, GPA, and GRE details?",
            a: "Providing these details helps us calculate your admission chances accurately and suggest suitable programs based on your profile.",
          },
          {
            q: "Can I edit my GPA or test scores after submitting them?",
            a: "Yes, you can update your GPA and test scores anytime by editing your profile under the 'Application Information' section.",
          },
          {
            q: "What happens if I don’t have a GRE or English test score yet?",
            a: "If you haven't taken these tests yet, you can leave the fields blank. However, for an accurate admission chance calculation, it's recommended to fill them in once available.",
          },
          {
            q: "How do I select my desired program and level?",
            a: "Go to the 'Application Information' section, select your preferred program and level from the dropdown menu, and save your preferences.",
          },
          {
            q: "Can I apply to multiple programs?",
            a: "Yes, you can apply to multiple programs by adding separate entries for each program under the 'Apply Now' section.",
          },
          {
            q: "Can I change my major after selecting it?",
            a: "Yes, you can change your major at any time. However, please note that if you have purchased a Premium membership, the Premium benefits will not apply to the new major. You would need to purchase a separate Premium membership for the new major to access those features.",
          },
        ],
      },
      {
        id: "education",
        title: "3 - Education / Work Experience",
        items: [
          {
            q: "How can I add my academic profile and work experience?",
            a: "Navigate to the 'Education / Work Experience' section and fill in details about your previous education, work roles, and achievements.",
          },
          {
            q: "Is it mandatory to provide work experience?",
            a: "Work experience is optional but can strengthen your profile and improve your admission chances for specific programs.",
          },
        ],
      },
      {
        id: "academic",
        title: "4 - Academic Profile",
        items: [
          {
            q: "Is it mandatory to complete the Academic Profile?",
            a: "No, completing the Academic Profile is not mandatory. However, it is highly recommended, as it allows the system to automatically generate your required documents, such as resumes, statements of purpose (SOPs), and recommendation letters. You only need to complete your profile once, and all your documents will be prepared efficiently.",
          },
        ],
      },
    ],
  },

  // می‌تونی برای دسته‌های دیگر هم مثل پایین به‌تدریج اضافه کنی:
  dashboard: {
    id: "dashboard",
    name: "Dashboard",
    sections: [
      {
        id: "dash-roadmap-basics",

        items: [
          {
            q: "Can I use the roadmap before completing my profile?",
            a: "No, you must complete your profile to access the roadmap. The roadmap is a personalized dashboard tailored to your profile information, ensuring accurate recommendations and guidance.",
          },
          {
            q: "Can I skip stages and return later?",
            a: "Yes, you can skip any stage and return to it later. However, all seven steps of the roadmap are necessary to complete the college application process.",
          },
          {
            q: "How do I know if I completed a stage?",
            a: "• Some steps, like search engines, don't require completion. You can browse and add your favorite schools, programs, or professors to your list as you explore.\n• For Steps 4 to 6 (e.g., resume, SOP, LOR), you'll know they're complete when you export them. A version of each completed step will be saved under the \"Documents\" section.",
          },
          {
            q: "Are there deadlines for completing each section?",
            a: "No, there are no deadlines for completing each section. However, you must finish all stages and submit your applications before the program's deadline.",
          },
          {
            q: 'What is "Apply With Us" in the roadmap?',
            a: '"Apply With Us" is a service where our team manages every step of your application journey. We handle the entire admissions process, ensuring your acceptance to top schools. This service allows you to focus on your studies while we take care of the complexities. We guarantee your admission.',
          },
          {
            q: "What Steps in the Roadmap Are Free?",
            a: `You can access the following steps in the roadmap for free:

**Step 1: Find Schools**
Explore schools that match your preferences and qualifications without any cost.

**Step 2: Find Programs**
Search for specific programs and compare their requirements and details.

**Step 3: Find Professors**
Access a list of 5 professors for free to see how the feature works.

**Steps 4–6: Guidance for Resume, SOP, and LOR**
- Receive free guidance for writing your resume, statement of purpose (SOP), and letters of recommendation (LOR).
- Gain access to a variety of free samples for each document type.

**Application Submission**
Apply to up to 5 universities for free to start your application process.`,
          },
        ],
      },
    ],
  },
  schools: {
    id: "schools",
    name: "Finding Schools",
    sections: [
      {
        id: "schools-main",
        items: [
          {
            q: "How can I find schools that align with my academic and career goals?",
            a: `Our "Find Schools" feature is designed to help you discover the best options based on your unique preferences. You can filter schools by:

**1 - Location:** Select country and state to narrow down options.  
**2 - State:** Select state to narrow down options.  
**3 - Programs:** Search for programs in areas like Engineering, Medicine, or Business.  
**4 - Education Level:** Choose master's, Ph.D., or other levels.  
**5 - Rankings and Costs:** Sort schools by rankings, tuition fees, or other metrics to prioritize your preferences.`,
          },
          {
            q: "What information will I see when browsing the list of schools?",
            a: `The school listing page provides a quick overview, including:

**1 - Ranking:** Evaluate schools based on global or regional ranking systems like QS or US News.  
**2 - Tuition Costs:** See tuition for in-state and out-of-state students.  
**3 - Graduation and Acceptance Rates:** Understand your chances and the success rates of students.  
**4 - Comparison Tools:** Add schools to your favorite list or directly compare them using the scale provided.`,
          },
          {
            q: "How can we compare two or more schools?",
            a: `You can click on the scale icon, add one or more schools, and view their key attributes side by side. Compare aspects like:

**1 - Tuition fees (in-state vs. out-of-state)**  
**2 - Graduation rates and rankings**  
**3 - Available programs and admission requirements**`,
          },
          {
            q: "How can I find the details about each school?",
            a: `You can find detailed information by clicking on **School Details** or the name of the school. This provides comprehensive information, including:

**1 - Admission requirements**  
**2 - Departments and programs offered**  
**3 - Cost breakdown**  
**4 - Diversity statistics and demographics**`,
          },
          {
            q: "How can I find the essential admission requirements?",
            a: `Click on **School Details**, then select the **Requirements** button. This will show:

**1 - GPA and test score requirements (e.g., GRE, GMAT, TOEFL)**  
**2 - Required essays and recommendation letters**  
**3 - Admission deadlines and criteria for all programs**`,
          },
          {
            q: "How can I find the Departments & Programs?",
            a: `Go to **School Details** and click on the **Departments & Programs** button. You’ll find:

**1 - A comprehensive list of academic departments**  
**2 - Available programs for undergraduate, master's, and Ph.D. levels**`,
          },
          {
            q: "How can I find the details about the cost?",
            a: `Under **School Details**, click on the **Cost** button. You can view:

**1 - Tuition fees (annual or per-semester)**  
**2 - Housing, meals, and other expenses**  
**3 - Graphs for a detailed cost breakdown**`,
          },
          {
            q: "How can I find the details about Admissions Statistics?",
            a: `Click on **School Details** and select the **Admissions Statistics** button to access:

**1 - Acceptance rates**  
**2 - Average standardized test scores**  
**3 - Detailed graphs and trends**`,
          },
          {
            q: "How can I find details about the diversity of students (Gender, Level, Type, and Race & Ethnicity)?",
            a: `Under **School Details**, click on the **Student** button. You’ll find:

**1 - Gender distribution**  
**2 - Racial and ethnic diversity breakdowns**  
**3 - Data on part-time vs. full-time enrollment**`,
          },
          {
            q: "How do I use the filters to refine my search?",
            a: `The platform offers intuitive filters for precise searches:

**Location:** Focus on specific regions or cities.  
**Program and Level:** Tailor searches to bachelor's, master's, or specific fields like Computer Science or Architecture.  
**Costs and Rankings:** Filter by tuition range or global rankings to identify schools within your budget or academic standards.`,
          },
          {
            q: "How do I estimate the total cost of attending a school?",
            a: `Detailed breakdowns include:

**Tuition Fees:** Annual charges based on residency status.  
**Housing and Meals:** On-campus room and board options.  
**Miscellaneous Expenses:** Fees for books, activities, and transportation.`,
          },
          {
            q: "What are some essential admission requirements to prepare for?",
            a: `While every school varies, general requirements include:

**1 - Academic transcripts and certificates**  
**2 - Standardized test scores (e.g., TOEFL, IELTS, GRE, GMAT)**  
**3 - Personal statement or essay**  
**4 - Letters of recommendation**  
**5 - Proof of extracurricular achievements**`,
          },
          {
            q: "What details are included on each school’s profile page?",
            a: `School profiles offer:

**1 - Admission requirements and program prerequisites**  
**2 - Departments and program options**  
**3 - Cost breakdowns and financial aid insights**  
**4 - Diversity and demographics**  
**5 - Admissions statistics**`,
          },
          {
            q: "How do rankings help me choose the right school?",
            a: `Rankings reflect academic quality and reputation. For example:

**Harvard University:** Globally ranked #1 by QS.  
**Stanford University:** Known for engineering and innovation.`,
          },
          {
            q: "Can I save schools for future review?",
            a: `Yes! Use the **Add to Favorites** feature to bookmark schools, revisit their profiles, and compare later.`,
          },
          {
            q: "Are there tools to evaluate the quality of programs offered?",
            a: `Yes, tools include:

**Department Rankings:** Assess department strengths.  
**Program Requirements:** View prerequisites and credit structures.  
**Alumni Success:** Explore graduation rates and job placement statistics.`,
          },
          {
            q: "How often is school information updated?",
            a: `Our database is continuously updated to reflect the latest information, ensuring you make decisions based on accurate and reliable data.`,
          },
        ],
      },
    ],
  },

  programs: {
    id: "programs",
    name: "Finding Programs",
    sections: [
      {
        id: "programs-basics",
        items: [
          {
            q: "How can I find programs that match my academic and career interests?",
            a: `The "Find Programs" feature allows you to explore academic options tailored to your preferences. You can filter programs by:

**1 - Country :** Select the country where you want to study.

**2 - State :** Focus on specific regions or states.

**3 - School :** Choose institutions offering your preferred programs.

**4 - Discipline :** Narrow down by academic fields like Engineering, Business, or Arts.

**5 - Programs :** Search for specific programs that align with your goals.

**6 - Level :** Filter by undergraduate, master’s, or Ph.D. programs.

**7 - Deadline :** Find programs still accepting applications.

**8 - English Requirements :** Search based on TOEFL, IELTS, or other language test thresholds.

**9 - GPA and GRE Requirements :** Target programs that match your academic scores.`,
          },
          {
            q: "What details are included in the program listings?",
            a: `Each program listing provides:

**1 - Program Name :** The exact title and specialization of the program.

**2 - University Affiliation :** The institution offering the program.

**3 - Location :** The city and country where the program is hosted.

**4 - Key Metrics :** Minimum requirements, deadlines, faculty information, program match score, Add to List, and Favorite List icons.`,
          },
          {
            q: "What specific details can I find in the Program Details page?",
            a: `The **Program Details** page provides comprehensive insights, including:

**1 - Average GPA :** The average GPA of previously admitted students.

**2 - Average GRE :** The GRE score range of successful applicants.

**3 - Average English Test Scores :** Typical scores required for language proficiency.

**4 - Admission Rate :** The likelihood of acceptance for the program.

**5 - Costs :** Tuition and other related expenses.

**6 - Other Requirements :** Additional prerequisites or criteria for admission.`,
          },
          {
            q: "How do I use filters to refine my program search?",
            a: `Use the filters available on the "Find Programs" page to narrow your search by:

**1 - Country, State, and Schools :** Focus on specific geographic areas and institutions.

**2 - Discipline and Programs :** Explore academic fields and specific offerings.

**3 - Level :** Choose from bachelor’s, master’s, or Ph.D. programs.

**4 - English Requirements, GPA, and GRE :** Filter based on your test scores and academic qualifications.

**5 - Deadline :** Search for programs still open for applications.`,
          },
          {
            q: "How can I apply for each program?",
            a: `To apply for a program:

1 - Click on the **Add to List** button next to the program.

2 - The program will automatically be added to your application list.

3 - You can review and manage your application list under the **Apply Now** section.`,
          },
          {
            q: "What is the meaning of Program Match?",
            a: `The **Program Match** score reflects how well a program aligns with your academic background, test scores, and qualifications. It shows your likelihood of acceptance into the program.`,
          },
          {
            q: "How is the Program Match calculated?",
            a: `The program match is determined using the following classifications:

**- Strong Match :** Your scores (GRE, GPA, and English) meet or exceed the average scores of previously admitted students.

**- Moderate Match :** One of your scores is slightly below the average but close to the threshold.

**- Low Match :** Your scores are significantly lower than the average or below the minimum accepted scores.`,
          },
          {
            q: "Are there deadlines for program applications?",
            a: `Yes, application deadlines are listed in the program overview and on the **Program Details** page. Make sure to submit your application before the specified date to be considered.`,
          },
          {
            q: "How often is program information updated?",
            a: `We regularly update program details to ensure accuracy, including application deadlines, admission requirements, and costs.`,
          },
        ],
      },
    ],
  },
  professors: {
    id: "professors",
    name: "Finding Professors",
    sections: [
      {
        id: "professors-main",
        items: [
          {
            q: "How can I find the right professor?",
            a: `You can search for professors based on your field of study, university name, and research interests. Simply use the search tool to enter the university name, field, and research area.`,
          },
          {
            q: "Can I access more detailed information about professors like email and website?",
            a: `Yes, when searching for a professor, you can view their research interests, email, website, and even their Google Scholar profile.`,
          },
          {
            q: "Can I save professors for later?",
            a: `Yes, you can save professors by clicking on the heart icon next to their name. You can see the list of your saved professors in the "My Professors" section in the left side tab of your dashboard. This allows you to easily find them later for future interactions.`,
          },
          {
            q: "Can I contact professors via email?",
            a: `Yes, you can send emails to professors. The email can be either a pre-written template or a custom message that you write yourself. If the professor doesn’t respond, you can send a reminder email.`,
          },
          {
            q: "When can I apply for a program based on the professor's response?",
            a: `Once you receive a response from a professor, and they encourage you to apply or you have had a successful conversation with them, you can add the program to your application based on the professor’s feedback and continue the application process.`,
          },
          {
            q: "Do I have access to all professors?",
            a: `If you are a free user, you only have access to 5 professors to check the system. For full access to professors and more information, you need to be a Basic or Premium member.`,
          },
          {
            q: "Can I access professors from other fields of study?",
            a: `No, you can only access professors from your own field of study. To access professors in other fields, you need to pay for a new membership in that field.`,
          },
          {
            q: "Can I analyze the professor’s responses?",
            a: `Yes, we can help you analyze the professor’s responses if you are a Premium member. We can help you interpret their answers and guide you in making decisions about your application process.`,
          },
          {
            q: "Can I filter professors based on their research areas?",
            a: `Yes, you can filter professors based on various research topics and choose the best options for your academic interests.`,
          },
          {
            q: "Can I find professors by university or country?",
            a: `Yes, you can search for professors based on their university, country, and even specific geographic locations.`,
          },
        ],
      },
    ],
  },
  plans: {
    id: "plans",
    name: "Plans",
    sections: [
      {
        id: "plans-main",
        items: [
          {
            q: "What are the different types of plans?",
            a: `We have two main types of plans:

**Apply Yourself:** You use our system to apply, but we are not responsible for getting your admission.  
**Apply With Us:** We handle the entire process for you, including admission, funds, and visa.`,
          },
          {
            q: "What are the Apply Yourself plans?",
            a: `**Free Plan:** Access to all or some features at no cost.  

**Basic Plan ($200):** Access to all professors in your major, automatic creation of your documents, and the ability to apply for all programs on your own.  

**Premium Plan ($400):** Includes all features of the Basic Plan, plus document review and one-on-one support.`,
          },
          {
            q: "What are the different Apply With Us plans?",
            a: `**Bronze:** We handle your admission process.  
**Silver:** We manage both your admission and funding.  
**Gold:** We handle admission, funding, and help with obtaining your visa.`,
          },
          {
            q: "How do I upgrade my plan?",
            a: `You can upgrade your plan through your account page or by visiting the pricing or plans section on the website.`,
          },
          {
            q: "What’s included in the premium features?",
            a: `With the premium plan, you have access to all features from **Step 1** to **Step 7** of the roadmap.`,
          },
          {
            q: "Can I cancel my plan anytime?",
            a: `No, because most of the roadmap is free to use, you can check out each step at no cost. Once you're sure you need a plan, you can select the appropriate one.`,
          },
          {
            q: "Is there a free trial?",
            a: `Yes, most steps are free. You only need to pay for contacting professors and preparing documents.`,
          },
        ],
      },
    ],
  },

  payments: {
    id: "payments",
    name: "Payments",
    sections: [
      {
        id: "payments-main",
        items: [
          {
            q: "What payment methods are accepted?",
            a: `We accept payments via **Visa**, **MasterCard**, and **PayPal**.`,
          },
          {
            q: "Can I pay in installments?",
            a: `No, the payment must be made as a **one-time payment**.`,
          },
          {
            q: "Is there a refund policy?",
            a: `There is **no refund** for payments. However, if you refer someone to the platform, you can receive a **discount** or even **earn money**.`,
          },
          {
            q: "What happens if my payment fails?",
            a: `If your payment fails, you can **retry** the payment, and your funds will be **refunded** to you.`,
          },
          {
            q: "Are payments secure?",
            a: `Yes, all payments are **secure**, and you can view your **payment history** directly in your dashboard.`,
          },
          {
            q: "Can I update my payment information?",
            a: `Yes, you can update your payment information at any time through your **account settings** or during the **checkout process**.`,
          },
          {
            q: "Will I receive a receipt for my payment?",
            a: `Yes, after completing your payment, a **receipt** will be sent to your **email**, and you can also view and download it from your **dashboard**.`,
          },
          {
            q: "Is there a late payment fee?",
            a: `No, there is **no late payment fee**. However, if your payment fails, your access to certain features may be **temporarily suspended** until payment is successfully completed.`,
          },
          {
            q: "Can I apply a discount code to my payment?",
            a: `Yes, if you have a **valid discount code**, you can apply it during checkout to receive the applicable discount.`,
          },
        ],
      },
    ],
  },

  referral: {
    id: "referral",
    name: "Referral Codes",
    sections: [
      {
        id: "referral-main",
        items: [
          {
            q: "What is the referral program?",
            a: `The referral program allows users to earn rewards by inviting others to join the platform. Referrals can be categorized as **free-to-free**, **free-to-premium**, **premium-to-free**, and **premium-to-premium**.`,
          },
          {
            q: "How can I earn rewards from the referral program?",
            a: `Rewards are earned by referring users. For every successful referral, you receive a **percentage of their payment** or other benefits, depending on the referred user type.`,
          },
          {
            q: "What are the rewards for referring users?",
            a: `Rewards vary based on referral type:

- **Free user referrals** unlock features like access to documents (e.g., resumes, SOPs, LORs).  
- **Paid user referrals** earn monetary rewards (**10% of their payment**) or credits up to a specific limit.`,
          },
          {
            q: "How do I redeem my referral rewards?",
            a: `Rewards can be redeemed through your **wallet** for platform credits, discounts, or special services like consultations.`,
          },
          {
            q: "Can I earn money by referring paid users?",
            a: `Yes, for every paid user you refer, you earn **10% of their payment**. After reaching a specific limit, additional earnings are credited to your **wallet** for future use.`,
          },
          {
            q: "Is there a limit to the number of rewards I can earn?",
            a: `There is **no limit** to monetary rewards for affiliate marketers. For user referrals, specific limits may apply, such as earning up to a certain amount or unlocking additional benefits after 10 referrals.`,
          },
          {
            q: "What happens after I refer 10 users?",
            a: `Referring **10 users** unlocks additional features, such as access to more documents, consultations, or exclusive services like a resume builder and SOP creation tools.`,
          },
          {
            q: "How do I use my referral code?",
            a: `Your referral code is available in your **dashboard**. Share it with others, and when they sign up or make a purchase using your code, you'll earn rewards.`,
          },
          {
            q: "How do I track my referrals and rewards?",
            a: `Your **dashboard** provides detailed tracking, showing the number of referrals, their status (free/paid), and the benefits or commissions earned.`,
          },
          {
            q: "Do referral benefits expire?",
            a: `**Wallet rewards** do not expire, but benefits like free document access or consultations must be claimed within **6 months** of earning.`,
          },
          {
            q: "Can I combine referral benefits with other promotional discounts?",
            a: `Yes, referral benefits can be combined with other active promotions or discounts, allowing you to **maximize your savings and rewards**.`,
          },
          {
            q: "What happens if a referred user cancels or doesn’t complete their registration?",
            a: `If a referred user cancels their subscription or doesn’t complete registration, any pending rewards for that referral may be **revoked**.`,
          },
          {
            q: "What happens if my referral link/code is misused?",
            a: `Misuse of referral links, such as creating fake accounts, will result in **suspension of rewards** and may lead to **account restrictions**.`,
          },
          {
            q: "What is the affiliate marketer program?",
            a: `The affiliate marketer program is for professional partners to promote the platform at scale. Affiliates earn **10% commissions** for each paid user referred, without document-related benefits or payout restrictions.`,
          },
          {
            q: "What are the terms for affiliate marketing?",
            a: `Affiliate marketers earn **10% of the payment** made by referred users. Rewards are credited after the referred user **completes their purchase**.`,
          },
          {
            q: "Can I refer both free and paid users?",
            a: `Yes, both **free** and **paid** users can be referred. Rewards differ depending on whether the referred user is free or paid.`,
          },
          {
            q: "Can I upgrade to the Basic or Premium plan using my wallet balance?",
            a: `Yes, you can use your **wallet balance** to partially or fully pay for an upgrade, depending on your wallet amount and plan cost.`,
          },
          {
            q: "How long does it take for my referral rewards to reflect in the wallet?",
            a: `Rewards typically appear in your wallet within **24–48 hours** after the referred user’s activity is validated (e.g., successful subscription or payment).`,
          },
          {
            q: "Is there a limit to the number of documents I can get for free as a free user through referrals?",
            a: `Yes, you can access **one resume**, **one SOP**, and **one LOR** for every **10 successful referrals**. Accessing more documents may require upgrading to a paid plan.`,
          },
        ],
      },
    ],
  },

  technical: {
    id: "technical",
    name: "Technical Issues",
    sections: [
      {
        id: "technical-main",
        items: [
          {
            q: "What should I do if a feature isn’t loading?",
            a: `If a feature isn’t loading properly, first try **refreshing your browser** or **clearing your cache**.  
If the problem persists, check your **internet connection** or try a **different browser**.  
If the issue continues, you can contact **support through the Help Center** by submitting a **support ticket**.`,
          },
          {
            q: "How do I report a bug?",
            a: `If you encounter a bug or technical issue, go to the **Help Center** and submit a **support ticket**.  
Please include as many details as possible, such as:  
- The steps that led to the issue  
- Your browser version  
- Any error messages you received`,
          },
          {
            q: "Is the platform supported on mobile devices?",
            a: `Yes, the platform is **accessible on mobile devices** through a responsive website.  
However, for the **best experience**, we recommend accessing it from a **desktop or laptop**.  
You can still use most features on mobile devices, but some elements may appear differently.`,
          },
          {
            q: "How can I clear cache or resolve login issues?",
            a: `To resolve login issues, try **clearing your browser's cache and cookies**.  
You can do this in your browser settings under **Privacy** or **History** options.  
Additionally, ensure that your **login credentials are correct** and that you are not using a previously saved or outdated password.  
If issues persist, try **resetting your password** or **contact support** for further assistance.`,
          },
        ],
      },
    ],
  },

  resume: {
    id: "resume",
    name: "Resume",
    sections: [
      {
        id: "resume-main",
        items: [
          {
            q: "What is a resume?",
            a: `A resume is a concise, professional document that outlines your **education**, **work experience**, **skills**, and **accomplishments**.  
It is typically tailored to a specific job application and designed to highlight your qualifications and suitability for the role.  

**Key Tip:** A resume should focus on the most relevant experiences and be no longer than **1–2 pages**.`,
          },
          {
            q: "What is the difference between a CV and a resume?",
            a: `| **Aspect**           |**Resume**           |**CV (Curriculum Vitae)**    | 

  |---------|----------|--------------------------|  
| **Length** | 1–2 pages | No length limit; comprehensive |  
| **Focus** | Tailored to the specific job or industry | Detailed academic and professional history |  
| **Purpose** | Highlight skills and relevant experiences | Showcase complete academic achievements |  
| **Usage** | Common in the U.S. for most jobs | Common for academic, research, or teaching jobs |  

**Key Tip:** Use a **resume** for job applications unless the employer specifically requests a **CV**.`,
          },
          {
            q: "What should be included in a resume?",
            a: `A well-structured resume typically includes:

1 - **Contact Information:** Name, phone number, email, LinkedIn profile, and optional portfolio link.  
2 - **Professional Summary:** A brief overview of your skills, experience, and career goals.  
3 - **Work Experience:** Relevant positions listed in reverse chronological order with key responsibilities and achievements.  
4 - **Education:** Schools attended, degrees earned, and relevant coursework.  
5 - **Skills:** Highlight technical and soft skills relevant to the job.  
6 - **Certifications and Awards:** Any credentials or recognitions that enhance your application.  

**Key Tip:** Customize your resume for each job application to focus on the most relevant skills and experiences.`,
          },
          {
            q: "How long should my resume be?",
            a: `A resume should typically be **1 page** for entry-level candidates or individuals with less than 10 years of experience.  
For experienced professionals, **2 pages** may be acceptable, but only if the additional information is highly relevant.  

**Key Tip:** Keep it concise and avoid unnecessary details.`,
          },
          {
            q: "How do I format my resume?",
            a: `Use a clean and professional format:

1 - Use a readable font (e.g., Arial, Calibri, or Times New Roman) in 10–12 pt size.  
2 - Structure sections with clear headings and bullet points for readability.  
3 - Maintain consistent spacing and alignment.  
4 - Save and submit in **PDF format** unless instructed otherwise.  

**Key Tip:** Avoid graphics, excessive colors, or images unless applying for a creative role.`,
          },
          {
            q: "How do I tailor my resume to a specific job?",
            a: `1 - Carefully review the job description.  
2 - Identify the key skills and qualifications the employer is seeking.  
3 - Highlight your experiences and skills that match those requirements.  
4 - Use relevant keywords to pass **Applicant Tracking Systems (ATS)**.  

**Key Tip:** Include specific accomplishments with measurable results to demonstrate your impact.`,
          },
          {
            q: "Should I include a photo on my resume?",
            a: `In most cases, **no**. Including a photo can introduce bias and is unnecessary for most roles.  
However, in some countries or industries (e.g., acting, modeling), it may be appropriate.  

**Key Tip:** Check cultural norms and job requirements before including a photo.`,
          },
          {
            q: "How do I list work experience if I’m a recent graduate?",
            a: `If you lack professional experience, focus on:

1 - **Internships:** Highlight relevant internships and the skills you developed.  
2 - **Projects:** Include academic or personal projects that demonstrate your abilities.  
3 - **Extracurricular Activities:** Show leadership roles or achievements in clubs or organizations.  

**Key Tip:** Use a **skills-based resume format** to emphasize your abilities over job titles.`,
          },
          {
            q: "How do I write strong bullet points for my experience?",
            a: `Each bullet point should include:

1 - **Action verbs:** Start with strong verbs like “Managed,” “Developed,” or “Improved.”  
2 - **Specific tasks:** Describe what you did.  
3 - **Quantifiable results:** Include metrics (e.g., increased sales by 20%).  

**Example:**  
“Developed a social media strategy that increased engagement by 35% in three months.”  

**Key Tip:** Focus on **accomplishments** rather than just responsibilities.`,
          },
          {
            q: "Should I include hobbies or interests?",
            a: `Only include hobbies or interests if they are **relevant to the role** or demonstrate transferable skills (e.g., leadership, teamwork, or creativity).  

**Key Tip:** Avoid listing generic hobbies like “watching TV” or “traveling.”`,
          },
          {
            q: "How do I handle employment gaps on my resume?",
            a: `1 - Be honest and prepared to explain the gaps in interviews.  
2 - Highlight productive activities during the gap (e.g., freelancing, volunteering, taking courses).  
3 - Use a **skills-based format** to focus on your abilities rather than timelines.  

**Key Tip:** Include a brief explanation in your **cover letter** if necessary.`,
          },
          {
            q: "Should I include references on my resume?",
            a: `No, references should not be listed directly on your resume.  
Instead, prepare a separate document with reference contact information and provide it **upon request**.  

**Key Tip:** Use the phrase “References available upon request” only if you have extra space.`,
          },
          {
            q: "How often should I update my resume?",
            a: `Update your resume regularly, especially after:  

1 - Completing a significant project.  
2 - Gaining new skills or certifications.  
3 - Changing jobs or roles.  

**Key Tip:** Keep a **master resume** to track all experiences and create tailored versions for specific applications.`,
          },
          {
            q: "What are Applicant Tracking Systems (ATS), and how do I optimize my resume for them?",
            a: `**Applicant Tracking Systems (ATS)** are tools employers use to filter and rank resumes.  
To optimize:  

1 - Use keywords from the job description.  
2 - Avoid images, tables, or complex formatting.  
3 - Use standard section headings (e.g., “Work Experience,” “Skills”).  

**Key Tip:** Test your resume by uploading it to an **online ATS checker**.`,
          },
          {
            q: "Can I use online resume templates?",
            a: `Yes, but ensure the template:  

1 - Is **ATS-friendly**.  
2 - Has a **professional design** without excessive graphics.  
3 - Allows for **easy customization**.  

**Key Tip:** Platforms like **Canva**, **Zety**, or **Microsoft Word** offer excellent templates.`,
          },
          {
            q: "How do I include soft skills on my resume?",
            a: `List soft skills in your skills section or demonstrate them in your experience descriptions.  

**Example:**  
Instead of writing “Teamwork,” mention “Collaborated with a cross-functional team to develop a product roadmap.”  

**Key Tip:** Use specific examples to illustrate soft skills rather than listing them.`,
          },
          {
            q: "What should I avoid putting on my resume?",
            a: `1 - Personal information (e.g., marital status, religion, or nationality).  
2 - Salary expectations.  
3 - Irrelevant or outdated experiences.  
4 - Typos and grammatical errors.  

**Key Tip:** Proofread carefully and ask someone else to review your resume.`,
          },
          {
            q: "How can I make my resume stand out?",
            a: `1 - Highlight **quantifiable achievements**.  
2 - **Tailor** it for each application.  
3 - Use a **clean, professional format**.  
4 - Include **certifications or unique skills** relevant to the job.  

**Key Tip:** Focus on what makes you **uniquely qualified** for the role.`,
          },
        ],
      },
    ],
  },

  sop: {
    id: "sop",
    name: "Statement of Purpose",
    sections: [
      {
        id: "sop-main",
        items: [
          {
            q: "What is the Statement of Purpose (SOP)?",
            a: `An SOP is a **personal essay** in your application that explains your **academic background**, **career goals**, and **reasons for choosing the program**.  
It helps the committee evaluate your **motivation**, **fit**, and **communication skills**.  
**Key Tip:** Tell a compelling story—show passion, achievements, and clear future aims.`,
          },
          {
            q: "Why is the SOP important in the application process?",
            a: `It:\n- **Differentiates** you from applicants with similar stats\n- Shows your **personality**, **goals**, and **values**\n- Demonstrates **writing clarity**\n- Proves **program fit**\n**Key Tip:** Tailor each SOP to the **specific** program.`,
          },
          {
            q: "What should an SOP include?",
            a: `- **Introduction:** an engaging hook connected to your field  
- **Academic background:** relevant courses, projects, achievements  
- **Experience:** internships/work/research that show readiness  
- **Motivation:** why this **program/institution/country**  
- **Goals:** short- and long-term plans, and alignment  
- **Conclusion:** reaffirm fit and enthusiasm  
**Key Tip:** Avoid repeating your resume—add **context and reflection**.`,
          },
          {
            q: "How long should the SOP be?",
            a: `Typically **500–1,000 words** (or as specified by the school).  
**Key Tip:** Prioritize **clarity and focus**—quality over quantity.`,
          },
          {
            q: "How can I make my SOP stand out?",
            a: `- Use **authentic anecdotes** tied to your trajectory  
- Keep a **professional yet engaging** tone  
- Show **cause → effect** between experiences and goals  
- Reference **courses/labs/faculty** you’ve researched  
- Avoid clichés and generic claims  
**Key Tip:** Let your **own voice** lead.`,
          },
          {
            q: "What common mistakes should I avoid?",
            a: `- **Vagueness**—be specific with examples  
- Excess **jargon**—write clearly  
- Overly **personal** digressions—stay relevant  
- **Copy-paste** templates—customize for each school  
- **Typos/format** issues—proofread  
**Key Tip:** Ask mentors to review before submission.`,
          },
          {
            q: "How do I address weaknesses in my profile?",
            a: `Briefly acknowledge, then focus on **growth**:\n- What you learned and how you improved\n- Skills or results since the weakness\n**Key Tip:** Show **resilience**; avoid excuses.`,
          },
          {
            q: "Can I reuse the same SOP for multiple schools?",
            a: `Reuse the **structure**, but **customize** content (faculty, labs, curriculum, values) for each program.  
**Key Tip:** Demonstrate **genuine interest** in each institution.`,
          },
          {
            q: "How should I start and end my SOP?",
            a: `**Start:** a concise anecdote/insight linked to your field.  
**End:** tie your goals to program strengths and expected impact.  
**Key Tip:** Be **memorable** without overclaiming.`,
          },
          {
            q: "Who should proofread my SOP?",
            a: `**Mentors, professors, colleagues**, or **professional editors** who know admissions or your field.  
**Key Tip:** Choose reviewers who understand your **story and goals**.`,
          },
          {
            q: "What tone should I use?",
            a: `**Professional and polished**, but natural enough to reflect your personality—avoid both overly casual and overly stiff prose.  
**Key Tip:** Write as if speaking to the **committee**.`,
          },
          {
            q: "Can I mention non-academic interests?",
            a: `Yes—if they **add value** (leadership, service, teamwork) and connect to your academic/professional path.  
**Key Tip:** Keep them **relevant and concise**.`,
          },
          {
            q: "How do I demonstrate fit with the program?",
            a: `- Cite **specific courses**, **labs**, or **faculty**\n- Map program strengths to your **goals**\n- Note **collaboration** or **network** opportunities  
**Key Tip:** Do **thorough research** first.`,
          },
          {
            q: "Should I include quotes or references?",
            a: `Optional—use **sparingly** and only when they strengthen your narrative.  
**Key Tip:** Your **own voice** should dominate.`,
          },
          {
            q: "Can I hire someone to write my SOP?",
            a: `Seek **guidance/editing**, but **write it yourself** for authenticity. Committees value **original, personal** content.  
**Key Tip:** Get professional **feedback**, not **ghostwriting**.`,
          },
        ],
      },
    ],
  },
  recommendation: {
    id: "recommendation",
    name: "Recommendation Letter",
    sections: [
      {
        id: "recommendation-main",
        items: [
          {
            q: "What is a letter of recommendation?",
            a: `A **Letter of Recommendation (LOR)** is a formal document written by someone who knows you **academically or professionally**.  
It highlights your **skills, achievements, character**, and **suitability** for a program or job.  
**Key Tip:** Choose recommenders who can give **specific, detailed examples** of your strengths.`,
          },
          {
            q: "Who should I ask for a letter of recommendation?",
            a: `Ask individuals who:\n- **Know you well** and can speak to your qualifications  
- Are **relevant** to the opportunity (professors, supervisors, mentors)  
- Have a **positive opinion** and can write convincingly  
- Hold a **position of authority** in your field  
**Key Tip:** Avoid family or friends—select someone who can give an **objective, professional** evaluation.`,
          },
          {
            q: "How many letters of recommendation do I need?",
            a: `It depends on the program or institution:\n- **Undergraduate programs:** 1–2 letters  
- **Graduate programs:** 2–3 letters  
- **Jobs or internships:** 1–2 letters (sometimes optional)  
**Key Tip:** Always **check each program’s specific requirements**.`,
          },
          {
            q: "What should be included in a letter of recommendation?",
            a: `A strong LOR includes:\n- **Introduction:** relationship and context  
- **Qualifications:** examples of skills, achievements, qualities  
- **Comparison:** how you stand out from peers  
- **Conclusion:** clear endorsement  
- **Contact Information:** name, position, and email  
**Key Tip:** Each letter should be **tailored** to the opportunity.`,
          },
          {
            q: "How do I ask for a letter of recommendation?",
            a: `1. **Choose wisely:** ensure they can write a strong, personalized letter  
2. **Ask early:** at least 4–6 weeks before the deadline  
3. **Be polite and clear:** explain your purpose and share program details  
4. **Provide materials:** resume, transcripts, and deadlines  
**Example Request:**  
“Dear [Name], I’m applying to [Program] and would appreciate a strong letter of recommendation from you. I’ve attached my resume and program details. Thank you for your time and support!”  
**Key Tip:** Always **express gratitude**, even if they decline.`,
          },
          {
            q: "How do I follow up on my letters of recommendation?",
            a: `- **Send a polite reminder** 1–2 weeks before the deadline  
- **Track submission** if the system allows  
- **Thank them afterward** with a short note  
**Example Follow-Up:**  
“Dear [Name], I wanted to gently remind you about my LOR for [Program], due on [Date]. Thank you again for your support!”  
**Key Tip:** Be respectful of their time.`,
          },
          {
            q: "How do I choose between multiple potential recommenders?",
            a: `Consider:\n- Their **familiarity** with your work  
- The **relevance** of your relationship (academic/professional)  
- Their **reputation or seniority** in the field  
**Key Tip:** A **detailed** letter from someone who knows you well is better than a **generic** one from a high-ranking person.`,
          },
          {
            q: "What if my recommender says no?",
            a: `Don’t worry—it’s often because they feel they can’t write a strong letter.  
1. **Thank them** for their honesty  
2. **Ask someone else** who can provide a stronger recommendation  
**Key Tip:** Always have a **backup list** of recommenders.`,
          },
          {
            q: "Can I see my letter of recommendation?",
            a: `Some institutions allow access; others don’t.  
**Waiving your right** to see it is often viewed positively, as it shows trust.  
**Key Tip:** Discuss the general **content and focus** beforehand to ensure alignment.`,
          },
          {
            q: "What should I do if my recommender doesn’t know how to structure the letter?",
            a: `Provide a simple outline:\n- Relationship and duration of acquaintance  
- Specific strengths and examples  
- Fit for the program or role  
- Strong closing endorsement and contact info  
**Key Tip:** Offering a template helps—but **never write it yourself**.`,
          },
          {
            q: "What if the system requires electronic submission?",
            a: `Most systems email recommenders directly with instructions.  
Ensure they can **access the email** and **submit on time**.  
**Key Tip:** Verify their email and remind them to **check spam folders**.`,
          },
          {
            q: "Can a family member write a letter of recommendation?",
            a: `No. Family recommendations are **biased and unprofessional**.  
**Key Tip:** Only professors, mentors, or supervisors should write LORs.`,
          },
          {
            q: "How long should a letter of recommendation be?",
            a: `Usually **1–2 pages**, depending on relationship depth and requirements.  
**Key Tip:** Keep it **focused and rich** with concrete examples.`,
          },
          {
            q: "What should I do if my recommender misses the deadline?",
            a: `1. **Send a polite reminder**  
2. **Inform the institution** if necessary (some allow extensions)  
3. **Have a backup ready**  
**Key Tip:** Avoid this by **reminding early** and sharing clear instructions.`,
          },
          {
            q: "Can I use a letter of recommendation multiple times?",
            a: `Yes, if it’s a **general recommendation**.  
However, program-specific letters are more effective.  
**Key Tip:** If reused, **update and tailor** it to remain relevant.`,
          },
        ],
      },
    ],
  },

  apply: {
    id: "apply",
    name: "Apply Now",
    sections: [
      {
        id: "apply-main",
        items: [
          {
            q: "How do I sort my applications?",
            a: `Use the "Order by" dropdown to sort your applications based on criteria like **deadlines**, **QS rank**, **GPA**, **application fees**, or **English test scores** (TOEFL, IELTS, Duolingo, MELAB, PTE).`,
          },
          {
            q: 'What does the "Program Match" indicator mean?',
            a: `The "Program Match" gauge shows how closely your profile aligns with the program's requirements (e.g., **strong**, **moderate**, or **weak**).`,
          },
          {
            q: 'What are the different statuses under "Status"?',
            a: `The statuses reflect your application progress:\n\n1 - **Considered** : You are reviewing or deciding about this program.  \n2 - **Applying** : Your application is currently in progress.  \n3 - **Submitted** : Your application has been successfully submitted.`,
          },
          {
            q: "What actions can I take for each program?",
            a: `**Apply Yourself** : You handle the application process independently.  \n\n**Submit with Us** : The QuestApply team reviews your documents and submits the application on your behalf.  \n\n**Remove** : Delete the program from your application list.`,
          },
          {
            q: 'What is the difference between "Apply Yourself" and "Submit with Us"?',
            a: `**Apply Yourself** : You handle the application process independently.  \n\n**Submit with Us** : The QuestApply team reviews your documents and submits the application.`,
          },
          {
            q: 'What does "Apply With Us" stand for?',
            a: `"Apply With Us" stands for students who want the QuestApply team to manage the entire application process from the beginning to the end.`,
          },
          {
            q: "How can I upgrade my subscription?",
            a: `Go to your **profile** on the top-right corner of the page. Click on your profile, and you will see a purple **"Upgrade Now"** button. Click on this button to upgrade your subscription.`,
          },
          {
            q: "How can I view more details about a program?",
            a: `Click on the **"See More Details"** button under each program to access detailed information such as requirements, application fees, and deadlines.`,
          },
          {
            q: "What do the deadlines represent?",
            a: `The deadlines show when the application windows close. Programs may have multiple deadlines, e.g., early and regular admissions (**Fall: March 1, April 1**).`,
          },
          {
            q: "How is the QS rank displayed?",
            a: `The **QS rank** is shown next to the program title and indicates the global ranking of the university.`,
          },
          {
            q: 'What do the "days opening" labels mean?',
            a: `The label indicates how many **days remain** until the application period starts or ends.`,
          },
          {
            q: "How are application fees displayed?",
            a: `Application fees are listed in **USD** next to each program and represent the cost of submitting the application.`,
          },
          {
            q: "How do I filter programs based on specific requirements?",
            a: `Use the **dropdown filters** (e.g., GPA, QS Rank, or English test scores) to narrow down your application list.`,
          },
          {
            q: "What should I do if I need help with the application process?",
            a: `Use the **"Submit with Us"** option for professional assistance or check the **"Video Tutorials"** button at the top for guides.`,
          },
          {
            q: "Can I edit the programs I've already added?",
            a: `You can update the **status** or **remove** a program from your list, but changes to program details must be made directly through the program's website.`,
          },
          {
            q: "How many programs can I add to my application list?",
            a: `The number of programs you can add depends on your **subscription tier** (Free, Basic, Pro, or Premium).`,
          },
          {
            q: 'What does the "English" dropdown include?',
            a: `The "English" dropdown allows sorting based on different **language proficiency tests** like TOEFL, IELTS, Duolingo, MELAB, or PTE.`,
          },
          {
            q: "Where can I find tutorials or guides?",
            a: `Click on the **"Video Tutorials"** button at the top of the page for detailed walkthroughs.`,
          },
          {
            q: 'What happens after I click "Apply Yourself"?',
            a: `You’ll be redirected to the **application form or portal** for the selected program.`,
          },
          {
            q: "Can I track the progress of my applications?",
            a: `Yes, the **status field** indicates your progress, such as "Considered," "Applying," or "Submitted."`,
          },
          {
            q: "What should I do if I encounter an issue?",
            a: `Use the **help icon (?)** in the top-right corner for assistance or reach out to **QuestApply support**.`,
          },
        ],
      },
    ],
  },

  cover: {
    id: "cover",
    name: "Cover Letter",
    sections: [
      {
        id: "cover-main",
        items: [
          {
            q: "What is the purpose of a cover letter for a master's or PhD application?",
            a: `A **cover letter** is a document that accompanies your application and provides additional information about your **qualifications** and **motivation** for applying to the program.  
It allows you to highlight **specific experiences or accomplishments** that make you a strong fit and demonstrate your **interest in pursuing advanced study** in the field.`,
          },
          {
            q: "What should be included in a cover letter for a master's or PhD application?",
            a: `Your cover letter should include the following components:\n\n- **Introduction:** Explain why you are writing and give a brief overview of your background and qualifications.  
- **Body:** Expand on your experiences and achievements that show your potential for success in the program.  
- **Conclusion:** Summarize your interest in the program and thank the reader for considering your application.`,
          },
          {
            q: "How should I format my cover letter for a master's or PhD application?",
            a: `Format it as a **professional business letter**:\n\n- Include a header with **your contact information**, the **date**, and the **recipient’s contact information**.  
- Use a **formal salutation** (e.g., “Dear Dr. Smith”).  
- Write in **clear, concise paragraphs** with proper spacing for easy reading.  
**Key Tip:** Keep it professional and structured while maintaining a genuine tone.`,
          },
          {
            q: "What are some tips for writing a strong cover letter for a master's or PhD application?",
            a: `- **Tailor** your letter to each program and institution, aligning your interests with their mission and values.  
- Use **specific examples** to demonstrate your skills and achievements instead of listing them.  
- Show **enthusiasm and passion** for your field and explain how it connects to your **long-term goals**.  
- **Proofread carefully** for spelling and grammar errors, and ask a **mentor or advisor** to review it.`,
          },
          {
            q: "What are some resources for help with writing a cover letter for a master's or PhD application?",
            a: `You can get help from:\n\n- Your **institution’s career or writing center**  
- **Online writing guides** and **templates**  
- **LinkedIn Learning** courses on cover letter writing  
- **Sample cover letters** from successful applicants in your field`,
          },
        ],
      },
    ],
  },

  personal: {
    id: "personal",
    name: "Personal Statement",
    sections: [
      {
        id: "personal-main",
        items: [
          {
            q: "What is a personal statement?",
            a: `A **personal statement** is a written essay that gives the admissions committee an idea of **who you are** and **why you want to pursue** a particular degree.  
It typically includes information about your **background, achievements, goals, and motivations**.`,
          },
          {
            q: "How important is the personal statement in the admissions process?",
            a: `The personal statement is one of the **most important parts** of your application, as it allows you to showcase your **unique qualities** and demonstrate why you are a **good fit** for the program.  
It can also help you **stand out** from other applicants who may have similar qualifications.`,
          },
          {
            q: "What should I include in my personal statement?",
            a: `Your personal statement should include:\n\n- **Academic background**  
- **Relevant work experience**  
- **Achievements or qualifications** that make you a good fit  
- Your **goals, motivations, and future plans**`,
          },
          {
            q: "How long should my personal statement be?",
            a: `The length of a personal statement can vary, but it is generally recommended to keep it between **500 and 1000 words**.  
Be sure to check the **specific requirements** for the program you are applying to.`,
          },
          {
            q: "How can I make my personal statement stand out?",
            a: `To make your personal statement stand out:\n\n- Focus on telling a **compelling story** about yourself and your motivations.  
- Use **specific examples** to illustrate your points.  
- **Proofread and edit** your statement carefully to ensure clarity and professionalism.`,
          },
          {
            q: "Should I address any weaknesses in my application in my personal statement?",
            a: `While it's not necessary to address weaknesses, it can be helpful to **explain any gaps** in your academic or professional history or provide **context for lower grades or test scores**.`,
          },
          {
            q: "Can I use the same personal statement for multiple applications?",
            a: `You can reuse the same **basic essay** for multiple applications, but you should **tailor** your statement for each program.  
Highlight how your **goals and qualifications align** with the specific program you’re applying to.`,
          },
        ],
      },
    ],
  },
};
