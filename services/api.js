import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_CONFIG } from '../constants/apiConfig';

// Merkezi API instance oluştur
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(async (config) => {
  // Auth token'i al ve header'a ekle [[memory:6945949]]
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // İsteği konsola yazdır [[memory:6945955]]
  console.log('🚀 API İstek:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullUrl: `${config.baseURL}${config.url}`,
    hasAuth: !!token
  });
  
  return config;
});

// Response interceptor - cevap ve hata yönetimi
api.interceptors.response.use(
  (response) => {
    // Başarılı cevabı konsola yazdır [[memory:6945955]]
    console.log('✅ API Başarılı:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      dataSize: JSON.stringify(response.data).length + ' bytes'
    });
    return response;
  },
  async (error) => {
    // Hataları konsola yazdır [[memory:6945955]]
    console.error('❌ API Hatası:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      errorData: error.response?.data
    });
    
    // 401 hatası - token geçersiz, oturumu sonlandır
    if (error.response?.status === 401) {
      console.log('🔐 Token geçersiz, oturum sonlandırılıyor...');
      await AsyncStorage.removeItem('auth_token');
      // AuthContext logout fonksiyonu burada çağrılabilir
    }
    
    // Network hatası kontrolü
    if (error.message === 'Network Error') {
      console.error('🌐 Ağ bağlantı hatası! API sunucusuna erişilemiyor.');
      console.error('🔧 Kontrol edilecekler:');
      console.error('   - İnternet bağlantısı aktif mi?');
      console.error('   - API sunucusu çalışıyor mu?');
      console.error('   - Firewall/VPN engeli var mı?');
    }
    
    return Promise.reject(error);
  }
);

// API helper fonksiyonları
export const apiHelpers = {
  // Base URL'yi döndür
  getBaseUrl: () => API_BASE_URL,
  
  // Full URL oluştur
  buildUrl: (endpoint) => `${API_BASE_URL}${endpoint}`,
  
  // Auth token kontrolü
  hasValidToken: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
  
  // Token'i manuel ekle/çıkar
  setAuthToken: async (token) => {
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  }
};

// Default export
export default api;