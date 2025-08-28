import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useAuth } from '../../context/AuthContext';
import * as postsService from '../../services/posts';

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

interface UserProfile {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
}

export default function UserPostsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors } = useTheme();
  const { showFeedback } = useFeedback();
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadUserPosts();
  }, [userId]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      
      // API'den kullanıcı paylaşımlarını al
      if (!userId) {
        console.log('⚠️ UserId bulunamadı');
        return;
      }
      
      console.log('📱 Kullanıcı paylaşımları sayfası: API çağrısı başlatılıyor', userId);
      console.log('🔍 NOT: Artık anonim paylaşımlar da görünecek!');
      console.log('🔍 NOT: Normal paylaşımlar gerçek kullanıcı ismi ile görünecek!');
      
      const response = await postsService.getUserPosts(userId);
      
      if (response.success && response.data) {
        console.log('✅ Kullanıcı paylaşımları yüklendi:', {
          userId,
          count: response.data.length,
          posts: response.data.map(p => ({
            id: p.id,
            authorName: p.authorName,
            textPreview: p.text?.substring(0, 30) + '...'
          }))
        });
        
        // Anonim paylaşımları da göster - gizlilik korunacak ama anonim paylaşımlar görünecek
        // Sadece kendi profilinde anonim paylaşımlar gizli kalacak
        const allPosts = response.data;
        
        console.log('🔍 Post filtreleme:', {
          toplam: response.data.length,
          anonim: response.data.filter(p => p.isAnonymous).length,
          normal: response.data.filter(p => !p.isAnonymous).length,
          gosterilen: allPosts.length,
          not: 'Anonim paylaşımlar artık görünür!'
        });
        
        setPosts(allPosts);
        
        // İlk posttan kullanıcı bilgilerini çıkar (anonim olabilir)
        if (allPosts.length > 0) {
          const firstPost = allPosts[0];
          setUserProfile({
            id: userId,
            username: firstPost.authorName || 'Kullanıcı',
            displayName: firstPost.authorName || 'Bilinmeyen Kullanıcı',
            email: ''
          });
        } else {
          setUserProfile({
            id: userId,
            username: 'Kullanıcı',
            displayName: 'Bilinmeyen Kullanıcı',
            email: ''
          });
        }
        
      } else {
        console.log('⚠️ Kullanıcı paylaşımları API hatası:', response);
        showFeedback({ 
          message: response.message || 'Kullanıcı paylaşımları yüklenemedi', 
          type: 'error' 
        });
      }
      
    } catch (error) {
      console.error('Kullanıcı paylaşımları yüklenemedi:', error);
      showFeedback({ 
        message: 'Kullanıcı paylaşımları yüklenemedi', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <View style={[
      styles.postItem,
      item.isAnonymous && { borderColor: colors.primaryButton + '40', borderWidth: 2 }
    ]}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={[
            styles.authorAvatar,
            item.isAnonymous && { backgroundColor: colors.primaryButton + '20' }
          ]}>
            <Text style={styles.authorAvatarText}>
              {item.isAnonymous ? '🎭' : (userProfile?.displayName || userProfile?.username || 'A')?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[
              styles.authorName,
              item.isAnonymous && { color: colors.primaryButton }
            ]}>
              {item.isAnonymous ? 'Anonim' : userProfile?.displayName || userProfile?.username}
            </Text>
            <Text style={styles.postDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        {item.isAnonymous && (
          <View style={[styles.anonBadge, { backgroundColor: colors.primaryButton + '20' }]}>
            <Text style={[styles.anonBadgeText, { color: colors.primaryButton }]}>Anonim</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.postText}>{item.text}</Text>
      
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Text style={styles.statText}>❤️ {item.likeCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statText}>⭐ {item.favoriteCount || 0}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paylaşımlar</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
          <Text style={styles.loadingText}>Paylaşımlar yükleniyor...</Text>
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
          <Text style={styles.headerTitle}>Paylaşımlar</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(userProfile?.displayName || userProfile?.username)?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.displayName || userProfile?.username}
            </Text>
            <Text style={styles.userHandle}>
              @{userProfile?.username}
            </Text>
            <Text style={styles.postCount}>
              {posts.length} paylaşım
            </Text>
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { paddingTop: 130 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <User size={48} color={colors.textMuted} weight="regular" />
            <Text style={styles.emptyText}>Henüz paylaşım yapılmamış</Text>
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.background,
    overflow: 'hidden',
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.card,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE5D9',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: colors.textLight,
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: colors.textDark,
  },
  userHandle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  postCount: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.primaryButton,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
  },
});
