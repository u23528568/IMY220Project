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
      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'An error occurred' };
      }
    } catch (error) {
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
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token if login successful
    if (result.success && result.data.token) {
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
    }

    return result;
  }

  static logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
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

  // Checkin methods
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

  static getAuthToken() {
    return localStorage.getItem('authToken');
  }
}

export default ApiService;