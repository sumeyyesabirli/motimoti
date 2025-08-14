// app/(tabs)/profile.tsx
import { doc, getDoc } from 'firebase/firestore';
import { PencilSimple, SignOut } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebaseConfig';

const calculateAge = (birthDate?: string | null) => {
  if (!birthDate) return '-';
  const [day, month, year] = birthDate.split('.').map(Number);
  if (!day || !month || !year) return '-';
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSignOut = () => { auth.signOut(); };

  if (loading) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator size="large" color={colors.primaryButton} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.name}>{userData?.username || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>{calculateAge(userData?.birthDate)}</Text>
            <Text style={styles.infoLabel}>Yaş</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>{userData?.zodiac || '-'}</Text>
            <Text style={styles.infoLabel}>Burç</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <PencilSimple size={20} color={colors.textDark} />
            <Text style={styles.buttonText}>Profili Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#FFD6D6' }]} onPress={handleSignOut}>
            <SignOut size={20} color="#D9534F" />
            <Text style={[styles.buttonText, { color: '#D9534F' }]}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 24, paddingTop: 60, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  name: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark },
  email: { fontFamily: 'Nunito-Regular', fontSize: 16, color: colors.textMuted, marginTop: 4 },
  infoContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 40 },
  infoBox: { backgroundColor: colors.card, padding: 20, borderRadius: 16, alignItems: 'center', width: '45%', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5 },
  infoValue: { fontFamily: 'Nunito-Bold', fontSize: 24, color: colors.textDark },
  infoLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: colors.textMuted, marginTop: 4 },
  buttonContainer: { width: '100%' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, paddingVertical: 15, borderRadius: 12, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 5, elevation: 3, marginBottom: 12 },
  buttonText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark, marginLeft: 8 },
});

 
