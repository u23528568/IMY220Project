import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import EditProject from "../components/EditProject";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function EditProjectPage() {
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
        
        const result = await ApiService.getProject(projectId);
        if (result.success) {
          const projectData = result.data;
          
          // Check if user is the owner or admin
          const isOwner = projectData.owner?._id === user?.id;
          const isAdmin = user?.isAdmin || false;
          
          if (!isOwner && !isAdmin) {
            setError("You don't have permission to edit this project");
            setLoading(false);
            return;
          }
          
          setProject(projectData);
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
  }, [projectId, user?.id]);

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
    // Navigate back to project view
    navigate("/projectview", { state: { projectId: updatedProject._id } });
  };

  const handleCancel = () => {
    navigate("/projectview", { state: { projectId: project?._id } });
  };

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
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="mb-4">{error || "You don't have permission to edit this project."}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-orange-400">Edit Project</h1>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Project
            </button>
          </div>
          
          <EditProject 
            project={project}
            onProjectUpdated={handleProjectUpdated}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  );
}