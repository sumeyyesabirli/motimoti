// app/(tabs)/index.tsx
import { useRouter } from 'expo-router';
import { Smiley, Trophy } from 'phosphor-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { AnimatedButton } from '../../components/AnimatedButton';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  
  const handleButtonPress = () => {
    console.log('Butona tıklandı!');
    // Burada rrsyon veya başka bir işlem yapılabilir
  };

  // Sola sürükleme ile journal sayfasına git
  const navigateToJournal = () => {
    router.replace('/journal');
  };

  const panGesture = Gesture.Pan()
    .minDistance(5)
    .maxPointers(1)
    .activeOffsetX([-10, 10])
    .failOffsetY([-25, 25])
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
      const threshold = 60;
      const velocity = event.velocityX;
      
      // Daha hassas algılama
      if (event.translationX < -threshold && velocity < -300) {
        runOnJS(navigateToJournal)();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          directionalLockEnabled={true}
          bounces={false}
        >
        <View style={styles.header}>
          <Smiley size={60} color={colors.textLight} weight="thin" style={{ opacity: 0.8 }} />
          <Text style={styles.headerTitle}>Merhaba Şekerim!</Text>
          <Text style={styles.headerSubtitle}>Güne bir gülücükle başla</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.mainCard}>
            <Text style={styles.cardTitle}>Günün Sözü</Text>
            <Text style={styles.quote}>&ldquo;Hayat, fırtınanın geçmesini beklemek değil, yağmurda dans etmeyi öğrenmektir.&rdquo;</Text>
            <AnimatedButton
              title="Ruh Halimi Ekle"
              onPress={handleButtonPress}
              style={styles.actionButton}
            />
          </View>

          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoEmoji}>☀️</Text>
              <Text style={styles.infoValue}>7 Gün</Text>
              <Text style={styles.infoLabel}>Seri</Text>
            </View>
            <View style={styles.infoCard}>
              <Trophy size={32} color={colors.textDark} />
              <Text style={styles.infoValue}>12</Text>
              <Text style={styles.infoLabel}>Rozet</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { paddingBottom: 120 },
  header: {
    backgroundColor: colors.header,
    padding: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.textLight, marginTop: 8 },
  headerSubtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textLight, opacity: 0.9 },
  mainContent: { padding: 24, marginTop: -40 },
  mainCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 20, color: colors.textDark },
  quote: { fontFamily: 'Nunito-Regular', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginVertical: 16, minHeight: 45 },
  actionButton: {
    marginTop: 16,
    backgroundColor: colors.primaryButton,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: colors.primaryButton,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  infoCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    paddingVertical: 16,
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  infoEmoji: { fontSize: 28 },
  infoValue: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, marginTop: 8 },
  infoLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: colors.textMuted },
});
