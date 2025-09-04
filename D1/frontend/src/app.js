import React from "react";
import { Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProjectPage from "./pages/ProjectPage";
import ProjectViewPage from "./pages/ProjectViewPage";
import FriendsPage from "./pages/FriendsPage";

function App() {
  return (
    <Routes>
  <Route path="/" element={<SplashPage />} />
  <Route path="/home" element={<HomePage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/project" element={<ProjectPage />} />
  <Route path="/projectview" element={<ProjectViewPage />} />
  <Route path="/friends" element={<FriendsPage />} />
    </Routes>
  );
}

export default App;
