import { Navigate } from "react-router-dom";

export default function RequireRole({ allow, children }) {
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
    return <Navigate to={role === "mentor" ? "/mentor" : "/roadmap"} replace />;
  }

  return children;
}
