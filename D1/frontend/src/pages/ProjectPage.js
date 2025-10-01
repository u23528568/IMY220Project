import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function ProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ApiService.getAllProjects();
        if (result.success) {
          setProjects(result.data);
        } else {
          setError("Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Error loading projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Projects</h1>
          <button 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => alert("Project creation form coming soon! Currently you can view and manage existing projects.")}
          >
            Create Project
          </button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded mb-1 w-3/4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded">
            {error}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project._id}
                className="bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/projectview", { state: { projectId: project._id } })}
              >
                <h3 className="text-xl font-bold mb-2 text-orange-400">{project.name}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  {project.description || "No description available"}
                </p>
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">
                    Owner: {project.owner?.profile?.name || project.owner?.username || "Unknown"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  {project.type && (
                    <p className="text-orange-300 text-xs">Type: {project.type}</p>
                  )}
                  {project.hashtags && (
                    <p className="text-orange-300 text-xs">{project.hashtags}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No projects found</p>
            <p className="text-gray-500 text-sm mb-6">
              Be the first to create a project!
            </p>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => alert("Project creation form coming soon! You can test the existing functionality with sample projects.")}
            >
              Create First Project
            </button>
          </div>
        )}

        {/* Quick create button */}
        <button 
          className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-full shadow-lg transition-colors"
          onClick={() => alert("Project creation form coming soon!")}
          title="Create New Project"
        >
          +
        </button>
      </main>
    </div>
  );
}
