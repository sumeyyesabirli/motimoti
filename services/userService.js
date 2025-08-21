import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_DEBUG } from '../constants/api';

// Mock API için geçici kullanıcı verisi
const mockUsers = [
  {
    id: 1,
    email: 'test@example.com',
    username: 'TestUser',
    birthDate: '1990-01-01', // YYYY-MM-DD formatına çevrildi
    zodiac: 'Oğlak',
    anonymousName: 'Anonim-A1B'
  },
  {
    id: 2,
    email: 'demo@example.com',
    username: 'DemoUser',
    birthDate: '1985-06-15', // YYYY-MM-DD formatına çevrildi
    zodiac: 'İkizler',
    anonymousName: 'Anonim-X2Y'
  }
];

// BirthDate formatını dönüştür: DD.MM.YYYY -> YYYY-MM-DD
const convertBirthDateFormat = (birthDate) => {
  if (!birthDate) return null;
  
  // Eğer zaten YYYY-MM-DD formatındaysa
  if (birthDate.includes('-') && birthDate.length === 10) {
    return birthDate;
  }
  
  // DD.MM.YYYY formatından YYYY-MM-DD'ye çevir
  if (birthDate.includes('.')) {
    const parts = birthDate.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Ay ve gün için 0 ekle (01, 02, vs.)
      const formattedMonth = month.padStart(2, '0');
      const formattedDay = day.padStart(2, '0');
      return `${year}-${formattedMonth}-${formattedDay}`;
    }
  }
  
  return birthDate; // Değiştirilemezse olduğu gibi döndür
};

// API hata detaylarını console'a yazdır
const logApiError = (operation, error, endpoint, data = null) => {
  console.error(`❌ API HATA - ${operation}:`, {
    endpoint: `${API_BASE_URL}${endpoint}`,
    error: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: data,
    response: error.response?.data,
    config: {
      method: error.config?.method,
      url: error.config?.url,
      headers: error.config?.headers
    }
  });
  
  // Network hatası kontrolü
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    console.error('🌐 NETWORK HATASI: API sunucusuna bağlanılamıyor!');
    console.error('🔧 Kontrol edilecekler:');
    console.error('   - API sunucusu çalışıyor mu?');
    console.error('   - API URL doğru mu?');
    console.error('   - CORS ayarları yapıldı mı?');
    console.error('   - Firewall/antivirus engelliyor mu?');
  }
  
  // HTTP status kodlarına göre özel mesajlar
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        console.error('🚫 400 Bad Request: İstek formatı hatalı');
        break;
      case 401:
        console.error('🔐 401 Unauthorized: Kimlik doğrulama gerekli');
        break;
      case 403:
        console.error('🚫 403 Forbidden: Erişim reddedildi');
        break;
      case 404:
        console.error('🔍 404 Not Found: Endpoint bulunamadı');
        break;
      case 500:
        console.error('💥 500 Internal Server Error: Sunucu hatası');
        break;
      case 502:
        console.error('🌐 502 Bad Gateway: API sunucusu erişilemez');
        break;
      case 503:
        console.error('⏳ 503 Service Unavailable: API sunucusu meşgul');
        break;
      default:
        console.error(`⚠️ ${error.response.status} ${error.response.statusText}: Bilinmeyen hata`);
    }
  }
};

