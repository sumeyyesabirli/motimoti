// app/(tabs)/community.tsx
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useFocusEffect } from 'expo-router';
import { arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Heart, Plus, Star } from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';

// Zamanı dinamik olarak formatlayan yardımcı fonksiyon
const timeAgo = (timestamp: any) => {
  if (!timestamp?.toDate) return 'az önce';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: tr });
};

// Paylaşım kartı için yeniden tasarlanmış bileşen
const PostCard = ({ item, colors, onLike, userId }: { item: any; colors: any; onLike: any; userId: any }) => {
  const styles = getStyles(colors);
  const isLiked = item.likedBy?.includes(userId);

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{item.authorName || 'Anonim'}</Text>
        <Text style={styles.postTimestamp}>{timeAgo(item.createdAt)}</Text>
      </View>
      <Text style={styles.postText}>{item.text}</Text>
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onLike(item.id, isLiked)}>
          <Heart size={20} color={isLiked ? colors.header : colors.textMuted} weight={isLiked ? 'fill' : 'regular'} />
          <Text style={[styles.actionText, { color: isLiked ? colors.header : colors.textMuted }]}>
            {item.likeCount || 0} Beğeni
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Star size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>Favorilere Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useMemo(() => getStyles(colors), [colors]);

  useFocusEffect(
    React.useCallback(() => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [])
  );

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return; // Giriş yapmamış kullanıcılar beğenemez
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likeCount: increment(isLiked ? -1 : 1),
    });
  };

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
          renderItem={({ item }) => <PostCard item={item} colors={colors} onLike={handleLike} userId={user?.uid} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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

const getStyles = (colors: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center' },
    headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 28, color: colors.textDark },
    headerSubtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, marginTop: 4 },
    listContainer: { paddingHorizontal: 24, paddingBottom: 120 },
    postCard: { backgroundColor: colors.card, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#EAE5D9' },
    postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    postAuthor: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark },
    postTimestamp: { fontFamily: 'Nunito-Regular', fontSize: 12, color: colors.textMuted },
    postText: { fontFamily: 'Nunito-Regular', fontSize: 16, color: colors.textDark, lineHeight: 26, marginBottom: 16 },
    postFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#EAE5D9', paddingTop: 16 },
    actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
    actionText: { fontFamily: 'Nunito-Bold', fontSize: 14, marginLeft: 8 },
    fab: { position: 'absolute', bottom: 100, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.header, justifyContent: 'center', alignItems: 'center', shadowColor: colors.header, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
});