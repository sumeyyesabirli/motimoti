import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    await AsyncStorage.setItem('auth_token', token);
    console.log('✅ Register başarılı, token kaydedildi');
  }
  return res.data;
}

export async function login(email, password) {
  console.log('🚀 Login isteği:', { email, password: '***' });
  
  const res = await api.post('/auth/login', { email, password });
  const token = res?.data?.data?.token;
  if (token) {
    await AsyncStorage.setItem('auth_token', token);
    console.log('✅ Login başarılı, token kaydedildi');
  }
  return res.data;
}

export async function logout() {
  await AsyncStorage.removeItem('auth_token');
  console.log('🚪 Logout: Token silindi');
}

export async function forgotPassword(email) {
  console.log('🚀 Forgot Password isteği:', { email });
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

// Token'ı AsyncStorage'dan al
export async function getToken() {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('❌ Token alınırken hata:', error);
    return null;
  }
}
