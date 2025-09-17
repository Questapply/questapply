import React from "react";
import { motion } from "framer-motion";
import AnimatedCard from "../ui/animated-card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Mail,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Heart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Professor {
  id: number;
  name: string;
  university: string;
  department: string;
  research: string;
  email: string;
  image: string;
  responseStatus: "responded" | "pending" | "declined";
  lastContacted: string;
  favorite: boolean;
}

const ListProfessors = () => {
  const professors: Professor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      university: "Massachusetts Institute of Technology",
      department: "Computer Science",
      research: "Artificial Intelligence, Machine Learning",
      email: "sjohnson@mit.edu",
      image: "/placeholder.svg",
      responseStatus: "responded",
      lastContacted: "2023-11-15",
      favorite: true,
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      university: "Stanford University",
      department: "Data Science",
      research: "Big Data Analytics, Statistical Learning",
      email: "mchen@stanford.edu",
      image: "/placeholder.svg",
      responseStatus: "pending",
      lastContacted: "2023-11-20",
      favorite: true,
    },
    {
      id: 3,
      name: "Dr. Rachel Williams",
      university: "Harvard University",
      department: "Computer Science",
      research: "Human-Computer Interaction, UX Research",
      email: "rwilliams@harvard.edu",
      image: "/placeholder.svg",
      responseStatus: "declined",
      lastContacted: "2023-11-05",
      favorite: true,
    },
  ];

  const getResponseBadge = (status: string) => {
    switch (status) {
      case "responded":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Responded
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "declined":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="h-3 w-3 mr-1" /> Declined
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          List Professors
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Professors identified by our team for your target programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {professors.map((professor, index) => (
          <AnimatedCard
            key={professor.id}
            delay={index * 0.1}
            className="overflow-hidden"
          >
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-28 md:h-auto flex items-center justify-center p-4 md:p-0 relative">
                <img
                  src={professor.image}
                  alt={professor.name}
                  className="w-24 h-24 md:w-full md:h-full rounded-full md:rounded-none object-cover"
                />
                <button className="absolute top-2 right-2 md:top-2 md:right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                </button>
              </div>
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{professor.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {professor.university}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {professor.department}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Create Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        Send Reminder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-sm mt-3 text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Research:</span>{" "}
                  {professor.research}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between">
                  <div className="flex items-center">
                    {getResponseBadge(professor.responseStatus)}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      <Clock className="inline h-3 w-3 mr-0.5" />
                      Last contacted:{" "}
                      {new Date(professor.lastContacted).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 sm:mt-0 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Button>
                    <Button size="sm" className="flex items-center gap-1">
                      <Send className="h-4 w-4" />
                      <span>Request LOR</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};

export default ListProfessors;
