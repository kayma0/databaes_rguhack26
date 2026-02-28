import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Swipe from "./pages/Swipe.jsx";
import Chat from "./pages/Chat.jsx";
import Community from "./pages/Community.jsx";
import Welcome from "./pages/Welcome.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Notification from "./pages/Notification.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/swipe" element={<Swipe />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/notification" element={<Notification />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/community" element={<Community />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
