// app/(tabs)/profile.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Image as RNImage, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext'; // useTheme'i import et

const { width } = Dimensions.get('window');

// Örnek tamamlanmış çiçekler (Veritabanından gelecek)
const collectedFlowers = [
  require('../../assets/flowers/paptya/Papatya (7).png'),
  // Başka bir papatya daha ekleyelim
  require('../../assets/flowers/paptya/Papatya (7).png'),
];

// Papatya serüveninin aşamaları ve görselleri
const stages = [
  { day: 1, description: "Her şey bu küçük adımla başladı.", image: require('../../assets/flowers/paptya/Papatya (1).png') },
  { day: 2, description: "Toprağı yaran o ilk umut ışığı.", image: require('../../assets/flowers/paptya/Papatya (2).png') },
  { day: 3, description: "Hayata doğru emin adımlarla uzanıyor.", image: require('../../assets/flowers/paptya/Papatya (3).png') },
  { day: 4, description: "Gövdeden çıkan ilk yaşam belirtileri.", image: require('../../assets/flowers/paptya/Papatya (4).png') },
  { day: 5, description: "Güzelliğini içinde saklayan bir sürpriz.", image: require('../../assets/flowers/paptya/Papatya (5).png') },
  { day: 6, description: "Dünyaya merhaba demeye çok yakın.", image: require('../../assets/flowers/paptya/Papatya (6).png') },
  { day: 7, description: "Tebrikler! Emeğinin karşılığı bu eşsiz güzellik.", image: require('../../assets/flowers/paptya/Papatya (7).png') }
];

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme(); // Tema değiştirme fonksiyonunu al
  const router = useRouter();
  const [showAdventure, setShowAdventure] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const currentStage = stages[currentDay - 1];

  // Sola sürükleme ile journal sayfasına git
  const navigateToJournal = () => {
    router.replace('/journal');
  };

  // Sağa sürükleme ile ana sayfaya git
  const navigateToHome = () => {
    router.replace('/');
  };

  const panGesture = Gesture.Pan()
    .minDistance(20) // Daha yüksek minimum mesafe
    .maxPointers(1)
    .activeOffsetX([-15, 15]) // Daha geniş aktif alan
    .failOffsetY([-30, 30]) // Daha geniş başarısızlık alanı
    .onStart(() => {
      'worklet';
      // Gesture başladığında
    })
    .onUpdate((event) => {
      'worklet';
      // Visual feedback için kullanılabilir
    })
    .onEnd((event) => {
      'worklet';
      const threshold = 100; // Daha yüksek eşik
      const velocity = event.velocityX;
      const translation = event.translationX;
      
      // Daha kesin koşullar
      if (translation < -threshold && velocity < -500) {
        runOnJS(navigateToJournal)();
      } else if (translation > threshold && velocity > 500) {
        runOnJS(navigateToHome)();
      }
    });

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newDay = Math.round(scrollX / (width - 48)) + 1;
    if (newDay >= 1 && newDay <= 7 && newDay !== currentDay) {
      setCurrentDay(newDay);
    }
  };

  // Stilleri dinamik hale getir
  const styles = getStyles(colors);

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RNImage 
            source={{ uri: 'https://placehold.co/100x100/E07A5F/FFFFFF?text=S&font=nunito' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>Sümeyye Sabırlı</Text>
          <Text style={styles.level}>Seviye 5: Hayalperest</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çiçek Koleksiyonun</Text>
          <View style={styles.collectionContainer}>
            {collectedFlowers.map((flowerImage, index) => (
              <View key={index} style={styles.flowerSlot}>
                <Image source={flowerImage} style={styles.flowerImage} contentFit="contain" />
              </View>
            ))}
            {/* Boş slotlar */}
            <View style={[styles.flowerSlot, { backgroundColor: '#EAE5D9' }]} />
            <View style={[styles.flowerSlot, { backgroundColor: '#EAE5D9' }]} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.adventureCard}
            onPress={() => setShowAdventure(true)}
          >
            <Text style={styles.adventureTitle}>Büyüme Serüvenin</Text>
            <Text style={styles.adventureSubtitle}>7 Günlük Papatya Yolculuğu</Text>
            <Text style={styles.adventureButton}>Görüntüle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Huzurlu Gece Modu</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primaryButton }}
                thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>
       </ScrollView>

       {/* Büyüme Serüveni Modal */}
       <Modal
         visible={showAdventure}
         animationType="slide"
         presentationStyle="fullScreen"
       >
         <SafeAreaView style={styles.modalSafeArea}>
           <View style={styles.modalContainer}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Büyüme Serüvenin</Text>
               <TouchableOpacity 
                 style={styles.closeButton}
                 onPress={() => setShowAdventure(false)}
               >
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
                 {stages.map((stage, index) => (
                   <View key={`day-${stage.day}`} style={styles.plantContainer}>
                     <Image
                       source={stage.image}
                       style={styles.plantImage}
                       contentFit="contain"
                       transition={200}
                       priority="high"
                       cachePolicy="memory-disk"
                       recyclingKey={`papatya-${stage.day}`}
                     />
                   </View>
                 ))}
               </ScrollView>

               <Text style={styles.descriptionText}>{currentStage.description}</Text>
             </View>
           </View>
         </SafeAreaView>
       </Modal>
       </SafeAreaView>
     </GestureDetector>
   );
 }

// Stil fonksiyonunu dosyanın dışına taşı
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
  section: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 30,
  },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: colors.textDark, marginBottom: 16 },
  collectionContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap', // Birden fazla satıra yayılmasını sağlar
    justifyContent: 'flex-start',
    gap: 12,
  },
  flowerSlot: {
    width: 70, // Boyutları ayarla
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  flowerImage: {
    width: '100%',
    height: '100%',
  },
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
  adventureTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: colors.textDark,
    marginBottom: 4,
  },
  adventureSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  adventureButton: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.primaryButton,
  },
  settingsContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 28,
    color: colors.textDark,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: colors.textDark,
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
  },
  currentDayText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  plantContainer: {
    width: width - 48,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantImage: {
    width: '100%',
    height: '80%',
  },
  descriptionText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 20,
    minHeight: 40,
  },
});
