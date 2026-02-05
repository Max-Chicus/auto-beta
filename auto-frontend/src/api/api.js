import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('API_BASE_URL:', import.meta.env.VITE_API_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor pentru token admin
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

// Interceptor pentru response-uri
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('❌ Eroare de rețea');
      return Promise.reject({
        message: 'Serverul nu răspunde',
        isNetworkError: true
      });
    }

    const { status } = error.response;

    if (status === 401 && window.location.pathname.includes('/admin')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminLoggedIn');
      window.location.href = '/admin/login';
    }

    return Promise.reject(error);
  }
);

// ========== FUNCȚII PENTRU IMAGINI ==========
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Fișierul nu este o imagine'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Imaginea este prea mare (max 5MB)'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

export const processImagesForForm = async (files) => {
  const base64Images = [];

  for (const file of files) {
    try {
      const base64 = await convertFileToBase64(file);
      base64Images.push(base64);
    } catch (error) {
      console.warn(`⚠️ Imagine ignorată: ${error.message}`);
    }
  }

  return base64Images;
};

// ========== FUNCȚII PENTRU TIPURI SERVICII ==========
export const createServiceTypeInline = async (typeData) => {
  return API.post('/admin/service-types', typeData);
};

// ========== FUNCȚII PRINCIPALE ==========
export const getFilters = async () => {
  return API.get('/filters');
};

export const getServices = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  return API.get(`/services?${params.toString()}`);
};

export const getServiceById = async (id) => {
  return API.get(`/services/${id}`);
};

export const createService = async (serviceData) => {
  return API.post('/admin/services', serviceData);
};

export const updateService = async (id, serviceData) => {
  return API.put(`/admin/services/${id}`, serviceData);
};

export const deleteService = async (id) => {
  return API.delete(`/admin/services/${id}`);
};

export const submitServiceRequest = async (requestData) => {
  return API.post('/service-requests', requestData);
};

export const getServiceRequests = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return API.get(`/admin/service-requests?${params.toString()}`);
};

export const updateRequestStatus = async (id, statusData) => {
  return API.patch(`/admin/service-requests/${id}/status`, statusData);
};

export const adminLogin = async (credentials) => {
  const response = await API.post('/admin/login', credentials);
  
  if (response.data && response.data.token) {
    localStorage.setItem('adminToken', response.data.token);
    localStorage.setItem('adminLoggedIn', 'true');
  }
  
  return response;
};

export const getAdminStats = async () => {
  return API.get('/admin/stats');
};

export const getBrands = async () => {
  return API.get('/admin/brands');
};

export const createBrand = async (brandData) => {
  return API.post('/admin/brands', brandData);
};

export const getServiceTypes = async () => {
  return API.get('/admin/service-types');
};

export const getPublicStats = async () => {
  return API.get('/public/stats');
};

export const findServicesForVehicle = async (vehicleData) => {
  return API.get('/services/for-vehicle', { params: vehicleData });
};

// Export principal
export default API;
export { API_BASE_URL };