// app/(tabs)/community.tsx
import { Link, useFocusEffect } from 'expo-router';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Plus } from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';

// Paylaşım kartı için yeniden tasarlanmış bileşen
const PostCard = ({ item, colors }) => {
  const styles = getStyles(colors);
  const authorInitial = item.authorName ? item.authorName.charAt(0).toUpperCase() : 'A';

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{authorInitial}</Text>
        </View>
        <Text style={styles.postAuthor}>{item.authorName || 'Anonim'}</Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
    </View>
  );
};

export default function CommunityScreen() {
  const { colors } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => getStyles(colors), [colors]);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsData = [];
        querySnapshot.forEach((doc) => {
          postsData.push({ id: doc.id, ...doc.data() });
        });
        setPosts(postsData);
        setLoading(false);
      });

      return () => unsubscribe(); // Ekrandan ayrılınca dinleyiciyi kapat
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Topluluk Alanı</Text>
        <Text style={styles.headerSubtitle}>Birbirinize ilham verin</Text>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryButton} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard item={item} colors={colors} />}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Link href="/add-post" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus size={32} color={colors.textLight} weight="bold" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
    headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark },
    headerSubtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, marginTop: 4 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 120 },
    postCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8 },
    postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.header, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textLight },
    postAuthor: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark },
    postText: { fontFamily: 'Nunito-Regular', fontSize: 16, color: colors.textDark, lineHeight: 24 },
    fab: { position: 'absolute', bottom: 100, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.header, justifyContent: 'center', alignItems: 'center', shadowColor: colors.header, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
});
