import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Share,
  Bookmark,
  Heart,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import { getPostBySlug, getRecentPosts } from "../../data/blog-data";
import { BlogPost as BlogPostType } from "../../lib/blog-types";
import QuestApplyLogo from "../shared/QuestApplyLogo";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (!slug) {
      navigate("/blog");
      return;
    }

    const currentPost = getPostBySlug(slug);
    if (!currentPost) {
      navigate("/blog");
      return;
    }

    setPost(currentPost);

    // Get related posts from the same category
    const recent = getRecentPosts().filter(
      (p) => p.id !== currentPost.id && p.category === currentPost.category
    );
    // If not enough posts from the same category, add some recent ones
    if (recent.length < 3) {
      const additionalPosts = getRecentPosts()
        .filter(
          (p) => p.id !== currentPost.id && p.category !== currentPost.category
        )
        .slice(0, 3 - recent.length);
      setRelatedPosts([...recent, ...additionalPosts]);
    } else {
      setRelatedPosts(recent.slice(0, 3));
    }

    // Set initial like count (random for demo)
    setLikeCount(Math.floor(Math.random() * 50) + 5);
  }, [slug, navigate]);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-purple-900/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/">
                <QuestApplyLogo variant="full" size="md" />
              </Link>
              <div className="hidden md:flex ml-10 space-x-8">
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/ranking"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                >
                  Ranking
                </Link>
                <Link
                  to="/blog"
                  className="text-purple-700 dark:text-purple-400 border-b-2 border-purple-500 px-3 py-2 text-sm font-medium"
                >
                  Blog
                </Link>
                <Link
                  to="/help-center"
                  className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium"
                >
                  Help Center
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isDarkMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <Link to="/auth?mode=login" className="ml-4">
                <Button
                  variant="outline"
                  className="border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth?mode=signup" className="ml-4">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Blog post content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => navigate("/blog")}
          >
            <ChevronLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </div>

        {/* Article header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4">
            <span className="inline-block bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200 text-sm font-medium px-2.5 py-1 rounded mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-600 dark:text-gray-300 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Published on {post.publishedOn}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{post.readingTime} min read</span>
              </div>
              {post.viewCount && (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{post.viewCount} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Author info */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>
                {post.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {post.author.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Author
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured image */}
        {post.featuredImage && (
          <motion.div
            className="mb-8 overflow-hidden rounded-xl shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AspectRatio ratio={16 / 9}>
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </motion.div>
        )}

        {/* Article content */}
        <motion.div
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-blockquote:border-purple-500 prose-strong:text-gray-900 dark:prose-strong:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Social actions */}
        <div className="mt-12 flex items-center justify-between py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={handleLike}
            >
              <Heart
                className="h-5 w-5"
                fill={isLiked ? "currentColor" : "none"}
              />{" "}
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 ${
                isBookmarked
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-300"
              }`}
              onClick={handleBookmark}
            >
              <Bookmark
                className="h-5 w-5"
                fill={isBookmarked ? "currentColor" : "none"}
              />{" "}
              Save
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
            onClick={handleShare}
          >
            <Share className="h-5 w-5" /> Share
          </Button>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card
                  key={relatedPost.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800/40 border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/blog/${relatedPost.slug}`} className="block">
                    <div className="relative">
                      <AspectRatio ratio={16 / 9}>
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900 dark:text-white">
                        {relatedPost.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA section */}
        <div className="mt-16 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 dark:from-purple-800/20 dark:to-indigo-800/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to start your application journey?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            QuestApply helps you find the right schools, prepare your documents,
            and submit strong applications.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
              Get Started
            </Button>
            <Button
              variant="outline"
              className="border-purple-400 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/50"
            >
              Learn More
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <QuestApplyLogo variant="full" size="md" />
              <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md">
                QuestApply streamlines your graduate school application process
                with AI-powered tools.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  Resources
                </h2>
                <ul>
                  <li className="mb-4">
                    <Link
                      to="/blog"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Blog
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/help-center"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/ranking"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      University Rankings
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  Company
                </h2>
                <ul>
                  <li className="mb-4">
                    <Link
                      to="/about"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      About
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/contact"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Contact
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/privacy"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-6 text-sm font-semibold uppercase text-gray-900 dark:text-white">
                  Legal
                </h2>
                <ul>
                  <li className="mb-4">
                    <Link
                      to="/terms"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/cookies"
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      Cookies Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-8 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 QuestApply. All rights reserved.
            </span>
            <div className="flex mt-4 md:mt-0 space-x-6">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
