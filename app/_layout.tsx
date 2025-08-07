// app/_layout.tsx
import { useFonts } from 'expo-font';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => {
    // Android için navigation bar ayarları - edge-to-edge uyumlu
    if (Platform.OS === 'android') {
      const setupNavigationBar = async () => {
        try {
          // Edge-to-edge modunda sadece visibility ayarla
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (error) {
          console.log('Navigation bar setup error:', error);
        }
      };
      
      setupNavigationBar();
    }
  }, []);

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) { SplashScreen.hideAsync(); } }, [loaded]);

  if (!loaded) { return null; }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
