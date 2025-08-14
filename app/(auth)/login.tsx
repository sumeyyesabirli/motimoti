// app/(auth)/login.tsx
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isValidEmail = (value: string) => /.+@.+\..+/.test(value);
  const isValidPassword = (value: string) => value.length >= 6;

  const handleSignIn = async () => {
    setLoading(true);
    try {
      if (!isValidEmail(email.trim())) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }
      if (!isValidPassword(password)) {
        alert('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const code = (error as any)?.code as string | undefined;
      if (code === 'auth/invalid-email') {
        alert('Geçersiz e-posta adresi.');
      } else if (code === 'auth/invalid-credential') {
        alert('E-posta veya şifre hatalı.');
      } else if (code === 'auth/user-not-found') {
        alert('Kullanıcı bulunamadı.');
      } else if (code === 'auth/wrong-password') {
        alert('Şifre yanlış.');
      } else {
        console.error(error);
        alert('Giriş yapılamadı.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      if (!isValidEmail(email.trim())) {
        alert('Lütfen geçerli bir e-posta adresi girin.');
        return;
      }
      if (!isValidPassword(password)) {
        alert('Şifre en az 6 karakter olmalıdır.');
        return;
      }
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const code = (error as any)?.code as string | undefined;
      if (code === 'auth/invalid-email') {
        alert('Geçersiz e-posta adresi.');
      } else if (code === 'auth/email-already-in-use') {
        alert('Bu e-posta zaten kullanımda.');
      } else if (code === 'auth/weak-password') {
        alert('Şifre çok zayıf (en az 6 karakter).');
      } else {
        console.error(error);
        alert('Kayıt olunamadı.');
      }
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


