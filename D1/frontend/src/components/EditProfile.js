import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/ApiService";

export default function EditProfile({ onSave }) {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-2 text-orange-400">Edit Profile</h2>
      
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-2">
        <img
          src={user?.profile?.avatar || "/assets/images/1000_F_500213410_oXAyKG24tasVFjl4OgCLkYkglvypBMlq.jpg"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover"
        />
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
    </form>
  );
}
