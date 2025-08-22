// app/(tabs)/community.tsx
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useFocusEffect } from 'expo-router';
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


// Post type'ını tanımla
interface Post {
  id: string; // UUID format: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
  text: string;
  authorName?: string;
  authorId?: string; // UUID format: 550e8400-e29b-41d4-a716-446655440000
  createdAt: any;
  likedBy?: string[]; // UUID array: ["550e8400-e29b-41d4-a716-446655440000", ...]
  likeCount?: number;
  favoritedBy?: string[]; // UUID array: ["a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", ...]
  favoriteCount?: number;
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
const PostCard = ({ item, colors, onLike, onFavorite, userId, isLast }: { item: Post; colors: any; onLike: any; onFavorite: any; userId: any; isLast: boolean; }) => {
  const styles = getStyles(colors);
  const isLiked = item.likedBy?.includes(userId);
  const isFavorited = (item.favoritedBy || [])?.includes(userId);
  
  // ACIL DEBUG: Array içeriğini detaylı göster
  // Count'ları array length'lerinden hesapla (daha güvenilir)
  const actualLikeCount = item.likedBy?.length || 0;
  const actualFavoriteCount = item.favoritedBy?.length || 0;
  
  console.log(`🎴 ${item.id.substring(0, 8)}... | ❤️${isLiked ? '🔴' : '⚪'} (${actualLikeCount}) | ⭐${isFavorited ? '🟡' : '⚪'} (${actualFavoriteCount})`);
  console.log(`   └── likedBy: [${item.likedBy?.length || 0}] = ${JSON.stringify(item.likedBy)}`);
  console.log(`   └── favoritedBy: [${item.favoritedBy?.length || 0}] = ${JSON.stringify(item.favoritedBy)}`);
  
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
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {(item.authorName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.postAuthor}>{item.authorName || 'Anonim'}</Text>
            <Text style={styles.postTimestamp}>{timeAgo(item.createdAt)}</Text>
          </View>
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
             disabled={false} // Her zaman tıklanabilir
           >
            <Heart 
              size={16} 
              color={isLiked ? colors.header : colors.textMuted} 
              weight={isLiked ? 'fill' : 'regular'} 
            />
             <Text style={[styles.actionText, isLiked && styles.likedText]}>
               {actualLikeCount}
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
             disabled={false} // Her zaman tıklanabilir
           >
            <Star 
              size={16} 
              color={isFavorited ? '#FFD700' : colors.textMuted} 
              weight={isFavorited ? 'fill' : 'regular'} 
            />
             <Text style={[styles.actionText, isFavorited && styles.favoritedText]}>
               {actualFavoriteCount}
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
  const { user, token } = useAuth();
  const { showFeedback } = useFeedback();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  // Global posts state kullan
  const {
    posts, 
    setPosts, 
    updatePost,
    toggleLike, 
    toggleFavorite, 
    lastFetchTime, 
    setLastFetchTime 
  } = usePosts();
  
  // Local loading state'leri
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Post listesini yükle (cache ile)
  const loadPosts = async (forceRefresh = false) => {
    try {
      // Cache kontrolü: 5 dakikadan yeni ise yeniden yükleme
      const now = Date.now();
      const cacheExpiry = 5 * 60 * 1000; // 5 dakika
      const shouldLoadFromCache = !forceRefresh && posts.length > 0 && (now - lastFetchTime) < cacheExpiry;
      
      if (shouldLoadFromCache) {
        console.log('💾 CACHE: Posts cache\'den yükleniyor, fresh data var:', {
          postsCount: posts.length,
          cacheAge: Math.round((now - lastFetchTime) / 1000) + 's',
          'freshData': '✅'
        });
        return;
      }
      
      setLoading(posts.length === 0); // İlk yüklemede loading göster
      console.log('🚀 API: Post listesi yükleniyor...');
      
      const response = await postsService.getPosts();
      
      console.log(`📋 Posts yüklendi: ${response.data?.length || 0} adet | Cache: ${forceRefresh ? 'FORCE_REFRESH' : 'NORMAL_LOAD'}`);
      
      // API response kontrol (development only)
      if (process.env.NODE_ENV === 'development' && response.data?.[0]) {
        const firstPost = response.data[0];
        console.log(`🔍 API Check: likedBy(${firstPost.likedBy?.length || 0}) favoritedBy(${firstPost.favoritedBy?.length || 0})`);
      }
      
      if (response.success && response.data) {
        // SORUN ÇÖZÜMÜ: Client-side'da likedBy/favoritedBy state'ini koru
        const enhancedPosts = response.data.map(post => {
          // Mevcut global state'i koru (PostsContext'ten)
          const existingPost = posts.find(p => p.id === post.id);
          
          // API'den array gelmiyorsa, mevcut state'i koru
          const finalLikedBy = (post.likedBy && post.likedBy.length > 0) 
            ? post.likedBy 
            : existingPost?.likedBy || [];
          
          const finalFavoritedBy = (post.favoritedBy && post.favoritedBy.length > 0) 
            ? post.favoritedBy 
            : existingPost?.favoritedBy || [];
          
          return {
            ...post,
            likedBy: finalLikedBy, 
            favoritedBy: finalFavoritedBy
          };
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔧 State korundu: ${enhancedPosts.length} post | Local cache: ${posts.length > 0 ? 'VAR' : 'YOK'}`);
        }
        
        setPosts(enhancedPosts);
        setLastFetchTime(now);
        console.log(`✅ Posts güncellendi: ${enhancedPosts.length} adet`);
      } else {
        console.log('⚠️ Posts yüklenemedi:', response.message);
      }
    } catch (error) {
      console.error('❌ Posts yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh fonksiyonu
  const refreshPosts = async () => {
    setRefreshing(true);
    await loadPosts(true); // Force refresh
  };

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



  // İlk yükleme
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔍 CommunityScreen useFocusEffect triggered');
      console.log('👤 User:', user?.id);
      if (!user) {
        console.log('❌ No user, returning');
        return;
      }
      console.log('🚀 Calling loadPosts...');
      loadPosts();
    }, [user])
  );

  const [processingLikes, setProcessingLikes] = React.useState<Set<string>>(new Set());
  const [processingFavorites, setProcessingFavorites] = React.useState<Set<string>>(new Set());

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    // Çifte tıklama önleme
    if (processingLikes.has(postId)) {
      console.log('⚠️ LIKE: İşlem devam ediyor, atlanıyor');
          return;
        }
        
    setProcessingLikes(prev => new Set(prev).add(postId));
    
    console.log(`❤️ ${isLiked ? 'Unlike' : 'Like'}: ${postId.substring(0, 8)}...`);
    
    try {
      // Önce UI'ı hemen güncelle (optimistic update)
      toggleLike(postId, user.id);
      // Optimistic update - hemen UI güncelle
      
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
        
        // API'den gelen güncel data ile state'i senkronize et
        if (apiResponse?.data) {
          console.log('🔄 LIKE SYNC BEFORE:', {
            apiLikedBy: apiResponse.data.likedBy?.length || 0,
            apiFavoritedBy: apiResponse.data.favoritedBy?.length || 0,
            apiLikeCount: apiResponse.data.likeCount,
            apiFavoriteCount: apiResponse.data.favoriteCount
          });
          
          console.log('🔍 API ARRAYS DETAIL:', {
            likedByArray: JSON.stringify(apiResponse.data.likedBy),
            favoritedByArray: JSON.stringify(apiResponse.data.favoritedBy)
          });
          
          // API'den array format ile direkt sync
          updatePost(postId, {
            likeCount: apiResponse.data.likeCount,
            favoriteCount: apiResponse.data.favoriteCount,
            likedBy: apiResponse.data.likedBy || [],
            favoritedBy: apiResponse.data.favoritedBy || []
          });
          console.log('✅ LIKE SYNC: API arrayleri ile sync edildi');
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
      
      // Hata durumunda state'i geri al
      toggleLike(postId, user.id);
      console.log('🔄 ROLLBACK: UI state geri alındı');
      
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
      toggleFavorite(postId, user.id);
      // Optimistic update - hemen UI güncelle
      
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
        console.log('✅ GLOBAL: API başarılı, favori kalıcı olarak kaydedildi');
        
        // API'den gelen güncel data ile state'i senkronize et
        if (apiResponse?.data) {
          console.log('🔄 FAVORITE SYNC BEFORE:', {
            apiLikedBy: apiResponse.data.likedBy?.length || 0,
            apiFavoritedBy: apiResponse.data.favoritedBy?.length || 0,
            apiLikeCount: apiResponse.data.likeCount,
            apiFavoriteCount: apiResponse.data.favoriteCount
          });
          
          console.log('🔍 FAVORITE API ARRAYS DETAIL:', {
            likedByArray: JSON.stringify(apiResponse.data.likedBy),
            favoritedByArray: JSON.stringify(apiResponse.data.favoritedBy)
          });
          
          // API'den array format ile direkt sync
          updatePost(postId, {
            likeCount: apiResponse.data.likeCount,
            favoriteCount: apiResponse.data.favoriteCount,
            likedBy: apiResponse.data.likedBy || [],
            favoritedBy: apiResponse.data.favoritedBy || []
          });
          console.log('✅ FAVORITE SYNC: API arrayleri ile sync edildi');
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
      
      // Hata durumunda state'i geri al
      toggleFavorite(postId, user.id);
      console.log('🔄 ROLLBACK: UI state geri alındı');
      
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

  // Toplulukta düzenleme/silme yok

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

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <PostCard 
      item={item} 
      colors={colors} 
      onLike={handleLike} 
      onFavorite={handleFavorite}
                  userId={user.id} 
      isLast={index === posts.length - 1}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Topluluk Alanı</Text>
        <Text style={styles.headerSubtitle}>Birbirinize ilham verin</Text>
      </Animated.View>
      
      {loading && posts.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primaryButton} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onRefresh={refreshPosts}
          refreshing={refreshing}
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
          onEndReachedThreshold={0.1}
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
      zIndex: 1,
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
      zIndex: 10,
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
    authorInitial: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 12, 
      color: colors.textLight 
    },
    authorInfo: { 
      marginLeft: 10 
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
      paddingTop: 10 
    },
    actionButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginRight: 16,
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