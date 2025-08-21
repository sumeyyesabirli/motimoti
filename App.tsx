import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import './utils/axiosConfig'; // Axios interceptor'ları yükle

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      {/* Uygulama içeriği buraya gelecek */}
    </AuthProvider>
  );
}
