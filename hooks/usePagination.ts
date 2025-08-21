// hooks/usePagination.ts
import { useState, useCallback } from 'react';
import { postService } from '../services/postService';

interface UsePaginationOptions<T> {
  collectionName: string;
  orderByField: string;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  additionalConstraints?: any[];
}

interface UsePaginationReturn<T> {
  data: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  loadInitialData: () => Promise<void>;
  loadMoreData: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetPagination: () => void;
  goToPage: (pageNumber: number) => Promise<void>;
  setData: (data: T[]) => void;
}

export function usePagination<T = any>({
  collectionName,
  orderByField,
  orderDirection = 'desc',
  pageSize = 10,
  additionalConstraints = []
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageData, setPageData] = useState<Map<number, T[]>>(new Map());

  // İlk veriyi yükle (sadece ilk sayfa)
  const loadInitialData = useCallback(async () => {
    try {
      console.log('🚀 loadInitialData başladı');
      setLoading(true);
      
      // API'den veri çek
      let response;
      if (collectionName === 'posts') {
        response = await postService.getPosts();
      } else {
        throw new Error(`Unknown collection: ${collectionName}`);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Veri yüklenemedi');
      }
      
      let allData = response.data || [];
      
      // Sıralama yap
      allData.sort((a: any, b: any) => {
        const aValue = a[orderByField];
        const bValue = b[orderByField];
        
        if (orderDirection === 'desc') {
          return new Date(bValue).getTime() - new Date(aValue).getTime();
        } else {
          return new Date(aValue).getTime() - new Date(bValue).getTime();
        }
      });
      
      // İlk sayfa verilerini al
      const newData = allData.slice(0, pageSize);
      
      console.log('📱 Veri alındı:', newData.length, 'doküman');
      
      // Detaylı veri logları
      console.log('📋 Sayfa 0 - Yüklenen Veriler:');
      newData.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${item.id}, Text: ${(item as any).text?.substring(0, 50)}...`);
      });
      
      // Sadece ilk sayfa verilerini göster
      setData(newData);
      setPageData(new Map([[0, newData]]));
      
      setHasMore(allData.length > pageSize);
      setCurrentPage(0);
      
      // Toplam sayfa sayısını hesapla
      setTotalPages(Math.ceil(allData.length / pageSize));
      
      console.log('✅ loadInitialData tamamlandı:', {
        dataLength: newData.length,
        hasMore: allData.length > pageSize,
        currentPage: 0,
        totalPages: Math.ceil(allData.length / pageSize),
        totalData: allData.length
      });
    } catch (error) {
      console.error(`❌ Error loading initial ${collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize, additionalConstraints]);

  // Sonraki sayfayı yükle
  const loadMoreData = useCallback(async () => {
    if (loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      // API'den tüm veriyi çek (cache'den)
      let response;
      if (collectionName === 'posts') {
        response = await postService.getPosts();
      } else {
        throw new Error(`Unknown collection: ${collectionName}`);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Veri yüklenemedi');
      }
      
      let allData = response.data || [];
      
      // Sıralama yap
      allData.sort((a: any, b: any) => {
        const aValue = a[orderByField];
        const bValue = b[orderByField];
        
        if (orderDirection === 'desc') {
          return new Date(bValue).getTime() - new Date(aValue).getTime();
        } else {
          return new Date(aValue).getTime() - new Date(bValue).getTime();
        }
      });
      
      const nextPage = currentPage + 1;
      const startIndex = nextPage * pageSize;
      const endIndex = startIndex + pageSize;
      const newData = allData.slice(startIndex, endIndex);
      
      if (newData.length > 0) {
        // Yeni sayfa verilerini pageData'ya ekle
        setPageData(prev => new Map(prev).set(nextPage, newData));
        
        // Mevcut verilere ekle
        setData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < allData.length);
        
        // Toplam sayfa sayısını güncelle
        setTotalPages(Math.ceil(allData.length / pageSize));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error loading more ${collectionName}:`, error);
    } finally {
      setLoadingMore(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize, additionalConstraints, currentPage, loadingMore]);

  // Belirli bir sayfaya git
  const goToPage = useCallback(async (pageNumber: number) => {
    console.log('🎯 goToPage çağrıldı:', pageNumber);
    
    if (pageNumber < 0) {
      console.log('❌ Geçersiz sayfa numarası:', pageNumber);
      return;
    }
    
    try {
      console.log('🔄 Sayfa yükleniyor:', pageNumber);
      setLoading(true);
      
      // Eğer sayfa zaten yüklendiyse, direkt göster
      if (pageData.has(pageNumber)) {
        console.log('✅ Sayfa zaten yüklenmiş, cache\'den gösteriliyor:', pageNumber);
        setData(pageData.get(pageNumber)!);
        setCurrentPage(pageNumber);
        setLoading(false);
        return;
      }
      
      console.log('📥 Sayfa yüklenmemiş, API\'den çekiliyor:', pageNumber);
      
      // API'den veri çek
      let response;
      if (collectionName === 'posts') {
        response = await postService.getPosts();
      } else {
        throw new Error(`Unknown collection: ${collectionName}`);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Veri yüklenemedi');
      }
      
      let allData = response.data || [];
      
      // Sıralama yap
      allData.sort((a: any, b: any) => {
        const aValue = a[orderByField];
        const bValue = b[orderByField];
        
        if (orderDirection === 'desc') {
          return new Date(bValue).getTime() - new Date(aValue).getTime();
        } else {
          return new Date(aValue).getTime() - new Date(bValue).getTime();
        }
      });
      
      const startIndex = pageNumber * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageData = allData.slice(startIndex, endIndex);
      
      console.log('📱 Sayfa', pageNumber, 'veri alındı:', currentPageData.length, 'doküman');
      
      // Detaylı veri logları
      console.log(`📋 Sayfa ${pageNumber} - Yüklenen Veriler:`);
      currentPageData.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ID: ${item.id}, Text: ${(item as any).text?.substring(0, 50)}...`);
      });
      
      // Sayfa verilerini kaydet
      setPageData(prev => new Map(prev).set(pageNumber, currentPageData));
      console.log('💾 Sayfa', pageNumber, 'cache\'e kaydedildi');
      
      console.log('✅ goToPage tamamlandı:', {
        targetPage: pageNumber,
        dataLength: currentPageData.length,
        currentPage: pageNumber
      });
      
      // Sayfa özeti
      console.log('📊 SAYFA ÖZETİ:');
      console.log(`  🎯 Gidilen Sayfa: ${pageNumber + 1}`);
      console.log(`  📄 Toplam Veri: ${currentPageData.length} gönderi`);
      console.log(`  🔗 İlk Veri ID: ${currentPageData[0]?.id}`);
      console.log(`  🔗 Son Veri ID: ${currentPageData[currentPageData.length - 1]?.id}`);
      console.log('  ──────────────────────────────────────');
      
      setData(currentPageData);
      setCurrentPage(pageNumber);
      setHasMore(endIndex < allData.length);
      setTotalPages(Math.ceil(allData.length / pageSize));
      
    } catch (error) {
      console.error(`❌ Error going to page ${pageNumber}:`, error);
    } finally {
      setLoading(false);
    }
  }, [pageData, collectionName, orderByField, orderDirection, pageSize, additionalConstraints]);

  // Verileri yenile
  const refreshData = useCallback(async () => {
    setPageData(new Map());
    setCurrentPage(0);
    setTotalPages(0);
    setHasMore(true);
    await loadInitialData();
  }, [loadInitialData]);

  // Pagination'ı sıfırla
  const resetPagination = useCallback(() => {
    setData([]);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(true);
    setCurrentPage(0);
    setTotalPages(0);
    setPageData(new Map());
  }, []);

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    currentPage,
    totalPages,
    loadInitialData,
    loadMoreData,
    refreshData,
    resetPagination,
    goToPage,
    setData
  };
}
