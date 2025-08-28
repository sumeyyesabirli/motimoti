// app/(tabs)/profile.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, FlatList, Platform, TextInput, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import { usePosts } from '../../context/PostsContext';
import * as postsService from '../../services/posts';
import { getUserProfile } from '../../services/users';
import { SignOut, PencilSimple, User as UserIcon, UserCircle, Trash, CheckCircle, XCircle } from 'phosphor-react-native';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useResponsive, useSafeArea, getPlatformShadow } from '../../hooks/useResponsive';

// Profildeki küçük yazı kartları - Inline düzenleme ile
const ProfilePostCard = ({ 
  item, 
  colors, 
  isEditing,
  editedText,
  onSetEditedText,
  onStartEdit,
  onSave,
  onCancel,
  onDelete 
}: { 
  item: any; 
  colors: any; 
  isEditing: boolean;
  editedText: string;
  onSetEditedText: (text: string) => void;
  onStartEdit: (id: string, currentText: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void; 
}) => {
  const isAnonymous = typeof item?.authorName === 'string' && item.authorName.startsWith('Anonim');
  
  return (
         <View style={{
       backgroundColor: colors.card,
       borderRadius: 16,
       padding: 18,
       marginBottom: 12,
       borderWidth: 1,
       borderColor: isEditing 
         ? colors.primaryButton + '80' 
         : isAnonymous 
           ? colors.primaryButton + '40' 
           : colors.textMuted + '22',
       // Düzenleme modunda çerçeveyi daha belirgin ama şık yapalım
       shadowColor: isEditing ? colors.primaryButton : isAnonymous ? colors.primaryButton : '#000',
       shadowOffset: { width: 0, height: isEditing ? 2 : 0 },
       shadowOpacity: isEditing ? 0.2 : isAnonymous ? 0.1 : 0,
       shadowRadius: isEditing ? 4 : 0,
       elevation: isEditing ? 4 : 0,
     }}>
      
      {isEditing ? (
        // YENİ VE ŞIK DÜZENLEME MODU GÖRÜNÜMÜ
        <>
          <TextInput
            value={editedText}
            onChangeText={onSetEditedText}
            multiline
            autoFocus={true}
            style={{
              fontFamily: 'Nunito-Regular',
              fontSize: 16,
              color: colors.textDark,
              lineHeight: 24,
              padding: 0, // İç boşluğu kaldır
              marginBottom: 20, // Butonlarla arasına boşluk koy
              minHeight: 80,   // Minimum yükseklik ver
              backgroundColor: colors.background, // Hafif farklı bir arka plan
              paddingHorizontal: 12, // Yatayda iç boşluk
              paddingVertical: 8,    // Dikeyde iç boşluk
              borderRadius: 12,      // Kenarları yuvarlat
            }}
          />
          {/* Aksiyon Barı */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <TouchableOpacity onPress={onCancel} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'Nunito-SemiBold', color: colors.textMuted, fontSize: 14 }}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onSave} 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primaryButton, 
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 20, // Tam yuvarlak buton
                marginLeft: 10,
              }}
            >
              <CheckCircle size={16} color={colors.textLight} weight="bold" />
              <Text style={{ fontFamily: 'Nunito-Bold', color: colors.textLight, marginLeft: 6, fontSize: 14 }}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // NORMAL GÖRÜNÜM (Aynı kalıyor)
        <>
                     {isAnonymous && (
             <View style={{
               flexDirection: 'row',
               alignItems: 'center',
               marginBottom: 8,
               paddingHorizontal: 8,
               paddingVertical: 4,
               backgroundColor: colors.primaryButton + '15',
               borderRadius: 8,
               alignSelf: 'flex-start',
             }}>
               <UserCircle size={16} color={colors.primaryButton} />
               <Text style={{
                 fontFamily: 'Nunito-SemiBold',
                 fontSize: 12,
                 color: colors.primaryButton,
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

          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <TouchableOpacity 
              onPress={() => onStartEdit(item.id, item.text)} 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginRight: 16,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: colors.mode === 'dark' ? colors.header + '25' : colors.header + '15',
              }}
            >
              <PencilSimple size={16} color={colors.textMuted} />
              <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: 12, marginLeft: 6, color: colors.textMuted }}>Düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onDelete(item.id)} 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: colors.mode === 'dark' ? '#FF4444' + '25' : '#FF4444' + '25',
              }}
            >
              <Trash size={16} color={colors.textMuted} />
              <Text style={{ fontFamily: 'Nunito-SemiBold', fontSize: 12, marginLeft: 6, color: colors.textMuted }}>Sil</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

    </View>
  );
};

