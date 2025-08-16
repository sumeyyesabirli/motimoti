import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Firebase configuration
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
} as const;

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);

// Firebase Auth instance - persistence otomatik olarak yapılandırılıyor
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;


