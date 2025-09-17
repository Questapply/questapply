import React from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton"; // Assuming this path is correct
import PublicNavbar from "../home/PublicNavbar"; // Import PublicNavbar
import AuthenticatedNavbar from "../home/AuthenticatedNavbar"; // Import AuthenticatedNavbar
import Index from "@/pages/Home/Index"; // Import the Index page

interface HomeRedirectWrapperProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  //   setIsGameOpen: (isOpen: boolean) => void; // Pass this prop down to Index and then to WordQuestGame
}

const HomeRedirectWrapper: React.FC<HomeRedirectWrapperProps> = ({
  isDarkMode,
  onToggleTheme,
  //   setIsGameOpen,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log(
    `HomeRedirectWrapper Render: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}`
  );

  // Show a loading skeleton while AuthContext is determining its initial state.
  if (isLoading) {
    console.log(
      "HomeRedirectWrapper: AuthContext is still loading. Showing loading skeleton..."
    );
    return <LoadingSkeleton type="skeleton" count={3} />;
  }

  // Once AuthContext has finished loading (isLoading is false),
  // render the appropriate Navbar and the Index page.
  // No automatic redirection from here.
  console.log(
    `HomeRedirectWrapper: AuthContext finished loading. isAuthenticated: ${isAuthenticated}. Rendering Index page with appropriate Navbar.`
  );

  return (
    <>
      {isAuthenticated ? (
        <AuthenticatedNavbar
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          //   setIsGameOpen={setIsGameOpen}
        />
      ) : (
        <PublicNavbar
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          //   setIsGameOpen={setIsGameOpen}
        />
      )}
      <Index
        isDarkMode={isDarkMode}
        // onToggleTheme={onToggleTheme}
        // setIsGameOpen={setIsGameOpen} // Pass setIsGameOpen to Index
      />
    </>
  );
};

export default HomeRedirectWrapper;
