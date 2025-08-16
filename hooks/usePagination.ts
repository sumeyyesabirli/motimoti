// hooks/usePagination.ts
import { useState, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, doc, QueryConstraint, OrderByDirection, DocumentData } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface UsePaginationOptions<T> {
  collectionName: string;
  orderByField: string;
  orderDirection?: OrderByDirection;
  pageSize?: number;
  additionalConstraints?: QueryConstraint[];
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
}

export function usePagination<T = DocumentData>({
  collectionName,
  orderByField,
  orderDirection = 'desc',
  pageSize = 10, // 20'den 10'a düşürdüm
  additionalConstraints = []
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageData, setPageData] = useState<Map<number, T[]>>(new Map());

  // İlk veriyi yükle (sadece ilk sayfa)
  const loadInitialData = useCallback(async () => {
    try {
      console.log('🚀 loadInitialData başladı');
      setLoading(true);
      
      const constraints = [
        orderBy(orderByField, orderDirection),
        limit(pageSize),
        ...additionalConstraints
      ];
      
      console.log('📊 Query constraints:', constraints);
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      console.log('📱 Snapshot alındı:', snapshot.docs.length, 'doküman');
      
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      
      // Detaylı veri logları
      console.log('📋 Sayfa 0 - Yüklenen Veriler:');
      newData.forEach((item, index) => {
        console.log(`  ${index + 1}. ID: ${item.id}, Text: ${(item as any).text?.substring(0, 50)}...`);
      });
      
      // Sadece ilk sayfa verilerini göster
      setData(newData);
      setPageData(new Map([[0, newData]]));
      
      // lastDoc'u doğru şekilde set et
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        console.log('📄 lastDoc set edildi:', snapshot.docs[snapshot.docs.length - 1].id);
      } else {
        setLastDoc(null);
        console.log('📄 lastDoc null olarak set edildi (veri yok)');
      }
      
      setHasMore(snapshot.docs.length === pageSize);
      setCurrentPage(0);
      
      // Toplam sayfa sayısını hesapla (yaklaşık)
      if (snapshot.docs.length === pageSize) {
        setTotalPages(Math.ceil(snapshot.docs.length / pageSize) + 1);
      } else {
        setTotalPages(1);
      }
      
      console.log('✅ loadInitialData tamamlandı:', {
        dataLength: newData.length,
        hasMore: snapshot.docs.length === pageSize,
        currentPage: 0,
        totalPages: snapshot.docs.length === pageSize ? Math.ceil(snapshot.docs.length / pageSize) + 1 : 1,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]?.id
      });
    } catch (error) {
      console.error(`❌ Error loading initial ${collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize, additionalConstraints]);

  // Sonraki sayfayı yükle
  const loadMoreData = useCallback(async () => {
    if (!lastDoc || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      const constraints = [
        orderBy(orderByField, orderDirection),
        startAfter(lastDoc),
        limit(pageSize),
        ...additionalConstraints
      ];
      
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      
      if (newData.length > 0) {
        const nextPage = currentPage + 1;
        
        // Yeni sayfa verilerini pageData'ya ekle
        setPageData(prev => new Map(prev).set(nextPage, newData));
        
        // Mevcut verilere ekle
        setData(prev => [...prev, ...newData]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setCurrentPage(nextPage);
        setHasMore(snapshot.docs.length === pageSize);
        
        // Toplam sayfa sayısını güncelle
        setTotalPages(prev => Math.max(prev, nextPage + 1));
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error loading more ${collectionName}:`, error);
    } finally {
      setLoadingMore(false);
    }
  }, [collectionName, orderByField, orderDirection, pageSize, additionalConstraints, lastDoc, loadingMore, currentPage]);

  // Belirli bir sayfaya git
  const goToPage = useCallback(async (pageNumber: number) => {
    console.log('🎯 goToPage çağrıldı:', pageNumber);
    
    if (pageNumber < 0 || pageNumber >= totalPages) {
      console.log('❌ Geçersiz sayfa numarası:', pageNumber, 'totalPages:', totalPages);
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
      
      console.log('📥 Sayfa yüklenmemiş, Firestore\'dan çekiliyor:', pageNumber);
      
      let currentData: T[] = [];
      let currentLastDoc: DocumentData | null = null;
      
      // İlk sayfa için özel durum
      if (pageNumber === 0) {
        console.log('🔄 İlk sayfa yükleniyor (0)');
        const constraints = [
          orderBy(orderByField, orderDirection),
          limit(pageSize),
          ...additionalConstraints
        ];
        
        console.log('📊 Sayfa 0 için query constraints:', constraints);
        
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        
        console.log('📱 Sayfa 0 snapshot alındı:', snapshot.docs.length, 'doküman');
        
        const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        currentData = newData;
        currentLastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        // Detaylı veri logları
        console.log('📋 Sayfa 0 - Yüklenen Veriler:');
        newData.forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, Text: ${(item as any).text?.substring(0, 50)}...`);
        });
        
        // Sayfa verilerini kaydet
        setPageData(prev => new Map(prev).set(0, newData));
        console.log('💾 Sayfa 0 cache\'e kaydedildi');
      } else {
        // Diğer sayfalar için cursor-based pagination
        console.log('🔄 Sayfa', pageNumber, 'için cursor-based pagination');
        
        // Sayfa 0'ın lastDoc'unu al
        const page0Data = pageData.get(0);
        if (!page0Data || page0Data.length === 0) {
          console.log('❌ Sayfa 0 verisi bulunamadı, önce sayfa 0 yüklenmeli');
          setLoading(false);
          return;
        }
        
        // Sayfa 0'ın son dokümanının ID'sini al
        const lastDocId = page0Data[page0Data.length - 1].id;
        console.log('🎯 Sayfa', pageNumber, 'için sayfa 0\'ın son dokümanı kullanılıyor:', lastDocId);
        
        // Bu ID'den sonraki dokümanları al - startAfter kullanarak
        const constraints = [
          orderBy(orderByField, orderDirection),
          limit(pageSize * (pageNumber + 1)), // Daha fazla veri al
          ...additionalConstraints
        ];
        
        console.log('📊 Sayfa', pageNumber, 'için query constraints:', constraints);
        
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getDocs(q);
        
        console.log('📱 Sayfa', pageNumber, 'snapshot alındı:', snapshot.docs.length, 'doküman');
        
        // Sayfa 0'dan sonraki dokümanları al
        const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
        
        // Sayfa 0'ın son dokümanından sonraki dokümanları bul
        const page0LastIndex = allData.findIndex(item => item.id === lastDocId);
        console.log('🔍 Sayfa 0\'ın son dokümanı bulundu, index:', page0LastIndex);
        
        if (page0LastIndex !== -1) {
          // Sayfa 0'dan sonraki dokümanları al
          const startIndex = page0LastIndex + 1;
          const endIndex = startIndex + pageSize;
          const afterPage0Data = allData.slice(startIndex, endIndex);
          
          console.log('🔍 Sayfa 0\'dan sonraki dokümanlar bulundu:', afterPage0Data.length);
          console.log('🔍 Başlangıç index:', startIndex, 'Bitiş index:', endIndex);
          
          currentData = afterPage0Data;
          if (afterPage0Data.length > 0) {
            currentLastDoc = afterPage0Data[afterPage0Data.length - 1];
          }
          
          // Detaylı veri logları
          console.log(`📋 Sayfa ${pageNumber} - Yüklenen Veriler:`);
          afterPage0Data.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id}, Text: ${(item as any).text?.substring(0, 50)}...`);
          });
          
          // Sayfa verilerini kaydet
          setPageData(prev => new Map(prev).set(pageNumber, afterPage0Data));
          console.log('💾 Sayfa', pageNumber, 'cache\'e kaydedildi');
        } else {
          console.log('❌ Sayfa 0\'ın son dokümanı bulunamadı');
          currentData = [];
          currentLastDoc = null;
        }
      }
      
      console.log('✅ goToPage tamamlandı:', {
        targetPage: pageNumber,
        dataLength: currentData.length,
        currentPage: pageNumber,
        lastDoc: currentLastDoc?.id
      });
      
      // Sayfa özeti
      console.log('📊 SAYFA ÖZETİ:');
      console.log(`  🎯 Gidilen Sayfa: ${pageNumber + 1}`);
      console.log(`  📄 Toplam Veri: ${currentData.length} gönderi`);
      console.log(`  🔗 İlk Veri ID: ${currentData[0]?.id}`);
      console.log(`  🔗 Son Veri ID: ${currentData[currentData.length - 1]?.id}`);
      console.log(`  📍 Cursor (lastDoc): ${currentLastDoc?.id}`);
      console.log('  ──────────────────────────────────────');
      
      setData(currentData);
      setLastDoc(currentLastDoc);
      setCurrentPage(pageNumber);
      setHasMore(currentLastDoc !== null);
      
    } catch (error) {
      console.error(`❌ Error going to page ${pageNumber}:`, error);
    } finally {
      setLoading(false);
    }
  }, [pageData, totalPages, collectionName, orderByField, orderDirection, pageSize, additionalConstraints]);

  // Verileri yenile
  const refreshData = useCallback(async () => {
    setPageData(new Map());
    setCurrentPage(0);
    setTotalPages(0);
    setLastDoc(null);
    setHasMore(true);
    await loadInitialData();
  }, [loadInitialData]);

  // Pagination'ı sıfırla
  const resetPagination = useCallback(() => {
    setData([]);
    setLoading(false);
    setLoadingMore(false);
    setHasMore(true);
    setLastDoc(null);
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
    goToPage
  };
}
