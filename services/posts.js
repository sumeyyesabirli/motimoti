import { api } from './api';

export async function createPost(data) {
  console.log('🚀 Create Post isteği:', {
    ...data,
    text: data.text?.substring(0, 50) + '...'
  });
  
  const res = await api.post('/posts', data);
  
  console.log('✅ Create Post başarılı:', {
    postId: res.data.data?.id
  });
  
  return res.data;
}

export async function getPosts() {
  console.log('🚀 Get Posts isteği');
  
  const res = await api.get('/posts');
  
  console.log('✅ Get Posts başarılı:', {
    postCount: res.data.data?.length || 0
  });
  
  return res.data;
}

export async function getUserPosts(userId) {
  console.log('🚀 Get User Posts isteği:', { userId });
  
  const res = await api.get(`/posts/user/${userId}`);
  
  console.log('✅ Get User Posts başarılı:', {
    userId,
    postCount: res.data.data?.length || 0
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
  
  return res.data;
}

export async function unlikePost(postId) {
  // Unlike API çağrısı
  
  const res = await api.delete(`/posts/${postId}/like`);
  
  console.log(`✅ Unlike API: Count=${res.data.data?.likeCount}`);
  
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
  
  return res.data;
}

export async function unfavoritePost(postId) {
  // Unfavorite API çağrısı
  
  const res = await api.delete(`/posts/${postId}/favorite`);
  
  console.log(`✅ Unfavorite API: Count=${res.data.data?.favoriteCount}`);
  
  return res.data;
}
