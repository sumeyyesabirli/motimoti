import { useState, useEffect, useCallback, useRef } from 'react';
import * as postsService from '../services/posts';

interface PaginationData {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  pagination: PaginationData | null;
  loadMore: () => void;
  refresh: () => void;
  canLoadMore: boolean;
  error: string | null;
}

type EndpointType = 'posts' | 'liked' | 'favorites' | 'userLiked' | 'userFavorites' | 'userPosts';

export const usePagination = <T = any>(
  endpoint: EndpointType, 
  userId?: string,
  limit: number = 10
): UsePaginationReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // useRef ile dependency'leri yönet
  const endpointRef = useRef(endpoint);
  const userIdRef = useRef(userId);
  const limitRef = useRef(limit);

  const loadPage = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚀 ${endpointRef.current} sayfası yükleniyor:`, { page, limit: limitRef.current, userId: userIdRef.current });
      
      let response;
      
      switch(endpointRef.current) {
        case 'posts':
          response = await postsService.getPosts({ page, limit: limitRef.current });
          break;
        case 'liked':
          response = await postsService.getLikedPosts({ page, limit: limitRef.current });
          break;
        case 'favorites':
          response = await postsService.getFavoritePosts({ page, limit: limitRef.current });
          break;
        case 'userLiked':
          if (!userIdRef.current) throw new Error('User ID required for userLiked endpoint');
          response = await postsService.getUserLikedPosts(userIdRef.current, { page, limit: limitRef.current });
          break;
        case 'userFavorites':
          if (!userIdRef.current) throw new Error('User ID required for userFavorites endpoint');
          response = await postsService.getUserFavoritePosts(userIdRef.current, { page, limit: limitRef.current });
          break;
        case 'userPosts':
          if (!userIdRef.current) throw new Error('User ID required for userPosts endpoint');
          response = await postsService.getUserPosts(userIdRef.current, { page, limit: limitRef.current });
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpointRef.current}`);
      }

      if (response.success && response.data) {
        // Debug: API response'u kontrol et
        console.log(`🔍 ${endpoint} API Response:`, {
          success: response.success,
          dataLength: response.data?.length || 0,
          firstItem: response.data?.[0] ? {
            id: response.data[0].id?.substring(0, 8) + '...',
            likeCount: response.data[0].likeCount,
            favoriteCount: response.data[0].favoriteCount,
            likedBy: response.data[0].likedBy,
            favoritedBy: response.data[0].favoritedBy,
            likedByType: typeof response.data[0].likedBy,
            favoritedByType: typeof response.data[0].favoritedBy
          } : 'NO_DATA',
          pagination: response.pagination
        });
        
        // Posts endpoint'i için basit işlem - count'ları array length'lerden hesapla
        if (endpointRef.current === 'posts') {
          console.log('🔧 Posts endpoint için basit işlem yapılıyor...');
          
          // Posts için count'ları array length'lerden hesapla
          const processedData = response.data.map((post: any) => {
            const processedPost = { ...post };
            
            // Count'ları array length'lerden al
            processedPost.likeCount = post.likedBy?.length || 0;
            processedPost.favoriteCount = post.favoritedBy?.length || 0;
            
            return processedPost;
          });
          
          if (append) {
            setData(prev => [...prev, ...processedData]);
          } else {
            setData(processedData);
          }
          
          if (response.pagination) {
            setPagination(response.pagination);
          }
          
          return; // Posts endpoint'i için erken return
        }
        
        // Diğer endpoint'ler için normal işlem
        const processedData = response.data.map((post: any) => {
          // Post'u kopyala (mutation önlemek için)
          const processedPost = { ...post };
          
          // Like count'u hesapla - öncelik: likedBy.length > likeCount > 0
          let finalLikeCount = 0;
          if (Array.isArray(post.likedBy) && post.likedBy.length > 0) {
            finalLikeCount = post.likedBy.length;
            processedPost.likedBy = post.likedBy;
            console.log(`✅ Post ${post.id?.substring(0, 8)}...: likedBy array mevcut (${finalLikeCount} item)`);
          } else if (typeof post.likeCount === 'number' && post.likeCount > 0) {
            finalLikeCount = post.likeCount;
            processedPost.likedBy = Array(post.likeCount).fill('placeholder');
            console.log(`🔧 Post ${post.id?.substring(0, 8)}...: likedBy array oluşturuldu (${finalLikeCount} item)`);
          } else {
            // API'den gelen count'u kullan veya varsayılan 0
            finalLikeCount = post.likeCount || 0;
            processedPost.likedBy = [];
            console.log(`⚠️ Post ${post.id?.substring(0, 8)}...: likedBy array boş, count: ${finalLikeCount}`);
          }
          
          // Favorite count'u hesapla - öncelik: favoritedBy.length > favoriteCount > 0
          let finalFavoriteCount = 0;
          if (Array.isArray(post.favoritedBy) && post.favoritedBy.length > 0) {
            finalFavoriteCount = post.favoritedBy.length;
            processedPost.favoritedBy = post.favoritedBy;
            console.log(`✅ Post ${post.id?.substring(0, 8)}...: favoritedBy array mevcut (${finalFavoriteCount} item)`);
          } else if (typeof post.favoriteCount === 'number' && post.favoriteCount > 0) {
            finalFavoriteCount = post.favoriteCount;
            processedPost.favoritedBy = Array(post.favoriteCount).fill('placeholder');
            console.log(`🔧 Post ${post.id?.substring(0, 8)}...: favoritedBy array oluşturuldu (${finalFavoriteCount} item)`);
          } else {
            // API'den gelen count'u kullan veya varsayılan 0
            finalFavoriteCount = post.favoriteCount || 0;
            processedPost.favoritedBy = [];
            console.log(`⚠️ Post ${post.id?.substring(0, 8)}...: favoritedBy array boş, count: ${finalFavoriteCount}`);
          }
          
          // Count'ları güncelle (UI'da doğru gözükmeleri için)
          processedPost.likeCount = finalLikeCount;
          processedPost.favoriteCount = finalFavoriteCount;
          
          // Debug: Final count'ları kontrol et
          console.log(`🎯 Post ${post.id?.substring(0, 8)}...: Final Counts - Like: ${finalLikeCount}, Favorite: ${finalFavoriteCount}`);
          
          return processedPost;
        });
        
        if (append) {
          setData(prev => [...prev, ...processedData]);
        } else {
          setData(processedData);
        }
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.message || 'Veri yüklenemedi');
      }
      
    } catch (error: any) {
      console.error('Pagination error:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []); // useRef kullandığımız için dependency yok

  const loadMore = useCallback(() => {
    if (pagination?.hasNext && !loading) {
      loadPage(pagination.currentPage + 1, true);
    }
  }, [pagination, loading, loadPage]);

  const refresh = useCallback(() => {
    loadPage(1, false);
  }, [loadPage]);

  useEffect(() => {
    // Ref'leri güncelle
    endpointRef.current = endpoint;
    userIdRef.current = userId;
    limitRef.current = limit;
    
    // Veriyi yükle
    loadPage(1, false);
  }, [endpoint, userId, limit]); // endpoint, userId veya limit değiştiğinde yeniden yükle

  return {
    data,
    loading,
    pagination,
    loadMore,
    refresh,
    canLoadMore: pagination?.hasNext && !loading || false,
    error
  };
};
