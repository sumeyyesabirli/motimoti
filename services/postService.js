import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, API_DEBUG } from '../constants/api';

// Mock API için geçici post verisi
const mockPosts = [
  {
    id: 1,
    text: 'Bu bir test gönderisidir. Mock API ile çalışıyor!',
    authorId: 1,
    authorName: 'TestUser',
    createdAt: new Date().toISOString(),
    likeCount: 5,
    likedBy: [1],
    favoriteCount: 2,
    favoritedBy: [1]
  },
  {
    id: 2,
    text: 'İkinci test gönderisi. Pagination testi için gerekli.',
    authorId: 1,
    authorName: 'TestUser',
    createdAt: new Date(Date.now() - 60000).toISOString(),
    likeCount: 3,
    likedBy: [],
    favoriteCount: 1,
    favoritedBy: []
  }
];

// API hata detaylarını console'a yazdır
const logApiError = (operation, error, endpoint, data = null) => {
  console.error(`❌ API HATA - ${operation}:`, {
    endpoint: `${API_BASE_URL}${endpoint}`,
    error: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: data,
    response: error.response?.data,
    config: {
      method: error.config?.method,
      url: error.config?.url,
      headers: error.config?.headers
    }
  });
  
  // Network hatası kontrolü
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    console.error('🌐 NETWORK HATASI: API sunucusuna bağlanılamıyor!');
    console.error('🔧 Kontrol edilecekler:');
    console.error('   - API sunucusu çalışıyor mu?');
    console.error('   - API URL doğru mu?');
    console.error('   - CORS ayarları yapıldı mı?');
    console.error('   - Firewall/antivirus engelliyor mu?');
  }
  
  // HTTP status kodlarına göre özel mesajlar
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        console.error('🚫 400 Bad Request: İstek formatı hatalı');
        break;
      case 401:
        console.error('🔐 401 Unauthorized: Kimlik doğrulama gerekli');
        break;
      case 403:
        console.error('🚫 403 Forbidden: Erişim reddedildi');
        break;
      case 404:
        console.error('🔍 404 Not Found: Endpoint bulunamadı');
        break;
      case 500:
        console.error('💥 500 Internal Server Error: Sunucu hatası');
        break;
      case 502:
        console.error('🌐 502 Bad Gateway: API sunucusu erişilemez');
        break;
      case 503:
        console.error('⏳ 503 Service Unavailable: API sunucusu meşgul');
        break;
      default:
        console.error(`⚠️ ${error.response.status} ${error.response.statusText}: Bilinmeyen hata`);
    }
  }
};

