// app/(auth)/index.tsx
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Giriş Hatası", "E-posta veya şifre hatalı.");
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
        <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />

        {loading ? <ActivityIndicator size="large" color={colors.primaryButton} /> : (
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
    formContainer: { width: '100%', marginTop: -100 },
    input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
    button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
    footerText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted },
    linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
});


