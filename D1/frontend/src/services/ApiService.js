// API service for backend communication
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  static BASE_URL = API_BASE_URL;
  // Helper method to make API calls
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      console.log('Frontend: Response status:', response.status, response.statusText);
      const data = await response.json();
      console.log('Frontend: Response data:', data);

      if (response.ok) {
        // If the response already has success/data structure, return it as-is
        if (data.hasOwnProperty('success')) {
          console.log('Frontend: Returning data with success property');
          return data;
        }
        // Otherwise, wrap it in the expected structure
        console.log('Frontend: Wrapping data in success structure');
        return { success: true, data };
      } else {
        console.log('Frontend: Request failed with status:', response.status);
        return { success: false, error: data.error || 'An error occurred' };
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

    return this.makeRequest(`/checkins/${projectId}/check-out`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it for FormData
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
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
}

export default ApiService;