export const postService = {
  // Gönderi oluştur
  async createPost(postData, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Create post called with:', postData);
      const newPost = {
        id: Date.now(),
        ...postData,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        likedBy: [],
        favoriteCount: 0,
        favoritedBy: []
      };
      mockPosts.unshift(newPost); // Başa ekle
      
      return {
        success: true,
        data: newPost,
        message: 'Gönderi başarıyla oluşturuldu'
      };
    }
    
    try {
      console.log('🚀 API Create Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}`,
        data: { ...postData, text: postData.text?.substring(0, 50) + '...' }
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.posts}`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Create Post başarılı:', {
        postId: response.data.data?.id,
        textLength: response.data.data?.text?.length
      });
      return response.data;
    } catch (error) {
      logApiError('Create Post', error, API_ENDPOINTS.posts, { 
        authorId: postData.authorId, 
        textLength: postData.text?.length 
      });
      throw error;
    }
  },

  // Tüm gönderileri getir
  async getPosts() {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Get posts called');
      return {
        success: true,
        data: mockPosts,
        message: 'Gönderiler başarıyla getirildi'
      };
    }
    
    try {
      console.log('🚀 API Get Posts isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}`
      });
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.posts}`);
      
      console.log('✅ API Get Posts başarılı:', {
        postCount: response.data.data?.length || 0
      });
      return response.data;
    } catch (error) {
      logApiError('Get Posts', error, API_ENDPOINTS.posts);
      throw error;
    }
  },

  // Kullanıcının gönderilerini getir
  async getUserPosts(userId) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Get user posts called with:', userId);
      const userPosts = mockPosts.filter(post => post.authorId == userId);
      return {
        success: true,
        data: userPosts,
        message: 'Kullanıcı gönderileri başarıyla getirildi'
      };
    }
    
    try {
      console.log('🚀 API Get User Posts isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/user/${userId}`
      });
      
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.posts}/user/${userId}`);
      
      console.log('✅ API Get User Posts başarılı:', {
        userId,
        postCount: response.data.data?.length || 0
      });
      return response.data;
    } catch (error) {
      logApiError('Get User Posts', error, `${API_ENDPOINTS.posts}/user/${userId}`, { userId });
      throw error;
    }
  },

  // Gönderi güncelle
  async updatePost(postId, postData, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Update post called with:', { postId, postData });
      const postIndex = mockPosts.findIndex(p => p.id == postId);
      if (postIndex !== -1) {
        mockPosts[postIndex] = { ...mockPosts[postIndex], ...postData };
        return {
          success: true,
          data: mockPosts[postIndex],
          message: 'Gönderi güncellendi'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Update Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}`,
        data: { ...postData, text: postData.text?.substring(0, 50) + '...' }
      });
      
      const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Update Post başarılı:', {
        postId: response.data.data?.id,
        updatedFields: Object.keys(postData)
      });
      return response.data;
    } catch (error) {
      logApiError('Update Post', error, `${API_ENDPOINTS.posts}/${postId}`, { postId, postData });
      throw error;
    }
  },

  // Gönderi sil
  async deletePost(postId, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Delete post called with:', postId);
      const postIndex = mockPosts.findIndex(p => p.id == postId);
      if (postIndex !== -1) {
        const deletedPost = mockPosts.splice(postIndex, 1)[0];
        return {
          success: true,
          data: deletedPost,
          message: 'Gönderi silindi'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Delete Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}`
      });
      
      const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Delete Post başarılı:', {
        postId: response.data.data?.id
      });
      return response.data;
    } catch (error) {
      logApiError('Delete Post', error, `${API_ENDPOINTS.posts}/${postId}`, { postId });
      throw error;
    }
  },

  // Gönderiyi beğen
  async likePost(postId, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Like post called with:', postId);
      const post = mockPosts.find(p => p.id == postId);
      if (post) {
        post.likeCount = (post.likeCount || 0) + 1;
        if (!post.likedBy) post.likedBy = [];
        post.likedBy.push(1); // Mock user ID
        return {
          success: true,
          data: post,
          message: 'Gönderi beğenildi'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Like Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/like`
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Like Post başarılı:', {
        postId: response.data.data?.id,
        newLikeCount: response.data.data?.likeCount
      });
      return response.data;
    } catch (error) {
      logApiError('Like Post', error, `${API_ENDPOINTS.posts}/${postId}/like`, { postId });
      throw error;
    }
  },

  // Gönderiyi beğenmekten vazgeç
  async unlikePost(postId, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Unlike post called with:', postId);
      const post = mockPosts.find(p => p.id == postId);
      if (post) {
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
        if (post.likedBy) {
          post.likedBy = post.likedBy.filter(id => id !== 1);
        }
        return {
          success: true,
          data: post,
          message: 'Beğeni kaldırıldı'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Unlike Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/like`
      });
      
      const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/like`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Unlike Post başarılı:', {
        postId: response.data.data?.id,
        newLikeCount: response.data.data?.likeCount
      });
      return response.data;
    } catch (error) {
      logApiError('Unlike Post', error, `${API_ENDPOINTS.posts}/${postId}/like`, { postId });
      throw error;
    }
  },

  // Gönderiyi favorilere ekle
  async favoritePost(postId, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Favorite post called with:', postId);
      const post = mockPosts.find(p => p.id == postId);
      if (post) {
        post.favoriteCount = (post.favoriteCount || 0) + 1;
        if (!post.favoritedBy) post.favoritedBy = [];
        post.favoritedBy.push(1); // Mock user ID
        return {
          success: true,
          data: post,
          message: 'Gönderi favorilere eklendi'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Favorite Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/favorite`
      });
      
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Favorite Post başarılı:', {
        postId: response.data.data?.id,
        newFavoriteCount: response.data.data?.favoriteCount
      });
      return response.data;
    } catch (error) {
      logApiError('Favorite Post', error, `${API_ENDPOINTS.posts}/${postId}/favorite`, { postId });
      throw error;
    }
  },

  // Gönderiyi favorilerden çıkar
  async unfavoritePost(postId, token) {
    if (API_DEBUG) {
      console.log('🔧 Mock API: Unfavorite post called with:', postId);
      const post = mockPosts.find(p => p.id == postId);
      if (post) {
        post.favoriteCount = Math.max(0, (post.favoriteCount || 0) - 1);
        if (post.favoritedBy) {
          post.favoritedBy = post.favoritedBy.filter(id => id !== 1);
        }
        return {
          success: true,
          data: post,
          message: 'Favori kaldırıldı'
        };
      } else {
        throw new Error('Gönderi bulunamadı');
      }
    }
    
    try {
      console.log('🚀 API Unfavorite Post isteği gönderiliyor:', {
        url: `${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/favorite`
      });
      
      const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.posts}/${postId}/favorite`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ API Unfavorite Post başarılı:', {
        postId: response.data.data?.id,
        newFavoriteCount: response.data.data?.favoriteCount
      });
      return response.data;
    } catch (error) {
      logApiError('Unfavorite Post', error, `${API_ENDPOINTS.posts}/${postId}/favorite`, { postId });
      throw error;
    }
  }
};
