import React from "react";
import { Video, Play, RotateCcw, ExternalLink } from "lucide-react";

interface SchoolIntroVideoProps {
  schoolName: string;
  videoUrl?: string; // watch / youtu.be / embed
}

function isYouTubeUrl(u?: string) {
  return !!u && /(?:youtube\.com|youtu\.be)/i.test(u);
}
function getYouTubeId(u?: string): string | null {
  if (!u) return null;
  try {
    if (/youtube\.com\/embed\//i.test(u)) {
      const m = u.match(/embed\/([A-Za-z0-9_-]{6,})/i);
      return m?.[1] ?? null;
    }
    const url = new URL(u);
    if (url.hostname.includes("youtube.com") && url.pathname === "/watch") {
      return url.searchParams.get("v");
    }
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "");
      return id || null;
    }
  } catch {}
  return null;
}
function toYouTubeEmbed(id: string) {
  return `https://www.youtube.com/embed/${id}`;
}
function youTubeThumb(id: string) {
  // hqdefault.jpg معمولاً خوبه؛ اگر سفید بود، mqdefault امتحان کن.
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

const SchoolIntroVideo: React.FC<SchoolIntroVideoProps> = ({
  schoolName,
  videoUrl,
}) => {
  const yt = isYouTubeUrl(videoUrl);
  const vid = yt ? getYouTubeId(videoUrl) : null;
  const embedSrc = vid ? toYouTubeEmbed(vid) : undefined;

  // حالت‌های Lite Embed
  const [activated, setActivated] = React.useState(false); // کاربر روی Play زده؟
  const [loaded, setLoaded] = React.useState(false); // iframe load شد؟
  const [timeoutFired, setTimeoutFired] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    setActivated(false);
    setLoaded(false);
    setTimeoutFired(false);
    setReloadKey(0);
  }, [embedSrc]);

  React.useEffect(() => {
    if (!activated) return;
    setLoaded(false);
    setTimeoutFired(false);
    const t = setTimeout(() => setTimeoutFired(true), 4000);
    return () => clearTimeout(t);
  }, [activated, reloadKey]);

  const showPlaceholder =
    !videoUrl || // اصلاً لینکی نداریم
    (yt && (!activated || (activated && !loaded && timeoutFired))); // یوتیوب و هنوز لود نشده

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <Video className="h-5 w-5 text-purple-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          School Introduction
        </h2>
      </div>

      <div className="p-6">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
          {/* Placeholder / Thumbnail + Play */}
          {showPlaceholder && (
            <div className="absolute inset-0 z-10">
              <div className="w-full h-full relative">
                {vid ? (
                  // کاور یوتیوب
                  <img
                    src={youTubeThumb(vid)}
                    alt={`${schoolName} video cover`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // اگر thumbnail نیومد، پس‌زمینه ساده داشته باشیم
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  // کاور ساده
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Video className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                  <button
                    type="button"
                    onClick={() => setActivated(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-800 transition"
                    disabled={!vid && !!videoUrl && yt}
                  >
                    <Play className="w-4 h-4" />
                    Play video
                  </button>

                  {/* اگر یوتیوب داریم، لینک باز کردن مستقیم */}
                  {vid && (
                    <a
                      href={embedSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-white/70 text-white/90 hover:bg-white/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open on YouTube
                    </a>
                  )}

                  {/* اگر فعال شده بود ولی timeout خورد، Try again */}
                  {activated && timeoutFired && (
                    <button
                      type="button"
                      onClick={() => {
                        setReloadKey((k) => k + 1);
                        setTimeoutFired(false);
                        setLoaded(false);
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-white/90 hover:bg-white text-gray-800"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* یوتیوب (فقط بعد از کلیک کاربر) */}
          {yt && vid && activated && (
            <iframe
              key={embedSrc + ":" + reloadKey}
              src={embedSrc}
              title={`${schoolName} intro video`}
              className={`w-full h-full ${
                showPlaceholder
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onLoad={() => setLoaded(true)}
            />
          )}

          {/* فایل ویدیویی معمولی (غیرِ یوتیوب) */}
          {!yt && videoUrl && (
            <video
              key={videoUrl}
              controls
              className="w-full h-full object-cover"
              src={videoUrl}
              poster="/placeholder.svg"
              onError={() => {
                // اگر فایل خطا داد، همون placeholder بمونه
              }}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">
            About {schoolName}
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Take a virtual tour of our campus and learn about the rich history,
            academic excellence, and vibrant community that makes our university
            unique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolIntroVideo;
