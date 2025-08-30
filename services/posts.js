import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiConfig';
import { optimizedPostsService } from './optimizedPostsService';
import Logger from '../utils/logger';
import { getToken } from './auth';

export async function createPost(data) {
  const startTime = Date.now();
  
  Logger.api('Post Oluştur', {
    method: 'POST',
    url: '/posts'
  });
  
  Logger.post('Yeni Post Oluşturuluyor', {
    text: data.text,
    authorId: data.authorId,
    isAnonymous: data.isAnonymous
  });
  
  const res = await api.post('/posts', data);
  const duration = Date.now() - startTime;
  
  Logger.success('Post Başarıyla Oluşturuldu', {
    duration,
    message: `Post ID: ${Logger.formatId(res.data.data?.id)}`
  });
  
  return res.data;
}

export async function getPosts(params = { page: 1, limit: 10 }) {
  const startTime = Date.now();
  
  Logger.api('Tüm Postları Getir', {
    method: 'GET',
    url: '/posts',
    params
  });
  
  const res = await api.get('/posts', { params });
  const duration = Date.now() - startTime;
  
  Logger.success('Postlar Başarıyla Yüklendi', {
    duration,
    count: res.data.data?.length || 0,
    pagination: res.data.pagination
  });
  
  return res.data;
}

export async function getUserPosts(userId, isAnonymous) {
  console.log('🚀 Get User Posts isteği:', { userId, isAnonymous });
  
  // Eğer isAnonymous parametresi geldiyse, URL'e ekle
  let url = `/posts/user/${userId}`;
  if (isAnonymous !== undefined) {
    url += `?isAnonymous=${isAnonymous}`;
  }
  
  const res = await api.get(url);
  
  console.log('✅ Get User Posts başarılı:', {
    userId,
    isAnonymous,
    postCount: res.data.data?.length || 0,
    pagination: res.data.pagination
  });
  
  return res.data;
}

export async function updatePost(postId, data) {
  console.log('🚀 Update Post isteği:', {
    postId,
    ...data,
    text: data.text?.substring(0, 50) + '...'
  });
  
  const res = await api.put(`/posts/${postId}`, data);
  
  console.log('✅ Update Post başarılı:', {
    postId: res.data.data?.id
  });
  
  return res.data;
}

export async function deletePost(postId) {
  console.log('🚀 Delete Post isteği:', { postId });
  
  const res = await api.delete(`/posts/${postId}`);
  
  console.log('✅ Delete Post başarılı:', {
    postId: res.data.data?.id
  });
  
  return res.data;
}

export async function likePost(postId) {
  // Like API çağrısı
  
  const res = await api.post(`/posts/${postId}/like`);
  
  console.log(`✅ Like API: Count=${res.data.data?.likeCount}`);
  
  // ACIL DEBUG: Tam API response'u göster
  console.log('🔍 LIKE API FULL DEBUG:', JSON.stringify({
    success: res.data.success,
    message: res.data.message,
    data: res.data.data,
    allDataKeys: res.data.data ? Object.keys(res.data.data) : 'NO_DATA'
  }, null, 2));
  
  // 🚀 Cache'i temizle - optimizasyon için
  await optimizedPostsService.invalidateCache();
  console.log('🗑️ Like işlemi sonrası cache temizlendi');
  
  return res.data;
}

export async function unlikePost(postId) {
  // Unlike API çağrısı
  
  const res = await api.delete(`/posts/${postId}/like`);
  
  console.log(`✅ Unlike API: Count=${res.data.data?.likeCount}`);
  
  // 🚀 Cache'i temizle - optimizasyon için
  await optimizedPostsService.invalidateCache();
  console.log('🗑️ Unlike işlemi sonrası cache temizlendi');
  
  return res.data;
}

export async function favoritePost(postId) {
  // Favorite API çağrısı
  
  const res = await api.post(`/posts/${postId}/favorite`);
  
  console.log(`✅ Favorite API: Count=${res.data.data?.favoriteCount}`);
  
  // ACIL DEBUG: Favorite API'nin tam response'unu göster
  console.log('🔍 FAVORITE API FULL DEBUG:', JSON.stringify({
    success: res.data.success,
    message: res.data.message,
    data: res.data.data,
    allDataKeys: res.data.data ? Object.keys(res.data.data) : 'NO_DATA'
  }, null, 2));
  
  // 🚀 Cache'i temizle - optimizasyon için
  await optimizedPostsService.invalidateCache();
  console.log('🗑️ Favorite işlemi sonrası cache temizlendi');
  
  return res.data;
}

