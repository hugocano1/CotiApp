// Ruta: app.config.js

import 'dotenv/config';

export default {
  // --- Propiedades fusionadas de app.json ---
  name: "CotiApp",
  slug: "coti",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "cotiapp", // ➕ FUSIONADO de app.json
  userInterfaceStyle: "automatic", // ➕ FUSIONADO de app.json (mejor que 'light')
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
    },
    // ✅ CORRECCIÓN FINAL Y DEFINITIVA DEL PAQUETE
    package: "com.hugocano.cotiap", 
    // ➕ FUSIONADO de app.json
    googleServicesFile: "./google-services.json" 
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    "expo-font", // Faltaba en app.json, lo mantenemos
    // ➕ FUSIONADO de app.json
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification-icon.png",
        "color": "#ffffff"
      }
    ]
  ],
  experiments: {
    typedRoutes: true // ➕ FUSIONADO de app.json
  },
  extra: {
    // ➕ FUSIONADO de app.json para mantener el projectId
    eas: {
      "projectId": "21d6b8b6-f34f-4d42-bc79-c809619d4d97"
    },
    // Mantenemos la carga segura desde .env
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
  },
};