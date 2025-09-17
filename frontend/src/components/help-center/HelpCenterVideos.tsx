import { useState } from "react";
import { VideoTutorial } from "@/components/help-center/VideoTutorial";
import { videoTutorialsData } from "@/components/help-center/VideoTutorialsData";

export default function HelpCenterVideos() {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Video Tutorials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videoTutorialsData.map((video) => (
          <VideoTutorial
            key={video.id}
            video={video}
            isSelected={selectedVideo === video.id}
            onClick={() =>
              setSelectedVideo(video.id === selectedVideo ? null : video.id)
            }
          />
        ))}
      </div>
    </div>
  );
}
