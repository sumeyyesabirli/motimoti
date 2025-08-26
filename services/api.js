import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 saniye timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
  (res) => {
    console.log('✅ API Response başarılı:', {
      url: res.config.url,
      method: res.config.method,
      status: res.status,
      dataLength: JSON.stringify(res.data).length
    });
    return res;
  },
  (err) => {
    console.error('❌ API Hatası detaylı:', {
      url: err.config?.url,
      method: err.config?.method,
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      responseData: err.response?.data,
      isNetworkError: err.message === 'Network Error',
      isTimeoutError: err.code === 'ECONNABORTED'
    });
    
    const status = err?.response?.status;
    if (status === 401) {
      console.log('🔐 401: Token yok veya eksik');
    }
    if (status === 403) {
      console.log('🚫 403: Token geçersiz veya yetki sorunu');
    }
    
    // Network Error özel işlemi
    if (err.message === 'Network Error') {
      console.error('🌐 NETWORK ERROR! Backend sunucusuna bağlanamıyor:');
      console.error('   📍 API URL:', err.config?.url);
      console.error('   🔧 Kontroller:');
      console.error('      - Backend sunucu çalışıyor mu?');
      console.error('      - CORS ayarları yapıldı mı?');
      console.error('      - Emülatör/device network erişimi var mı?');
    }
    
    return Promise.reject(err);
  }
);
