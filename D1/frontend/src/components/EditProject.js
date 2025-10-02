import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function EditProject({ project, onSave, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    license: 'none'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        visibility: project.visibility || 'public',
        license: project.license || 'none'
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ApiService.updateProject(project._id, formData);
      
      if (result.success) {
        if (onSave) {
          onSave(result.data);
        }
      } else {
        setError(result.error || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError('An error occurred while updating the project');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can edit this project
  const canEdit = project?.owner?._id === user?.id;

  if (!canEdit) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-8 text-gray-400">
          <p className="mb-2">🔒 Access Denied</p>
          <p className="text-sm">You don't have permission to edit this project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Edit Project</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Enter project name"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Describe your project..."
            disabled={loading}
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
                id="edit-public"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={handleInputChange}
                className="text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                disabled={loading}
              />
              <label htmlFor="edit-public" className="ml-2 text-white">
                <span className="font-medium">Public</span>
                <span className="block text-xs text-gray-400">Anyone can see this project</span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="edit-private"
                name="visibility"
                value="private"
                checked={formData.visibility === 'private'}
                onChange={handleInputChange}
                className="text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500"
                disabled={loading}
              />
              <label htmlFor="edit-private" className="ml-2 text-white">
                <span className="font-medium">Private</span>
                <span className="block text-xs text-gray-400">Only you and collaborators can see this project</span>
              </label>
            </div>
          </div>
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
            disabled={loading}
          >
            <option value="none">No License</option>
            <option value="mit">MIT License</option>
            <option value="apache">Apache License 2.0</option>
            <option value="gpl">GNU General Public License v3.0</option>
            <option value="bsd">BSD 3-Clause License</option>
          </select>
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
            onClick={onCancel}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
