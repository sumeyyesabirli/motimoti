// app/(tabs)/profile.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Platform, Alert, Modal, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import * as postsService from '../../services/posts';
import { getUserProfile } from '../../services/users';
import { SignOut, PencilSimple, User as UserIcon, UserCircle, Trash } from 'phosphor-react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useResponsive, useSafeArea, spacing, fontSizes, getPlatformShadow, borderRadius } from '../../hooks/useResponsive';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

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

// Twitter tarzı minimal istatistikler
const StatMinimal = ({ stats, colors, router }: { stats: any; colors: any; router: any }) => {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.textMuted + '22',
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontFamily: 'Nunito-ExtraBold',
            fontSize: 18,
            color: colors.textDark,
          }}>{stats.postCount}</Text>
          <Text style={{
            fontFamily: 'Nunito-SemiBold',
            fontSize: 14,
            color: colors.textMuted,
          }}>Yazı</Text>
        </View>
        <View style={{
          width: 1,
          height: '80%',
          backgroundColor: colors.textMuted + '22',
        }} />
        <TouchableOpacity 
          style={{ alignItems: 'center' }}
          onPress={() => {
            console.log('📊 Beğendiklerim sayfasına gidiliyor');
            router.push('/user-likes');
          }}
        >
          <Text style={{
            fontFamily: 'Nunito-ExtraBold',
            fontSize: 18,
            color: colors.textDark,
          }}>{stats.likeCount}</Text>
          <Text style={{
            fontFamily: 'Nunito-SemiBold',
            fontSize: 14,
            color: colors.primaryButton,
          }}>Beğendiklerim</Text>
        </TouchableOpacity>
        <View style={{
          width: 1,
          height: '80%',
          backgroundColor: colors.textMuted + '22',
        }} />
        <TouchableOpacity 
          style={{ alignItems: 'center' }}
          onPress={() => {
            console.log('📊 Favorilerim sayfasına gidiliyor');
            router.push('/user-favorites');
          }}
        >
          <Text style={{
            fontFamily: 'Nunito-ExtraBold',
            fontSize: 18,
            color: colors.textDark,
          }}>{stats.favoriteCount}</Text>
          <Text style={{
            fontFamily: 'Nunito-SemiBold',
            fontSize: 14,
            color: colors.primaryButton,
          }}>Favorilerim</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, token, signOutUser } = useAuth();
  const { showFeedback, showConfirm } = useFeedback();
  const router = useRouter();
  const { posts: globalPosts } = usePosts();
  const { top: safeTop, bottom: safeBottom } = useSafeArea();
  const { isSmallDevice, isTablet } = useResponsive();
  
  const [userData, setUserData] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ postCount: 0, likeCount: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<any>(null);

  const styles = useMemo(() => getStyles(colors, safeTop, safeBottom, isSmallDevice, isTablet), [colors, safeTop, safeBottom, isSmallDevice, isTablet]);
  
  // Global postlardan gerçek zamanlı istatistikleri hesapla
  useMemo(() => {
    if (!user || !globalPosts.length) return;
    
    const userLikedCount = globalPosts.filter(post => 
      post.likedBy?.includes(user.id)
    ).length;
    
    const userFavoriteCount = globalPosts.filter(post => 
      post.favoritedBy?.includes(user.id)
    ).length;
    
    console.log('🔄 Gerçek zamanlı istatistik güncelleme:', {
      userLikedCount,
      userFavoriteCount,
      globalPostsCount: globalPosts.length
    });
    
    setStats(prevStats => ({
      ...prevStats,
      likeCount: userLikedCount,
      favoriteCount: userFavoriteCount
    }));
    
  }, [globalPosts, user]);
  
  useFocusEffect(
    useCallback(() => {
      if (!user || !token) return;
      
      setLoading(true);
        
      const fetchAllData = async () => {
        try {
          // Kullanıcı bilgilerini getir
          const userProfile = await getUserProfile(user.id);
          setUserData(userProfile.data);

          // Kullanıcının gönderilerini getir (anonim olanları hariç)
          const userPosts = await postsService.getUserPosts(user.id);
          
          // Kendi profilinde anonim paylaşımları gösterme
          const publicPosts = userPosts.data.filter(post => !post.isAnonymous);
          
          console.log('🔍 Profile post filtreleme:', {
            toplam: userPosts.data.length,
            anonimKendi: userPosts.data.filter(p => p.isAnonymous).length,
            publicGosterilen: publicPosts.length
          });
          
          setPosts(publicPosts);

          // İstatistikleri hesapla - kullanıcının beğeni ve favori sayıları
          // API'den gerçek beğeni ve favori sayılarını al
          let userLikedCount = 0;
          let userFavoriteCount = 0;
          
          try {
            // Kullanıcının beğendiği postları say
            const likedPosts = await postsService.getLikedPosts();
            userLikedCount = likedPosts.success ? (likedPosts.data?.length || 0) : 0;
            
            // Kullanıcının favorilediği postları say  
            const favoritePosts = await postsService.getFavoritePosts();
            userFavoriteCount = favoritePosts.success ? (favoritePosts.data?.length || 0) : 0;
            
            console.log('📊 Profile istatistikleri:', {
              postCount: userPosts.data.length,
              userLikedCount,
              userFavoriteCount
            });
            
          } catch (error) {
            console.error('İstatistik hesaplanırken hata:', error);
          }

          setStats({
            postCount: userPosts.data.length,
            likeCount: userLikedCount,        // Kullanıcının beğendiği post sayısı
            favoriteCount: userFavoriteCount, // Kullanıcının favorilediği post sayısı
          });
        } catch (error) {
          console.error('Veri yüklenirken hata:', error);
          showFeedback({ message: 'Veriler yüklenirken hata oluştu', type: 'error' });
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }, [user, token, showFeedback])
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
            onDelete={(id) => {
              setPostToDelete(item);
              setDeleteModalVisible(true);
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    );
  };

  const handleDelete = useCallback(async () => {
    if (!postToDelete || !token) return;
    
    try {
      await postsService.deletePost(postToDelete.id);
      showFeedback({ message: 'Paylaşım başarıyla silindi!', type: 'success' });
      setDeleteModalVisible(false);
      setPostToDelete(null);
      
      // Posts listesini güncelle
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
      setStats(prevStats => ({ ...prevStats, postCount: prevStats.postCount - 1 }));
    } catch (error) {
      console.error('Error deleting post:', error);
      showFeedback({ message: 'Paylaşım silinirken hata oluştu!', type: 'error' });
    }
  }, [postToDelete, token, showFeedback]);

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim() || !token) return;
    
    try {
      await postsService.updatePost(editingId, { text: editingText.trim() });
      showFeedback({ message: 'Paylaşım güncellendi', type: 'success' });
      
      // Posts listesini güncelle
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === editingId 
            ? { ...post, text: editingText.trim() }
            : post
        )
      );
    } catch (error) {
      console.error('Update error:', error);
      showFeedback({ message: 'Güncelleme sırasında hata oluştu', type: 'error' });
    } finally {
      setEditingId(null);
      setEditingText('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserIcon size={isSmallDevice ? 32 : 40} color={colors.header} weight="fill" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userData?.username || user?.username || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Link href="/profile/edit" asChild>
          <TouchableOpacity style={styles.editButton}>
            <PencilSimple size={isSmallDevice ? 18 : 20} color={colors.textDark} />
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.statsContainer}>
        <StatMinimal stats={stats} colors={colors} router={router} />
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
                onPress={handleSaveEdit}
                style={{ paddingVertical: 10, paddingHorizontal: 16, backgroundColor: colors.header, borderRadius: 10 }}
              >
                <Text style={{ fontFamily: 'Nunito-Bold', color: colors.textLight }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Silme Onay Modalı */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        title="Paylaşımı Sil"
        message="Silmek istediğinize emin misiniz?"
        confirmText="SİL"
        cancelText="İPTAL"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setPostToDelete(null);
        }}
      />
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
    marginHorizontal: 24, 
    marginBottom: 24,
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

