import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function HomePage() {
  const [feedType, setFeedType] = useState("global");
  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all projects for the feed
        const projectsResult = await ApiService.getAllProjects();
        if (projectsResult.success) {
          setProjects(projectsResult.data);
          
          // Filter user's own projects for the sidebar
          const userOwnProjects = projectsResult.data.filter(
            project => project.owner?._id === user?.id
          );
          setUserProjects(userOwnProjects);
        } else {
          setError("Failed to load projects");
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const feedData = feedType === "local" ? 
    projects.filter(project => project.owner?._id === user?.id) : 
    projects;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1">
        <aside className="w-64 bg-gray-800 p-4 flex flex-col space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img
              src="/assets/images/profilepic.jpg"
              alt="User Avatar"
              className="w-12 h-12 rounded-full cursor-pointer"
              onClick={() => navigate("/profile")}
            />
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
                <button
                  onClick={() => navigate("/project")}
                  className="mt-2 text-orange-400 hover:text-orange-300"
                >
                  Create your first project
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
                New Project
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
          <h1 className="text-2xl font-bold mb-4">Home</h1>

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
                  All Projects
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
                      <h3 className="font-semibold text-orange-400">{project.name}</h3>
                      <span className="text-xs text-gray-400">
                        {project.type || "Project"}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {project.description || "No description available"}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>By {project.owner?.profile?.name || project.owner?.username || "Unknown"}</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    {project.hashtags && (
                      <div className="mt-2">
                        <span className="text-xs text-orange-300">{project.hashtags}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p className="mb-4">
                  {feedType === "local" ? "You haven't created any projects yet." : "No projects available."}
                </p>
                {feedType === "local" && (
                  <button
                    onClick={() => navigate("/project")}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-white"
                  >
                    Create Your First Project
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
