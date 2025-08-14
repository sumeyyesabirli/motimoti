// app/(auth)/index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeSlash } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  useEffect(() => {
    const loadRemembered = async () => {
      try {
        const [savedFlag, savedEmail, savedPassword] = await Promise.all([
          AsyncStorage.getItem('remember_me'),
          AsyncStorage.getItem('remember_email'),
          SecureStore.getItemAsync('remember_password'),
        ]);
        if (savedFlag === 'true' && savedEmail) {
          setRememberMe(true);
          setEmail(savedEmail);
          if (savedPassword) setPassword(savedPassword);
        }
      } catch {}
    };
    loadRemembered();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      showFeedback({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        await AsyncStorage.setItem('remember_me', 'true');
        await AsyncStorage.setItem('remember_email', email);
        await SecureStore.setItemAsync('remember_password', password);
      } else {
        await AsyncStorage.removeItem('remember_me');
        await AsyncStorage.removeItem('remember_email');
        await SecureStore.deleteItemAsync('remember_password');
      }
    } catch (error) {
      showFeedback({ message: 'E-posta veya şifre hatalı.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Tekrar Hoş Geldin!</Text>
        <Text style={styles.subtitle}>Kaldığın yerden devam et.</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput style={styles.inputBox} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.passwordContainer}>
          <TextInput style={styles.textInput} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeSlash size={24} color={colors.textMuted} /> : <Eye size={24} color={colors.textMuted} />}
          </TouchableOpacity>
        </View>
        <View style={styles.rememberRow}>
          <Text style={styles.rememberText}>Beni hatırla</Text>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: '#ccc', true: colors.primaryButton }}
            thumbColor={'#f4f3f4'}
          />
        </View>
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
        </Link>

        {loading ? <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginTop: 20 }} /> : (
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Hesabın yok mu? </Text>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between', padding: 24, backgroundColor: colors.background },
    title: { fontFamily: 'Nunito-ExtraBold', fontSize: 36, color: colors.textDark, textAlign: 'center', marginTop: 80 },
    subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 18, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
    formContainer: { width: '100%', marginTop: -80 },
    inputBox: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
    textInput: { flex: 1, height: 55, backgroundColor: 'transparent', paddingHorizontal: 20, borderRadius: 12, marginBottom: 0, fontFamily: 'Nunito-SemiBold', fontSize: 16 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: '#EAE5D9', marginTop: 16 },
    eyeIcon: { padding: 15 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    rememberText: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: colors.textMuted },
    forgotPasswordText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.textMuted, textAlign: 'right', marginTop: 10, marginBottom: 20 },
    button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
    footerText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted },
    linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
});


