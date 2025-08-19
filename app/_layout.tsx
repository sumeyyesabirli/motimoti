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
  const [hasNavigated, setHasNavigated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // AsyncStorage'dan onboarding ve auth durumunu kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [onboarded, hasLoggedIn] = await Promise.all([
          AsyncStorage.getItem('hasOnboarded'),
          AsyncStorage.getItem('hasLoggedIn')
        ]);
        
        setHasOnboarded(onboarded === 'true');
        setIsLoading(false);
      } catch (error) {
        console.error('AsyncStorage error:', error);
        setHasOnboarded(false);
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (isLoading || hasOnboarded === null || hasNavigated) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[1] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    // Onboarding tamamlanmamışsa her zaman onboarding'e git
    if (!hasOnboarded) {
      if (!inOnboarding) {
        setHasNavigated(true);
        router.replace('/(auth)/onboarding');
      }
    } else {
      // Onboarding tamamlandıysa, daha önce giriş yapıp yapmadığını kontrol et
      const checkPreviousLogin = async () => {
        try {
          const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
          if (hasLoggedIn === 'true') {
            // Daha önce giriş yapmışsa direkt ana uygulamaya git
            if (!inTabs) {
              setHasNavigated(true);
              router.replace('/(tabs)');
            }
          } else {
            // Hiç giriş yapmamışsa login sayfasına git
            if (!inAuthGroup) {
              setHasNavigated(true);
              router.replace('/(auth)');
            }
          }
        } catch (error) {
          console.error('Error checking login status:', error);
        }
      };
      
      checkPreviousLogin();
    }
  }, [isLoading, hasOnboarded, segments, router, hasNavigated]);

  // AsyncStorage değişikliklerini dinle
  useEffect(() => {
    const checkOnboardingChange = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        if (onboarded === 'true' && hasOnboarded === false) {
          setHasOnboarded(true);
          setHasNavigated(false);
          
          // Onboarding tamamlandığında daha önce giriş yapıp yapmadığını kontrol et
          const hasLoggedIn = await AsyncStorage.getItem('hasLoggedIn');
          if (hasLoggedIn === 'true') {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding change:', error);
      }
    };

    const interval = setInterval(checkOnboardingChange, 100);
    return () => clearInterval(interval);
  }, [hasOnboarded, router]);

  if (isLoading) {
    return null;
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
