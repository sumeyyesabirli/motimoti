// components/ChallengeCard.tsx
import { ArrowRight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';

export const ChallengeCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Günün Meydan Okuması</Text>
        <Text style={styles.subtitle}>Bugün kendine 10 dakika ayır.</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Başla</Text>
          <ArrowRight size={16} color={colors.card} />
        </TouchableOpacity>
      </View>
      {/* Buraya 3D bir görsel veya SVG eklenebilir */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 24,
    marginTop: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {},
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: colors.card,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.card,
    opacity: 0.9,
    marginTop: 4,
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: colors.card,
    marginRight: 8,
  },
});
