import { Navigate } from "react-router-dom";

export default function PublicOnly({ children }) {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("mentorme_user") || "{}");
  } catch {
    user = {};
  }

  const role = user?.userType;

  if (role === "mentor") {
    return <Navigate to="/mentor" replace />;
  }

  if (role === "mentee") {
    return <Navigate to="/roadmap" replace />;
  }

  return children;
}
