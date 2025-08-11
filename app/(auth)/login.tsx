// Google modülü Expo Go'da native olmadığı için dinamik import edeceğiz
import { useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, NativeModules, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebaseConfig';

// Not: Google Sign-In, Expo Go'da çalışmaz. EAS build veya dev client gerekir.

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const hasGoogleNative = useMemo(() => Boolean((NativeModules as any)?.RNGoogleSignin), []);
  const isFormValid = email.trim().length > 3 && password.length >= 6;

  const parseAuthError = (e: any): string => {
    const code = e?.code as string | undefined;
    switch (code) {
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi.';
      case 'auth/missing-password':
      case 'auth/invalid-password':
        return 'Geçersiz şifre.';
      case 'auth/user-not-found':
        return 'Kullanıcı bulunamadı. Lütfen kayıt olun.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-posta veya şifre hatalı.';
      case 'auth/too-many-requests':
        return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.';
      case 'auth/network-request-failed':
        return 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
      default:
        return e?.message ?? 'Bilinmeyen bir hata oluştu.';
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
      router.replace('/');
    } catch (error: any) {
      alert(parseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      router.replace('/');
    } catch (error: any) {
      alert(parseAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleButtonPress = async () => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;
    if (!hasGoogleNative) {
      alert('Google ile giriş için Expo Dev Client veya EAS build gereklidir.');
      return;
    }
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: '309702702738-4u1phg54mfbkv6mfd0i5fvc96s30lom3.apps.googleusercontent.com',
      });
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) throw new Error('Google kimlik doğrulama başarısız.');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      router.replace('/');
    } catch (e: any) {
      console.warn('Google sign-in hata:', e?.message ?? e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MOTIMOTI'ye Hoş Geldin!</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color={colors.light.primaryButton} />
      ) : (
        <>
          <TouchableOpacity style={[styles.button, !isFormValid && { opacity: 0.6 }]} disabled={!isFormValid} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline, !isFormValid && { opacity: 0.6 }]} disabled={!isFormValid} onPress={handleSignUp}>
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Kayıt Ol</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#DB4437' }, !hasGoogleNative && { opacity: 0.6 }]}
            disabled={!hasGoogleNative}
            onPress={onGoogleButtonPress}
          >
            <Text style={styles.buttonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>
          {!hasGoogleNative && (
            <Text style={{ marginTop: 8, color: '#8D99AE', fontFamily: 'Nunito-Regular', fontSize: 12 }}>
              Google ile giriş/kayıt için Expo Dev Client veya EAS build gereklidir.
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.light.background },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.light.textDark, marginBottom: 40 },
  input: {
    width: '100%',
    backgroundColor: colors.light.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: colors.light.primaryButton,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { fontFamily: 'Nunito-Bold', color: colors.light.textLight, fontSize: 16 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.light.primaryButton },
  buttonOutlineText: { color: colors.light.primaryButton },
});


