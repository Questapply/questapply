import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSkeleton from "../loading-skeleton/LoadingSkeleton"; // Assuming this path is correct

interface PrivateRouteProps {
  children: JSX.Element;
  requiresProfileCompletion?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiresProfileCompletion = false,
}) => {
  const { isAuthenticated, profileCompleted, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log(
    `PrivateRoute Render: isLoading=${isLoading}, isAuthenticated=${isAuthenticated}, profileCompleted=${profileCompleted}, requiresProfileCompletion=${requiresProfileCompletion}`
  );

  useEffect(() => {
    if (isLoading) {
      console.log(
        "PrivateRoute Effect: AuthContext is still loading, waiting..."
      );
      return;
    }

    console.log(
      `PrivateRoute Effect: AuthContext finished loading. isAuthenticated=${isAuthenticated}, profileCompleted=${profileCompleted}, path_requires_completion=${requiresProfileCompletion}`
    );

    if (!isAuthenticated) {
      console.log(
        "PrivateRoute Effect: Not authenticated, redirecting to /auth"
      );
      navigate("/auth", { replace: true });
    } else if (requiresProfileCompletion && !profileCompleted) {
      console.log(
        `PrivateRoute Effect: Authenticated but profile NOT complete (${profileCompleted}), redirecting to /profile`
      );
      navigate("/profile");
    } else {
      console.log(
        "PrivateRoute Effect: All checks passed. User is authorized for this path."
      );
    }
  }, [
    isLoading,
    isAuthenticated,
    profileCompleted,
    requiresProfileCompletion,
    navigate,
  ]);

  if (isLoading) {
    return <LoadingSkeleton type="skeleton" count={3} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiresProfileCompletion && !profileCompleted) {
    return null;
  }

  return children;
};

export default PrivateRoute;
