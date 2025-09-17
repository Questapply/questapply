import React, { useState } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TutorialVideo } from "./VideoTutorialsData";

interface VideoTutorialProps {
  video: TutorialVideo;
  isSelected: boolean;
  onClick: () => void;
}

export const VideoTutorial = ({
  video,
  isSelected,
  onClick,
}: VideoTutorialProps) => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <motion.div
        className={`relative overflow-hidden rounded-lg shadow-md ${
          isSelected ? "ring-2 ring-purple-500" : ""
        }`}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-purple-950 dark:to-indigo-950 aspect-video relative cursor-pointer"
          onClick={onClick}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="h-16 w-16 rounded-full flex items-center justify-center bg-purple-500/20 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center">
                <Play className="h-6 w-6 text-white ml-1" />
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="font-medium text-white">{video.title}</h3>
            <p className="text-xs text-white/80 mt-1">{video.duration}</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {video.title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {video.duration}
            </span>
          </div>

          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => setShowDialog(true)}
            >
              <Play className="h-4 w-4 mr-1" />
              Watch Now
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <div className="flex justify-end p-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setShowDialog(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-purple-900/80 to-indigo-900/80">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                {video.title}
              </h3>
              <p className="text-white/80 mb-8">
                {video.description ||
                  `Learn how to use the ${video.title} feature in QuestApply`}
              </p>
              <div className="flex justify-center items-center gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Play className="h-4 w-4 mr-2" />
                  Play Tutorial
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Download Tutorial
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-8">
                This is a placeholder. In a production environment, this would
                be a real video player.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
