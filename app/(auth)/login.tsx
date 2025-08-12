// app/(auth)/login.tsx
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, NativeModules, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { auth } from '../../firebaseConfig';

// Client ID'lerini Firebase Konsolu'ndan kopyalayıp girin
import { useRouter } from 'expo-router';

// Google Sign-In yapılandırması dinamik import ile on-demand yapılacak

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const hasGoogleNative = useMemo(() => Boolean((NativeModules as any)?.RNGoogleSignin), []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (error) {
      console.error(error);
      alert('Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (error) {
      console.error(error);
      alert('Kayıt olunamadı.');
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
    setLoading(true);
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: '309702702738-4u1phg54mfbkv6mfd0i5fvc96s30lom3.apps.googleusercontent.com',
        iosClientId: '309702702738-cessb1jorh50kq6mv4oihbnv8cuf48ui.apps.googleusercontent.com',
      });
      // Android'de Play Services kontrolü
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
      router.replace('/');
    } catch (error) {
      console.error(error);
      alert('Google ile giriş yapılamadı.');
    } finally {
      setLoading(false);
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
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleSignUp}>
            <Text style={[styles.buttonText, styles.buttonOutlineText]}>Kayıt Ol</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4285F4' }]} onPress={onGoogleButtonPress}>
            <Text style={styles.buttonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>
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


