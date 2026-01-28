import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Document APIs
export const documentApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// Risk Analysis APIs
export const riskApi = {
  analyze: (documentId: string) => api.post(`/risk/analyze/${documentId}`),
  getAnalysis: (documentId: string) => api.get(`/risk/${documentId}`),
};

// Layman Explanation APIs
export const laymanApi = {
  generate: (documentId: string) => api.post(`/layman/summarize/${documentId}`),
  getSummary: (documentId: string) => api.get(`/layman/${documentId}`),
};

// Chatbot APIs
export const chatbotApi = {
  index: (documentId: string) => api.post(`/chatbot/index/${documentId}`),
  ask: (documentId: string, question: string) =>
    api.post(`/chatbot/ask/${documentId}?question=${encodeURIComponent(question)}`),
};
