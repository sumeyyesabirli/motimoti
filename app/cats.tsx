// app/cats.tsx
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const fetchCat = () => {
    setIsLoading(true);
    setCat(generateCatUrl());
    // Görselin yüklenmesi için kısa bir gecikme
    setTimeout(() => setIsLoading(false), 1000);
  };



  useEffect(() => {
    fetchCat();
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    backButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    bottomButtonContainer: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1,
    },
    pawButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    pawIcon: {
      fontSize: 24,
    }
  }), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <CaretLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryButton} />
        </View>
      ) : (
        <View style={styles.imageContainer}>
            <Image source={{ uri: cat }} style={styles.image} contentFit="contain" transition={500} />
        </View>
      )}
      
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity onPress={fetchCat} style={styles.pawButton} disabled={isLoading}>
          <Text style={styles.pawIcon}>🐾</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
