import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://fitlift-crm.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.response?.data?.message || error.message;
    return Promise.reject(new Error(msg || 'An error occurred'));
  }
);

// ── Lead APIs ──────────────────────────────────────────────────────────────

export const leadsApi = {
  getAll: () => api.get('/leads').then((r) => r.data),

  getById: (id) => api.get(`/leads/${id}`).then((r) => r.data),

  create: (data) => api.post('/leads', data).then((r) => r.data),

  update: (id, data) => api.put(`/leads/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
  api.patch(`/leads/${id}/status`, { status }).then((r) => r.data),

  markWaSent: (id) =>
  api.post(`/leads/${id}/wa-sent`).then((r) => r.data),

  // analyze: (id) => api.post(`/leads/${id}/analyze`).then((r) => r.data),

  // generateReply: (id) => api.post(`/leads/${id}/reply`).then((r) => r.data),

  // rescore: (id) => api.post(`/leads/${id}/rescore`).then((r) => r.data),

  delete: (id) => api.delete(`/leads/${id}`).then((r) => r.data),

  getStats: () => api.get('/leads/stats').then((r) => r.data),
};

export default api;
