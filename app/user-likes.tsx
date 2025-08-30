import { useRouter } from 'expo-router';
import { Heart, ArrowLeft, Star } from 'phosphor-react-native';
import React, { useState, useEffect } from 'react';
import { 
  ActivityIndicator, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ScrollView,
  FlatList
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as postsService from '../services/posts';

interface Post {
  id: string;
  text: string;
  authorName?: string;
  authorId?: string;
  createdAt: any;
  likedBy?: string[];
  likeCount?: number;
  favoritedBy?: string[];
  favoriteCount?: number;
  isAnonymous?: boolean;
}

export default function UserLikesScreen() {
  const { colors } = useTheme();
  const { showFeedback } = useFeedback();
  const { user } = useAuth();
  const router = useRouter();
  
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      setLoading(true);
      try {
        const response = await postsService.getLikedPosts();
        if (response.success) {
          setLikedPosts(response.data);
          setPagination(response.pagination);
        }
      } catch (error) {
        console.error('Beğenilen postlar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikedPosts();
  }, []);

  // Header animasyonu için
  const headerOpacity = useSharedValue(1);
  const headerHeight = useSharedValue(120);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      height: headerHeight.value,
      transform: [{ translateY: headerHeight.value === 0 ? -30 : 0 }],
    };
  });

  const styles = React.useMemo(() => getStyles(colors), [colors]);

  // Scroll handler - header'ı gizle/göster
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    
    if (offsetY > 80) {
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
      headerHeight.value = withSpring(120, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    }
  };

  const timeAgo = (date: any) => {
    try {
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(parsedDate, { addSuffix: true, locale: tr });
    } catch {
      return 'Bilinmeyen';
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    // Debug: API'den gelen veriyi detaylı kontrol et
    console.log('🎴 Like Page Post DETAIL:', {
      id: item.id.substring(0, 8) + '...',
      likeCount: item.likeCount,
      favoriteCount: item.favoriteCount,
      likedBy: item.likedBy,
      favoritedBy: item.favoritedBy,
      likedByLength: item.likedBy?.length,
      favoritedByLength: item.favoritedBy?.length,
      likedByType: typeof item.likedBy,
      favoritedByType: typeof item.favoritedBy
    });
    
    // Count'ları hesapla - usePagination hook'unda işlenen veriyi kullan
    const actualLikeCount = item.likeCount || 0;
    const actualFavoriteCount = item.favoriteCount || 0;
    
    // Debug: Count'ları detaylı kontrol et
    console.log('📊 Post Counts:', {
      postId: item.id.substring(0, 8) + '...',
      likeCount: actualLikeCount,
      favoriteCount: actualFavoriteCount,
      likedByLength: item.likedBy?.length,
      favoritedByLength: item.favoritedBy?.length,
      rawLikeCount: item.likeCount,
      rawFavoriteCount: item.favoriteCount
    });
    
    // Eğer count'lar hala 0 ise, array length'lerini kullan
    const finalLikeCount = actualLikeCount > 0 ? actualLikeCount : (item.likedBy?.length || 0);
    const finalFavoriteCount = actualFavoriteCount > 0 ? actualFavoriteCount : (item.favoritedBy?.length || 0);
    
    console.log('🎯 Final Counts:', {
      postId: item.id.substring(0, 8) + '...',
      finalLikeCount,
      finalFavoriteCount
    });
    
    return (
      <View key={item.id} style={styles.postItem}>
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.authorInfo}
            onPress={() => {
              if (item.authorId) {
                // Yönlendirmeyi sadece gerekli parametrelerle yapıyoruz
                router.push({
                  pathname: `/user/${item.authorId}`,
                  params: {
                    // Sadece hangi modda olduğumuzu gönderiyoruz
                    viewMode: item.isAnonymous ? 'anonymous' : 'public',
                  }
                });
              }
            }}
          >
            <View style={styles.authorAvatar}>
              <Text style={styles.authorAvatarText}>
                {item.isAnonymous ? '🎭' : (item.authorName || 'A').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>
                {item.isAnonymous ? 'Anonim' : (item.authorName || 'Kullanıcı')}
              </Text>
              <Text style={styles.postDate}>
                {timeAgo(item.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
          
          {item.isAnonymous && (
            <View style={styles.anonBadge}>
              <Text style={styles.anonBadgeText}>Anonim</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.postText}>{item.text}</Text>
        
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Heart size={16} color={colors.header} weight="fill" />
            <Text style={styles.statText}>{finalLikeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color="#FFD700" weight="fill" />
            <Text style={styles.statText}>{finalFavoriteCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beğendiklerim</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
          <Text style={styles.loadingText}>Beğendiklerim yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Beğendiklerim</Text>
          <View style={styles.placeholder} />
        </View>
      </Animated.View>

      <View style={styles.summaryInfo}>
        <Heart size={20} color={colors.header} weight="fill" />
        <Text style={styles.summaryText}>
          {pagination?.totalItems || likedPosts.length} paylaşım beğendin
        </Text>
      </View>

      <FlatList
        data={likedPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={48} color={colors.textMuted} weight="regular" />
            <Text style={styles.emptyText}>Henüz hiçbir paylaşım beğenmedin</Text>
            <Text style={styles.emptySubtext}>
              Topluluk alanında paylaşımları beğenmeye başla!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: colors.card,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: colors.textDark,
  },
  placeholder: {
    width: 44,
  },
  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.card,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  summaryText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginLeft: 8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  postItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorAvatarText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: colors.textLight,
  },
  authorName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: colors.textDark,
  },
  postDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  anonBadge: {
    backgroundColor: colors.primaryButton + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  anonBadgeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.primaryButton,
  },
  postText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAE5D9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textDark,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
