// API konfigürasyonu - Eski dosya, apiConfig.js kullanın
// Bu dosya geriye uyumluluk için korunuyor

export { 
  API_BASE_URL, 
  API_ENDPOINTS, 
  API_CONFIG as API_TIMEOUT 
} from './apiConfig';

// Deprecated: Bu dosya yerine constants/apiConfig.js kullanın
console.warn('⚠️ constants/api.js deprecated. constants/apiConfig.js kullanın.');