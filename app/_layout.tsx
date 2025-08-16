// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Geçici olarak onboarding'i zorla göster
        await AsyncStorage.removeItem('hasOnboarded');
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        console.log('Onboarding status:', onboarded); // Debug için
        setHasOnboarded(onboarded === 'true');
      } catch (error) {
        console.error('AsyncStorage error:', error);
        setHasOnboarded(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    console.log('Layout effect - isLoading:', isLoading, 'hasOnboarded:', hasOnboarded, 'user:', user); // Debug için
    
    if (isLoading || hasOnboarded === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[1] === 'onboarding';

    console.log('Current segments:', segments); // Debug için

    // Her zaman onboarding ile başla
    if (!hasOnboarded) {
      console.log('Redirecting to onboarding'); // Debug için
      if (!inOnboarding) {
        router.replace('/(auth)/onboarding');
      }
    } else {
      console.log('Onboarding completed, checking auth'); // Debug için
      // Onboarding tamamlandıysa giriş durumuna göre yönlendir
      if (!user && !inAuthGroup) {
        // Giriş yapılmamışsa giriş sayfasına
        console.log('Redirecting to auth (login/register)'); // Debug için
        router.replace('/(auth)');
      } else if (user && inAuthGroup) {
        // Giriş yapılmışsa ana sayfaya
        console.log('Redirecting to tabs (main app)'); // Debug için
        router.replace('/(tabs)');
      }
    }
  }, [user, isLoading, hasOnboarded, segments, router]);

  // AsyncStorage değişikliklerini dinle
  useEffect(() => {
    const checkOnboardingChange = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        if (onboarded === 'true' && hasOnboarded === false) {
          console.log('Onboarding completed, updating state'); // Debug için
          setHasOnboarded(true);
          // Hemen yönlendirme yap
          router.replace('/(auth)');
        }
      } catch (error) {
        console.error('Error checking onboarding change:', error);
      }
    };

    const interval = setInterval(checkOnboardingChange, 100); // Her 100ms kontrol et (daha hızlı)
    return () => clearInterval(interval);
  }, [hasOnboarded, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  const [loaded] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <InitialLayout />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
