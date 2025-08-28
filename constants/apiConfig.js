// API Konfigürasyonu - Merkezi API Yönetimi
// Bu dosya API URL'ini ve ayarlarını tek yerden yönetir

/**
 * API Base URL'ini belirler
 * Production'da environment variable kullanın: process.env.API_BASE_URL
 * Development'ta local IP veya localhost kullanın
 */
const getApiBaseUrl = () => {
  // Expo ortam değişkeni (runtime'da erişilebilir)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Node ortam değişkeni (fallback)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Development için farklı seçenekler
  if (__DEV__) {
    // Emülatör için local network IP (en yaygın kullanım)
    // Yerel ağ IP'niz değiştiyse .env'de EXPO_PUBLIC_API_BASE_URL ile geçersiz kılın
    return 'http://192.168.1.2:3000/api';
    
    // Alternatif seçenekler:
    // return 'http://localhost:3000/api';        // Sadece aynı makine için
    // return 'http://10.0.2.2:3000/api';        // Android emulator için
    // return 'http://127.0.0.1:3000/api';       // iOS simulator için
  }
  
  // Production fallback
  return 'https://api.motimoti.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoint'leri
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: '/auth',
  
  // User endpoints  
  users: '/users',
  
  // Post endpoints
  posts: '/posts',
  
  // Beğeni ve favori endpoints
  GET_LIKED_POSTS: '/posts/liked',
  GET_FAVORITE_POSTS: '/posts/favorites',
  
  // Kullanıcı beğeni/favori endpoints (dynamic)
  GET_USER_LIKED_POSTS: (userId) => `/posts/user/${userId}/liked`,
  GET_USER_FAVORITE_POSTS: (userId) => `/posts/user/${userId}/favorites`,
  
  // Optimized Cache Endpoints
  GET_USER_STATS: (userId) => `/posts/user/${userId}/stats`,
  GET_LIKED_POSTS_CACHED: '/posts/liked',
  GET_FAVORITE_POSTS_CACHED: '/posts/favorites', 
  GET_USER_LIKED_POSTS_CACHED: (userId) => `/posts/user/${userId}/liked`,
  GET_USER_FAVORITE_POSTS_CACHED: (userId) => `/posts/user/${userId}/favorites`
};

// API ayarları
export const API_CONFIG = {
  timeout: 30000, // 30 saniye
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Debug bilgileri konsola yazdır
console.log('🔧 API Konfigürasyonu:', {
  baseUrl: API_BASE_URL,
  isDevelopment: __DEV__,
  timeout: API_CONFIG.timeout
});
