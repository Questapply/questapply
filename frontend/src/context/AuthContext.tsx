import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  profileCompleted: boolean;
  isLoading: boolean;
  login: (token: string, profileCompleted: boolean) => void;
  logout: () => void;
  setProfileCompletionStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, _setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem("token");
    return !!token;
  });

  const [profileCompleted, _setProfileCompleted] = useState<boolean>(() => {
    const storedProfileCompleted = localStorage.getItem("profileCompleted");
    return storedProfileCompleted === "true";
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const setIsAuthenticated = (value: boolean) => {
    console.log(
      `AuthContext: setIsAuthenticated called with: ${value}. Current: ${isAuthenticated}`
    );
    _setIsAuthenticated(value);
  };
  const setProfileCompleted = (value: boolean) => {
    console.log(
      `AuthContext: setProfileCompleted called with: ${value}. Current: ${profileCompleted}`
    );
    _setProfileCompleted(value);
  };
  useEffect(() => {
    console.log("AuthContext useEffect: Initializing authentication state...");
    setIsLoading(true);

    const token = localStorage.getItem("token");
    const storedProfileCompleted = localStorage.getItem("profileCompleted");

    const newIsAuthenticated = !!token;
    const newProfileCompleted = storedProfileCompleted === "true";
    console.log(
      `AuthContext useEffect: Read from localStorage - Token exists: ${newIsAuthenticated}, Profile complete: ${newProfileCompleted}`
    );

    setIsAuthenticated(newIsAuthenticated);
    setProfileCompleted(newProfileCompleted);

    setIsLoading(false);
    console.log(
      `AuthContext useEffect: Loading complete. Final state set. isAuthenticated: ${newIsAuthenticated}, profileCompleted: ${newProfileCompleted}`
    );
  }, []);

  const login = (token: string, isProfileCompleted: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("profileCompleted", String(isProfileCompleted));
    setIsAuthenticated(true);
    setProfileCompleted(isProfileCompleted);
  };

  const setProfileCompletionStatus = (status: boolean) => {
    setProfileCompleted(status);
    localStorage.setItem("profileCompleted", String(status));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profileCompleted");
    setIsAuthenticated(false);
    setProfileCompleted(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        profileCompleted,
        login,
        logout,
        isLoading,
        setProfileCompletionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
