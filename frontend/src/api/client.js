import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for ML model inference
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const evaluateChange = (changeData) => {
  return apiClient.post('/evaluate-change', changeData);
};

export const getPrediction = (id) => {
  return apiClient.get(`/predictions/${id}`);
};

export const getHistory = (params = {}) => {
  return apiClient.get('/changes/history', { params });
};

export const updateChangeStatus = (id, status, comment) => {
  return apiClient.patch(`/changes/${id}/status`, { status, comment });
};

export const uploadEvidence = (id, formData) => {
  return apiClient.post(`/changes/${id}/evidence`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default apiClient;
