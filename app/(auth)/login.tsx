// app/(auth)/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Check, Eye, EyeSlash } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      if (rememberPassword) {
        await AsyncStorage.setItem('rememberedEmail', email.trim());
        await SecureStore.setItemAsync('rememberedPassword', password);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await SecureStore.deleteItemAsync('rememberedPassword');
      }
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
      if (rememberPassword) {
        await AsyncStorage.setItem('rememberedEmail', email.trim());
        await SecureStore.setItemAsync('rememberedPassword', password);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await SecureStore.deleteItemAsync('rememberedPassword');
      }
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

  useEffect(() => {
    (async () => {
      try {
        const savedPassword = await SecureStore.getItemAsync('rememberedPassword');
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        if (savedPassword) {
          setPassword(savedPassword);
          setRememberPassword(true);
          if (savedEmail) setEmail(savedEmail);
        }
      } catch {}
    })();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: colors.background },
    title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, marginBottom: 40, color: colors.textDark },
    input: {
      width: '100%',
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textDark,
    },
    passwordContainer: {
      width: '100%',
      position: 'relative',
    },
    passwordToggle: {
      position: 'absolute',
      right: 12,
      top: 12,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    rememberRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rememberText: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: colors.textDark },
    button: {
      width: '100%',
      backgroundColor: colors.primaryButton,
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primaryButton },
    buttonOutlineText: { color: colors.primaryButton },
  }), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>MOTIMOTI'ye Hoş Geldin!</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 70 }]}
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          textContentType="password"
        />
        <TouchableOpacity style={styles.passwordToggle} onPress={() => setPasswordVisible(!passwordVisible)}>
          {passwordVisible ? (
            <EyeSlash size={22} color={colors.primaryButton} />
          ) : (
            <Eye size={22} color={colors.primaryButton} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberPassword(!rememberPassword)}>
        <View style={[styles.checkbox, { borderColor: colors.primaryButton, backgroundColor: rememberPassword ? colors.primaryButton : 'transparent' }]}>
          {rememberPassword && <Check size={14} color={colors.textLight} weight="bold" />}
        </View>
        <Text style={styles.rememberText}>Şifremi Hatırla (Güvenilir cihazlarda)</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryButton} />
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
