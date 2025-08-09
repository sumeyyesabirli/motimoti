// app/(tabs)/index.tsx
import { Link } from 'expo-router';
import { ArrowRight, Cat, Smiley, Trophy } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen() {
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    // ... header, safeArea, container gibi diğer stiller aynı kalacak
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
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 15,
    },
    // --- YENİ KART STİLLERİ ---
    catCard: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    catCardText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 16,
      color: colors.textDark,
    },
    // -------------------------
    actionButton: {
      backgroundColor: colors.primaryButton,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 50,
      shadowColor: colors.primaryButton,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 8,
      marginTop: 16,
    },
    buttonText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textLight },
    infoCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 32,
      padding: 16,
      flex: 1,
      marginHorizontal: 8,
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 1,
      shadowRadius: 15,
      elevation: 10,
    },
    infoEmoji: { fontSize: 28 },
    infoValue: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, marginTop: 8 },
    infoLabel: { fontFamily: 'Nunito-Regular', fontSize: 12, color: colors.textMuted },
  }), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Smiley size={60} color={colors.textLight} weight="thin" style={{ opacity: 0.8 }} />
          <Text style={styles.headerTitle}>Merhaba Şekerim!</Text>
          <Text style={styles.headerSubtitle}>Güne bir gülücükle başla</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.mainCard}>
            {/* --- KEDİ GALERİSİNE YÖNLENDİREN YENİ KART --- */}
            <Link href="/cats" asChild>
              <TouchableOpacity style={styles.catCard}>
                <Cat size={32} color={colors.header} />
                <Text style={styles.catCardText}>Günün Sürprizini Keşfet</Text>
                <ArrowRight size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </Link>
            {/* ------------------------------------------- */}

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Ruh Halimi Ekle</Text>
            </TouchableOpacity>
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
  );
}
