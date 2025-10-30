import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/ApiService";
import { detectLanguagesFromFiles, getLanguageColor } from "../utils/languageDetection";
import { formatDateToCAT } from "../utils/timezone";

export default function UserProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, type
  const projectsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await ApiService.getUserProjects();
        if (result.success) {
          setProjects(result.data);
        } else {
          setError(result.error || 'Failed to load projects');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Error loading projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Sort projects
  const sortedProjects = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 text-red-200 p-4 rounded">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400 mb-4">You haven't created any projects yet.</p>
        <button
          onClick={() => navigate("/project")}
          className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded text-white"
        >
          Create Your First Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="text-gray-400 text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name (A-Z)</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentProjects.map((project) => (
          <div
            key={project._id}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors border border-gray-700 hover:border-orange-500"
            onClick={() => navigate("/projectview", { state: { projectId: project._id } })}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-orange-400 text-lg truncate flex-1">
                {project.name}
              </h3>
              {project.type && (
                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 ml-2">
                  {project.type}
                </span>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
              {project.description || "No description available"}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
              <span>{formatDateToCAT(project.createdAt)}</span>
              <span>{project.files?.length || 0} files</span>
            </div>

            {(() => {
              const languages = detectLanguagesFromFiles(project.files || []);
              return languages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {languages.slice(0, 3).map((language, index) => (
                    <span 
                      key={index} 
                      className={`inline-block ${getLanguageColor(language)} text-white text-xs px-2 py-1 rounded-full font-medium`}
                    >
                      {language}
                    </span>
                  ))}
                  {languages.length > 3 && (
                    <span className="text-gray-400 text-xs self-center">
                      +{languages.length - 3} more
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            // Show first page, last page, current page, and pages around current
            const shouldShow = 
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
            
            if (!shouldShow) {
              // Show ellipsis
              if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                return <span key={pageNumber} className="text-gray-500">...</span>;
              }
              return null;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNumber
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
