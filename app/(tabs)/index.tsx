// app/(tabs)/index.tsx
import { Link } from 'expo-router';
import { ArrowRight, Cat, Smiley, Trophy } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive, useSafeArea, spacing, fontSizes, getPlatformShadow, borderRadius } from '../../hooks/useResponsive';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { top: safeTop } = useSafeArea();
  const { isSmallDevice, isTablet } = useResponsive();

  const styles = useMemo(() => StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'ios' ? 0 : safeTop,
    },
    scrollContainer: { 
      paddingBottom: spacing.xxl * 2,
      minHeight: '100%',
    },
    header: {
      backgroundColor: colors.header,
      paddingHorizontal: spacing.xl,
      paddingTop: Platform.OS === 'ios' ? safeTop + spacing.lg : safeTop + spacing.md,
      paddingBottom: spacing.xl,
      borderBottomLeftRadius: borderRadius.xxl,
      borderBottomRightRadius: borderRadius.xxl,
      alignItems: 'center',
      marginBottom: -spacing.xl,
    },
    headerTitle: { 
      fontFamily: 'Nunito-ExtraBold', 
      fontSize: isSmallDevice ? fontSizes.xxl : fontSizes.largeTitle, 
      color: colors.textLight, 
      marginTop: spacing.sm,
      textAlign: 'center',
      lineHeight: isSmallDevice ? fontSizes.xxl * 1.2 : fontSizes.largeTitle * 1.2,
    },
    headerSubtitle: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: isSmallDevice ? fontSizes.md : fontSizes.lg, 
      color: colors.textLight, 
      opacity: 0.9,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    mainContent: { 
      paddingHorizontal: spacing.xl, 
      paddingTop: spacing.xl,
      flex: 1,
    },
    mainCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xxl,
      padding: spacing.xl,
      alignItems: 'center',
      ...getPlatformShadow(8, colors.shadow),
      marginBottom: spacing.lg,
    },
    catCard: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: spacing.sm,
      ...getPlatformShadow(4, colors.shadow),
    },
    catCardText: {
      fontFamily: 'Nunito-Bold',
      fontSize: fontSizes.lg,
      color: colors.textDark,
      flex: 1,
      marginLeft: spacing.md,
    },
    actionButton: {
      backgroundColor: colors.primaryButton,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.round,
      ...getPlatformShadow(6, colors.primaryButton),
      marginTop: spacing.md,
      minWidth: isTablet ? 200 : 160,
    },
    buttonText: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: fontSizes.lg, 
      color: colors.textLight,
      textAlign: 'center',
    },
    infoCardsContainer: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      marginTop: spacing.xl,
      gap: spacing.sm,
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xxl,
      padding: spacing.md,
      flex: 1,
      alignItems: 'center',
      ...getPlatformShadow(6, colors.shadow),
      minHeight: isTablet ? 120 : 100,
    },
    infoEmoji: { 
      fontSize: isSmallDevice ? fontSizes.xxl : fontSizes.xxxl,
    },
    infoValue: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: isSmallDevice ? fontSizes.lg : fontSizes.xl, 
      color: colors.textDark, 
      marginTop: spacing.sm,
    },
    infoLabel: { 
      fontFamily: 'Nunito-Regular', 
      fontSize: isSmallDevice ? fontSizes.sm : fontSizes.md, 
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  }), [colors, safeTop, isSmallDevice, isTablet]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Smiley 
            size={isSmallDevice ? 48 : 60} 
            color={colors.textLight} 
            weight="thin" 
            style={{ opacity: 0.8 }} 
          />
          <Text style={styles.headerTitle}>Merhaba Şekerim!</Text>
          <Text style={styles.headerSubtitle}>Güne bir gülücükle başla</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.mainCard}>
            <Link href="/cats" asChild>
              <TouchableOpacity style={styles.catCard}>
                <Cat size={isSmallDevice ? 28 : 32} color={colors.header} />
                <Text style={styles.catCardText}>Kedi Galerisi</Text>
                <ArrowRight size={isSmallDevice ? 20 : 24} color={colors.textMuted} />
              </TouchableOpacity>
            </Link>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.buttonText}>Günlük Yaz</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoEmoji}>📝</Text>
              <Text style={styles.infoValue}>12</Text>
              <Text style={styles.infoLabel}>Yazı</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoEmoji}>😊</Text>
              <Text style={styles.infoValue}>8</Text>
              <Text style={styles.infoLabel}>Gün</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoEmoji}>🏆</Text>
              <Text style={styles.infoValue}>3</Text>
              <Text style={styles.infoLabel}>Başarı</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
