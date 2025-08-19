import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Platform.select({
    ios: Constants.expoConfig?.extra?.firebaseApiKeyIos || process.env.FIREBASE_API_KEY_IOS,
    android: Constants.expoConfig?.extra?.firebaseApiKeyAndroid || process.env.FIREBASE_API_KEY_ANDROID,
  }),
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Platform.select({
    ios: Constants.expoConfig?.extra?.firebaseAppIdIos || process.env.FIREBASE_APP_ID_IOS,
    android: Constants.expoConfig?.extra?.firebaseAppIdAndroid || process.env.FIREBASE_APP_ID_ANDROID,
  }),
} as const;

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig as any);

// Firebase Auth instance - persistence otomatik olarak yapılandırılıyor
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;


