import axios from 'axios';
import { API_BASE_URL, API_PREFIX } from '../config/api';

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Log semua outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔵 LOG REQUEST
    console.group(`🔵 API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log('📍 Full URL:', `${config.baseURL}${config.url}`);
    console.log('🔑 Headers:', config.headers);
    if (config.params) {
      console.log('🔍 Params:', config.params);
    }
    if (config.data) {
      console.log('📦 Body:', config.data);
    }
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();

    return config;
  },
  (error) => {
    // 🔴 LOG REQUEST ERROR
    console.error('🔴 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Log semua incoming responses
axiosInstance.interceptors.response.use(
  (response) => {
    // 🟢 LOG RESPONSE SUCCESS
    console.group(`🟢 API Response: ${response.config.method.toUpperCase()} ${response.config.url}`);
    console.log('✅ Status:', response.status, response.statusText);
    console.log('📥 Data:', response.data);
    console.log('⏱️ Duration:', response.config.metadata?.duration || 'N/A');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.groupEnd();

    return response;
  },
  (error) => {
    // 🔴 LOG RESPONSE ERROR
    if (error.response) {
      console.group(`🔴 API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.log('❌ Status:', error.response.status, error.response.statusText);
      console.log('📍 URL:', `${error.config?.baseURL}${error.config?.url}`);
      console.log('💬 Message:', error.message);
      console.log('📥 Error Data:', error.response.data);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.groupEnd();
    } else if (error.request) {
      console.group('🔴 API Network Error');
      console.log('❌ No response received');
      console.log('📍 URL:', error.config?.url);
      console.log('💬 Message:', error.message);
      console.log('⏰ Timestamp:', new Date().toISOString());
      console.groupEnd();
    } else {
      console.error('🔴 API Setup Error:', error.message);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - Redirecting to login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
