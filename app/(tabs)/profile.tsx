// app/(tabs)/profile.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Platform, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { SignOut, PencilSimple, User as UserIcon, Heart, Star, Note, UserCircle, Trash } from 'phosphor-react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useResponsive, useSafeArea, spacing, fontSizes, getPlatformShadow, borderRadius } from '../../hooks/useResponsive';

// Profildeki küçük yazı kartları
const ProfilePostCard = ({ item, colors, onEdit, onDelete }: { item: any; colors: any; onEdit: (id: string, currentText: string) => void; onDelete: (id: string) => void; }) => {
  const isAnonymous = typeof item?.authorName === 'string' && item.authorName.startsWith('Anonim');
  
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.textMuted + '22',
    }}>
      {isAnonymous && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <UserCircle size={16} color={colors.textMuted} />
          <Text style={{
            fontFamily: 'Nunito-SemiBold',
            fontSize: 12,
            color: colors.textMuted,
            marginLeft: 6,
          }}>Anonim Paylaşım</Text>
        </View>
      )}
      <Text style={{
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: colors.textDark,
        lineHeight: 24,
      }} numberOfLines={4}>{item.text}</Text>

      {/* Düzenle / Sil eylemleri */}
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <TouchableOpacity onPress={() => onEdit(item.id, item.text)} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
          <PencilSimple size={16} color={colors.textMuted} />
          <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: 12, marginLeft: 6, color: colors.textMuted }}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Trash size={16} color={colors.textMuted} />
          <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: 12, marginLeft: 6, color: colors.textMuted }}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// İstatistikleri gösteren kartlar
