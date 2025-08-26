import { api } from './api';
import { API_ENDPOINTS } from '../constants/apiConfig';
import { cacheService, CACHE_KEYS } from './cacheService';
import Logger from '../utils/logger';

/**
 * 🚀 Optimized Posts Service - Performans Odaklı API İstekleri
 * 
 * Özellikler:
 * - X-Last-Count header ile cache kontrolü
 * - 304 Not Modified desteği
 * - AsyncStorage ile yerel cache
 * - %70-80 daha az DB sorgusu
 * - Otomatik cache yönetimi
 */

export const optimizedPostsService = {

  /**
   * 🎯 Kullanıcı gönderi istatistiklerini al (sadece sayılar)
   * Hızlı COUNT sorguları ile optimized
   * 
   * @param {string} userId - Kullanıcı ID'si (GUID format)
   * @returns {Promise<Object>} İstatistik verileri
   */
  async getUserPostStats(userId) {
    const startTime = Date.now();
    
    Logger.group('Kullanıcı İstatistikleri (Optimized)');
    Logger.user('İstatistik İsteği', { id: userId });
    
    try {
      // Cache kontrolü
      const cacheKey = CACHE_KEYS.USER_STATS(userId);
      const cachedStats = await cacheService.getCache(cacheKey);
      
      if (cachedStats) {
        const duration = Date.now() - startTime;
        
        Logger.cache('Cache Hit', {
          key: cacheKey,
          hit: true
        });
        
        Logger.performance('İstatistik Yükleme', {
          duration,
          cacheHits: 1,
          cacheMisses: 0
        });
        
        Logger.groupEnd();
        
        return {
          success: true,
          data: cachedStats,
          cached: true,
          message: 'İstatistikler cache\'den yüklendi'
        };
      }

      // API isteği
      Logger.api('Kullanıcı İstatistikleri', {
        method: 'GET',
        url: API_ENDPOINTS.GET_USER_STATS(userId),
        userId
      });
      
      const response = await api.get(API_ENDPOINTS.GET_USER_STATS(userId));
      const duration = Date.now() - startTime;

      Logger.cache('Cache Miss - Veri Kaydediliyor', {
        key: cacheKey,
        hit: false
      });

      // Cache'e kaydet
      await cacheService.setCache(cacheKey, response.data.data);
      
      Logger.performance('İstatistik Yükleme', {
        duration,
        cacheHits: 0,
        cacheMisses: 1,
        apiCalls: 1
      });
      
      Logger.success('İstatistikler API\'den Yüklendi', {
        duration,
        count: Object.keys(response.data.data || {}).length
      });
      
      Logger.groupEnd();
      
      return {
        ...response.data,
        cached: false
      };
      
    } catch (error) {
      Logger.error('Kullanıcı İstatistikleri', error, { userId });
      Logger.groupEnd();
      throw error;
    }
  },

  /**
   * 📱 Kendi beğenilen gönderilerini al (cache'li)
   * X-Last-Count header ile optimizasyon
   * 
   * @returns {Promise<Object>} Beğenilen gönderiler
   */
  async getLikedPostsCached() {
    console.log('🚀 Beğendiklerim API isteği (Cache\'li)');
    
    try {
      const cacheKey = CACHE_KEYS.MY_LIKED_POSTS;
      const countKey = CACHE_KEYS.MY_LIKED_COUNT;
      
      // X-Last-Count header'ı oluştur
      const headers = await cacheService.createLastCountHeader(countKey);
      
      console.log('📊 Request Headers:', headers);
      
      // API isteği
      const response = await api.get(API_ENDPOINTS.GET_LIKED_POSTS_CACHED, { 
        headers 
      });
      
      // 304 Not Modified kontrolü
      if (response.status === 304) {
        console.log('🎯 304 Not Modified - Cache kullanılıyor');
        const cachedData = await cacheService.getCache(cacheKey);
        
        return {
          success: true,
          data: cachedData || [],
          cached: true,
          message: 'Veriler cache\'den yüklendi - DB sorgusu atlandı!'
        };
      }
      
      // Yeni veri geldi - cache'i güncelle
      console.log('✅ Beğendiklerim yüklendi:', {
        postCount: response.data.data?.length || 0
      });
      
      await cacheService.setCache(cacheKey, response.data.data);
      await cacheService.extractAndSaveCount(response.data, countKey);
      
      return {
        ...response.data,
        cached: false
      };
      
    } catch (error) {
      console.error('❌ Beğendiklerim API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * ⭐ Kendi favori gönderilerini al (cache'li)
   * X-Last-Count header ile optimizasyon
   * 
   * @returns {Promise<Object>} Favori gönderiler
   */
  async getFavoritePostsCached() {
    console.log('🚀 Favorilerim API isteği (Cache\'li)');
    
    try {
      const cacheKey = CACHE_KEYS.MY_FAVORITE_POSTS;
      const countKey = CACHE_KEYS.MY_FAVORITE_COUNT;
      
      // X-Last-Count header'ı oluştur
      const headers = await cacheService.createLastCountHeader(countKey);
      
      console.log('📊 Request Headers:', headers);
      
      // API isteği
      const response = await api.get(API_ENDPOINTS.GET_FAVORITE_POSTS_CACHED, { 
        headers 
      });
      
      // 304 Not Modified kontrolü
      if (response.status === 304) {
        console.log('🎯 304 Not Modified - Cache kullanılıyor');
        const cachedData = await cacheService.getCache(cacheKey);
        
        return {
          success: true,
          data: cachedData || [],
          cached: true,
          message: 'Veriler cache\'den yüklendi - DB sorgusu atlandı!'
        };
      }
      
      // Yeni veri geldi - cache'i güncelle
      console.log('✅ Favorilerim yüklendi:', {
        postCount: response.data.data?.length || 0
      });
      
      await cacheService.setCache(cacheKey, response.data.data);
      await cacheService.extractAndSaveCount(response.data, countKey);
      
      return {
        ...response.data,
        cached: false
      };
      
    } catch (error) {
      console.error('❌ Favorilerim API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 👤 Kullanıcının beğendiği gönderileri al (cache'li)
   * X-Last-Count header ile optimizasyon
   * 
   * @param {string} userId - Kullanıcı ID'si (GUID format)
   * @returns {Promise<Object>} Kullanıcının beğendiği gönderiler
   */
  async getUserLikedPostsCached(userId) {
    console.log('🚀 Kullanıcı Beğendikleri API isteği (Cache\'li):', userId);
    
    try {
      const cacheKey = CACHE_KEYS.USER_LIKED_POSTS(userId);
      const countKey = CACHE_KEYS.USER_LIKED_COUNT(userId);
      
      // X-Last-Count header'ı oluştur
      const headers = await cacheService.createLastCountHeader(countKey);
      
      console.log('📊 Request Headers:', headers);
      
      // API isteği
      const response = await api.get(API_ENDPOINTS.GET_USER_LIKED_POSTS_CACHED(userId), { 
        headers 
      });
      
      // 304 Not Modified kontrolü
      if (response.status === 304) {
        console.log('🎯 304 Not Modified - Cache kullanılıyor');
        const cachedData = await cacheService.getCache(cacheKey);
        
        return {
          success: true,
          data: cachedData || [],
          cached: true,
          message: 'Veriler cache\'den yüklendi - DB sorgusu atlandı!'
        };
      }
      
      // Yeni veri geldi - cache'i güncelle
      console.log('✅ Kullanıcı beğendikleri yüklendi:', {
        userId,
        postCount: response.data.data?.length || 0
      });
      
      await cacheService.setCache(cacheKey, response.data.data);
      await cacheService.extractAndSaveCount(response.data, countKey);
      
      return {
        ...response.data,
        cached: false
      };
      
    } catch (error) {
      console.error('❌ Kullanıcı beğendikleri API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 👤 Kullanıcının favori gönderileri al (cache'li)
   * X-Last-Count header ile optimizasyon
   * 
   * @param {string} userId - Kullanıcı ID'si (GUID format)
   * @returns {Promise<Object>} Kullanıcının favori gönderileri
   */
  async getUserFavoritePostsCached(userId) {
    console.log('🚀 Kullanıcı Favorileri API isteği (Cache\'li):', userId);
    
    try {
      const cacheKey = CACHE_KEYS.USER_FAVORITE_POSTS(userId);
      const countKey = CACHE_KEYS.USER_FAVORITE_COUNT(userId);
      
      // X-Last-Count header'ı oluştur
      const headers = await cacheService.createLastCountHeader(countKey);
      
      console.log('📊 Request Headers:', headers);
      
      // API isteği
      const response = await api.get(API_ENDPOINTS.GET_USER_FAVORITE_POSTS_CACHED(userId), { 
        headers 
      });
      
      // 304 Not Modified kontrolü
      if (response.status === 304) {
        console.log('🎯 304 Not Modified - Cache kullanılıyor');
        const cachedData = await cacheService.getCache(cacheKey);
        
        return {
          success: true,
          data: cachedData || [],
          cached: true,
          message: 'Veriler cache\'den yüklendi - DB sorgusu atlandı!'
        };
      }
      
      // Yeni veri geldi - cache'i güncelle
      console.log('✅ Kullanıcı favorileri yüklendi:', {
        userId,
        postCount: response.data.data?.length || 0
      });
      
      await cacheService.setCache(cacheKey, response.data.data);
      await cacheService.extractAndSaveCount(response.data, countKey);
      
      return {
        ...response.data,
        cached: false
      };
      
    } catch (error) {
      console.error('❌ Kullanıcı favorileri API hatası:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * 🗑️ Cache'i temizle (beğeni/favori eklendiğinde/çıkarıldığında çağır)
   * @param {string} userId - Kullanıcı ID'si (opsiyonel, sadece kullanıcıya özel cache'i temizlemek için)
   */
  async invalidateCache(userId = null) {
    console.log('🗑️ Cache temizleniyor...');
    
    try {
      // Kendi cache'lerini temizle
      await cacheService.clearCache(CACHE_KEYS.MY_LIKED_POSTS);
      await cacheService.clearCache(CACHE_KEYS.MY_FAVORITE_POSTS);
      await cacheService.clearCache(CACHE_KEYS.MY_LIKED_COUNT);
      await cacheService.clearCache(CACHE_KEYS.MY_FAVORITE_COUNT);
      
      // Belirli kullanıcının cache'ini temizle
      if (userId) {
        await cacheService.clearCache(CACHE_KEYS.USER_LIKED_POSTS(userId));
        await cacheService.clearCache(CACHE_KEYS.USER_FAVORITE_POSTS(userId));
        await cacheService.clearCache(CACHE_KEYS.USER_LIKED_COUNT(userId));
        await cacheService.clearCache(CACHE_KEYS.USER_FAVORITE_COUNT(userId));
        await cacheService.clearCache(CACHE_KEYS.USER_STATS(userId));
      }
      
      console.log('✅ Cache temizlendi');
    } catch (error) {
      console.error('❌ Cache temizleme hatası:', error);
    }
  },

  /**
   * 📊 Cache durumunu göster
   */
  async getCacheStatus() {
    return await cacheService.getCacheStatus();
  }
};

export default optimizedPostsService;
