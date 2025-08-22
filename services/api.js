import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken'); // Login sonrası kaydedeceğin key
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.headers?.['Content-Type']) {
    config.headers = config.headers ?? {};
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Global response interceptor (hata yakalama)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // token yok/eksik
      console.log('🔐 401: Token yok veya eksik');
    }
    if (status === 403) {
      // geçersiz/expired token, yetki/sahiplik sorunu
      console.log('🚫 403: Token geçersiz veya yetki sorunu');
    }
    return Promise.reject(err);
  }
);
