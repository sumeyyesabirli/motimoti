import React, { createContext, ReactNode, useContext, useState } from 'react';

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
  isAnonymous?: boolean;
}

interface PostsContextType {
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  addPost: (post: Post) => void;
  toggleLike: (postId: string, userId: string) => void;
  toggleFavorite: (postId: string, userId: string) => void;
  lastFetchTime: number;
  setLastFetchTime: (time: number) => void;
}

const PostsContext = createContext<PostsContextType>({
  posts: [],
  setPosts: () => {},
  updatePost: () => {},
  addPost: () => {},
  toggleLike: () => {},
  toggleFavorite: () => {},
  lastFetchTime: 0,
  setLastFetchTime: () => {},
});

export const PostsProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const updatePost = (postId: string, updates: Partial<Post>) => {
    console.log('🔄 GLOBAL STATE: Post güncelleniyor:', { postId, updates });
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  };

  const addPost = (post: Post) => {
    console.log('➕ GLOBAL STATE: Yeni post ekleniyor:', { postId: post.id });
    
    setPosts(prevPosts => [post, ...prevPosts]);
  };

  const toggleLike = (postId: string, userId: string) => {
    console.log('❤️ GLOBAL STATE: Like toggle başladı:', { 
      postId: postId.substring(0, 8) + '...', 
      userId: userId.substring(0, 8) + '...' 
    });
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentLikedBy = post.likedBy || [];
          const isLiked = currentLikedBy.includes(userId);
          
          console.log('🔍 TOGGLE LIKE DEBUG:', {
            postId: postId.substring(0, 8) + '...',
            userId: userId.substring(0, 8) + '...',
            currentLikedBy: currentLikedBy.map(id => id.substring(0, 8) + '...'),
            isLiked,
            action: isLiked ? 'ÇIKAR' : 'EKLE'
          });
          
          if (isLiked) {
            // Beğeni çıkar
            const newLikedBy = currentLikedBy.filter(id => id !== userId);
            const newLikeCount = Math.max(0, (post.likeCount || 0) - 1);
            
            console.log('📱 GLOBAL: Beğeni çıkarıldı:', {
              postId: postId.substring(0, 8) + '...',
              oldCount: post.likeCount,
              newCount: newLikeCount,
              oldLikedBy: currentLikedBy.length,
              newLikedBy: newLikedBy.length
            });
            
            return {
              ...post,
              likedBy: newLikedBy,
              likeCount: newLikeCount
            };
          } else {
            // Beğeni ekle
            const newLikedBy = [...currentLikedBy, userId];
            const newLikeCount = (post.likeCount || 0) + 1;
            
            console.log('📱 GLOBAL: Beğeni eklendi:', {
              postId: postId.substring(0, 8) + '...',
              oldCount: post.likeCount,
              newCount: newLikeCount,
              oldLikedBy: currentLikedBy.length,
              newLikedBy: newLikedBy.length,
              eklenenUserId: userId.substring(0, 8) + '...'
            });
            
            return {
              ...post,
              likedBy: newLikedBy,
              likeCount: newLikeCount
            };
          }
        }
        return post;
      })
    );
  };

  const toggleFavorite = (postId: string, userId: string) => {
    console.log('⭐ GLOBAL STATE: Favorite toggle:', { postId, userId });
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const currentFavoritedBy = post.favoritedBy || [];
          const isFavorited = currentFavoritedBy.includes(userId);
          
          if (isFavorited) {
            // Favori çıkar
            const newFavoritedBy = currentFavoritedBy.filter(id => id !== userId);
            const newFavoriteCount = Math.max(0, (post.favoriteCount || 0) - 1);
            
            console.log('📱 GLOBAL: Favori çıkarıldı:', {
              postId,
              oldCount: post.favoriteCount,
              newCount: newFavoriteCount
            });
            
            return {
              ...post,
              favoritedBy: newFavoritedBy,
              favoriteCount: newFavoriteCount
            };
          } else {
            // Favori ekle
            const newFavoritedBy = [...currentFavoritedBy, userId];
            const newFavoriteCount = (post.favoriteCount || 0) + 1;
            
            console.log('📱 GLOBAL: Favori eklendi:', {
              postId,
              oldCount: post.favoriteCount,
              newCount: newFavoriteCount
            });
            
            return {
              ...post,
              favoritedBy: newFavoritedBy,
              favoriteCount: newFavoriteCount
            };
          }
        }
        return post;
      })
    );
  };

  return (
    <PostsContext.Provider value={{
      posts,
      setPosts,
      updatePost,
      addPost,
      toggleLike,
      toggleFavorite,
      lastFetchTime,
      setLastFetchTime
    }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => useContext(PostsContext);
