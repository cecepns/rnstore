import axios from 'axios';

export const BASE_URL = 'https://api-inventory.isavralabel.com/rnstore';
export const API_BASE_URL = 'https://api-inventory.isavralabel.com/rnstore/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const api = {
  // Categories
  categories: {
    getAll: () => apiClient.get('/categories'),
    create: (data) => apiClient.post('/categories', data),
    update: (id, data) => apiClient.put(`/categories/${id}`, data),
    delete: (id) => apiClient.delete(`/categories/${id}`),
  },
  
  // Products
  products: {
    getAll: () => apiClient.get('/products'),
    getById: (id) => apiClient.get(`/products/${id}`),
    create: (data) => apiClient.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => apiClient.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/products/${id}`),
  },
  
  // Orders/Checkout
  orders: {
    getAll: (params = {}) => {
      const { page = 1, limit = 10 } = params;
      return apiClient.get(`/orders`, { params: { page, limit } });
    },
    create: (data) => apiClient.post('/orders', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateStatus: (id, status) => apiClient.put(`/orders/${id}/status`, { status }),
    delete: (id) => apiClient.delete(`/orders/${id}`),
  },
  
  // Settings
  settings: {
    get: () => apiClient.get('/settings'),
    update: (data) => apiClient.put('/settings', data),
  },
  
  // Banners
  banners: {
    getPublic: () => apiClient.get('/banners'),
    getAll: () => apiClient.get('/banners/all'),
    create: (formData) => apiClient.post('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => apiClient.put(`/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/banners/${id}`),
  },
  
  // Auth
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    verify: () => apiClient.get('/auth/verify'),
  },
};

// Utility function to format price in Indonesian Rupiah format
export const formatIDR = (price) => {
  if (!price || price === 0) return '0';
  
  // Convert to string and remove decimal places if they exist
  const priceStr = Math.floor(price).toString();
  
  // Add dots as thousand separators from right to left
  return priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export default api;