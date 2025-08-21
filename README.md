# MotiMoti - React Native Uygulaması

## 🚀 Firebase'den API'ye Geçiş Tamamlandı!

Bu uygulama artık Firebase yerine custom API kullanıyor.

## 🔧 **Test Kullanımı (Mock API)**

### **Test Kullanıcıları:**

1. **TestUser**
   - Email: `test@example.com`
   - Şifre: `herhangi bir şey` (boş olmamalı)
   - Username: `TestUser`

2. **DemoUser**
   - Email: `demo@example.com`
   - Şifre: `herhangi bir şey` (boş olmamalı)
   - Username: `DemoUser`

### **Test Gönderileri:**
- 2 adet örnek gönderi mevcut
- Beğeni ve favori sistemi çalışıyor
- Pagination test edilebilir

## 📱 **Özellikler:**

- ✅ JWT Authentication
- ✅ Mock API (test için)
- ✅ Real API desteği
- ✅ Post CRUD işlemleri
- ✅ Beğeni/Favori sistemi
- ✅ Pagination
- ✅ Profil yönetimi
- ✅ Anonim paylaşım

## 🔄 **API Konfigürasyonu:**

`constants/api.js` dosyasında API URL'ini değiştirin:

```javascript
// Gerçek API için:
export const API_BASE_URL = 'https://your-api-domain.com/api';

// Mock API için (test):
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Local development için:
export const API_BASE_URL = 'http://localhost:3000/api';
```

## 📅 **BirthDate Format Güncellemesi:**

**Önceki Format:** `DD.MM.YYYY` (örn: "30.10.1996")
**Yeni Format:** `YYYY-MM-DD` (örn: "1996-10-30")

Bu değişiklik PostgreSQL DATE formatı ile uyumlu ve daha standart.

### **Format Dönüşümü:**
- **Display:** Kullanıcı arayüzünde `DD.MM.YYYY` formatı
- **API:** Veritabanında `YYYY-MM-DD` formatı
- **Otomatik:** Format dönüşümü otomatik olarak yapılıyor

## 🧪 **Test Etme:**

1. Uygulamayı başlatın
2. Register sayfasından yeni kullanıcı oluşturun
3. Login yapın
4. Community feed'i test edin
5. Post oluşturun
6. Beğeni/favori ekleyin
7. Profil sayfasını test edin

## 🚨 **Önemli Notlar:**

- Mock API sadece development modunda çalışır
- Gerçek API'ye geçmek için `constants/api.js` dosyasını güncelleyin
- CORS ayarlarını API sunucunuzda yapın
- JWT token yönetimi otomatik olarak çalışır
- BirthDate formatı otomatik olarak dönüştürülür

## 🛠 **Teknik Detaylar:**

- **Frontend:** React Native + Expo
- **State Management:** React Context
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Authentication:** JWT Tokens
- **Pagination:** Custom Hook
- **Date Format:** YYYY-MM-DD (PostgreSQL uyumlu)

## 📞 **Destek:**

Herhangi bir sorun yaşarsanız lütfen bildirin!
