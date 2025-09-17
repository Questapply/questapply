import { useState } from "react";
import Auth from "@/components/auth/Auth";

type AuthPageProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export default function AuthPage({ isDarkMode, toggleTheme }: AuthPageProps) {
  return <Auth />;
}
