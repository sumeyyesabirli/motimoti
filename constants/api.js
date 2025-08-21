// API konfigürasyonu
// Gerçek API sunucunuzun adresini buraya yazın

// Seçenek 1: Kendi API sunucunuz (önerilen)
//export const API_BASE_URL = 'https://your-api-domain.com/api';

// Seçenek 2: Test için mock API (geçici çözüm) - KAPALI
// export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Seçenek 3: Local development (sadece aynı makinede çalışıyorsa)
 export const API_BASE_URL = 'http://localhost:3000/api';

// Seçenek 4: IP adresi (aynı ağda)
// export const API_BASE_URL = 'http://192.168.1.100:3000/api';

export const API_ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  auth: '/auth'
};

// API timeout ayarları
export const API_TIMEOUT = 10000; // 10 saniye

// Debug modu - Mock API kapalı
export const API_DEBUG = false;
