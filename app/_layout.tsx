// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { FeedbackProvider } from '../context/FeedbackContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Status bar background component - tema rengine göre değişir
const StatusBarBackground = () => {
  const { colors } = useTheme();
  
  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      height: 50, 
      backgroundColor: colors.background, 
      zIndex: 9999 
    }} />
  );
};

// Onboarding kontrolü için wrapper component
const OnboardingWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false); // Navigation flag ekledim
  const segments = useSegments();
  const router = useRouter();

  // AsyncStorage'dan onboarding durumunu kontrol et
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Debug için zorla sıfırla
        await AsyncStorage.removeItem('hasOnboarded');
        
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');
        setIsLoading(false);
      } catch (error) {
        console.error('AsyncStorage error:', error);
        setHasOnboarded(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isLoading || hasOnboarded === null || hasNavigated) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[1] === 'onboarding';

    // Her zaman onboarding ile başla
    if (!hasOnboarded) {
      if (!inOnboarding) {
        setHasNavigated(true); // Navigation flag'i set et
        router.replace('/(auth)/onboarding');
      }
    } else {
      // Onboarding tamamlandıysa auth sayfasına yönlendir
      if (!inAuthGroup) {
        setHasNavigated(true); // Navigation flag'i set et
        router.replace('/(auth)');
      }
    }
  }, [isLoading, hasOnboarded, segments, router, hasNavigated]);

  // AsyncStorage değişikliklerini dinle
  useEffect(() => {
    const checkOnboardingChange = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        if (onboarded === 'true' && hasOnboarded === false) {
          setHasOnboarded(true);
          setHasNavigated(false); // Navigation flag'i reset et
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

  if (isLoading) {
    return null; // Loading sırasında hiçbir şey gösterme
  }

  return <>{children}</>;
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

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBarBackground />
            <OnboardingWrapper>
              <Slot />
            </OnboardingWrapper>
          </GestureHandlerRootView>
        </AuthProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}
