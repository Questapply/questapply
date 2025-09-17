import ProfileLayout from "@/components/profile/ProfileLayout";
interface ProfileProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}
export default function ProfilePage({
  isDarkMode,
  onToggleTheme,
}: ProfileProps) {
  return (
    <ProfileLayout isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
  );
}
