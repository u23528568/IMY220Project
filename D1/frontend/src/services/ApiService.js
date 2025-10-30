// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  static BASE_URL = API_BASE_URL;
  // Helper method to make API calls
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    // Build headers, but don't force Content-Type when sending FormData
    const providedHeaders = options.headers || {};
    const headers = { ...providedHeaders };

    // If body is NOT FormData, ensure JSON content-type (unless provided)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // Add auth token if available (use the canonical 'authToken' key)
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = headers.Authorization || `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      console.log('Frontend: Response status:', response.status, response.statusText);

      // Only attempt to parse JSON when response has a JSON content-type
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('Frontend: Response data:', data);
        } catch (err) {
          console.warn('Frontend: Failed to parse JSON response', err);
        }
      }

      if (response.ok) {
        if (data && Object.prototype.hasOwnProperty.call(data, 'success')) {
          return data;
        }
        return { success: true, data };
      } else {
        const errorMsg = data && data.error ? data.error : 'An error occurred';
        console.log('Frontend: Request failed with status:', response.status, errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('Frontend: Network error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }

  // Authentication methods
  static async signup(userData) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async login(credentials) {
    // Clear any existing authentication state first
    this.logout();
    
    console.log('Frontend: Making login request with:', credentials);
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('Frontend: Received login response:', result);

    // Store token if login successful
    if (result.success && result.data && result.data.token) {
      console.log('Frontend: Login successful, storing token');
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
    } else {
      console.log('Frontend: Login failed or no token received');
    }

    return result;
  }

  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    // Clear any session storage as well
    sessionStorage.clear();
    // Clear any cached user data
    delete this._cachedUser;
  }

  // User methods
  static async getProfile() {
    return this.makeRequest('/users/profile');
  }

  static async updateProfile(profileData) {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  static async deleteProfile() {
    return this.makeRequest('/users/profile', {
      method: 'DELETE',
    });
  }

  static async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('authToken');
    
    console.log('Upload attempt:', {
      url: `${this.BASE_URL}/users/profile/upload-avatar`,
      hasToken: !!token,
      fileSize: file.size,
      fileType: file.type
    });
    
    try {
      const response = await fetch(`${this.BASE_URL}/users/profile/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);
      
      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Network error during upload' };
    }
  }

  static async getAllUsers() {
    return this.makeRequest('/users/');
  }

  static async searchUsers(query) {
    return this.makeRequest(`/users/search?q=${encodeURIComponent(query)}`);
  }

  static async sendFriendRequest(userId) {
    return this.makeRequest(`/users/friend-request/${userId}`, {
      method: 'POST',
    });
  }

  // Project methods
  static async createProject(projectData) {
    return this.makeRequest('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  static async getAllProjects() {
    return this.makeRequest('/projects/');
  }

  static async getUserProjects() {
    // Get only projects where the user is the owner
    return this.makeRequest('/projects/my-projects');
  }

  static async createProject(projectData) {
    return this.makeRequest('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  static async getProject(projectId) {
    return this.makeRequest(`/projects/${projectId}`);
  }

  static async updateProject(projectId, updateData) {
    return this.makeRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  static async downloadProject(projectId) {
    return this.makeRequest(`/projects/${projectId}/download`);
  }

  static async searchProjects(query) {
    return this.makeRequest(`/projects/search?q=${encodeURIComponent(query)}`);
  }

  static async searchCheckins(query) {
    return this.makeRequest(`/checkins/search?q=${encodeURIComponent(query)}`);
  }

  // Activity feed methods
  static async getLocalActivityFeed() {
    return this.makeRequest('/activity/local');
  }

  static async getGlobalActivityFeed() {
    return this.makeRequest('/activity/global');
  }

  static async getFriendsProjects() {
    return this.makeRequest('/projects/friends');
  }

  // Favorites methods
  static async getUserFavorites() {
    return this.makeRequest('/users/favorites');
  }

  static async addToFavorites(projectId) {
    return this.makeRequest(`/users/favorites/${projectId}`, {
      method: 'POST',
    });
  }

  static async removeFromFavorites(projectId) {
    return this.makeRequest(`/users/favorites/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Checkin methods
  static async checkIntoProject(projectId) {
    return this.makeRequest(`/checkins/${projectId}/check-in`, {
      method: 'POST',
    });
  }

  static async checkOutOfProject(projectId, message, files = null) {
    const formData = new FormData();
    formData.append('message', message);
    
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    // Let makeRequest attach the auth header and avoid forcing Content-Type for FormData
    return this.makeRequest(`/checkins/${projectId}/check-out`, {
      method: 'POST',
      body: formData,
    });
  }

  static async createCheckin(projectId, checkinData) {
    return this.makeRequest(`/checkins/${projectId}/checkin`, {
      method: 'POST',
      body: JSON.stringify(checkinData),
    });
  }

  static async getProjectCheckins(projectId) {
    return this.makeRequest(`/checkins/project/${projectId}`);
  }

  // File management methods
  static async uploadFile(projectId, file, path = '/') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    const token = localStorage.getItem('authToken');
    const config = {
      method: 'POST',
      body: formData,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.BASE_URL}/projects/${projectId}/files`, config);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Upload failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error during upload' };
    }
  }

  static async createFile(projectId, name, content = '', path = '/') {
    return this.makeRequest(`/projects/${projectId}/files`, {
      method: 'POST',
      body: JSON.stringify({ name, content, path }),
    });
  }

  static async createFolder(projectId, name, path = '/') {
    return this.makeRequest(`/projects/${projectId}/folders`, {
      method: 'POST',
      body: JSON.stringify({ name, path }),
    });
  }

  static async updateFile(projectId, fileId, updates) {
    return this.makeRequest(`/projects/${projectId}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteFile(projectId, fileId) {
    return this.makeRequest(`/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  static async getFileContent(projectId, fileId) {
    return this.makeRequest(`/projects/${projectId}/files/${fileId}`);
  }

  // Helper methods
  static isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  static getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  // Friends methods
  static async getUserProfile(identifier) {
    return this.makeRequest(`/friends/profile/${identifier}`);
  }

  static async sendFriendRequest(userId) {
    return this.makeRequest(`/friends/request/${userId}`, {
      method: 'POST'
    });
  }

  static async handleFriendRequest(requestId, action) {
    return this.makeRequest(`/friends/request/${requestId}/${action}`, {
      method: 'POST'
    });
  }

  static async getFriendRequests() {
    return this.makeRequest('/friends/requests');
  }

  static async getFriendsList() {
    return this.makeRequest('/friends/list');
  }

  static async getFriends() {
    return this.makeRequest('/friends/list');
  }

  static async getUserFriends(userId) {
    // If a userId is provided, request that user's friends list from the backend.
    // Fallback to the current user's friends list when no userId passed.
    if (userId) {
      return this.makeRequest(`/friends/list/${userId}`);
    }
    return this.makeRequest('/friends/list');
  }

  static async getFavorites() {
    return this.makeRequest('/users/favorites');
  }

  static async removeFriend(friendId) {
    return this.makeRequest(`/friends/${friendId}`, {
      method: 'DELETE'
    });
  }



  // Project collaboration methods
  static async inviteCollaborator(projectId, userId, role = 'collaborator') {
    return this.makeRequest(`/projects/${projectId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ userId, role })
    });
  }

  static async removeCollaborator(projectId, memberId) {
    return this.makeRequest(`/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE'
    });
  }



  static getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Admin methods
  static async adminGetAllProjects() {
    return this.makeRequest('/admin/projects');
  }

  static async adminEditProject(projectId, updateData) {
    return this.makeRequest(`/admin/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async adminDeleteProject(projectId) {
    return this.makeRequest(`/admin/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  static async adminGetAllUsers() {
    return this.makeRequest('/admin/users');
  }

  static async adminEditUser(userId, updateData) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async adminDeleteUser(userId) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  static async adminGetAllCheckins() {
    return this.makeRequest('/admin/checkins');
  }

  static async adminEditCheckin(checkinId, updateData) {
    return this.makeRequest(`/admin/checkins/${checkinId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async adminDeleteCheckin(checkinId) {
    return this.makeRequest(`/admin/checkins/${checkinId}`, {
      method: 'DELETE'
    });
  }

  static async adminGetStats() {
    return this.makeRequest('/admin/stats');
  }

  static async adminEditProjectFile(projectId, fileId, updateData) {
    return this.makeRequest(`/admin/projects/${projectId}/files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  static async adminDeleteProjectFile(projectId, fileId) {
    return this.makeRequest(`/admin/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // Comment/Discussion methods
  static async getProjectComments(projectId) {
    return this.makeRequest(`/comments/${projectId}`);
  }

  static async createComment(projectId, content, parentId = null) {
    return this.makeRequest(`/comments/${projectId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parent: parentId })
    });
  }

  static async updateComment(commentId, content) {
    return this.makeRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
  }

  static async deleteComment(commentId) {
    return this.makeRequest(`/comments/${commentId}`, {
      method: 'DELETE'
    });
  }
}

export default ApiService;