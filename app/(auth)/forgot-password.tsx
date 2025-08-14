// app/(auth)/forgot-password.tsx
import { Link, useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth } from '../../firebaseConfig';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Başarılı', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu. Lütfen e-posta adresinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>Şifreni mi Unuttun?</Text>
        <Text style={styles.subtitle}>E-posta adresine bir sıfırlama bağlantısı göndereceğiz.</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryButton} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Gönder</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Link href="/(auth)" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Giriş ekranına geri dön</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24, backgroundColor: colors.background },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.textDark, textAlign: 'center', marginTop: 80 },
  subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  formContainer: { width: '100%', marginTop: -150 },
  input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 30 },
  linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
});


