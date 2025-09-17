import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { GradientCard } from "../ui/gradient-card";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CallToAction = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const { isAuthenticated, isLoading, profileCompleted } = useAuth();
  const navigate = useNavigate();
  // Add the handle onClick event
  const handleBeginJourneyClick = () => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (profileCompleted) {
        // user logged in and their profile is complete.
        navigate("/dashboard");
      } else {
        // user profile is not complete.
        navigate("/profile");
      }
    } else {
      // The user is not logged in
      navigate("/auth?mode=signup");
    }
  };

  useEffect(() => {
    setMounted(true);

    // Create the particle canvas effect
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }[] = [];

    const particleCount = 70;
    const colors = [
      "rgba(255, 255, 255, ",
      "rgba(168, 85, 247, ",
      "rgba(99, 102, 241, ",
    ];

    for (let i = 0; i < particleCount; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomOpacity = Math.random() * 0.3 + 0.1;

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: randomOpacity,
        color: `${randomColor}${randomOpacity})`,
      });
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Reset position if out of bounds
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Animation variants
  const sparkleVariants = {
    initial: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 20px 5px rgba(79, 70, 229, 0.4)",
      transition: {
        duration: 0.3,
        yoyo: Infinity,
      },
    },
  };

  const mainTextVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900"
    >
      {/* Enhanced Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-900" />

      {/* Enhanced Particle Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Cosmic Accents - Star sparkles */}
      <motion.div
        className="absolute top-10 left-1/4 text-white opacity-70"
        variants={{
          initial: { opacity: 0.3 },
          animate: {
            opacity: [0.3, 1, 0.3],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "loop" as const,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>
      <motion.div
        className="absolute top-20 right-1/4 text-white opacity-60"
        variants={{
          initial: { opacity: 0.3 },
          animate: {
            opacity: [0.3, 1, 0.3],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "loop" as const,
              delay: 0.5,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>
      <motion.div
        className="absolute bottom-16 right-1/3 text-white opacity-50"
        variants={{
          initial: { opacity: 0.3 },
          animate: {
            opacity: [0.3, 1, 0.3],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "loop" as const,
              delay: 1,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        <Sparkles className="w-5 h-5" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center"
        >
          <GradientCard
            variant="glowing"
            className="w-full max-w-4xl mx-auto px-8 py-12 md:py-14 flex flex-col items-center justify-center border-purple-500/30 shadow-xl"
          >
            {/* Decorative sparkles at the top */}
            <motion.div className="text-white mb-6">
              <Sparkles className="h-6 w-6" />
            </motion.div>

            {/* Shorter, impactful title */}
            <motion.h2
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                  },
                },
              }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 text-white drop-shadow-[0_0_8px_rgba(183,148,244,0.8)] font-heading tracking-tight"
            >
              Begin Your Journey Today
            </motion.h2>

            {/* Concise description */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                  },
                },
              }}
              className="text-lg md:text-xl text-purple-100 text-center mb-8 max-w-2xl mx-auto"
            >
              Get matched with ideal universities and maximize your chances of
              acceptance with our AI-powered platform.
            </motion.p>

            {/* CTA Button with consistent cyan color in both light and dark mode */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.7,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <motion.div
                variants={{
                  initial: { scale: 1 },
                  hover: {
                    scale: 1.05,
                    boxShadow: "0px 0px 20px 5px rgba(56, 189, 248, 0.4)",
                    transition: {
                      duration: 0.3,
                      yoyo: Infinity,
                    },
                  },
                }}
                initial="initial"
                whileHover="hover"
                className="inline-block"
              >
                <Button
                  onClick={handleBeginJourneyClick}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white text-lg py-6 px-8 rounded-md shadow-[0_4px_20px_rgba(56,189,248,0.5)] transition-all duration-300 dark:bg-cyan-500 dark:hover:bg-cyan-600 dark:text-white dark:shadow-[0_4px_20px_rgba(56,189,248,0.5)]"
                >
                  Begin Your Journey
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust badges in a cleaner layout */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3,
                  },
                },
              }}
              className="mt-8 pt-5 border-t border-purple-500/20 w-full flex flex-wrap justify-center gap-x-8 gap-y-2 items-center"
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                    },
                  },
                }}
                className="text-purple-200/80 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                No credit card required
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                    },
                  },
                }}
                className="text-purple-200/80 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Join 10,000+ students
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.7,
                      ease: "easeOut",
                    },
                  },
                }}
                className="text-purple-200/80 text-sm flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Success rate 94%
              </motion.div>
            </motion.div>
          </GradientCard>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
