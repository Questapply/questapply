import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";

// Auth context / guard
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/components/auth/PrivateRoute";

// صفحه‌ی خانه/لندینگ (غیرمحافظت‌شده)
import HomeRedirectWrapper from "@/components/shared/HomeRedirectWrapper";

// صفحات عمومی
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

// Blog (اگر مسیر فایل‌هایت زیر Dashboard است همان را نگه دار)
import Blog from "@/pages/Dashboard/Blog";
import BlogPost from "@/pages/Dashboard/Blog/[slug]";
import NotificationsList from "@/pages/Dashboard/Notifications";
import NotificationDetails from "@/pages/Dashboard/Notifications/[id]";

// Apply With Us
import ApplyWithUsPlans from "@/pages/ApplyWithUs/Plans";
import ApplyWithUsDashboard from "@/pages/ApplyWithUs/Dashboard";

// والد داشبورد (حتماً داخلش <Outlet/> دارد)
import Dashboard from "@/pages/Dashboard";

// تب‌ها و صفحات زیر داشبورد
import FindSchools from "@/pages/Dashboard/FindSchools";
import FindPrograms from "@/pages/Dashboard/FindPrograms";
import FindProfessors from "@/pages/Dashboard/FindProfessors";
import CreateResume from "@/pages/Dashboard/CreateResume";
import ResumePreview from "@/pages/Dashboard/CreateResume/ResumePreview";
import CreateSop from "@/pages/Dashboard/CreateSop";
import CreateLor from "@/pages/Dashboard/CreateLor";
import ApplyNow from "@/pages/Dashboard/ApplyNow";

import Applications from "@/pages/Dashboard/Applications";
import Documents from "@/pages/Dashboard/Documents";
import Favorites from "@/pages/Favorites";
import Devices from "@/pages/Dashboard/Devices";
import Payments from "@/pages/Dashboard/Payments";
import Checkout from "@/pages/Dashboard/Payments/Checkout";
import HelpCenter from "@/pages/HelpCenter";
import PSU from "@/pages/Dashboard/PSU";
import Rewards from "@/pages/Dashboard/Rewards";
import Support from "@/pages/Dashboard/Support";
import Profile from "@/pages/Profile";
import Professors from "@/pages/Dashboard/Professors";

import CompareSchools from "@/pages/Dashboard/Compare/Schools";
import ComparePrograms from "@/pages/Dashboard/Compare/Programs";

import SchoolsIndex from "@/pages/Dashboard/Schools";
import SchoolDetails from "@/pages/Dashboard/Schools/[id]";
import ProgramsIndex from "@/pages/Dashboard/Programs";
import ProgramDetails from "@/pages/Dashboard/Programs/[id]";

import HelpCenterLayout from "@/pages/HelpCenter";
import HelpCenterFaqs from "@/pages/HelpCenter/Faqs";
import HelpCenterVideos from "@/pages/HelpCenter/VideoTutorials";
import HelpCenterTicket from "@/pages/HelpCenter/SupportTicket";

// default  Darkmode
const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";

  return document.documentElement.classList.contains("dark") || true;
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);

    try {
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    } catch {}
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* خانه / لندینگ (غیرمحافظت‌شده) */}
          <Route
            path="/"
            element={
              <HomeRedirectWrapper
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
              />
            }
          />

          {/* عمومی‌ها */}
          <Route
            path="/auth"
            element={<Auth isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route
            path="/profile"
            element={
              <Profile isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
            }
          />
          <Route path="favorites" element={<Favorites />} />
          <Route path="documents" element={<Documents />} />
          <Route path="professors" element={<Professors />} />
          <Route path="applications" element={<Applications />} />
          <Route path="support" element={<Support />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="payments" element={<Payments />} />
          <Route path="helpcenter" element={<HelpCenter />} />

          {/* Help Center با زیرمسیرها */}
          <Route path="help-center" element={<HelpCenterLayout />}>
            <Route index element={<Navigate to="faqs" replace />} />
            <Route path="faqs" element={<HelpCenterFaqs />} />
            <Route path="video-tutorials" element={<HelpCenterVideos />} />
            <Route path="support-ticket" element={<HelpCenterTicket />} />
          </Route>

          {/* Apply With Us */}
          <Route
            path="/apply-with-us/plans"
            element={
              <PrivateRoute>
                <ApplyWithUsPlans />
              </PrivateRoute>
            }
          />
          <Route
            path="/apply-with-us/dashboard"
            element={
              <PrivateRoute>
                <ApplyWithUsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/apply-with-us/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* داشبورد + روت‌های فرزند (محافظت‌شده) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              </PrivateRoute>
            }
          >
            {/* تب پیش‌فرض داشبورد */}
            <Route index element={<Navigate to="find-schools" replace />} />

            {/* تب‌ها */}
            <Route path="find-schools" element={<FindSchools />} />
            <Route path="find-programs" element={<FindPrograms />} />
            <Route path="find-professors" element={<FindProfessors />} />
            <Route path="create-resume" element={<CreateResume />} />
            <Route path="resume/preview/:id" element={<ResumePreview />} />
            <Route path="create-sop" element={<CreateSop />} />
            <Route path="create-lor" element={<CreateLor />} />
            <Route path="apply-now" element={<ApplyNow />} />

            {/* صفحات کاربردی داشبورد */}

            <Route path="devices" element={<Devices />} />

            <Route path="payments/checkout" element={<Checkout />} />
            <Route path="psu/:relId" element={<PSU />} />

            {/* لیست و جزئیات‌ها */}
            <Route path="schools" element={<SchoolsIndex />} />
            <Route path="schools/:id" element={<SchoolDetails />} />
            <Route path="programs" element={<ProgramsIndex />} />
            <Route path="programs/:programId" element={<ProgramDetails />} />

            {/* Compare */}
            <Route
              path="compare/schools/:schoolIds"
              element={<CompareSchools />}
            />
            <Route
              path="compare/programs/:programIds"
              element={<ComparePrograms />}
            />
            <Route path="notifications" element={<NotificationsList />} />
            <Route path="notifications/:id" element={<NotificationDetails />} />
          </Route>

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>

        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}
