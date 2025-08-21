import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Request interceptor - her istekte token ekle
axios.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token alınırken hata:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 401 hatasında logout yap
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Token geçersiz, kullanıcıyı logout yap
        await AsyncStorage.removeItem('authToken');
        // AuthContext'te logout çağırılacak
        console.log('Token geçersiz, kullanıcı logout yapıldı');
      } catch (storageError) {
        console.error('Token silinirken hata:', storageError);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
