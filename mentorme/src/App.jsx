import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Onboarding from "./pages/Onboarding.jsx";

import Welcome from "./pages/Welcome.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Swipe from "./pages/Swipe.jsx";
import Notification from "./pages/Notification.jsx";
import Goals from "./pages/Goals.jsx";

import Community from "./pages/Community.jsx";

import MentorDashboard from "./pages/MentorDashboard.jsx";

import RequireRole from "./components/RequireRole.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* MENTEE ONLY */}
      <Route
        path="/welcome"
        element={
          <RequireRole allow={["mentee"]}>
            <Welcome />
          </RequireRole>
        }
      />
      <Route
        path="/roadmap"
        element={
          <RequireRole allow={["mentee"]}>
            <Roadmap />
          </RequireRole>
        }
      />
      <Route
        path="/swipe"
        element={
          <RequireRole allow={["mentee"]}>
            <Swipe />
          </RequireRole>
        }
      />
      <Route
        path="/notification"
        element={
          <RequireRole allow={["mentee"]}>
            <Notification />
          </RequireRole>
        }
      />
      <Route
        path="/goals"
        element={
          <RequireRole allow={["mentee"]}>
            <Goals />
          </RequireRole>
        }
      />

      {/* SHARED */}
      <Route
        path="/community"
        element={
          <RequireRole allow={["mentee", "mentor"]}>
            <Community />
          </RequireRole>
        }
      />

      {/* MENTOR ONLY */}
      <Route
        path="/mentor"
        element={
          <RequireRole allow={["mentor"]}>
            <MentorDashboard />
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
