// app/profile-details.tsx
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        if (!user) return;
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (isMounted && snap.exists()) {
          const data: any = snap.data();
          setUsername(data?.username ?? '');
          setAge(String(data?.age ?? ''));
          setZodiac(data?.zodiac ?? '');
        }
      } catch (e) {
        Alert.alert('Hata', 'Profil bilgileri yüklenemedi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [user]);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSave = async () => {
    if (!user) return;
    if (!username || !zodiac) {
      Alert.alert('Uyarı', 'Kullanıcı adı ve burç boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, { username, age, zodiac, email: user.email }, { merge: true });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      router.back();
    } catch (e) {
      Alert.alert('Hata', 'Kaydederken bir sorun oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}> 
        <View style={styles.center}> 
          <ActivityIndicator size="large" color={colors.primaryButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profil Bilgilerim</Text>

        <TextInput
          style={styles.input}
          placeholder="Kullanıcı Adı"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Yaş"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Burç"
          value={zodiac}
          onChangeText={setZodiac}
        />

        {saving ? (
          <ActivityIndicator size="large" color={colors.primaryButton} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Kaydet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.back()}>
              <Text style={[styles.buttonText, styles.buttonOutlineText]}>Vazgeç</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark, marginBottom: 16, textAlign: 'center' },
  input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9', color: colors.textDark },
  button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primaryButton },
  buttonOutlineText: { color: colors.primaryButton },
});