// Twitter tarzı minimal istatistikler
const StatMinimal = ({ 
  stats, 
  colors, 
  router, 
  showAnonymousPosts, 
  onTogglePosts 
}: { 
  stats: any; 
  colors: any; 
  router: any;
  showAnonymousPosts: boolean;
  onTogglePosts: () => void;
}) => {
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
        <TouchableOpacity 
          style={{ 
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: showAnonymousPosts ? colors.primaryButton + '15' : 'transparent',
          }}
          onPress={onTogglePosts}
        >
          <Text style={{
            fontFamily: 'Nunito-ExtraBold',
            fontSize: 18,
            color: colors.textDark,
          }}>{stats.postCount}</Text>
          <Text style={{
            fontFamily: 'Nunito-SemiBold',
            fontSize: 14,
            color: showAnonymousPosts ? colors.primaryButton : colors.textMuted,
          }}>
            {showAnonymousPosts ? 'Anonim' : 'Yazı'}
          </Text>
        </TouchableOpacity>
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
  const [postToDelete, setPostToDelete] = useState<any>(null);
  
  // Yeni inline düzenleme state'leri
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [currentEditText, setCurrentEditText] = useState<string>('');
  
  // İstatistik toggle state'i
  const [showAnonymousPosts, setShowAnonymousPosts] = useState(false);

  // Header animasyonu için
  const headerOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(250); // Profile header'ın başlangıç yüksekliği - artırıldı
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      height: headerHeight.value,
      transform: [{ translateY: headerHeight.value === 0 ? -50 : 0 }],
    };
  });

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
          
                     // Tüm postları göster - anonim ve normal
           const allPosts = userPosts.data;
           
           // Toggle durumuna göre postları filtrele
           const filteredPosts = showAnonymousPosts 
             ? allPosts.filter(post => post.isAnonymous) // Sadece anonim
             : allPosts.filter(post => !post.isAnonymous); // Sadece normal
           
           console.log('🔍 Profile post filtreleme:', {
             toplam: allPosts.length,
             anonimKendi: allPosts.filter(p => p.isAnonymous).length,
             normalKendi: allPosts.filter(p => !p.isAnonymous).length,
             toggleDurumu: showAnonymousPosts ? 'Anonim' : 'Normal',
             gosterilen: filteredPosts.length,
             not: 'Artık kendi profilinde de anonim paylaşımlar görünür!'
           });
           
           setPosts(filteredPosts);

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

                     // Toggle durumuna göre post sayısını ayarla
           const postCount = showAnonymousPosts 
             ? allPosts.filter(post => post.isAnonymous).length
             : allPosts.filter(post => !post.isAnonymous).length;
           
           setStats({
             postCount: postCount,
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
    }, [user, token, showFeedback, showAnonymousPosts])
  );



  const handleDelete = useCallback(async () => {
    if (!postToDelete || !token) return;
    
    try {
      await postsService.deletePost(postToDelete.id);
      showFeedback({ message: 'Paylaşım başarıyla silindi!', type: 'success' });
      setPostToDelete(null);
      
      // Posts listesini güncelle
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete.id));
      setStats(prevStats => ({ ...prevStats, postCount: prevStats.postCount - 1 }));
    } catch (error) {
      console.error('Error deleting post:', error);
      showFeedback({ message: 'Paylaşım silinirken hata oluştu!', type: 'error' });
    }
  }, [postToDelete, token, showFeedback]);

  // Yeni inline düzenleme fonksiyonları
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setCurrentEditText('');
  };

  const handleSaveEdit = async () => {
    if (!editingPostId || !currentEditText.trim()) return;

    try {
      await postsService.updatePost(editingPostId, { text: currentEditText.trim() });
      showFeedback({ message: 'Paylaşım güncellendi', type: 'success' });

      // Lokal state'i güncelle
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === editingPostId 
            ? { ...post, text: currentEditText.trim() }
            : post
        )
      );
    } catch (error) {
      console.error('Update error:', error);
      showFeedback({ message: 'Güncelleme sırasında hata oluştu', type: 'error' });
    } finally {
      // Düzenleme modundan çık
      handleCancelEdit();
    }
  };



  // Scroll handler - header'ı gizle/göster
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (offsetY > 100) {
      // Header'ı gizle
      headerOpacity.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerHeight.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    } else {
      // Header'ı göster
      headerOpacity.value = withSpring(1, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerHeight.value = withSpring(250, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
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
               <StatMinimal 
                 stats={stats} 
                 colors={colors} 
                 router={router}
                 showAnonymousPosts={showAnonymousPosts}
                 onTogglePosts={() => setShowAnonymousPosts(!showAnonymousPosts)}
               />
             </View>
          </Animated.View>

          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Paylaşımların</Text>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginTop: 40 }} />
            ) : posts.length === 0 ? (
              <Text style={styles.emptyText}>Henüz bir paylaşımın yok.</Text>
            ) : (
              posts.map((item) => (
                <ProfilePostCard 
                  key={item.id}
                  item={item} 
                  colors={colors} 
                  isEditing={item.id === editingPostId}
                  editedText={currentEditText}
                  onSetEditedText={setCurrentEditText}
                  onStartEdit={(id, currentText) => {
                    setEditingPostId(id);
                    setCurrentEditText(currentText);
                  }}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onDelete={async (id) => {
                    setPostToDelete(item);
                    const confirmed = await showConfirm({
                      title: 'Paylaşımı Sil',
                      message: 'Silmek istediğinize emin misiniz?',
                      confirmText: 'SİL',
                      cancelText: 'İPTAL',
                    });
                    if (!confirmed) {
                      setPostToDelete(null);
                      return;
                    }
                    await handleDelete();
                  }}
                />
              ))
            )}
          </View>
        </ScrollView>
      
        <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
          <SignOut size={isSmallDevice ? 18 : 20} color="#D9534F" />
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </TouchableOpacity>


              </SafeAreaView>
    );
}

const getStyles = (colors: any, safeTop: number, safeBottom: number, isSmallDevice: boolean, isTablet: boolean) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 0 : safeTop,
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: colors.background,
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
    marginBottom: Platform.OS === 'ios' ? safeBottom + 90 : 90,
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

