import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const dashboard = { get: () => api.get('/dashboard') };

export const tanks = {
  getAll: () => api.get('/tanks'),
  getById: (id) => api.get(`/tanks/${id}`),
  create: (data) => api.post('/tanks', data),
  update: (id, data) => api.put(`/tanks/${id}`, data),
  delete: (id) => api.delete(`/tanks/${id}`),
};

export const fishSpecies = {
  getAll: () => api.get('/fish-species'),
  getById: (id) => api.get(`/fish-species/${id}`),
  create: (data) => api.post('/fish-species', data),
  update: (id, data) => api.put(`/fish-species/${id}`, data),
  delete: (id) => api.delete(`/fish-species/${id}`),
};

export const fishStock = {
  getAll: (params) => api.get('/fish-stock', { params }),
  getById: (id) => api.get(`/fish-stock/${id}`),
  create: (data) => api.post('/fish-stock', data),
  update: (id, data) => api.put(`/fish-stock/${id}`, data),
  delete: (id) => api.delete(`/fish-stock/${id}`),
};

export const healthRecords = {
  getAll: (params) => api.get('/health-records', { params }),
  getById: (id) => api.get(`/health-records/${id}`),
  create: (data) => api.post('/health-records', data),
  update: (id, data) => api.put(`/health-records/${id}`, data),
  delete: (id) => api.delete(`/health-records/${id}`),
};

export const feedingLogs = {
  getAll: (params) => api.get('/feeding-logs', { params }),
  getById: (id) => api.get(`/feeding-logs/${id}`),
  create: (data) => api.post('/feeding-logs', data),
  update: (id, data) => api.put(`/feeding-logs/${id}`, data),
  delete: (id) => api.delete(`/feeding-logs/${id}`),
};

export const waterQuality = {
  getAll: (params) => api.get('/water-quality', { params }),
  getLatest: () => api.get('/water-quality/latest'),
  getById: (id) => api.get(`/water-quality/${id}`),
  create: (data) => api.post('/water-quality', data),
  update: (id, data) => api.put(`/water-quality/${id}`, data),
  delete: (id) => api.delete(`/water-quality/${id}`),
};

export const inventory = {
  getAll: (params) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};

export const tasks = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const staff = {
  getAll: () => api.get('/staff'),
  getById: (id) => api.get(`/staff/${id}`),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

export const alerts = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  resolve: (id) => api.put(`/alerts/${id}/resolve`),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const seed = { run: () => api.post('/seed') };

export default api;
