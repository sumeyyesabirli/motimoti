// components/JournalCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface JournalCardProps {
  mood: string;
  date: string;
  note: string;
}

export const JournalCard: React.FC<JournalCardProps> = ({ mood, date, note }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.mood}>{mood}</Text>
      <View style={styles.noteContainer}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.note} numberOfLines={1}>{note}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  mood: {
    fontSize: 32,
    marginRight: 16,
  },
  noteContainer: {
    flex: 1,
  },
  date: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  note: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },
});
