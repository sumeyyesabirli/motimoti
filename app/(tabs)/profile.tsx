// app/(tabs)/profile.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Image as RNImage, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';

const { width } = Dimensions.get('window');

// Koleksiyon (mock)
const collectedFlowers = [
  require('../../assets/flowers/papatya/Papatya(1).gif'),
  require('../../assets/flowers/papatya/Papatya(2).gif'),
  require('../../assets/flowers/papatya/Papatya(3).gif'),
  require('../../assets/flowers/papatya/Papatya(4).png'),
  require('../../assets/flowers/papatya/Papatya(5).png'),
  require('../../assets/flowers/papatya/Papatya(6).gif'),
  require('../../assets/flowers/papatya/Papatya(7).png'),
];

// 7 günlük serüven
const stages = [
  { day: 1, description: 'Her şey bu küçük adımla başladı.', image: require('../../assets/flowers/papatya/Papatya(1).gif') },
  { day: 2, description: 'Toprağı yaran o ilk umut ışığı.', image: require('../../assets/flowers/papatya/Papatya(2).gif') },
  { day: 3, description: 'Hayata doğru emin adımlarla uzanıyor.', image: require('../../assets/flowers/papatya/Papatya(3).gif') },
  { day: 4, description: 'Gövdeden çıkan ilk yaşam belirtileri.', image: require('../../assets/flowers/papatya/Papatya(4).png') },
  { day: 5, description: 'Güzelliğini içinde saklayan bir sürpriz.', image: require('../../assets/flowers/papatya/Papatya(5).png') },
  { day: 6, description: 'Dünyaya merhaba demeye çok yakın.', image: require('../../assets/flowers/papatya/Papatya(6).gif') },
  { day: 7, description: 'Tebrikler! Emeğinin karşılığı bu eşsiz güzellik.', image: require('../../assets/flowers/papatya/Papatya(7).png') },
];

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
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdventure, setShowAdventure] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setUserData(snap.data());
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newDay = Math.round(scrollX / (width - 48)) + 1;
    if (newDay >= 1 && newDay <= 7 && newDay !== currentDay) setCurrentDay(newDay);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primaryButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <RNImage
            source={{ uri: 'https://placehold.co/100x100/E07A5F/FFFFFF?text=U&font=nunito' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{userData?.username || 'Kullanıcı'}</Text>
          <Text style={styles.level}>{`${userData?.zodiac ?? 'Burç -'}${userData?.birthDate ? ' • ' + calculateAge(userData.birthDate) : ''}`}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
            <Text style={styles.editButtonText}>Profilimi Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çiçek Koleksiyonun</Text>
          <View style={styles.collectionContainer}>
            {collectedFlowers.map((flowerImage, index) => (
              <View key={index} style={styles.flowerSlot}>
                <Image source={flowerImage} style={styles.flowerImage} contentFit="contain" />
              </View>
            ))}
            <View style={[styles.flowerSlot, { backgroundColor: '#EAE5D9' }]} />
            <View style={[styles.flowerSlot, { backgroundColor: '#EAE5D9' }]} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.adventureCard} onPress={() => setShowAdventure(true)}>
            <Text style={styles.adventureTitle}>Büyüme Serüvenin</Text>
            <Text style={styles.adventureSubtitle}>7 Günlük Papatya Yolculuğu</Text>
            <Text style={styles.adventureButton}>Görüntüle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingText}>Huzurlu Gece Modu</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E7EB', true: colors.primaryButton }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
            <TouchableOpacity style={[styles.settingItem, { justifyContent: 'center' }]} onPress={signOutUser}>
              <Text style={[styles.settingText, { color: '#E07A5F', textAlign: 'center' }]}>Çıkış Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAdventure} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Büyüme Serüvenin</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowAdventure(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.currentDayText}>{currentDay}. Gün</Text>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
                decelerationRate="fast"
              >
                {stages.map((stage) => (
                  <View key={`day-${stage.day}`} style={styles.plantContainer}>
                    <Image source={stage.image} style={styles.plantImage} contentFit="contain" />
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.descriptionText}>{stages[currentDay - 1]?.description}</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { paddingBottom: 120, alignItems: 'center' },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.card,
  },
  name: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: colors.textDark, marginTop: 16 },
  level: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.primaryButton, marginTop: 4 },
  editButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.textDark },
  section: { width: '100%', paddingHorizontal: 24, marginTop: 30 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: colors.textDark, marginBottom: 16 },
  collectionContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
  },
  flowerSlot: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  flowerImage: { width: '100%', height: '100%' },
  adventureCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  adventureTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: colors.textDark, marginBottom: 4 },
  adventureSubtitle: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted, marginBottom: 12 },
  adventureButton: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.primaryButton },
  settingsContainer: { backgroundColor: colors.card, borderRadius: 24, padding: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingIcon: { fontSize: 20 },
  modalSafeArea: { flex: 1, backgroundColor: colors.background },
  modalContainer: { flex: 1, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 30 },
  modalTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark },
  modalContent: { flex: 1, alignItems: 'center' },
  currentDayText: { fontFamily: 'Nunito-SemiBold', fontSize: 18, color: colors.textMuted, marginBottom: 20 },
  scrollView: { flex: 1, width: '100%' },
  plantContainer: { width: width - 48, height: '100%', justifyContent: 'center', alignItems: 'center' },
  plantImage: { width: '100%', height: '80%' },
  descriptionText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark, textAlign: 'center', marginTop: 20, minHeight: 40 },
});

 
