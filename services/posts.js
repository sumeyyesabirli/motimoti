import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiConfig';
import { optimizedPostsService } from './optimizedPostsService';
import Logger from '../utils/logger';

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

// ============================================
// YENİ: BEĞENİ VE FAVORİ LİSTELERİ
// ============================================

// Kendi beğendiklerim (authentication gerekli)
export async function getLikedPosts(params = { page: 1, limit: 10 }) {
  const startTime = Date.now();
  
  Logger.api('Beğenilen Postları Getir', {
    method: 'GET',
    url: API_ENDPOINTS.GET_LIKED_POSTS,
    params
  });
  
  const res = await api.get(API_ENDPOINTS.GET_LIKED_POSTS, { params });
  const duration = Date.now() - startTime;
  
  // Debug: API response'u detaylı kontrol et
  if (res.data.data && res.data.data.length > 0) {
    const firstPost = res.data.data[0];
    console.log('🔍 LIKED POSTS API DEBUG:', {
      firstPostId: firstPost.id?.substring(0, 8) + '...',
      likeCount: firstPost.likeCount,
      favoriteCount: firstPost.favoriteCount,
      likedBy: firstPost.likedBy,
      favoritedBy: firstPost.favoritedBy,
      likedByType: typeof firstPost.likedBy,
      favoritedByType: typeof firstPost.favoritedBy,
      likedByLength: firstPost.likedBy?.length,
      favoritedByLength: firstPost.favoritedBy?.length
    });
  }
  
  Logger.success('Beğenilen Postlar Yüklendi', {
    duration,
    count: res.data.data?.length || 0,
    pagination: res.data.pagination
  });
  
  return res.data;
}

// Kendi favorilerim (authentication gerekli)  
export async function getFavoritePosts(params = { page: 1, limit: 10 }) {
  console.log('🚀 Favorilerim API isteği:', params);
  
  const res = await api.get(API_ENDPOINTS.GET_FAVORITE_POSTS, { params });
  
  // Debug: API response'u detaylı kontrol et
  if (res.data.data && res.data.data.length > 0) {
    const firstPost = res.data.data[0];
    console.log('🔍 FAVORITE POSTS API DEBUG:', {
      firstPostId: firstPost.id?.substring(0, 8) + '...',
      likeCount: firstPost.likeCount,
      favoriteCount: firstPost.favoriteCount,
      likedBy: firstPost.likedBy,
      favoritedBy: firstPost.favoritedBy,
      likedByType: typeof firstPost.likedBy,
      favoritedByType: typeof firstPost.favoritedBy,
      likedByLength: firstPost.likedBy?.length,
      favoritedByLength: firstPost.favoritedBy?.length
    });
  }
  
  console.log(`✅ Favorilerim yüklendi: ${res.data.data?.length || 0} post`, {
    pagination: res.data.pagination
  });
  
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
 * Kendi beğenilerin (cache'li)
 * @returns {Promise<Object>} Beğenilen gönderiler
 */
export async function getLikedPostsCached() {
  return await optimizedPostsService.getLikedPostsCached();
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


