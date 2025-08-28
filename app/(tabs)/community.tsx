// app/(tabs)/community.tsx
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import * as postsService from '../../services/posts';
import { Heart, Plus, Star } from 'phosphor-react-native';
import React, { useMemo, useEffect } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { usePosts } from '../../context/PostsContext';
import { usePagination } from '../../hooks/usePagination';
import { PaginatedFlatList } from '../../components/PaginatedFlatList';

// Post type'ını tanımla
interface Post {
  id: string; // UUID format: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
  text: string;
  authorName?: string;
  authorId?: string | null; // UUID format: 550e8400-e29b-41d4-a716-446655440000 (anonim ise null)
  createdAt: any;
  likedBy?: string[]; // UUID array: ["550e8400-e29b-41d4-a716-446655440000", ...]
  likeCount?: number;
  favoritedBy?: string[]; // UUID array: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", ...]
  favoriteCount?: number;
  isAnonymous?: boolean; // Anonim paylaşım kontrolü
}

// Zamanı dinamik olarak formatlayan yardımcı fonksiyon
const timeAgo = (timestamp: any) => {
  if (!timestamp?.toDate) return 'az önce';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: false, locale: tr }) + ' önce';
};

// Renk alfa değerini ayarlayan yardımcı fonksiyon
const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

// Paylaşım kartı - Toplulukta yalnızca etkileşim (beğeni/favori)
const PostCard = ({ item, colors, onLike, onFavorite, userId, isLast, localLikes, localFavorites }: { 
  item: Post; 
  colors: any; 
  onLike: any; 
  onFavorite: any; 
  userId: any; 
  isLast: boolean;
  localLikes: Set<string>;
  localFavorites: Set<string>;
}) => {
  const router = useRouter();
  const styles = getStyles(colors);
  
  // Local state'leri kullan (optimistic updates için)
  const isLiked = localLikes.has(item.id) || item.likedBy?.includes(userId);
  const isFavorited = localFavorites.has(item.id) || (item.favoritedBy || [])?.includes(userId);
  
  // Count'ları doğrudan array length'lerden al - API'den geliyor zaten
  const actualLikeCount = item.likedBy?.length || 0;
  const actualFavoriteCount = item.favoritedBy?.length || 0;
  
  // Local state'lerden optimistic updates için count'ları güncelle
  const finalLikeCount = actualLikeCount + (localLikes.has(item.id) ? 1 : 0) - (item.likedBy?.includes(userId) && !localLikes.has(item.id) ? 1 : 0);
  const finalFavoriteCount = actualFavoriteCount + (localFavorites.has(item.id) ? 1 : 0) - (item.favoritedBy?.includes(userId) && !localFavorites.has(item.id) ? 1 : 0);
  
  // Yanıp sönen animasyon için
  const pulseValue = useSharedValue(1);
  
  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // Sonsuz tekrar
      true // Reverse
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseValue.value,
      transform: [{ scale: 0.8 + (pulseValue.value * 0.2) }],
    };
  });

  return (
    <View style={styles.postContainer}>
      {/* Post içeriği */}
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <View style={[styles.authorAvatar, item.isAnonymous && styles.authorAvatarAnonymous]}>
            <Text style={styles.authorInitial}>
              {item.isAnonymous ? '🎭' : (item.authorName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.authorInfo, item.isAnonymous && styles.authorInfoAnonymous]}
            onPress={() => {
              // Anonim paylaşımlar için profil linkini devre dışı bırak
              if (item.isAnonymous) {
                console.log('🎭 Anonim paylaşım - profil erişimi engellendi');
                return;
              }
              
              if (item.authorId) {
                console.log('👤 Kullanıcı profiline gidiliyor:', item.authorId);
                router.push(`/user-posts/${item.authorId}`);
              } else {
                console.log('⚠️ AuthorId yok - profil erişimi mümkün değil');
              }
            }}
          >
            <Text style={styles.postAuthor}>{item.authorName || 'Anonim'}</Text>
            <Text style={styles.postTimestamp}>{timeAgo(item.createdAt)}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.postText}>{item.text}</Text>
        
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]} 
            onPress={() => {
              console.log('❤️ KALP BASILDI:', {
                postId: item.id.substring(0, 8) + '...',
                isLiked,
                willToggleTo: !isLiked
              });
              onLike(item.id, isLiked);
            }}
            disabled={false}
          >
            <Heart 
              size={16} 
              color={isLiked ? colors.header : colors.textMuted} 
              weight={isLiked ? 'fill' : 'regular'} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {finalLikeCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, isFavorited && styles.favoritedButton]} 
            onPress={() => {
              console.log('⭐ YILDIZ BASILDI:', {
                postId: item.id.substring(0, 8) + '...',
                isFavorited,
                willToggleTo: !isFavorited
              });
              onFavorite(item.id, isFavorited);
            }}
            disabled={false}
          >
            <Star 
              size={16} 
              color={isFavorited ? '#FFD700' : colors.textMuted} 
              weight={isFavorited ? 'fill' : 'regular'} 
            />
            <Text style={[styles.actionText, isFavorited && styles.favoritedText]}>
              {finalFavoriteCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Alt timeline çizgisi */}
      {!isLast && (
        <View style={styles.bottomTimelineContainer}>
          <View style={styles.bottomTimelineLine} />
          <Animated.View style={[styles.bottomTimelineDot, pulseStyle]} />
        </View>
      )}
    </View>
  );
};

