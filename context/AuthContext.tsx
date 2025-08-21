// API entegreli AuthContext
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../services/userService';

interface UserData {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  anonymousName?: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signOutUser: async () => {},
  register: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama başladığında token kontrolü
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          // Token ile kullanıcı bilgilerini getir
          // Bu kısım API'den kullanıcı bilgisi döndüğünde güncellenecek
        }
      } catch (error) {
        console.error('Token kontrol edilirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await userService.login(email, password);
      if (response.success) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        await AsyncStorage.setItem('authToken', authToken);
      } else {
        throw new Error(response.message || 'Giriş yapılamadı');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Giriş yapılamadı');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await userService.register(userData);
      if (response.success) {
        const { user: newUser, token: authToken } = response.data;
        setUser(newUser);
        setToken(authToken);
        await AsyncStorage.setItem('authToken', authToken);
      } else {
        throw new Error(response.message || 'Kayıt yapılamadı');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.message || 'Kayıt yapılamadı');
    }
  };

  const signOutUser = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOutUser, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

