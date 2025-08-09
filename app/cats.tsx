// app/cats.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const generateCatUrl = () => {
  // Her seferinde farklı bir fotoğraf gelmesi için URL'ye rastgele bir parametre ekliyoruz.
  return `https://cataas.com/cat?${Math.random()}`;
};

export default function CatGalleryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [cat, setCat] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Pati animasyonunu başlat
  const startPawAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchCat = () => {
    setIsLoading(true);
    setCat(generateCatUrl());
    setTimeout(() => setIsLoading(false), 300);
  };

  // İlk yükleme için ayrı fonksiyon
  const initialLoad = () => {
    setIsLoading(true);
    setCat(generateCatUrl());
    setTimeout(() => {
      setIsLoading(false);
      startPawAnimation(); // İlk yüklemeden sonra animasyonu başlat
    }, 300);
  };

  useEffect(() => {
    initialLoad();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
    },
    header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 30,
    },
    headerButton: {
      backgroundColor: colors.card,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 5,
    },
    pawButtonContainer: {
      alignItems: 'center',
      paddingTop: 10,
    },
    pawButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    pawIconLarge: {
      width: 120,
      height: 120,
      opacity: 0.95,
    },
    headerTitle: {
      fontFamily: 'Nunito-Bold',
      fontSize: 22,
      color: colors.textDark,
    },
    imageFrame: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 20,
    },
    imageCard: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.card,
      borderRadius: 32,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 1,
      shadowRadius: 20,
      elevation: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 24,
    },

  }), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <CaretLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Günün Sürprizi</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.imageFrame}>
            <View style={styles.imageCard}>
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primaryButton} />
              ) : (
                <Image 
                  source={{ uri: cat }} 
                  style={styles.image} 
                  contentFit="contain"
                  transition={500} 
                />
              )}
            </View>
        </View>

        <View style={styles.pawButtonContainer}>
          <TouchableOpacity onPress={fetchCat} style={styles.pawButton}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Image 
                source={require('../assets/images/pati.png')}
                style={styles.pawIconLarge}
                contentFit="contain"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 30 }} /> 
      </View>
    </SafeAreaView>
  );
}