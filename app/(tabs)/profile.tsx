// app/(tabs)/profile.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { SignOut, PencilSimple, User as UserIcon, Heart, Star, Note, UserCircle } from 'phosphor-react-native';
import { Link, useFocusEffect } from 'expo-router';

// Profildeki küçük yazı kartları
const ProfilePostCard = ({ item, colors }: { item: any; colors: any }) => {
  const styles = getStyles(colors);
  const isAnonymous = typeof item?.authorName === 'string' && item.authorName.startsWith('Anonim');
  
  return (
    <View style={styles.postCard}>
      {isAnonymous && (
        <View style={styles.anonymousIndicator}>
          <UserCircle size={16} color={colors.textMuted} />
          <Text style={styles.anonymousText}>Anonim Paylaşım</Text>
          </View>
      )}
      <Text style={styles.postText} numberOfLines={4}>{item.text}</Text>
          </View>
  );
};

// İstatistikleri gösteren kartlar
const StatCard = ({ icon: Icon, value, label, colors }: { icon: any; value: number; label: string; colors: any }) => {
  const styles = getStyles(colors);
  return (
    <View style={styles.statCard}>
      <Icon size={24} color={colors.primaryButton} weight="fill" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOutUser } = useAuth();
  const [userData, setUserData] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ postCount: 0, likeCount: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);

  const styles = useMemo(() => getStyles(colors), [colors]);
  
  useFocusEffect(
    useCallback(() => {
    if (!user) return;
    
    setLoading(true);
      
      const fetchAllData = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) setUserData(userDocSnap.data());

        const myPostsQuery = query(collection(db, 'posts'), where('authorId', '==', user.uid));
        const myPostsSnapshot = await getDocs(myPostsQuery);
        let totalLikes = 0;
        myPostsSnapshot.forEach(d => {
          totalLikes += (d.data() as any).likeCount || 0;
        });

        const favoritedPostsQuery = query(collection(db, 'posts'), where('favoritedBy', 'array-contains', user.uid));
        const favoritedPostsSnapshot = await getDocs(favoritedPostsQuery);
      
      setStats({
          postCount: myPostsSnapshot.size,
          likeCount: totalLikes,
          favoriteCount: favoritedPostsSnapshot.size,
        });
      };

      fetchAllData();

      // Liste - kendi yazıları (client-side sıralama)
      const q = query(collection(db, 'posts'), where('authorId', '==', user.uid));
      const unsubscribe = onSnapshot(q, snapshot => {
        const postsData = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
        postsData.sort((a, b) => {
          const aDate = typeof a?.createdAt?.toDate === 'function' ? a.createdAt.toDate() : a?.createdAt ? new Date(a.createdAt) : 0;
          const bDate = typeof b?.createdAt?.toDate === 'function' ? b.createdAt.toDate() : b?.createdAt ? new Date(b.createdAt) : 0;
          return (bDate as any) - (aDate as any);
        });
        setPosts(postsData as any[]);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [user])
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginTop: 40 }} />;
    if (posts.length === 0) return <Text style={styles.emptyText}>Henüz bir paylaşımın yok.</Text>;
    
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProfilePostCard item={item} colors={colors} />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
              <View style={styles.avatar}>
          <UserIcon size={40} color={colors.header} weight="fill" />
              </View>
        <View>
          <Text style={styles.name}>{userData?.username || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
            </View>
        <Link href="/profile/edit" asChild>
          <TouchableOpacity style={styles.editButton}>
            <PencilSimple size={20} color={colors.textDark} />
          </TouchableOpacity>
        </Link>
          </View>

          <View style={styles.statsContainer}>
        <StatCard icon={Note} value={stats.postCount} label="Yazı" colors={colors} />
        <StatCard icon={Heart} value={stats.likeCount} label="Beğeni" colors={colors} />
        <StatCard icon={Star} value={stats.favoriteCount} label="Favori" colors={colors} />
            </View>
            
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Paylaşımların</Text>
        {renderContent()}
            </View>
            
      <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
        <SignOut size={20} color="#D9534F" />
            <Text style={styles.signOutText}>Çıkış Yap</Text>
          </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingHorizontal: 24, 
    paddingBottom: 10,
  },
  avatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: colors.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    shadowColor: colors.shadow ?? '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  name: { fontFamily: 'Nunito-ExtraBold', fontSize: 26, color: colors.textDark },
  email: { fontFamily: 'Nunito-Regular', fontSize: 13, color: colors.textMuted, marginTop: 4 },
  editButton: { marginLeft: 'auto', backgroundColor: colors.card, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.textMuted + '33' },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginHorizontal: 24, 
    marginBottom: 16,
    gap: 10,
  },
  statCard: { 
    flex: 1,
    backgroundColor: colors.card, 
    borderRadius: 18, 
    paddingVertical: 16, 
    paddingHorizontal: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted + '22',
    shadowColor: colors.shadow ?? '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: { fontFamily: 'Nunito-ExtraBold', fontSize: 22, color: colors.textDark, marginTop: 8 },
  statLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: colors.textMuted, marginTop: 2 },
  contentContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 6 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, marginBottom: 12 },
  emptyText: { fontFamily: 'Nunito-SemiBold', color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  postCard: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.textMuted + '22',
    shadowColor: colors.shadow ?? '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  postText: { fontFamily: 'Nunito-Regular', fontSize: 16, color: colors.textDark, lineHeight: 24 },
  anonymousIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  anonymousText: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: colors.textMuted, marginLeft: 6 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, marginHorizontal: 24, borderRadius: 12, marginTop: 'auto' },
  signOutText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#D9534F', marginLeft: 8 },
});

