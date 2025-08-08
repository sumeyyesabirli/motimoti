// app/(tabs)/journal.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext'; // useTheme'i import et

const journalData = [
  { id: '1', date: '6 Ağustos 2025', mood: '😄', note: 'Harika bir gündü!' },
  { id: '2', date: '5 Ağustos 2025', mood: '😊', note: 'Arkadaşlarla kahve içtik.' },
];

interface JournalEntryProps {
  mood: string;
  date: string;
  note: string;
}





export default function JournalScreen() {
  const { colors } = useTheme(); // Renkleri temadan al
  const router = useRouter();

  // Sağa sürükleme ile ana sayfaya git
  const navigateToHome = () => {
    router.replace('/');
  };

  // Sola sürükleme ile profile sayfasına git
  const navigateToProfile = () => {
    router.replace('/profile');
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
      if (translation > threshold && velocity > 500) {
        runOnJS(navigateToHome)();
      } else if (translation < -threshold && velocity < -500) {
        runOnJS(navigateToProfile)();
      }
    });

  // Stilleri dinamik hale getir
  const styles = getStyles(colors);

  const JournalEntryCard: React.FC<JournalEntryProps> = ({ mood, date, note }) => (
    <View style={styles.card}>
      <Text style={styles.mood}>{mood}</Text>
      <View>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.note}>{note}</Text>
      </View>
    </View>
  );

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={journalData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalEntryCard {...item} />
          )}
          ListHeaderComponent={
            <Text style={styles.title}>Günlüğüm</Text>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          directionalLockEnabled={true}
          bounces={false}
          removeClippedSubviews={true}
        />
      </SafeAreaView>
    </GestureDetector>
  );
}

// Stil fonksiyonunu dosyanın dışına taşı
const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 40, color: colors.textDark, marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  mood: { fontSize: 36, marginRight: 16 },
  date: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: colors.textMuted },
  note: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark, marginTop: 2 },
});