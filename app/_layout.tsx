import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SplashScreen, useRouter, useSegments, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
import { useNotifications } from '@/src/hooks/useNotifications';

// Evita que la pantalla de bienvenida se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useNotifications(); // Inicializa las notificaciones push

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
    if (!authLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [authLoading, fontsLoaded, fontError]);

  useEffect(() => {
    if (authLoading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const userRole = session?.user?.user_metadata?.user_type;

    if (session && userRole) {
      // ✅ CORRECCIÓN: Usamos un if/else explícito para que TypeScript pueda
      // verificar cada ruta como un valor literal y no dinámico.
      if (userRole === 'buyer' && segments[0] !== '(buyer)') {
        router.replace('/(buyer)/');
      } else if (userRole === 'seller' && segments[0] !== '(seller)') {
        router.replace('/(seller)/');
      }
    } else if (!inAuthGroup) {
      router.replace('/(auth)/');
    }
  }, [session, authLoading, fontsLoaded, segments, router]);

  if (authLoading || !fontsLoaded) {
    return null;
  }
  
  return <Stack screenOptions={{ headerShown: false }} />;
}