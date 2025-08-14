// context/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { colors } from '../constants/colors';

export const ThemeContext = createContext({
  isDark: false,
  colors: colors.light,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Varsayılan: açık tema
  const [isDark, setIsDark] = useState(false);

  // Uygulama açıldığında kayıtlı tercih varsa yükle
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('theme_preference');
        if (saved === 'dark') setIsDark(true);
        if (saved === 'light') setIsDark(false);
      } catch {}
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('theme_preference', next ? 'dark' : 'light');
      return next;
    });
  };

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, colors: themeColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Temayı kolayca kullanmak için özel bir hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
