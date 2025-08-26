// app/(auth)/onboarding.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleStartJourney = async () => {
    try {
      // Onboarding'i tamamlandı olarak işaretle
      await AsyncStorage.setItem('hasOnboarded', 'true');
      
      // Kullanıcı zaten giriş yapmışsa direkt ana uygulamaya git
      if (user) {
        router.replace('/(tabs)');
      } else {
        // Kullanıcı giriş yapmamışsa login sayfasına git
        router.replace('/(auth)');
      }
    } catch (error) {
      console.error('Error in handleStartJourney:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            loop
            style={styles.lottie}
            source={{ uri: 'https://res.cloudinary.com/dvomnjs52/raw/upload/v1755239073/Cutebeardancing_kysksx.json' }}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>MOTIMOTI&apos;ye Hoş Geldin!</Text>
          <Text style={styles.subtitle}>
            Kişisel gelişim serüveninde sana eşlik edecek sevimli bir yoldaşın var.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartJourney}>
        <Text style={styles.buttonText}>
          {user ? 'Ana Sayfaya Git' : 'Serüvene Başla'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: { 
      flex: 1, 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 24, 
      backgroundColor: colors.background 
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    animationContainer: {
      width: 300,
      height: 300,
      backgroundColor: colors.card,
      borderRadius: 150,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      marginBottom: 40,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 10,
    },
    lottie: {
      width: '120%',
      height: '120%',
    },
    textContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    title: { 
      fontFamily: 'Nunito-ExtraBold', 
      fontSize: 32, 
      color: colors.textDark, 
      textAlign: 'center' 
    },
    subtitle: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 16, 
      color: colors.textMuted, 
      textAlign: 'center', 
      marginTop: 16 
    },
    button: { 
      width: '100%', 
      backgroundColor: colors.primaryButton, 
      padding: 15, 
      borderRadius: 12, 
      alignItems: 'center',
      marginBottom: 30,
    },
    buttonText: { 
      fontFamily: 'Nunito-Bold', 
      color: colors.textLight, 
      fontSize: 16 
    },
});