export default function CommunityScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, token } = useAuth();
  const { showFeedback } = useFeedback();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  // Pagination hook kullan
  const {
    data: posts,
    loading,
    pagination,
    loadMore,
    refresh,
    canLoadMore,
    error
  } = usePagination('posts', undefined, 10);
  
  // Global posts context'ten sadece gerekli fonksiyonları al
  const { updatePost } = usePosts();
  
  // Pagination hook otomatik olarak ilk sayfayı yükler
  // loadPosts ve refreshPosts fonksiyonları artık gerekli değil

  // Header animasyonu için
  const headerHeight = useSharedValue(120);
  const headerOpacity = useSharedValue(1);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerOpacity.value,
      transform: [{ translateY: headerHeight.value === 0 ? -20 : 0 }],
    };
  });

  // İlk yükleme - pagination hook otomatik olarak yükler
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 CommunityScreen useFocusEffect triggered');
      console.log('👤 User:', user?.id);
      if (!user) {
        console.log('❌ No user, returning');
        return;
      }
      console.log('✅ Pagination hook otomatik olarak posts yükleyecek');
    }, [user])
  );

  // Debug: Posts verisini kontrol et - kaldırıldı

  // Local like/favorite state'lerini posts verisi ile senkronize et
  useEffect(() => {
    if (posts && posts.length > 0 && user) {
      // Local state'ler senkronize ediliyor
      
      const newLocalLikes = new Set<string>();
      const newLocalFavorites = new Set<string>();
      
      posts.forEach(post => {
        if (post.likedBy?.includes(user.id)) {
          newLocalLikes.add(post.id);
        }
        if (post.favoritedBy?.includes(user.id)) {
          newLocalFavorites.add(post.id);
        }
      });
      
      setLocalLikes(newLocalLikes);
      setLocalFavorites(newLocalFavorites);
      
      // Local state'ler güncellendi
    }
  }, [posts, user]);

  const [processingLikes, setProcessingLikes] = React.useState<Set<string>>(new Set());
  const [processingFavorites, setProcessingFavorites] = React.useState<Set<string>>(new Set());
  
  // Local like/favorite state'leri
  const [localLikes, setLocalLikes] = React.useState<Set<string>>(new Set());
  const [localFavorites, setLocalFavorites] = React.useState<Set<string>>(new Set());

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    // Çifte tıklama önleme
    if (processingLikes.has(postId)) {
      return;
    }
        
    setProcessingLikes(prev => new Set(prev).add(postId));
    
    try {
      // Önce UI'ı hemen güncelle (optimistic update)
      if (isLiked) {
        setLocalLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLocalLikes(prev => new Set(prev).add(postId));
      }
      
      // Sonra API'yi çağır
      let apiResponse;
      if (isLiked) {
        console.log('🔄 API: Unlike post çağrılıyor...');
        apiResponse = await postsService.unlikePost(postId);
      } else {
        console.log('🔄 API: Like post çağrılıyor...');
        apiResponse = await postsService.likePost(postId);
      }
      
      // API başarılı mı kontrol et
      if (apiResponse?.success) {
        console.log(`✅ Like API başarılı`);
        
        // API'den gelen güncel data ile pagination state'ini güncelle
        if (apiResponse?.data) {
          console.log('🔄 LIKE SYNC: API response alındı');
          
          // Pagination state'ini güncelle
          // Bu kısım pagination hook'unda otomatik olarak yapılacak
        }
      } else {
        throw new Error(apiResponse?.message || 'API işlemi başarısız');
      }
      
    } catch (error: any) {
      console.error('❌ BEĞENI API HATASI:', {
        postId: postId.substring(0, 8) + '...',
        errorMessage: error.message,
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        'rollbackYapılıyor': '🔄'
      });
      
      // Hata durumunda local state'i geri al
      if (isLiked) {
        setLocalLikes(prev => new Set(prev).add(postId));
      } else {
        setLocalLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      
      showFeedback({ 
        message: `Beğeni işlemi başarısız: ${error.response?.status || 'Network'} Error`, 
        type: 'error' 
      });
    } finally {
      // Processing state'ini temizle
      setProcessingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleFavorite = async (postId: string, isFavorited: boolean) => {
    if (!user) return;
    
    // Çifte tıklama önleme
    if (processingFavorites.has(postId)) {
      console.log('⚠️ FAVORITE: İşlem devam ediyor, atlanıyor');
          return;
        }
        
    setProcessingFavorites(prev => new Set(prev).add(postId));
    
    console.log(`⭐ ${isFavorited ? 'Unfavorite' : 'Favorite'}: ${postId.substring(0, 8)}...`);
    
    try {
      // Önce UI'ı hemen güncelle (optimistic update)
      if (isFavorited) {
        setLocalFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        setLocalFavorites(prev => new Set(prev).add(postId));
      }
      
      // Sonra API'yi çağır
      let apiResponse;
      if (isFavorited) {
        console.log('🔄 API: Unfavorite post çağrılıyor...');
        apiResponse = await postsService.unfavoritePost(postId);
      } else {
        console.log('🔄 API: Favorite post çağrılıyor...');
        apiResponse = await postsService.favoritePost(postId);
      }
      
      console.log('📊 API RESPONSE (Favorite/Unfavorite):', {
        success: apiResponse?.success,
        message: apiResponse?.message,
        data: apiResponse?.data ? 'var' : 'yok',
        postId: postId.substring(0, 8) + '...'
      });
      
      if (apiResponse?.success) {
        console.log('✅ FAVORITE: API başarılı, favori kalıcı olarak kaydedildi');
        
        // API'den gelen güncel data ile pagination state'ini güncelle
        if (apiResponse?.data) {
          console.log('🔄 FAVORITE SYNC: API response alındı');
          
          // Pagination state'ini güncelle
          // Bu kısım pagination hook'unda otomatik olarak yapılacak
        }
      } else {
        throw new Error(apiResponse?.message || 'API işlemi başarısız');
      }
      
    } catch (error: any) {
      console.error('❌ FAVORİ API HATASI:', {
        postId: postId.substring(0, 8) + '...',
        errorMessage: error.message,
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        'rollbackYapılıyor': '🔄'
      });
      
      // Hata durumunda local state'i geri al
      if (isFavorited) {
        setLocalFavorites(prev => new Set(prev).add(postId));
      } else {
        setLocalFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
      
      showFeedback({ 
        message: `Favori işlemi başarısız: ${error.response?.status || 'Network'} Error`, 
        type: 'error' 
      });
    } finally {
      // Processing state'ini temizle
      setProcessingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 5) {
      // Header'ı gizle ama bildirimler görünsün
      headerHeight.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerOpacity.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    } else {
      // Header'ı göster
      headerHeight.value = withSpring(120, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerOpacity.value = withSpring(1, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Topluluk Alanı</Text>
          <Text style={styles.headerSubtitle}>Giriş yaparak topluluğa katıl</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.noUserText}>Topluluğa katılmak için giriş yapmalısın</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderPost = ({ item, index }: { item: Post; index: number }) => {
    return (
      <PostCard 
        item={item} 
        colors={colors} 
        onLike={handleLike} 
        onFavorite={handleFavorite}
        userId={user.id} 
        isLast={index === posts.length - 1}
        localLikes={localLikes}
        localFavorites={localFavorites}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Topluluk Alanı</Text>
        <Text style={styles.headerSubtitle}>Birbirinize ilham verin</Text>
      </Animated.View>
      
      {loading && posts.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primaryButton} style={{ flex: 1 }} />
      ) : (
        <PaginatedFlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          loading={loading}
          pagination={pagination}
          onLoadMore={loadMore}
          onRefresh={refresh}
          canLoadMore={canLoadMore}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.noPostsText}>Henüz paylaşım yok</Text>
              <Text style={styles.noPostsSubtext}>İlk paylaşımı sen yap!</Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Toplam gönderi sayısı kaldırıldı */}
            </View>
          }
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

const getStyles = (colors: any) => {
  // Koyu/açık temaya göre daha balanslı alfa
  const isDark =
    (colors?.mode === 'dark') ||
    (colors?.background && typeof colors.background === 'string' && colors.background[0] === '#'
      && parseInt(colors.background.slice(1,3), 16) < 0x80); // kaba kontrol

  const cardBg      = withAlpha(colors.card, isDark ? 0.14 : 0.85);
  const cardBgHover = withAlpha(colors.card, isDark ? 0.18 : 0.90);
  const cardBorder  = withAlpha(colors.textDark ?? '#000', isDark ? 0.10 : 0.06);
  const shadow      = isDark ? 0.22 : 0.12;

  return StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: colors.background,
    },
    header: { 
      paddingTop: 45, 
      paddingBottom: 20, 
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.mode === 'dark' ? colors.header + '20' : '#E0E0E0',
      shadowColor: colors.mode === 'dark' ? colors.header : '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colors.mode === 'dark' ? 0.4 : 0.3,
      shadowRadius: 16,
      elevation: 12,
      height: 120,
    },
    headerTitle: { 
      fontFamily: 'Nunito-ExtraBold', 
      fontSize: 30, 
      color: colors.textDark,
      textAlign: 'center',
      letterSpacing: 0.3,
      marginBottom: 6,
      lineHeight: 36,
    },
    headerSubtitle: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 16, 
      color: colors.textMuted, 
      textAlign: 'center',
      letterSpacing: 0.2,
      opacity: 0.85,
      lineHeight: 20,
    },
    listContainer: { 
      paddingHorizontal: 0, 
      paddingBottom: 120,
      paddingTop: 140,
    },
    postContainer: {
      marginBottom: 8, // 16'dan 8'e düşürdüm
      paddingHorizontal: 16,
    },
    // Base + "hover/pressed" efektini Pressable ile vereceğiz
    postContent: {
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 20,
      // hafif çerçeve ile beyazlığı kır
      borderWidth: 1,
      borderColor: cardBorder,
      // daha yumuşak gölge
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: shadow,
      shadowRadius: 10,
      elevation: 3,
      // Koyu tema için ek efektler
      ...(colors.mode === 'dark' && {
        borderColor: colors.header + '20',
        shadowColor: colors.header,
        shadowOpacity: 0.3,
      }),
    },
    // Hover / pressed efektinde kullanacağımız alternatif (web)
    postContentHover: {
      backgroundColor: cardBgHover,
      borderColor: withAlpha(colors.header, isDark ? 0.30 : 0.18),
      elevation: 5,
    },
    postHeader: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 12 
    },
    authorAvatar: { 
      width: 28, 
      height: 28, 
      borderRadius: 14, 
      backgroundColor: colors.header, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    authorAvatarAnonymous: {
      backgroundColor: colors.textMuted, // Anonim için gri arka plan
    },
    authorInitial: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 12, 
      color: colors.textLight 
    },
    authorInfo: { 
      marginLeft: 10 
    },
    authorInfoAnonymous: {
      opacity: 0.7, // Anonim paylaşımlar için daha şeffaf görünüm
    },
    postAuthor: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 14, 
      color: colors.textDark,
      marginBottom: 2,
    },
    postTimestamp: { 
      fontFamily: 'Nunito-Regular', 
      fontSize: 10, 
      color: colors.textMuted 
    },
    postText: { 
      fontFamily: 'Nunito-Regular', 
      fontSize: 14, 
      color: colors.textDark, 
      lineHeight: 20, 
      marginBottom: 12 
    },
    postFooter: { 
      flexDirection: 'row', 
      borderTopWidth: 0, 
      borderTopColor: 'transparent', 
      paddingTop: 10,
      alignItems: 'center',
      justifyContent: 'space-between' // Like/Favorite sol, Düzenle/Sil sağ
    },
    actionButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginRight: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    actionText: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 11, 
      marginLeft: 4,
      color: colors.textMuted,
    },
    likedButton: { 
      backgroundColor: colors.mode === 'dark' ? colors.header + '25' : colors.header + '15',
      borderWidth: 0,
    },
    likedText: { 
      color: colors.header,
      fontFamily: 'Nunito-Bold',
    },
    favoritedButton: { 
      backgroundColor: colors.mode === 'dark' ? '#FFD700' + '25' : '#FFD700' + '15',
      borderWidth: 0,
    },
    favoritedText: { 
      color: '#FFD700',
      fontFamily: 'Nunito-Bold',
    },
    deleteButton: { 
      backgroundColor: colors.mode === 'dark' ? '#FF4444' + '25' : '#FF4444' + '15',
      borderWidth: 0,
    },
    editButton: { 
      backgroundColor: colors.mode === 'dark' ? colors.header + '25' : colors.header + '15',
      borderWidth: 0,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      marginLeft: 'auto', // Sağa yasla
      gap: 8, // Butonlar arası boşluk
    },
    actionButtonInContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    fab: { 
      position: 'absolute', 
      bottom: 140, 
      right: 30, 
      width: 60, 
      height: 60, 
      borderRadius: 30, 
      backgroundColor: colors.header, 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: colors.mode === 'dark' ? colors.header : colors.header, 
      shadowOffset: { width: 0, height: 5 }, 
      shadowOpacity: colors.mode === 'dark' ? 0.5 : 0.3, 
      shadowRadius: 10, 
      elevation: 10 
    },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    noUserText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center' },
    noPostsText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, textAlign: 'center', marginBottom: 8 },
    noPostsSubtext: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
    bottomTimelineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 8,
    },
    bottomTimelineLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.mode === 'dark' ? colors.header + '40' : colors.header + '30',
      marginRight: 8,
    },
    bottomTimelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.header + '80',
      borderWidth: 2,
      borderColor: colors.header,
      shadowColor: colors.header,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      zIndex: 10000,
    },
    modalTitle: {
      fontFamily: 'Nunito-Bold',
      fontSize: 20,
      color: colors.textDark,
      marginBottom: 16,
    },
    editInput: {
      width: '100%',
      minHeight: 120,
      borderColor: colors.textMuted + '30',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textDark,
      backgroundColor: colors.card + '80',
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButtonCancel: {
      backgroundColor: colors.textMuted + '20',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    modalButtonSave: {
      backgroundColor: colors.header,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    modalButtonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textLight,
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    inlineEditContainer: {
      backgroundColor: colors.mode === 'dark' ? colors.card + '60' : colors.card + '80',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.mode === 'dark' ? colors.header + '30' : colors.textMuted + '30',
      marginBottom: 12,
    },
    inlineEditInput: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textDark,
      minHeight: 100,
      textAlignVertical: 'top',
      paddingBottom: 10,
      backgroundColor: 'transparent',
    },
    inlineEditButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    inlineEditButtonCancel: {
      backgroundColor: colors.mode === 'dark' ? colors.textMuted + '20' : colors.textMuted + '40',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderWidth: 2,
      borderColor: colors.mode === 'dark' ? colors.textMuted + '40' : colors.textMuted + '80',
    },
    inlineEditButtonSave: {
      backgroundColor: colors.header,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    inlineEditButtonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textLight,
    },
    inlineEditButtonDisabled: {
      opacity: 0.6,
    },
    listHeader: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      paddingTop: 20,
    },
    listHeaderText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    pageNavigation: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 10,
      paddingHorizontal: 20,
    },
    pageButton: {
      backgroundColor: colors.header,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    pageButtonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: colors.textLight,
    },
    pageButtonDisabled: {
      opacity: 0.6,
    },
    pageInfo: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textMuted,
    },
    pageNumbers: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 10,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    pageNumberButton: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 3,
      marginVertical: 2,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.textMuted + '30',
    },
    pageNumberButtonActive: {
      backgroundColor: colors.header,
      borderWidth: 2,
      borderColor: colors.textLight,
      shadowColor: colors.header,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    pageNumberButtonText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 14,
      color: colors.textMuted,
    },
    pageNumberButtonTextActive: {
      color: colors.textLight,
      fontFamily: 'Nunito-ExtraBold',
    },
    totalPostsText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    loadingFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      marginLeft: 10,
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textMuted,
    },
  });
};