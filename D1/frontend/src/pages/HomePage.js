import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { detectLanguagesFromFiles, getLanguageColor } from "../utils/languageDetection";
import { formatDateToCAT } from "../utils/timezone";

export default function HomePage() {
  const [feedType, setFeedType] = useState("global");
  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [friendsProjects, setFriendsProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all projects for the global feed (sorted by newest first)
        const allProjectsResult = await ApiService.getAllProjects();
        if (allProjectsResult.success) {
          const sorted = allProjectsResult.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setProjects(sorted);
        }
        
        // Fetch user's own projects
        const userProjectsResult = await ApiService.getUserProjects();
        if (userProjectsResult.success) {
          const sorted = userProjectsResult.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setUserProjects(sorted);
        } else {
          setError("Failed to load your repositories");
        }

        // Fetch friends' projects and saved projects
        const friendsProjectsResult = await ApiService.getFriendsProjects();
        if (friendsProjectsResult.success) {
          const sorted = friendsProjectsResult.data.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          );
          setFriendsProjects(sorted);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const feedData = feedType === "local" ? userProjects : 
                   feedType === "friends" ? friendsProjects : 
                   projects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1">
        <aside className="w-64 bg-gray-800 p-4 flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-2">
            {user?.profile?.avatar ? (
              <img
                src={user.profile.avatar}
                alt="User Avatar"
                className="w-12 h-12 rounded-full cursor-pointer object-cover"
                onClick={() => navigate("/profile")}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full cursor-pointer flex items-center justify-center bg-gray-700"
                onClick={() => navigate("/profile")}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-8 h-8 text-gray-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
            )}
            <span className="font-semibold">
              {user?.profile?.name || user?.username || 'User'}
            </span>
          </div>

          <div>
            <h2 className="text-gray-400 text-sm mb-2">Your Repositories</h2>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="bg-gray-700 p-2 rounded h-8"></div>
                <div className="bg-gray-700 p-2 rounded h-8"></div>
              </div>
            ) : userProjects.length > 0 ? (
              <ul className="space-y-2">
                {userProjects.slice(0, 5).map((project) => (
                  <li 
                    key={project._id}
                    className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer text-sm"
                    onClick={() => navigate(`/projectview`, { state: { projectId: project._id } })}
                  >
                    {project.name}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 text-sm">
                <p>No repositories yet.</p>
                <p className="text-xs text-gray-500 mt-1">Create your first project to get started</p>
                <button
                  onClick={() => navigate("/project")}
                  className="mt-2 text-orange-400 hover:text-orange-300 text-xs font-medium"
                >
                  + Create repository
                </button>
              </div>
            )}
          </div>



          <div>
            <h2 className="text-gray-400 text-sm mb-2">Quick Actions</h2>
            <ul className="space-y-2">
              <li 
                className="bg-orange-600 hover:bg-orange-700 p-2 rounded cursor-pointer text-sm text-center"
                onClick={() => navigate("/project")}
              >
                View Projects
              </li>
              <li 
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded cursor-pointer text-sm text-center"
                onClick={() => navigate("/friends")}
              >
                Find Friends
              </li>
            </ul>
          </div>
        </aside>

        <section className="flex-1 p-6">
          <h1 className="text-3xl font-display font-bold mb-4 tracking-tight">Dashboard</h1>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
              <h2 className="font-semibold">Project Activity Feed</h2>
              <div className="space-x-2">
                <button
                  onClick={() => setFeedType("global")}
                  className={`px-3 py-1 rounded text-sm ${
                    feedType === "global"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Global
                </button>
                <button
                  onClick={() => setFeedType("friends")}
                  className={`px-3 py-1 rounded text-sm ${
                    feedType === "friends"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Friends
                </button>
                <button
                  onClick={() => setFeedType("local")}
                  className={`px-3 py-1 rounded text-sm ${
                    feedType === "local"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  My Projects
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-700 p-4 rounded animate-pulse">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded">
                {error}
              </div>
            ) : feedData.length > 0 ? (
              <div className="space-y-4">
                {feedData.map((project) => (
                  <div 
                    key={project._id} 
                    className="bg-gray-700 p-4 rounded hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() => navigate("/projectview", { state: { projectId: project._id } })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-400">{project.name}</h3>
                        {project.isSaved && (
                          <span className="text-xs bg-blue-600 px-2 py-1 rounded ml-2">Saved</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {project.type || "Project"}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {project.description || "No description available"}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>By {project.owner?.profile?.name || project.owner?.username || "Unknown"}</span>
                      <span>{formatDateToCAT(project.createdAt)}</span>
                    </div>
                    {(() => {
                      const languages = detectLanguagesFromFiles(project.files || []);
                      return languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {languages.slice(0, 3).map((language, index) => (
                            <span 
                              key={index} 
                              className={`inline-block ${getLanguageColor(language)} text-white text-xs px-2 py-1 rounded-full font-medium`}
                            >
                              {language}
                            </span>
                          ))}
                          {languages.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{languages.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p className="mb-4">
                  {feedType === "local" ? "You haven't created any projects yet." : 
                   feedType === "friends" ? "Your friends haven't created or saved any projects yet." :
                   "No projects available."}
                </p>
                {feedType === "local" && (
                  <button
                    onClick={() => navigate("/project")}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white"
                  >
                    Create Your First Project
                  </button>
                )}
                {feedType === "friends" && (
                  <button
                    onClick={() => navigate("/friends")}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white"
                  >
                    Find Friends
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