export async function unfavoritePost(postId) {
  // Unfavorite API çağrısı
  
  const res = await api.delete(`/posts/${postId}/favorite`);
  
  console.log(`✅ Unfavorite API: Count=${res.data.data?.favoriteCount}`);
  
  // 🚀 Cache'i temizle - optimizasyon için
  await optimizedPostsService.invalidateCache();
  console.log('🗑️ Unfavorite işlemi sonrası cache temizlendi');
  
  return res.data;
}



// Belirli kullanıcının beğendikleri (public)
export async function getUserLikedPosts(userId, params = { page: 1, limit: 10 }) {
  console.log('🚀 Kullanıcı beğendikleri API isteği:', { userId, params });
  
  const res = await api.get(API_ENDPOINTS.GET_USER_LIKED_POSTS(userId), { params });
  
  console.log(`✅ Kullanıcı beğendikleri yüklendi: ${res.data.data?.length || 0} post`, {
    pagination: res.data.pagination
  });
  
  return res.data;
}

// Belirli kullanıcının favorileri (public)
export async function getUserFavoritePosts(userId, params = { page: 1, limit: 10 }) {
  console.log('🚀 Kullanıcı favorileri API isteği:', { userId, params });
  
  const res = await api.get(API_ENDPOINTS.GET_USER_FAVORITE_POSTS(userId), { params });
  
  console.log(`✅ Kullanıcı favorileri yüklendi: ${res.data.data?.length || 0} post`, {
    pagination: res.data.pagination
  });
  
  return res.data;
}

// ============================================
// 🚀 YENİ: OPTIMIZED CACHE FUNCTIONS
// ============================================

/**
 * Kullanıcı istatistiklerini al (optimized - sadece sayılar)
 * @param {string} userId - Kullanıcı ID'si (GUID format)
 * @returns {Promise<Object>} İstatistik verileri
 */
export async function getUserPostStats(userId) {
  return await optimizedPostsService.getUserPostStats(userId);
}



/**
 * Kendi favorilerin (cache'li)
 * @returns {Promise<Object>} Favori gönderiler
 */
export async function getFavoritePostsCached() {
  return await optimizedPostsService.getFavoritePostsCached();
}

/**
 * Kullanıcının beğendikleri (cache'li)
 * @param {string} userId - Kullanıcı ID'si (GUID format)
 * @returns {Promise<Object>} Kullanıcının beğendiği gönderiler
 */
export async function getUserLikedPostsCached(userId) {
  return await optimizedPostsService.getUserLikedPostsCached(userId);
}

/**
 * Kullanıcının favorileri (cache'li)
 * @param {string} userId - Kullanıcı ID'si (GUID format)
 * @returns {Promise<Object>} Kullanıcının favori gönderileri
 */
export async function getUserFavoritePostsCached(userId) {
  return await optimizedPostsService.getUserFavoritePostsCached(userId);
}

/**
 * Cache durumunu kontrol et
 * @returns {Promise<Object>} Cache durumu raporu
 */
export async function getCacheStatus() {
  return await optimizedPostsService.getCacheStatus();
}

/**
 * Cache'i temizle
 * @param {string} userId - Kullanıcı ID'si (opsiyonel)
 */
export async function invalidateCache(userId = null) {
  return await optimizedPostsService.invalidateCache(userId);
}

// ============================================
// 🚀 YENİ: BASİT API FONKSİYONLARI
// ============================================

// Giriş yapmış kullanıcının beğendiği postları getirir
export const getLikedPosts = async () => {
  try {
    const token = await getToken();
    const response = await api.get('/posts/liked', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error' };
  }
};

// Giriş yapmış kullanıcının favorilediği postları getirir
export const getFavoritePosts = async () => {
  try {
    const token = await getToken();
    const response = await api.get('/posts/favorited', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error' };
  }
};


