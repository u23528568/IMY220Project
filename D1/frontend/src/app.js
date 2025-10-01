import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Protected routes - require authentication */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        } />
        <Route path="/project" element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        } />
        <Route path="/projectview" element={
          <ProtectedRoute>
            <ProjectViewPage />
          </ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute>
            <TeamsPage />
          </ProtectedRoute>
        } />
        <Route path="/team1" element={
          <ProtectedRoute>
            <Team1Page />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
