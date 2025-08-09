// app/_layout.tsx
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../context/ThemeContext'; // ThemeProvider'ı import et

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) { SplashScreen.hideAsync(); } }, [loaded]);

  if (!loaded) { return null; }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* --- YENİ KEDİ SAYFASINI EKLE --- */}
          <Stack.Screen name="cats" options={{ headerShown: false }} />
          {/* ------------------------------- */}
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
