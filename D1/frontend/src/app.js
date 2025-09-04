import React from "react";
import { Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProjectPage from "./pages/ProjectPage";
import ProjectViewPage from "./pages/ProjectViewPage";
import FriendsPage from "./pages/FriendsPage";
import TeamsPage from "./pages/TeamsPage";
import Team1Page from "./pages/Team1Page";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/projectview" element={<ProjectViewPage />} />
      <Route path="/teams" element={<TeamsPage />} />
      <Route path="/team1" element={<Team1Page />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
}

export default App;
