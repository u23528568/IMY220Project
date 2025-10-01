import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import EditProfile from "../components/EditProfile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's projects
        const projectsResult = await ApiService.getUserProjects(user.id);
        if (projectsResult.success) {
          setUserProjects(projectsResult.data);
        } else {
          setError("Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1">
          {!editing ? (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center">
              <img
                src={user?.profilePicture || "/assets/images/Logo.png"}
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
              />
              <h1 className="text-2xl font-bold mt-4 text-orange-400">
                {user?.username || "Loading..."}
              </h1>
              {user?.profile?.name && (
                <p className="text-gray-300 text-lg mt-1">
                  {user.profile.name}
                </p>
              )}
              <div className="mt-4 text-left w-full">
                <h2 className="font-semibold text-lg">About:</h2>
                <p className="text-gray-300 text-sm mt-2">
                  {user?.profile?.bio || user?.bio || "No bio available yet."}
                </p>
              </div>
              {user?.email && (
                <div className="mt-4 text-left w-full">
                  <h2 className="font-semibold text-lg">Contact:</h2>
                  <p className="text-gray-300 text-sm mt-2">
                    {user.email}
                  </p>
                </div>
              )}
              <button className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded w-full" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </div>
          ) : (
            <EditProfile onSave={() => setEditing(false)} />
          )}
        </div>

        {/* Right Column: Projects and Activity */}
        <div className="md:col-span-2 space-y-8">
          {/* User Projects */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Projects</h2>
              <button
                onClick={() => navigate("/project")}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm"
              >
                Create New Project
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded">
                {error}
              </div>
            ) : userProjects.length > 0 ? (
              <div className="space-y-4">
                {userProjects.map((project) => (
                  <div 
                    key={project._id} 
                    className="bg-gray-800 rounded-lg shadow-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => navigate("/projectview", { state: { projectId: project._id } })}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-400">{project.name}</h3>
                        <p className="text-gray-300 text-sm mt-1">
                          {project.description || "No description"}
                        </p>
                        {project.hashtags && (
                          <p className="text-orange-300 text-xs mt-2">{project.hashtags}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        {project.type && (
                          <p className="text-xs text-gray-500 mt-1">{project.type}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-400 mb-4">You haven't created any projects yet.</p>
                <button
                  onClick={() => navigate("/project")}
                  className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded text-white"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>

          {/* Project Statistics */}
          <div>
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 text-center">
                <h3 className="text-2xl font-bold text-orange-400">{userProjects.length}</h3>
                <p className="text-gray-300">Total Projects</p>
              </div>
              <div className="bg-gray-800 rounded-lg shadow-lg p-4 text-center">
                <h3 className="text-2xl font-bold text-orange-400">
                  {user ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
                </h3>
                <p className="text-gray-300">Member Since</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
