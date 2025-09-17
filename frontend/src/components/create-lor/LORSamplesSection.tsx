import React, { useState } from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { toast } from "../../hooks/use-toast";

const LORSamplesSection = () => {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  const samples = [
    {
      id: "academic-undergrad",
      title: "Academic LOR - Undergraduate",
      description: "For Bachelor students applying to Master's programs",
      preview:
        "In my 25 years of teaching, Maria stands out among the top 1% of students I have encountered. Her exceptional analytical skills and intellectual curiosity set her apart...",
    },
    {
      id: "academic-grad",
      title: "Academic LOR - Graduate",
      description: "For Master's students applying to PhD programs",
      preview:
        "Robert's exceptional ability to formulate research questions and design elegant experiments demonstrates his readiness for doctoral studies. His work on autonomous systems was particularly impressive...",
    },
    {
      id: "research-lor",
      title: "Research LOR",
      description: "Emphasizing research experience and capabilities",
      preview:
        "During two years in my lab, Jennifer demonstrated remarkable aptitude for complex experimental design and analysis. Her diligence in validating hypotheses and attention to methodological rigor...",
    },
    {
      id: "professional-lor",
      title: "Professional LOR",
      description: "From employers or supervisors",
      preview:
        "During her three years as a software engineer on our team, Jennifer consistently delivered high-quality solutions to complex problems. Her ability to quickly grasp new technologies...",
    },
    {
      id: "engineering-lor",
      title: "Engineering LOR",
      description: "Specific to engineering disciplines",
      preview:
        "Michael's exceptional problem-solving abilities and technical expertise make him stand out among his peers. His groundbreaking senior design project demonstrated both theoretical knowledge and practical skills...",
    },
    {
      id: "business-lor",
      title: "Business School LOR",
      description: "For MBA and business program applicants",
      preview:
        "In my capacity as Director of Strategy, I've observed Lisa's remarkable business acumen and leadership skills firsthand. Her analytical approach to market challenges and ability to rally cross-functional teams...",
    },
    {
      id: "computer-science-lor",
      title: "Computer Science LOR",
      description: "For CS and IT program applicants",
      preview:
        "Alex has consistently demonstrated exceptional aptitude for algorithm design and computational thinking. His implementation of a novel approach to distributed systems optimization showcases both technical prowess...",
    },
    {
      id: "scholarship-lor",
      title: "Scholarship LOR",
      description: "Focused on merit and financial need",
      preview:
        "Despite significant financial constraints, Sophia has maintained academic excellence while working part-time to support her education. Her determination, intellectual curiosity, and community service make her...",
    },
    {
      id: "character-reference",
      title: "Character Reference",
      description: "Highlighting personal qualities and integrity",
      preview:
        "Beyond his academic achievements, Daniel has demonstrated remarkable leadership as the president of our student government. His integrity, empathy, and commitment to fostering an inclusive campus environment...",
    },
  ];

  const handleViewSample = (id: string) => {
    setSelectedSample(id);
    toast({
      title: "Sample Loaded",
      description: "You can now view and use this LOR template.",
      variant: "default",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="animate-fade-in"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-medium mb-1">{sample.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {sample.description}
            </p>
            <div className="bg-white dark:bg-gray-700/50 p-3 rounded border border-gray-100 dark:border-gray-600 mb-4 text-sm text-gray-700 dark:text-gray-300 italic">
              "{sample.preview}"
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleViewSample(sample.id)}
            >
              View Sample
            </Button>
          </div>
        ))}
      </div>

      {selectedSample && (
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {samples.find((s) => s.id === selectedSample)?.title} Template
            </h2>

            <div className="prose dark:prose-invert max-w-none">
              <p className="mb-4">[Date]</p>
              <p className="mb-4">
                Admissions Committee
                <br />
                University Name
                <br />
                Address Line 1<br />
                City, State ZIP
              </p>

              <p className="mb-4">Dear Members of the Admissions Committee,</p>

              <p className="mb-4">
                I am writing to express my strongest recommendation for [Student
                Name] who is applying to your [Program Name] program. As [your
                position] at [your institution], I have had the pleasure of
                [knowing/teaching/working with] [Student Name] for [time
                period], during which time I have observed their exceptional
                [key qualities].
              </p>

              <p className="mb-4">
                [Student Name] has consistently demonstrated [specific
                achievement or quality] in [specific context]. For example,
                [provide specific example that demonstrates the student's
                abilities]. This example illustrates their [relevant skill or
                quality] that would make them an excellent candidate for your
                program.
              </p>

              <p className="mb-4">
                Compared to other students I have [taught/worked with], [Student
                Name] ranks in the top [X%]. Their [specific skill sets] are
                particularly impressive and demonstrate a level of
                [maturity/insight/ability] that is rare among students at this
                stage.
              </p>

              <p className="mb-4">
                Beyond their academic achievements, [Student Name] possesses
                remarkable [personal qualities] that will enable them to thrive
                in your program. They have shown [examples of leadership,
                teamwork, or other relevant qualities].
              </p>

              <p className="mb-4">
                I believe [Student Name] would be an excellent fit for your
                [Program Name] because [specific reasons relating student's
                qualities to the program].
              </p>

              <p className="mb-4">
                In conclusion, I give [Student Name] my highest recommendation
                without reservation. They have the [qualities, skills, and
                characteristics] needed to excel in your program and make
                significant contributions to the field of [relevant field].
              </p>

              <p className="mb-6">
                Please feel free to contact me at [your contact information] if
                you require any additional information.
              </p>

              <p className="mb-4">Sincerely,</p>

              <p>
                [Your Name]
                <br />
                [Your Title]
                <br />
                [Your Institution]
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button>Use This Template</Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LORSamplesSection;
