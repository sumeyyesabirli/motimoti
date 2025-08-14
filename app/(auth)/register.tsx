// app/(auth)/register.tsx
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebaseConfig';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSignUp = async () => {
    if (!email || !password || !username || !age || !zodiac) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        age: age,
        zodiac: zodiac,
        email: user.email,
      });

    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error?.message ?? 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Aramıza Katıl</Text>
      <Text style={styles.subtitle}>Yeni bir serüvene başla.</Text>
      
      <TextInput style={styles.input} placeholder="Kullanıcı Adı" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Yaş" value={age} onChangeText={setAge} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Burç" value={zodiac} onChangeText={setZodiac} />

      {loading ? <ActivityIndicator size="large" color={colors.primaryButton} /> : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Zaten bir hesabın var mı? </Text>
        <Link href="/(auth)" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Giriş Yap</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
    title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.textDark, textAlign: 'center' },
    subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 30 },
    input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
    button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted },
    linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
});


