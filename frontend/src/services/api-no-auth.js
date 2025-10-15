import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance for no-auth API
const apiNoAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
apiNoAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// No-Auth Projects API
export const projectsNoAuthAPI = {
  getAll: () => apiNoAuth.get('/projects-no-auth'),
  getById: (id) => apiNoAuth.get(`/projects-no-auth/${id}`),
  create: (projectData) => apiNoAuth.post('/projects-no-auth', projectData),
  delete: (id) => apiNoAuth.delete(`/projects-no-auth/${id}`),
  uploadFile: (id, formData) => {
    return apiNoAuth.post(`/projects-no-auth/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  healthCheck: () => apiNoAuth.get('/projects-no-auth/health'),
};

export default apiNoAuth;
