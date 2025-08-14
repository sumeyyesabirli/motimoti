import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { NativeModules, Platform } from 'react-native';
import { auth } from '../firebaseConfig';

let isGoogleConfigured = false;

export function configureGoogleSignIn() {
  if (isGoogleConfigured) return;
  GoogleSignin.configure({
    webClientId: '309702702738-4u1phg54mfbkv6mfd0i5fvc96s30lom3.apps.googleusercontent.com',
    iosClientId: '309702702738-cessb1jorh50kq6mv4oihbnv8cuf48ui.apps.googleusercontent.com',
  });
  isGoogleConfigured = true;
}

export async function signInWithGoogle() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('Google ile giriş sadece mobilde desteklenir.');
  }

  const hasGoogleNative = Boolean((NativeModules as any)?.RNGoogleSignin);
  if (!hasGoogleNative) {
    throw new Error('Google ile giriş için Expo Dev Client veya EAS build gereklidir.');
  }

  configureGoogleSignIn();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const { idToken } = await GoogleSignin.signIn();
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, credential);
}


