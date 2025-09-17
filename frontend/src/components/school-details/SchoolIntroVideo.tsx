
import React from "react";
import { Video } from "lucide-react";
import { motion } from "framer-motion";

interface SchoolIntroVideoProps {
  schoolName: string;
  videoUrl?: string;
}

const SchoolIntroVideo: React.FC<SchoolIntroVideoProps> = ({ 
  schoolName, 
  videoUrl = "/placeholder.svg" 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Video className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">School Introduction</h2>
      </div>
      
      <div className="p-6">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
          {videoUrl === "/placeholder.svg" ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <Video className="h-8 w-8 text-purple-500" />
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Video introduction to {schoolName}</p>
              </div>
            </div>
          ) : (
            <video 
              controls
              className="w-full h-full object-cover"
              src={videoUrl}
              poster="/placeholder.svg"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">About {schoolName}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Take a virtual tour of our campus and learn about the rich history, academic excellence, 
            and vibrant community that makes our university unique. This video introduces you to 
            student life, faculty, and the resources available to help you succeed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolIntroVideo;
