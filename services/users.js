import { api } from './api';

export async function getUserProfile(userId) {
  console.log('🚀 Get User Profile isteği:', { userId });
  
  const res = await api.get(`/users/${userId}`);
  
  console.log('✅ Get User Profile başarılı:', {
    userId: res.data.data?.id,
    username: res.data.data?.username
  });
  
  return res.data;
}

export async function updateUserProfile(userId, data) {
  console.log('🚀 Update User Profile isteği:', {
    userId,
    updatedFields: Object.keys(data)
  });
  
  const res = await api.put(`/users/${userId}`, data);
  
  console.log('✅ Update User Profile başarılı:', {
    userId: res.data.data?.id,
    updatedFields: Object.keys(data)
  });
  
  return res.data;
}
