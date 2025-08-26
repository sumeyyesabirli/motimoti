/**
 * 📊 Improved Logger Utility
 * Daha okunabilir console çıktıları için geliştirilmiş logger
 */

// ANSI renk kodları (React Native'de çalışmaz ama web debugger'da güzel görünür)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Log seviyeleri
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Mevcut log seviyesi (development'ta 4, production'da 1)
const CURRENT_LOG_LEVEL = __DEV__ ? LOG_LEVELS.TRACE : LOG_LEVELS.WARN;

class Logger {
  
  /**
   * Zaman damgası formatla
   */
  static getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:MM:SS formatı
  }

  /**
   * Kısa ID formatla
   */
  static formatId(id) {
    if (!id) return 'N/A';
    if (typeof id === 'string' && id.length > 8) {
      return id.substring(0, 8) + '...';
    }
    return id;
  }

  /**
   * API işlemleri için formatlanmış log
   */
  static api(operation, data = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.INFO) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n🌐 [${timestamp}] API İşlemi: ${operation}`);
    
    if (data.url) {
      console.log(`   📍 URL: ${data.url}`);
    }
    
    if (data.method) {
      console.log(`   🔧 Method: ${data.method}`);
    }
    
    if (data.userId) {
      console.log(`   👤 User ID: ${this.formatId(data.userId)}`);
    }
    
    if (data.duration) {
      console.log(`   ⏱️  Süre: ${data.duration}ms`);
    }
    
    if (data.cached !== undefined) {
      console.log(`   💾 Cache: ${data.cached ? '✅ HIT' : '❌ MISS'}`);
    }
    
    if (data.count !== undefined) {
      console.log(`   📊 Veri Sayısı: ${data.count}`);
    }
  }

  /**
   * Cache işlemleri için formatlanmış log
   */
  static cache(operation, data = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n💾 [${timestamp}] Cache İşlemi: ${operation}`);
    
    if (data.key) {
      console.log(`   🔑 Key: ${data.key}`);
    }
    
    if (data.hit !== undefined) {
      console.log(`   🎯 Sonuç: ${data.hit ? '✅ Cache Hit' : '❌ Cache Miss'}`);
    }
    
    if (data.size) {
      console.log(`   📏 Boyut: ${data.size} bytes`);
    }
    
    if (data.ttl) {
      console.log(`   ⏰ TTL: ${data.ttl}s`);
    }
  }

  /**
   * Post işlemleri için formatlanmış log
   */
  static post(operation, postData = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.INFO) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n📝 [${timestamp}] Post İşlemi: ${operation}`);
    
    if (postData.id) {
      console.log(`   🆔 Post ID: ${this.formatId(postData.id)}`);
    }
    
    if (postData.authorId) {
      console.log(`   👤 Author ID: ${this.formatId(postData.authorId)}`);
    }
    
    if (postData.text) {
      const preview = postData.text.length > 50 
        ? postData.text.substring(0, 47) + '...' 
        : postData.text;
      console.log(`   📄 İçerik: "${preview}"`);
    }
    
    if (postData.likeCount !== undefined) {
      console.log(`   ❤️  Beğeni: ${postData.likeCount}`);
    }
    
    if (postData.favoriteCount !== undefined) {
      console.log(`   ⭐ Favori: ${postData.favoriteCount}`);
    }
    
    if (postData.isAnonymous !== undefined) {
      console.log(`   🎭 Anonim: ${postData.isAnonymous ? 'Evet' : 'Hayır'}`);
    }
  }

  /**
   * Kullanıcı işlemleri için formatlanmış log
   */
  static user(operation, userData = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.INFO) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n👤 [${timestamp}] Kullanıcı İşlemi: ${operation}`);
    
    if (userData.id) {
      console.log(`   🆔 User ID: ${this.formatId(userData.id)}`);
    }
    
    if (userData.username) {
      console.log(`   📛 Kullanıcı Adı: ${userData.username}`);
    }
    
    if (userData.email) {
      console.log(`   📧 E-posta: ${userData.email}`);
    }
    
    if (userData.stats) {
      console.log(`   📊 İstatistikler:`);
      if (userData.stats.postCount !== undefined) {
        console.log(`      📝 Gönderi: ${userData.stats.postCount}`);
      }
      if (userData.stats.likeCount !== undefined) {
        console.log(`      ❤️  Beğeni: ${userData.stats.likeCount}`);
      }
      if (userData.stats.favoriteCount !== undefined) {
        console.log(`      ⭐ Favori: ${userData.stats.favoriteCount}`);
      }
    }
  }

  /**
   * Navigation için formatlanmış log
   */
  static navigation(operation, data = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n🧭 [${timestamp}] Navigation: ${operation}`);
    
    if (data.from) {
      console.log(`   📍 From: ${data.from}`);
    }
    
    if (data.to) {
      console.log(`   📍 To: ${data.to}`);
    }
    
    if (data.params) {
      console.log(`   📋 Params: ${JSON.stringify(data.params)}`);
    }
  }

  /**
   * Hata logları için formatlanmış log
   */
  static error(operation, error, context = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.ERROR) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n❌ [${timestamp}] HATA: ${operation}`);
    
    if (error.message) {
      console.log(`   💬 Mesaj: ${error.message}`);
    }
    
    if (error.code || error.status) {
      console.log(`   🔢 Kod: ${error.code || error.status}`);
    }
    
    if (context.url) {
      console.log(`   📍 URL: ${context.url}`);
    }
    
    if (context.userId) {
      console.log(`   👤 User ID: ${this.formatId(context.userId)}`);
    }
    
    if (__DEV__ && error.stack) {
      console.log(`   📚 Stack Trace:`);
      console.log(error.stack);
    }
  }

  /**
   * Başarı mesajları için formatlanmış log
   */
  static success(operation, data = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.INFO) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n✅ [${timestamp}] BAŞARILI: ${operation}`);
    
    if (data.message) {
      console.log(`   💬 Mesaj: ${data.message}`);
    }
    
    if (data.duration) {
      console.log(`   ⏱️  Süre: ${data.duration}ms`);
    }
    
    if (data.count !== undefined) {
      console.log(`   📊 Sonuç: ${data.count} öğe`);
    }
  }

  /**
   * Performans metrikleri için formatlanmış log
   */
  static performance(operation, metrics = {}) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n⚡ [${timestamp}] Performans: ${operation}`);
    
    if (metrics.duration) {
      console.log(`   ⏱️  Toplam Süre: ${metrics.duration}ms`);
    }
    
    if (metrics.cacheHits !== undefined && metrics.cacheMisses !== undefined) {
      const total = metrics.cacheHits + metrics.cacheMisses;
      const hitRate = total > 0 ? ((metrics.cacheHits / total) * 100).toFixed(1) : 0;
      console.log(`   💾 Cache Hit Rate: ${hitRate}% (${metrics.cacheHits}/${total})`);
    }
    
    if (metrics.apiCalls) {
      console.log(`   🌐 API Çağrıları: ${metrics.apiCalls}`);
    }
    
    if (metrics.dataSize) {
      console.log(`   📏 Veri Boyutu: ${(metrics.dataSize / 1024).toFixed(1)} KB`);
    }
  }

  /**
   * Basit info log
   */
  static info(message, data = null) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.INFO) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\nℹ️  [${timestamp}] ${message}`);
    
    if (data) {
      console.log('   📋 Veri:', data);
    }
  }

  /**
   * Debug log
   */
  static debug(message, data = null) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n🔍 [${timestamp}] ${message}`);
    
    if (data) {
      console.log('   📋 Debug Veri:', data);
    }
  }

  /**
   * Uyarı log
   */
  static warn(message, data = null) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.WARN) return;
    
    const timestamp = this.getTimestamp();
    console.log(`\n⚠️  [${timestamp}] UYARI: ${message}`);
    
    if (data) {
      console.log('   📋 Uyarı Veri:', data);
    }
  }

  /**
   * Grup başlangıcı (katlanabilir)
   */
  static group(title) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const timestamp = this.getTimestamp();
    console.group(`📁 [${timestamp}] ${title}`);
  }

  /**
   * Grup bitişi
   */
  static groupEnd() {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    console.groupEnd();
  }

  /**
   * Tablo formatında veri göster
   */
  static table(data, title = null) {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    if (title) {
      const timestamp = this.getTimestamp();
      console.log(`\n📊 [${timestamp}] ${title}`);
    }
    
    console.table(data);
  }

  /**
   * Ayraç çizgisi
   */
  static separator(title = '') {
    if (CURRENT_LOG_LEVEL < LOG_LEVELS.DEBUG) return;
    
    const line = '─'.repeat(50);
    if (title) {
      console.log(`\n${line} ${title} ${line}`);
    } else {
      console.log(`\n${line}`);
    }
  }
}

export default Logger;
