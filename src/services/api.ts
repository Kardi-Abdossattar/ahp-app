import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const projectAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  create: async (data: { title: string; description?: string; goal: string }) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<{ title: string; description?: string; goal: string }>) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
  
  addCriterion: async (projectId: string, data: { name: string; description?: string; parentId?: string }) => {
    const response = await api.post(`/projects/${projectId}/criteria`, data);
    return response.data;
  },
  
  addAlternative: async (projectId: string, data: { name: string; description?: string }) => {
    const response = await api.post(`/projects/${projectId}/alternatives`, data);
    return response.data;
  },
  
  reorderItems: async (projectId: string, items: { id: string; order: number }[], type: 'criteria' | 'alternatives') => {
    const response = await api.put(`/projects/${projectId}/reorder`, { items, type });
    return response.data;
  },
};

export const ahpAPI = {
  saveComparison: async (data: {
    projectId: string;
    type: 'criteria' | 'alternatives';
    itemAId: string;
    itemBId: string;
    value: number;
    contextId?: string;
  }) => {
    const response = await api.post('/ahp/comparisons', data);
    return response.data;
  },
  
  getComparisons: async (projectId: string) => {
    const response = await api.get(`/ahp/comparisons/${projectId}`);
    return response.data;
  },
  
  calculateResults: async (projectId: string) => {
    const response = await api.post(`/ahp/calculate/${projectId}`);
    return response.data;
  },
  
  getResults: async (projectId: string) => {
    const response = await api.get(`/ahp/results/${projectId}`);
    return response.data;
  },
  
  performSensitivityAnalysis: async (projectId: string, criterionId: string, newWeight: number) => {
    const response = await api.post(`/ahp/sensitivity/${projectId}`, { criterionId, newWeight });
    return response.data;
  },
};

export const reportAPI = {
  generatePDF: async (projectId: string) => {
    const response = await api.get(`/reports/pdf/${projectId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;