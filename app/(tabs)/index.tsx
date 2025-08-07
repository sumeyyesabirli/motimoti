// app/(tabs)/index.tsx
import { Bed, Leaf, PersonSimpleRun } from 'phosphor-react-native'; // İkonları import et
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChallengeCard } from '../../components/ChallengeCard';
import { HomeHeader } from '../../components/HomeHeader';
import { PlanCard } from '../../components/PlanCard'; // Yeni bileşeni import et
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader />
        <ChallengeCard />
        <View style={styles.planSection}>
          <Text style={styles.sectionTitle}>Senin Planın</Text>
          <PlanCard 
            title="Uyku Düzeni"
            subtitle="8 saatlik uyku hedefin var"
            icon={Bed}
            color={colors.primary}
          />
          <PlanCard 
            title="Beslenme"
            subtitle="Bugün 3 sağlıklı öğün"
            icon={Leaf}
            color={colors.accent}
          />
           <PlanCard 
            title="Egzersiz"
            subtitle="30 dakika yürüyüş"
            icon={PersonSimpleRun}
            color="#588157" // Örnek ek bir renk
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  planSection: {
    marginTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 100, // Scroll'un tab bar arkasına gitmemesi için
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: colors.text,
    marginBottom: 16,
  },
});
