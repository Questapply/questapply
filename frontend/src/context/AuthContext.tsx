import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

/** ---- helpers: JWT ---- */
function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isExpired(token: string, skewSec = 5): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true; // اگر exp نداریم، امن‌ترین حالت: منقضی
  const now = Math.floor(Date.now() / 1000);
  return now >= Number(payload.exp) - skewSec;
}

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const storedProfileCompleted =
      localStorage.getItem("profileCompleted") === "true";

    if (token && !isExpired(token)) {
      setIsAuthenticated(true);
      setProfileCompleted(storedProfileCompleted);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("profileCompleted");
      setIsAuthenticated(false);
      setProfileCompleted(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        const token = localStorage.getItem("token") || "";
        if (token && !isExpired(token)) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("profileCompleted");
          setIsAuthenticated(false);
          setProfileCompleted(false);
        }
      }
      if (e.key === "profileCompleted") {
        setProfileCompleted(
          localStorage.getItem("profileCompleted") === "true"
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (token: string, isProfileCompleted: boolean) => {
    localStorage.setItem("token", token);
    localStorage.setItem("profileCompleted", String(isProfileCompleted));
    if (!token || isExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("profileCompleted");
      setIsAuthenticated(false);
      setProfileCompleted(false);
      return;
    }
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
  const value = useMemo(
    () => ({
      isAuthenticated,
      profileCompleted,
      isLoading,
      login,
      logout,
      setProfileCompletionStatus,
    }),
    [isAuthenticated, profileCompleted, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
};
