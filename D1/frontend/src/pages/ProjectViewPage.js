import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function ProjectViewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get project ID from navigation state or URL params
  const projectId = location.state?.projectId || new URLSearchParams(location.search).get('id');

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setError("No project ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await ApiService.getProjectById(projectId);
        if (result.success) {
          setProject(result.data);
        } else {
          setError("Failed to load project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Error loading project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-900 border border-red-600 text-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
              <p className="mb-4">{error || "The requested project could not be found."}</p>
              <button 
                onClick={() => navigate("/project")}
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
              >
                View All Projects
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = project.owner?._id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />

      <main className="flex flex-1 container mx-auto p-6 gap-6">
        <aside className="w-80 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-orange-400">{project.name}</h1>
              <span className="bg-gray-600 text-xs px-2 py-1 rounded">
                {project.visibility || "Public"}
              </span>
            </div>
            <div className="flex space-x-2">
              {isOwner && (
                <button 
                  className="text-gray-400 hover:text-orange-400"
                  onClick={() => navigate("/edit-project", { state: { projectId: project._id } })}
                  title="Edit Project"
                >
                  ✏️
                </button>
              )}
              <button className="text-orange-400 hover:text-orange-300" title="Like Project">
                ♡
              </button>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mb-6">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>

          {project.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-gray-300 text-sm">{project.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Project Owner</h2>
            <div className="flex items-center space-x-2">
              <img
                src={project.owner?.profilePicture || "/assets/images/Logo.png"}
                alt="Owner"
                className="w-8 h-8 rounded-full border border-orange-500"
              />
              <div className="text-sm">
                <div className="font-medium">
                  {project.owner?.profile?.name || project.owner?.username || "Unknown"}
                </div>
                <div className="text-gray-400">@{project.owner?.username}</div>
              </div>
            </div>
          </div>

          {project.hashtags && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Tags</h2>
              <p className="text-orange-300 text-sm">{project.hashtags}</p>
            </div>
          )}

          {project.type && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Project Type</h2>
              <span className="bg-blue-600 text-xs px-2 py-1 rounded">{project.type}</span>
            </div>
          )}

          <div>
            <h2 className="font-semibold mb-2">Last Updated</h2>
            <div className="text-sm text-gray-400">
              <div>{new Date(project.updatedAt).toLocaleDateString()}</div>
              <div>{new Date(project.updatedAt).toLocaleTimeString()}</div>
            </div>
          </div>
        </aside>

        <section className="flex-1 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Project Details</h2>
            {isOwner && (
              <button 
                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm"
                onClick={() => navigate("/edit-project", { state: { projectId: project._id } })}
              >
                Edit Project
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {/* Project Information */}
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold mb-3">Project Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Name:</span>
                  <p className="font-medium">{project.name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="font-medium">{project.type || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Last Modified:</span>
                  <p className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* File Management Placeholder */}
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold mb-3">Files & Documents</h3>
              <div className="text-center py-8 text-gray-400">
                <p className="mb-4">📁 File management coming soon!</p>
                <p className="text-sm">
                  Upload, organize, and manage your project files directly in the browser.
                </p>
              </div>
            </div>

            {/* Collaboration Placeholder */}
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="font-semibold mb-3">Collaboration</h3>
              <div className="text-center py-8 text-gray-400">
                <p className="mb-4">👥 Team collaboration features coming soon!</p>
                <p className="text-sm">
                  Invite team members, assign roles, and collaborate in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
