// app/_layout.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Slot, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { FeedbackProvider } from '../context/FeedbackContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { PostsProvider } from '../context/PostsContext';
import { Text, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

// Onboarding kontrolü için wrapper component - AuthProvider'ın dışında
const OnboardingWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const segments = useSegments();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // AsyncStorage'dan onboarding durumunu kontrol et
  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Debug için zorla sıfırla
        await AsyncStorage.removeItem('hasOnboarded');
        
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        console.log('🔍 Onboarding status:', onboarded);
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
    // Auth loading devam ediyorsa bekle
    if (authLoading || isLoading || hasOnboarded === null || hasNavigated) {
      console.log('⏳ Waiting:', { authLoading, isLoading, hasOnboarded, hasNavigated });
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[1] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    console.log('🧭 Navigation check:', { 
      hasOnboarded, 
      user: !!user, 
      inAuthGroup, 
      inOnboarding, 
      inTabs,
      segments 
    });

    // Onboarding tamamlanmamışsa her zaman onboarding'e git
    if (!hasOnboarded) {
      if (!inOnboarding) {
        console.log('🚀 Going to onboarding');
        setHasNavigated(true);
        router.replace('/(auth)/onboarding');
      }
    } else {
      // Onboarding tamamlandıysa
      if (user) {
        // Kullanıcı giriş yapmışsa ana uygulamaya git
        if (!inTabs) {
          console.log('🏠 Going to main app');
          setHasNavigated(true);
          router.replace('/(tabs)');
        }
      } else {
        // Kullanıcı giriş yapmamışsa login sayfasına git
        if (!inAuthGroup) {
          console.log('🔑 Going to login');
          setHasNavigated(true);
          router.replace('/(auth)');
        }
      }
    }
  }, [authLoading, isLoading, hasOnboarded, segments, router, hasNavigated, user]);

  // AsyncStorage değişikliklerini dinle
  useEffect(() => {
    const checkOnboardingChange = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        if (onboarded === 'true' && hasOnboarded === false) {
          console.log('✅ Onboarding completed, navigating...');
          setHasOnboarded(true);
          setHasNavigated(false);
          
          // Onboarding tamamlandığında kullanıcı durumuna göre yönlendir
          if (user) {
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
  }, [hasOnboarded, router, user]);

  // Auth loading devam ediyorsa loading göster
  if (authLoading || isLoading) {
    console.log('⏳ Still loading...');
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
          <PostsProvider>
            <ThemedAppShell>
              <OnboardingWrapper>
                <Slot />
              </OnboardingWrapper>
            </ThemedAppShell>
          </PostsProvider>
        </AuthProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

// Tema ve Safe Area ile sarmalayan üst seviye kabuk
const ThemedAppShell = ({ children }: { children: React.ReactNode }) => {
  const { isDark, colors } = useTheme();

  // Global font scaling politikasını ayarla (varsayılan: kapalı)
  useEffect(() => {
    const RNText = Text as any;
    const RNTextInput = TextInput as any;
    RNText.defaultProps = RNText.defaultProps || {};
    RNText.defaultProps.allowFontScaling = false;
    RNTextInput.defaultProps = RNTextInput.defaultProps || {};
    RNTextInput.defaultProps.allowFontScaling = false;
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
          {children}
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};
