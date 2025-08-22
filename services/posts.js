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
  console.log('🚀 Like Post isteği:', { postId });
  
  const res = await api.post(`/posts/${postId}/like`);
  
  console.log('✅ Like Post başarılı:', {
    postId: res.data.data?.id,
    newLikeCount: res.data.data?.likeCount
  });
  
  return res.data;
}

export async function unlikePost(postId) {
  console.log('🚀 Unlike Post isteği:', { postId });
  
  const res = await api.delete(`/posts/${postId}/like`);
  
  console.log('✅ Unlike Post başarılı:', {
    postId: res.data.data?.id,
    newLikeCount: res.data.data?.likeCount
  });
  
  return res.data;
}

export async function favoritePost(postId) {
  console.log('🚀 Favorite Post isteği:', { postId });
  
  const res = await api.post(`/posts/${postId}/favorite`);
  
  console.log('✅ Favorite Post başarılı:', {
    postId: res.data.data?.id,
    newFavoriteCount: res.data.data?.favoriteCount
  });
  
  return res.data;
}

export async function unfavoritePost(postId) {
  console.log('🚀 Unfavorite Post isteği:', { postId });
  
  const res = await api.delete(`/posts/${postId}/favorite`);
  
  console.log('✅ Unfavorite Post başarılı:', {
    postId: res.data.data?.id,
    newFavoriteCount: res.data.data?.favoriteCount
  });
  
  return res.data;
}
