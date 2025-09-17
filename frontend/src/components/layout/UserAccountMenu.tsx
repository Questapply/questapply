import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ArrowUpRight,
  CreditCard,
  Headphones,
  Laptop,
  Video,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";

const UserAccountMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // دریافت توکن از localStorage
        if (!token) {
          navigate("/auth?mode=login");
          return;
        }
        const response = await fetch("http://localhost:5000/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            navigate("/auth?mode=login");
            return;
          }
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/auth");
  };

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 flex items-center justify-center text-white border-2 border-transparent hover:border-white/20"
      >
        <span className="text-lg font-medium">U</span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 flex items-center justify-center text-white border-2 border-transparent hover:border-white/20"
        >
          <span className="text-lg font-medium">
            {userData?.name?.[0] || "U"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 mr-4 shadow-lg border-purple-100 dark:border-gray-700 backdrop-blur-lg bg-white dark:bg-gray-800"
        align="end"
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 border-2 border-purple-200 dark:border-purple-900 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xl">
              <AvatarFallback>{userData?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {userData?.name || "User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userData?.email || "user@example.com"}
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline mt-1 flex items-center"
              >
                <User className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-lg py-6 relative overflow-hidden group"
            onClick={() => navigate("/pro")}
          >
            <span className="relative z-10 flex items-center justify-center w-full">
              Upgrade Now
              <ArrowUpRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></div>
          </Button>
        </div>

        <div className="p-2">
          <div className="grid grid-cols-2 gap-1">
            <Button
              variant="ghost"
              className="justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-6"
              onClick={() => navigate("/payments")}
            >
              <CreditCard className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Subscription
            </Button>
            <Button
              variant="ghost"
              className="justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-6"
              onClick={() => navigate("/support")}
            >
              <Headphones className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
              {userData?.plan || "Free"}
            </Button>
          </div>

          <div className="space-y-1 mt-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-3"
              onClick={() => navigate("/devices")}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <Laptop className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Devices
                </div>
                <span className="text-gray-400">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 9L5 5L1 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-3"
              onClick={() => navigate("/help-center")}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <Video className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Video Tutorial
                </div>
                <span className="text-gray-400">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 9L5 5L1 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-3"
              onClick={() => navigate("/feedback")}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Feedback
                </div>
                <span className="text-gray-400">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 9L5 5L1 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10 px-4 py-3"
              onClick={handleLogout}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <LogOut className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Logout
                </div>
                <span className="text-gray-400">
                  <svg
                    width="6"
                    height="10"
                    viewBox="0 0 6 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 9L5 5L1 1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccountMenu;
