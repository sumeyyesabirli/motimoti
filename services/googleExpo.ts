import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID = 'WEB_CLIENT_IDIN.apps.googleusercontent.com';

export async function signInWithGoogleExpoGo() {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
    scheme: 'motimoti',
  });

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth' +
    `?client_id=${encodeURIComponent(WEB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token id_token` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&prompt=select_account`;

  const res = (await AuthSession.startAsync({ authUrl, returnUrl: redirectUri })) as any;
  if (res.type !== 'success') return;

  const idToken = res.params?.id_token;
  if (!idToken) throw new Error('No id_token');

  const cred = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getAuth(), cred);
}


