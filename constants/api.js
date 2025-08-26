// API konfigürasyonu
// Gerçek API sunucunuzun adresini buraya yazın

// Seçenek 1: Production sunucusu (ileride aktif olacak)
// export const API_BASE_URL = 'https://api.motimoti.com/api';
// export const API_BASE_URL = 'https://your-domain.com/api';

// Seçenek 2: Test için mock API (geçici çözüm) - KAPALI
// export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Seçenek 3: Local development (sadece aynı makinede çalışıyorsa)
// export const API_BASE_URL = 'http://localhost:3000/api';

// Seçenek 4: IP adresi (aynı ağda) - AKTİF (emülatör için gerekli)
export const API_BASE_URL = 'http://192.168.111.3:3000/api';

export const API_ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  auth: '/auth',
  
  // Beğeni ve favori endpoints
  GET_LIKED_POSTS: '/posts/liked',
  GET_FAVORITE_POSTS: '/posts/favorites',
  
  // Kullanıcı beğeni/favori endpoints (dynamic)
  GET_USER_LIKED_POSTS: (userId) => `/posts/user/${userId}/liked`,
  GET_USER_FAVORITE_POSTS: (userId) => `/posts/user/${userId}/favorites`,
  
  // 🚀 YENİ: Optimized Cache Endpoints
  GET_USER_STATS: (userId) => `/posts/user/${userId}/stats`, // Sadece sayıları döndürür
  GET_LIKED_POSTS_CACHED: '/posts/liked', // X-Last-Count header ile cache kontrolü
  GET_FAVORITE_POSTS_CACHED: '/posts/favorites', // X-Last-Count header ile cache kontrolü
  GET_USER_LIKED_POSTS_CACHED: (userId) => `/posts/user/${userId}/liked`, // Cache kontrolü
  GET_USER_FAVORITE_POSTS_CACHED: (userId) => `/posts/user/${userId}/favorites` // Cache kontrolü
};

// API timeout ayarları
export const API_TIMEOUT = 10000; // 10 saniye

// Debug modu - Gerçek API kullan
export const API_DEBUG = false;