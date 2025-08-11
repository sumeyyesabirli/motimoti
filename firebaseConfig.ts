import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Not: Web config değerleriniz Firebase konsolundan kopyalanmalıdır.
// Şimdilik native dosyalarınızdaki bilgiler kullanılarak platforma göre ayar yapılıyor.

const firebaseConfig = {
  apiKey: Platform.select({
    ios: 'AIzaSyBFH53RnXFpXJxg52knueY1ht9avTyAsnI',
    android: 'AIzaSyBW3NOoFSYxXP2jixrXsrteoK-W7xuFQC8',
  }),
  authDomain: 'motimoti-bc114.firebaseapp.com',
  projectId: 'motimoti-bc114',
  storageBucket: 'motimoti-bc114.firebasestorage.app',
  messagingSenderId: '309702702738',
  appId: Platform.select({
    ios: '1:309702702738:ios:1e7d95c12ac6a4c7a2584b',
    android: '1:309702702738:android:790d097ef87eff60a2584b',
  }),
  // measurementId: 'G-XXXXXXX', // (isteğe bağlı, Analytics kullanıyorsanız web configten ekleyin)
} as const;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);

// React Native'de oturum kalıcılığı için AsyncStorage kullan
let authInstance;
if (Platform.OS === 'web') {
  authInstance = getAuth(app);
} else {
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage as any),
    });
  } catch (e) {
    authInstance = getAuth(app);
  }
}

export const auth = authInstance;
export const db = getFirestore(app);
export default app;


