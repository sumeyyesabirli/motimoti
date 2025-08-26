import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_DEBUG } from '../constants/api';

// Tarih formatını dönüştür (DD.MM.YYYY → YYYY-MM-DD)
const convertBirthDateFormat = (birthDate) => {
  if (!birthDate) return birthDate;
  
  // DD.MM.YYYY formatındaysa
  if (birthDate.includes('.')) {
    const [day, month, year] = birthDate.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Zaten YYYY-MM-DD formatındaysa
  return birthDate;
};

export async function register(payload) {
  const formattedPayload = {
    ...payload,
    birthDate: convertBirthDateFormat(payload.birthDate)
  };
  
  console.log('🚀 Register isteği:', {
    ...formattedPayload,
    password: '***'
  });
  
  const res = await api.post('/auth/register', formattedPayload);
  const token = res?.data?.data?.token;
  if (token) {
    await AsyncStorage.setItem('authToken', token);
    console.log('✅ Register başarılı, token kaydedildi');
  }
  return res.data;
}

export async function login(email, password) {
  if (API_DEBUG) {
    console.log('🔧 Mock API: Auth Login called with:', { email, password: '***' });
    
    // Mock authentication - herhangi bir email/password ile giriş yapabilir
    if (email && password && password.length > 0) {
      const mockUser = {
        id: '20927611-ad04-48ec-8267-491f7eddc8e3',
        username: 'Sümeyye',
        email: email,
        birthDate: '1996-10-29T22:00:00.000Z'
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // Token'ı kaydet
      await AsyncStorage.setItem('authToken', mockToken);
      console.log('✅ Mock Auth Login başarılı, token kaydedildi');
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        },
        message: 'Mock giriş başarılı'
      };
    } else {
      throw new Error('Email ve şifre boş olamaz');
    }
  }
  
  console.log('🚀 Login isteği:', { email, password: '***' });
  
  const res = await api.post('/auth/login', { email, password });
  const token = res?.data?.data?.token;
  if (token) {
    await AsyncStorage.setItem('authToken', token);
    console.log('✅ Login başarılı, token kaydedildi');
  }
  return res.data;
}

export async function logout() {
  await AsyncStorage.removeItem('authToken');
  console.log('🚪 Logout: Token silindi');
}

export async function forgotPassword(email) {
  console.log('🚀 Forgot Password isteği:', { email });
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}
