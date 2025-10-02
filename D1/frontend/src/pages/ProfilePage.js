import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import EditProfile from "../components/EditProfile";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";
import { detectLanguagesFromFiles, getLanguageColor } from "../utils/languageDetection";
import { formatDateToCAT } from "../utils/timezone";

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
        const projectsResult = await ApiService.getUserProjects();
        if (projectsResult.success) {
          // Show only the 3 most recent projects on profile page
          setUserProjects(projectsResult.data.slice(0, 3));
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
              {user?.profile?.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-0 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-0 flex items-center justify-center bg-gray-700">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="currentColor" 
                    className="w-16 h-16 text-gray-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
              )}
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
              {user?.createdAt && (
                <div className="mt-4 text-left w-full">
                  <h2 className="font-semibold text-lg">Joined:</h2>
                  <p className="text-gray-300 text-sm mt-2">
                    {formatDateToCAT(user.createdAt)}
                  </p>
                </div>
              )}
              <button className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded w-full flex items-center justify-center space-x-2" onClick={() => setEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>
                <span>Edit Profile</span>
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
                View My Projects
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
                                  +{languages.length - 3} more
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">
                          {formatDateToCAT(project.createdAt)}
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
