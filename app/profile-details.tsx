// app/profile-details.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, token } = useAuth();

  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        if (!user || !token) return;
        const response = await userService.getUserProfile(user.id);
        if (isMounted && response.success) {
          const data = response.data;
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
  }, [user, token]);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSave = async () => {
    if (!user || !token) return;
    if (!username || !zodiac) {
      Alert.alert('Uyarı', 'Kullanıcı adı ve burç boş bırakılamaz.');
      return;
    }
    setSaving(true);
    try {
      await userService.updateUserProfile(user.id, { 
        username, 
        age, 
        zodiac, 
        email: user.email 
      });
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
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primaryButton} />
            <Text style={styles.savingText}>Kaydediliyor...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingBottom: 100 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark, textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: colors.card, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  saveButton: { backgroundColor: colors.primaryButton, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textLight },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  savingText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, marginTop: 16 },
});