export const userService = {
  // Kullanıcı kaydı
  async register(userData) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Register called with:', userData);
      // Mock response
      const newUser = {
        id: Date.now(),
        ...userData,
        username: userData.username || 'User' + Date.now(),
        birthDate: convertBirthDateFormat(userData.birthDate) // Format dönüşümü
      };
      mockUsers.push(newUser);
      
      return {
        success: true,
        data: {
          user: newUser,
          token: 'mock-jwt-token-' + Date.now()
        },
        message: 'Kullanıcı başarıyla kaydedildi'
      };
    }
    
    try {
      // BirthDate formatını dönüştür
      const formattedUserData = {
        ...userData,
        birthDate: convertBirthDateFormat(userData.birthDate)
      };
      
      console.log('🚀 API Register isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.auth}/register`,
        data: formattedUserData,
        originalBirthDate: userData.birthDate,
        convertedBirthDate: formattedUserData.birthDate
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth}/register`, formattedUserData);
      
      console.log('✅ API Register başarılı:', response.data);
      return response.data;
    } catch (error) {
      logApiError('Register', error, API_ENDPOINTS.auth + '/register', userData);
      throw error;
    }
  },

  // Kullanıcı girişi
  async login(email, password) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Login called with:', { email, password });
      
      // Mock authentication
      const user = mockUsers.find(u => u.email === email);
      if (user && password.length > 0) {
        return {
          success: true,
          data: {
            user: user,
            token: 'mock-jwt-token-' + Date.now()
          },
          message: 'Giriş başarılı'
        };
      } else {
        throw new Error('Geçersiz email veya şifre');
      }
    }
    
    try {
      console.log('🚀 API Login isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.auth}/login`,
        data: { email, password: '***' }
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth}/login`, {
        email,
        password
      });
      
      console.log('✅ API Login başarılı:', {
        user: response.data.data?.user?.email,
        tokenLength: response.data.data?.token?.length
      });
      return response.data;
    } catch (error) {
      logApiError('Login', error, API_ENDPOINTS.auth + '/login', { email });
      throw error;
    }
  },

  // Şifre sıfırlama
  async forgotPassword(email) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Forgot password called with:', email);
      return {
        success: true,
        message: 'Şifre sıfırlama bağlantısı gönderildi (Mock)'
      };
    }
    
    try {
      console.log('🚀 API Forgot Password isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.auth}/forgot-password`,
        data: { email }
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.auth}/forgot-password`, {
        email
      });
      
      console.log('✅ API Forgot Password başarılı');
      return response.data;
    } catch (error) {
      logApiError('Forgot Password', error, API_ENDPOINTS.auth + '/forgot-password', { email });
      throw error;
    }
  },

  // Kullanıcı bilgilerini getir
  async getUserProfile(userId) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Get user profile called with:', userId);
      const user = mockUsers.find(u => u.id == userId);
      if (user) {
        return {
          success: true,
          data: user
        };
      } else {
        throw new Error('Kullanıcı bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Get User Profile isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.users}/${userId}`
      });
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.users}/${userId}`);
      
      console.log('✅ API Get User Profile başarılı:', {
        userId: response.data.data?.id,
        username: response.data.data?.username,
        birthDate: response.data.data?.birthDate
      });
      return response.data;
    } catch (error) {
      logApiError('Get User Profile', error, `${API_ENDPOINTS.users}/${userId}`, { userId });
      throw error;
    }
  },

  // Kullanıcı bilgilerini güncelle
  async updateUserProfile(userId, userData) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Update user profile called with:', { userId, userData });
      const userIndex = mockUsers.findIndex(u => u.id == userId);
      if (userIndex !== -1) {
        // BirthDate formatını dönüştür
        const formattedUserData = {
          ...userData,
          birthDate: convertBirthDateFormat(userData.birthDate)
        };
        
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...formattedUserData };
        return {
          success: true,
          data: mockUsers[userIndex],
          message: 'Profil güncellendi'
        };
      } else {
        throw new Error('Kullanıcı bulunamadı');
      }
    }
    
    try {
      // BirthDate formatını dönüştür
      const formattedUserData = {
        ...userData,
        birthDate: convertBirthDateFormat(userData.birthDate)
      };
      
      console.log('🚀 API Update User Profile isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.users}/${userId}`,
        data: formattedUserData,
        originalBirthDate: userData.birthDate,
        convertedBirthDate: formattedUserData.birthDate
      });
      
      const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.users}/${userId}`, formattedUserData);
      
      console.log('✅ API Update User Profile başarılı:', {
        userId: response.data.data?.id,
        updatedFields: Object.keys(userData),
        birthDateUpdated: userData.birthDate !== formattedUserData.birthDate
      });
      return response.data;
    } catch (error) {
      logApiError('Update User Profile', error, `${API_ENDPOINTS.users}/${userId}`, { userId, userData });
      throw error;
    }
  }
};
