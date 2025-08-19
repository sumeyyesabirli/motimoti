import 'dotenv/config';

export default {
  expo: {
    name: "Motimoti",
    slug: "motimoti",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.motimoti.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.motimoti.app"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Firebase configuration from environment variables
      firebaseApiKeyIos: process.env.FIREBASE_API_KEY_IOS,
      firebaseApiKeyAndroid: process.env.FIREBASE_API_KEY_ANDROID,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppIdIos: process.env.FIREBASE_APP_ID_IOS,
      firebaseAppIdAndroid: process.env.FIREBASE_APP_ID_ANDROID,
    },
    plugins: [
      // Firebase plugins can be added here if needed
    ]
  }
};
