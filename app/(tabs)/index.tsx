// app/(tabs)/index.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChallengeCard } from '../../components/ChallengeCard';
import { HomeHeader } from '../../components/HomeHeader';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <HomeHeader />
        <ChallengeCard />
        <View style={styles.planSection}>
          <Text style={styles.sectionTitle}>Senin Planın</Text>
          {/* Buraya Plan Kartları Eklenecek */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  planSection: {
    marginTop: 30,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: colors.text,
  },
});
