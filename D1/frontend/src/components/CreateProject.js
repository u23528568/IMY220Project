import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/ApiService';

export default function CreateProject({ onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    initializeWithReadme: true,
    template: 'blank',
    license: 'none',
    hashtags: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Project name is required');
      return false;
    }
    
    if (formData.name.length < 3) {
      setError('Project name must be at least 3 characters');
      return false;
    }

    if (formData.name.length > 50) {
      setError('Project name must be less than 50 characters');
      return false;
    }

    // Check for valid project name (alphanumeric, spaces, hyphens, underscores, dots)
    if (!/^[a-zA-Z0-9\s._-]+$/.test(formData.name)) {
      setError('Project name can only contain letters, numbers, spaces, hyphens, underscores, and dots');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const projectData = {
        ...formData,
        hashtags: formData.hashtags 
          ? formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [],
        owner: user.id
      };

      const result = await ApiService.createProject(projectData);
      
      if (result.success) {
        // Navigate to the new project view
        navigate(`/projectview`, { 
          state: { 
            projectId: result.data._id,
            isNewProject: true 
          } 
        });
        
        if (onClose) {
          onClose();
        }
      } else {
        setError(result.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project');
    } finally {
      setLoading(false);
    }
  };

  const templates = [
    { value: 'blank', label: 'Blank Project', description: 'Start with an empty project' },
    { value: 'web', label: 'Web Application', description: 'HTML, CSS, JavaScript starter' },
    { value: 'react', label: 'React App', description: 'React application structure' },
    { value: 'node', label: 'Node.js Project', description: 'Node.js backend structure' },
    { value: 'python', label: 'Python Project', description: 'Python project with requirements.txt' },
    { value: 'java', label: 'Java Project', description: 'Java project with Maven structure' }
  ];

  const licenses = [
    { value: 'none', label: 'No License' },
    { value: 'mit', label: 'MIT License' },
    { value: 'apache', label: 'Apache License 2.0' },
    { value: 'gpl', label: 'GNU General Public License v3.0' },
    { value: 'bsd', label: 'BSD 3-Clause License' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="my-awesome-project"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Must be unique, 3-50 characters, letters, numbers, spaces, hyphens, underscores, and dots allowed
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="A brief description of your project..."
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="public"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={handleInputChange}
                  className="text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <label htmlFor="public" className="ml-2 text-white">
                  <span className="font-medium">Public</span>
                  <span className="block text-xs text-gray-400">Anyone can see this project</span>
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="private"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={handleInputChange}
                  className="text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                />
                <label htmlFor="private" className="ml-2 text-white">
                  <span className="font-medium">Private</span>
                  <span className="block text-xs text-gray-400">Only you and collaborators can see this project</span>
                </label>
              </div>
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Template
            </label>
            <select
              name="template"
              value={formData.template}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label} - {template.description}
                </option>
              ))}
            </select>
          </div>

          {/* License */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              License
            </label>
            <select
              name="license"
              value={formData.license}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {licenses.map((license) => (
                <option key={license.value} value={license.value}>
                  {license.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="javascript, react, web-development (separate with commas)"
            />
            <p className="text-xs text-gray-400 mt-1">
              Add relevant tags to help others discover your project. Separate multiple tags with commas.
            </p>
          </div>

          {/* Initialize with README */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="initializeWithReadme"
              name="initializeWithReadme"
              checked={formData.initializeWithReadme}
              onChange={handleInputChange}
              className="text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
            />
            <label htmlFor="initializeWithReadme" className="ml-2 text-white">
              Initialize with README.md
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
