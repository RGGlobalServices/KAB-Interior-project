import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  uploadFile: (id, formData) => {
    return api.post(`/projects/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Annotations API
export const annotationsAPI = {
  getByProject: (projectId) => api.get(`/annotations/project/${projectId}`),
  getByFile: (fileId) => api.get(`/annotations/file/${fileId}`),
  create: (annotationData) => api.post('/annotations', annotationData),
  update: (id, annotationData) => api.put(`/annotations/${id}`, annotationData),
  delete: (id) => api.delete(`/annotations/${id}`),
};

// Q&A API
export const qaAPI = {
  getByProject: (projectId) => api.get(`/qa/project/${projectId}`),
  create: (questionData) => api.post('/qa', questionData),
  answer: (id, answerData) => api.put(`/qa/${id}/answer`, answerData),
  delete: (id) => api.delete(`/qa/${id}`),
};

// Discussions API
export const discussionsAPI = {
  getByProject: (projectId) => api.get(`/discussions/project/${projectId}`),
  create: (messageData) => api.post('/discussions', messageData),
  delete: (id) => api.delete(`/discussions/${id}`),
};

export default api;

