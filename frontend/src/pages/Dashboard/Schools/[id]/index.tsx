import { useParams, useOutletContext } from "react-router-dom";
import SchoolDetails from "@/components/school-details/SchoolDetails";

type Ctx = { isDarkMode: boolean; toggleTheme: () => void };

export default function SchoolDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { isDarkMode, toggleTheme } = useOutletContext<Ctx>();
  if (!id) return <div>Invalid school id</div>;
  return (
    <SchoolDetails
      schoolId={id}
      isDarkMode={isDarkMode}
      onToggleTheme={toggleTheme}
    />
  );
}
