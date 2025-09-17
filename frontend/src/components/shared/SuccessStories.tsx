import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  testimonial: string;
  rating: number;
  avatarFallback: string;
}

const testimonials: Testimonial[] = [
  // First Column
  {
    id: 1,
    name: "Alex Johnson",
    role: "Data Science Student",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    testimonial:
      "QuestApply helped me identify universities that perfectly matched my profile. I got accepted to my dream program!",
    rating: 5,
    avatarFallback: "AJ",
  },
  {
    id: 2,
    name: "Emily Rodriguez",
    role: "Engineering Applicant",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg",
    testimonial:
      "The personalized university recommendations were spot on! I'm now studying at a university that's the perfect fit for my interests.",
    rating: 5,
    avatarFallback: "ER",
  },
  {
    id: 3,
    name: "Michael Zhang",
    role: "Computer Science Graduate",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    testimonial:
      "QuestApply's AI tutor helped me prepare for my technical interviews. I couldn't have gotten into my top-choice program without it.",
    rating: 5,
    avatarFallback: "MZ",
  },

  // Second Column
  {
    id: 4,
    name: "Sophia Chen",
    role: "MBA Candidate",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    testimonial:
      "The 7-stage process simplified what would have been months of research and preparation. The AI assistant guided me through every step.",
    rating: 5,
    avatarFallback: "SC",
  },
  {
    id: 5,
    name: "James Wilson",
    role: "PhD Applicant",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    testimonial:
      "Finding the right professors to work with was daunting until I used QuestApply. The professor matching feature is revolutionary!",
    rating: 5,
    avatarFallback: "JW",
  },
  {
    id: 6,
    name: "Olivia Parker",
    role: "Medical School Student",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    testimonial:
      "My personal statement went through several revisions with QuestApply's AI feedback. The result? Acceptance to 3 top medical schools!",
    rating: 5,
    avatarFallback: "OP",
  },

  // Third Column
  {
    id: 7,
    name: "Marcus Taylor",
    role: "Computer Science Major",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    testimonial:
      "I was lost in the maze of university applications until I found QuestApply. It streamlined my applications to top tech universities.",
    rating: 5,
    avatarFallback: "MT",
  },
  {
    id: 8,
    name: "Aisha Patel",
    role: "International Student",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    testimonial:
      "As an international student, I was overwhelmed with visa requirements and university applications. QuestApply simplified everything.",
    rating: 5,
    avatarFallback: "AP",
  },
  {
    id: 9,
    name: "Daniel Kim",
    role: "STEM Fellowship Recipient",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    testimonial:
      "The scholarship matching feature led me to a fellowship I didn't even know existed. Now my education is fully funded!",
    rating: 5,
    avatarFallback: "DK",
  },
];

const SuccessStories = () => {
  const renderStars = (count: number) => {
    return Array(count)
      .fill(null)
      .map((_, index) => (
        <Star key={index} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ));
  };

  // Duplicate testimonials for infinite scroll effect
  const duplicatedFirstColumn = [
    ...testimonials.slice(0, 3),
    ...testimonials.slice(0, 3),
  ];
  const duplicatedSecondColumn = [
    ...testimonials.slice(3, 6),
    ...testimonials.slice(3, 6),
  ];
  const duplicatedThirdColumn = [
    ...testimonials.slice(6, 9),
    ...testimonials.slice(6, 9),
  ];

  // Animation settings
  const upwardAnimation = {
    y: [0, -700],
    transition: {
      y: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 20,
        ease: "linear",
      },
    },
  };

  const downwardAnimation = {
    y: [-700, 0],
    transition: {
      y: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 20,
        ease: "linear",
      },
    },
  };

  return (
    <section className="w-full bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Title - Styled to match Heroes section */}
        <motion.h2
          className="text-3xl md:text-4xl lg:text-[4.5rem] font-bold text-center mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          Success Stories
        </motion.h2>

        {/* Subtitle - Styled to match Heroes section subtitle */}
        <motion.p
          className="text-lg md:text-xl text-center mb-16 text-purple-200 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Don't just take our word for it. Hear from students who transformed
          their university application journey with QuestApply.
        </motion.p>

        {/* Testimonials Container */}
        <div className="w-full max-w-[1216px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* First Column - Cards Go Up */}
            <div className="space-y-8 overflow-hidden h-[700px] relative">
              <motion.div className="space-y-8" animate={upwardAnimation}>
                {duplicatedFirstColumn.map((testimonial, index) => (
                  <div key={`${testimonial.id}-${index}`} className="md:mt-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full shadow-xl dark:bg-black/80 dark:border-gray-800/50 hover:border-purple-500/50 transition-all duration-300">
                      <div className="mb-4">
                        <p className="text-white dark:text-gray-200 mb-6">
                          "{testimonial.testimonial}"
                        </p>
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-purple-300 dark:border-purple-700">
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                            <AvatarFallback className="bg-purple-200 text-purple-800">
                              {testimonial.avatarFallback}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-white dark:text-white">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-cyan-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-3">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Second Column - Cards Go Down */}
            <div className="space-y-8 overflow-hidden h-[700px] relative">
              <motion.div className="space-y-8" animate={downwardAnimation}>
                {duplicatedSecondColumn.map((testimonial, index) => (
                  <div key={`${testimonial.id}-${index}`} className="md:mt-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full shadow-xl dark:bg-black/80 dark:border-gray-800/50 hover:border-purple-500/50 transition-all duration-300">
                      <div className="mb-4">
                        <p className="text-white dark:text-gray-200 mb-6">
                          "{testimonial.testimonial}"
                        </p>
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-purple-300 dark:border-purple-700">
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                            <AvatarFallback className="bg-purple-200 text-purple-800">
                              {testimonial.avatarFallback}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-white dark:text-white">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-cyan-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-3">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Third Column - Cards Go Up */}
            <div className="space-y-8 overflow-hidden h-[700px] relative">
              <motion.div className="space-y-8" animate={upwardAnimation}>
                {duplicatedThirdColumn.map((testimonial, index) => (
                  <div key={`${testimonial.id}-${index}`} className="md:mt-0">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 h-full shadow-xl dark:bg-black/80 dark:border-gray-800/50 hover:border-purple-500/50 transition-all duration-300">
                      <div className="mb-4">
                        <p className="text-white dark:text-gray-200 mb-6">
                          "{testimonial.testimonial}"
                        </p>
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4 border-2 border-purple-300 dark:border-purple-700">
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                            <AvatarFallback className="bg-purple-200 text-purple-800">
                              {testimonial.avatarFallback}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-white dark:text-white">
                              {testimonial.name}
                            </h4>
                            <p className="text-sm text-cyan-400">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-3">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
