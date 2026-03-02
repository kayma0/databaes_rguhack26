import { Navigate, useLocation } from "react-router-dom";

export default function RequireRole({ allow, children }) {
  const location = useLocation();
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("mentorme_user") || "{}");
  } catch {
    user = {};
  }

  const role = user.userType; // "mentee" | "mentor"

  // Not onboarded yet
  if (!role) return <Navigate to="/onboarding" replace />;

  // Wrong role trying to access page
  if (!allow.includes(role)) {
    if (role === "mentor") {
      if (location.pathname === "/goals") {
        return <Navigate to="/mentor-goals" replace />;
      }
      if (location.pathname === "/community") {
        return <Navigate to="/mentor-community" replace />;
      }
      return <Navigate to="/mentor" replace />;
    }

    if (location.pathname === "/mentor-goals") {
      return <Navigate to="/goals" replace />;
    }
    if (location.pathname === "/mentor-community") {
      return <Navigate to="/community" replace />;
    }

    return <Navigate to="/roadmap" replace />;
  }

  return children;
}
