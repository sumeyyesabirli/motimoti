import 'dotenv/config';

export default {
  expo: {
    name: "Motimoti",
    slug: "motimoti",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "motimoti",
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
    plugins: [
      // Firebase plugins can be added here if needed
    ]
  }
};
