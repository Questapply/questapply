import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../layout/DashboardLayout";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Gift,
  Trophy,
  Star,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  Users,
  BarChart2,
  Lock,
  Unlock,
} from "lucide-react";
import AnimatedCard from "../ui/animated-card";
import { Separator } from "../ui/separator";

const Rewards = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // User level and points data
  const userData = {
    level: 3,
    points: 1250,
    nextLevelPoints: 2000,
    badges: [
      { id: 1, name: "Profile Completer", icon: "CheckCircle2", awarded: true },
      { id: 2, name: "Document Master", icon: "FileText", awarded: true },
      { id: 3, name: "Application Expert", icon: "Award", awarded: false },
      { id: 4, name: "Research Networker", icon: "Users", awarded: true },
      { id: 5, name: "Tracking Pro", icon: "BarChart2", awarded: false },
    ],
    rewards: [
      { id: 1, name: "Premium Resume Template", points: 1000, claimed: true },
      { id: 2, name: "Mock Interview Session", points: 2000, claimed: false },
      { id: 3, name: "SOP Review", points: 1500, claimed: false },
      { id: 4, name: "CV Formatting Service", points: 3000, claimed: false },
      { id: 5, name: "Application Fee Waiver", points: 5000, claimed: false },
    ],
  };

  // Quests/tasks data
  const quests = [
    {
      id: 1,
      title: "Complete your profile",
      description: "Fill out all the sections in your profile",
      points: 250,
      completed: true,
      icon: "CheckCircle2",
    },
    {
      id: 2,
      title: "Upload your first document",
      description: "Add a resume or statement of purpose",
      points: 150,
      completed: true,
      icon: "FileText",
    },
    {
      id: 3,
      title: "Connect with a professor",
      description: "Add your first professor contact",
      points: 300,
      completed: true,
      icon: "Users",
    },
    {
      id: 4,
      title: "Submit an application",
      description: "Complete and submit your first application",
      points: 500,
      completed: false,
      icon: "BarChart2",
    },
    {
      id: 5,
      title: "Get a recommendation letter",
      description: "Receive your first letter of recommendation",
      points: 400,
      completed: true,
      icon: "Award",
    },
  ];

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "CheckCircle2":
        return <CheckCircle2 className="h-5 w-5" />;
      case "FileText":
        return <FileText className="h-5 w-5" />;
      case "Award":
        return <Award className="h-5 w-5" />;
      case "Users":
        return <Users className="h-5 w-5" />;
      case "BarChart2":
        return <BarChart2 className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Quest Rewards
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete quests, earn points, and claim exclusive rewards to enhance
            your applications.
          </p>
        </motion.div>

        {/* User Level and Points */}
        <AnimatedCard delay={0.1} className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-1.5">
            <div className="bg-white dark:bg-gray-900 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      Level {userData.level}
                      <span className="bg-gradient-to-r from-purple-600 to-purple-300 text-transparent bg-clip-text ml-2">
                        Explorer
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {userData.points} / {userData.nextLevelPoints} points to
                      Level {userData.level + 1}
                    </p>
                  </div>
                </div>
                <div className="flex-1 max-w-sm">
                  <Progress
                    value={(userData.points / userData.nextLevelPoints) * 100}
                    className="h-3"
                  />
                  <p className="text-right text-xs mt-1 text-gray-600 dark:text-gray-300">
                    {userData.nextLevelPoints - userData.points} points needed
                    for next level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quests / Tasks */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Available Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            quest.completed
                              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          }`}
                        >
                          {getBadgeIcon(quest.icon)}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-semibold">{quest.title}</h3>
                            {quest.completed && (
                              <span className="ml-2 text-green-600 dark:text-green-400 flex items-center text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {quest.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-purple-600 dark:text-purple-400">
                          +{quest.points} points
                        </div>
                        <Button
                          size="sm"
                          disabled={quest.completed}
                          variant={quest.completed ? "outline" : "default"}
                          className={
                            quest.completed
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                        >
                          {quest.completed ? "Claimed" : "Complete"}
                        </Button>
                      </div>
                    </div>
                    {index < quests.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </motion.div>
                ))}

                <div className="text-center mt-6">
                  <Button variant="outline">View More Quests</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rewards and Badges */}
          <div className="md:col-span-1 space-y-6">
            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Your Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                {userData.badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div
                      className={`p-3 rounded-full ${
                        badge.awarded
                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                      }`}
                    >
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <p className="text-xs mt-2 font-medium">{badge.name}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Rewards Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-purple-500" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.rewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {userData.points >= reward.points ? (
                        <Unlock className="h-4 w-4 text-green-500" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                      <span
                        className={
                          reward.claimed ? "line-through text-gray-500" : ""
                        }
                      >
                        {reward.name}
                      </span>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant={
                          reward.claimed
                            ? "outline"
                            : userData.points >= reward.points
                            ? "default"
                            : "outline"
                        }
                        disabled={
                          reward.claimed || userData.points < reward.points
                        }
                        className={`text-xs ${
                          reward.claimed || userData.points < reward.points
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {reward.claimed ? "Claimed" : `${reward.points} pts`}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
