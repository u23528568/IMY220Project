import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function EditProfile({ onSave }) {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setError('');

      const result = await ApiService.uploadAvatar(file);
      if (result.success) {
        // Update user context with new avatar
        updateUser({
          ...user,
          profile: {
            ...user.profile,
            avatar: result.data.avatar
          }
        });
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await ApiService.updateProfile({
        name: formData.name,
        bio: formData.bio
      });

      if (result.success) {
        // Update user context
        updateUser({
          ...user,
          profile: {
            ...user.profile,
            name: formData.name,
            bio: formData.bio
          }
        });
        
        if (onSave) onSave();
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      setError('');

      const result = await ApiService.deleteProfile();
      if (result.success) {
        // Log out and redirect to splash page
        logout();
        navigate('/');
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (error) {
      setError('Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-2 text-orange-400">Edit Profile</h2>
      
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-2">
        {user?.profile?.avatar ? (
          <img
            src={user.profile.avatar}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center bg-gray-700">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor" 
              className="w-12 h-12 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
        >
          {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
        </button>
      </div>

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Full Name"
        className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
        required
      />
      
      <textarea
        name="bio"
        value={formData.bio}
        onChange={handleInputChange}
        placeholder="About you..."
        className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-orange-500 focus:outline-none"
        rows={4}
      />
      
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold py-2 px-4 rounded flex-1"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
      
      {/* Delete Account Section */}
      <div className="mt-8 pt-6 border-t border-gray-600">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-gray-400 text-sm mb-4">
          Once you delete your account, there is no going back. This will permanently delete your profile, projects, and all associated data.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          Delete Account
        </button>
      </div>
    </form>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-red-400 mb-4">Delete Account</h2>
          <p className="text-white mb-4">
            Are you absolutely sure you want to delete your account?
          </p>
          <p className="text-gray-400 text-sm mb-6">
            This action cannot be undone. This will permanently delete:
          </p>
          <ul className="text-gray-400 text-sm mb-6 list-disc ml-6">
            <li>Your profile and personal information</li>
            <li>All your projects and files</li>
            <li>Your friend connections</li>
            <li>All activity and checkin history</li>
          </ul>
          <div className="flex space-x-4">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 px-4 rounded flex-1"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white font-semibold py-2 px-4 rounded flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
