import { useMemo } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import ComparePrograms from "@/components/compare/programs/ComparePrograms";

// کانتکست تم رو از والد داشبورد می‌گیریم (Dashboard/index.tsx با <Outlet context=...>)
type Ctx = { isDarkMode: boolean; toggleTheme: () => void };

export default function CompareProgramsPage() {
  const { isDarkMode, toggleTheme } = useOutletContext<Ctx>();

  const { programIds: raw } = useParams<{ programIds?: string }>();

  const programIds = useMemo(
    () =>
      (raw ? decodeURIComponent(raw) : "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [raw]
  );

  // اگر ComparePrograms پراپ‌های دیگری می‌خواهد، همین‌جا اضافه کن
  return (
    <ComparePrograms
      programIds={programIds} // اگر ویوت اینو می‌خواد
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    />
  );
}
