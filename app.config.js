import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "Coti",
  slug: "coti", // ✅ Corregido a minúsculas
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    }
  },
  web: {
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-font"
  ],
  extra: {
    ...config.extra, // Esto asegura que las variables de entorno se carguen correctamente
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
  },
});