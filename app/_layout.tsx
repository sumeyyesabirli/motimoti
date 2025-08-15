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
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await AsyncStorage.getItem('hasOnboarded');
      setHasOnboarded(onboarded === 'true');
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!hasOnboarded) {
      if (segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding');
      }
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, hasOnboarded, segments]);

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