const StatCard = ({ icon: Icon, value, label, colors, isActive = false }: { icon: any; value: number; label: string; colors: any; isActive?: boolean }) => {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 12,
      backgroundColor: isActive ? colors.primaryButton + '20' : 'transparent',
      borderRadius: 16,
      marginHorizontal: 4,
    }}>
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: isActive ? colors.primaryButton : colors.textMuted + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <Icon size={18} color={isActive ? colors.primaryButton : colors.textMuted} weight="fill" />
      </View>
      <Text style={{
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 16,
        color: isActive ? colors.primaryButton : colors.textDark,
        marginBottom: 4,
      }}>{value}</Text>
      <Text style={{
        fontFamily: 'Nunito-Regular',
        fontSize: 10,
        color: isActive ? colors.primaryButton : colors.textMuted,
        textAlign: 'center',
      }}>{label}</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOutUser } = useAuth();
  const { showFeedback, showConfirm } = useFeedback();
  const { top: safeTop, bottom: safeBottom } = useSafeArea();
  const { isSmallDevice, isTablet } = useResponsive();
  
  const [userData, setUserData] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ postCount: 0, likeCount: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const styles = useMemo(() => getStyles(colors, safeTop, safeBottom, isSmallDevice, isTablet), [colors, safeTop, safeBottom, isSmallDevice, isTablet]);
  
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
        renderItem={({ item }) => (
          <ProfilePostCard 
            item={item} 
            colors={colors} 
            onEdit={(id, currentText) => {
              setEditingId(id);
              setEditingText(currentText);
            }}
            onDelete={async (id) => {
              const ok = await showConfirm({ title: 'Paylaşımı Sil', message: 'Silmek istediğinize emin misiniz?', confirmText: 'Sil', cancelText: 'İptal', type: 'info' });
              if (!ok) return;
              try {
                await deleteDoc(doc(db, 'posts', id));
                showFeedback({ message: 'Paylaşım silindi', type: 'info' });
              } catch (e) {
                showFeedback({ message: 'Silme sırasında hata oluştu', type: 'error' });
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserIcon size={isSmallDevice ? 32 : 40} color={colors.header} weight="fill" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userData?.username || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Link href="/profile/edit" asChild>
          <TouchableOpacity style={styles.editButton}>
            <PencilSimple size={isSmallDevice ? 18 : 20} color={colors.textDark} />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.statsContainer}>
        <StatCard 
          icon={Note} 
          value={stats.postCount} 
          label="Yazı" 
          colors={colors} 
          isActive={stats.postCount >= Math.max(stats.postCount, stats.likeCount, stats.favoriteCount)}
        />
        <StatCard 
          icon={Heart} 
          value={stats.likeCount} 
          label="Beğeni" 
          colors={colors} 
          isActive={stats.likeCount >= Math.max(stats.postCount, stats.likeCount, stats.favoriteCount)}
        />
        <StatCard 
          icon={Star} 
          value={stats.favoriteCount} 
          label="Favori" 
          colors={colors} 
          isActive={stats.favoriteCount >= Math.max(stats.postCount, stats.likeCount, stats.favoriteCount)}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Paylaşımların</Text>
        {renderContent()}
      </View>
    
      <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
        <SignOut size={isSmallDevice ? 18 : 20} color="#D9534F" />
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Düzenleme Modalı */}
      <Modal
        visible={!!editingId}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingId(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxWidth: 420, backgroundColor: colors.card, borderRadius: 16, padding: 20 }}>
            <Text style={{ fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, marginBottom: 12 }}>Paylaşımı Düzenle</Text>
            <TextInput
              value={editingText}
              onChangeText={setEditingText}
              placeholder="Metni güncelle..."
              multiline
              textAlignVertical="top"
              style={{ minHeight: 120, borderWidth: 1, borderColor: colors.textMuted + '40', borderRadius: 12, padding: 12, color: colors.textDark, fontFamily: 'Nunito-Regular' }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setEditingId(null)} style={{ paddingVertical: 10, paddingHorizontal: 16, marginRight: 10 }}>
                <Text style={{ fontFamily: 'Nunito-SemiBold', color: colors.textMuted }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!editingId) return;
                  const trimmed = editingText.trim();
                  if (trimmed.length === 0) { setEditingId(null); return; }
                  try {
                    await updateDoc(doc(db, 'posts', editingId), { text: trimmed, updatedAt: new Date() });
                    showFeedback({ message: 'Paylaşım güncellendi', type: 'success' });
                  } catch (e) {
                    showFeedback({ message: 'Güncelleme sırasında hata oluştu', type: 'error' });
                  } finally {
                    setEditingId(null);
                  }
                }}
                style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: colors.header, borderRadius: 10 }}
              >
                <Text style={{ fontFamily: 'Nunito-Bold', color: colors.textLight }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any, safeTop: number, safeBottom: number, isSmallDevice: boolean, isTablet: boolean) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 0 : safeTop,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: Platform.OS === 'ios' ? safeTop + 20 : safeTop + 16, 
    paddingHorizontal: 24, 
    paddingBottom: 20,
  },
  avatar: { 
    width: isSmallDevice ? 60 : 80, 
    height: isSmallDevice ? 60 : 80, 
    borderRadius: isSmallDevice ? 30 : 40, 
    backgroundColor: colors.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    ...getPlatformShadow(4, colors.shadow),
  },
  userInfo: {
    flex: 1,
  },
  name: { 
    fontFamily: 'Nunito-ExtraBold', 
    fontSize: isSmallDevice ? 20 : 26, 
    color: colors.textDark,
    lineHeight: isSmallDevice ? 24 : 32,
  },
  email: { 
    fontFamily: 'Nunito-Regular', 
    fontSize: isSmallDevice ? 12 : 13, 
    color: colors.textMuted, 
    marginTop: 4,
  },
  editButton: { 
    backgroundColor: colors.card, 
    padding: 10, 
    borderRadius: 20,
    borderWidth: 1, 
    borderColor: colors.textMuted + '33',
    ...getPlatformShadow(2, colors.shadow),
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginHorizontal: 24, 
    marginBottom: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    ...getPlatformShadow(3, colors.shadow),
  },
  contentContainer: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 10,
  },
  sectionTitle: { 
    fontFamily: 'Nunito-Bold', 
    fontSize: isSmallDevice ? 16 : 18, 
    color: colors.textDark, 
    marginBottom: 16,
  },
  emptyText: { 
    fontFamily: 'Nunito-SemiBold', 
    color: colors.textMuted, 
    textAlign: 'center', 
    marginTop: 50,
    fontSize: 14,
  },
  postCard: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    padding: 18, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.textMuted + '22',
    ...getPlatformShadow(2, colors.shadow),
  },
  postText: { 
    fontFamily: 'Nunito-Regular', 
    fontSize: 16, 
    color: colors.textDark, 
    lineHeight: 24,
  },
  anonymousIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8,
  },
  anonymousText: { 
    fontFamily: 'Nunito-SemiBold', 
    fontSize: 12, 
    color: colors.textMuted, 
    marginLeft: 6,
  },
  signOutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    marginHorizontal: 24, 
    borderRadius: 12, 
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? safeBottom + 10 : 10,
    backgroundColor: colors.card,
    ...getPlatformShadow(2, colors.shadow),
  },
  signOutText: { 
    fontFamily: 'Nunito-Bold', 
    fontSize: 16, 
    color: "#D9534F", 
    marginLeft: 8,
  },
});

