import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ApiService from '../services/ApiService';

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Redirect if not admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'stats':
          const statsResult = await ApiService.adminGetStats();
          if (statsResult.success) {
            setStats(statsResult.data);
          }
          break;
        case 'projects':
          const projectsResult = await ApiService.adminGetAllProjects();
          if (projectsResult.success) {
            setProjects(projectsResult.data);
          }
          break;
        case 'users':
          const usersResult = await ApiService.adminGetAllUsers();
          if (usersResult.success) {
            setUsers(usersResult.data);
          }
          break;
        case 'checkins':
          const checkinsResult = await ApiService.adminGetAllCheckins();
          if (checkinsResult.success) {
            setCheckins(checkinsResult.data);
          }
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      let result;
      switch (type) {
        case 'project':
          result = await ApiService.adminDeleteProject(id);
          break;
        case 'user':
          result = await ApiService.adminDeleteUser(id);
          break;
        case 'checkin':
          result = await ApiService.adminDeleteCheckin(id);
          break;
      }

      if (result.success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        loadData();
      } else {
        alert(`Failed to delete ${type}: ${result.error}`);
      }
    } catch (err) {
      alert(`Error deleting ${type}: ${err.message}`);
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem({ type, id: item._id });
    
    switch (type) {
      case 'project':
        setEditForm({
          name: item.name,
          description: item.description,
          visibility: item.visibility,
          license: item.license
        });
        break;
      case 'user':
        setEditForm({
          username: item.username,
          email: item.email,
          name: item.profile?.name || '',
          bio: item.profile?.bio || '',
          isAdmin: item.isAdmin || false
        });
        break;
      case 'checkin':
        setEditForm({
          message: item.message
        });
        break;
    }
  };

  const handleSaveEdit = async () => {
    try {
      let result;
      const { type, id } = editingItem;

      switch (type) {
        case 'project':
          result = await ApiService.adminEditProject(id, editForm);
          break;
        case 'user':
          const userData = {
            username: editForm.username,
            email: editForm.email,
            profile: {
              name: editForm.name,
              bio: editForm.bio
            },
            isAdmin: editForm.isAdmin
          };
          result = await ApiService.adminEditUser(id, userData);
          break;
        case 'checkin':
          result = await ApiService.adminEditCheckin(id, editForm);
          break;
      }

      if (result.success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
        setEditingItem(null);
        setEditForm({});
        loadData();
      } else {
        alert(`Failed to update ${type}: ${result.error}`);
      }
    } catch (err) {
      alert(`Error updating: ${err.message}`);
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.statistics.totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Projects</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.statistics.totalProjects}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Check-ins</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.statistics.totalCheckins}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium">Admin Users</h3>
            <p className="text-3xl font-bold text-orange-400">{stats.statistics.adminUsers}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Recent Users</h3>
            <div className="space-y-3">
              {stats.recentUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <div>
                    <p className="font-medium text-gray-200">{user.profile?.name || user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">Recent Projects</h3>
            <div className="space-y-3">
              {stats.recentProjects.map(project => (
                <div key={project._id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <div>
                    <p className="font-medium text-gray-200">{project.name}</p>
                    <p className="text-sm text-gray-400">
                      by {project.owner?.profile?.name || project.owner?.username}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Project Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Visibility
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {projects.map(project => (
            <tr key={project._id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-orange-400">{project.name}</div>
                <div className="text-sm text-gray-400">{project.description?.substring(0, 50)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {project.owner?.profile?.name || project.owner?.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  project.visibility === 'public' ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                }`}>
                  {project.visibility}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit('project', project)}
                  className="text-orange-400 hover:text-orange-300 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete('project', project._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {users.map(u => (
            <tr key={u._id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">
                      {(u.profile?.name || u.username).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-200">{u.profile?.name || u.username}</div>
                    <div className="text-sm text-gray-400">@{u.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {u.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  u.isAdmin ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                }`}>
                  {u.isAdmin ? 'Admin' : 'User'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit('user', u)}
                  className="text-orange-400 hover:text-orange-300 mr-4"
                >
                  Edit
                </button>
                {u._id !== user?.id && (
                  <button
                    onClick={() => handleDelete('user', u._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCheckins = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Project
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {checkins.map(checkin => (
            <tr key={checkin._id} className="hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {checkin.user?.profile?.name || checkin.user?.username}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">
                {checkin.project?.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-300">
                {checkin.message?.substring(0, 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {new Date(checkin.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit('checkin', checkin)}
                  className="text-orange-400 hover:text-orange-300 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete('checkin', checkin._id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEditModal = () => {
    if (!editingItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-orange-400">
            Edit {editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)}
          </h2>

          {editingItem.type === 'project' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Visibility</label>
                <select
                  value={editForm.visibility || 'public'}
                  onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          )}

          {editingItem.type === 'user' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Username</label>
                <input
                  type="text"
                  value={editForm.username || ''}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isAdmin || false}
                    onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                    className="mr-2 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-300">Admin User</span>
                </label>
              </div>
            </div>
          )}

          {editingItem.type === 'checkin' && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Message</label>
              <textarea
                value={editForm.message || ''}
                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm border p-2"
                rows="4"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => {
                setEditingItem(null);
                setEditForm({});
              }}
              className="px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
        <Header />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <h1 className="text-2xl font-bold text-red-400">Access Denied</h1>
          <p className="text-gray-300">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-orange-900 text-white flex flex-col">
      <Header />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-orange-400 tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-300">
            Manage all projects, users, and content across the platform
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['stats', 'projects', 'users', 'checkins'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4 text-red-200">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'stats' && renderStats()}
            {activeTab === 'projects' && renderProjects()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'checkins' && renderCheckins()}
          </>
        )}

        {/* Edit Modal */}
        {renderEditModal()}
      </div>
    </div>
  );
}

export default AdminPage;
